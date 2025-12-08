'use client'

import { Skeleton } from '@/components/ui/skeleton'
import { ItemCard } from '@/components/items/item-card'
import type { SearchResult, Item, Type } from '@/lib/supabase/types'

interface SearchResultsProps {
  results: SearchResult[]
  loading?: boolean
  query?: string
  householdId: string | null
}

export function SearchResults({ results, loading, query, householdId }: SearchResultsProps) {
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

  if (!query || !query.trim()) {
    return (
      <div className="text-center py-12">
        <div className="text-6xl mb-4">🔍</div>
        <p className="text-muted-foreground">Enter a search term to find items</p>
      </div>
    )
  }

  if (results.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-6xl mb-4">😕</div>
        <h3 className="text-lg font-semibold mb-2">No results found</h3>
        <p className="text-muted-foreground">
          No items matching &quot;{query}&quot; were found in your boxes.
        </p>
        <p className="text-sm text-muted-foreground mt-2">
          Try a different search term or check your spelling.
        </p>
      </div>
    )
  }

  // Convert SearchResult to Item format for ItemCard
  const items: (Item & { types?: Type[] })[] = results.map((result) => {
    const types = result.types && typeof result.types === 'object' 
      ? (Array.isArray(result.types) ? result.types as Type[] : [])
      : []
    
    return {
      id: result.item_id,
      box_id: result.box_id,
      name: result.item_name,
      description: result.item_description || null,
      image_url: result.item_image_url || null,
      created_at: '',
      updated_at: '',
      types,
    }
  })

  if (!householdId) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Please log in to view search results</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        Found {results.length} {results.length === 1 ? 'item' : 'items'} matching &quot;{query}&quot;
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {items.map((item) => (
          <ItemCard
            key={item.id}
            item={item}
            boxId={item.box_id}
            householdId={householdId}
          />
        ))}
      </div>
    </div>
  )
}

