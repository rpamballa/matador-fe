import { Routes } from '@angular/router';
import { authGuard, roleGuard } from './core/auth/auth.guards';

const placeholder = () =>
  import('./core/layout/placeholder-page.component').then((m) => m.PlaceholderPageComponent);

export const routes: Routes = [
  {
    path: 'auth/login',
    loadComponent: () => import('./features/auth/login.component').then((m) => m.LoginComponent),
  },
  {
    path: '',
    loadComponent: () => import('./core/layout/shell.component').then((m) => m.ShellComponent),
    canActivate: [authGuard],
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'dashboard' },
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./features/dashboard/dashboard.component').then((m) => m.DashboardComponent),
      },
      { path: 'bookings', loadComponent: placeholder, data: { title: 'Bookings' } },
      { path: 'trips', loadComponent: placeholder, data: { title: 'Trips' } },
      { path: 'vehicles', loadComponent: placeholder, data: { title: 'Vehicles' } },
      { path: 'customers', loadComponent: placeholder, data: { title: 'Customers' } },
      { path: 'incidents', loadComponent: placeholder, data: { title: 'Incidents' } },
      { path: 'inspections', loadComponent: placeholder, data: { title: 'Inspections' } },
      { path: 'ledger', loadComponent: placeholder, data: { title: 'Ledger' } },
      {
        path: 'settings',
        children: [
          { path: '', pathMatch: 'full', redirectTo: 'vehicle-classes' },
          {
            path: 'vehicle-classes',
            loadComponent: placeholder,
            data: { title: 'Vehicle Classes' },
          },
          { path: 'zones', loadComponent: placeholder, data: { title: 'Zones' } },
          { path: 'rates', loadComponent: placeholder, data: { title: 'Pricing Rates' } },
          { path: 'promos', loadComponent: placeholder, data: { title: 'Promo Codes' } },
          {
            path: 'staff',
            loadComponent: placeholder,
            canActivate: [roleGuard('ADMIN')],
            data: { title: 'Staff' },
          },
        ],
      },
    ],
  },
  { path: '**', redirectTo: '' },
];
