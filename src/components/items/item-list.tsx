'use client'

import { ItemCard } from './item-card'
import { Skeleton } from '@/components/ui/skeleton'
import type { ItemWithTypes } from '@/lib/supabase/types'

interface ItemListProps {
  items: ItemWithTypes[]
  loading?: boolean
  boxId: string
  householdId: string
  onDeleteItem?: (id: string) => Promise<void>
  emptyMessage?: string
}

export function ItemList({
  items,
  loading,
  boxId,
  householdId,
  onDeleteItem,
  emptyMessage = 'No items in this box yet.',
}: ItemListProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="border rounded-lg overflow-hidden">
            <Skeleton className="aspect-square w-full" />
            <div className="p-4 space-y-2">
              <Skeleton className="h-5 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (items.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <p>{emptyMessage}</p>
        <p className="text-sm mt-1">Add items using the form above.</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {items.map((item) => (
        <ItemCard
          key={item.id}
          item={item}
          boxId={boxId}
          householdId={householdId}
          onDelete={onDeleteItem}
        />
      ))}
    </div>
  )
}

