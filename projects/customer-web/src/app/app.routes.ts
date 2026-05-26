import { Routes } from '@angular/router';
import { authGuard, verifiedGuard } from './core/auth/auth.guards';

const placeholder = () =>
  import('./core/layout/placeholder-page.component').then((m) => m.PlaceholderPageComponent);

export const routes: Routes = [
  // Full-screen flows (no bottom nav)
  {
    path: 'welcome',
    loadComponent: () =>
      import('./features/onboarding/welcome.component').then((m) => m.WelcomeComponent),
  },
  {
    path: 'auth/sign-in',
    loadComponent: () =>
      import('./features/onboarding/sign-in.component').then((m) => m.SignInComponent),
  },
  {
    path: 'auth/sign-up',
    loadComponent: () =>
      import('./features/onboarding/sign-up.component').then((m) => m.SignUpComponent),
  },
  { path: 'verify', loadComponent: placeholder, data: { title: 'Verification' } },
  { path: 'verify/pending', loadComponent: placeholder, data: { title: 'Verification pending' } },
  {
    path: 'booking',
    canActivate: [verifiedGuard],
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'plan' },
      {
        path: 'plan',
        loadComponent: () =>
          import('./features/booking/plan.component').then((m) => m.PlanComponent),
      },
      {
        path: 'select-car',
        loadComponent: () =>
          import('./features/booking/select-car.component').then((m) => m.SelectCarComponent),
      },
      {
        path: 'checkout',
        loadComponent: () =>
          import('./features/booking/checkout.component').then((m) => m.CheckoutComponent),
      },
      {
        path: 'confirmation/:bookingId',
        loadComponent: () =>
          import('./features/booking/confirmation.component').then((m) => m.ConfirmationComponent),
      },
    ],
  },
  {
    path: 'inspection/:tripId/:phase',
    canActivate: [authGuard],
    loadComponent: placeholder,
    data: { title: 'Car conditions' },
  },
  {
    path: 'trip/:id',
    canActivate: [authGuard],
    children: [
      { path: 'lock-unlock', loadComponent: placeholder, data: { title: 'Lock / Unlock' } },
      { path: 'report', loadComponent: placeholder, data: { title: 'Report an issue' } },
      { path: 'locate', loadComponent: placeholder, data: { title: 'Locate vehicle' } },
      { path: 'end', loadComponent: placeholder, data: { title: 'End trip' } },
    ],
  },
  { path: 'support', loadComponent: placeholder, data: { title: 'Help & Support' } },

  // Bottom-nav shell
  {
    path: '',
    loadComponent: () => import('./core/layout/shell.component').then((m) => m.ShellComponent),
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'home' },
      {
        path: 'home',
        loadComponent: () => import('./features/home/home.component').then((m) => m.HomeComponent),
      },
      {
        path: 'history',
        loadComponent: () =>
          import('./features/history/history.component').then((m) => m.HistoryComponent),
      },
      {
        path: 'profile',
        loadComponent: () =>
          import('./features/profile/profile.component').then((m) => m.ProfileComponent),
      },
    ],
  },
  { path: '**', redirectTo: '' },
];
