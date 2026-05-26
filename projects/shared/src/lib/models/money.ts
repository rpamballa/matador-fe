/** Monetary amount stored as integer minor units (cents) plus ISO currency code. */
export interface Money {
  /** Integer minor units, e.g. cents. Never a float. */
  amount: number;
  /** ISO 4217 code. Always 'USD' for Phase 1. */
  currency: string;
}
