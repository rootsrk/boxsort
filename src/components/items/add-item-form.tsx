'use client'

import { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

interface AddItemFormProps {
  onAddItem: (name: string, description?: string) => Promise<unknown>
  autoFocus?: boolean
}

export function AddItemForm({ onAddItem, autoFocus }: AddItemFormProps) {
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (autoFocus && inputRef.current) {
      inputRef.current.focus()
    }
  }, [autoFocus])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim()) return

    setLoading(true)
    try {
      await onAddItem(name.trim())
      setName('')
      // Keep focus for adding more items
      inputRef.current?.focus()
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <Input
        ref={inputRef}
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Add item (e.g., Winter Jacket)"
        disabled={loading}
        className="flex-1"
      />
      <Button type="submit" disabled={loading || !name.trim()}>
        {loading ? 'Adding...' : 'Add'}
      </Button>
    </form>
  )
}

