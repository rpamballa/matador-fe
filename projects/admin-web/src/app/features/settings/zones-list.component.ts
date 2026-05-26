import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { CardComponent, GeoJsonPolygon, MapComponent } from '@matador/shared';
import { environment } from '../../../environments/environment';
import { AdminDataService } from '../../core/data/admin-data.service';

@Component({
  selector: 'admin-zones-list',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CardComponent, MapComponent],
  template: `
    <h1 class="page-title">Zones</h1>
    @if (zones(); as list) {
      <m-card>
        @for (z of list; track z.id) {
          <div class="zone">{{ z.name }}</div>
        }
        <p class="muted">
          Polygon editing (Mapbox GL Draw) is deferred; the active zone is shown below.
        </p>
      </m-card>
      <div class="map">
        <m-map [accessToken]="mapboxToken" [polygons]="polygons()" [zoom]="9" />
      </div>
    }
  `,
  styles: [
    `
      .zone {
        font-weight: 600;
        padding: var(--m-space-1) 0;
      }
      .muted {
        color: var(--m-color-text-muted);
        font-size: 0.8125rem;
      }
      .map {
        height: 360px;
        margin-top: var(--m-space-4);
      }
    `,
  ],
})
export class ZonesListComponent {
  private readonly data = inject(AdminDataService);
  readonly mapboxToken = environment.mapboxAccessToken;
  readonly zones = toSignal(this.data.listZones());
  readonly polygons = computed<GeoJsonPolygon[]>(() => (this.zones() ?? []).map((z) => z.polygon));
}
