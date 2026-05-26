import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { CardComponent, DistancePipe, MapComponent, MoneyPipe } from '@matador/shared';
import { environment } from '../../../environments/environment';
import { AvailableClass, CustomerDataService } from '../../core/data/customer-data.service';

@Component({
  selector: 'customer-home',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CardComponent, MapComponent, MoneyPipe, DistancePipe],
  template: `
    <header class="top">
      <div class="greeting">
        <span class="hello">Hey there</span>
        <div class="pills">
          <button type="button" class="pill" (click)="newTrip()">New Trip</button>
          <button type="button" class="pill">Schedule</button>
        </div>
      </div>
    </header>

    <div class="map">
      <m-map [accessToken]="mapboxToken" [zoom]="11" />
      <div class="zone-banner">You are in the Matador Zone</div>
    </div>

    <section class="sheet">
      @if (classes(); as list) {
        <h2>{{ list.length }}+ cars available</h2>
        <p class="sub">These cars are located at your nearest warehouses</p>
        <div class="filters">
          <span class="pill">Price</span>
          <span class="pill">Year</span>
          <span class="pill">Model</span>
          <span class="pill">Distance</span>
        </div>
        <div class="cards">
          @for (c of list; track c.id) {
            <m-card class="vehicle" (click)="select(c)">
              <div class="row">
                <strong>{{ c.name }}</strong>
                <span class="rate">{{ c.baseDailyRate | money }}/day</span>
              </div>
              <div class="meta">
                <span>{{ c.rangeExample }}</span>
                <span>{{ c.distanceMeters | distance }}</span>
                <span>★ {{ c.rating }} ({{ c.tripCount }})</span>
              </div>
              <div class="delivery">30 minutes delivery time</div>
            </m-card>
          }
        </div>
      }
    </section>
  `,
  styleUrl: './home.component.scss',
})
export class HomeComponent {
  private readonly data = inject(CustomerDataService);
  private readonly router = inject(Router);
  readonly mapboxToken = environment.mapboxAccessToken;
  readonly classes = toSignal(this.data.listAvailableClasses());

  newTrip(): void {
    this.router.navigate(['/booking/plan']);
  }

  select(c: AvailableClass): void {
    this.router.navigate(['/booking/plan'], { queryParams: { classId: c.id } });
  }
}
