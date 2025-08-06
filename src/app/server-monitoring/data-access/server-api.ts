import { Injectable } from '@angular/core';
import { Observable, of, delay, throwError } from 'rxjs';
import { Server, ServerStatus } from '../models/server.model';

@Injectable({
  providedIn: 'root',
})
export class ServerApiService {
  private mockServers: Server[] = [
    {
      id: 'srv-001',
      name: 'Web Server 01',
      ipAddress: '192.168.1.10',
      location: 'New York',
      status: 'Online',
      cpuUsage: 45,
      memoryUsage: 62,
      diskUsage: 38,
      uptime: 864000,
      lastUpdate: new Date(),
    },
    {
      id: 'srv-002',
      name: 'Database Server',
      ipAddress: '192.168.1.20',
      location: 'New York',
      status: 'Online',
      cpuUsage: 72,
      memoryUsage: 85,
      diskUsage: 67,
      uptime: 432000,
      lastUpdate: new Date(),
    },
    {
      id: 'srv-003',
      name: 'API Gateway',
      ipAddress: '192.168.2.15',
      location: 'London',
      status: 'Online',
      cpuUsage: 28,
      memoryUsage: 41,
      diskUsage: 22,
      uptime: 1296000,
      lastUpdate: new Date(),
    },
    {
      id: 'srv-004',
      name: 'Cache Server',
      ipAddress: '192.168.2.25',
      location: 'London',
      status: 'Offline',
      cpuUsage: 0,
      memoryUsage: 0,
      diskUsage: 45,
      uptime: 0,
      lastUpdate: new Date(),
    },
    {
      id: 'srv-005',
      name: 'Load Balancer',
      ipAddress: '192.168.3.10',
      location: 'Tokyo',
      status: 'Online',
      cpuUsage: 15,
      memoryUsage: 32,
      diskUsage: 18,
      uptime: 2592000,
      lastUpdate: new Date(),
    },
    {
      id: 'srv-006',
      name: 'Mail Server',
      ipAddress: '192.168.3.20',
      location: 'Tokyo',
      status: 'Maintenance',
      cpuUsage: 0,
      memoryUsage: 0,
      diskUsage: 78,
      uptime: 0,
      lastUpdate: new Date(),
    },
    {
      id: 'srv-007',
      name: 'File Storage',
      ipAddress: '192.168.4.10',
      location: 'Sydney',
      status: 'Online',
      cpuUsage: 8,
      memoryUsage: 25,
      diskUsage: 92,
      uptime: 5184000,
      lastUpdate: new Date(),
    },
    {
      id: 'srv-008',
      name: 'Analytics Server',
      ipAddress: '192.168.4.20',
      location: 'Sydney',
      status: 'Online',
      cpuUsage: 89,
      memoryUsage: 94,
      diskUsage: 73,
      uptime: 604800,
      lastUpdate: new Date(),
    },
  ];

  getServers(): Observable<Server[]> {
    return of([...this.mockServers]).pipe(delay(800));
  }

  rebootServer(serverId: string): Observable<Server> {
    const server = this.mockServers.find(s => s.id === serverId);
    
    if (!server) {
      return throwError(() => new Error('Server not found'));
    }

    return new Observable<Server>(observer => {
      setTimeout(() => {
        const updatedServer = { 
          ...server, 
          status: 'Online' as ServerStatus,
          uptime: 0,
          cpuUsage: Math.random() * 30,
          memoryUsage: Math.random() * 40,
          lastUpdate: new Date()
        };
        const index = this.mockServers.findIndex(s => s.id === serverId);
        if (index !== -1) {
          this.mockServers[index] = updatedServer;
        }
        
        observer.next(updatedServer);
        observer.complete();
      }, 3000);
    });
  }

  getServerUpdate(serverId: string): Server | undefined {
    const server = this.mockServers.find(s => s.id === serverId);
    if (!server) return undefined;

    const updated = { ...server };
    
    if (server.status === 'Online') {
      updated.cpuUsage = Math.min(100, Math.max(0, server.cpuUsage + (Math.random() - 0.5) * 20));
      updated.memoryUsage = Math.min(100, Math.max(0, server.memoryUsage + (Math.random() - 0.5) * 15));
      updated.diskUsage = Math.min(100, Math.max(0, server.diskUsage + (Math.random() - 0.5) * 5));
      updated.uptime = server.uptime + 5;
    }
    
    updated.lastUpdate = new Date();
    
    const index = this.mockServers.findIndex(s => s.id === serverId);
    if (index !== -1) {
      this.mockServers[index] = updated;
    }
    
    return updated;
  }

  simulateRandomStatusChange(): Server | undefined {
    const onlineServers = this.mockServers.filter(s => s.status === 'Online');
    if (onlineServers.length === 0) return undefined;

    const server = onlineServers[Math.floor(Math.random() * onlineServers.length)];
    
    if (Math.random() < 0.05) {
      const statuses: ServerStatus[] = ['Online', 'Offline', 'Maintenance'];
      const newStatus = statuses[Math.floor(Math.random() * statuses.length)];
      
      const updated = { 
        ...server, 
        status: newStatus,
        lastUpdate: new Date()
      };
      
      if (newStatus !== 'Online') {
        updated.cpuUsage = 0;
        updated.memoryUsage = 0;
        updated.uptime = 0;
      }
      
      const index = this.mockServers.findIndex(s => s.id === server.id);
      if (index !== -1) {
        this.mockServers[index] = updated;
      }
      
      return updated;
    }
    
    return undefined;
  }
}
