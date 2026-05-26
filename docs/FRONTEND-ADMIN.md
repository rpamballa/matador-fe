# Matador Admin Web — Service Specification

> Angular 19 internal web application. Read `PROJECT.md` and `BACKEND.md` first.

---

## 1. Purpose

Internal operations console used by Matador staff (admins, dispatchers, support, read-only viewers) to manage the fleet, customers, bookings, trips, and finances. Not customer-facing.

Production URL: `admin.matador.com` (or equivalent staging subdomain).

---

## 2. Tech stack (pinned)

Shared tooling (Angular version, TypeScript, ESLint, Prettier, Jest, Playwright, build configuration) is defined at the workspace level — see `FRONTEND-WORKSPACE.md` § 2.

**Admin-specific additions:**

| Layer | Choice | Version |
|---|---|---|
| Component primitives | Angular Material | 19.x |
| Tables | Angular Material `MatTable` with custom data source | bundled |
| Charts | Chart.js via `ng2-charts` | latest |

The admin app uses **Angular Material more heavily than the customer app** because admin screens are dense table-and-form layouts where Material's primitives shine. The customer app uses Angular CDK selectively with custom styling to match the mockups; admin can lean on Material defaults for speed.

All components are **standalone** (no NgModules). Use Angular signals over RxJS where state is local; reserve RxJS for streams and HTTP.

---

## 3. Project structure

The admin app is **one project within the `matador-web` Angular workspace**. See `FRONTEND-WORKSPACE.md` for workspace-level setup (root files, shared library, tooling, OpenAPI client generation, build commands).

This spec covers what lives in `projects/admin-web/` only.

```
matador-web/                             # workspace root (see FRONTEND-WORKSPACE.md)
└── projects/admin-web/                  # ← scope of this spec
    ├── src/
    │   ├── main.ts
    │   ├── index.html
    │   ├── styles.scss                  # imports @matador/shared/theme + admin overrides
    │   ├── environments/
    │   │   ├── environment.ts
    │   │   └── environment.production.ts
    │   └── app/
    │       ├── app.config.ts            # bootstrap providers
    │       ├── app.routes.ts            # top-level routes
    │       ├── app.component.ts         # shell
    │       ├── core/
    │       │   ├── auth/                # session-based auth service, guard, interceptor
    │       │   ├── error/               # admin-specific error handler
    │       │   └── layout/              # sidebar, topbar, page shells
    │       ├── features/                # one folder per feature, lazy-loaded
    │       │   ├── auth/                # login screen
    │       │   ├── dashboard/
    │       │   ├── vehicles/
    │       │   ├── vehicle-classes/
    │       │   ├── zones/
    │       │   ├── customers/
    │       │   ├── bookings/
    │       │   ├── trips/
    │       │   ├── inspections/
    │       │   ├── incidents/
    │       │   ├── ledger/
    │       │   └── staff/               # user management (admin-only)
    │       └── theme/                   # admin-specific token overrides
    └── tsconfig.app.json
```

**What lives in the shared library, not here:**

- API client services (generated from OpenAPI) — import from `@matador/shared`
- DTO/model types — import from `@matador/shared`
- HTTP interceptors (error mapping, RFC 7807, loading) — import from `@matador/shared`
- UI primitives (`<m-button>`, `<m-card>`, `<m-badge>`, `<m-empty-state>`, `<m-map>`, `<m-address-input>`) — import from `@matador/shared`
- Pipes (`MoneyPipe`, `LocalDatePipe`, `DurationPipe`, `DistancePipe`) — import from `@matador/shared`
- Confirmation/toast services — import from `@matador/shared`
- Theme tokens — applied via `@matador/shared/theme/tokens.scss`

**What lives in admin only:**

- Session-cookie auth (admin uses cookies; customer uses JWT)
- Feature screens specific to operations (dashboards, vehicle management, ledger viewing)
- Sidebar+topbar shell layout (admin layout; customer has bottom nav)
- Admin-specific theme overrides (slightly muted accent color)

Each feature is a folder with its own routes, components, and feature-local services. Routes are lazy-loaded via `loadComponent` / `loadChildren` to keep the main bundle small.

---

## 4. Design system

Base design tokens are defined in the shared library — see `FRONTEND-WORKSPACE.md` § 6. The admin app imports `@matador/shared/theme/tokens.scss` from its root `styles.scss` and overrides only what it needs.

**Admin overrides** (in `projects/admin-web/src/styles.scss`):

```scss
@import '@matador/shared/theme/tokens.scss';

:root {
  /* Slightly muted primary for professional density */
  --m-color-primary: #C8324A;
  --m-color-primary-dark: #A0233A;
  --m-color-background: #F7F7F8;
  --m-color-border: #E4E6EA;
}
```

**Typography.** Inherited from shared tokens (system font stack). Base size 14px for admin density (override via `body { font-size: 14px; }`). Use `clamp()` for responsive headings.

**Density.** Compact. Admin users scan and act fast. Default table row height 40px, button height 32px in lists, 40px in forms. Padding modest.

**Iconography.** Material Symbols via `<mat-icon>`.

**Empty states.** Every list has a designed empty state using `<m-empty-state>` from `@matador/shared`: icon, headline, one-sentence explanation, and (where relevant) a primary action button.

---

## 5. Application shell & navigation

**Layout.** Persistent left sidebar (collapsible to icon-only), top bar with breadcrumbs and user menu, main content area.

**Sidebar items (in order):**

1. Dashboard — `/dashboard`
2. Bookings — `/bookings`
3. Trips — `/trips`
4. Vehicles — `/vehicles`
5. Customers — `/customers`
6. Incidents — `/incidents`
7. Inspections — `/inspections`
8. Ledger — `/ledger`
9. (separator)
10. Settings (collapsible group)
    - Vehicle classes — `/settings/vehicle-classes`
    - Zones — `/settings/zones`
    - Pricing rates — `/settings/rates`
    - Promo codes — `/settings/promos`
    - Staff — `/settings/staff` (admin-only)

**Top bar.** Breadcrumbs based on route hierarchy. User menu (avatar, name, logout). Notifications dropdown (placeholder, no real notifications in Phase 1).

**Route guards.**

- `authGuard` redirects to `/auth/login` if not authenticated.
- `roleGuard` restricts routes by role (e.g., staff management requires `ADMIN`).

---

## 6. Core services

### 6.1 Auth service

Manages session lifecycle. Backed by session cookie (HttpOnly, SameSite=Lax). Methods:

```typescript
class AuthService {
  readonly currentUser = signal<StaffUser | null>(null);
  readonly isAuthenticated = computed(() => this.currentUser() !== null);
  readonly role = computed(() => this.currentUser()?.role ?? null);

  login(email: string, password: string): Observable<StaffUser>;
  logout(): Observable<void>;
  refreshSession(): Observable<StaffUser>;       // called on app init
  hasRole(...roles: Role[]): boolean;
}
```

On app bootstrap, call `refreshSession()` to populate user state from existing cookie. On 401 from any API, clear user and redirect to login.

### 6.2 API client services

**API clients are generated**, not hand-written. The shared library (`@matador/shared`) exposes typed Angular services generated from the backend's `openapi.json`. See `FRONTEND-WORKSPACE.md` § 5 for the regeneration workflow.

Import generated services directly:

```typescript
import { AdminBookingsService, BookingDetail } from '@matador/shared';

@Component({...})
export class BookingDetailComponent {
  private bookingsApi = inject(AdminBookingsService);
  booking = signal<BookingDetail | null>(null);

  ngOnInit() {
    this.bookingsApi.getBooking({ id: this.id }).subscribe(b => this.booking.set(b));
  }
}
```

**When you need a higher-level operation** (e.g., "create booking, then confirm Stripe hold, then poll for activation"), wrap one or more generated services in a feature-local facade service inside the admin app. The facade composes generated services; do not duplicate or hand-craft request shapes.

**Do not** hand-write a `BookingsApi`, `CustomersApi`, etc. The generated equivalents (`AdminBookingsService`, `AdminCustomersService`, etc.) are the only HTTP-layer code that should exist.

### 6.3 HTTP interceptors

- **CredentialsInterceptor**: ensure `withCredentials: true` on all requests (needed for cookies).
- **ErrorInterceptor**: translate RFC 7807 ProblemDetail responses to user-friendly toasts. Handle 401 (logout + redirect), 403 (toast + stay), 422 (return field errors to caller), 5xx (toast + Sentry capture).
- **LoadingInterceptor**: track outstanding requests; expose a signal for global loading bar.

### 6.4 Error handling

Global `ErrorHandler` captures uncaught errors, reports to Sentry, shows generic toast. Forms map RFC 7807 `errors` field to per-field validation messages.

---

## 7. Feature specifications

Each feature lists: routes, screens, behaviors. Cross-reference backend endpoints in `BACKEND.md`.

### 7.1 Authentication

Routes:

- `/auth/login` — email + password form, "Sign in" button. On success → `/dashboard`.
- `/auth/forgot-password` — placeholder, "Contact administrator" message in Phase 1 (no reset flow).

### 7.2 Dashboard

Route: `/dashboard`

**Layout.** Two-row layout.

Top row: KPI cards (one row of 4):

1. Active trips (count of trips in `IN_PROGRESS`)
2. Bookings today (count where `pickup_at` is today)
3. Vehicles available (count of vehicles in `AVAILABLE` status)
4. Revenue this month (sum of `RENTAL_CHARGED` ledger entries for current month)

Second row: two columns.

- Left: list of "Bookings needing attention" — today's pickups not yet assigned, late returns, payment failures. Each item links to the relevant detail page.
- Right: map of the zone showing current vehicle locations as markers, colored by status.

Auto-refresh every 60 seconds via polling.

### 7.3 Bookings

Routes:

- `/bookings` — list
- `/bookings/new` — manual booking creation (staff-initiated)
- `/bookings/:id` — detail

**List screen.**

Filters: status (multi-select), customer (search), vehicle class, date range (pickup or dropoff), zone.

Table columns: booking number, customer name (linked), vehicle class, pickup datetime, dropoff datetime, status (badge), total, actions (kebab menu).

Sort: pickup date (default desc), booking number.

Pagination: 25 per page, server-side.

**Detail screen.**

Sections (tabs or accordion):

1. **Overview**: status badge, key dates, customer, vehicle class & assigned vehicle, pickup/dropoff addresses (mini map), total. Action buttons: Assign vehicle (if not assigned), Cancel, Activate (if confirmed and within pickup window).
2. **Price breakdown**: line items from the quote, deposit, taxes.
3. **Payment**: payment intents associated, hold status, captured amounts.
4. **Activity log**: timeline of status changes, derived from booking + trip events.
5. **Linked trip**: link to trip detail if booking activated.

**Manual booking creation flow.**

Multi-step form:

1. Pick customer (search; show verification status warning if unverified).
2. Pick vehicle class, pickup + dropoff date/time/location.
3. Show quote with breakdown.
4. Pick payment method (existing or staff records cash/manual).
5. Confirm. System creates booking and either holds via Stripe or marks as manual.

### 7.4 Trips

Routes:

- `/trips` — list
- `/trips/:id` — detail

**List screen.**

Filters: status, customer, vehicle, date range.

Columns: trip ID (short), customer, vehicle, actual pickup, actual dropoff (or "in progress"), miles, total, status.

**Detail screen.**

Sections:

1. **Overview**: status, customer, vehicle, actual pickup/dropoff times and locations, miles driven, current location (if IN_PROGRESS) on map.
2. **Trip route**: map showing all `trip_location_sample` points as a polyline.
3. **Inspections**: thumbnails of pickup and dropoff inspection photos with link to full review.
4. **Charges**: ledger entries for this trip.
5. **Incidents**: linked incidents.
6. **Activity log**: timeline.

Action buttons: Close trip (if `ENDED_PENDING_INSPECTION`), Add incident, Issue refund.

### 7.5 Vehicles

Routes:

- `/vehicles` — list with map view toggle
- `/vehicles/new` — add vehicle
- `/vehicles/:id` — detail
- `/vehicles/:id/edit` — edit

**List screen.**

Two view modes: table and map. Toggle in toolbar.

Filters: status, class, zone.

Table columns: license plate, make/model/year, class, status (badge), location (address, last-updated time), fuel/charge, actions.

Map view: Mapbox map with all vehicles as markers colored by status. Click marker → side panel with vehicle summary and link to detail.

**Detail screen.**

Tabs:

1. **Overview**: identification (VIN, plate), class, status (with transition dropdown), live location on map, fuel/charge, odometer, last updated.
2. **Telematics**: Lock and Unlock buttons (with confirmation modal), command history table.
3. **Trips**: history of trips this vehicle was used for.
4. **Maintenance**: notes (free-form for Phase 1; structured maintenance records deferred).
5. **Photos**: vehicle photos for catalog display.

### 7.6 Customers

Routes:

- `/customers` — list
- `/customers/:id` — detail

**List screen.**

Filters: verification status, customer status, signed-up date range.

Search: free-text matches against email, phone, name.

Columns: name, email, phone, verification status (badge), customer status (badge), signed up at, trip count, lifetime value.

**Detail screen.**

Tabs:

1. **Profile**: name, contact, DOB, license info (number + state + expiry), verification status, addresses.
2. **Bookings**: all bookings linked.
3. **Trips**: all trips linked.
4. **Payment methods**: cards on file (last 4 + brand + expiry).
5. **Ledger**: all financial entries for this customer.
6. **Notes**: free-text staff notes (separate `customer_note` table — add this if not in backend; defer if not needed).

Actions: Suspend (with reason), Reactivate, Resend verification email.

### 7.7 Inspections

Routes:

- `/inspections` — review queue
- `/inspections/:id` — review screen

**Review queue.**

List of inspections needing review (status not `PASSED`). Filters by phase (pickup/dropoff), date range, vehicle, customer.

Columns: trip number, phase, vehicle, submitted at, status.

**Review screen.**

Grid of photos by angle. Side panel: trip info, vehicle info, odometer/fuel reading, notes from submitter, "Pass" / "Flag" buttons. Flagging requires a reason and links to incident creation flow.

### 7.8 Incidents

Routes:

- `/incidents` — list
- `/incidents/new` — create
- `/incidents/:id` — detail

**List screen.**

Filters: type, severity, status, date range.

Columns: type, severity (badge), vehicle, customer, trip (if linked), reported at, status.

**Detail screen.**

Sections:

1. **Overview**: type, severity, description, location, occurred/reported times, reporter.
2. **Photos**: gallery.
3. **Linked trip and vehicle**.
4. **Charges**: if applicable.
5. **Resolution**: status, notes, resolved by, resolved at.

Actions: Update status, Charge customer (creates ledger entry via incident), Resolve, Dismiss.

### 7.9 Ledger

Routes:

- `/ledger` — list with filters
- `/ledger/adjustments/new` — manual adjustment form

**List screen.**

Filters: customer, trip, entry type, date range.

Columns: occurred at, customer, trip, type, amount (red if positive/debit, green if negative/credit), description, payment intent ref.

Sum totals shown at top for the current filter (gross, net).

Export to CSV button.

**Adjustment form (admin-only).**

Customer search, trip reference (optional), amount (signed), description, reason (required free text). Submits manual `MANUAL_ADJUSTMENT` ledger entry.

### 7.10 Settings → Vehicle classes

Routes:

- `/settings/vehicle-classes` — list
- `/settings/vehicle-classes/new` — create
- `/settings/vehicle-classes/:id` — edit

CRUD on `vehicle_class`. Fields: name, description, seats, luggage, drivetrain, base daily rate, sort order, active.

### 7.11 Settings → Zones

Routes:

- `/settings/zones` — list with map
- `/settings/zones/:id` — edit with map polygon editor

Polygon editor uses Mapbox GL Draw plugin. Save as GeoJSON.

### 7.12 Settings → Pricing rates

Routes:

- `/settings/rates` — list of rates by vehicle class
- `/settings/rates/new` — create new effective-dated rate

Rates are immutable once effective; "edit" means creating a new rate that supersedes via `effective_from`.

### 7.13 Settings → Promo codes

Routes:

- `/settings/promos` — list
- `/settings/promos/new` — create
- `/settings/promos/:id` — edit (only mutable fields: active, expires_at)

### 7.14 Settings → Staff (admin-only)

Routes:

- `/settings/staff` — list
- `/settings/staff/new` — invite
- `/settings/staff/:id` — edit role, deactivate

Staff management endpoints (not in `BACKEND.md` initial set — add a small `staff` module: invite by email, set initial password, role management).

---

## 8. Maps integration

Use Mapbox GL JS. Wrap in a reusable `<app-map>` component that accepts:

- `markers: MapMarker[]` — points with color, popup content
- `polygons: GeoJsonPolygon[]` — zones
- `routes: GeoJsonLineString[]` — trip paths
- `centerOn: [lng, lat] | null`
- `editable: boolean` — enables draw plugin

Mapbox access token from `environment.mapboxAccessToken`.

---

## 9. Forms

All forms use Reactive Forms with strongly typed `FormGroup<{...}>`. Show field-level errors below inputs. Disable submit while pending. Show submission errors as either inline (validation 422) or toast (other errors).

Date pickers use Angular Material with Luxon adapter.

Address inputs use a custom `<app-address-input>` component backed by Google Places Autocomplete that produces a structured address + lat/lng on selection.

---

## 10. Testing

**Unit tests.** Every service has tests. Every component with non-trivial logic has tests. Use Angular Testing Library or `@angular/core/testing` defaults.

**E2E tests.** Playwright. Critical journeys (one test each):

1. Staff login, navigate to dashboard, see KPIs.
2. Create a manual booking end to end.
3. Activate a confirmed booking (mocked Stripe).
4. Review and pass a pickup inspection.
5. Close a trip with no incidents.

E2E tests run against a docker-composed backend with seeded fixtures.

**Accessibility.** All forms keyboard-navigable. Color contrast ≥ 4.5:1 for text. ARIA labels on icon-only buttons. Run `axe-core` against key pages in tests.

---

## 11. Build & deploy

Build and deploy commands run from the workspace root. See `FRONTEND-WORKSPACE.md` § 9 for the full command surface.

**Dev.** `npm run start:admin` runs Angular dev server at `localhost:4201`, proxies `/api` to backend at `localhost:8080`.

**Build.** `npm run build:admin` produces optimized production bundle in `dist/admin-web/browser`.

**Deploy.** Static hosting at `admin.matador.com`. SPA fallback to `index.html`. Deployment workflow `.github/workflows/deploy-admin.yml` runs on changes to `projects/admin-web/**`, `projects/shared/**`, or `package.json`.

**Bundle budget.** Initial bundle ≤ 500KB gzipped. Lazy-load feature routes.

---

## 12. Implementation order

**Phase A — Shell (Week 1).**

1. Scaffold project, configure routing, set up Angular Material, theme tokens.
2. Implement core/layout (sidebar, topbar, shell component).
3. Implement core/auth (login screen, auth service, guards, interceptors).
4. Wire up backend `POST /api/admin/auth/login` end-to-end.

**Phase B — Read-only browsing (Week 2–3).**

5. Implement Customers list and detail (read-only).
6. Implement Vehicles list (table view) and detail.
7. Implement Bookings list and detail (read-only).
8. Implement Trips list and detail.

**Phase C — Mutations (Week 4–5).**

9. Implement Vehicle create/edit, status transitions, lock/unlock buttons.
10. Implement Booking manual creation, cancel, activate.
11. Implement Trip close.
12. Implement Inspection review.

**Phase D — Settings & maps (Week 6).**

13. Implement Vehicle Classes CRUD, Zones with polygon editor, Pricing rates.
14. Implement Vehicles map view.
15. Implement Dashboard with KPIs.

**Phase E — Financial & support (Week 7).**

16. Implement Incidents CRUD with photos.
17. Implement Ledger view + export, manual adjustments.
18. Implement Staff management (admin-only).

**Phase F — Polish (Week 8).**

19. Empty states, loading skeletons.
20. E2E test suite, accessibility audit, performance pass.
