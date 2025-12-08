# Data Model: BoxSort Core MVP

**Date**: 2025-12-08  
**Branch**: `001-core-mvp`

## Entity Relationship Diagram

```
┌─────────────────┐       ┌─────────────────┐       ┌─────────────────┐
│   households    │       │     users       │       │     boxes       │
├─────────────────┤       ├─────────────────┤       ├─────────────────┤
│ id (PK)         │◄──────│ household_id(FK)│       │ id (PK)         │
│ name            │       │ id (PK)         │       │ household_id(FK)│──┐
│ owner_id (FK)   │───────│ email           │       │ funky_name      │  │
│ invite_code     │       │ display_name    │       │ created_at      │  │
│ created_at      │       │ created_at      │       │ updated_at      │  │
└─────────────────┘       └─────────────────┘       └─────────────────┘  │
                                                            │             │
                                                            │             │
                                                    ┌───────▼─────────┐  │
                                                    │     items       │  │
                                                    ├─────────────────┤  │
                                                    │ id (PK)         │  │
                                                    │ box_id (FK)     │──┘
                                                    │ name            │
                                                    │ description     │
                                                    │ created_at      │
                                                    │ updated_at      │
                                                    └─────────────────┘
```

## Entities

### Household

A group of users sharing the same box inventory.

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `id` | UUID | PK, default gen_random_uuid() | Unique identifier |
| `name` | VARCHAR(100) | NOT NULL | Household display name (e.g., "Smith Family") |
| `owner_id` | UUID | FK → auth.users(id) | Original creator, can transfer ownership |
| `invite_code` | VARCHAR(20) | UNIQUE, NOT NULL | Short code for invite links |
| `created_at` | TIMESTAMPTZ | NOT NULL, default now() | Creation timestamp |

**Validation Rules**:
- `name`: 1-100 characters, trimmed
- `invite_code`: Auto-generated 8-char alphanumeric, regeneratable

**State Transitions**: None (static after creation, can update name)

---

### User (extends Supabase auth.users)

An authenticated person belonging to one household.

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `id` | UUID | PK, FK → auth.users(id) | Matches Supabase auth user ID |
| `household_id` | UUID | FK → households(id), NULL initially | User's household membership |
| `display_name` | VARCHAR(50) | NOT NULL | Name shown in UI |
| `created_at` | TIMESTAMPTZ | NOT NULL, default now() | Profile creation timestamp |
| `updated_at` | TIMESTAMPTZ | NOT NULL, default now() | Last update timestamp |

**Validation Rules**:
- `display_name`: 1-50 characters
- `household_id`: NULL until user creates or joins a household

**State Transitions**:
1. `no_household` → `in_household` (create or join)
2. User cannot leave household (would orphan data)

---

### Box

A physical storage container with auto-generated funky name.

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `id` | UUID | PK, default gen_random_uuid() | Unique identifier |
| `household_id` | UUID | FK → households(id), NOT NULL | Owning household |
| `funky_name` | VARCHAR(100) | NOT NULL | Auto-generated "adjective-animal-noun" |
| `created_at` | TIMESTAMPTZ | NOT NULL, default now() | Creation timestamp |
| `updated_at` | TIMESTAMPTZ | NOT NULL, default now() | Last update timestamp |

**Validation Rules**:
- `funky_name`: Format "word-word-word", 3-100 characters
- No custom names allowed (only regenerate)

**State Transitions**: None (exists or deleted)

**Indexes**:
- `idx_boxes_household_id` on `household_id` (query by household)
- `idx_boxes_funky_name` on `funky_name` (search)

---

### Item

Something stored in a box.

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `id` | UUID | PK, default gen_random_uuid() | Unique identifier |
| `box_id` | UUID | FK → boxes(id), NOT NULL, ON DELETE CASCADE | Parent box |
| `name` | VARCHAR(200) | NOT NULL | Item name (searchable) |
| `description` | TEXT | NULL | Optional details |
| `created_at` | TIMESTAMPTZ | NOT NULL, default now() | Creation timestamp |
| `updated_at` | TIMESTAMPTZ | NOT NULL, default now() | Last update timestamp |

**Validation Rules**:
- `name`: 1-200 characters, trimmed
- `description`: 0-2000 characters
- Duplicate names allowed (user may have multiple of same item)

**State Transitions**: None (can be moved between boxes via `box_id` update)

**Indexes**:
- `idx_items_box_id` on `box_id` (items by box)
- `idx_items_name_search` on `lower(name)` (case-insensitive search)
- Consider: `gin` index on `to_tsvector('english', name)` for full-text

---

## Derived Data (Computed at Query Time)

### QR Code URL

Computed from box ID, not stored:
```
https://{app-domain}/box/{box.id}
```

### Item Count per Box

Computed via COUNT aggregate, not denormalized:
```sql
SELECT b.*, COUNT(i.id) as item_count 
FROM boxes b 
LEFT JOIN items i ON i.box_id = b.id 
GROUP BY b.id
```

---

## Row Level Security (RLS) Policies

### Households

```sql
-- Users can only see their own household
CREATE POLICY "Users can view own household"
ON households FOR SELECT
USING (id = (SELECT household_id FROM users WHERE id = auth.uid()));

-- Only owner can update household
CREATE POLICY "Owner can update household"
ON households FOR UPDATE
USING (owner_id = auth.uid());
```

### Users (profiles table)

```sql
-- Users can view members of their household
CREATE POLICY "View household members"
ON users FOR SELECT
USING (household_id = (SELECT household_id FROM users WHERE id = auth.uid()));

-- Users can update their own profile
CREATE POLICY "Update own profile"
ON users FOR UPDATE
USING (id = auth.uid());
```

### Boxes

```sql
-- Household members can view boxes
CREATE POLICY "View household boxes"
ON boxes FOR SELECT
USING (household_id = (SELECT household_id FROM users WHERE id = auth.uid()));

-- Household members can create boxes
CREATE POLICY "Create household boxes"
ON boxes FOR INSERT
WITH CHECK (household_id = (SELECT household_id FROM users WHERE id = auth.uid()));

-- Any household member can update boxes
CREATE POLICY "Update household boxes"
ON boxes FOR UPDATE
USING (household_id = (SELECT household_id FROM users WHERE id = auth.uid()));

-- Any household member can delete boxes
CREATE POLICY "Delete household boxes"
ON boxes FOR DELETE
USING (household_id = (SELECT household_id FROM users WHERE id = auth.uid()));
```

### Items

```sql
-- Household members can view items (via box relationship)
CREATE POLICY "View household items"
ON items FOR SELECT
USING (box_id IN (
  SELECT id FROM boxes 
  WHERE household_id = (SELECT household_id FROM users WHERE id = auth.uid())
));

-- Household members can create items
CREATE POLICY "Create household items"
ON items FOR INSERT
WITH CHECK (box_id IN (
  SELECT id FROM boxes 
  WHERE household_id = (SELECT household_id FROM users WHERE id = auth.uid())
));

-- Any household member can update items
CREATE POLICY "Update household items"
ON items FOR UPDATE
USING (box_id IN (
  SELECT id FROM boxes 
  WHERE household_id = (SELECT household_id FROM users WHERE id = auth.uid())
));

-- Any household member can delete items
CREATE POLICY "Delete household items"
ON items FOR DELETE
USING (box_id IN (
  SELECT id FROM boxes 
  WHERE household_id = (SELECT household_id FROM users WHERE id = auth.uid())
));
```

---

## TypeScript Types

```typescript
// Generated from Supabase schema (supabase gen types typescript)

export interface Database {
  public: {
    Tables: {
      households: {
        Row: {
          id: string
          name: string
          owner_id: string
          invite_code: string
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          owner_id: string
          invite_code?: string
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          owner_id?: string
          invite_code?: string
          created_at?: string
        }
      }
      users: {
        Row: {
          id: string
          household_id: string | null
          display_name: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          household_id?: string | null
          display_name: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          household_id?: string | null
          display_name?: string
          created_at?: string
          updated_at?: string
        }
      }
      boxes: {
        Row: {
          id: string
          household_id: string
          funky_name: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          household_id: string
          funky_name: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          household_id?: string
          funky_name?: string
          created_at?: string
          updated_at?: string
        }
      }
      items: {
        Row: {
          id: string
          box_id: string
          name: string
          description: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          box_id: string
          name: string
          description?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          box_id?: string
          name?: string
          description?: string | null
          created_at?: string
          updated_at?: string
        }
      }
    }
  }
}

// Application types
export type Household = Database['public']['Tables']['households']['Row']
export type User = Database['public']['Tables']['users']['Row']
export type Box = Database['public']['Tables']['boxes']['Row']
export type Item = Database['public']['Tables']['items']['Row']

export type BoxWithItems = Box & { items: Item[]; item_count: number }
export type SearchResult = { item: Item; box: Box }
```

