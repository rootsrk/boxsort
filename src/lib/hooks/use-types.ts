'use client'

import { useState, useEffect, useCallback } from 'react'
import { createBrowserClient } from '@/lib/supabase/client'
import { getTypeColor } from '@/lib/utils/type-colors'
import type { Type } from '@/lib/supabase/types'

interface UseTypesReturn {
  types: Type[]
  loading: boolean
  error: string | null
  createType: (name: string) => Promise<Type | null>
  updateType: (id: string, updates: Partial<Type>) => Promise<Type | null>
  deleteType: (id: string) => Promise<boolean>
  refresh: () => Promise<void>
}

export function useTypes(householdId: string | null): UseTypesReturn {
  const [types, setTypes] = useState<Type[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const supabase = createBrowserClient()

  const loadTypes = useCallback(async () => {
    if (!householdId) {
      setTypes([])
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError(null)

      const { data, error: fetchError } = await supabase
        .from('types')
        .select('*')
        .eq('household_id', householdId)
        .order('name', { ascending: true })

      if (fetchError) {
        setError(fetchError.message)
        return
      }

      // Deduplicate types by ID (in case of any duplicates)
      const uniqueTypes = (data || []).filter(
        (type: Type, index: number, self: Type[]) =>
          index === self.findIndex((t) => t.id === type.id)
      )
      setTypes(uniqueTypes)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load types')
    } finally {
      setLoading(false)
    }
  }, [householdId, supabase])

  useEffect(() => {
    loadTypes()

    // Set up realtime subscription
    if (!householdId) return

    const channel = supabase
      .channel('types-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'types',
          filter: `household_id=eq.${householdId}`,
        },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            const newType = payload.new as Type
            setTypes((prev) => {
              // Check if type already exists (from optimistic update)
              if (prev.some((t) => t.id === newType.id)) {
                return prev
              }
              return [...prev, newType].sort((a, b) => a.name.localeCompare(b.name))
            })
          } else if (payload.eventType === 'UPDATE') {
            const updatedType = payload.new as Type
            setTypes((prev) =>
              prev.map((t) => (t.id === updatedType.id ? updatedType : t))
            )
          } else if (payload.eventType === 'DELETE') {
            const deletedId = payload.old.id
            setTypes((prev) => prev.filter((t) => t.id !== deletedId))
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [householdId, supabase, loadTypes])

  const createType = useCallback(
    async (name: string): Promise<Type | null> => {
      if (!householdId) return null

      const trimmedName = name.trim()
      if (!trimmedName) return null

      // Check if type already exists (case-insensitive)
      const existing = types.find((t) => t.name.toLowerCase() === trimmedName.toLowerCase())
      if (existing) {
        return existing
      }

      const color = getTypeColor(trimmedName)

      const { data, error: insertError } = await supabase
        .from('types')
        .insert({
          household_id: householdId,
          name: trimmedName,
          color,
        })
        .select()
        .single()

      if (insertError) {
        setError(insertError.message)
        return null
      }

      // Optimistic update - check if already exists to prevent duplicates
      if (data) {
        setTypes((prev) => {
          // Check if type already exists (shouldn't happen, but be safe)
          if (prev.some((t) => t.id === data.id)) {
            return prev.map((t) => (t.id === data.id ? data : t))
          }
          return [...prev, data].sort((a, b) => a.name.localeCompare(b.name))
        })
      }

      return data
    },
    [householdId, types, supabase]
  )

  const updateType = useCallback(
    async (id: string, updates: Partial<Type>): Promise<Type | null> => {
      const { data, error: updateError } = await supabase
        .from('types')
        .update(updates)
        .eq('id', id)
        .select()
        .single()

      if (updateError) {
        setError(updateError.message)
        return null
      }

      // Optimistic update
      if (data) {
        setTypes((prev) => prev.map((t) => (t.id === id ? data : t)))
      }

      return data
    },
    [supabase]
  )

  const deleteType = useCallback(
    async (id: string): Promise<boolean> => {
      // Optimistic update
      setTypes((prev) => prev.filter((t) => t.id !== id))

      const { error: deleteError } = await supabase.from('types').delete().eq('id', id)

      if (deleteError) {
        // Revert on error
        loadTypes()
        setError(deleteError.message)
        return false
      }

      return true
    },
    [supabase, loadTypes]
  )

  return {
    types,
    loading,
    error,
    createType,
    updateType,
    deleteType,
    refresh: loadTypes,
  }
}

