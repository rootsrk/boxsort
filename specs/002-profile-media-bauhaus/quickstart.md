# Quickstart: Profile, Media & Bauhaus Design

## Prerequisites

- Existing BoxSort MVP running (branch: 001-core-mvp)
- Supabase project with existing schema
- Node.js 18+
- npm or yarn

## Setup

### 1. Install New Dependencies

```bash
cd boxsort
npm install browser-image-compression framer-motion
```

### 2. Run Database Migration

In Supabase SQL Editor, run the migration script:

```sql
-- Copy contents of specs/002-profile-media-bauhaus/contracts/database.sql
```

Or via Supabase CLI:

```bash
supabase db push
```

### 3. Verify Storage Buckets

In Supabase Dashboard → Storage:
- ✅ `avatars` bucket exists (public)
- ✅ `item-images` bucket exists (private)

### 4. Update TypeScript Types

Regenerate types from Supabase:

```bash
npx supabase gen types typescript --project-id YOUR_PROJECT_ID > src/lib/supabase/types.ts
```

Or manually add the new types from `data-model.md`.

## Testing the Features

### Test 1: Profile Picture Upload

1. Log in to the app
2. Click on your avatar in the header
3. Select "Settings" from dropdown
4. Click on the profile picture section
5. Upload an image or take a photo
6. Verify avatar appears in header

**Expected**: Avatar displays as circular image, falls back to initials if no image

### Test 2: Item Image

1. Navigate to a box
2. Click "Add Item" 
3. Click the camera icon to add a photo
4. Take a photo or select from gallery
5. Add item name and save
6. Verify image appears on item card

**Expected**: Item card shows thumbnail, placeholder if no image

### Test 3: Types/Tags

1. Navigate to a box with items
2. Click on an item to edit
3. Add a new type by typing a name
4. Verify type appears as colored badge
5. Search for an item by type name

**Expected**: Types display as colored tags, searchable

### Test 4: Bauhaus Theme

1. Navigate through all pages
2. Verify bold colors, geometric shapes
3. Hover over buttons to see animations
4. Navigate between pages to see transitions
5. Find at least one easter egg

**Expected**: Consistent Bauhaus aesthetic across all pages

### Test 5: Reduced Motion

1. Enable "Reduce motion" in OS accessibility settings
2. Navigate through the app
3. Verify animations are disabled/reduced

**Expected**: No jarring animations, smooth experience

## Regression Tests

Run the full test suite to ensure existing features work:

```bash
# Unit and integration tests
npm run test:run

# E2E tests
npm run test:e2e

# Type check
npm run type-check

# Lint
npm run lint
```

All existing tests should pass.

## Manual Regression Checklist

- [ ] Login/signup works
- [ ] Household creation works
- [ ] Box CRUD works
- [ ] Item CRUD works
- [ ] Search returns results
- [ ] QR code generation works
- [ ] QR code scanning (public page) works
- [ ] Print QR codes works
- [ ] Real-time sync works across tabs
- [ ] Mobile responsive layout works

## Troubleshooting

### Images not uploading

1. Check Supabase Storage policies are applied
2. Verify bucket exists and has correct permissions
3. Check browser console for CORS errors
4. Ensure file size is under limit (2MB avatars, 5MB items)

### Types not saving

1. Verify `types` table exists
2. Check RLS policies are applied
3. Verify `get_my_household_id()` function exists

### Animations not working

1. Check Framer Motion is installed
2. Verify `prefers-reduced-motion` is not enabled
3. Check browser supports CSS animations

### Theme not applying

1. Clear browser cache
2. Verify CSS variables are in globals.css
3. Check Tailwind config includes new colors

## Development Commands

```bash
# Start dev server
npm run dev

# Run specific test file
npm test -- src/components/profile/avatar.test.tsx

# Build for production
npm run build

# Preview production build
npm run start
```

