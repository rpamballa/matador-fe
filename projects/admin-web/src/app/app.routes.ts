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
      {
        path: 'bookings',
        loadComponent: () =>
          import('./features/bookings/bookings-list.component').then(
            (m) => m.BookingsListComponent,
          ),
      },
      {
        path: 'bookings/:id',
        loadComponent: () =>
          import('./features/bookings/booking-detail.component').then(
            (m) => m.BookingDetailComponent,
          ),
      },
      {
        path: 'trips',
        loadComponent: () =>
          import('./features/trips/trips-list.component').then((m) => m.TripsListComponent),
      },
      {
        path: 'trips/:id',
        loadComponent: () =>
          import('./features/trips/trip-detail.component').then((m) => m.TripDetailComponent),
      },
      {
        path: 'vehicles',
        loadComponent: () =>
          import('./features/vehicles/vehicles-list.component').then(
            (m) => m.VehiclesListComponent,
          ),
      },
      {
        path: 'vehicles/:id',
        loadComponent: () =>
          import('./features/vehicles/vehicle-detail.component').then(
            (m) => m.VehicleDetailComponent,
          ),
      },
      {
        path: 'customers',
        loadComponent: () =>
          import('./features/customers/customers-list.component').then(
            (m) => m.CustomersListComponent,
          ),
      },
      {
        path: 'customers/:id',
        loadComponent: () =>
          import('./features/customers/customer-detail.component').then(
            (m) => m.CustomerDetailComponent,
          ),
      },
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
