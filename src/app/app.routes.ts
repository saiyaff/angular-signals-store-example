import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'server-monitoring',
    pathMatch: 'full'
  },
  {
    path: 'server-monitoring',
    loadComponent: () => import('./server-monitoring/pages/server-dashboard').then(m => m.ServerDashboardComponent)
  }
];
