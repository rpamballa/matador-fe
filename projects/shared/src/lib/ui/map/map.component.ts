import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  OnDestroy,
  effect,
  input,
  viewChild,
} from '@angular/core';
import mapboxgl from 'mapbox-gl';
import { GeoPoint } from '../../models/geo';

export interface MapMarker {
  lng: number;
  lat: number;
  color?: string;
  popupHtml?: string;
}

export type GeoJsonPolygon = GeoJSON.Feature<GeoJSON.Polygon> | GeoJSON.Polygon;

/**
 * Reusable Mapbox GL JS wrapper. Apps must import 'mapbox-gl/dist/mapbox-gl.css'
 * globally and pass an access token. With no token, a placeholder is shown.
 */
@Component({
  selector: 'm-map',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (accessToken()) {
      <div #container class="map-container"></div>
    } @else {
      <div class="map-placeholder">Map unavailable (no access token configured)</div>
    }
  `,
  styles: [
    `
      :host {
        display: block;
        width: 100%;
        height: 100%;
        min-height: 200px;
      }
      .map-container {
        width: 100%;
        height: 100%;
        min-height: 200px;
        border-radius: var(--m-radius-md);
        overflow: hidden;
      }
      .map-placeholder {
        display: flex;
        align-items: center;
        justify-content: center;
        height: 100%;
        min-height: 200px;
        background: var(--m-color-background);
        color: var(--m-color-text-muted);
        border-radius: var(--m-radius-md);
        font-size: 0.875rem;
      }
    `,
  ],
})
export class MapComponent implements AfterViewInit, OnDestroy {
  readonly accessToken = input('');
  readonly markers = input<MapMarker[]>([]);
  readonly polygons = input<GeoJsonPolygon[]>([]);
  readonly centerOn = input<GeoPoint | null>(null);
  readonly zoom = input(11);

  private readonly container = viewChild<ElementRef<HTMLDivElement>>('container');
  private map?: mapboxgl.Map;
  private renderedMarkers: mapboxgl.Marker[] = [];

  constructor() {
    effect(() => {
      // Re-render markers whenever inputs change and the map exists.
      const markers = this.markers();
      const center = this.centerOn();
      if (this.map) {
        this.syncMarkers(markers);
        if (center) {
          this.map.setCenter([center.lng, center.lat]);
        }
      }
    });
  }

  ngAfterViewInit(): void {
    const el = this.container()?.nativeElement;
    const token = this.accessToken();
    if (!el || !token) {
      return;
    }
    const center = this.centerOn();
    this.map = new mapboxgl.Map({
      accessToken: token,
      container: el,
      style: 'mapbox://styles/mapbox/streets-v12',
      center: center ? [center.lng, center.lat] : [-78.6382, 35.7796], // Raleigh
      zoom: this.zoom(),
    });
    this.map.on('load', () => {
      this.syncPolygons(this.polygons());
      this.syncMarkers(this.markers());
    });
  }

  private syncMarkers(markers: MapMarker[]): void {
    if (!this.map) {
      return;
    }
    this.renderedMarkers.forEach((m) => m.remove());
    this.renderedMarkers = markers.map((m) => {
      const marker = new mapboxgl.Marker({ color: m.color ?? '#D94251' }).setLngLat([m.lng, m.lat]);
      if (m.popupHtml) {
        marker.setPopup(new mapboxgl.Popup().setHTML(m.popupHtml));
      }
      return marker.addTo(this.map!);
    });
  }

  private syncPolygons(polygons: GeoJsonPolygon[]): void {
    if (!this.map || polygons.length === 0) {
      return;
    }
    const features: GeoJSON.Feature<GeoJSON.Polygon>[] = polygons.map((p) =>
      'type' in p && p.type === 'Feature'
        ? (p as GeoJSON.Feature<GeoJSON.Polygon>)
        : { type: 'Feature', properties: {}, geometry: p as GeoJSON.Polygon },
    );
    this.map.addSource('zones', {
      type: 'geojson',
      data: { type: 'FeatureCollection', features },
    });
    this.map.addLayer({
      id: 'zones-fill',
      type: 'fill',
      source: 'zones',
      paint: { 'fill-color': '#4CAF50', 'fill-opacity': 0.12 },
    });
    this.map.addLayer({
      id: 'zones-stroke',
      type: 'line',
      source: 'zones',
      paint: { 'line-color': '#4CAF50', 'line-width': 2 },
    });
  }

  ngOnDestroy(): void {
    this.renderedMarkers.forEach((m) => m.remove());
    this.map?.remove();
  }
}
