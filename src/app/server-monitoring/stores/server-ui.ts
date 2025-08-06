import { computed, Injectable, signal } from '@angular/core';
import { Server } from '../models/server.model';

interface ServerUIState {
  searchTerm: string;
  statusFilter: 'All' | 'Online' | 'Offline';
  selectedServerIds: Set<string>;
}

const initialState: ServerUIState = {
  searchTerm: '',
  statusFilter: 'All',
  selectedServerIds: new Set<string>(),
};

const state = {
  searchTerm: signal<string>(initialState.searchTerm),
  statusFilter: signal<'All' | 'Online' | 'Offline'>(initialState.statusFilter),
  selectedServerIds: signal<Set<string>>(initialState.selectedServerIds),
};

@Injectable({
  providedIn: 'root',
})
export class ServerUiStore {
  public readonly $searchTerm = state.searchTerm.asReadonly();
  public readonly $statusFilter = state.statusFilter.asReadonly();
  public readonly $selectedServerIds = state.selectedServerIds.asReadonly();
  public readonly $hasSelection = computed(() => state.selectedServerIds().size > 0);
  public readonly $selectionCount = computed(() => state.selectedServerIds().size);

  setSearchTerm(searchTerm: string): void {
    state.searchTerm.set(searchTerm);
  }

  setStatusFilter(status: 'All' | 'Online' | 'Offline'): void {
    state.statusFilter.set(status);
  }
  
  clearFilters(): void {
    state.searchTerm.set(initialState.searchTerm);
    state.statusFilter.set(initialState.statusFilter);
  }

  toggleRow(server: Server): void {
    const newSelectedIds = new Set(state.selectedServerIds());
    if (newSelectedIds.has(server.id)) {
      newSelectedIds.delete(server.id);
    } else {
      newSelectedIds.add(server.id);
    }
    state.selectedServerIds.set(newSelectedIds);
  }

  clearSelection(): void {
    state.selectedServerIds.set(new Set<string>());
  }
}
