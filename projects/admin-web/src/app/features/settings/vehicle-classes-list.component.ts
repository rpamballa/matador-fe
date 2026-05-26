import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { BadgeComponent, ButtonComponent, EmptyStateComponent, MoneyPipe } from '@matador/shared';
import { AdminDataService } from '../../core/data/admin-data.service';

@Component({
  selector: 'admin-vehicle-classes-list',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, BadgeComponent, ButtonComponent, EmptyStateComponent, MoneyPipe],
  template: `
    <div class="toolbar">
      <h1 class="page-title">Vehicle Classes</h1>
      <span style="flex:1"></span>
      <a routerLink="/settings/vehicle-classes/new"
        ><m-button variant="primary">New class</m-button></a
      >
    </div>
    @if (classes(); as list) {
      @if (list.length === 0) {
        <m-empty-state icon="🚙" headline="No vehicle classes" />
      } @else {
        <table class="admin-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Seats</th>
              <th>Luggage</th>
              <th>Drivetrain</th>
              <th>Daily rate</th>
              <th>Active</th>
            </tr>
          </thead>
          <tbody>
            @for (c of list; track c.id) {
              <tr>
                <td>
                  <a [routerLink]="['/settings/vehicle-classes', c.id]">{{ c.name }}</a>
                </td>
                <td>{{ c.seats }}</td>
                <td>{{ c.luggage }}</td>
                <td>{{ c.drivetrain }}</td>
                <td>{{ c.baseDailyRate | money }}</td>
                <td>
                  <m-badge [tone]="c.active ? 'success' : 'neutral'">{{
                    c.active ? 'Active' : 'Inactive'
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
export class VehicleClassesListComponent {
  private readonly data = inject(AdminDataService);
  readonly classes = toSignal(this.data.listVehicleClasses());
}
