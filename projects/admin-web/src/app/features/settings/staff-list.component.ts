import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { BadgeComponent, ButtonComponent, EmptyStateComponent } from '@matador/shared';
import { AdminDataService } from '../../core/data/admin-data.service';

@Component({
  selector: 'admin-staff-list',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, BadgeComponent, ButtonComponent, EmptyStateComponent],
  template: `
    <div class="toolbar">
      <h1 class="page-title">Staff</h1>
      <span style="flex:1"></span>
      <a routerLink="/settings/staff/new"><m-button variant="primary">Invite staff</m-button></a>
    </div>
    @if (result(); as r) {
      @if (r.items.length === 0) {
        <m-empty-state icon="👥" headline="No staff" />
      } @else {
        <table class="admin-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Role</th>
              <th>Active</th>
            </tr>
          </thead>
          <tbody>
            @for (s of r.items; track s.id) {
              <tr>
                <td>
                  <a [routerLink]="['/settings/staff', s.id]">{{ s.name }}</a>
                </td>
                <td>{{ s.email }}</td>
                <td>{{ s.role }}</td>
                <td>
                  <m-badge [tone]="s.active ? 'success' : 'neutral'">{{
                    s.active ? 'Active' : 'Inactive'
                  }}</m-badge>
                </td>
              </tr>
            }
          </tbody>
        </table>
      }
    }
  `,
})
export class StaffListComponent {
  private readonly data = inject(AdminDataService);
  readonly result = toSignal(this.data.listStaff());
}
