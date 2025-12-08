# Tasks: BoxSort Core MVP

**Input**: Design documents from `/specs/001-core-mvp/`  
**Prerequisites**: plan.md ✅, spec.md ✅, research.md ✅, data-model.md ✅, contracts/ ✅

**Tests**: TDD is NON-NEGOTIABLE per constitution. Tests are written FIRST, must FAIL before implementation.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US7)
- Include exact file paths in descriptions

## Path Conventions

All paths relative to project root (`boxsort/`):

- Source: `src/`
- Tests: `tests/`
- Supabase: `supabase/`

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

- [x] T001 Initialize Next.js 15 project with TypeScript in `boxsort/`
- [x] T002 [P] Install core dependencies: @supabase/ssr, @supabase/supabase-js, qrcode.react
- [x] T003 [P] Configure Tailwind CSS in `tailwind.config.ts`
- [x] T004 [P] Configure TypeScript strict mode in `tsconfig.json`
- [x] T005 [P] Configure ESLint and Prettier in `.eslintrc.json` and `.prettierrc`
- [x] T006 [P] Configure Vitest in `vitest.config.ts`
- [x] T007 [P] Configure Playwright in `playwright.config.ts`
- [x] T008 [P] Create environment template `.env.local.example` with Supabase vars
- [x] T009 Create global styles with Tailwind imports in `src/styles/globals.css`
- [x] T010 Create root layout with providers in `src/app/layout.tsx`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

### Database & Supabase Setup

- [x] T011 Create Supabase migration file `supabase/migrations/00001_initial_schema.sql` from contracts/database.sql
- [x] T012 Create seed data file `supabase/seed.sql` with test households, users, boxes, items

### Supabase Client Configuration

- [x] T013 [P] Create browser Supabase client in `src/lib/supabase/client.ts`
- [x] T014 [P] Create server Supabase client in `src/lib/supabase/server.ts`
- [x] T015 [P] Create middleware Supabase client in `src/lib/supabase/middleware.ts`
- [x] T016 Create Supabase TypeScript types in `src/lib/supabase/types.ts`

### Auth Middleware

- [x] T017 Create auth session refresh middleware in `middleware.ts`

### Base UI Components

- [x] T018 [P] Create Button component in `src/components/ui/button.tsx`
- [x] T019 [P] Create Input component in `src/components/ui/input.tsx`
- [x] T020 [P] Create Dialog component in `src/components/ui/dialog.tsx`
- [x] T021 [P] Create Skeleton loader component in `src/components/ui/skeleton.tsx`
- [x] T022 [P] Create Card component in `src/components/ui/card.tsx`

### Core Utilities

- [x] T023 Create funky name generator in `src/lib/utils/name-generator.ts`
- [x] T024 Create QR code utility functions in `src/lib/utils/qr.ts`

### Error Handling

- [x] T025 [P] Create global error boundary in `src/app/error.tsx`
- [x] T026 [P] Create global loading skeleton in `src/app/loading.tsx`
- [x] T027 [P] Create not-found page in `src/app/not-found.tsx`

**Checkpoint**: Foundation ready - user story implementation can now begin

---

## Phase 3: User Story 7 - Household Access (Priority: P2) 🔐

**Goal**: Users can sign up, create/join households, and authenticate to access their data

**Independent Test**: Create account → auto-create household → generate invite → second user joins → both see same data

**Note**: This is P2 priority but MUST be implemented first as all data is scoped to households

### Tests for User Story 7

> **NOTE: Write these tests FIRST, ensure they FAIL before implementation**

- [x] T028 [P] [US7] Unit test for signup flow in `tests/unit/auth.test.ts`
- [x] T029 [P] [US7] Integration test for household creation in `tests/integration/household.test.tsx`
- [x] T030 [P] [US7] E2E test for auth flow in `tests/e2e/auth.spec.ts`

### Implementation for User Story 7

- [x] T031 [P] [US7] Create login page in `src/app/(auth)/login/page.tsx`
- [x] T032 [P] [US7] Create signup page in `src/app/(auth)/signup/page.tsx`
- [x] T033 [US7] Create join household page in `src/app/(auth)/join/[code]/page.tsx`
- [x] T034 [US7] Create auth layout in `src/app/(auth)/layout.tsx`
- [x] T035 [US7] Implement Server Action for signup + household creation in `src/app/(auth)/actions.ts`
- [x] T036 [US7] Implement Server Action for joining household in `src/app/(auth)/actions.ts`
- [x] T037 [US7] Create settings page with invite link generation in `src/app/(dashboard)/settings/page.tsx`
- [x] T038 [US7] Create useUser hook in `src/lib/hooks/use-user.ts`

**Checkpoint**: Users can sign up, login, create households, and invite others

---

## Phase 4: User Story 2 - Add a New Box (Priority: P2) 📦

**Goal**: Users can create boxes with auto-generated funky names and see them in a grid

**Independent Test**: Login → tap "Add Box" → see new box with funky name in grid → tap regenerate → name changes

### Tests for User Story 2

- [x] T039 [P] [US2] Unit test for name generator in `tests/unit/name-generator.test.ts`
- [x] T040 [P] [US2] Integration test for box creation in `tests/integration/boxes.test.tsx`
- [x] T041 [P] [US2] E2E test for add box flow in `tests/e2e/boxes.spec.ts`

### Implementation for User Story 2

- [x] T042 [P] [US2] Create BoxCard component in `src/components/boxes/box-card.tsx`
- [x] T043 [P] [US2] Create BoxGrid component in `src/components/boxes/box-grid.tsx`
- [x] T044 [US2] Create AddBoxDialog component in `src/components/boxes/add-box-dialog.tsx`
- [x] T045 [US2] Create QRCode component in `src/components/boxes/qr-code.tsx`
- [x] T046 [US2] Create useBoxes hook with realtime in `src/lib/hooks/use-boxes.ts`
- [x] T047 [US2] Implement Server Actions for box CRUD in `src/app/(dashboard)/actions.ts`
- [x] T048 [US2] Create dashboard home page with box grid in `src/app/(dashboard)/page.tsx`
- [x] T049 [US2] Create dashboard layout with navigation in `src/app/(dashboard)/layout.tsx`
- [x] T050 [US2] Create Header component with search bar in `src/components/layout/header.tsx`
- [x] T051 [US2] Create Nav component in `src/components/layout/nav.tsx`
- [x] T052 [US2] Create MobileNav component in `src/components/layout/mobile-nav.tsx`

**Checkpoint**: Users can create boxes, see them in grid, regenerate names

---

## Phase 5: User Story 3 - Add Items to a Box (Priority: P2) 📝

**Goal**: Users can add and edit items within a box

**Independent Test**: Select box → tap "Add Item" → enter name → item appears in list → add another quickly → both saved

### Tests for User Story 3

- [x] T053 [P] [US3] Integration test for item creation in `tests/integration/items.test.tsx`
- [x] T054 [P] [US3] E2E test for add item flow in `tests/e2e/items.spec.ts`

### Implementation for User Story 3

- [x] T055 [P] [US3] Create ItemRow component in `src/components/items/item-row.tsx`
- [x] T056 [P] [US3] Create ItemList component in `src/components/items/item-list.tsx`
- [x] T057 [US3] Create AddItemForm component in `src/components/items/add-item-form.tsx`
- [x] T058 [US3] Create useItems hook with realtime in `src/lib/hooks/use-items.ts`
- [x] T059 [US3] Implement Server Actions for item CRUD in `src/app/(dashboard)/boxes/[id]/actions.ts`
- [x] T060 [US3] Create box detail page in `src/app/(dashboard)/boxes/[id]/page.tsx`
- [x] T061 [US3] Add edit item inline functionality in `src/components/items/item-row.tsx`
- [x] T062 [US3] Add move item between boxes feature in `src/components/items/move-item-dialog.tsx`

**Checkpoint**: Users can add, edit, and move items between boxes

---

## Phase 6: User Story 1 - Search for an Item (Priority: P1) 🔍 MVP

**Goal**: Users can search across all items and see which box they're in

**Independent Test**: Type item name in search → results show item name + box name → click result → goes to box

**Note**: This is P1 priority (core value) but depends on boxes/items existing

### Tests for User Story 1

- [x] T063 [P] [US1] Unit test for search debounce in `tests/unit/search.test.ts`
- [x] T064 [P] [US1] Integration test for search results in `tests/integration/search.test.tsx`
- [x] T065 [P] [US1] E2E test for search flow in `tests/e2e/search.spec.ts`

### Implementation for User Story 1

- [x] T066 [P] [US1] Create SearchBar component in `src/components/search/search-bar.tsx`
- [x] T067 [P] [US1] Create SearchResults component in `src/components/search/search-results.tsx`
- [x] T068 [US1] Create useSearch hook with debounce in `src/lib/hooks/use-search.ts`
- [x] T069 [US1] Create search API route in `src/app/api/search/route.ts`
- [x] T070 [US1] Create dedicated search results page in `src/app/(dashboard)/search/page.tsx`
- [x] T071 [US1] Integrate global search bar into Header in `src/components/layout/header.tsx`

**Checkpoint**: At this point, core MVP is functional - Search, Add Box, Add Item all work

---

## Phase 7: User Story 5 - Delete Box or Items (Priority: P3) 🗑️

**Goal**: Users can delete items and boxes (with confirmation for boxes)

**Independent Test**: Delete item → removed from list → Delete box → confirmation dialog → confirm → box and items gone

### Tests for User Story 5

- [x] T072 [P] [US5] Integration test for deletion in `tests/integration/delete.test.tsx`
- [x] T073 [P] [US5] E2E test for delete flow in `tests/e2e/delete.spec.ts`

### Implementation for User Story 5

- [x] T074 [US5] Create ConfirmDialog component in `src/components/ui/confirm-dialog.tsx`
- [x] T075 [US5] Add delete button to ItemRow with Server Action in `src/components/items/item-row.tsx`
- [x] T076 [US5] Add delete box functionality with confirmation in `src/components/boxes/box-card.tsx`
- [x] T077 [US5] Add delete button to box detail page in `src/app/(dashboard)/boxes/[id]/page.tsx`

**Checkpoint**: Users can delete items and boxes with proper confirmations

---

## Phase 8: User Story 4 - Scan QR Code (Priority: P3) 📱

**Goal**: QR codes link to public box page that shows contents

**Independent Test**: Scan QR code with phone camera → opens box page → shows box name and items (even without login)

### Tests for User Story 4

- [x] T078 [P] [US4] E2E test for QR landing page in `tests/e2e/qr-scan.spec.ts`

### Implementation for User Story 4

- [x] T079 [US4] Create public box landing page in `src/app/box/[id]/page.tsx`
- [x] T080 [US4] Create PublicBoxView component in `src/components/boxes/public-box-view.tsx`
- [x] T081 [US4] Handle deleted box (404) in `src/app/box/[id]/not-found.tsx`
- [x] T082 [US4] Add sign-in prompt for full access on public page

**Checkpoint**: QR codes work and show box contents publicly

---

## Phase 9: User Story 6 - Print QR Codes (Priority: P3) 🖨️

**Goal**: Users can print single or multiple QR codes with box names below

**Independent Test**: Click "Print QR" on box → print preview shows QR + name → Select multiple boxes → print sheet with all QRs

### Tests for User Story 6

- [x] T083 [P] [US6] Integration test for print layout in `tests/integration/print.test.tsx`

### Implementation for User Story 6

- [x] T084 [US6] Create PrintableQR component in `src/components/boxes/printable-qr.tsx`
- [x] T085 [US6] Create PrintQRSheet component for batch printing in `src/components/boxes/print-qr-sheet.tsx`
- [x] T086 [US6] Add "Print QR" button to box detail page in `src/app/(dashboard)/boxes/[id]/page.tsx`
- [x] T087 [US6] Add multi-select mode to BoxGrid in `src/components/boxes/box-grid.tsx`
- [x] T088 [US6] Add "Print Selected" action to dashboard in `src/app/(dashboard)/page.tsx`
- [x] T089 [US6] Add print-optimized CSS styles in `src/styles/globals.css`

**Checkpoint**: All user stories complete - full feature set implemented

---

## Phase 10: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [x] T090 [P] Verify all tests pass with `npm run test`
- [x] T091 [P] Verify E2E tests pass with `npm run test:e2e`
- [x] T092 [P] Run build and verify no errors with `npm run build`
- [x] T093 [P] Run type check with `npm run type-check`
- [x] T094 [P] Run lint and fix issues with `npm run lint`
- [x] T095 Validate quickstart.md by following all steps
- [x] T096 [P] Add loading states to all async operations
- [x] T097 [P] Add optimistic updates for better UX
- [x] T098 Performance review: ensure search < 500ms, sync < 2s
- [x] T099 Mobile responsiveness review on all pages
- [x] T100 Accessibility review (keyboard nav, screen readers)

---

## Phase 11: CI/CD Setup (Deferred - Final Step)

**Purpose**: Deployment automation after feature sign-off

**Note**: Per user request, NOT using Vercel

- [ ] T101 Create GitHub Actions workflow in `.github/workflows/ci.yml`
- [ ] T102 Configure lint, test, build steps in CI
- [ ] T103 Configure deployment target (Cloudflare Pages/Railway/Fly.io)
- [ ] T104 Setup Supabase migrations in CI/CD pipeline
- [ ] T105 Configure environment variables for staging/production
- [ ] T106 Document deployment process in `docs/deployment.md`

---

## Dependencies & Execution Order

### Phase Dependencies

```
Phase 1: Setup
    ↓
Phase 2: Foundational ─────┬───────────────────────────────────────────┐
    ↓                      │                                           │
Phase 3: US7 (Auth)        │                                           │
    ↓                      │                                           │
Phase 4: US2 (Add Box) ────┴───→ Phase 5: US3 (Add Items)              │
    ↓                              ↓                                   │
    └──────────────────────→ Phase 6: US1 (Search) 🎯 MVP              │
                               ↓                                       │
                           Phase 7: US5 (Delete)                       │
                               ↓                                       │
                           Phase 8: US4 (QR Scan)                      │
                               ↓                                       │
                           Phase 9: US6 (Print QR)                     │
                               ↓                                       │
                           Phase 10: Polish ←──────────────────────────┘
                               ↓
                           Phase 11: CI/CD (Deferred)
```

### User Story Dependencies

| Story           | Depends On   | Can Parallel With |
| --------------- | ------------ | ----------------- |
| US7 (Auth)      | Foundational | -                 |
| US2 (Add Box)   | US7          | -                 |
| US3 (Add Items) | US2          | -                 |
| US1 (Search)    | US2, US3     | -                 |
| US5 (Delete)    | US2, US3     | US1               |
| US4 (QR Scan)   | US2          | US1, US5          |
| US6 (Print QR)  | US2          | US1, US4, US5     |

### Within Each User Story

1. Tests MUST be written and FAIL before implementation
2. Components before hooks
3. Hooks before pages
4. Server Actions in parallel with components
5. Integration last

### Parallel Opportunities

```bash
# Phase 1 - All setup tasks can run in parallel:
T002, T003, T004, T005, T006, T007, T008

# Phase 2 - Supabase clients in parallel:
T013, T014, T015

# Phase 2 - UI components in parallel:
T018, T019, T020, T021, T022

# Phase 2 - Error handling in parallel:
T025, T026, T027

# Each user story - Tests in parallel:
[US7] T028, T029, T030
[US2] T039, T040, T041
[US3] T053, T054
[US1] T063, T064, T065
```

---

## Implementation Strategy

### MVP First (Phases 1-6)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (CRITICAL - blocks all stories)
3. Complete Phase 3: US7 - Authentication
4. Complete Phase 4: US2 - Add Box
5. Complete Phase 5: US3 - Add Items
6. Complete Phase 6: US1 - Search 🎯
7. **STOP and VALIDATE**: Core MVP is complete

### Incremental Delivery

| Milestone  | Phases | Deliverable                            |
| ---------- | ------ | -------------------------------------- |
| Foundation | 1-2    | Project setup, DB, auth infrastructure |
| Auth       | 3      | User signup, login, households         |
| Boxes      | 4      | Create boxes with funky names          |
| Items      | 5      | Add items to boxes                     |
| **MVP**    | 6      | Search works! Core value delivered     |
| Delete     | 7      | Maintenance capabilities               |
| QR Scan    | 8      | Physical box interaction               |
| Print      | 9      | Label printing                         |
| Polish     | 10     | Production readiness                   |
| Deploy     | 11     | CI/CD automation                       |

---

## Summary

| Metric                     | Count               |
| -------------------------- | ------------------- |
| **Total Tasks**            | 106                 |
| **Setup Tasks**            | 10                  |
| **Foundational Tasks**     | 17                  |
| **US7 (Auth) Tasks**       | 11                  |
| **US2 (Add Box) Tasks**    | 14                  |
| **US3 (Add Items) Tasks**  | 10                  |
| **US1 (Search) Tasks**     | 9                   |
| **US5 (Delete) Tasks**     | 6                   |
| **US4 (QR Scan) Tasks**    | 5                   |
| **US6 (Print QR) Tasks**   | 7                   |
| **Polish Tasks**           | 11                  |
| **CI/CD Tasks**            | 6                   |
| **Parallel Opportunities** | 45 tasks marked [P] |

---

## Notes

- [P] tasks = different files, no dependencies within phase
- [Story] label maps task to specific user story for traceability
- TDD enforced: Tests written first, must fail before implementation
- Commit after each task or logical group
- Stop at any checkpoint to validate independently
- CI/CD is intentionally last per user request
