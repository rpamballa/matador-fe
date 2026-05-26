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
import type mapboxgl from 'mapbox-gl';
import { GeoPoint } from '../../models/geo';

export interface MapMarker {
  lng: number;
  lat: number;
  color?: string;
  popupHtml?: string;
}

export type GeoJsonPolygon = GeoJSON.Feature<GeoJSON.Polygon> | GeoJSON.Polygon;

type GlMap = InstanceType<typeof mapboxgl.Map>;
type GlMarker = InstanceType<typeof mapboxgl.Marker>;

/**
 * Reusable Mapbox GL JS wrapper. mapbox-gl is imported dynamically so its ~1.6MB
 * payload stays out of the initial bundle and only loads on screens that use a map.
 * Apps must import 'mapbox-gl/dist/mapbox-gl.css' globally and pass an access token.
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
  private gl?: typeof mapboxgl;
  private map?: GlMap;
  private renderedMarkers: GlMarker[] = [];

  constructor() {
    effect(() => {
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

  async ngAfterViewInit(): Promise<void> {
    const el = this.container()?.nativeElement;
    const token = this.accessToken();
    if (!el || !token) {
      return;
    }
    this.gl = (await import('mapbox-gl')).default;
    const center = this.centerOn();
    this.map = new this.gl.Map({
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
    if (!this.map || !this.gl) {
      return;
    }
    this.renderedMarkers.forEach((m) => m.remove());
    this.renderedMarkers = markers.map((m) => {
      const marker = new this.gl!.Marker({ color: m.color ?? '#D94251' }).setLngLat([m.lng, m.lat]);
      if (m.popupHtml) {
        marker.setPopup(new this.gl!.Popup().setHTML(m.popupHtml));
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
