import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ButtonComponent, MapComponent } from '@matador/shared';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'customer-locate',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MapComponent, ButtonComponent],
  template: `
    <div class="page">
      <h1>Locate vehicle</h1>
      <div class="map">
        <m-map [accessToken]="mapboxToken" [markers]="markers" [zoom]="14" />
      </div>
      <div class="actions">
        <m-button variant="secondary" [disabled]="true">Honk</m-button>
        <m-button variant="secondary" [disabled]="true">Flash lights</m-button>
      </div>
      <p class="muted">Honk &amp; flash are coming soon.</p>
    </div>
  `,
  styles: [
    `
      .page {
        padding: calc(var(--m-safe-top) + var(--m-space-6)) var(--m-space-4) var(--m-space-8);
      }
      h1 {
        margin: 0 0 var(--m-space-4);
      }
      .map {
        height: 320px;
      }
      .actions {
        display: flex;
        gap: var(--m-space-2);
        margin-top: var(--m-space-4);
      }
      .muted {
        color: var(--m-color-text-muted);
        font-size: 0.8125rem;
      }
    `,
  ],
})
export class LocateComponent {
  readonly mapboxToken = environment.mapboxAccessToken;
  readonly markers = [{ lng: -78.78, lat: 35.89, color: '#D94251' }];
}
