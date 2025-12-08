'use client'

import { ItemRow } from './item-row'
import { Skeleton } from '@/components/ui/skeleton'
import type { Item } from '@/lib/supabase/types'

interface ItemListProps {
  items: Item[]
  loading?: boolean
  onUpdateItem: (id: string, name: string, description?: string) => Promise<unknown>
  onDeleteItem: (id: string) => Promise<unknown>
  emptyMessage?: string
}

export function ItemList({
  items,
  loading,
  onUpdateItem,
  onDeleteItem,
  emptyMessage = 'No items in this box yet.',
}: ItemListProps) {
  if (loading) {
    return (
      <div className="space-y-2">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex items-center gap-2 py-2 px-3 border-b">
            <Skeleton className="h-5 flex-1" />
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
    <div className="border rounded-md">
      {items.map((item) => (
        <ItemRow key={item.id} item={item} onUpdate={onUpdateItem} onDelete={onDeleteItem} />
      ))}
    </div>
  )
}

