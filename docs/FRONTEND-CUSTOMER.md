# Matador Customer Web (PWA) — Service Specification

> Angular 19 Progressive Web App for end customers. Read `PROJECT.md` and `BACKEND.md` first.

---

## 1. Purpose

End-customer-facing application for browsing vehicles, booking trips, completing pickup/dropoff inspections, and managing rentals. Installable to home screen as a PWA. Optimized for mobile (primary form factor) with responsive scaling up to desktop.

Production URL: `app.matador.com`.

A native iOS app is planned later; this PWA must remain the primary surface for Android and casual web users indefinitely.

---

## 2. Visual reference

This specification is anchored to the existing UX mockups. The agent should treat the following uploaded assets as the authoritative visual targets:

- `Home_Page_Version_30.jpg` — primary home screen with active trip card ("Current Trip")
- `Home_Page_Version_28.jpg` — home with no active trip, showing map + "Your car is here!" delivery card
- `Home_Page_Version_13.jpg` — home with no trip, showing browse view ("50+ cars available")
- `Plan_Your_Trip_-_Address_Out_of_Bounds.jpg` — trip planning sheet with out-of-zone warning
- `Select_Car.jpg` — vehicle selection screen
- `Checkout_Screen.jpg` and `Checkout_Screen-1.jpg` — finalize-trip / payment screens
- `New_Screens_-_July_20th__2025.png` — composite board showing the full set of screens
- `Matador_UX_Journey.pdf` and `Matador_UX_Journey__shared_.pdf` — flow diagrams for the entire customer journey

Build to match these screens visually within Angular Material primitives plus custom styling. Where the mockups conflict with this spec on copy or layout, the **mockups win on layout**, this spec wins on data, state, and behavior.

---

## 3. Tech stack (pinned)

Shared tooling (Angular version, TypeScript, ESLint, Prettier, Jest, Playwright, build configuration) is defined at the workspace level — see `FRONTEND-WORKSPACE.md` § 2.

**Customer-specific additions:**

| Layer | Choice | Version |
|---|---|---|
| PWA | `@angular/pwa` (service worker) | bundled |
| Component primitives | Angular CDK + selectively Angular Material | 19.x |
| Address autocomplete | Google Places API JS SDK | latest |
| Payments | Stripe.js + `@stripe/stripe-js` | latest |
| Camera | Browser MediaDevices API (built-in) | — |
| Push notifications | Web Push via service worker (Phase 1.5, optional) | — |
| Analytics | PostHog | latest |

The customer app uses **Angular CDK selectively with custom-styled components** to match the mockups precisely — Material's defaults are too heavy for the consumer-facing aesthetic. Most UI primitives come from `@matador/shared` (`<m-button>`, `<m-card>`, etc.).

**Standalone components only.** **Signals for state where possible.** **OnPush change detection by default** on all components.

---

## 4. Project structure

The customer app is **one project within the `matador-web` Angular workspace**. See `FRONTEND-WORKSPACE.md` for workspace-level setup (root files, shared library, tooling, OpenAPI client generation, build commands).

This spec covers what lives in `projects/customer-web/` only.

```
matador-web/                              # workspace root (see FRONTEND-WORKSPACE.md)
└── projects/customer-web/                # ← scope of this spec
    ├── ngsw-config.json                  # PWA service worker config
    ├── src/
    │   ├── main.ts
    │   ├── index.html
    │   ├── manifest.webmanifest          # PWA manifest
    │   ├── styles.scss                   # imports @matador/shared/theme + customer overrides
    │   ├── environments/
    │   │   ├── environment.ts
    │   │   └── environment.production.ts
    │   ├── app/
    │   │   ├── app.config.ts
    │   │   ├── app.routes.ts
    │   │   ├── app.component.ts          # root with bottom nav
    │   │   ├── core/
    │   │   │   ├── auth/                 # JWT auth service, guard, interceptors
    │   │   │   ├── error/                # customer-specific error handler
    │   │   │   ├── analytics/            # PostHog wrapper
    │   │   │   └── layout/               # bottom nav, top bar, page shells
    │   │   ├── features/                 # lazy-loaded routes
    │   │   │   ├── onboarding/           # welcome, sign-up, sign-in
    │   │   │   ├── verification/         # ID + license verification flow
    │   │   │   ├── home/                 # the three home variants
    │   │   │   ├── booking/              # plan trip, select car, checkout
    │   │   │   ├── trip/                 # active trip view, end trip
    │   │   │   ├── inspection/           # photo capture flows
    │   │   │   ├── history/              # past trips
    │   │   │   ├── profile/              # account, payment methods, addresses
    │   │   │   └── support/              # support entry, FAQ
    │   │   └── theme/                    # customer-specific token overrides
    │   └── assets/
    │       ├── icons/                    # PWA icons (192, 512, maskable)
    │       └── images/                   # car silhouettes, hero illustrations
    └── tsconfig.app.json
```

**What lives in the shared library, not here:**

- API client services (generated from OpenAPI, including `CustomerBookingsService`, `CustomerTripsService`, etc.) — import from `@matador/shared`
- DTO/model types — import from `@matador/shared`
- HTTP interceptors (error mapping, RFC 7807, loading) — import from `@matador/shared`
- UI primitives (`<m-button>`, `<m-card>`, `<m-badge>`, `<m-empty-state>`, `<m-map>`, `<m-address-input>`) — import from `@matador/shared`
- Pipes (`MoneyPipe`, `LocalDatePipe`, `DurationPipe`, `DistancePipe`) — import from `@matador/shared`
- Confirmation/toast services — import from `@matador/shared`
- Theme tokens — applied via `@matador/shared/theme/tokens.scss`

**What lives in customer only:**

- JWT auth (customer uses bearer tokens; admin uses session cookies)
- Feature screens specific to the customer journey
- Bottom-nav app shell (customer layout; admin has sidebar)
- PWA configuration (service worker, manifest)
- Stripe.js wrapper service (admin doesn't take payments)
- Camera/inspection capture logic
- Location service (geolocation tracking for active trips)
- PostHog analytics
- Customer-specific theme overrides (bolder brand red than admin)
- Visual design closely matching the uploaded mockups

---

## 5. Design system

Base design tokens are defined in the shared library — see `FRONTEND-WORKSPACE.md` § 6. The customer app imports `@matador/shared/theme/tokens.scss` from its root `styles.scss` and applies a small override layer.

**Customer overrides** (in `projects/customer-web/src/styles.scss`):

```scss
@import '@matador/shared/theme/tokens.scss';

:root {
  /* Customer app uses the brand red at full saturation (matches mockups) */
  --m-color-primary: #D94251;
  --m-color-primary-dark: #B0303D;
  --m-color-primary-soft: #F8E5E7;       /* pill backgrounds */
  --m-color-background: #FFFFFF;          /* customer is fully white, not the off-white admin uses */

  /* Customer app tunes radii larger than admin defaults to match mockup roundness */
  --m-radius-sm: 8px;
  --m-radius-md: 12px;
  --m-radius-lg: 16px;
}
```

**Typography.** Inherited from shared tokens. Body text 16px (`1rem`), small text 14px. Headings bold per mockups.

**Components matching mockups.** The customer app composes from shared `<m-*>` primitives and adds customer-specific components in `projects/customer-web/src/app/`:

- **Pills**: `<m-pill>` (in shared, rounded `--m-radius-pill`, primary-soft background, primary text). Used for `New Trip`, `Schedule`, filter dropdowns.
- **Cards**: `<m-card>` (in shared, rounded `--m-radius-md`, white surface, `--m-shadow-card`). Used for trip cards, vehicle cards.
- **Bottom sheet**: `<customer-bottom-sheet>` (customer-specific — admin doesn't use this pattern). Anchored to bottom, rounded top corners `--m-radius-lg`, slides up over map. Used heavily — home variants, plan trip, finalize trip.
- **Bottom nav**: `<customer-bottom-nav>` — three tabs (Home, Trip History, Profile). Active tab uses primary color and bold weight.
- **Status badges**: `<m-badge>` (in shared) with semantic color variants. Green check for "Photo requirements complete", etc.

**Iconography.** Material Symbols Rounded via `<mat-icon>`, sized 20–24px.

**Safe areas.** All full-bleed layouts respect `env(safe-area-inset-*)` (via `--m-safe-top` and `--m-safe-bottom` tokens) for iOS notches and home indicator.

---

## 6. Layout primitives

**App shell.** A persistent bottom navigation across most authenticated screens. Top bar is screen-specific (some screens have it, some don't — match mockups). Modal flows (verification, booking, photo capture) take over the full screen.

**Bottom nav items (3 tabs):**

1. **Home** — `/home` — house icon
2. **Trip History** — `/history` — car icon
3. **Profile** — `/profile` — user icon

The bottom nav is hidden on: onboarding flow, verification flow, booking checkout, photo capture, active in-trip view (replaced by trip-specific bottom sheet).

---

## 7. PWA configuration

**Manifest** (`manifest.webmanifest`):

```json
{
  "name": "Matador",
  "short_name": "Matador",
  "theme_color": "#D94251",
  "background_color": "#FFFFFF",
  "display": "standalone",
  "orientation": "portrait",
  "start_url": "/",
  "scope": "/",
  "icons": [
    { "src": "assets/icons/icon-192.png", "sizes": "192x192", "type": "image/png", "purpose": "any" },
    { "src": "assets/icons/icon-512.png", "sizes": "512x512", "type": "image/png", "purpose": "any" },
    { "src": "assets/icons/icon-maskable.png", "sizes": "512x512", "type": "image/png", "purpose": "maskable" }
  ]
}
```

**Service worker.** Use Angular's default service worker. Cache strategy:

- **App shell**: prefetch (all JS/CSS, app bundle).
- **API responses**: do not cache by default. Mark specific GETs cacheable: `vehicle-classes`, `zones/contains`, `me/addresses`.
- **Images**: cache-first with 30-day TTL.

**Offline support.** Phase 1 supports very limited offline:

- App shell loads offline and shows a "You're offline" banner.
- Photo capture in inspection flow stores photos locally (IndexedDB) and uploads when connection returns.
- All other writes require network — show retry UI.

**Install prompt.** Show a custom "Add Matador to your home screen" banner on second visit (use `beforeinstallprompt`). Dismissable; don't re-show for 30 days.

---

## 8. Core services

### 8.1 Auth service

JWT-based. Tokens stored in **memory + secure cookie fallback** rather than `localStorage` (to mitigate XSS risk). Access token in memory; refresh token in HttpOnly cookie.

```typescript
class AuthService {
  readonly currentUser = signal<Customer | null>(null);
  readonly isAuthenticated = computed(() => this.currentUser() !== null);
  readonly verificationStatus = computed(() => this.currentUser()?.verificationStatus);

  register(req: RegisterRequest): Observable<AuthSession>;
  login(email: string, password: string): Observable<AuthSession>;
  refresh(): Observable<AuthSession>;            // called by interceptor on 401
  logout(): Observable<void>;
}
```

On 401 from API, attempt refresh once. If refresh fails, logout and redirect to login.

### 8.2 API client services

**API clients are generated**, not hand-written. The shared library (`@matador/shared`) exposes typed Angular services generated from the backend's `openapi.json`. See `FRONTEND-WORKSPACE.md` § 5 for the regeneration workflow.

Import generated services directly. Customer-facing services follow the pattern `Customer<Resource>Service` (e.g., `CustomerBookingsService`, `CustomerTripsService`, `CustomerVehiclesService`, `CustomerAuthService`, `CustomerVerificationService`, `CustomerPaymentMethodsService`).

```typescript
import { CustomerBookingsService, BookingDetail } from '@matador/shared';

@Component({...})
export class BookingDetailComponent {
  private bookingsApi = inject(CustomerBookingsService);
  booking = signal<BookingDetail | null>(null);
}
```

**When you need a multi-step operation** (e.g., create booking → confirm Stripe hold → wait for confirmation), build a feature-local facade service in `projects/customer-web/src/app/features/booking/services/` that composes generated services and the Stripe service. Do not hand-craft HTTP requests.

### 8.3 Stripe service

Wraps `@stripe/stripe-js`. Initialized with publishable key from environment. Methods:

```typescript
class StripeService {
  loadStripe(): Promise<Stripe>;
  confirmCardSetup(clientSecret: string, paymentMethodOptions: any): Promise<SetupIntentResult>;
  confirmPayment(clientSecret: string, options: any): Promise<PaymentIntentResult>;
}
```

Mount Stripe Elements via Angular wrapper components: `<app-card-element>`, `<app-payment-element>`.

### 8.4 Identity verification service

Wraps Stripe Identity's client SDK. Methods to start a verification session (calls backend, gets client_secret) and to present the modal flow.

### 8.5 Location service

```typescript
class LocationService {
  readonly currentLocation = signal<GeoPoint | null>(null);

  requestPermission(): Promise<PermissionState>;
  getCurrentPosition(): Promise<GeoPoint>;
  watchPosition(): Observable<GeoPoint>;          // for active trip
}
```

Wraps `navigator.geolocation`. Permissions UX must be graceful — never block app on denial.

### 8.6 Camera / inspection service

Wraps `navigator.mediaDevices.getUserMedia` for in-browser camera capture. For Phase 1, an `<input type="file" accept="image/*" capture="environment">` fallback is acceptable on devices where MediaDevices is restricted.

After capture, photos are:

1. Resized to max 2048px on the longest edge using canvas.
2. Compressed to JPEG at 80% quality.
3. Stored in IndexedDB keyed by `(tripId, phase, angle)`.
4. Uploaded to R2 via presigned URL from backend.

### 8.7 Toast / sheet service

Imperative API to show success/error toasts and bottom sheets:

```typescript
class UiService {
  toast(message: string, kind?: 'success' | 'error' | 'info'): void;
  openSheet<T>(component: Type<T>, data?: any): SheetRef<T>;
  confirm(message: string, opts?: ConfirmOptions): Promise<boolean>;
}
```

---

## 9. Feature specifications

### 9.1 Onboarding

Routes: `/welcome`, `/auth/sign-in`, `/auth/sign-up`, `/auth/forgot-password`

**Welcome screen.** First open after install. Logo, tagline, "Sign up" (primary) and "Sign in" (secondary) buttons. Skippable to home for browsing (read-only).

**Sign up flow.** Multi-step:

1. Legal name, date of birth (must be ≥ 21).
2. Email, phone number.
3. Password (with strength indicator).
4. Terms of Service + Privacy Policy acceptance checkboxes.

On submit → call `POST /api/customer/auth/register` → log in → redirect to verification flow.

**Sign in.** Email + password. Forgot password link → placeholder screen ("Contact support" in Phase 1).

### 9.2 Verification

Routes: `/verify`, `/verify/pending`

**Verify screen.** Explains what's needed (driver's license + selfie). Primary button: "Start verification" → starts a Stripe Identity session and launches the modal flow. On completion, navigate to `/verify/pending`.

**Pending screen.** "Your verification is being processed. We'll notify you when it's complete." Includes a "Check status" button that polls `GET /api/customer/me/verification`. When complete (success), navigate to home with success toast. On failure, show reason and "Try again" button.

Authenticated routes that require trip booking should redirect to verification if user is `UNVERIFIED` or `REJECTED` (with cooldown enforcement).

### 9.3 Home

Route: `/home`

The home screen has **three variants** based on state, matching the mockups:

**Variant A — No active or scheduled trip** (matches `Home_Page_Version_13.jpg`):

- Top bar: "Hey {firstName}", profile avatar, "New Trip" pill, "Schedule" pill, search field
- Map area: full-width map centered on user location (or zone center if no permission). "You are in the Matador Zone" banner if applicable. Vehicle markers showing available cars.
- Bottom sheet (or scrolled list): "50+ cars available" heading, "These cars are located at your nearest warehouses" subline, filter pills (Price, Year, Model, Distance), horizontally-scrollable cards of vehicle classes.

Tapping a vehicle card or "New Trip" → booking flow (`/booking/plan`).

**Variant B — Scheduled trip, vehicle being delivered** (matches `Home_Page_Version_28.jpg`):

- Map showing vehicle location en route.
- Bottom sheet: "Your car is here!" / "Your vehicle is arriving in N minutes", car image, class, fuel %, range, pickup datetime → dropoff datetime, primary actions: "Car Conditions" (photo inspection) and "Start Trip" (disabled until inspection complete), pickup and dropoff addresses, "Modify Route" button.

**Variant C — Active trip** (matches `Home_Page_Version_30.jpg`):

- Map showing vehicle location and remaining route.
- Bottom sheet: "Current Trip" heading, vehicle card, fuel/range, start datetime → end datetime, "Extend Trip" (deferred — show but disable with tooltip "Coming soon") and "End Trip" buttons, three quick actions: Lock, Report, Locate, addresses, "Modify Route" (deferred — show but disable).

Home polls `GET /api/customer/me/trips/current` and `GET /api/customer/bookings` every 30 seconds to refresh variant + state.

### 9.4 Booking flow

Routes: `/booking/plan`, `/booking/select-car`, `/booking/checkout`, `/booking/confirmation/:bookingId`

**Plan your trip** (matches `Plan_Your_Trip_-_Address_Out_of_Bounds.jpg`):

- Map at top, bottom sheet form
- Start address (defaults to current location), End address
- From date+time, Until date+time
- Validation: pickup ≥ 2h in future, duration ≥ 4h, ≤ 30 days
- Out-of-zone detection: when end address is outside any zone, show red warning text "The end destination is outside the Matador Zone and will result in additional trip fees"
- Saved addresses (Home, Work) shown for quick selection
- Continue button → `/booking/select-car`

**Select your car** (matches `Select_Car.jpg`):

- Top of screen shows the trip parameters (editable via tap → returns to plan)
- "Rebook?" section (deferred Phase 1: don't show)
- "50+ cars available" with filter pills
- List of available vehicle classes with: image, class name, fuel/range example, distance, "Available At" time, rating (4.x ⭐ N trips), "30 minutes delivery time"

Tapping a card → `/booking/checkout` with selected class.

**Finalize your trip** (matches `Checkout_Screen.jpg`):

- "Finalize your trip" heading, close (X) button → confirm leave
- Car & Cost card: vehicle class image + name + rating, start/end with addresses and times, trip total, expandable breakdown (Subtotal, Taxes, Delivery Fee, Insurance)
- Primary Driver section: customer card (the user), "Add Another Driver" button (deferred — hide or disable)
- Insurance section: "Standard - Partial protection up to $10,000. You may still be liable for other damages." with "Change Option" button (deferred — show but disabled, single tier in Phase 1)
- Payment Options: list of saved cards (last 4 + brand) with default indicator + Apple Pay (Phase 2 — hide in Phase 1, card only) + "Add Payment Method" button
- "Complete Checkout" button — primary, full-width, at bottom

On submit: `POST /api/customer/bookings` returns booking + client_secret for hold confirmation → confirm via Stripe.js → on success navigate to `/booking/confirmation/:bookingId`. On failure, show error and stay.

**Confirmation screen.** Success state, booking number, ETA for vehicle delivery, "Back to home" → `/home` (will now show Variant B).

### 9.5 Inspection (photo capture)

Routes: `/inspection/:tripId/:phase` where phase is `pickup` or `dropoff`

Matches the `Car Conditions` screens in the mockups.

**Layout.**

- Top bar: back arrow, "Car Conditions" heading
- Progress message: "Photo requirements are complete. You're ready to start the trip!" (green) once all angles captured
- Vertical list of angle cards: `Front of Car`, `Back`, `Right Side`, `Left Side`, `Interior Front`, `Interior Rear`, `Odometer`
- Each angle card:
  - Header: angle name + green check (if complete)
  - Body: thumbnail of captured photo OR upload placeholder
  - "Retake" button (if captured) or "Upload or take a photo" (if not)
- Bottom button: "Proceed" — disabled until all 7 angles complete

**Capture flow per angle.**

Tap "Upload or take a photo" → opens an in-app camera viewfinder component with an outline overlay matching the angle (e.g., front-of-car silhouette per `New_Screens_-_July_20th__2025.png`). Shutter button. After capture, preview screen with "Retake" or "Use Photo". On "Use Photo", thumbnail returns to the angle list with the green check.

**Submission.**

When "Proceed" tapped:

1. For each photo, request a presigned URL from `POST /api/customer/me/trips/{id}/inspections/{phase}/upload-url`
2. PUT photo bytes to the presigned URL
3. POST `/api/customer/me/trips/{id}/inspections/{phase}` with list of `{angle, url}` plus odometer and fuel readings (entered in a separate small form before submit)
4. On success, return to home (which now allows "Start Trip" for pickup, or transitions to post-trip state for dropoff)

**Offline behavior.** If offline, photos cached in IndexedDB. A queued sync uploads when reconnection occurs. Show "Saved — will upload when online" badge.

### 9.6 Active trip

Trip lives on the Home Variant C bottom sheet. Dedicated screens for trip actions:

Routes: `/trip/:id/lock-unlock`, `/trip/:id/report`, `/trip/:id/locate`, `/trip/:id/end`

**Lock/Unlock screen.** Two big buttons: Lock and Unlock. Status indicator showing current door state. Action calls `POST /api/customer/me/trips/{id}/lock` or `unlock` (add these to backend trip API — they delegate to telematics). Show confirmation toast on success.

**Locate screen.** Map showing current vehicle location. "Honk" and "Flash lights" buttons (defer — show disabled).

**Report screen.** Form: incident type (Damage, Accident, Other), description, photo upload. Submits to `POST /api/customer/me/trips/{id}/incidents`.

**End Trip flow.** Multi-step:

1. Confirm end with current location displayed; show out-of-zone warning if applicable.
2. Photo inspection (dropoff) — same flow as pickup.
3. Final price review (subject to change if out of zone or overage).
4. Submit → trip ends → home reverts to Variant A.

### 9.7 Trip history

Routes: `/history`, `/history/:tripId`

**List** (history tab):

- Header: "Trip History"
- List of past trips, newest first
- Each row: vehicle class image, date range, total price, status
- Pull-to-refresh

**Trip detail.**

- Vehicle class + photo
- Pickup & dropoff details (date, time, address)
- Miles driven
- Cost breakdown (line items from ledger)
- Photos: pickup and dropoff inspections viewable as gallery
- Actions: "Rebook" (creates new booking pre-filled with same vehicle class and addresses; deferred for Phase 1 — show but disabled), "Find Lost Item" (opens support), "Report Safety Issue" (opens support)

### 9.8 Profile

Routes: `/profile`, `/profile/addresses`, `/profile/payment-methods`, `/profile/personal`, `/profile/verification`

**Profile home.** List with: name + email at top, then rows for:

- Personal Information → `/profile/personal`
- Verification Status → `/profile/verification`
- Saved Addresses → `/profile/addresses`
- Payment Methods → `/profile/payment-methods`
- Help & Support → `/support`
- Log Out (destructive, bottom)

**Personal Information.** View/edit name, phone. Email and DOB read-only.

**Verification status.** Shows status badge and license details if verified. "Re-verify" button if expired.

**Saved addresses.** List with edit/delete. Add new via `<app-address-input>`.

**Payment methods.** List of saved cards. Add new card → Stripe Elements modal. Set default / remove.

### 9.9 Support

Route: `/support`

Phase 1: a simple screen with contact options.

- "Email us": opens mailto.
- "Call us": opens tel.
- "FAQ": static markdown content (rendered via a `MarkdownPipe` or hardcoded HTML).
- (Live chat deferred.)

---

## 10. State management patterns

**Local component state:** signals. Example: `vehicleClasses = signal<VehicleClass[]>([]);`

**Cross-component shared state:** singleton services with signals. Example: `AuthService.currentUser`.

**Server state:** keep close to where it's used. Avoid premature global stores. If a feature needs cached server state (e.g., vehicle class catalog), make the API service expose a `signal<T[]>` that it manages.

**Forms:** Reactive Forms with typed `FormGroup`. Validation errors translated to field-level messages.

**Routing state:** route params + query params. Avoid storing navigation state in services.

---

## 11. Error handling

- HTTP 401 → attempt refresh, then logout if fails. Redirect to `/auth/sign-in`.
- HTTP 403 → show "You don't have permission" toast.
- HTTP 404 → navigate to a friendly "Not found" screen.
- HTTP 422 → map errors to form fields where possible; otherwise toast.
- HTTP 5xx → toast with retry option for safe-to-retry requests.
- Network failure → "You're offline" banner; queue mutations where appropriate.

All uncaught errors captured by global `ErrorHandler` → Sentry.

---

## 12. Analytics events

Track these via PostHog from day one:

| Event | When |
|---|---|
| `signup_started` | User submits signup form |
| `signup_completed` | Registration succeeds |
| `verification_started` | Stripe Identity session created |
| `verification_completed` | Webhook-driven success |
| `verification_failed` | Webhook-driven failure |
| `home_viewed` | Home screen visible |
| `vehicle_class_viewed` | User taps a class card on home or select-car |
| `booking_plan_started` | User opens plan-trip sheet |
| `booking_quote_requested` | Quote API called |
| `booking_checkout_viewed` | Finalize-trip screen visible |
| `booking_created` | Booking created on backend |
| `booking_confirmed` | Stripe hold succeeded |
| `booking_cancelled` | User cancels |
| `inspection_started` | User opens inspection flow |
| `inspection_photo_captured` | Per angle |
| `inspection_submitted` | Inspection POST succeeded |
| `trip_started` | Booking activated |
| `trip_ended` | Trip end POST succeeded |
| `vehicle_locked`, `vehicle_unlocked` | Trip controls |
| `incident_reported` | Customer reports incident |

All events include `customer_id`, `session_id`, current `route`. PII never in event properties beyond customer_id.

---

## 13. Testing

**Unit.** Services and signal-driven logic covered. Forms have validation tests. Pipes covered.

**E2E (Playwright).** Critical journeys:

1. Sign up → verification → home.
2. Plan trip → select car → checkout → confirmation. (Mocked Stripe.)
3. Inspection capture (all 7 angles) → submit.
4. End trip flow including dropoff inspection.
5. View trip history detail.

Run e2e against a docker-composed backend with seeded fixtures.

**Visual regression.** Optional but recommended: Percy or Chromatic for key screens, especially against the mockup targets.

**Accessibility.**

- All interactive elements have accessible names.
- Color contrast ≥ 4.5:1 for body text, 3:1 for large text.
- Touch targets ≥ 44×44 px.
- VoiceOver / TalkBack smoke test for booking flow.

---

## 14. Performance budgets

- First Contentful Paint ≤ 1.5s on mid-tier mobile (Moto G class).
- Largest Contentful Paint ≤ 2.5s.
- Initial JS bundle ≤ 250KB gzipped (main chunk). Lazy chunks ≤ 100KB each.
- Lighthouse PWA score ≥ 90.

Use Angular's deferred views (`@defer`) for below-the-fold components.

---

## 15. Build & deploy

Build and deploy commands run from the workspace root. See `FRONTEND-WORKSPACE.md` § 9 for the full command surface.

**Dev.** `npm run start:customer` runs Angular dev server at `localhost:4200`, proxies `/api` to backend at `localhost:8080`.

**Build.** `npm run build:customer` produces optimized production bundle in `dist/customer-web/browser` with service worker generated.

**Deploy.** Static hosting at `app.matador.com`. SPA fallback to `index.html`. Cache headers: `Cache-Control: public, max-age=31536000, immutable` on hashed assets, `Cache-Control: no-cache` on `index.html` and the service worker. Deployment workflow `.github/workflows/deploy-customer.yml` runs on changes to `projects/customer-web/**`, `projects/shared/**`, or `package.json`.

**Environment variables baked at build time** (in `projects/customer-web/src/environments/environment.production.ts`):

- `apiBase` — e.g., `https://api.matador.com`
- `stripePublishableKey`
- `mapboxAccessToken`
- `googlePlacesApiKey`
- `posthogKey`
- `sentryDsn`

---

## 16. Implementation order

**Phase A — Scaffold (Week 1).**

1. Generate Angular app with PWA, Material, routing.
2. Theme tokens, base components (Button, Card, Sheet, PageHeader).
3. Bottom nav layout, route stubs for all top-level pages.

**Phase B — Onboarding (Week 2).**

4. Auth API + service + interceptors.
5. Welcome, sign-up, sign-in screens.
6. Verification flow with Stripe Identity integration.

**Phase C — Home with browsing (Week 3).**

7. Home Variant A (no active trip): map + vehicle class list.
8. Map component wrapping Mapbox GL JS, zone polygon overlay.
9. Vehicle class browsing + filters.

**Phase D — Booking flow (Week 4).**

10. Plan trip screen with address autocomplete + zone validation.
11. Select car screen.
12. Finalize trip screen with payment methods + Stripe Elements.
13. Confirmation screen.

**Phase E — Inspection & trip lifecycle (Week 5–6).**

14. Photo capture component with angle outlines.
15. Inspection flow + offline queue.
16. Home Variants B (scheduled) and C (active trip).
17. Trip end flow with dropoff inspection.

**Phase F — Profile, history, polish (Week 7).**

18. Profile screens + payment methods management.
19. Trip history list and detail.
20. Lock/unlock, Report, Locate trip actions.
21. Support screen with FAQ.

**Phase G — PWA polish & testing (Week 8).**

22. Service worker config tuning.
23. Install prompt.
24. Analytics events instrumented.
25. E2E test suite.
26. Lighthouse audit and performance pass.

---

## 17. Anti-patterns to avoid

- Do **not** use `localStorage` for tokens or PII.
- Do **not** ship a custom design framework — extend Angular Material primitives.
- Do **not** use NgModules; everything is standalone.
- Do **not** mix RxJS and signals in the same component arbitrarily — use signals for local UI state, RxJS for streams (HTTP, location watching).
- Do **not** call Stripe APIs from your own backend domain code; backend creates intents, frontend confirms with Stripe directly via Stripe.js.
- Do **not** block the UI on geolocation permission — degrade gracefully.
- Do **not** implement deferred features. If a button is in the mockups but in the deferred list, render it disabled or hidden — never half-build the flow.
