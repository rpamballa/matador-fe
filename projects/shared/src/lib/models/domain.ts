import { Money } from './money';
import { GeoPoint } from './geo';

/* ---- Enums / status unions ---- */

export type VehicleStatus = 'AVAILABLE' | 'RESERVED' | 'IN_USE' | 'MAINTENANCE' | 'OUT_OF_SERVICE';

export type BookingStatus = 'PENDING' | 'CONFIRMED' | 'ACTIVE' | 'COMPLETED' | 'CANCELLED';

export type TripStatus = 'IN_PROGRESS' | 'ENDED_PENDING_INSPECTION' | 'COMPLETED' | 'CANCELLED';

export type VerificationStatus = 'UNVERIFIED' | 'PENDING' | 'VERIFIED' | 'REJECTED';

export type CustomerStatus = 'ACTIVE' | 'SUSPENDED';

export type IncidentType =
  | 'DAMAGE'
  | 'ACCIDENT'
  | 'LATE_RETURN'
  | 'OUT_OF_ZONE'
  | 'TICKET'
  | 'OTHER';

export type IncidentSeverity = 'LOW' | 'MEDIUM' | 'HIGH';

export type IncidentStatus = 'OPEN' | 'IN_REVIEW' | 'RESOLVED' | 'DISMISSED';

export type InspectionPhase = 'pickup' | 'dropoff';

export type InspectionStatus = 'SUBMITTED' | 'PASSED' | 'FLAGGED';

export type LedgerEntryType =
  | 'RENTAL_CHARGED'
  | 'DEPOSIT_HELD'
  | 'DEPOSIT_RELEASED'
  | 'REFUND'
  | 'INCIDENT_CHARGE'
  | 'MANUAL_ADJUSTMENT';

/* ---- Entities ---- */

export interface VehicleClass {
  id: string;
  name: string;
  description?: string;
  seats: number;
  luggage: number;
  drivetrain: string;
  baseDailyRate: Money;
  sortOrder: number;
  active: boolean;
}

export interface Vehicle {
  id: string;
  vin: string;
  licensePlate: string;
  make: string;
  model: string;
  year: number;
  classId: string;
  className: string;
  status: VehicleStatus;
  location?: GeoPoint;
  locationAddress?: string;
  lastUpdated?: string;
  fuelPercent?: number;
  odometerMiles?: number;
}

export interface CustomerSummary {
  id: string;
  name: string;
  email: string;
  phone: string;
  verificationStatus: VerificationStatus;
  status: CustomerStatus;
  signedUpAt: string;
  tripCount: number;
  lifetimeValue: Money;
}

export interface Booking {
  id: string;
  bookingNumber: string;
  customerId: string;
  customerName: string;
  vehicleClassId: string;
  vehicleClassName: string;
  assignedVehicleId?: string;
  pickupAt: string;
  dropoffAt: string;
  pickupAddress: string;
  dropoffAddress: string;
  status: BookingStatus;
  total: Money;
}

export interface Trip {
  id: string;
  tripNumber: string;
  bookingId: string;
  customerId: string;
  customerName: string;
  vehicleId: string;
  vehicleLabel: string;
  actualPickupAt?: string;
  actualDropoffAt?: string;
  milesDriven?: number;
  total: Money;
  status: TripStatus;
  currentLocation?: GeoPoint;
}

export interface Incident {
  id: string;
  type: IncidentType;
  severity: IncidentSeverity;
  status: IncidentStatus;
  description: string;
  vehicleId?: string;
  customerId?: string;
  tripId?: string;
  reportedAt: string;
}

export interface Inspection {
  id: string;
  tripId: string;
  tripNumber: string;
  phase: InspectionPhase;
  vehicleLabel: string;
  submittedAt: string;
  status: InspectionStatus;
  photoUrls: string[];
}

export interface LedgerEntry {
  id: string;
  occurredAt: string;
  customerId: string;
  customerName: string;
  tripId?: string;
  type: LedgerEntryType;
  amount: Money;
  description: string;
  paymentIntentRef?: string;
}

export interface Zone {
  id: string;
  name: string;
  polygon: GeoJSON.Feature<GeoJSON.Polygon>;
}

export interface PricingRate {
  id: string;
  vehicleClassId: string;
  vehicleClassName: string;
  dailyRate: Money;
  effectiveFrom: string;
}

export interface PromoCode {
  id: string;
  code: string;
  description: string;
  percentOff: number;
  active: boolean;
  expiresAt?: string;
}

export type StaffRoleName = 'ADMIN' | 'DISPATCHER' | 'SUPPORT' | 'READONLY';

export interface StaffMember {
  id: string;
  name: string;
  email: string;
  role: StaffRoleName;
  active: boolean;
}

export interface SavedAddress {
  id: string;
  label: string;
  line1: string;
  city: string;
  state: string;
  postalCode: string;
}

export interface PaymentCard {
  id: string;
  brand: string;
  last4: string;
  expMonth: number;
  expYear: number;
  isDefault: boolean;
}

export interface PagedResult<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
}
