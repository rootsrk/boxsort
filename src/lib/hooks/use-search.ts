'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import { createBrowserClient } from '@/lib/supabase/client'
import type { SearchResult } from '@/lib/supabase/types'

interface UseSearchReturn {
  results: SearchResult[]
  loading: boolean
  error: string | null
  search: (query: string) => void
  query: string
}

export function useSearch(debounceMs = 300): UseSearchReturn {
  const [results, setResults] = useState<SearchResult[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [query, setQuery] = useState('')
  
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const supabase = createBrowserClient()

  const performSearch = useCallback(
    async (searchQuery: string) => {
      if (!searchQuery.trim()) {
        setResults([])
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        setError(null)

        const { data, error: searchError } = await supabase.rpc('search_items', {
          search_query: searchQuery.trim(),
        })

        if (searchError) {
          setError(searchError.message)
          return
        }

        setResults(data || [])
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Search failed')
      } finally {
        setLoading(false)
      }
    },
    [supabase]
  )

  const search = useCallback(
    (newQuery: string) => {
      setQuery(newQuery)

      // Clear existing timeout
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }

      // If empty query, clear results immediately
      if (!newQuery.trim()) {
        setResults([])
        setLoading(false)
        return
      }

      // Set loading state immediately for better UX
      setLoading(true)

      // Debounce the actual search
      timeoutRef.current = setTimeout(() => {
        performSearch(newQuery)
      }, debounceMs)
    },
    [debounceMs, performSearch]
  )

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [])

  return {
    results,
    loading,
    error,
    search,
    query,
  }
}

