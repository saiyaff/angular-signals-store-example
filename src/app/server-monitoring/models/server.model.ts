export type ServerStatus = 'Online' | 'Offline' | 'Rebooting' | 'Maintenance';

export interface Server {
  id: string;
  name: string;
  ipAddress: string;
  location: string;
  status: ServerStatus;
  cpuUsage: number;
  memoryUsage: number;
  diskUsage: number;
  uptime: number;
  lastUpdate: Date;
}
