import { computed, inject, Injectable, signal, WritableSignal } from '@angular/core';
import { catchError, finalize, of, tap } from 'rxjs';
import { Server } from '../models/server.model';
import { ServerApiService } from '../data-access/server-api';

interface ServerDataState {
  isLoading: boolean;
  error: string | null;
  rebootingServerIds: Set<string>;
}

const initialState: ServerDataState = {
  isLoading: false,
  error: null,
  rebootingServerIds: new Set<string>(),
};

const state = {
  isLoading: signal<boolean>(initialState.isLoading),
  error: signal<string | null>(initialState.error),
  rebootingServerIds: signal<Set<string>>(initialState.rebootingServerIds),
  entityKeys: signal<string[]>([]),
};

const entitySignals = new Map<string, WritableSignal<Server>>();

@Injectable({
  providedIn: 'root',
})
export class ServerDataStore {
  public readonly $isLoading = state.isLoading.asReadonly();
  public readonly $error = state.error.asReadonly();
  public readonly $rebootingServerIds = state.rebootingServerIds.asReadonly();

  public readonly $servers = computed(() => {
    const keys = state.entityKeys();
    return keys.map(key => {
      const signal = entitySignals.get(key);
      return signal ? signal() : null;
    }).filter((s): s is Server => s !== null);
  });

  public readonly $locations = computed(() => {
    const locations = new Set<string>();
    this.$servers().forEach(s => locations.add(s.location));
    return Array.from(locations).sort();
  });

  public readonly $serverCount = computed(() => this.$servers().length);
  
  public readonly $onlineCount = computed(() => 
    this.$servers().filter(s => s.status === 'Online').length
  );
  
  public readonly $offlineCount = computed(() => 
    this.$servers().filter(s => s.status === 'Offline').length
  );

  private readonly _api = inject(ServerApiService);

  fetchServers(): void {
    state.isLoading.set(true);
    state.error.set(null);

    this._api.getServers().pipe(
      tap(servers => this._setEntities(servers)),
      catchError(err => {
        state.error.set('Failed to fetch servers.');
        console.error('Server fetch error:', err);
        return of(null);
      }),
      finalize(() => state.isLoading.set(false))
    ).subscribe();
  }

  rebootServer(serverId: string): void {
    state.rebootingServerIds.update(ids => new Set(ids).add(serverId));
    
    this._updateEntity(serverId, s => ({ ...s, status: 'Rebooting' }));
    
    this._api.rebootServer(serverId).pipe(
      tap(updatedServer => this._updateEntity(serverId, () => updatedServer)),
      catchError(err => {
        console.error('Reboot error:', err);
        this._updateEntity(serverId, s => ({ ...s, status: 'Online' }));
        return of(null);
      }),
      finalize(() => {
        state.rebootingServerIds.update(ids => {
          const newIds = new Set(ids);
          newIds.delete(serverId);
          return newIds;
        });
      })
    ).subscribe();
  }

  updateServer(server: Server): void {
    this._updateEntity(server.id, () => server);
  }

  getServerSignal(id: string): WritableSignal<Server> | undefined {
    return entitySignals.get(id);
  }

  private _setEntities(servers: Server[]): void {
    entitySignals.clear();
    const keys: string[] = [];
    servers.forEach(server => {
      entitySignals.set(server.id, signal(server));
      keys.push(server.id);
    });
    state.entityKeys.set(keys);
  }

  private _updateEntity(id: string, updater: (entity: Server) => Server): void {
    const entitySignal = entitySignals.get(id);
    entitySignal?.update(updater);
  }
}
