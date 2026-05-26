import { Injectable } from '@angular/core';
import { Observable, delay, of } from 'rxjs';
import { Money, PaymentCard, SavedAddress, Trip, VehicleClass } from '@matador/shared';

const usd = (cents: number) => ({ amount: cents, currency: 'USD' });

export interface AvailableClass extends VehicleClass {
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
 * Temporary in-memory data source for the customer app. Replace with generated
 * @matador/shared API services once the backend openapi.json is available.
 */
@Injectable({ providedIn: 'root' })
export class CustomerDataService {
  /** Triangle zone bounding polygon (rough) for client-side out-of-zone checks. */
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

  private readonly classes: AvailableClass[] = [
    {
      id: 'vc-1',
      name: 'Compact SUV Hybrid',
      description: 'Efficient compact SUV.',
      seats: 5,
      luggage: 3,
      drivetrain: 'AWD',
      baseDailyRate: usd(7900),
      sortOrder: 1,
      active: true,
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
      drivetrain: 'RWD',
      baseDailyRate: usd(9900),
      sortOrder: 2,
      active: true,
      rangeExample: '320 mi range',
      distanceMeters: 5200,
      availableAt: '2026-05-26T16:00:00Z',
      rating: 4.9,
      tripCount: 388,
    },
  ];

  private wrap<T>(value: T): Observable<T> {
    return of(value).pipe(delay(150));
  }

  listAvailableClasses(): Observable<AvailableClass[]> {
    return this.wrap(this.classes);
  }

  getClass(id: string): Observable<AvailableClass | null> {
    return this.wrap(this.classes.find((c) => c.id === id) ?? null);
  }

  quoteFor(classId: string): Observable<Quote> {
    const vc = this.classes.find((c) => c.id === classId);
    const subtotalCents = (vc?.baseDailyRate.amount ?? 7900) * 2;
    const taxes = Math.round(subtotalCents * 0.07);
    const delivery = 2500;
    const insurance = 1900;
    return this.wrap({
      subtotal: usd(subtotalCents),
      taxes: usd(taxes),
      deliveryFee: usd(delivery),
      insurance: usd(insurance),
      total: usd(subtotalCents + taxes + delivery + insurance),
    });
  }

  private readonly addresses: SavedAddress[] = [
    {
      id: 'ad-1',
      label: 'Home',
      line1: '100 Fayetteville St',
      city: 'Raleigh',
      state: 'NC',
      postalCode: '27601',
    },
    {
      id: 'ad-2',
      label: 'Work',
      line1: '201 W Main St',
      city: 'Durham',
      state: 'NC',
      postalCode: '27701',
    },
  ];

  private readonly cards: PaymentCard[] = [
    { id: 'pc-1', brand: 'Visa', last4: '4242', expMonth: 8, expYear: 2028, isDefault: true },
  ];

  private readonly history: Trip[] = [
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
      status: 'COMPLETED',
    },
  ];

  listAddresses(): Observable<SavedAddress[]> {
    return this.wrap(this.addresses);
  }

  listCards(): Observable<PaymentCard[]> {
    return this.wrap(this.cards);
  }

  listHistory(): Observable<Trip[]> {
    return this.wrap(this.history);
  }

  getHistoryTrip(id: string): Observable<Trip | null> {
    return this.wrap(this.history.find((t) => t.id === id) ?? null);
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
