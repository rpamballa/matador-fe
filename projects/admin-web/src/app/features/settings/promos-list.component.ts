import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import {
  BadgeComponent,
  ButtonComponent,
  EmptyStateComponent,
  LocalDatePipe,
} from '@matador/shared';
import { AdminDataService } from '../../core/data/admin-data.service';

@Component({
  selector: 'admin-promos-list',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, BadgeComponent, ButtonComponent, EmptyStateComponent, LocalDatePipe],
  template: `
    <div class="toolbar">
      <h1 class="page-title">Promo Codes</h1>
      <span style="flex:1"></span>
      <a routerLink="/settings/promos/new"><m-button variant="primary">New promo</m-button></a>
    </div>
    @if (result(); as r) {
      @if (r.items.length === 0) {
        <m-empty-state icon="🏷️" headline="No promo codes" />
      } @else {
        <table class="admin-table">
          <thead>
            <tr>
              <th>Code</th>
              <th>Description</th>
              <th>% off</th>
              <th>Active</th>
              <th>Expires</th>
            </tr>
          </thead>
          <tbody>
            @for (p of r.items; track p.id) {
              <tr>
                <td>
                  <a [routerLink]="['/settings/promos', p.id]">{{ p.code }}</a>
                </td>
                <td>{{ p.description }}</td>
                <td>{{ p.percentOff }}%</td>
                <td>
                  <m-badge [tone]="p.active ? 'success' : 'neutral'">{{
                    p.active ? 'Active' : 'Inactive'
                  }}</m-badge>
                </td>
                <td>{{ p.expiresAt ? (p.expiresAt | localDate: 'short') : '—' }}</td>
              </tr>
            }
          </tbody>
        </table>
      }
    }
  `,
})
export class PromosListComponent {
  private readonly data = inject(AdminDataService);
  readonly result = toSignal(this.data.listPromos());
}
