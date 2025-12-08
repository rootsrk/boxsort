# Implementation Plan: Profile, Media & Bauhaus Design

**Branch**: `002-profile-media-bauhaus` | **Date**: 2025-12-08 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/002-profile-media-bauhaus/spec.md`

## Summary

Extend BoxSort with user profile pictures, item images with camera capture, user-generated types/tags, and a Bauhaus-inspired design theme. This builds on the existing Next.js + Supabase MVP, adding Supabase Storage for images and new database tables for types. The Bauhaus redesign will transform the minimalist UI into a bold, playful interface with geometric patterns and animations.

## Technical Context

**Language/Version**: TypeScript 5.x, Next.js 16+ (App Router)
**Primary Dependencies**: @supabase/ssr, @supabase/supabase-js, qrcode.react, Tailwind CSS, Framer Motion (animations)
**Storage**: Supabase (PostgreSQL + Storage buckets for images)
**Testing**: Vitest + React Testing Library + Playwright
**Target Platform**: Web (responsive, mobile-first)
**Project Type**: Web application (Next.js full-stack)
**Performance Goals**: Image load < 2s, animations 60fps, page transitions < 500ms
**Constraints**: Images < 500KB after compression, respect prefers-reduced-motion
**Scale/Scope**: Existing households with ~100 items per household

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Evidence |
|-----------|--------|----------|
| I. User-First Simplicity | ✅ PASS | Profile picture: 2 clicks (avatar → upload). Types: 2 clicks (item → add tag). All within 3-click rule. |
| II. Searchability as Primary Function | ✅ PASS | Types become searchable metadata. Item images are visual aids, not replacing text search. Search remains central. |
| III. Shared Household Database | ✅ PASS | All new data (profile pics, types, images) stored in Supabase with household RLS. Real-time sync maintained. |
| IV. Test-Driven Development | ✅ PASS | Plan includes TDD approach: write tests before implementing each feature. Test coverage for new hooks, components, and API routes. |
| V. Progressive Feature Delivery | ✅ PASS | Features split into 3 independent user stories (P1, P2, P3). Each deliverable independently. Existing MVP functionality preserved. |

**GATE PASSED**: All 5 principles satisfied.

## Project Structure

### Documentation (this feature)

```text
specs/002-profile-media-bauhaus/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output
│   ├── database.sql     # New tables and migrations
│   └── api-routes.md    # New API endpoints
└── tasks.md             # Phase 2 output (not created by /speckit.plan)
```

### Source Code (extends existing)

```text
boxsort/
├── src/
│   ├── app/
│   │   ├── (dashboard)/
│   │   │   ├── profile/
│   │   │   │   └── page.tsx          # NEW: Profile view page
│   │   │   └── settings/
│   │   │       └── page.tsx          # MODIFY: Add profile picture section
│   │   └── globals.css               # MODIFY: Bauhaus theme variables
│   ├── components/
│   │   ├── items/
│   │   │   ├── item-card.tsx         # NEW: Card layout with image
│   │   │   ├── item-image-upload.tsx # NEW: Camera/gallery picker
│   │   │   └── type-selector.tsx     # NEW: Type tag picker
│   │   ├── layout/
│   │   │   ├── header.tsx            # MODIFY: Add user avatar menu
│   │   │   └── user-menu.tsx         # NEW: Dropdown with profile options
│   │   ├── profile/
│   │   │   ├── avatar.tsx            # NEW: Circular avatar component
│   │   │   └── avatar-upload.tsx     # NEW: Profile picture upload
│   │   ├── types/
│   │   │   ├── type-badge.tsx        # NEW: Colored tag badge
│   │   │   └── type-manager.tsx      # NEW: Create/manage types
│   │   └── ui/
│   │       ├── bauhaus-pattern.tsx   # NEW: Background patterns
│   │       └── animated-*.tsx        # NEW: Animated UI components
│   ├── lib/
│   │   ├── hooks/
│   │   │   ├── use-types.ts          # NEW: Types CRUD hook
│   │   │   └── use-user.ts           # MODIFY: Include avatar_url
│   │   ├── supabase/
│   │   │   └── types.ts              # MODIFY: Add new types
│   │   └── utils/
│   │       └── image-compress.ts     # NEW: Client-side compression
│   └── styles/
│       └── bauhaus.css               # NEW: Theme-specific styles
├── supabase/
│   └── migrations/
│       └── 00003_profile_media.sql   # NEW: Schema changes
└── tests/
    ├── unit/
    │   ├── image-compress.test.ts    # NEW
    │   └── type-selector.test.tsx    # NEW
    ├── integration/
    │   ├── profile.test.tsx          # NEW
    │   └── types.test.tsx            # NEW
    └── e2e/
        ├── profile.spec.ts           # NEW
        └── types.spec.ts             # NEW
```

**Structure Decision**: Extends existing Next.js App Router structure. New components organized by domain (profile/, types/). Bauhaus theme via CSS variables and dedicated style file. All changes additive to preserve MVP functionality.

## Complexity Tracking

No violations identified. All additions follow existing patterns:
- New database tables follow existing RLS pattern
- New components follow existing structure
- Image storage uses Supabase Storage (already planned in constitution)
