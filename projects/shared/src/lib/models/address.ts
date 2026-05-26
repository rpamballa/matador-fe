import { GeoPoint } from './geo';

export interface StructuredAddress {
  /** Human-readable formatted address. */
  label: string;
  line1?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  location?: GeoPoint;
}
