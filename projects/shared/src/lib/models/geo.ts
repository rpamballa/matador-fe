/** A geographic point in [longitude, latitude] order to match GeoJSON/Mapbox. */
export interface GeoPoint {
  lng: number;
  lat: number;
}

export interface DateRange {
  /** ISO-8601 instant. */
  start: string;
  /** ISO-8601 instant. */
  end: string;
}
