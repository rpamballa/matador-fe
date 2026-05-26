import { Routes } from '@angular/router';
import { authGuard, roleGuard } from './core/auth/auth.guards';

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
        path: 'bookings/new',
        loadComponent: () =>
          import('./features/bookings/booking-create.component').then(
            (m) => m.BookingCreateComponent,
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
        path: 'vehicles/new',
        loadComponent: () =>
          import('./features/vehicles/vehicle-form.component').then((m) => m.VehicleFormComponent),
      },
      {
        path: 'vehicles/:id/edit',
        loadComponent: () =>
          import('./features/vehicles/vehicle-form.component').then((m) => m.VehicleFormComponent),
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
      {
        path: 'incidents',
        loadComponent: () =>
          import('./features/incidents/incidents-list.component').then(
            (m) => m.IncidentsListComponent,
          ),
      },
      {
        path: 'incidents/new',
        loadComponent: () =>
          import('./features/incidents/incident-form.component').then(
            (m) => m.IncidentFormComponent,
          ),
      },
      {
        path: 'incidents/:id',
        loadComponent: () =>
          import('./features/incidents/incident-detail.component').then(
            (m) => m.IncidentDetailComponent,
          ),
      },
      {
        path: 'inspections',
        loadComponent: () =>
          import('./features/inspections/inspections-list.component').then(
            (m) => m.InspectionsListComponent,
          ),
      },
      {
        path: 'inspections/:id',
        loadComponent: () =>
          import('./features/inspections/inspection-review.component').then(
            (m) => m.InspectionReviewComponent,
          ),
      },
      {
        path: 'ledger',
        loadComponent: () =>
          import('./features/ledger/ledger-list.component').then((m) => m.LedgerListComponent),
      },
      {
        path: 'settings',
        children: [
          { path: '', pathMatch: 'full', redirectTo: 'vehicle-classes' },
          {
            path: 'vehicle-classes',
            loadComponent: () =>
              import('./features/settings/vehicle-classes-list.component').then(
                (m) => m.VehicleClassesListComponent,
              ),
          },
          {
            path: 'vehicle-classes/new',
            loadComponent: () =>
              import('./features/settings/vehicle-class-form.component').then(
                (m) => m.VehicleClassFormComponent,
              ),
          },
          {
            path: 'vehicle-classes/:id',
            loadComponent: () =>
              import('./features/settings/vehicle-class-form.component').then(
                (m) => m.VehicleClassFormComponent,
              ),
          },
          {
            path: 'zones',
            loadComponent: () =>
              import('./features/settings/zones-list.component').then((m) => m.ZonesListComponent),
          },
          {
            path: 'rates',
            loadComponent: () =>
              import('./features/settings/rates-list.component').then((m) => m.RatesListComponent),
          },
          {
            path: 'rates/new',
            loadComponent: () =>
              import('./features/settings/rate-form.component').then((m) => m.RateFormComponent),
          },
          {
            path: 'promos',
            loadComponent: () =>
              import('./features/settings/promos-list.component').then(
                (m) => m.PromosListComponent,
              ),
          },
          {
            path: 'promos/new',
            loadComponent: () =>
              import('./features/settings/promo-form.component').then((m) => m.PromoFormComponent),
          },
          {
            path: 'promos/:id',
            loadComponent: () =>
              import('./features/settings/promo-form.component').then((m) => m.PromoFormComponent),
          },
          {
            path: 'staff',
            canActivate: [roleGuard('ADMIN')],
            loadComponent: () =>
              import('./features/settings/staff-list.component').then((m) => m.StaffListComponent),
          },
          {
            path: 'staff/new',
            canActivate: [roleGuard('ADMIN')],
            loadComponent: () =>
              import('./features/settings/staff-form.component').then((m) => m.StaffFormComponent),
          },
          {
            path: 'staff/:id',
            canActivate: [roleGuard('ADMIN')],
            loadComponent: () =>
              import('./features/settings/staff-form.component').then((m) => m.StaffFormComponent),
          },
        ],
      },
    ],
  },
  { path: '**', redirectTo: '' },
];
