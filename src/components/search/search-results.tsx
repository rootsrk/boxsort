'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { TypeBadge } from '@/components/types/type-badge'
import { useItemImage } from '@/lib/hooks/use-item-image'
import { createBrowserClient } from '@/lib/supabase/client'
import type { SearchResult, Type } from '@/lib/supabase/types'

interface SearchResultsProps {
  results: SearchResult[]
  loading?: boolean
  query?: string
  householdId: string | null
}

export function SearchResults({ results, loading, query, householdId }: SearchResultsProps) {
  const { getSignedUrl } = useItemImage()
  const supabase = createBrowserClient()

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
        <SearchResultCard
          key={result.item_id}
          result={result}
          householdId={householdId}
          getSignedUrl={getSignedUrl}
        />
      ))}
    </div>
  )
}

function SearchResultCard({
  result,
  householdId,
  getSignedUrl,
}: {
  result: SearchResult
  householdId: string | null
  getSignedUrl: (path: string, householdId: string) => Promise<string | null>
}) {
  const [imageUrl, setImageUrl] = useState<string | null>(null)
  const [types, setTypes] = useState<Type[]>([])

  useEffect(() => {
    async function loadImage() {
      if (result.item_image_url && householdId) {
        const signedUrl = await getSignedUrl(result.item_image_url, householdId)
        if (signedUrl) {
          setImageUrl(signedUrl)
        }
      }
    }

    async function loadTypes() {
      if (result.types && typeof result.types === 'object') {
        // Types come as JSONB from the database function
        const typesArray = Array.isArray(result.types) ? result.types : []
        setTypes(typesArray as Type[])
      }
    }

    loadImage()
    loadTypes()
  }, [result.item_image_url, result.types, householdId, getSignedUrl])

  const placeholderSvg = (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="48"
      height="48"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="text-muted-foreground"
    >
      <rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
      <circle cx="9" cy="9" r="2" />
      <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
    </svg>
  )

  return (
    <Link href={`/boxes/${result.box_id}?item=${result.item_id}`}>
      <Card className="hover:shadow-md transition-shadow cursor-pointer">
        <CardContent className="p-4">
          <div className="flex gap-4">
            {imageUrl ? (
              <div className="relative w-20 h-20 flex-shrink-0 rounded overflow-hidden bg-muted/50">
                <Image src={imageUrl} alt={result.item_name} fill className="object-cover" />
              </div>
            ) : (
              <div className="w-20 h-20 flex-shrink-0 flex items-center justify-center bg-muted/50 rounded">
                {placeholderSvg}
              </div>
            )}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium truncate">{result.item_name}</h3>
                  {result.item_description && (
                    <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                      {result.item_description}
                    </p>
                  )}
                  {types.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {types.map((type) => (
                        <TypeBadge key={type.id} name={type.name} color={type.color} />
                      ))}
                    </div>
                  )}
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-sm font-mono text-primary">{result.box_funky_name}</p>
                  <p className="text-xs text-muted-foreground">in box</p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}

