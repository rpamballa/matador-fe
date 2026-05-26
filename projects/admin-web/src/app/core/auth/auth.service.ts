import { Injectable, computed, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { StaffRole } from '@matador/shared';
import { environment } from '../../../environments/environment';

export interface StaffUser {
  id: string;
  email: string;
  name: string;
  role: StaffRole;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiBase}/api/admin/auth`;

  readonly currentUser = signal<StaffUser | null>(null);
  readonly isAuthenticated = computed(() => this.currentUser() !== null);
  readonly role = computed(() => this.currentUser()?.role ?? null);

  login(email: string, password: string): Observable<StaffUser> {
    return this.http
      .post<StaffUser>(`${this.base}/login`, { email, password })
      .pipe(tap((user) => this.currentUser.set(user)));
  }

  logout(): Observable<void> {
    return this.http
      .post<void>(`${this.base}/logout`, {})
      .pipe(tap(() => this.currentUser.set(null)));
  }

  /** Called on app bootstrap to hydrate the user from an existing session cookie. */
  refreshSession(): Observable<StaffUser> {
    return this.http
      .get<StaffUser>(`${this.base}/me`)
      .pipe(tap((user) => this.currentUser.set(user)));
  }

  hasRole(...roles: StaffRole[]): boolean {
    const current = this.role();
    return current !== null && roles.includes(current);
  }
}
