# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm start          # Dev server at http://localhost:4200
npm run build      # Production build to dist/
npm run watch      # Dev build with watch mode
npm run format     # Format all JS/TS/HTML with Prettier
npm test           # Run unit tests via Karma
```

To generate a component: `ng generate component path/component-name`

## Architecture Overview

This is an **Angular 21 CRM application** (standalone components, zoneless change detection) for managing sales opportunities (oportunidades), leads, tasks, and commercial activity at Zenware.

### Authentication

Two auth paths coexist:
1. **Custom login** — username/password via `POST /Login/validausuario`, stores session in `localStorage` under the key `ZENWARE_OPOR` as `I_rptaDataLogin`.
2. **Azure AD (MSAL)** — configured in [src/app.config.ts](src/app.config.ts) with `@azure/msal-angular`. The redirect URI is `http://localhost:4200/auth`.

On app init, `AppComponent` reads `localStorage` via `LocalStorageService` and populates the `constantesLocalStorage` singleton (see [src/app/pages/model/constantes.ts](src/app/pages/model/constantes.ts)), which is used as a global session store throughout the app.

### Routing

All routes are lazy-loaded children of `AppLayout` (the shell), except `/auth` which renders standalone. Route paths map 1:1 to subdirectories under `src/app/pages/`.

### Data Layer

- **API base URL**: configured in `src/environments/environment.ts` (`webAPI`). Switch comments for dev vs. prod endpoints.
- **All API constants** live in [src/app/pages/model/apiVariables.ts](src/app/pages/model/apiVariables.ts) — keyed by feature, namespaced by controller (`Crm`, `Main`, `Comercial`, `Archivo`, etc.).
- **Per-feature services** (e.g., `OportunidadService`, `KanbanService`) make HTTP calls using those constants. There is also a shared `ShareService` for cross-cutting lookups.
- API responses typically conform to `I_respuestaGeneral` (`{ estado, mensaje, respuestaData }`) or `I_RespuestaProceso` for stored-procedure results.

### Key Shared Infrastructure

| File | Purpose |
|---|---|
| [src/app/pages/model/interfaces.ts](src/app/pages/model/interfaces.ts) | All TypeScript interfaces (KanbanCard, KanbanList, Tasks, Contacto, Cliente, Cotizacion, etc.) |
| [src/app/pages/model/constantes.ts](src/app/pages/model/constantes.ts) | Global session state (`constantesLocalStorage`), spinner/toast/confirm message strings |
| [src/app/pages/model/apiVariables.ts](src/app/pages/model/apiVariables.ts) | All backend endpoint URLs |
| [src/app/pages/shared/primeng_modules.ts](src/app/pages/shared/primeng_modules.ts) | Barrel of all PrimeNG/CDK imports — import `PRIMENG_MODULES` instead of individual modules |
| [src/app/pages/service/utilitarios.service.ts](src/app/pages/service/utilitarios.service.ts) | Date helpers, Excel/PDF download, form validation helpers, clipboard parsing |
| [src/app/pages/service/localStorage.service.ts](src/app/pages/service/localStorage.service.ts) | Session read/write for `ZENWARE_OPOR` localStorage key |
| [src/app/pages/model/swal.service.ts](src/app/pages/model/swal.service.ts) | SweetAlert2 wrapper for confirmations, loading modals, success/error/warning dialogs |

### Layout

`AppLayout` ([src/app/layout/components/app.layout.ts](src/app/layout/components/app.layout.ts)) is the authenticated shell: topbar, sidebar, breadcrumb, right-menu, footer, and a `<p-toast>` outlet. Layout state (menu mode, dark theme) is managed by `LayoutService` using Angular signals.

The sidebar menu is defined in [src/app/layout/components/app.menu.ts](src/app/layout/components/app.layout.ts) and lists all CRM modules.

### UI Stack

- **PrimeNG 21** with Material preset, indigo primary palette. Always import via `PRIMENG_MODULES` barrel.
- **TailwindCSS 4** + PrimeFlex 4 for layout utilities.
- **ngx-echarts** (lazy-loaded) for charts. **Chart.js** with `chartjs-plugin-datalabels` also available.
- Locale is `es-PE` throughout (dates, numbers, PrimeNG translation strings).

### Path Alias

`@/*` maps to `src/*` (configured in [tsconfig.json](tsconfig.json)), so `import ... from '@/app/...'` is equivalent to `import ... from 'src/app/...'`.

### Spinner Pattern

Components use a `blockedDocument = signal(false)` + `<c-progress-spinner>` component to show loading state. Set it with the local `setSpinner(valor: boolean)` helper that is copied into each component.
