import { Injectable, computed, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';

export type VerificationStatus = 'UNVERIFIED' | 'PENDING' | 'VERIFIED' | 'REJECTED';

export interface Customer {
  id: string;
  email: string;
  firstName: string;
  verificationStatus: VerificationStatus;
}

export interface AuthSession {
  accessToken: string;
  customer: Customer;
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
 * JWT auth. Access token is held in memory only (never localStorage) to limit
 * XSS exposure; the refresh token lives in an HttpOnly cookie set by the API.
 */
@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiBase}/api/customer/auth`;

  private readonly accessToken = signal<string | null>(null);
  readonly currentUser = signal<Customer | null>(null);
  readonly isAuthenticated = computed(() => this.currentUser() !== null);
  readonly verificationStatus = computed(() => this.currentUser()?.verificationStatus ?? null);

  getAccessToken(): string | null {
    return this.accessToken();
  }

  register(req: RegisterRequest): Observable<AuthSession> {
    return this.http.post<AuthSession>(`${this.base}/register`, req).pipe(tap((s) => this.apply(s)));
  }

  login(email: string, password: string): Observable<AuthSession> {
    return this.http
      .post<AuthSession>(`${this.base}/login`, { email, password })
      .pipe(tap((s) => this.apply(s)));
  }

  refresh(): Observable<AuthSession> {
    return this.http.post<AuthSession>(`${this.base}/refresh`, {}).pipe(tap((s) => this.apply(s)));
  }

  logout(): Observable<void> {
    return this.http.post<void>(`${this.base}/logout`, {}).pipe(
      tap(() => {
        this.accessToken.set(null);
        this.currentUser.set(null);
      }),
    );
  }

  private apply(session: AuthSession): void {
    this.accessToken.set(session.accessToken);
    this.currentUser.set(session.customer);
  }
}
