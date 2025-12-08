# Research: BoxSort Core MVP

**Date**: 2025-12-08  
**Branch**: `001-core-mvp`

## Technology Decisions

### 1. Framework: Next.js 15 with App Router

**Decision**: Use Next.js 15+ with App Router (not Pages Router)

**Rationale**:
- Server Components reduce client bundle size
- Built-in streaming and Suspense support for skeleton loaders
- Route groups for clean auth/dashboard separation
- Server Actions for form handling (reduces API boilerplate)
- Native middleware for auth session refresh
- User specifically requested Next.js

**Alternatives Considered**:
- **React + Vite** (constitution default): Simpler setup but requires separate API layer and no SSR benefits
- **Remix**: Strong data loading patterns but smaller ecosystem, less Supabase integration docs
- **Pages Router**: Legacy pattern, App Router is the future

### 2. Backend: Supabase (PostgreSQL + Auth + Realtime)

**Decision**: Use Supabase as Backend-as-a-Service

**Rationale**:
- PostgreSQL with full SQL capabilities for complex search
- Built-in authentication with multiple providers
- Realtime subscriptions for multi-user sync
- Row Level Security (RLS) for household data isolation
- Auto-generated TypeScript types from schema
- Generous free tier for household-scale usage
- Constitution already specifies Supabase

**Alternatives Considered**:
- **Firebase**: NoSQL makes complex queries harder, vendor lock-in concerns
- **Custom backend (Express/FastAPI)**: Unnecessary complexity for this scale
- **PlanetScale**: Great DB but requires building auth/realtime separately

### 3. Supabase Client: @supabase/ssr

**Decision**: Use `@supabase/ssr` package (not legacy auth-helpers)

**Rationale**:
- Official recommended package for Next.js App Router
- Proper cookie handling for Server Components
- `createServerClient` for server contexts
- `createBrowserClient` with singleton pattern for client
- Middleware integration for session refresh

**Pattern**:
```typescript
// Browser (singleton)
createBrowserClient(url, key)

// Server Component (read-only)
createServerClient(url, key, { cookies: { getAll } })

// Route Handler/Server Action (with mutations)
createServerClient(url, key, { cookies: { getAll, setAll } })

// Middleware (session refresh)
createServerClient(url, key, { cookies: { getAll, setAll } })
```

### 4. QR Code Generation: qrcode.react

**Decision**: Use `qrcode.react` for client-side QR generation

**Rationale**:
- React component-based API
- SVG output for crisp printing at any size
- Lightweight (~15KB)
- Well-maintained, 2M+ weekly downloads
- No server-side generation needed

**Alternatives Considered**:
- **qrcode**: Node.js focused, requires canvas
- **react-qr-code**: Similar but less downloads
- **Server-side generation**: Unnecessary complexity

### 5. Funky Name Generation

**Decision**: Custom client-side generator with word lists

**Rationale**:
- Simple adjective-animal-noun pattern
- ~100 words per category = 1M+ combinations
- No external API dependency
- Instant generation, no network latency
- Regeneration is just re-rolling random indices

**Implementation**:
```typescript
const adjectives = ['purple', 'swift', 'golden', 'cosmic', ...] // ~100 words
const animals = ['tiger', 'falcon', 'dolphin', 'phoenix', ...] // ~100 words
const nouns = ['cloud', 'storm', 'river', 'crystal', ...] // ~100 words

function generateFunkyName(): string {
  return `${random(adjectives)}-${random(animals)}-${random(nouns)}`
}
```

### 6. Search Implementation

**Decision**: PostgreSQL full-text search via Supabase

**Rationale**:
- Built into PostgreSQL, no additional service
- `to_tsvector` and `to_tsquery` for fuzzy matching
- Can use `ilike` for simple partial matching
- Index on searchable columns for performance
- Real-time results via Supabase query

**Pattern**:
```sql
-- Simple partial match (good for small scale)
SELECT * FROM items 
WHERE name ILIKE '%' || $1 || '%'

-- Full-text search (better for scale)
SELECT * FROM items 
WHERE to_tsvector('english', name) @@ plainto_tsquery('english', $1)
```

**Decision for MVP**: Start with `ILIKE` for simplicity, add full-text index if performance degrades.

### 7. Real-time Sync

**Decision**: Supabase Realtime with Postgres Changes

**Rationale**:
- Subscribe to INSERT/UPDATE/DELETE on tables
- Automatic reconnection handling
- Works with RLS (only see household data)
- No additional infrastructure

**Pattern**:
```typescript
supabase
  .channel('boxes')
  .on('postgres_changes', { 
    event: '*', 
    schema: 'public', 
    table: 'boxes',
    filter: `household_id=eq.${householdId}` 
  }, handleChange)
  .subscribe()
```

### 8. Authentication Flow

**Decision**: Email/password with magic link option

**Rationale**:
- Simplest for household users
- Magic link reduces password friction
- Supabase Auth handles all complexity
- Easy to add OAuth later if needed

**Flows**:
1. **Sign up**: Email + password → auto-create household
2. **Sign in**: Email + password or magic link
3. **Join household**: Invite link → sign up/in → join existing household

### 9. Styling: Tailwind CSS

**Decision**: Tailwind CSS with custom design system

**Rationale**:
- Constitution specifies Tailwind
- Utility-first for rapid development
- Built-in responsive design
- Easy dark mode support
- Good print styles for QR labels

### 10. Testing Strategy

**Decision**: Vitest (unit/integration) + Playwright (E2E)

**Rationale**:
- Vitest: Fast, Vite-native, Jest-compatible API
- React Testing Library: Component testing best practices
- Playwright: Cross-browser E2E, good Next.js integration
- Constitution requires TDD

**Coverage targets**:
- Unit: Name generator, utilities (100%)
- Integration: Components with mocked Supabase (80%)
- E2E: Critical user flows (auth, add box, search)

## Open Questions (Resolved)

| Question | Resolution |
|----------|------------|
| Custom names for boxes? | No - regenerate only (per clarification) |
| Ownership model for deletion? | Collaborative - any member can delete anything (per clarification) |
| CI/CD platform? | Deferred - not Vercel, decide after feature completion |

## Performance Considerations

1. **Search debounce**: 300ms debounce on search input
2. **Optimistic updates**: Update UI immediately, rollback on error
3. **Pagination**: Lazy load boxes if > 20 in grid
4. **Image optimization**: Next.js Image component for any future images
5. **Bundle splitting**: Dynamic imports for print dialog, settings

