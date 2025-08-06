import { computed, inject, Injectable } from '@angular/core';
import { ServerDataStore } from './server-data';
import { ServerUiStore } from './server-ui';
import { ServerWebSocketStore } from './server-websocket';
import { ServerWebSocketService } from '../data-access/server-websocket-service';
import { Server } from '../models/server.model';

@Injectable()
export class ServerMonitoringStore {
  private readonly _dataStore = inject(ServerDataStore);
  private readonly _uiStore = inject(ServerUiStore);
  private readonly _webSocketStore = inject(ServerWebSocketStore);
  private readonly _webSocketService = inject(ServerWebSocketService);

  private readonly _$filteredServers = computed(() => {
    const servers = this._dataStore.$servers();
    const term = this._uiStore.$searchTerm().toLowerCase();
    const status = this._uiStore.$statusFilter();

    return servers.filter(server => {
      const termMatch = !term || 
        server.name.toLowerCase().includes(term) || 
        server.ipAddress.includes(term) ||
        server.location.toLowerCase().includes(term);
      
      const statusMatch = status === 'All' || server.status === status;
      
      return termMatch && statusMatch;
    });
  });

  private readonly _$statistics = computed(() => {
    const servers = this._dataStore.$servers();
    const onlineServers = servers.filter(s => s.status === 'Online');
    
    const avgCpu = onlineServers.length > 0 
      ? onlineServers.reduce((sum, s) => sum + s.cpuUsage, 0) / onlineServers.length 
      : 0;
    
    const avgMemory = onlineServers.length > 0 
      ? onlineServers.reduce((sum, s) => sum + s.memoryUsage, 0) / onlineServers.length 
      : 0;
    
    const avgDisk = onlineServers.length > 0 
      ? onlineServers.reduce((sum, s) => sum + s.diskUsage, 0) / onlineServers.length 
      : 0;

    return {
      totalServers: servers.length,
      onlineCount: this._dataStore.$onlineCount(),
      offlineCount: this._dataStore.$offlineCount(),
      maintenanceCount: servers.filter(s => s.status === 'Maintenance').length,
      avgCpu: Math.round(avgCpu),
      avgMemory: Math.round(avgMemory),
      avgDisk: Math.round(avgDisk),
    };
  });

  public readonly $vm = computed(() => ({
    servers: this._$filteredServers(),
    isLoading: this._dataStore.$isLoading(),
    error: this._dataStore.$error(),
    rebootingServerIds: this._dataStore.$rebootingServerIds(),
    locations: this._dataStore.$locations(),
    
    searchTerm: this._uiStore.$searchTerm(),
    statusFilter: this._uiStore.$statusFilter(),
    selectedServerIds: this._uiStore.$selectedServerIds(),
    selectionCount: this._uiStore.$selectionCount(),
    hasSelection: this._uiStore.$hasSelection(),
    
    isConnected: this._webSocketStore.$isConnected(),
    isConnecting: this._webSocketStore.$isConnecting(),
    connectionError: this._webSocketStore.$error(),
    
    statistics: this._$statistics(),
  }));

  public fetchServers(): void {
    this._dataStore.fetchServers();
  }

  public rebootServer(serverId: string): void {
    this._dataStore.rebootServer(serverId);
  }

  public setSearchTerm(term: string): void {
    this._uiStore.setSearchTerm(term);
  }
  
  public setStatusFilter(status: 'All' | 'Online' | 'Offline'): void {
    this._uiStore.setStatusFilter(status);
  }

  public toggleSelection(server: Server): void {
    this._uiStore.toggleRow(server);
  }

  public clearSelection(): void {
    this._uiStore.clearSelection();
  }

  public clearFilters(): void {
    this._uiStore.clearFilters();
  }

  public connectWebSocket(): void {
    this._webSocketService.connect();
  }

  public disconnectWebSocket(): void {
    this._webSocketService.disconnect();
  }
}
