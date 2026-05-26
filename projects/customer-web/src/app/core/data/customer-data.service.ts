import { Injectable, inject } from '@angular/core';
import { Observable, catchError, from, map, of } from 'rxjs';
import {
  Api,
  AddressResponse,
  Money,
  PaymentCard,
  PaymentMethodResponse,
  SavedAddress,
  Trip,
  TripResponse,
  VehicleClassResponse,
  addresses as apiAddresses,
  classes as apiClasses,
  get as apiGetTrip,
  history as apiHistory,
  list as apiPaymentMethods,
} from '@matador/shared';

const usd = (cents: number | undefined) => ({ amount: cents ?? 0, currency: 'USD' });
const PAGEABLE = { pageable: { page: 0, size: 50 } };

export interface AvailableClass {
  id: string;
  name: string;
  description?: string;
  seats: number;
  luggage: number;
  drivetrain: string;
  baseDailyRate: Money;
  rangeExample: string;
  distanceMeters: number;
  availableAt: string;
  rating: number;
  tripCount: number;
}

export interface Quote {
  subtotal: Money;
  taxes: Money;
  deliveryFee: Money;
  insurance: Money;
  total: Money;
}

/**
 * Customer data access. Calls the generated API client and maps backend DTOs to
 * the app's domain view-models, with a mock fallback when the API is unreachable
 * so the app stays demoable without the backend running.
 */
@Injectable({ providedIn: 'root' })
export class CustomerDataService {
  private readonly api = inject(Api);

  /** Triangle zone polygon for client-side out-of-zone checks. */
  readonly zone: GeoJSON.Feature<GeoJSON.Polygon> = {
    type: 'Feature',
    properties: {},
    geometry: {
      type: 'Polygon',
      coordinates: [
        [
          [-79.05, 35.7],
          [-78.5, 35.7],
          [-78.5, 36.05],
          [-79.05, 36.05],
          [-79.05, 35.7],
        ],
      ],
    },
  };

  private readonly mockClasses: AvailableClass[] = [
    {
      id: 'vc-1',
      name: 'Compact SUV Hybrid',
      description: 'Efficient compact SUV.',
      seats: 5,
      luggage: 3,
      drivetrain: 'HYBRID',
      baseDailyRate: usd(7900),
      rangeExample: '540 mi range',
      distanceMeters: 2400,
      availableAt: '2026-05-26T15:30:00Z',
      rating: 4.8,
      tripCount: 212,
    },
    {
      id: 'vc-2',
      name: 'Electric Sedan',
      description: 'Long-range EV.',
      seats: 5,
      luggage: 2,
      drivetrain: 'EV',
      baseDailyRate: usd(9900),
      rangeExample: '320 mi range',
      distanceMeters: 5200,
      availableAt: '2026-05-26T16:00:00Z',
      rating: 4.9,
      tripCount: 388,
    },
  ];

  private readonly mockAddresses: SavedAddress[] = [
    {
      id: 'ad-1',
      label: 'Home',
      line1: '100 Fayetteville St',
      city: 'Raleigh',
      state: 'NC',
      postalCode: '27601',
    },
  ];

  private readonly mockCards: PaymentCard[] = [
    { id: 'pc-1', brand: 'Visa', last4: '4242', expMonth: 8, expYear: 2028, isDefault: true },
  ];

  private readonly mockHistory: Trip[] = [
    {
      id: 'tr-9001',
      tripNumber: 'T-4990',
      bookingId: 'bk-9001',
      customerId: 'me',
      customerName: 'You',
      vehicleId: 've-1',
      vehicleLabel: 'Toyota RAV4 Hybrid',
      actualPickupAt: '2026-05-10T10:00:00Z',
      actualDropoffAt: '2026-05-12T10:00:00Z',
      milesDriven: 156,
      total: usd(18800),
      status: 'CLOSED',
    },
  ];

  private toAvailable(c: VehicleClassResponse): AvailableClass {
    return {
      id: c.id ?? '',
      name: c.name ?? '',
      description: c.description,
      seats: c.seats ?? 0,
      luggage: c.luggageCapacity ?? 0,
      drivetrain: c.drivetrain ?? '',
      baseDailyRate: usd(c.baseDailyRateCents),
      rangeExample: '',
      distanceMeters: 0,
      availableAt: '',
      rating: 0,
      tripCount: 0,
    };
  }

  /**
   * Catalog of bookable classes (param-less). The trip-specific availability
   * endpoint (`/api/customer/vehicles/available`) requires pickup time + location
   * and is used from the booking flow once those are known.
   */
  listAvailableClasses(): Observable<AvailableClass[]> {
    return from(this.api.invoke(apiClasses, {})).pipe(
      map((cs: VehicleClassResponse[]) => cs.map((c) => this.toAvailable(c))),
      catchError(() => of(this.mockClasses)),
    );
  }

  getClass(id: string): Observable<AvailableClass | null> {
    return this.listAvailableClasses().pipe(map((list) => list.find((c) => c.id === id) ?? null));
  }

  /**
   * Local quote estimate. The backend quote endpoint requires full trip params
   * (addresses + dates); wire it from the plan step when those are threaded through.
   */
  quoteFor(classId: string): Observable<Quote> {
    return this.getClass(classId).pipe(
      map((vc) => {
        const subtotalCents = (vc?.baseDailyRate.amount ?? 7900) * 2;
        const taxes = Math.round(subtotalCents * 0.07);
        const delivery = 2500;
        const insurance = 1900;
        return {
          subtotal: usd(subtotalCents),
          taxes: usd(taxes),
          deliveryFee: usd(delivery),
          insurance: usd(insurance),
          total: usd(subtotalCents + taxes + delivery + insurance),
        };
      }),
    );
  }

  listAddresses(): Observable<SavedAddress[]> {
    return from(this.api.invoke(apiAddresses, {})).pipe(
      map((rs: AddressResponse[]) =>
        rs.map((a) => ({
          id: a.id ?? '',
          label: a.label ?? '',
          line1: a.line1 ?? '',
          city: a.city ?? '',
          state: a.state ?? '',
          postalCode: a.postalCode ?? '',
        })),
      ),
      catchError(() => of(this.mockAddresses)),
    );
  }

  listCards(): Observable<PaymentCard[]> {
    return from(this.api.invoke(apiPaymentMethods, {})).pipe(
      map((rs: PaymentMethodResponse[]) =>
        rs.map((c) => ({
          id: c.id ?? '',
          brand: c.brand ?? '',
          last4: c.last4 ?? '',
          expMonth: c.expMonth ?? 0,
          expYear: c.expYear ?? 0,
          isDefault: c.isDefault ?? false,
        })),
      ),
      catchError(() => of(this.mockCards)),
    );
  }

  private toTrip(t: TripResponse): Trip {
    return {
      id: t.id ?? '',
      tripNumber: (t.id ?? '').slice(0, 8),
      bookingId: t.bookingId ?? '',
      customerId: 'me',
      customerName: 'You',
      vehicleId: t.vehicleId ?? '',
      vehicleLabel: (t.vehicleId ?? '').slice(0, 8),
      actualPickupAt: t.actualPickupAt,
      actualDropoffAt: t.actualDropoffAt,
      milesDriven: t.milesDriven,
      total: usd(t.finalChargesCents),
      status: (t.status ?? 'CLOSED') as Trip['status'],
    };
  }

  listHistory(): Observable<Trip[]> {
    return from(this.api.invoke(apiHistory, PAGEABLE)).pipe(
      map((page) => (page.content ?? []).map((t) => this.toTrip(t))),
      catchError(() => of(this.mockHistory)),
    );
  }

  getHistoryTrip(id: string): Observable<Trip | null> {
    return from(this.api.invoke(apiGetTrip, { id })).pipe(
      map((t) => this.toTrip(t)),
      catchError(() => of(this.mockHistory.find((t) => t.id === id) ?? null)),
    );
  }

  /** Point-in-polygon test against the zone (ray casting). */
  isInZone(lng: number, lat: number): boolean {
    const ring = this.zone.geometry.coordinates[0];
    let inside = false;
    for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
      const [xi, yi] = ring[i];
      const [xj, yj] = ring[j];
      const intersect = yi > lat !== yj > lat && lng < ((xj - xi) * (lat - yi)) / (yj - yi) + xi;
      if (intersect) {
        inside = !inside;
      }
    }
    return inside;
  }
}
