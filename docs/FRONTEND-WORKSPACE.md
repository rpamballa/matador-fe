# Matador Frontend Workspace — Specification

> Workspace-level setup for `matador-web`. Read `PROJECT.md` first. Read this **before** the per-app specs (`FRONTEND-ADMIN.md`, `FRONTEND-CUSTOMER.md`).

---

## 1. Purpose

`matador-web` is a single Angular 19 workspace containing:

- **`admin-web`** — internal operations console (see `FRONTEND-ADMIN.md`)
- **`customer-web`** — customer-facing Progressive Web App (see `FRONTEND-CUSTOMER.md`)
- **`shared`** — Angular library consumed by both apps; provides components, services, models, and the generated API client

This document covers everything that's **not specific to one app**: the workspace layout, the shared library, tooling, OpenAPI client generation, build commands, deployment, and CI.

---

## 2. Tech stack (workspace-level)

| Layer | Choice | Version |
|---|---|---|
| Framework | Angular | 19.x |
| Language | TypeScript | 5.4+ |
| Package manager | npm | 10+ |
| Build | Angular CLI (esbuild builder) | bundled |
| Test runner | Jest (via `@angular-builders/jest`) | latest |
| E2E test runner | Playwright | latest |
| Linting | ESLint with `@angular-eslint` | latest |
| Formatting | Prettier | latest |
| Git hooks | Husky + lint-staged | latest |
| OpenAPI codegen | `openapi-typescript` for types + custom Angular service wrapper, OR `ng-openapi-gen` for full client | latest |
| Mapping | Mapbox GL JS | 3.x |
| Date handling | Luxon | 3.x |
| HTTP | Angular `HttpClient` | bundled |

**One `package.json` at the workspace root.** All dependencies installed once, available to all projects. No nested `node_modules`.

**Angular features used:**

- Standalone components (no NgModules)
- Signals for local state, RxJS for streams
- `inject()` function for DI (no constructor injection in new code)
- Deferred views (`@defer`) where appropriate
- OnPush change detection by default on all components

---

## 3. Workspace setup

### 3.1 Creation commands

```bash
# Create empty workspace (no initial app)
npx @angular/cli@19 new matador-web --create-application=false --style=scss --skip-git

cd matador-web

# Create the three projects
ng generate application admin-web --routing --style=scss --standalone
ng generate application customer-web --routing --style=scss --standalone
ng generate library shared --skip-install

# Add PWA support to customer-web only
ng add @angular/pwa --project=customer-web
```

After generation, the workspace `angular.json` defines three projects. Verify with `ng config projects`.

### 3.2 Path mapping

Configure `tsconfig.json` (workspace root) with a path alias so both apps import from the shared library as `@matador/shared`:

```json
{
  "compilerOptions": {
    "paths": {
      "@matador/shared": ["projects/shared/src/public-api.ts"],
      "@matador/shared/*": ["projects/shared/src/lib/*"]
    }
  }
}
```

Both apps import like:

```typescript
import { MoneyPipe, AuthInterceptor, BookingDto } from '@matador/shared';
```

Never import directly from `projects/shared/src/lib/...`; only the public API.

### 3.3 Strict TypeScript

Set `strict: true` in `tsconfig.base.json`. Both apps and the shared library extend it. Specifically enable:

```json
{
  "strict": true,
  "noImplicitOverride": true,
  "noPropertyAccessFromIndexSignature": true,
  "noImplicitReturns": true,
  "noFallthroughCasesInSwitch": true,
  "strictTemplates": true
}
```

---

## 4. The shared library

`projects/shared/` is the connective tissue between admin and customer. Its purpose: **anything used by both apps lives here.** Anything used by only one app lives in that app.

### 4.1 What goes in `shared`

| Category | Examples |
|---|---|
| **API client** | Generated from `openapi.json`. DTO types, typed Angular services per resource. |
| **Domain models** | TypeScript types for `Money`, `GeoPoint`, `DateRange`, status enums. |
| **HTTP utilities** | Generic error interceptor, retry interceptor, loading interceptor, RFC 7807 problem detail handling. |
| **Auth abstractions** | Auth service base classes, role types, JWT helpers (concrete implementations live in each app). |
| **UI primitives** | `<m-button>`, `<m-card>`, `<m-badge>`, `<m-empty-state>`, `<m-loading-spinner>`, `<m-confirm-dialog>` — consistent visual identity across apps. |
| **Maps** | `<m-map>` component wrapping Mapbox GL JS with markers, polygons, routes. |
| **Forms** | `<m-address-input>` (Google Places autocomplete), `<m-money-input>`, `<m-date-range-input>`. |
| **Pipes** | `MoneyPipe`, `DurationPipe`, `DistancePipe`, `LocalDatePipe`, `TitleCasePipe`. |
| **Utility services** | Toast service, confirmation service, theme service. |
| **Theme tokens** | Root CSS variables and SCSS mixins (see § 6). |
| **Domain helpers** | Pricing math, geofence calculations (client-side check before server), date/duration helpers. |
| **Test utilities** | Test fixtures, mock factories, HTTP test helpers. |

### 4.2 What stays in each app

| Category | Reasoning |
|---|---|
| **Routes and route guards** | Each app has its own routing tree. |
| **Feature components and screens** | Apps have different features. |
| **App-specific theme variants** | Admin uses muted accent; customer uses bolder brand red (see § 6). |
| **App shell** | Admin has sidebar nav; customer has bottom nav. |
| **Service worker config** | Customer is PWA; admin is not. |
| **PWA install prompts** | Customer-only. |
| **Analytics instrumentation** | PostHog is customer-only. Admin has minimal analytics. |

### 4.3 Library structure

```
projects/shared/
├── ng-package.json
├── tsconfig.lib.json
├── tsconfig.spec.json
├── src/
│   ├── public-api.ts             # Single export surface
│   └── lib/
│       ├── api-client/           # Generated from openapi.json (DO NOT EDIT)
│       │   ├── README.md         # Explains regeneration command
│       │   ├── models/
│       │   └── services/
│       ├── auth/                 # AuthBase, role types
│       ├── http/                 # Interceptors
│       ├── models/               # Money, GeoPoint, etc.
│       ├── ui/                   # Components
│       │   ├── button/
│       │   ├── card/
│       │   ├── badge/
│       │   ├── empty-state/
│       │   ├── confirm-dialog/
│       │   ├── map/
│       │   └── address-input/
│       ├── pipes/
│       ├── services/             # Toast, confirmation, theme
│       ├── theme/                # tokens.scss, mixins.scss
│       └── testing/              # Mock factories
```

The `public-api.ts` re-exports everything intended for app use. Internal helpers within the library use relative imports; consumers go through `@matador/shared`.

### 4.4 Component naming

Shared components use the `m-` prefix (Matador): `<m-button>`, `<m-card>`. App-specific components use the app prefix: `<admin-vehicle-row>`, `<customer-trip-card>`. ESLint enforces this via `@angular-eslint/component-selector`.

### 4.5 Versioning the shared library

For Phase 1, the shared library is consumed in-place via the path alias — no separate npm publish, no version pinning. This is simplest and correct for a small team.

If at some point you split admin and customer into separate repos, the library will need to be published to a private npm registry. Defer that decision.

---

## 5. OpenAPI client generation

### 5.1 Why generated, not hand-written

A hand-written API client means: every backend change requires a corresponding manual frontend type update, and drift is inevitable. With generated clients, the type system catches mismatches at compile time on the next regeneration.

### 5.2 Tooling choice

Use **`ng-openapi-gen`** (recommended) — it produces Angular-idiomatic services using `HttpClient`, plus TypeScript model interfaces. Alternative: `openapi-typescript` for types only, with a hand-written thin service layer. Pick one; do not mix.

If using `ng-openapi-gen`, install as a dev dependency:

```bash
npm install --save-dev ng-openapi-gen
```

Configuration file `ng-openapi-gen.json` at workspace root:

```json
{
  "input": "openapi.json",
  "output": "projects/shared/src/lib/api-client",
  "ignoreUnusedModels": true,
  "indexFile": true,
  "skipJsonSuffix": true,
  "templates": "ng-openapi-gen-templates",
  "removeStaleFiles": true
}
```

### 5.3 Regeneration workflow

1. Download the target `openapi.json` from the backend release:
   ```bash
   curl -o openapi.json https://github.com/<org>/matador-backend/releases/download/v1.4.2/openapi.json
   ```
2. Regenerate the client:
   ```bash
   npm run api:generate
   ```
   where the package.json script runs `ng-openapi-gen`.
3. Commit the generated files. The commit message should reference the backend version.
4. Update any consuming code to match the new contract.
5. Add an entry to `CHANGELOG.md`.

Store the version of the consumed contract in `package.json`:

```json
{
  "matador": {
    "backendApiVersion": "1.4.2"
  }
}
```

### 5.4 Generated code rules

- **Never hand-edit files in `projects/shared/src/lib/api-client/`.** They are regenerated wholesale.
- **Always go through the generated services.** Do not call `HttpClient` directly for backend APIs.
- **Augment, don't replace.** If you need a higher-level operation (e.g., "complete the entire booking flow including Stripe confirmation"), build a separate service in `projects/shared/src/lib/services/` that composes the generated services.

---

## 6. Theme and design tokens

### 6.1 Shared tokens

`projects/shared/src/lib/theme/tokens.scss` defines the base design tokens as CSS custom properties scoped to `:root`. Both apps import this file.

```scss
:root {
  /* color tokens */
  --m-color-primary: #D94251;            /* Matador brand red */
  --m-color-primary-dark: #B0303D;
  --m-color-primary-light: #E55B6E;
  --m-color-primary-soft: #F8E5E7;
  --m-color-zone-fill: rgba(76, 175, 80, 0.12);
  --m-color-zone-stroke: #4CAF50;
  --m-color-surface: #FFFFFF;
  --m-color-background: #F7F7F8;
  --m-color-text-primary: #111418;
  --m-color-text-secondary: #5A6270;
  --m-color-text-muted: #9CA3AF;
  --m-color-border: #E5E7EB;
  --m-color-success: #16A34A;
  --m-color-warning: #D97706;
  --m-color-danger: #DC2626;

  /* radius tokens */
  --m-radius-sm: 4px;
  --m-radius-md: 8px;
  --m-radius-lg: 12px;
  --m-radius-pill: 999px;

  /* shadow tokens */
  --m-shadow-sm: 0 1px 2px rgba(0,0,0,0.06);
  --m-shadow-md: 0 2px 8px rgba(0,0,0,0.08);
  --m-shadow-card: 0 1px 3px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.04);
  --m-shadow-sheet: 0 -4px 16px rgba(0,0,0,0.08);

  /* spacing tokens — 4px scale */
  --m-space-1: 4px;
  --m-space-2: 8px;
  --m-space-3: 12px;
  --m-space-4: 16px;
  --m-space-5: 20px;
  --m-space-6: 24px;
  --m-space-8: 32px;
  --m-space-10: 40px;
  --m-space-12: 48px;

  /* safe-area for mobile */
  --m-safe-top: env(safe-area-inset-top, 0);
  --m-safe-bottom: env(safe-area-inset-bottom, 0);
}
```

### 6.2 App-level overrides

Each app's root `styles.scss` imports the shared tokens, then may override or extend for the app's visual identity.

```scss
/* projects/customer-web/src/styles.scss */
@import '@matador/shared/theme/tokens.scss';

:root {
  /* customer app uses the brand red as-is */
  --m-color-primary: #D94251;
}
```

```scss
/* projects/admin-web/src/styles.scss */
@import '@matador/shared/theme/tokens.scss';

:root {
  /* admin tones down the red slightly for professional density */
  --m-color-primary: #C8324A;
  --m-color-background: #F7F7F8;
}
```

### 6.3 Typography

Both apps use the system font stack defined in shared `tokens.scss`. Override per-app only if needed.

### 6.4 Component theming rule

Shared components (`<m-*>`) reference CSS custom properties exclusively — never hard-coded colors. This means an app can override `--m-color-primary` and every shared component picks up the change automatically.

---

## 7. Linting & formatting

### 7.1 ESLint

Single `.eslintrc.json` at workspace root, applied to all projects. Configure `@angular-eslint`, `@typescript-eslint`, and a custom rule enforcing the `m-` prefix on shared components and `admin-` / `customer-` on app components.

### 7.2 Prettier

Single `.prettierrc` at workspace root:

```json
{
  "singleQuote": true,
  "trailingComma": "all",
  "printWidth": 100,
  "tabWidth": 2,
  "semi": true
}
```

### 7.3 Git hooks

Use Husky + lint-staged for pre-commit:

```json
{
  "lint-staged": {
    "*.{ts,html}": ["eslint --fix"],
    "*.{ts,html,scss,json,md}": ["prettier --write"]
  }
}
```

Add a pre-push hook that runs `npm test` for changed projects.

---

## 8. Testing

### 8.1 Unit tests (Jest)

Configure `@angular-builders/jest` for both apps and the shared library. Run all tests with:

```bash
npm test                     # all projects
npm test admin-web           # one project
npm test shared              # shared library
```

### 8.2 E2E tests (Playwright)

Playwright at workspace root, with separate test suites per app:

```
e2e/
├── admin/
│   ├── auth.spec.ts
│   ├── booking-creation.spec.ts
│   └── inspection-review.spec.ts
└── customer/
    ├── signup.spec.ts
    ├── booking-flow.spec.ts
    └── inspection-capture.spec.ts
```

Run via `npm run e2e:admin` or `npm run e2e:customer`.

E2E tests run against a docker-composed backend with seeded fixtures. Playwright config supports running headed locally and headless in CI.

### 8.3 Coverage targets

- Shared library: 80%+ on services, 70%+ overall.
- App services: 70%+.
- Critical e2e flows: 100% (signup, booking, inspection, trip end).

---

## 9. Build & deploy

### 9.1 Build commands

```bash
# Development
npm run start:admin         # ng serve admin-web --port 4201
npm run start:customer      # ng serve customer-web --port 4200

# Production builds
npm run build:admin         # ng build admin-web --configuration=production
npm run build:customer      # ng build customer-web --configuration=production

# Build everything
npm run build:all

# Lint
npm run lint

# Test
npm test
```

Each app builds into its own `dist/<app>/browser` folder. Builds are independent — you can deploy admin without touching customer.

### 9.2 Environments

Each app has `src/environments/environment.ts` (dev) and `environment.production.ts`. Angular's `fileReplacements` configuration swaps them per build.

```typescript
// projects/customer-web/src/environments/environment.production.ts
export const environment = {
  production: true,
  apiBase: 'https://api.matador.com',
  stripePublishableKey: 'pk_live_...',
  mapboxAccessToken: 'pk.eyJ1...',
  googlePlacesApiKey: 'AIza...',
  posthogKey: 'phc_...',
  sentryDsn: 'https://...@sentry.io/...'
};
```

Never commit real production keys. Use CI environment variables and `envsubst` at build time, or commit publishable-only keys (Stripe pk_live, Mapbox pk_*, Google Maps API keys with HTTP referrer restrictions are safe to commit).

### 9.3 Deployment targets

Both apps deploy as static SPAs. Recommended hosts:

- **Cloudflare Pages** — preferred. Free tier generous, edge caching, SPA fallback configurable.
- **Netlify** — alternative.
- **AWS S3 + CloudFront** — if AWS-aligned.

SPA fallback rule: every non-existent path serves `index.html`. Cache headers:

- Hashed assets (`*.[hash].js`, `*.[hash].css`): `Cache-Control: public, max-age=31536000, immutable`
- `index.html`: `Cache-Control: no-cache`
- Service worker (customer-web only): `Cache-Control: no-cache`

### 9.4 Independent deploys

Admin and customer deploy independently. CI workflows are separated:

- `.github/workflows/deploy-admin.yml` — triggered on changes to `projects/admin-web/**`, `projects/shared/**`, `package.json`, or manual dispatch.
- `.github/workflows/deploy-customer.yml` — triggered on changes to `projects/customer-web/**`, `projects/shared/**`, `package.json`, or manual dispatch.

Both workflows install once at the root and build the target app.

---

## 10. CI/CD

Workflow on every PR (`.github/workflows/ci.yml`):

```yaml
- checkout
- setup node 20
- npm ci
- npm run lint
- npm test
- npm run build:all
- (on PR) Playwright e2e against ephemeral backend
```

Workflow on merge to main: build and deploy to staging.

Workflow on tag (`v*`): build and deploy to production with manual approval gate.

---

## 11. Implementation order

The workspace and shared library should be scaffolded **first**, before either app is fleshed out. This ensures both apps grow against a consistent foundation.

**Phase 0 — Workspace scaffold (Week 1).**

1. `ng new matador-web --create-application=false`
2. Generate the three projects (admin-web, customer-web, shared).
3. Configure `tsconfig.base.json`, ESLint, Prettier, Husky, lint-staged.
4. Set up Jest builder for all projects.
5. Configure path alias `@matador/shared`.
6. Add `ng-openapi-gen` and run with a stub `openapi.json` to verify the pipeline.
7. Set up Playwright with a single placeholder test per app.
8. Set up GitHub Actions for lint, test, build.
9. Configure environment files for both apps.

**Phase 1 — Shared library foundation (Week 1).**

10. Create theme tokens in `projects/shared/src/lib/theme/tokens.scss`.
11. Create base `m-button`, `m-card`, `m-badge`, `m-empty-state` components.
12. Create `MoneyPipe`, `LocalDatePipe`, `DurationPipe`.
13. Create HTTP interceptors (error, credentials, loading) and toast service.
14. Create `m-map` component wrapping Mapbox GL JS.
15. Generate the initial API client from a real backend `openapi.json`.

**Phase 2 — Per-app builds (Week 2+).**

16. Proceed with `FRONTEND-ADMIN.md` § 12 Phase A onwards.
17. Proceed with `FRONTEND-CUSTOMER.md` § 16 Phase A onwards.

These two app implementations can proceed in parallel if you have multiple contributors, or sequentially (admin first is the conventional choice since it lets you run real operations sooner).

---

## 12. Anti-patterns to avoid

- Do **not** duplicate code across `admin-web` and `customer-web`. If you find yourself copy-pasting, lift it into `shared`.
- Do **not** hand-write API DTOs that the backend already exposes via OpenAPI. Regenerate the client.
- Do **not** import from `projects/shared/src/lib/...` paths directly. Use `@matador/shared`.
- Do **not** put feature-specific code in `shared`. If only one app uses it, keep it in that app.
- Do **not** maintain two `package.json` files. The workspace has one.
- Do **not** override CSS custom properties locally in components when the override should be a token. Add or modify the token.
- Do **not** ship NgModules. Standalone components only.
- Do **not** use `localStorage` for tokens or PII in either app.
