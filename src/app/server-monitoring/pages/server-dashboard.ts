import { Component, inject, OnInit, OnDestroy, ChangeDetectionStrategy } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { ServerMonitoringStore } from '../stores/server-monitoring';

@Component({
  selector: 'app-server-dashboard',
  imports: [DecimalPipe],
  providers: [ServerMonitoringStore],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './server-dashboard.html',
  styleUrl: './server-dashboard.scss'
})
export class ServerDashboardComponent implements OnInit, OnDestroy {
  protected readonly store = inject(ServerMonitoringStore);
  protected readonly $vm = this.store.$vm;

  ngOnInit(): void {
    this.store.fetchServers();
    this.store.connectWebSocket();
  }

  ngOnDestroy(): void {
    this.store.disconnectWebSocket();
  }

  formatUptime(seconds: number): string {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    
    if (days > 0) {
      return `${days}d ${hours}h`;
    } else if (hours > 0) {
      return `${hours}h ${minutes}m`;
    } else {
      return `${minutes}m`;
    }
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'Online': return 'status-online';
      case 'Offline': return 'status-offline';
      case 'Maintenance': return 'status-maintenance';
      case 'Rebooting': return 'status-rebooting';
      default: return '';
    }
  }

  getUsageClass(usage: number): string {
    if (usage >= 90) return 'usage-critical';
    if (usage >= 70) return 'usage-warning';
    return 'usage-normal';
  }
}
