# API Routes: BoxSort Core MVP

**Date**: 2025-12-08  
**Branch**: `001-core-mvp`

## Overview

BoxSort uses Next.js App Router with Supabase. Most data operations use Supabase client directly with RLS policies. API routes are only needed for:
1. Server Actions (form submissions)
2. Operations requiring server-side logic
3. Public endpoints (QR code landing)

## Authentication

All authenticated routes use Supabase session from cookies (via `@supabase/ssr`).

```typescript
// Pattern for authenticated route
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

async function getSupabase() {
  const cookieStore = await cookies()
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return cookieStore.getAll() },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => 
            cookieStore.set(name, value, options))
        }
      }
    }
  )
}
```

---

## Routes

### POST `/api/boxes`

Create a new box with auto-generated funky name.

**Request Body:**
```typescript
{
  funky_name: string  // Generated client-side
}
```

**Response (201):**
```typescript
{
  id: string
  household_id: string
  funky_name: string
  created_at: string
  updated_at: string
}
```

**Errors:**
- `401`: Not authenticated
- `400`: Missing funky_name
- `403`: User has no household

---

### PATCH `/api/boxes/[id]`

Regenerate box funky name.

**Request Body:**
```typescript
{
  funky_name: string  // New generated name
}
```

**Response (200):**
```typescript
{
  id: string
  household_id: string
  funky_name: string
  created_at: string
  updated_at: string
}
```

**Errors:**
- `401`: Not authenticated
- `404`: Box not found
- `403`: Box not in user's household

---

### DELETE `/api/boxes/[id]`

Delete a box and all its items.

**Response (200):**
```typescript
{
  success: true
}
```

**Errors:**
- `401`: Not authenticated
- `404`: Box not found
- `403`: Box not in user's household

---

### POST `/api/items`

Add item to a box.

**Request Body:**
```typescript
{
  box_id: string
  name: string
  description?: string
}
```

**Response (201):**
```typescript
{
  id: string
  box_id: string
  name: string
  description: string | null
  created_at: string
  updated_at: string
}
```

**Errors:**
- `401`: Not authenticated
- `400`: Missing box_id or name
- `403`: Box not in user's household

---

### PATCH `/api/items/[id]`

Update item name or description.

**Request Body:**
```typescript
{
  name?: string
  description?: string
  box_id?: string  // For moving items between boxes
}
```

**Response (200):**
```typescript
{
  id: string
  box_id: string
  name: string
  description: string | null
  created_at: string
  updated_at: string
}
```

**Errors:**
- `401`: Not authenticated
- `404`: Item not found
- `403`: Item not in user's household

---

### DELETE `/api/items/[id]`

Delete an item.

**Response (200):**
```typescript
{
  success: true
}
```

**Errors:**
- `401`: Not authenticated
- `404`: Item not found
- `403`: Item not in user's household

---

### GET `/api/search?q={query}`

Search items and boxes by name.

**Query Parameters:**
- `q`: Search query (required, min 1 char)

**Response (200):**
```typescript
{
  results: Array<{
    item_id: string
    item_name: string
    item_description: string | null
    box_id: string
    box_funky_name: string
  }>
}
```

**Errors:**
- `401`: Not authenticated
- `400`: Missing query parameter

---

### POST `/api/invite`

Generate or regenerate household invite link.

**Response (200):**
```typescript
{
  invite_code: string
  invite_url: string  // Full URL with code
}
```

**Errors:**
- `401`: Not authenticated
- `403`: User is not household owner

---

### POST `/api/join`

Join a household using invite code.

**Request Body:**
```typescript
{
  code: string
}
```

**Response (200):**
```typescript
{
  household_id: string
  household_name: string
}
```

**Errors:**
- `401`: Not authenticated
- `400`: Missing or invalid code
- `409`: User already in a household

---

### GET `/box/[id]` (Page Route - Public)

Public page for QR code scanning. Shows box name and items without requiring authentication.

**Response**: HTML page with:
- Box funky name
- List of items
- Prompt to sign in for full access

**Note**: This is a Next.js page route, not an API route.

---

## Server Actions

For form submissions, use Next.js Server Actions instead of API routes:

```typescript
// src/app/(dashboard)/actions.ts
'use server'

import { revalidatePath } from 'next/cache'
import { getSupabase } from '@/lib/supabase/server'

export async function createBox(funkyName: string) {
  const supabase = await getSupabase()
  const { data: user } = await supabase.auth.getUser()
  
  if (!user.user) throw new Error('Not authenticated')
  
  const { data: profile } = await supabase
    .from('users')
    .select('household_id')
    .eq('id', user.user.id)
    .single()
  
  if (!profile?.household_id) throw new Error('No household')
  
  const { data, error } = await supabase
    .from('boxes')
    .insert({ 
      household_id: profile.household_id, 
      funky_name: funkyName 
    })
    .select()
    .single()
  
  if (error) throw error
  
  revalidatePath('/')
  return data
}

export async function deleteBox(boxId: string) {
  const supabase = await getSupabase()
  
  const { error } = await supabase
    .from('boxes')
    .delete()
    .eq('id', boxId)
  
  if (error) throw error
  
  revalidatePath('/')
  return { success: true }
}

export async function addItem(boxId: string, name: string, description?: string) {
  const supabase = await getSupabase()
  
  const { data, error } = await supabase
    .from('items')
    .insert({ box_id: boxId, name, description })
    .select()
    .single()
  
  if (error) throw error
  
  revalidatePath(`/boxes/${boxId}`)
  return data
}

export async function deleteItem(itemId: string, boxId: string) {
  const supabase = await getSupabase()
  
  const { error } = await supabase
    .from('items')
    .delete()
    .eq('id', itemId)
  
  if (error) throw error
  
  revalidatePath(`/boxes/${boxId}`)
  return { success: true }
}

export async function searchItems(query: string) {
  const supabase = await getSupabase()
  
  const { data, error } = await supabase
    .rpc('search_items', { search_query: query })
  
  if (error) throw error
  
  return data
}
```

---

## Realtime Subscriptions

Handled client-side, not via API routes:

```typescript
// src/lib/hooks/use-boxes.ts
'use client'

import { useEffect, useState } from 'react'
import { createBrowserClient } from '@/lib/supabase/client'
import type { Box } from '@/lib/supabase/types'

export function useBoxes(householdId: string) {
  const [boxes, setBoxes] = useState<Box[]>([])
  const supabase = createBrowserClient()
  
  useEffect(() => {
    // Initial fetch
    supabase
      .from('boxes')
      .select('*')
      .eq('household_id', householdId)
      .order('created_at', { ascending: false })
      .then(({ data }) => setBoxes(data || []))
    
    // Realtime subscription
    const channel = supabase
      .channel('boxes-changes')
      .on(
        'postgres_changes',
        { 
          event: '*', 
          schema: 'public', 
          table: 'boxes',
          filter: `household_id=eq.${householdId}`
        },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            setBoxes(prev => [payload.new as Box, ...prev])
          } else if (payload.eventType === 'UPDATE') {
            setBoxes(prev => prev.map(b => 
              b.id === payload.new.id ? payload.new as Box : b
            ))
          } else if (payload.eventType === 'DELETE') {
            setBoxes(prev => prev.filter(b => b.id !== payload.old.id))
          }
        }
      )
      .subscribe()
    
    return () => { supabase.removeChannel(channel) }
  }, [householdId, supabase])
  
  return boxes
}
```

---

## Error Response Format

All API errors return:

```typescript
{
  error: {
    code: string        // e.g., "NOT_AUTHENTICATED"
    message: string     // Human-readable message
  }
}
```

HTTP Status Codes:
- `200`: Success
- `201`: Created
- `400`: Bad Request (validation error)
- `401`: Unauthorized (not logged in)
- `403`: Forbidden (no permission)
- `404`: Not Found
- `409`: Conflict (e.g., already in household)
- `500`: Internal Server Error

