import { inject, Injectable, OnDestroy } from '@angular/core';
import { interval, Subject, takeUntil } from 'rxjs';
import { ServerWebSocketStore } from '../stores/server-websocket';
import { ServerDataStore } from '../stores/server-data';
import { ServerApiService } from './server-api';

@Injectable({
  providedIn: 'root',
})
export class ServerWebSocketService implements OnDestroy {
  private readonly _wsStore = inject(ServerWebSocketStore);
  private readonly _dataStore = inject(ServerDataStore);
  private readonly _apiService = inject(ServerApiService);
  private readonly _destroy$ = new Subject<void>();

  connect(): void {
    if (this._wsStore.$isConnecting() || this._wsStore.$isConnected()) {
      return;
    }

    this._wsStore.setConnecting(true);
    this._wsStore.setError(null);

    setTimeout(() => {
      this._wsStore.setConnecting(false);
      this._wsStore.setConnected(true);
      this._startReceivingUpdates();
    }, 1500);
  }

  disconnect(): void {
    this._wsStore.setConnected(false);
    this._destroy$.next();
  }

  private _startReceivingUpdates(): void {
    interval(5000)
      .pipe(takeUntil(this._destroy$))
      .subscribe(() => {
        if (!this._wsStore.$isConnected()) return;

        const servers = this._dataStore.$servers();
        servers.forEach(server => {
          if (server.status === 'Online') {
            const updated = this._apiService.getServerUpdate(server.id);
            if (updated) {
              this._dataStore.updateServer(updated);
            }
          }
        });

        const statusChange = this._apiService.simulateRandomStatusChange();
        if (statusChange) {
          this._dataStore.updateServer(statusChange);
        }
      });
  }

  ngOnDestroy(): void {
    this._destroy$.next();
    this._destroy$.complete();
  }
}
