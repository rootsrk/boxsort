'use client'

import { useEffect, useState, useCallback } from 'react'
import { createBrowserClient } from '@/lib/supabase/client'
import type { Item, Type, ItemWithTypes } from '@/lib/supabase/types'

interface UseItemsReturn {
  items: ItemWithTypes[]
  loading: boolean
  error: string | null
  refresh: () => Promise<void>
  addItem: (name: string, description?: string, imageUrl?: string | null, typeIds?: string[]) => Promise<ItemWithTypes | null>
  updateItem: (id: string, name: string, description?: string, imageUrl?: string | null, typeIds?: string[]) => Promise<ItemWithTypes | null>
  deleteItem: (id: string) => Promise<boolean>
  moveItem: (id: string, newBoxId: string) => Promise<boolean>
}

export function useItems(boxId: string | null): UseItemsReturn {
  const [items, setItems] = useState<ItemWithTypes[]>([])
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
        .select(`
          *,
          item_types (
            type:types (*)
          )
        `)
        .eq('box_id', boxId)
        .order('created_at', { ascending: false })

      if (fetchError) {
        setError(fetchError.message)
        return
      }

      // Transform items to include types array
      const itemsWithTypes: ItemWithTypes[] = (data || []).map((item: any) => {
        const types = (item.item_types || [])
          .map((it: any) => it.type)
          .filter(Boolean)
          .filter((type: Type, index: number, self: Type[]) =>
            index === self.findIndex((t) => t.id === type.id)
          ) as Type[]
        return {
          ...item,
          types: types || [],
        }
      })
      setItems(itemsWithTypes)
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
        async (payload) => {
          if (payload.eventType === 'INSERT') {
            const newItem = payload.new as Item
            // Check if item already exists (from optimistic update) before adding
            setItems((prev) => {
              // If item already exists, just update its types if needed
              if (prev.some((i) => i.id === newItem.id)) {
                // Item already exists from optimistic update, just refresh types
                supabase
                  .from('item_types')
                  .select('type:types(*)')
                  .eq('item_id', newItem.id)
                  .then(({ data: typesData }) => {
                    const types = (typesData || [])
                      .map((it: any) => it.type)
                      .filter(Boolean)
                      .filter((type: Type, index: number, self: Type[]) =>
                        index === self.findIndex((t) => t.id === type.id)
                      ) as Type[]
                    setItems((current) =>
                      current.map((i) => (i.id === newItem.id ? { ...i, types } : i))
                    )
                  })
                return prev
              }
              // Item doesn't exist, fetch types and add it
              supabase
                .from('item_types')
                .select('type:types(*)')
                .eq('item_id', newItem.id)
                .then(({ data: typesData }) => {
                  const types = (typesData || [])
                    .map((it: any) => it.type)
                    .filter(Boolean)
                    .filter((type: Type, index: number, self: Type[]) =>
                      index === self.findIndex((t) => t.id === type.id)
                    ) as Type[]
                  setItems((current) => {
                    // Double-check it wasn't added in the meantime
                    if (current.some((i) => i.id === newItem.id)) {
                      return current.map((i) => (i.id === newItem.id ? { ...i, types } : i))
                    }
                    return [{ ...newItem, types }, ...current]
                  })
                })
              return prev
            })
          } else if (payload.eventType === 'UPDATE') {
            const updatedItem = payload.new as Item
            // Fetch types for the updated item
            const { data: typesData } = await supabase
              .from('item_types')
              .select('type:types(*)')
              .eq('item_id', updatedItem.id)
            const types = (typesData || [])
              .map((it: any) => it.type)
              .filter(Boolean)
              .filter((type: Type, index: number, self: Type[]) =>
                index === self.findIndex((t) => t.id === type.id)
              ) as Type[]
            setItems((prev) => prev.map((i) => (i.id === updatedItem.id ? { ...updatedItem, types } : i)))
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

  const addItem = async (
    name: string,
    description?: string,
    imageUrl?: string | null,
    typeIds?: string[]
  ): Promise<ItemWithTypes | null> => {
    if (!boxId) return null

    const { data, error: insertError } = await supabase
      .from('items')
      .insert({
        box_id: boxId,
        name,
        description: description || null,
        image_url: imageUrl || null,
      })
      .select()
      .single()

    if (insertError) {
      throw new Error(insertError.message)
    }

    // Add types if provided
    if (data && typeIds && typeIds.length > 0) {
      const { error: typeError } = await supabase.from('item_types').insert(
        typeIds.map((typeId) => ({
          item_id: data.id,
          type_id: typeId,
        }))
      )
      if (typeError) {
        // Continue anyway - item is created, types can be added later
      }
    }

    // Fetch the item with types
    const { data: itemWithTypes } = await supabase
      .from('items')
      .select(`
        *,
        item_types (
          type:types (*)
        )
      `)
      .eq('id', data.id)
      .single()

    const types = (itemWithTypes?.item_types || [])
      .map((it: any) => it.type)
      .filter(Boolean)
      .filter((type: Type, index: number, self: Type[]) =>
        index === self.findIndex((t) => t.id === type.id)
      ) as Type[]
    const itemWithTypesArray: ItemWithTypes = { ...data, types: types || [] }

    // Optimistic update - add to local state immediately
    if (data) {
      setItems((prev) => [itemWithTypesArray, ...prev])
    }

    return itemWithTypesArray
  }

  const updateItem = async (
    id: string,
    name: string,
    description?: string,
    imageUrl?: string | null,
    typeIds?: string[]
  ): Promise<ItemWithTypes | null> => {
    const { data, error: updateError } = await supabase
      .from('items')
      .update({
        name,
        description: description || null,
        image_url: imageUrl !== undefined ? imageUrl : undefined,
      })
      .eq('id', id)
      .select()
      .single()

    if (updateError) {
      throw new Error(updateError.message)
    }

    // Update types if provided
    if (typeIds !== undefined) {
      // Remove all existing types
      await supabase.from('item_types').delete().eq('item_id', id)
      // Add new types
      if (typeIds.length > 0) {
        await supabase.from('item_types').insert(
          typeIds.map((typeId) => ({
            item_id: id,
            type_id: typeId,
          }))
        )
      }
    }

    // Fetch the item with types
    const { data: itemWithTypes } = await supabase
      .from('items')
      .select(`
        *,
        item_types (
          type:types (*)
        )
      `)
      .eq('id', id)
      .single()

    const types = (itemWithTypes?.item_types || [])
      .map((it: any) => it.type)
      .filter(Boolean)
      .filter((type: Type, index: number, self: Type[]) =>
        index === self.findIndex((t) => t.id === type.id)
      ) as Type[]
    const itemWithTypesArray: ItemWithTypes = { ...data, types: types || [] }

    // Optimistic update
    if (data) {
      setItems((prev) => prev.map((i) => (i.id === id ? itemWithTypesArray : i)))
    }

    return itemWithTypesArray
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

