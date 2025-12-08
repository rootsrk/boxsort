# Quickstart: BoxSort Core MVP

**Date**: 2025-12-08  
**Branch**: `001-core-mvp`

## Prerequisites

- Node.js 18.17+ (LTS recommended)
- npm 9+ or pnpm 8+
- Git
- Supabase account (free tier works)
- Code editor (VS Code recommended)

## 1. Clone & Install

```bash
# Clone the repository
git clone <repository-url>
cd boxsort

# Install dependencies
npm install

# Copy environment template
cp .env.local.example .env.local
```

## 2. Supabase Setup

### Create Project

1. Go to [supabase.com](https://supabase.com) and sign in
2. Click "New Project"
3. Choose organization, name it "boxsort" (or similar)
4. Set a strong database password (save it!)
5. Choose region closest to you
6. Wait for project to provision (~2 minutes)

### Get Credentials

1. Go to Project Settings → API
2. Copy these values to `.env.local`:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### Run Database Migration

1. Go to SQL Editor in Supabase Dashboard
2. Open `specs/001-core-mvp/contracts/database.sql`
3. Copy entire contents and paste into SQL Editor
4. Click "Run" to execute

Or use Supabase CLI:

```bash
# Install Supabase CLI
npm install -g supabase

# Login
supabase login

# Link to your project
supabase link --project-ref your-project-id

# Push migration
supabase db push
```

### Enable Realtime

1. Go to Database → Replication
2. Enable replication for `boxes` and `items` tables
3. Or verify the migration added them to publication

### Configure Auth

1. Go to Authentication → Providers
2. Ensure Email is enabled
3. (Optional) Enable "Confirm email" for production

## 3. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## 4. Verify Setup

### Test Auth Flow

1. Go to `/signup`
2. Create account with email/password
3. Check Supabase Auth → Users for new user
4. Check `public.users` table for profile record

### Test Box Creation

1. After signup, you should be redirected to create household
2. Create household (auto-creates invite code)
3. Click "Add Box" - should see new box with funky name
4. Check `public.boxes` table in Supabase

### Test Realtime

1. Open app in two browser tabs/windows
2. Login with same user in both
3. Add a box in one tab
4. Box should appear in other tab within 2 seconds

## 5. Run Tests

```bash
# Unit & Integration tests
npm run test

# Watch mode
npm run test:watch

# E2E tests (requires app running)
npm run test:e2e

# All tests with coverage
npm run test:coverage
```

## 6. Common Issues

### "Invalid API key" Error

- Check `.env.local` has correct values
- Ensure no extra spaces/newlines in env vars
- Restart dev server after changing env

### "RLS policy violation" Error

- User might not be in a household
- Check `public.users.household_id` is set
- Verify RLS policies were created correctly

### Realtime Not Working

- Check tables are added to `supabase_realtime` publication
- Verify browser console for WebSocket errors
- Check Supabase Dashboard → Realtime for connection status

### Migration Errors

- Run migrations in order
- Check for existing tables before running
- Use `DROP TABLE IF EXISTS` for clean re-runs

## 7. Development Commands

```bash
# Start dev server
npm run dev

# Build for production
npm run build

# Start production server
npm run start

# Lint code
npm run lint

# Format code
npm run format

# Type check
npm run type-check

# Generate Supabase types
npm run supabase:types
# or
npx supabase gen types typescript --project-id your-project-id > src/lib/supabase/types.ts
```

## 8. Project Structure Quick Reference

```
src/
├── app/                    # Next.js App Router pages
│   ├── (auth)/            # Login, signup, join routes
│   ├── (dashboard)/       # Protected app routes
│   └── box/[id]/          # Public QR landing page
├── components/            # React components
│   ├── ui/               # Base UI (button, input, etc.)
│   ├── boxes/            # Box-related components
│   ├── items/            # Item-related components
│   └── search/           # Search components
├── lib/                   # Utilities and hooks
│   ├── supabase/         # Supabase clients
│   ├── utils/            # Helpers (name generator, etc.)
│   └── hooks/            # Custom React hooks
└── styles/               # Global styles
```

## 9. Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL | Yes |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anonymous key | Yes |
| `NEXT_PUBLIC_APP_URL` | App URL for QR codes (default: localhost:3000) | No |

## 10. Next Steps

After setup is verified:

1. Run `/speckit.tasks` to generate task breakdown
2. Start with Phase 1: Setup tasks
3. Follow TDD: write tests first, then implement
4. Commit after each completed task

---

**Need Help?**

- Check [Supabase Docs](https://supabase.com/docs)
- Check [Next.js Docs](https://nextjs.org/docs)
- Review `specs/001-core-mvp/research.md` for technical decisions

