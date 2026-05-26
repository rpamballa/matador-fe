import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { ConfirmDialogComponent, ToastHostComponent } from '@matador/shared';
import { AuthService } from '../auth/auth.service';

interface NavItem {
  label: string;
  path: string;
}

@Component({
  selector: 'admin-shell',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, ToastHostComponent, ConfirmDialogComponent],
  template: `
    <div class="shell">
      <aside class="sidebar">
        <div class="brand">Matador</div>
        <nav>
          @for (item of nav; track item.path) {
            <a [routerLink]="item.path" routerLinkActive="active">{{ item.label }}</a>
          }
          <div class="separator"></div>
          <span class="group-label">Settings</span>
          @for (item of settingsNav; track item.path) {
            <a [routerLink]="item.path" routerLinkActive="active" class="sub">{{ item.label }}</a>
          }
        </nav>
      </aside>
      <div class="main">
        <header class="topbar">
          <span class="spacer"></span>
          <button type="button" class="logout" (click)="logout()">Log out</button>
        </header>
        <main class="content">
          <router-outlet />
        </main>
      </div>
    </div>
    <m-toast-host />
    <m-confirm-dialog />
  `,
  styleUrl: './shell.component.scss',
})
export class ShellComponent {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  readonly nav: NavItem[] = [
    { label: 'Dashboard', path: '/dashboard' },
    { label: 'Bookings', path: '/bookings' },
    { label: 'Trips', path: '/trips' },
    { label: 'Vehicles', path: '/vehicles' },
    { label: 'Customers', path: '/customers' },
    { label: 'Incidents', path: '/incidents' },
    { label: 'Inspections', path: '/inspections' },
    { label: 'Ledger', path: '/ledger' },
  ];

  readonly settingsNav: NavItem[] = [
    { label: 'Vehicle classes', path: '/settings/vehicle-classes' },
    { label: 'Zones', path: '/settings/zones' },
    { label: 'Pricing rates', path: '/settings/rates' },
    { label: 'Promo codes', path: '/settings/promos' },
    { label: 'Staff', path: '/settings/staff' },
  ];

  logout(): void {
    this.auth.logout().subscribe({
      next: () => this.router.navigate(['/auth/login']),
      error: () => this.router.navigate(['/auth/login']),
    });
  }
}
