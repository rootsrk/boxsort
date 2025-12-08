'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Input } from '@/components/ui/input'

interface SearchBarProps {
  defaultValue?: string
  onSearch?: (query: string) => void
  placeholder?: string
  autoFocus?: boolean
}

export function SearchBar({
  defaultValue = '',
  onSearch,
  placeholder = 'Search items...',
  autoFocus = false,
}: SearchBarProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const initialQuery = searchParams.get('q') || defaultValue || ''
  const [query, setQuery] = useState(initialQuery)

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (query.trim()) {
      if (onSearch) {
        onSearch(query.trim())
      } else {
        router.push(`/search?q=${encodeURIComponent(query.trim())}`)
      }
    }
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const newQuery = e.target.value
    setQuery(newQuery)
    if (onSearch) {
      onSearch(newQuery)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="w-full">
      <div className="relative">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
        >
          <circle cx="11" cy="11" r="8" />
          <path d="m21 21-4.3-4.3" />
        </svg>
        <Input
          type="search"
          placeholder={placeholder}
          value={query}
          onChange={handleChange}
          className="pl-10"
          autoFocus={autoFocus}
        />
      </div>
    </form>
  )
}

