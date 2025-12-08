# Data Model: Profile, Media & Bauhaus Design

## Overview

This document describes the data model changes required for profile pictures, item images, and types/tags. All changes are additive to preserve existing functionality.

## Entity Relationship Diagram

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   households    │     │     users       │     │     boxes       │
├─────────────────┤     ├─────────────────┤     ├─────────────────┤
│ id (PK)         │────<│ id (PK)         │     │ id (PK)         │
│ name            │     │ household_id(FK)│>────│ household_id(FK)│
│ owner_id (FK)   │     │ display_name    │     │ funky_name      │
│ invite_code     │     │ avatar_url (NEW)│     │ created_at      │
│ created_at      │     │ created_at      │     │ updated_at      │
└─────────────────┘     │ updated_at      │     └────────┬────────┘
                        └─────────────────┘              │
                                                         │
                        ┌─────────────────┐              │
                        │     items       │              │
                        ├─────────────────┤              │
                        │ id (PK)         │<─────────────┘
                        │ box_id (FK)     │
                        │ name            │
                        │ description     │
                        │ image_url (NEW) │
                        │ created_at      │
                        │ updated_at      │
                        └────────┬────────┘
                                 │
                                 │ M:N
                                 ▼
┌─────────────────┐     ┌─────────────────┐
│     types       │     │   item_types    │
├─────────────────┤     ├─────────────────┤
│ id (PK)         │<────│ type_id (FK)    │
│ household_id(FK)│     │ item_id (FK)    │
│ name            │     │ created_at      │
│ color           │     └─────────────────┘
│ created_at      │
│ updated_at      │
└─────────────────┘
```

## Schema Changes

### Modified Tables

#### users (ADD column)

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| avatar_url | TEXT | NULL | URL to profile picture in Supabase Storage |

**Migration**: Add nullable column, no default (null = no avatar)

#### items (ADD column)

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| image_url | TEXT | NULL | URL to item image in Supabase Storage |

**Migration**: Add nullable column, no default (null = use placeholder)

### New Tables

#### types

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK, DEFAULT uuid_generate_v4() | Unique identifier |
| household_id | UUID | FK households(id), NOT NULL | Household scope |
| name | VARCHAR(50) | NOT NULL | Type/tag name |
| color | VARCHAR(7) | NOT NULL, DEFAULT '#1E88E5' | Hex color code |
| created_at | TIMESTAMPTZ | NOT NULL, DEFAULT now() | Creation timestamp |
| updated_at | TIMESTAMPTZ | NOT NULL, DEFAULT now() | Last update timestamp |

**Constraints**:
- UNIQUE(household_id, LOWER(name)) - Case-insensitive uniqueness per household
- CHECK(char_length(trim(name)) >= 1) - Non-empty name
- CHECK(color ~ '^#[0-9A-Fa-f]{6}$') - Valid hex color

**Indexes**:
- idx_types_household_id ON types(household_id)
- idx_types_name_lower ON types(household_id, LOWER(name))

#### item_types (Junction Table)

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| item_id | UUID | FK items(id) ON DELETE CASCADE | Item reference |
| type_id | UUID | FK types(id) ON DELETE CASCADE | Type reference |
| created_at | TIMESTAMPTZ | NOT NULL, DEFAULT now() | Association timestamp |

**Constraints**:
- PRIMARY KEY(item_id, type_id) - Composite key, prevents duplicates

**Indexes**:
- idx_item_types_type_id ON item_types(type_id) - For reverse lookups

## Storage Buckets

### avatars (Public Bucket)

| Property | Value |
|----------|-------|
| Public | true |
| Max file size | 2MB |
| Allowed types | image/jpeg, image/png, image/webp |
| Path pattern | `{user_id}/avatar.{ext}` |

### item-images (Private Bucket)

| Property | Value |
|----------|-------|
| Public | false |
| Max file size | 5MB |
| Allowed types | image/jpeg, image/png, image/webp |
| Path pattern | `{household_id}/{item_id}.{ext}` |

## Row Level Security (RLS)

### types table

```sql
-- Household members can view their types
CREATE POLICY "types_select" ON types FOR SELECT
USING (household_id = get_my_household_id());

-- Household members can create types
CREATE POLICY "types_insert" ON types FOR INSERT
WITH CHECK (household_id = get_my_household_id());

-- Household members can update types
CREATE POLICY "types_update" ON types FOR UPDATE
USING (household_id = get_my_household_id());

-- Household members can delete types
CREATE POLICY "types_delete" ON types FOR DELETE
USING (household_id = get_my_household_id());
```

### item_types table

```sql
-- Household members can view item-type associations
CREATE POLICY "item_types_select" ON item_types FOR SELECT
USING (
  item_id IN (SELECT id FROM items WHERE box_id IN 
    (SELECT id FROM boxes WHERE household_id = get_my_household_id()))
);

-- Household members can create associations
CREATE POLICY "item_types_insert" ON item_types FOR INSERT
WITH CHECK (
  item_id IN (SELECT id FROM items WHERE box_id IN 
    (SELECT id FROM boxes WHERE household_id = get_my_household_id()))
);

-- Household members can delete associations
CREATE POLICY "item_types_delete" ON item_types FOR DELETE
USING (
  item_id IN (SELECT id FROM items WHERE box_id IN 
    (SELECT id FROM boxes WHERE household_id = get_my_household_id()))
);
```

### Storage Policies

```sql
-- Avatars: Users can manage their own avatar
CREATE POLICY "avatars_select" ON storage.objects FOR SELECT
USING (bucket_id = 'avatars');

CREATE POLICY "avatars_insert" ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "avatars_delete" ON storage.objects FOR DELETE
USING (bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text);

-- Item images: Household members can manage
CREATE POLICY "item_images_select" ON storage.objects FOR SELECT
USING (bucket_id = 'item-images' AND 
  (storage.foldername(name))[1]::uuid = get_my_household_id());

CREATE POLICY "item_images_insert" ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'item-images' AND 
  (storage.foldername(name))[1]::uuid = get_my_household_id());

CREATE POLICY "item_images_delete" ON storage.objects FOR DELETE
USING (bucket_id = 'item-images' AND 
  (storage.foldername(name))[1]::uuid = get_my_household_id());
```

## TypeScript Types (additions)

```typescript
// Add to types.ts
export interface Type {
  id: string
  household_id: string
  name: string
  color: string
  created_at: string
  updated_at: string
}

export interface ItemType {
  item_id: string
  type_id: string
  created_at: string
}

// Extended User with avatar
export interface UserWithAvatar extends User {
  avatar_url: string | null
}

// Extended Item with image and types
export interface ItemWithMedia extends Item {
  image_url: string | null
  types: Type[]
}
```

## Validation Rules

| Entity | Field | Rule |
|--------|-------|------|
| Type | name | 1-50 chars, trimmed, unique per household (case-insensitive) |
| Type | color | Valid 6-digit hex color (#RRGGBB) |
| User | avatar_url | Valid Supabase Storage URL or null |
| Item | image_url | Valid Supabase Storage URL or null |
| Image upload | file size | Max 5MB raw, compressed to < 500KB |
| Image upload | dimensions | Max 1200px on longest side |
| Image upload | format | JPEG, PNG, or WebP |

## State Transitions

### Type Lifecycle

```
[Created] → [Active] → [Deleted]
                ↑
                └── [Updated] (name/color change)
```

- When type is deleted: CASCADE removes all item_types associations
- Items do not change; they simply lose that type tag

### Image Lifecycle

```
[No Image] → [Uploading] → [Stored] → [Deleted]
                              ↓
                        [Replaced] → [Stored]
```

- Old image is deleted when replaced
- Storage URL updated atomically with item/user record

