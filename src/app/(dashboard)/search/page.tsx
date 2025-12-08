'use client'

export const dynamic = 'force-dynamic'

import { useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { SearchBar } from '@/components/search/search-bar'
import { SearchResults } from '@/components/search/search-results'
import { useSearch } from '@/lib/hooks/use-search'

function SearchContent() {
  const searchParams = useSearchParams()
  const initialQuery = searchParams.get('q') || ''
  const { results, loading, error, search, query } = useSearch()

  useEffect(() => {
    if (initialQuery) {
      search(initialQuery)
    }
  }, [initialQuery]) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <h1 className="text-3xl font-bold mb-6">Search</h1>

      <div className="mb-8">
        <SearchBar
          defaultValue={initialQuery}
          onSearch={search}
          placeholder="Search for items or boxes..."
          autoFocus
        />
      </div>

      {error && (
        <div className="mb-4 p-3 text-sm text-destructive bg-destructive/10 rounded-md">{error}</div>
      )}

      <SearchResults results={results} loading={loading} query={query} />
    </div>
  )
}

export default function SearchPage() {
  return (
    <Suspense fallback={<div className="container mx-auto px-4 py-8">Loading...</div>}>
      <SearchContent />
    </Suspense>
  )
}

