<!--
  Sync Impact Report
  ===================
  Version change: 1.0.0 → 2.0.0 (MAJOR - Principle redefinition)

  Modified principles:
    - III. Offline-First Architecture → III. Shared Household Database
      (Fundamental architecture change from local-only to cloud database)

  Added sections: None

  Removed sections: None

  Technology Stack changes:
    - Added: Supabase (PostgreSQL + Auth + Real-time)
    - Added: Backend-as-a-Service architecture
    - Removed: IndexedDB/localStorage as primary storage
    - Added: Real-time sync requirement

  Templates requiring updates:
    ✅ plan-template.md - Compatible (Constitution Check section exists)
    ✅ spec-template.md - Compatible (User Stories structure aligns)
    ✅ tasks-template.md - Compatible (Phase structure aligns with principles)

  Follow-up TODOs: None
-->

# BoxSort Constitution

## Core Principles

### I. User-First Simplicity

The application MUST prioritize ease of use above all technical considerations. Every feature MUST be accomplishable in 3 clicks or fewer from the main screen. The UI MUST be intuitive enough that a user can manage their boxes without reading documentation.

**Rationale**: Users need to quickly catalog and find items. Complexity discourages use, leading to abandoned inventories and lost items.

### II. Searchability as Primary Function

Search MUST be the central feature of the application. Every item, box name, and category MUST be indexed and searchable. Search results MUST display the box name prominently so users know exactly where to find their item. Full-text search across item names and descriptions is MANDATORY.

**Rationale**: The entire purpose of this app is to find things. If search fails, the app has no value.

### III. Shared Household Database

The application MUST use a shared cloud database accessible by all household members. Data MUST sync in real-time across all connected devices. Multiple users MUST be able to view and edit inventory simultaneously without conflicts. The system MUST handle concurrent updates gracefully.

**Rationale**: Households have multiple people who need to find and organize belongings. A shared database ensures everyone sees the same inventory and can contribute to keeping it updated.

### IV. Test-Driven Development (NON-NEGOTIABLE)

All features MUST follow TDD: write failing tests first, then implement until tests pass, then refactor. Test coverage MUST include: unit tests for business logic, integration tests for user flows, and contract tests for any API boundaries. Tests MUST run before any merge to main.

**Rationale**: A broken inventory app means users can't find their belongings. Quality gates prevent regressions.

### V. Progressive Feature Delivery

The application MUST be built in phases with each phase delivering standalone value:

- **Phase 1 (MVP)**: Box CRUD, Item CRUD, QR codes, random names, search, multi-user access
- **Phase 2 (Enhancement)**: Image capture, AI labeling, image search

Each phase MUST be fully functional and deployable independently. Phase 2 features MUST NOT break Phase 1 functionality.

**Rationale**: Users get value immediately. AI features enhance but don't gate core utility.

## Technology Stack

**Framework**: React 18+ with Vite, TypeScript (strict mode)  
**Styling**: Tailwind CSS  
**Routing**: React Router v6+  
**State Management**: React Context + React Query/TanStack Query for server state  
**Testing**: Vitest + React Testing Library  
**QR Generation**: Client-side library (e.g., qrcode.react)  
**UI Patterns**: Skeleton loaders via React Suspense, Error Boundaries for fault isolation

**Backend-as-a-Service**: Supabase

- **Database**: PostgreSQL (hosted by Supabase)
- **Authentication**: Supabase Auth (email/password, magic link, or OAuth)
- **Real-time**: Supabase Realtime for live sync across devices
- **Storage**: Supabase Storage for images (Phase 2)

**Why Supabase**: Provides PostgreSQL, authentication, real-time subscriptions, and file storage in one platform. Eliminates need to build/maintain a custom backend while providing full SQL query capabilities for complex search.

**Phase 2 Additions** (future):

- Camera API for image capture
- Supabase Storage for image persistence
- AI/ML service integration for image labeling
- Vector search for image similarity (Supabase pgvector extension)

## Development Workflow

### Code Quality Gates

1. All code MUST pass TypeScript strict mode compilation
2. All code MUST pass ESLint with no warnings
3. All tests MUST pass before merge
4. New features MUST include tests written BEFORE implementation
5. Build MUST succeed with zero errors after every change

### Component Standards

1. Page-level components MUST use React Suspense with skeleton loaders
2. All async operations MUST have error boundaries
3. Components MUST be tested in isolation
4. Database operations MUST use the Supabase client with proper error handling
5. Real-time subscriptions MUST be properly cleaned up on component unmount

### Data Integrity

1. All database mutations MUST be validated on both client and server (RLS policies)
2. Concurrent edits MUST be handled via optimistic updates with rollback on conflict
3. User data MUST be scoped to their household (Row Level Security)

### Commit Conventions

1. Commits MUST be atomic (one logical change per commit)
2. Commit messages MUST follow conventional commits format
3. Feature branches MUST be rebased before merge

## Governance

This constitution establishes the non-negotiable rules for BoxSort development. All pull requests and code reviews MUST verify compliance with these principles.

### Amendment Procedure

1. Proposed changes MUST be documented with rationale
2. Changes to NON-NEGOTIABLE principles require explicit user approval
3. All amendments MUST update the version number per semantic versioning:
   - MAJOR: Removing or fundamentally changing a principle
   - MINOR: Adding new principles or sections
   - PATCH: Clarifications and typo fixes

### Compliance Review

Every feature specification and implementation plan MUST include a Constitution Check section verifying alignment with all 5 core principles.

**Version**: 2.0.0 | **Ratified**: 2025-12-08 | **Last Amended**: 2025-12-08
