import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { ConfirmDialogComponent, ToastHostComponent } from '@matador/shared';

interface NavItem {
  label: string;
  path: string;
  icon: string;
}

@Component({
  selector: 'customer-shell',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, ToastHostComponent, ConfirmDialogComponent],
  template: `
    <div class="shell">
      <main class="content">
        <router-outlet />
      </main>
      <nav class="bottom-nav">
        @for (item of nav; track item.path) {
          <a [routerLink]="item.path" routerLinkActive="active">
            <span class="icon">{{ item.icon }}</span>
            <span class="label">{{ item.label }}</span>
          </a>
        }
      </nav>
    </div>
    <m-toast-host />
    <m-confirm-dialog />
  `,
  styleUrl: './shell.component.scss',
})
export class ShellComponent {
  readonly nav: NavItem[] = [
    { label: 'Home', path: '/home', icon: '🏠' },
    { label: 'History', path: '/history', icon: '🚗' },
    { label: 'Profile', path: '/profile', icon: '👤' },
  ];
}
