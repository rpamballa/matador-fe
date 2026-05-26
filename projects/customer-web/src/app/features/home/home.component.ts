import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { CardComponent, DistancePipe, MapComponent, MoneyPipe } from '@matador/shared';
import { environment } from '../../../environments/environment';
import { AvailableClass, CustomerDataService } from '../../core/data/customer-data.service';

type HomeVariant = 'A' | 'B' | 'C';

@Component({
  selector: 'customer-home',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CardComponent, MapComponent, MoneyPipe, DistancePipe],
  template: `
    <header class="top">
      <span class="hello">Hey there</span>
      <div class="variant-switch">
        @for (v of variants; track v) {
          <button type="button" [class.on]="variant() === v" (click)="variant.set(v)">
            {{ v }}
          </button>
        }
      </div>
    </header>

    <div class="map">
      <m-map [accessToken]="mapboxToken" [zoom]="11" />
      @if (variant() === 'A') {
        <div class="zone-banner">You are in the Matador Zone</div>
      }
    </div>

    @switch (variant()) {
      @case ('A') {
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
      }
      @case ('B') {
        <section class="sheet">
          <m-card>
            <h2>Your car is here!</h2>
            <p class="sub">Your vehicle is arriving in 12 minutes</p>
            <div class="row">
              <strong>Electric Sedan</strong>
              <span>64% · 210 mi</span>
            </div>
            <p class="addr">Pickup 3:30 PM → Dropoff 7:30 PM</p>
            <div class="cta">
              <button type="button" class="btn" (click)="goInspection()">Car Conditions</button>
              <button type="button" class="btn primary" disabled>Start Trip</button>
            </div>
            <button type="button" class="btn ghost" disabled>Modify Route</button>
          </m-card>
        </section>
      }
      @case ('C') {
        <section class="sheet">
          <m-card>
            <h2>Current Trip</h2>
            <div class="row">
              <strong>Electric Sedan</strong>
              <span>58% · 190 mi</span>
            </div>
            <p class="addr">Started 3:45 PM → Ends 7:30 PM</p>
            <div class="quick">
              <button type="button" class="btn" (click)="trip('lock-unlock')">Lock</button>
              <button type="button" class="btn" (click)="trip('report')">Report</button>
              <button type="button" class="btn" (click)="trip('locate')">Locate</button>
            </div>
            <div class="cta">
              <button type="button" class="btn ghost" disabled title="Coming soon">
                Extend Trip
              </button>
              <button type="button" class="btn primary" (click)="trip('end')">End Trip</button>
            </div>
            <button type="button" class="btn ghost" disabled>Modify Route</button>
          </m-card>
        </section>
      }
    }
  `,
  styleUrl: './home.component.scss',
})
export class HomeComponent {
  private readonly data = inject(CustomerDataService);
  private readonly router = inject(Router);
  readonly mapboxToken = environment.mapboxAccessToken;
  readonly classes = toSignal(this.data.listAvailableClasses());

  readonly variants: HomeVariant[] = ['A', 'B', 'C'];
  readonly variant = signal<HomeVariant>('A');

  /** Mock active trip id used by the variant C action links. */
  private readonly activeTripId = 'tr-active';

  select(c: AvailableClass): void {
    this.router.navigate(['/booking/plan'], { queryParams: { classId: c.id } });
  }

  goInspection(): void {
    this.router.navigate(['/inspection', this.activeTripId, 'pickup']);
  }

  trip(action: string): void {
    this.router.navigate(['/trip', this.activeTripId, action]);
  }
}
