# Implementation Plan: BoxSort Core MVP

**Branch**: `001-core-mvp` | **Date**: 2025-12-08 | **Spec**: [spec.md](./spec.md)  
**Input**: Feature specification from `/specs/001-core-mvp/spec.md`

## Summary

Build a household box inventory management system with real-time multi-user support. Users can create boxes with auto-generated funky names, add items, search across all items, generate printable QR codes, and share access with household members. The system uses Next.js App Router with Supabase for authentication, database, and real-time sync.

## Technical Context

**Language/Version**: TypeScript 5.x (strict mode)  
**Framework**: Next.js 15+ with App Router  
**Primary Dependencies**: @supabase/ssr, @supabase/supabase-js, qrcode.react, Tailwind CSS  
**Storage**: PostgreSQL via Supabase  
**Testing**: Vitest + React Testing Library + Playwright (E2E)  
**Target Platform**: Web (responsive, mobile-first)  
**Project Type**: Web application (fullstack Next.js)  
**Performance Goals**: Search < 500ms, Real-time sync < 2s, Page load < 3s  
**Constraints**: 100 boxes / 1000 items per household, 2-10 users per household  
**Scale/Scope**: Household scale (small groups), ~5 core pages

## Constitution Check

_GATE: Must pass before Phase 0 research. Re-check after Phase 1 design._

| Principle                           | Status  | Evidence                                                                                   |
| ----------------------------------- | ------- | ------------------------------------------------------------------------------------------ |
| **I. User-First Simplicity**        | ✅ Pass | All features ≤3 clicks from home: Add Box (1), Add Item (2), Search (1), Print QR (2)      |
| **II. Searchability as Primary**    | ✅ Pass | Global search bar on all pages, real-time typeahead, full-text search on items/boxes       |
| **III. Shared Household Database**  | ✅ Pass | Supabase PostgreSQL + Realtime for multi-user sync, RLS for household isolation            |
| **IV. Test-Driven Development**     | ✅ Pass | Vitest for unit/integration tests, Playwright for E2E, tests written before implementation |
| **V. Progressive Feature Delivery** | ✅ Pass | Phase 1 MVP delivers all core features; Phase 2 (AI/images) separate and additive          |

## Project Structure

### Documentation (this feature)

```text
specs/001-core-mvp/
├── plan.md              # This file
├── research.md          # Phase 0 output - technology decisions
├── data-model.md        # Phase 1 output - entity schemas
├── quickstart.md        # Phase 1 output - local development guide
├── contracts/           # Phase 1 output - API specifications
│   ├── database.sql     # Supabase schema + RLS policies
│   └── api-routes.md    # Next.js API route specifications
└── tasks.md             # Phase 2 output (/speckit.tasks command)
```

### Source Code (repository root)

```text
boxsort/
├── src/
│   ├── app/                      # Next.js App Router
│   │   ├── (auth)/               # Auth route group
│   │   │   ├── login/page.tsx
│   │   │   ├── signup/page.tsx
│   │   │   └── join/[code]/page.tsx
│   │   ├── (dashboard)/          # Protected route group
│   │   │   ├── layout.tsx        # Dashboard layout with nav + search
│   │   │   ├── page.tsx          # Home - box grid view
│   │   │   ├── boxes/
│   │   │   │   └── [id]/page.tsx # Box detail + items
│   │   │   ├── search/page.tsx   # Search results page
│   │   │   └── settings/page.tsx # Household settings + invite
│   │   ├── box/[id]/page.tsx     # Public QR landing page (no auth required)
│   │   ├── api/                   # API routes
│   │   │   ├── boxes/route.ts
│   │   │   ├── items/route.ts
│   │   │   └── invite/route.ts
│   │   ├── layout.tsx            # Root layout
│   │   ├── loading.tsx           # Global loading skeleton
│   │   ├── error.tsx             # Global error boundary
│   │   └── not-found.tsx
│   ├── components/
│   │   ├── ui/                   # Base UI components
│   │   │   ├── button.tsx
│   │   │   ├── input.tsx
│   │   │   ├── dialog.tsx
│   │   │   ├── skeleton.tsx
│   │   │   └── ...
│   │   ├── boxes/
│   │   │   ├── box-card.tsx
│   │   │   ├── box-grid.tsx
│   │   │   ├── add-box-dialog.tsx
│   │   │   └── qr-code.tsx
│   │   ├── items/
│   │   │   ├── item-list.tsx
│   │   │   ├── add-item-form.tsx
│   │   │   └── item-row.tsx
│   │   ├── search/
│   │   │   ├── search-bar.tsx
│   │   │   └── search-results.tsx
│   │   └── layout/
│   │       ├── nav.tsx
│   │       ├── header.tsx
│   │       └── mobile-nav.tsx
│   ├── lib/
│   │   ├── supabase/
│   │   │   ├── client.ts         # Browser client
│   │   │   ├── server.ts         # Server component client
│   │   │   ├── middleware.ts     # Middleware client
│   │   │   └── types.ts          # Generated DB types
│   │   ├── utils/
│   │   │   ├── name-generator.ts # Funky name generator
│   │   │   └── qr.ts             # QR code utilities
│   │   └── hooks/
│   │       ├── use-boxes.ts      # Box data + realtime
│   │       ├── use-items.ts      # Items data + realtime
│   │       └── use-search.ts     # Search with debounce
│   └── styles/
│       └── globals.css           # Tailwind imports + custom styles
├── tests/
│   ├── unit/
│   │   ├── name-generator.test.ts
│   │   └── utils.test.ts
│   ├── integration/
│   │   ├── boxes.test.tsx
│   │   ├── items.test.tsx
│   │   └── search.test.tsx
│   └── e2e/
│       ├── auth.spec.ts
│       ├── boxes.spec.ts
│       └── search.spec.ts
├── supabase/
│   ├── migrations/               # Database migrations
│   │   └── 00001_initial_schema.sql
│   └── seed.sql                  # Test data
├── public/
│   └── ...
├── middleware.ts                 # Auth session refresh
├── next.config.ts
├── tailwind.config.ts
├── tsconfig.json
├── vitest.config.ts
├── playwright.config.ts
├── package.json
└── .env.local.example
```

**Structure Decision**: Next.js App Router with route groups for auth/dashboard separation. Supabase handles all backend logic via RLS policies and edge functions (if needed). No separate backend - fullstack Next.js with Supabase BaaS.

## Complexity Tracking

No violations detected. Architecture follows simplest path:

- Single Next.js application (no microservices)
- Supabase BaaS eliminates custom backend
- RLS policies for security (no custom auth middleware)
- Real-time via Supabase channels (no WebSocket infrastructure)

## CI/CD Plan (Deferred)

Per user request, CI/CD setup will be the **final step** after all features are signed off.

**Planned approach** (not Vercel):

- GitHub Actions for CI (lint, test, build)
- Deployment target TBD (Cloudflare Pages, Railway, Fly.io, or self-hosted)
- Database migrations via Supabase CLI in pipeline
- Environment-based config (staging → production)

This will be implemented as a separate task after MVP completion.
