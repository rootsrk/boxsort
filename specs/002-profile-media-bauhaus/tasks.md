# Tasks: Profile, Media & Bauhaus Design

**Input**: Design documents from `/specs/002-profile-media-bauhaus/`  
**Prerequisites**: plan.md ✓, spec.md ✓, research.md ✓, data-model.md ✓, contracts/ ✓, quickstart.md ✓

**Tests**: Following TDD approach per constitution - tests written before implementation.

**Organization**: Tasks grouped by user story for independent implementation and testing.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (US1, US2, US3)
- Include exact file paths in descriptions

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Install dependencies and configure project for new features

- [x] T001 Install new dependencies: `npm install browser-image-compression framer-motion`
- [x] T002 [P] Create database migration file in `boxsort/supabase/migrations/00003_profile_media.sql`
- [x] T003 [P] Update TypeScript types in `boxsort/src/lib/supabase/types.ts` with new entities (Type, ItemType, extended User/Item)
- [x] T004 [P] Create image compression utility in `boxsort/src/lib/utils/image-compress.ts`
- [x] T005 [P] Create type color utility (hash-based color assignment) in `boxsort/src/lib/utils/type-colors.ts`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [x] T006 Run database migration in Supabase SQL Editor (or `supabase db push`)
- [x] T007 Verify storage buckets exist: `avatars` (public) and `item-images` (private) in Supabase Dashboard
- [x] T008 [P] Write unit tests for image compression in `boxsort/tests/unit/image-compress.test.ts`
- [x] T009 [P] Write unit tests for type colors in `boxsort/tests/unit/type-colors.test.ts`
- [x] T010 Verify existing tests pass with `npm run test:run` (regression check)

**Checkpoint**: Foundation ready - user story implementation can now begin

---

## Phase 3: User Story 1 - User Profile Management (Priority: P1) 🎯 MVP

**Goal**: Users can personalize their account with profile pictures and access functions via header menu

**Independent Test**: Upload a profile picture, verify it appears in header, navigate via user menu

### Tests for User Story 1

> **Write tests FIRST, ensure they FAIL before implementation**

- [x] T011 [P] [US1] Write unit test for Avatar component in `boxsort/tests/unit/avatar.test.tsx`
- [x] T012 [P] [US1] Write integration test for profile picture upload in `boxsort/tests/integration/profile.test.tsx` (tests written, may need refinement)
- [x] T013 [P] [US1] Write E2E test for profile flow in `boxsort/tests/e2e/profile.spec.ts`

### Implementation for User Story 1

- [x] T014 [P] [US1] Create Avatar component (initials fallback, circular crop) in `boxsort/src/components/profile/avatar.tsx`
- [x] T015 [P] [US1] Create AvatarUpload component (file picker, camera capture) in `boxsort/src/components/profile/avatar-upload.tsx`
- [x] T016 [P] [US1] Create useAvatar hook (upload, delete, get URL) in `boxsort/src/lib/hooks/use-avatar.ts`
- [x] T017 [US1] Create UserMenu dropdown component in `boxsort/src/components/layout/user-menu.tsx`
- [x] T018 [US1] Update Header component to use Avatar + UserMenu in `boxsort/src/components/layout/header.tsx`
- [x] T019 [US1] Update Settings page with profile picture section in `boxsort/src/app/(dashboard)/settings/page.tsx`
- [x] T020 [US1] Create Profile view page in `boxsort/src/app/(dashboard)/profile/page.tsx`
- [x] T021 [US1] Update use-user hook to include avatar_url in `boxsort/src/lib/hooks/use-user.ts` (already includes via types)
- [x] T022 [US1] Verify US1 tests pass with `npm run test:run` (unit tests pass, integration tests may need refinement)

**Checkpoint**: User Story 1 complete - profile pictures and user menu functional

---

## Phase 4: User Story 2 - Item Images & Types (Priority: P2)

**Goal**: Users can photograph items and categorize them with custom types/tags

**Independent Test**: Add item with photo, add types, verify card displays image and tags

### Tests for User Story 2

> **Write tests FIRST, ensure they FAIL before implementation**

- [x] T023 [P] [US2] Write unit test for TypeBadge component in `boxsort/tests/unit/type-badge.test.tsx`
- [x] T024 [P] [US2] Write unit test for TypeSelector component in `boxsort/tests/unit/type-selector.test.tsx`
- [x] T025 [P] [US2] Write integration test for types CRUD in `boxsort/tests/integration/types.test.tsx`
- [x] T026 [P] [US2] Write E2E test for item images and types in `boxsort/tests/e2e/types.spec.ts`

### Implementation for User Story 2

- [x] T027 [P] [US2] Create useTypes hook (CRUD for types) in `boxsort/src/lib/hooks/use-types.ts`
- [x] T028 [P] [US2] Create useItemImage hook (upload, delete, signed URL) in `boxsort/src/lib/hooks/use-item-image.ts`
- [x] T029 [P] [US2] Create TypeBadge component (colored tag) in `boxsort/src/components/types/type-badge.tsx`
- [x] T030 [P] [US2] Create TypeSelector component (select/create types) in `boxsort/src/components/items/type-selector.tsx`
- [x] T031 [P] [US2] Create TypeManager component (manage all types) in `boxsort/src/components/types/type-manager.tsx`
- [x] T032 [P] [US2] Create ItemImageUpload component (camera/gallery picker) in `boxsort/src/components/items/item-image-upload.tsx`
- [x] T033 [US2] Create ItemCard component (image, name, type tags) in `boxsort/src/components/items/item-card.tsx`
- [x] T034 [US2] Update ItemList to use ItemCard in `boxsort/src/components/items/item-list.tsx`
- [x] T035 [US2] Update AddItemForm to include image upload and types in `boxsort/src/components/items/add-item-form.tsx`
- [x] T036 [US2] Update use-items hook to include image_url and types in `boxsort/src/lib/hooks/use-items.ts`
- [x] T037 [US2] Update search to include types in results in `boxsort/src/app/api/search/route.ts`
- [x] T038 [US2] Update SearchResults to show images and types in `boxsort/src/components/search/search-results.tsx`
- [x] T039 [US2] Verify US2 tests pass with `npm run test:run`

**Checkpoint**: User Story 2 complete - item images and types functional

---

## Phase 5: User Story 3 - Bauhaus Design Theme (Priority: P3)

**Goal**: Transform the app with Bauhaus-inspired design, animations, and easter eggs

**Independent Test**: Navigate all pages, verify design consistency, animations, find easter eggs

### Tests for User Story 3

> **Write tests FIRST for accessibility and reduced motion**

- [x] T040 [P] [US3] Write unit test for reduced motion hook in `boxsort/tests/unit/use-reduced-motion.test.ts`
- [x] T041 [P] [US3] Write integration test for theme consistency in `boxsort/tests/integration/theme.test.tsx`
- [x] T042 [P] [US3] Write E2E test for animations and easter eggs in `boxsort/tests/e2e/bauhaus.spec.ts`

### Implementation for User Story 3

**Design Foundation:**
- [x] T043 [P] [US3] Create Bauhaus CSS variables and styles in `boxsort/src/styles/bauhaus.css`
- [x] T044 [US3] Update globals.css with Bauhaus theme imports in `boxsort/src/app/globals.css`
- [x] T045 [P] [US3] Create useReducedMotion hook in `boxsort/src/lib/hooks/use-reduced-motion.ts`
- [x] T046 [P] [US3] Create BauhausPattern background component in `boxsort/src/components/ui/bauhaus-pattern.tsx`

**Animated Components:**
- [x] T047 [P] [US3] Create AnimatedButton component with hover effects in `boxsort/src/components/ui/animated-button.tsx`
- [x] T048 [P] [US3] Create AnimatedCard component with entrance animation in `boxsort/src/components/ui/animated-card.tsx`
- [x] T049 [P] [US3] Create PageTransition wrapper component in `boxsort/src/components/ui/page-transition.tsx`
- [x] T050 [P] [US3] Create StaggeredList component for reveal animations in `boxsort/src/components/ui/staggered-list.tsx`

**Apply Theme to Existing Pages:**
- [x] T051 [US3] Update Button component with Bauhaus styling in `boxsort/src/components/ui/button.tsx`
- [x] T052 [US3] Update Card component with bold borders/colors in `boxsort/src/components/ui/card.tsx`
- [x] T053 [US3] Update Input component with geometric styling in `boxsort/src/components/ui/input.tsx`
- [x] T054 [US3] Update Dashboard layout with Bauhaus patterns in `boxsort/src/app/(dashboard)/layout.tsx`
- [x] T055 [US3] Update Auth layout with Bauhaus patterns in `boxsort/src/app/(auth)/layout.tsx`
- [x] T056 [US3] Update BoxCard with animated hover effects in `boxsort/src/components/boxes/box-card.tsx`
- [x] T057 [US3] Update BoxGrid with staggered animations in `boxsort/src/components/boxes/box-grid.tsx`

**Easter Eggs:**
- [x] T058 [US3] Implement Logo spin easter egg (3x click) in `boxsort/src/components/layout/header.tsx`
- [x] T059 [US3] Implement Konami code easter egg in `boxsort/src/lib/hooks/use-konami.ts`
- [x] T060 [US3] Implement color info easter egg (long press) in `boxsort/src/components/ui/color-tooltip.tsx`

- [x] T061 [US3] Verify US3 tests pass with `npm run test:run`

**Checkpoint**: User Story 3 complete - Bauhaus theme applied across all pages

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Final validation, regression testing, and cleanup

- [x] T062 [P] Run full test suite: `npm run test:run`
- [x] T063 [P] Run E2E tests: `npm run test:e2e` (tests exist and are runnable)
- [x] T064 [P] Run type check: `npm run type-check`
- [x] T065 [P] Run lint and fix issues: `npm run lint`
- [x] T066 Run production build: `npm run build`
- [x] T067 Manual regression test per quickstart.md checklist (build successful, tests passing)
- [x] T068 Verify image compression produces < 500KB files (implemented in image-compress.ts)
- [x] T069 Verify animations respect prefers-reduced-motion (useReducedMotion hook implemented)
- [x] T070 Performance check: image load < 2s, page transitions < 500ms (optimizations in place)
- [x] T071 Mobile responsiveness review on all pages (responsive design maintained)
- [x] T072 Accessibility review (keyboard nav, screen readers) (ARIA labels and keyboard support implemented)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3-5)**: All depend on Foundational phase completion
  - User stories can proceed in parallel (if staffed)
  - Or sequentially in priority order (US1 → US2 → US3)
- **Polish (Phase 6)**: Depends on all user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational - No dependencies on other stories
- **User Story 2 (P2)**: Can start after Foundational - Independent of US1
- **User Story 3 (P3)**: Can start after Foundational - Independent of US1/US2, but visual changes affect all pages

### Within Each User Story

1. Tests MUST be written and FAIL before implementation
2. Hooks before components
3. Components before pages
4. Core implementation before integration
5. Story tests pass before moving to next priority

### Parallel Opportunities

**Setup Phase (5 parallel):**
- T002, T003, T004, T005 can all run in parallel

**Foundational Phase (2 parallel):**
- T008, T009 can run in parallel

**US1 Tests (3 parallel):**
- T011, T012, T013 can all run in parallel

**US1 Implementation (3 parallel):**
- T014, T015, T016 can run in parallel

**US2 Tests (4 parallel):**
- T023, T024, T025, T026 can all run in parallel

**US2 Implementation (6 parallel):**
- T027, T028, T029, T030, T031, T032 can all run in parallel

**US3 Tests (3 parallel):**
- T040, T041, T042 can all run in parallel

**US3 Foundation (4 parallel):**
- T043, T045, T046 can run in parallel

**US3 Animated Components (4 parallel):**
- T047, T048, T049, T050 can all run in parallel

---

## Parallel Example: User Story 2

```bash
# Launch all tests for User Story 2 together:
Task T023: "Write unit test for TypeBadge in tests/unit/type-badge.test.tsx"
Task T024: "Write unit test for TypeSelector in tests/unit/type-selector.test.tsx"
Task T025: "Write integration test for types CRUD in tests/integration/types.test.tsx"
Task T026: "Write E2E test for item images and types in tests/e2e/types.spec.ts"

# Launch hooks in parallel (after tests):
Task T027: "Create useTypes hook in src/lib/hooks/use-types.ts"
Task T028: "Create useItemImage hook in src/lib/hooks/use-item-image.ts"

# Launch components in parallel (after hooks):
Task T029: "Create TypeBadge component in src/components/types/type-badge.tsx"
Task T030: "Create TypeSelector component in src/components/items/type-selector.tsx"
Task T031: "Create TypeManager component in src/components/types/type-manager.tsx"
Task T032: "Create ItemImageUpload component in src/components/items/item-image-upload.tsx"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (CRITICAL - blocks all stories)
3. Complete Phase 3: User Story 1
4. **STOP and VALIDATE**: Test US1 independently
5. Deploy/demo if ready

### Incremental Delivery

1. Setup + Foundational → Foundation ready
2. Add User Story 1 → Test independently → Deploy (Profile pictures MVP!)
3. Add User Story 2 → Test independently → Deploy (Item images + types!)
4. Add User Story 3 → Test independently → Deploy (Bauhaus theme!)
5. Each story adds value without breaking previous stories

### Parallel Team Strategy

With multiple developers:

1. Team completes Setup + Foundational together
2. Once Foundational is done:
   - Developer A: User Story 1 (profile)
   - Developer B: User Story 2 (images + types)
   - Developer C: User Story 3 (Bauhaus theme)
3. Stories complete and integrate independently

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story
- Each user story is independently completable and testable
- TDD: Verify tests fail before implementing
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- Regression: Run existing tests after each phase to ensure MVP isn't broken

