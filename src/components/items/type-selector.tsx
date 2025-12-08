'use client'

import { useState, useEffect } from 'react'
import { Input } from '@/components/ui/input'
import { TypeBadge } from '@/components/types/type-badge'
import { useTypes } from '@/lib/hooks/use-types'
import type { Type } from '@/lib/supabase/types'

interface TypeSelectorProps {
  selectedTypes: string[]
  onSelectionChange: (typeIds: string[]) => void
  householdId: string | null
}

export function TypeSelector({
  selectedTypes,
  onSelectionChange,
  householdId,
}: TypeSelectorProps) {
  const { types, loading, createType } = useTypes(householdId)
  const [newTypeName, setNewTypeName] = useState('')
  const [isCreating, setIsCreating] = useState(false)

  async function handleCreateType() {
    if (!newTypeName.trim() || isCreating) return

    setIsCreating(true)
    const newType = await createType(newTypeName.trim())
    if (newType) {
      // Auto-select the newly created type
      onSelectionChange([...selectedTypes, newType.id])
      setNewTypeName('')
    }
    setIsCreating(false)
  }

  function handleTypeToggle(typeId: string) {
    if (selectedTypes.includes(typeId)) {
      onSelectionChange(selectedTypes.filter((id) => id !== typeId))
    } else {
      onSelectionChange([...selectedTypes, typeId])
    }
  }

  if (loading) {
    return <div className="text-sm text-muted-foreground">Loading types...</div>
  }

  // Deduplicate types by ID to prevent duplicate rendering
  const uniqueTypes = types.filter(
    (type, index, self) => index === self.findIndex((t) => t.id === type.id)
  )

  return (
    <div className="space-y-3" data-testid="type-selector">
      <div className="flex flex-wrap gap-2">
        {uniqueTypes.map((type) => (
          <label
            key={type.id}
            className="cursor-pointer"
            onClick={() => handleTypeToggle(type.id)}
          >
            <input
              type="checkbox"
              checked={selectedTypes.includes(type.id)}
              onChange={() => handleTypeToggle(type.id)}
              className="sr-only"
              aria-label={type.name}
            />
            <TypeBadge
              name={type.name}
              color={type.color}
              className={selectedTypes.includes(type.id) ? 'ring-2 ring-offset-2 ring-primary' : ''}
            />
          </label>
        ))}
      </div>

      <div className="flex gap-2">
        <Input
          placeholder="Add new type..."
          value={newTypeName}
          onChange={(e) => setNewTypeName(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault()
              handleCreateType()
            }
          }}
          disabled={isCreating}
          className="flex-1"
        />
        {newTypeName.trim() && (
          <button
            type="button"
            onClick={handleCreateType}
            disabled={isCreating}
            className="px-3 py-2 text-sm bg-primary text-primary-foreground rounded-md hover:bg-primary/90 disabled:opacity-50"
          >
            {isCreating ? 'Adding...' : 'Add'}
          </button>
        )}
      </div>
    </div>
  )
}

