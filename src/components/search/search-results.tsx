'use client'

import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import type { SearchResult } from '@/lib/supabase/types'

interface SearchResultsProps {
  results: SearchResult[]
  loading?: boolean
  query?: string
}

export function SearchResults({ results, loading, query }: SearchResultsProps) {
  if (loading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <Card key={i}>
            <CardContent className="p-4">
              <Skeleton className="h-5 w-3/4 mb-2" />
              <Skeleton className="h-4 w-1/2" />
            </CardContent>
          </Card>
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

  return (
    <div className="space-y-3">
      <p className="text-sm text-muted-foreground mb-4">
        Found {results.length} {results.length === 1 ? 'item' : 'items'} matching &quot;{query}&quot;
      </p>
      {results.map((result) => (
        <Link key={result.item_id} href={`/boxes/${result.box_id}`}>
          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-medium">{result.item_name}</h3>
                  {result.item_description && (
                    <p className="text-sm text-muted-foreground mt-1">{result.item_description}</p>
                  )}
                </div>
                <div className="text-right">
                  <p className="text-sm font-mono text-primary">{result.box_funky_name}</p>
                  <p className="text-xs text-muted-foreground">in box</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </Link>
      ))}
    </div>
  )
}

