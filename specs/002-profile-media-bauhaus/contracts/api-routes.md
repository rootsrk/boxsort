# API Routes: Profile, Media & Bauhaus Design

## Overview

This document describes the API routes and data operations for the new features. Following the existing pattern, most operations use direct Supabase client calls with RLS rather than custom API routes.

## Authentication

All routes require authentication via Supabase Auth. Session is validated via `@supabase/ssr` middleware.

---

## Profile Picture Operations

### Upload Avatar

**Method**: Client-side Supabase Storage upload

```typescript
// Upload to avatars bucket
const { data, error } = await supabase.storage
  .from('avatars')
  .upload(`${userId}/avatar.webp`, compressedFile, {
    upsert: true, // Replace existing
    contentType: 'image/webp',
  })

// Update user profile with URL
await supabase
  .from('users')
  .update({ avatar_url: data.path })
  .eq('id', userId)
```

**Path Pattern**: `{user_id}/avatar.{ext}`

**Response**: Public URL for avatar

### Get Avatar URL

**Method**: Direct Supabase Storage public URL

```typescript
const { data } = supabase.storage
  .from('avatars')
  .getPublicUrl(`${userId}/avatar.webp`)
```

### Delete Avatar

**Method**: Client-side Supabase Storage delete

```typescript
await supabase.storage
  .from('avatars')
  .remove([`${userId}/avatar.webp`])

await supabase
  .from('users')
  .update({ avatar_url: null })
  .eq('id', userId)
```

---

## Item Image Operations

### Upload Item Image

**Method**: Client-side Supabase Storage upload

```typescript
// Upload to item-images bucket
const path = `${householdId}/${itemId}.webp`
const { data, error } = await supabase.storage
  .from('item-images')
  .upload(path, compressedFile, {
    upsert: true,
    contentType: 'image/webp',
  })

// Update item with URL
await supabase
  .from('items')
  .update({ image_url: path })
  .eq('id', itemId)
```

**Path Pattern**: `{household_id}/{item_id}.{ext}`

### Get Item Image URL

**Method**: Create signed URL (private bucket)

```typescript
const { data } = await supabase.storage
  .from('item-images')
  .createSignedUrl(`${householdId}/${itemId}.webp`, 3600) // 1 hour expiry
```

### Delete Item Image

**Method**: Client-side Supabase Storage delete

```typescript
await supabase.storage
  .from('item-images')
  .remove([`${householdId}/${itemId}.webp`])

await supabase
  .from('items')
  .update({ image_url: null })
  .eq('id', itemId)
```

---

## Types (Tags) Operations

### List Types

**Method**: Direct Supabase query

```typescript
const { data: types, error } = await supabase
  .from('types')
  .select('*')
  .order('name', { ascending: true })
```

**Response**: Array of Type objects

### Create Type

**Method**: Direct Supabase insert

```typescript
const { data, error } = await supabase
  .from('types')
  .insert({
    household_id: householdId,
    name: typeName.trim(),
    color: assignedColor,
  })
  .select()
  .single()
```

**Validation**:
- name: 1-50 characters, trimmed
- color: Valid hex (#RRGGBB)
- Unique per household (case-insensitive)

### Update Type

**Method**: Direct Supabase update

```typescript
const { data, error } = await supabase
  .from('types')
  .update({ name: newName, color: newColor })
  .eq('id', typeId)
  .select()
  .single()
```

### Delete Type

**Method**: Direct Supabase delete

```typescript
const { error } = await supabase
  .from('types')
  .delete()
  .eq('id', typeId)
```

**Side Effects**: All item_types associations are CASCADE deleted

---

## Item-Type Associations

### Get Item Types

**Method**: Direct Supabase query with join

```typescript
const { data: item, error } = await supabase
  .from('items')
  .select(`
    *,
    item_types (
      type:types (*)
    )
  `)
  .eq('id', itemId)
  .single()

// Transform to flat array
const types = item.item_types.map(it => it.type)
```

### Add Type to Item

**Method**: Direct Supabase insert

```typescript
const { error } = await supabase
  .from('item_types')
  .insert({
    item_id: itemId,
    type_id: typeId,
  })
```

**Constraint**: Duplicate (item_id, type_id) silently ignored (ON CONFLICT DO NOTHING)

### Remove Type from Item

**Method**: Direct Supabase delete

```typescript
const { error } = await supabase
  .from('item_types')
  .delete()
  .eq('item_id', itemId)
  .eq('type_id', typeId)
```

### Set Item Types (bulk)

**Method**: Transaction-like operation

```typescript
// Remove all existing types for this item
await supabase
  .from('item_types')
  .delete()
  .eq('item_id', itemId)

// Add new types
if (typeIds.length > 0) {
  await supabase
    .from('item_types')
    .insert(typeIds.map(typeId => ({
      item_id: itemId,
      type_id: typeId,
    })))
}
```

---

## Extended Search (Update to Existing)

### Search Items with Types

**Method**: Update existing search function

```sql
-- Updated search_items function to include types
CREATE OR REPLACE FUNCTION public.search_items(search_query TEXT)
RETURNS TABLE (
  item_id UUID,
  item_name VARCHAR(200),
  item_description TEXT,
  item_image_url TEXT,
  box_id UUID,
  box_funky_name VARCHAR(100),
  types JSONB
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    i.id AS item_id,
    i.name AS item_name,
    i.description AS item_description,
    i.image_url AS item_image_url,
    b.id AS box_id,
    b.funky_name AS box_funky_name,
    COALESCE(
      jsonb_agg(
        jsonb_build_object('id', t.id, 'name', t.name, 'color', t.color)
      ) FILTER (WHERE t.id IS NOT NULL),
      '[]'::jsonb
    ) AS types
  FROM items i
  JOIN boxes b ON i.box_id = b.id
  LEFT JOIN item_types it ON i.id = it.item_id
  LEFT JOIN types t ON it.type_id = t.id
  WHERE 
    b.household_id = get_my_household_id()
    AND (
      i.name ILIKE '%' || search_query || '%'
      OR i.description ILIKE '%' || search_query || '%'
      OR t.name ILIKE '%' || search_query || '%'
    )
  GROUP BY i.id, i.name, i.description, i.image_url, b.id, b.funky_name
  ORDER BY i.name;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

---

## React Hooks

### useTypes

```typescript
interface UseTypesReturn {
  types: Type[]
  loading: boolean
  error: string | null
  createType: (name: string) => Promise<Type | null>
  updateType: (id: string, updates: Partial<Type>) => Promise<Type | null>
  deleteType: (id: string) => Promise<boolean>
  refresh: () => Promise<void>
}
```

### useItemTypes

```typescript
interface UseItemTypesReturn {
  itemTypes: Type[]
  loading: boolean
  addType: (typeId: string) => Promise<void>
  removeType: (typeId: string) => Promise<void>
  setTypes: (typeIds: string[]) => Promise<void>
}
```

### useAvatar

```typescript
interface UseAvatarReturn {
  avatarUrl: string | null
  uploading: boolean
  uploadAvatar: (file: File) => Promise<string | null>
  deleteAvatar: () => Promise<boolean>
}
```

### useItemImage

```typescript
interface UseItemImageReturn {
  imageUrl: string | null
  uploading: boolean
  uploadImage: (file: File) => Promise<string | null>
  deleteImage: () => Promise<boolean>
  getSignedUrl: () => Promise<string | null>
}
```

---

## Error Codes

| Code | Message | Cause |
|------|---------|-------|
| 23505 | duplicate key value violates unique constraint | Type name already exists in household |
| 22P02 | invalid input syntax for type uuid | Invalid ID format |
| 42501 | permission denied for table | RLS policy violation |
| PGRST116 | JSON object requested, multiple (or no) rows returned | Query returned wrong row count |

---

## Real-time Subscriptions

### Types Channel

```typescript
supabase
  .channel('types-changes')
  .on('postgres_changes', {
    event: '*',
    schema: 'public',
    table: 'types',
    filter: `household_id=eq.${householdId}`,
  }, handleTypeChange)
  .subscribe()
```

### Item Types Channel

```typescript
supabase
  .channel('item-types-changes')
  .on('postgres_changes', {
    event: '*',
    schema: 'public',
    table: 'item_types',
  }, handleItemTypeChange)
  .subscribe()
```

