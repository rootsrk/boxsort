'use client'

import { useEffect, useState, useCallback } from 'react'
import { createBrowserClient } from '@/lib/supabase/client'
import type { Item } from '@/lib/supabase/types'

interface UseItemsReturn {
  items: Item[]
  loading: boolean
  error: string | null
  refresh: () => Promise<void>
  addItem: (name: string, description?: string) => Promise<Item | null>
  updateItem: (id: string, name: string, description?: string) => Promise<Item | null>
  deleteItem: (id: string) => Promise<boolean>
  moveItem: (id: string, newBoxId: string) => Promise<boolean>
}

export function useItems(boxId: string | null): UseItemsReturn {
  const [items, setItems] = useState<Item[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const supabase = createBrowserClient()

  const loadItems = useCallback(async () => {
    if (!boxId) {
      setItems([])
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError(null)

      const { data, error: fetchError } = await supabase
        .from('items')
        .select('*')
        .eq('box_id', boxId)
        .order('created_at', { ascending: false })

      if (fetchError) {
        setError(fetchError.message)
        return
      }

      setItems(data || [])
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load items')
    } finally {
      setLoading(false)
    }
  }, [boxId, supabase])

  // Set up realtime subscription
  useEffect(() => {
    if (!boxId) return

    loadItems()

    const channel = supabase
      .channel(`items-${boxId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'items',
          filter: `box_id=eq.${boxId}`,
        },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            const newItem = payload.new as Item
            setItems((prev) => [newItem, ...prev])
          } else if (payload.eventType === 'UPDATE') {
            const updatedItem = payload.new as Item
            setItems((prev) => prev.map((i) => (i.id === updatedItem.id ? updatedItem : i)))
          } else if (payload.eventType === 'DELETE') {
            const deletedId = payload.old.id
            setItems((prev) => prev.filter((i) => i.id !== deletedId))
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [boxId, supabase, loadItems])

  const addItem = async (name: string, description?: string): Promise<Item | null> => {
    if (!boxId) return null

    const { data, error: insertError } = await supabase
      .from('items')
      .insert({
        box_id: boxId,
        name,
        description: description || null,
      })
      .select()
      .single()

    if (insertError) {
      throw new Error(insertError.message)
    }

    // Optimistic update - add to local state immediately
    if (data) {
      setItems((prev) => [data, ...prev])
    }

    return data
  }

  const updateItem = async (
    id: string,
    name: string,
    description?: string
  ): Promise<Item | null> => {
    const { data, error: updateError } = await supabase
      .from('items')
      .update({
        name,
        description: description || null,
      })
      .eq('id', id)
      .select()
      .single()

    if (updateError) {
      throw new Error(updateError.message)
    }

    // Optimistic update
    if (data) {
      setItems((prev) => prev.map((i) => (i.id === id ? data : i)))
    }

    return data
  }

  const deleteItem = async (id: string): Promise<boolean> => {
    // Optimistic update - remove from local state immediately
    setItems((prev) => prev.filter((i) => i.id !== id))

    const { error: deleteError } = await supabase.from('items').delete().eq('id', id)

    if (deleteError) {
      // Revert on error - reload items
      loadItems()
      throw new Error(deleteError.message)
    }

    return true
  }

  const moveItem = async (id: string, newBoxId: string): Promise<boolean> => {
    // Optimistic update - remove from current list
    setItems((prev) => prev.filter((i) => i.id !== id))

    const { error: moveError } = await supabase
      .from('items')
      .update({ box_id: newBoxId })
      .eq('id', id)

    if (moveError) {
      // Revert on error
      loadItems()
      throw new Error(moveError.message)
    }

    return true
  }

  return {
    items,
    loading,
    error,
    refresh: loadItems,
    addItem,
    updateItem,
    deleteItem,
    moveItem,
  }
}

