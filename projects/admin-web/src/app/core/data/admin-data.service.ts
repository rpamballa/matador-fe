import { Injectable, inject } from '@angular/core';
import { Observable, catchError, forkJoin, from, map, of } from 'rxjs';
import {
  Api,
  Booking,
  BookingResponse,
  CustomerSummary,
  Incident,
  IncidentResponse,
  Inspection,
  InspectionResponse,
  LedgerEntry,
  PagedResult,
  PricingRate,
  PromoCode,
  StaffMember,
  Trip,
  TripResponse,
  Vehicle,
  VehicleClass,
  VehicleClassResponse,
  VehicleResponse,
  Zone,
  ZoneResponse,
  detail,
  get2,
  get3,
  get4,
  get5,
  get6,
  list2,
  list3,
  list4,
  list5,
  list6,
  list7,
  list8,
} from '@matador/shared';

const usd = (cents: number | undefined) => ({ amount: cents ?? 0, currency: 'USD' });
const PAGEABLE = { pageable: { page: 0, size: 50 } };

/**
 * Admin data access. Calls the generated API client and maps backend DTOs to the
 * app's domain view-models. Falls back to seeded mock data when the API is
 * unreachable (e.g. running the frontend without the backend), so screens stay
 * demoable. Some fields the UI shows (customer name on bookings/trips, etc.) are
 * not exposed by the backend list DTOs and render as placeholders.
 *
 * Endpoints the backend does not expose are returned empty: ledger global list,
 * inspections queue, pricing-rate list, promo list, staff list.
 */
@Injectable({ providedIn: 'root' })
export class AdminDataService {
  private readonly api = inject(Api);

  /* ----- mock fallbacks (used only when the API call fails) ----- */
  private readonly mockClasses: VehicleClass[] = [
    {
      id: 'vc-1',
      name: 'Compact SUV Hybrid',
      description: 'Efficient compact SUV.',
      seats: 5,
      luggage: 3,
      drivetrain: 'HYBRID',
      baseDailyRate: usd(7900),
      sortOrder: 1,
      active: true,
    },
    {
      id: 'vc-2',
      name: 'Electric Sedan',
      description: 'Long-range EV.',
      seats: 5,
      luggage: 2,
      drivetrain: 'EV',
      baseDailyRate: usd(9900),
      sortOrder: 2,
      active: true,
    },
  ];

  private readonly mockCustomers: CustomerSummary[] = [
    {
      id: 'cu-1',
      name: 'Ada Lovelace',
      email: 'ada@example.com',
      phone: '+1 919 555 0101',
      verificationStatus: 'VERIFIED',
      status: 'ACTIVE',
      signedUpAt: '2026-01-12T14:00:00Z',
      tripCount: 7,
      lifetimeValue: usd(184200),
    },
    {
      id: 'cu-2',
      name: 'Alan Turing',
      email: 'alan@example.com',
      phone: '+1 919 555 0102',
      verificationStatus: 'IN_PROGRESS',
      status: 'ACTIVE',
      signedUpAt: '2026-03-02T09:30:00Z',
      tripCount: 1,
      lifetimeValue: usd(9900),
    },
  ];

  private readonly mockVehicles: Vehicle[] = [
    {
      id: 've-1',
      vin: '5YJ3E1EA7KF000001',
      licensePlate: 'MTD-001',
      make: 'Toyota',
      model: 'RAV4 Hybrid',
      year: 2025,
      classId: 'vc-1',
      className: 'Compact SUV Hybrid',
      status: 'AVAILABLE',
      location: { lng: -78.6382, lat: 35.7796 },
      locationAddress: 'Downtown Raleigh',
      lastUpdated: '2026-05-25T22:00:00Z',
      fuelPercent: 82,
      odometerMiles: 12450,
    },
    {
      id: 've-2',
      vin: '5YJ3E1EA7KF000002',
      licensePlate: 'MTD-002',
      make: 'Tesla',
      model: 'Model 3',
      year: 2025,
      classId: 'vc-2',
      className: 'Electric Sedan',
      status: 'WITH_CUSTOMER',
      location: { lng: -78.78, lat: 35.89 },
      locationAddress: 'Durham',
      lastUpdated: '2026-05-25T22:05:00Z',
      fuelPercent: 64,
      odometerMiles: 8800,
    },
  ];

  private readonly mockBookings: Booking[] = [
    {
      id: 'bk-1',
      bookingNumber: 'B-1001',
      customerId: 'cu-1',
      customerName: 'Ada Lovelace',
      vehicleClassId: 'vc-1',
      vehicleClassName: 'Compact SUV Hybrid',
      assignedVehicleId: 've-1',
      pickupAt: '2026-05-26T15:00:00Z',
      dropoffAt: '2026-05-28T15:00:00Z',
      pickupAddress: '100 Fayetteville St, Raleigh',
      dropoffAddress: '100 Fayetteville St, Raleigh',
      status: 'CONFIRMED',
      total: usd(18800),
    },
  ];

  private readonly mockTrips: Trip[] = [
    {
      id: 'tr-1',
      tripNumber: 'T-5001',
      bookingId: 'bk-1',
      customerId: 'cu-1',
      customerName: 'Ada Lovelace',
      vehicleId: 've-2',
      vehicleLabel: 'Tesla Model 3 (MTD-002)',
      actualPickupAt: '2026-05-25T16:00:00Z',
      milesDriven: 42,
      total: usd(9900),
      status: 'IN_PROGRESS',
    },
  ];

  private readonly mockIncidents: Incident[] = [
    {
      id: 'in-1',
      type: 'DAMAGE',
      severity: 'MEDIUM',
      status: 'OPEN',
      description: 'Scratch on rear bumper reported at dropoff.',
      vehicleId: 've-1',
      customerId: 'cu-1',
      tripId: 'tr-1',
      reportedAt: '2026-05-22T10:30:00Z',
    },
  ];

  /* ----- helpers ----- */
  private page<T>(items: T[], total = items.length): PagedResult<T> {
    return { items, total, page: 0, pageSize: items.length };
  }

  private classMap(): Observable<Map<string, string>> {
    return from(this.api.invoke(list4, {})).pipe(
      map((cs: VehicleClassResponse[]) => new Map(cs.map((c) => [c.id ?? '', c.name ?? '']))),
      catchError(() => of(new Map<string, string>())),
    );
  }

  /* ----- customers ----- */
  listCustomers(): Observable<PagedResult<CustomerSummary>> {
    return from(this.api.invoke(list7, PAGEABLE)).pipe(
      map((p) => ({
        items: (p.content ?? []).map((c) => ({
          id: c.id ?? '',
          name: `${c.firstName ?? ''} ${c.lastName ?? ''}`.trim(),
          email: c.email ?? '',
          phone: c.phone ?? '',
          verificationStatus: (c.verificationStatus ??
            'UNVERIFIED') as CustomerSummary['verificationStatus'],
          status: (c.status ?? 'ACTIVE') as CustomerSummary['status'],
          signedUpAt: c.createdAt ?? '',
          tripCount: 0,
          lifetimeValue: usd(0),
        })),
        total: p.totalElements ?? 0,
        page: p.number ?? 0,
        pageSize: p.size ?? 50,
      })),
      catchError(() => of(this.page(this.mockCustomers))),
    );
  }

  getCustomer(id: string): Observable<CustomerSummary | null> {
    return from(this.api.invoke(detail, { id })).pipe(
      map((c) => ({
        id: c.id ?? '',
        name: `${c.firstName ?? ''} ${c.lastName ?? ''}`.trim(),
        email: c.email ?? '',
        phone: c.phone ?? '',
        verificationStatus: (c.verificationStatus ??
          'UNVERIFIED') as CustomerSummary['verificationStatus'],
        status: (c.status ?? 'ACTIVE') as CustomerSummary['status'],
        signedUpAt: c.createdAt ?? '',
        tripCount: 0,
        lifetimeValue: usd(0),
      })),
      catchError(() => of(this.mockCustomers.find((c) => c.id === id) ?? null)),
    );
  }

  /* ----- vehicles ----- */
  private toVehicle(v: VehicleResponse, classNames: Map<string, string>): Vehicle {
    return {
      id: v.id ?? '',
      vin: v.vin ?? '',
      licensePlate: v.licensePlate ?? '',
      make: v.make ?? '',
      model: v.model ?? '',
      year: v.year ?? 0,
      classId: v.classId ?? '',
      className: classNames.get(v.classId ?? '') ?? '—',
      status: (v.status ?? 'AVAILABLE') as Vehicle['status'],
      location: v.lat != null && v.lng != null ? { lng: v.lng, lat: v.lat } : undefined,
      locationAddress: v.currentAddress,
      fuelPercent: v.fuelChargePercent,
      odometerMiles: v.odometerMiles,
    };
  }

  listVehicles(): Observable<PagedResult<Vehicle>> {
    return forkJoin({
      classes: this.classMap(),
      page: from(this.api.invoke(list3, PAGEABLE)),
    }).pipe(
      map(({ classes, page }) => ({
        items: (page.content ?? []).map((v) => this.toVehicle(v, classes)),
        total: page.totalElements ?? 0,
        page: page.number ?? 0,
        pageSize: page.size ?? 50,
      })),
      catchError(() => of(this.page(this.mockVehicles))),
    );
  }

  getVehicle(id: string): Observable<Vehicle | null> {
    return forkJoin({
      classes: this.classMap(),
      vehicle: from(this.api.invoke(get2, { id })),
    }).pipe(
      map(({ classes, vehicle }) => this.toVehicle(vehicle, classes)),
      catchError(() => of(this.mockVehicles.find((v) => v.id === id) ?? null)),
    );
  }

  /* ----- bookings ----- */
  private toBooking(b: BookingResponse, classNames: Map<string, string>): Booking {
    return {
      id: b.id ?? '',
      bookingNumber: b.bookingNumber ?? '',
      customerId: '',
      customerName: '—',
      vehicleClassId: b.vehicleClassId ?? '',
      vehicleClassName: classNames.get(b.vehicleClassId ?? '') ?? '—',
      assignedVehicleId: b.assignedVehicleId,
      pickupAt: b.pickupAt ?? '',
      dropoffAt: b.dropoffAt ?? '',
      pickupAddress: '—',
      dropoffAddress: '—',
      status: (b.status ?? 'PENDING_PAYMENT') as Booking['status'],
      total: usd(b.quotedTotalCents),
    };
  }

  listBookings(): Observable<PagedResult<Booking>> {
    return forkJoin({
      classes: this.classMap(),
      page: from(this.api.invoke(list8, PAGEABLE)),
    }).pipe(
      map(({ classes, page }) => ({
        items: (page.content ?? []).map((b) => this.toBooking(b, classes)),
        total: page.totalElements ?? 0,
        page: page.number ?? 0,
        pageSize: page.size ?? 50,
      })),
      catchError(() => of(this.page(this.mockBookings))),
    );
  }

  getBooking(id: string): Observable<Booking | null> {
    return forkJoin({
      classes: this.classMap(),
      booking: from(this.api.invoke(get6, { id })),
    }).pipe(
      map(({ classes, booking }) => this.toBooking(booking, classes)),
      catchError(() => of(this.mockBookings.find((b) => b.id === id) ?? null)),
    );
  }

  /* ----- trips ----- */
  private toTrip(t: TripResponse): Trip {
    return {
      id: t.id ?? '',
      tripNumber: (t.id ?? '').slice(0, 8),
      bookingId: t.bookingId ?? '',
      customerId: '',
      customerName: '—',
      vehicleId: t.vehicleId ?? '',
      vehicleLabel: (t.vehicleId ?? '').slice(0, 8),
      actualPickupAt: t.actualPickupAt,
      actualDropoffAt: t.actualDropoffAt,
      milesDriven: t.milesDriven,
      total: usd(t.finalChargesCents),
      status: (t.status ?? 'IN_PROGRESS') as Trip['status'],
    };
  }

  listTrips(): Observable<PagedResult<Trip>> {
    return from(this.api.invoke(list5, PAGEABLE)).pipe(
      map((page) => ({
        items: (page.content ?? []).map((t) => this.toTrip(t)),
        total: page.totalElements ?? 0,
        page: page.number ?? 0,
        pageSize: page.size ?? 50,
      })),
      catchError(() => of(this.page(this.mockTrips))),
    );
  }

  getTrip(id: string): Observable<Trip | null> {
    return from(this.api.invoke(get3, { id })).pipe(
      map((t) => this.toTrip(t)),
      catchError(() => of(this.mockTrips.find((t) => t.id === id) ?? null)),
    );
  }

  /* ----- incidents ----- */
  private toIncident(i: IncidentResponse): Incident {
    return {
      id: i.id ?? '',
      type: (i.type ?? 'OTHER') as Incident['type'],
      severity: (i.severity ?? 'LOW') as Incident['severity'],
      status: (i.status ?? 'OPEN') as Incident['status'],
      description: '',
      vehicleId: i.vehicleId,
      customerId: i.customerId,
      tripId: i.tripId,
      reportedAt: '',
    };
  }

  listIncidents(): Observable<PagedResult<Incident>> {
    return from(this.api.invoke(list6, PAGEABLE)).pipe(
      map((page) => ({
        items: (page.content ?? []).map((i) => this.toIncident(i)),
        total: page.totalElements ?? 0,
        page: page.number ?? 0,
        pageSize: page.size ?? 50,
      })),
      catchError(() => of(this.page(this.mockIncidents))),
    );
  }

  getIncident(id: string): Observable<Incident | null> {
    return from(this.api.invoke(get5, { id })).pipe(
      map((i) => this.toIncident(i)),
      catchError(() => of(this.mockIncidents.find((i) => i.id === id) ?? null)),
    );
  }

  /* ----- inspections (only single GET exists; no queue endpoint) ----- */
  getInspection(id: string): Observable<Inspection | null> {
    return from(this.api.invoke(get4, { id })).pipe(
      map((r: InspectionResponse) => ({
        id: r.id ?? '',
        tripId: r.tripId ?? '',
        tripNumber: (r.tripId ?? '').slice(0, 8),
        phase: (r.phase === 'PICKUP' ? 'pickup' : 'dropoff') as Inspection['phase'],
        vehicleLabel: '—',
        submittedAt: '',
        status: (r.reviewStatus ?? 'FLAGGED') as Inspection['status'],
        photoUrls: (r.photos ?? []).map((p) => p.url ?? '').filter(Boolean),
      })),
      catchError(() => of(null)),
    );
  }

  listInspections(): Observable<PagedResult<Inspection>> {
    // Backend exposes no inspection-queue list endpoint.
    return of(this.page<Inspection>([]));
  }

  /* ----- ledger (only per-trip / per-customer; no global list) ----- */
  listLedger(): Observable<PagedResult<LedgerEntry>> {
    return of(this.page<LedgerEntry>([]));
  }

  /* ----- settings ----- */
  listVehicleClasses(): Observable<VehicleClass[]> {
    return from(this.api.invoke(list4, {})).pipe(
      map((cs: VehicleClassResponse[]) =>
        cs.map((c) => ({
          id: c.id ?? '',
          name: c.name ?? '',
          description: c.description,
          seats: c.seats ?? 0,
          luggage: c.luggageCapacity ?? 0,
          drivetrain: c.drivetrain ?? '',
          baseDailyRate: usd(c.baseDailyRateCents),
          sortOrder: c.sortOrder ?? 0,
          active: c.active ?? false,
        })),
      ),
      catchError(() => of(this.mockClasses)),
    );
  }

  listZones(): Observable<Zone[]> {
    return from(this.api.invoke(list2, {})).pipe(
      map((zs: ZoneResponse[]) =>
        zs.map((z) => ({
          id: z.id ?? '',
          name: z.name ?? '',
          polygon: {
            type: 'Feature' as const,
            properties: {},
            geometry: {
              type: 'Polygon' as const,
              coordinates: (z.boundary?.coordinates ?? []) as number[][][],
            },
          },
        })),
      ),
      catchError(() => of([] as Zone[])),
    );
  }

  // No list endpoints for rates / promos / staff in the backend contract.
  listRates(): Observable<PagedResult<PricingRate>> {
    return of(this.page<PricingRate>([]));
  }
  listPromos(): Observable<PagedResult<PromoCode>> {
    return of(this.page<PromoCode>([]));
  }
  listStaff(): Observable<PagedResult<StaffMember>> {
    return of(this.page<StaffMember>([]));
  }

  /* ----- dashboard ----- */
  dashboard() {
    return forkJoin({
      trips: this.listTrips(),
      bookings: this.listBookings(),
      vehicles: this.listVehicles(),
    }).pipe(
      map(({ trips, bookings, vehicles }) => ({
        activeTrips: trips.items.filter((t) => t.status === 'IN_PROGRESS').length,
        bookingsToday: bookings.total,
        vehiclesAvailable: vehicles.items.filter((v) => v.status === 'AVAILABLE').length,
        revenueThisMonth: usd(0),
      })),
      catchError(() =>
        of({ activeTrips: 0, bookingsToday: 0, vehiclesAvailable: 0, revenueThisMonth: usd(0) }),
      ),
    );
  }
}
