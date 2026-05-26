import { Injectable, signal } from '@angular/core';

export interface TripPlan {
  startAddress: string;
  endAddress: string;
  endInZone: boolean;
  fromAt: string;
  untilAt: string;
}

/** Holds in-progress booking selections across the multi-step flow. */
@Injectable({ providedIn: 'root' })
export class BookingFlowService {
  readonly plan = signal<TripPlan | null>(null);
  readonly selectedClassId = signal<string | null>(null);

  reset(): void {
    this.plan.set(null);
    this.selectedClassId.set(null);
  }
}
