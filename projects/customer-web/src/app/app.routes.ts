import { Routes } from '@angular/router';
import { authGuard, verifiedGuard } from './core/auth/auth.guards';

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
  {
    path: 'verify',
    loadComponent: () =>
      import('./features/verification/verify.component').then((m) => m.VerifyComponent),
  },
  {
    path: 'verify/pending',
    loadComponent: () =>
      import('./features/verification/verify-pending.component').then(
        (m) => m.VerifyPendingComponent,
      ),
  },
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
    loadComponent: () =>
      import('./features/inspection/inspection.component').then((m) => m.InspectionComponent),
  },
  {
    path: 'trip/:id',
    canActivate: [authGuard],
    children: [
      {
        path: 'lock-unlock',
        loadComponent: () =>
          import('./features/trip/lock-unlock.component').then((m) => m.LockUnlockComponent),
      },
      {
        path: 'report',
        loadComponent: () =>
          import('./features/trip/report.component').then((m) => m.ReportComponent),
      },
      {
        path: 'locate',
        loadComponent: () =>
          import('./features/trip/locate.component').then((m) => m.LocateComponent),
      },
      {
        path: 'end',
        loadComponent: () =>
          import('./features/trip/end-trip.component').then((m) => m.EndTripComponent),
      },
    ],
  },
  {
    path: 'support',
    loadComponent: () =>
      import('./features/support/support.component').then((m) => m.SupportComponent),
  },

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
        path: 'history/:tripId',
        loadComponent: () =>
          import('./features/history/history-detail.component').then(
            (m) => m.HistoryDetailComponent,
          ),
      },
      {
        path: 'profile',
        loadComponent: () =>
          import('./features/profile/profile.component').then((m) => m.ProfileComponent),
      },
      {
        path: 'profile/personal',
        loadComponent: () =>
          import('./features/profile/personal-info.component').then((m) => m.PersonalInfoComponent),
      },
      {
        path: 'profile/verification',
        loadComponent: () =>
          import('./features/profile/verification-status.component').then(
            (m) => m.VerificationStatusComponent,
          ),
      },
      {
        path: 'profile/addresses',
        loadComponent: () =>
          import('./features/profile/addresses.component').then((m) => m.AddressesComponent),
      },
      {
        path: 'profile/payment-methods',
        loadComponent: () =>
          import('./features/profile/payment-methods.component').then(
            (m) => m.PaymentMethodsComponent,
          ),
      },
    ],
  },
  { path: '**', redirectTo: '' },
];
