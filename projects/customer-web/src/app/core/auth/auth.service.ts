import { Injectable, computed, inject, signal } from '@angular/core';
import { Observable, from, map, switchMap, tap } from 'rxjs';
import {
  Api,
  CustomerProfileResponse,
  TokenResponse,
  login,
  me,
  refresh as refreshFn,
  register,
} from '@matador/shared';

export type VerificationStatus = 'UNVERIFIED' | 'IN_PROGRESS' | 'VERIFIED' | 'REJECTED' | 'EXPIRED';

export interface Customer {
  id: string;
  email: string;
  firstName: string;
  verificationStatus: VerificationStatus;
  canBook: boolean;
}

export interface RegisterRequest {
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  email: string;
  phone: string;
  password: string;
}

/**
 * Customer auth backed by the generated API client (JWT).
 * Access + refresh tokens are held in memory only (never localStorage). The
 * profile is loaded from GET /api/customer/me after authentication.
 */
@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly api = inject(Api);

  private readonly accessToken = signal<string | null>(null);
  private refreshToken: string | null = null;

  readonly currentUser = signal<Customer | null>(null);
  readonly isAuthenticated = computed(() => this.currentUser() !== null);
  readonly verificationStatus = computed(() => this.currentUser()?.verificationStatus ?? null);

  getAccessToken(): string | null {
    return this.accessToken();
  }

  register(req: RegisterRequest): Observable<Customer> {
    // register returns void; immediately authenticate to obtain tokens + profile.
    return from(this.api.invoke(register, { body: req })).pipe(
      switchMap(() => this.login(req.email, req.password)),
    );
  }

  login(email: string, password: string): Observable<Customer> {
    return from(this.api.invoke(login, { body: { email, password } })).pipe(
      tap((token: TokenResponse) => this.applyToken(token)),
      switchMap(() => this.loadProfile()),
    );
  }

  refresh(): Observable<Customer> {
    return from(
      this.api.invoke(refreshFn, { body: { refreshToken: this.refreshToken ?? '' } }),
    ).pipe(
      tap((token: TokenResponse) => this.applyToken(token)),
      switchMap(() => this.loadProfile()),
    );
  }

  /** No server endpoint for customer logout; clear local session. */
  logout(): Observable<void> {
    this.accessToken.set(null);
    this.refreshToken = null;
    this.currentUser.set(null);
    return from(Promise.resolve());
  }

  private loadProfile(): Observable<Customer> {
    return from(this.api.invoke(me, {})).pipe(
      map((p: CustomerProfileResponse) => this.toCustomer(p)),
      tap((customer) => this.currentUser.set(customer)),
    );
  }

  private applyToken(token: TokenResponse): void {
    this.accessToken.set(token.accessToken ?? null);
    this.refreshToken = token.refreshToken ?? null;
  }

  private toCustomer(p: CustomerProfileResponse): Customer {
    return {
      id: p.id ?? '',
      email: p.email ?? '',
      firstName: p.firstName ?? '',
      verificationStatus: (p.verificationStatus as VerificationStatus) ?? 'UNVERIFIED',
      canBook: p.canBook ?? false,
    };
  }
}
