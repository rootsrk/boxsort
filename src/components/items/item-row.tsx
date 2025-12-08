'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import type { Item } from '@/lib/supabase/types'

interface ItemRowProps {
  item: Item
  onUpdate: (id: string, name: string, description?: string) => Promise<unknown>
  onDelete: (id: string) => Promise<unknown>
}

export function ItemRow({ item, onUpdate, onDelete }: ItemRowProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [editName, setEditName] = useState(item.name)
  const [loading, setLoading] = useState(false)

  async function handleSave() {
    if (!editName.trim()) return
    setLoading(true)
    try {
      await onUpdate(item.id, editName.trim())
      setIsEditing(false)
    } finally {
      setLoading(false)
    }
  }

  async function handleDelete() {
    if (!confirm('Delete this item?')) return
    setLoading(true)
    try {
      await onDelete(item.id)
    } finally {
      setLoading(false)
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter') {
      handleSave()
    } else if (e.key === 'Escape') {
      setEditName(item.name)
      setIsEditing(false)
    }
  }

  if (isEditing) {
    return (
      <div className="flex items-center gap-2 py-2 px-3 border-b">
        <Input
          value={editName}
          onChange={(e) => setEditName(e.target.value)}
          onKeyDown={handleKeyDown}
          autoFocus
          disabled={loading}
          className="flex-1"
        />
        <Button size="sm" onClick={handleSave} disabled={loading}>
          Save
        </Button>
        <Button
          size="sm"
          variant="ghost"
          onClick={() => {
            setEditName(item.name)
            setIsEditing(false)
          }}
          disabled={loading}
        >
          Cancel
        </Button>
      </div>
    )
  }

  return (
    <div className="flex items-center gap-2 py-2 px-3 border-b hover:bg-muted/50 group">
      <span className="flex-1">{item.name}</span>
      {item.description && (
        <span className="text-sm text-muted-foreground hidden sm:block">{item.description}</span>
      )}
      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <Button size="sm" variant="ghost" onClick={() => setIsEditing(true)} title="Edit">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
            <path d="m15 5 4 4" />
          </svg>
        </Button>
        <Button
          size="sm"
          variant="ghost"
          onClick={handleDelete}
          disabled={loading}
          title="Delete"
          className="text-destructive hover:text-destructive"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M3 6h18" />
            <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
            <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
          </svg>
        </Button>
      </div>
    </div>
  )
}

