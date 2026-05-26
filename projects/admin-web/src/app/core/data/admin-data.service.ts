import { Injectable } from '@angular/core';
import { Observable, delay, of } from 'rxjs';
import {
  Booking,
  CustomerSummary,
  Incident,
  Inspection,
  LedgerEntry,
  PagedResult,
  PricingRate,
  PromoCode,
  StaffMember,
  Trip,
  Vehicle,
  VehicleClass,
  Zone,
} from '@matador/shared';

const usd = (cents: number) => ({ amount: cents, currency: 'USD' });

/**
 * Temporary in-memory data source for the admin app. Returns seeded mock data
 * so screens render without a backend. Replace each method with the generated
 * @matador/shared API services once the backend openapi.json is available.
 */
@Injectable({ providedIn: 'root' })
export class AdminDataService {
  private readonly vehicleClasses: VehicleClass[] = [
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
    },
    {
      id: 'vc-3',
      name: 'Full-size SUV',
      seats: 7,
      luggage: 5,
      drivetrain: 'AWD',
      baseDailyRate: usd(12900),
      sortOrder: 3,
      active: false,
    },
  ];

  private readonly customers: CustomerSummary[] = [
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
      verificationStatus: 'PENDING',
      status: 'ACTIVE',
      signedUpAt: '2026-03-02T09:30:00Z',
      tripCount: 1,
      lifetimeValue: usd(9900),
    },
    {
      id: 'cu-3',
      name: 'Grace Hopper',
      email: 'grace@example.com',
      phone: '+1 919 555 0103',
      verificationStatus: 'REJECTED',
      status: 'SUSPENDED',
      signedUpAt: '2026-02-20T18:45:00Z',
      tripCount: 0,
      lifetimeValue: usd(0),
    },
  ];

  private readonly vehicles: Vehicle[] = [
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
      status: 'IN_USE',
      location: { lng: -78.78, lat: 35.89 },
      locationAddress: 'Durham',
      lastUpdated: '2026-05-25T22:05:00Z',
      fuelPercent: 64,
      odometerMiles: 8800,
    },
    {
      id: 've-3',
      vin: '5YJ3E1EA7KF000003',
      licensePlate: 'MTD-003',
      make: 'Chevrolet',
      model: 'Suburban',
      year: 2024,
      classId: 'vc-3',
      className: 'Full-size SUV',
      status: 'MAINTENANCE',
      locationAddress: 'Service Center',
      lastUpdated: '2026-05-24T10:00:00Z',
      fuelPercent: 30,
      odometerMiles: 33100,
    },
  ];

  private readonly bookings: Booking[] = [
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
    {
      id: 'bk-2',
      bookingNumber: 'B-1002',
      customerId: 'cu-2',
      customerName: 'Alan Turing',
      vehicleClassId: 'vc-2',
      vehicleClassName: 'Electric Sedan',
      pickupAt: '2026-05-27T09:00:00Z',
      dropoffAt: '2026-05-27T20:00:00Z',
      pickupAddress: '201 W Main St, Durham',
      dropoffAddress: '201 W Main St, Durham',
      status: 'PENDING',
      total: usd(9900),
    },
  ];

  private readonly trips: Trip[] = [
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
      currentLocation: { lng: -78.78, lat: 35.89 },
    },
    {
      id: 'tr-2',
      tripNumber: 'T-5000',
      bookingId: 'bk-0',
      customerId: 'cu-1',
      customerName: 'Ada Lovelace',
      vehicleId: 've-1',
      vehicleLabel: 'Toyota RAV4 (MTD-001)',
      actualPickupAt: '2026-05-20T10:00:00Z',
      actualDropoffAt: '2026-05-22T10:00:00Z',
      milesDriven: 188,
      total: usd(18800),
      status: 'ENDED_PENDING_INSPECTION',
    },
  ];

  private readonly incidents: Incident[] = [
    {
      id: 'in-1',
      type: 'DAMAGE',
      severity: 'MEDIUM',
      status: 'OPEN',
      description: 'Scratch on rear bumper reported at dropoff.',
      vehicleId: 've-1',
      customerId: 'cu-1',
      tripId: 'tr-2',
      reportedAt: '2026-05-22T10:30:00Z',
    },
  ];

  private readonly inspections: Inspection[] = [
    {
      id: 'is-1',
      tripId: 'tr-2',
      tripNumber: 'T-5000',
      phase: 'dropoff',
      vehicleLabel: 'Toyota RAV4 (MTD-001)',
      submittedAt: '2026-05-22T10:15:00Z',
      status: 'SUBMITTED',
      photoUrls: [],
    },
  ];

  private readonly ledger: LedgerEntry[] = [
    {
      id: 'le-1',
      occurredAt: '2026-05-22T10:05:00Z',
      customerId: 'cu-1',
      customerName: 'Ada Lovelace',
      tripId: 'tr-2',
      type: 'RENTAL_CHARGED',
      amount: usd(18800),
      description: 'Rental charge for T-5000',
      paymentIntentRef: 'pi_123',
    },
    {
      id: 'le-2',
      occurredAt: '2026-05-22T10:06:00Z',
      customerId: 'cu-1',
      customerName: 'Ada Lovelace',
      tripId: 'tr-2',
      type: 'DEPOSIT_HELD',
      amount: usd(50000),
      description: 'Security hold',
      paymentIntentRef: 'pi_124',
    },
  ];

  private readonly zones: Zone[] = [
    {
      id: 'zn-1',
      name: 'Triangle',
      polygon: {
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
      },
    },
  ];

  private readonly rates: PricingRate[] = [
    {
      id: 'rt-1',
      vehicleClassId: 'vc-1',
      vehicleClassName: 'Compact SUV Hybrid',
      dailyRate: usd(7900),
      effectiveFrom: '2026-01-01T00:00:00Z',
    },
    {
      id: 'rt-2',
      vehicleClassId: 'vc-2',
      vehicleClassName: 'Electric Sedan',
      dailyRate: usd(9900),
      effectiveFrom: '2026-01-01T00:00:00Z',
    },
  ];

  private readonly promos: PromoCode[] = [
    {
      id: 'pr-1',
      code: 'WELCOME10',
      description: '10% off first trip',
      percentOff: 10,
      active: true,
      expiresAt: '2026-12-31T00:00:00Z',
    },
  ];

  private readonly staff: StaffMember[] = [
    {
      id: 'st-1',
      name: 'Operations Admin',
      email: 'admin@matador.com',
      role: 'ADMIN',
      active: true,
    },
    {
      id: 'st-2',
      name: 'Dee Spatcher',
      email: 'dispatch@matador.com',
      role: 'DISPATCHER',
      active: true,
    },
  ];

  private wrap<T>(value: T): Observable<T> {
    return of(value).pipe(delay(150));
  }

  private page<T>(items: T[], page = 0, pageSize = 25): PagedResult<T> {
    return {
      items: items.slice(page * pageSize, (page + 1) * pageSize),
      total: items.length,
      page,
      pageSize,
    };
  }

  listCustomers() {
    return this.wrap(this.page(this.customers));
  }
  getCustomer(id: string) {
    return this.wrap(this.customers.find((c) => c.id === id) ?? null);
  }

  listVehicles() {
    return this.wrap(this.page(this.vehicles));
  }
  getVehicle(id: string) {
    return this.wrap(this.vehicles.find((v) => v.id === id) ?? null);
  }

  listBookings() {
    return this.wrap(this.page(this.bookings));
  }
  getBooking(id: string) {
    return this.wrap(this.bookings.find((b) => b.id === id) ?? null);
  }

  listTrips() {
    return this.wrap(this.page(this.trips));
  }
  getTrip(id: string) {
    return this.wrap(this.trips.find((t) => t.id === id) ?? null);
  }

  listIncidents() {
    return this.wrap(this.page(this.incidents));
  }
  listInspections() {
    return this.wrap(this.page(this.inspections));
  }
  getInspection(id: string) {
    return this.wrap(this.inspections.find((i) => i.id === id) ?? null);
  }
  getIncident(id: string) {
    return this.wrap(this.incidents.find((i) => i.id === id) ?? null);
  }
  listLedger() {
    return this.wrap(this.page(this.ledger));
  }

  listVehicleClasses() {
    return this.wrap(this.vehicleClasses);
  }
  listZones() {
    return this.wrap(this.zones);
  }
  listRates() {
    return this.wrap(this.page(this.rates));
  }
  listPromos() {
    return this.wrap(this.page(this.promos));
  }
  listStaff() {
    return this.wrap(this.page(this.staff));
  }

  dashboard() {
    return this.wrap({
      activeTrips: this.trips.filter((t) => t.status === 'IN_PROGRESS').length,
      bookingsToday: this.bookings.length,
      vehiclesAvailable: this.vehicles.filter((v) => v.status === 'AVAILABLE').length,
      revenueThisMonth: usd(
        this.ledger
          .filter((l) => l.type === 'RENTAL_CHARGED')
          .reduce((sum, l) => sum + l.amount.amount, 0),
      ),
    });
  }
}
