import { Injectable, computed, inject, signal } from '@angular/core';
import { Observable, from, map, tap } from 'rxjs';
import { Api, StaffRole, login1, logout, me1 } from '@matador/shared';

export interface StaffUser {
  id: string;
  email: string;
  name: string;
  role: StaffRole;
}

/**
 * Admin auth backed by the generated API client (session-cookie based).
 * - login   → POST /api/admin/auth/login
 * - logout  → POST /api/admin/auth/logout
 * - refresh → GET  /api/admin/auth/me  (hydrate from existing cookie)
 */
@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly api = inject(Api);

  readonly currentUser = signal<StaffUser | null>(null);
  readonly isAuthenticated = computed(() => this.currentUser() !== null);
  readonly role = computed(() => this.currentUser()?.role ?? null);

  login(email: string, password: string): Observable<StaffUser> {
    return from(this.api.invoke(login1, { body: { email, password } })).pipe(
      map((profile) => this.toUser(profile)),
      tap((user) => this.currentUser.set(user)),
    );
  }

  logout(): Observable<void> {
    return from(this.api.invoke(logout, {})).pipe(tap(() => this.currentUser.set(null)));
  }

  refreshSession(): Observable<StaffUser> {
    return from(this.api.invoke(me1, {})).pipe(
      map((profile) => this.toUser(profile)),
      tap((user) => this.currentUser.set(user)),
    );
  }

  hasRole(...roles: StaffRole[]): boolean {
    const current = this.role();
    return current !== null && roles.includes(current);
  }

  private toUser(profile: { id?: string; username?: string; role?: string }): StaffUser {
    return {
      id: profile.id ?? '',
      email: profile.username ?? '',
      name: profile.username ?? '',
      role: (profile.role as StaffRole) ?? 'READONLY',
    };
  }
}
