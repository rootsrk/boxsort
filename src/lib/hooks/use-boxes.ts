'use client'

import { useEffect, useState, useCallback } from 'react'
import { createBrowserClient } from '@/lib/supabase/client'
import type { Box } from '@/lib/supabase/types'

interface BoxWithItemCount extends Box {
  item_count: number
}

interface UseBoxesReturn {
  boxes: BoxWithItemCount[]
  loading: boolean
  error: string | null
  refresh: () => Promise<void>
  addBox: (funkyName: string) => Promise<Box | null>
  updateBox: (id: string, funkyName: string) => Promise<Box | null>
  deleteBox: (id: string) => Promise<boolean>
}

export function useBoxes(householdId: string | null): UseBoxesReturn {
  const [boxes, setBoxes] = useState<BoxWithItemCount[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const supabase = createBrowserClient()

  const loadBoxes = useCallback(async () => {
    if (!householdId) {
      setBoxes([])
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError(null)

      // Get boxes with item count
      const { data, error: fetchError } = await supabase
        .from('boxes')
        .select(`
          *,
          items:items(count)
        `)
        .eq('household_id', householdId)
        .order('created_at', { ascending: false })

      if (fetchError) {
        setError(fetchError.message)
        return
      }

      // Transform to include item_count
      const boxesWithCount = (data || []).map((box) => ({
        ...box,
        item_count: box.items?.[0]?.count || 0,
        items: undefined, // Remove nested items array
      })) as BoxWithItemCount[]

      setBoxes(boxesWithCount)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load boxes')
    } finally {
      setLoading(false)
    }
  }, [householdId, supabase])

  // Set up realtime subscription
  useEffect(() => {
    if (!householdId) return

    loadBoxes()

    const channel = supabase
      .channel('boxes-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'boxes',
          filter: `household_id=eq.${householdId}`,
        },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            const newBox = payload.new as Box
            setBoxes((prev) => [{ ...newBox, item_count: 0 }, ...prev])
          } else if (payload.eventType === 'UPDATE') {
            const updatedBox = payload.new as Box
            setBoxes((prev) =>
              prev.map((b) => (b.id === updatedBox.id ? { ...b, ...updatedBox } : b))
            )
          } else if (payload.eventType === 'DELETE') {
            const deletedId = payload.old.id
            setBoxes((prev) => prev.filter((b) => b.id !== deletedId))
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [householdId, supabase, loadBoxes])

  const addBox = async (funkyName: string): Promise<Box | null> => {
    if (!householdId) return null

    const { data, error: insertError } = await supabase
      .from('boxes')
      .insert({
        household_id: householdId,
        funky_name: funkyName,
      })
      .select()
      .single()

    if (insertError) {
      throw new Error(insertError.message)
    }

    // Optimistic update - add to local state immediately
    if (data) {
      setBoxes((prev) => [{ ...data, item_count: 0 }, ...prev])
    }

    return data
  }

  const updateBox = async (id: string, funkyName: string): Promise<Box | null> => {
    const { data, error: updateError } = await supabase
      .from('boxes')
      .update({ funky_name: funkyName })
      .eq('id', id)
      .select()
      .single()

    if (updateError) {
      throw new Error(updateError.message)
    }

    return data
  }

  const deleteBox = async (id: string): Promise<boolean> => {
    // Optimistic update - remove from local state immediately
    setBoxes((prev) => prev.filter((b) => b.id !== id))

    const { error: deleteError } = await supabase.from('boxes').delete().eq('id', id)

    if (deleteError) {
      // Revert on error
      loadBoxes()
      throw new Error(deleteError.message)
    }

    return true
  }

  return {
    boxes,
    loading,
    error,
    refresh: loadBoxes,
    addBox,
    updateBox,
    deleteBox,
  }
}

