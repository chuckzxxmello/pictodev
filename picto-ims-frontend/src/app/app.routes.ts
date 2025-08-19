import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'home',
    loadComponent: () =>
      import('./app').then(m => m.App)
  },
  {
    path: 'login',
    loadComponent: () =>
      import('./components/login/login').then(m => m.Login)
  },
  {
    path: 'inventory',
    loadComponent: () =>
      import('./components/inventory/inventory').then(m => m.Inventory)
  },
  {
    path: 'dashboard',
    loadComponent: () =>
      import('./components/dashboard/dashboard').then(m => m.Dashboard)
  },
  {
    path: 'requisitions',
    loadComponent: () =>
      import('./components/requisitions/requisitions').then(m => m.Requisitions)
  },
  {
    path: 'requests',
    loadComponent: () =>
      import('./components/requests/requests').then(m => m.Requests)
  },
  {
    path: 'transfers',
    loadComponent: () =>
      import('./components/transfers/transfers').then(m => m.Transfers)
  },
  {
    path: 'repairs',
    loadComponent: () =>
      import('./components/repairs/repairs').then(m => m.Repairs)
  },
  {
    path: 'archive',
    loadComponent: () =>
      import('./components/archive/archive').then(m => m.Archive)
  }
];
