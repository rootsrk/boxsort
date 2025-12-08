'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { TypeBadge } from './type-badge'
import { ConfirmDialog, useConfirmDialog } from '@/components/ui/confirm-dialog'
import { useTypes } from '@/lib/hooks/use-types'
import type { Type } from '@/lib/supabase/types'

interface TypeManagerProps {
  householdId: string | null
}

export function TypeManager({ householdId }: TypeManagerProps) {
  const { types, loading, createType, updateType, deleteType, error } = useTypes(householdId)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editName, setEditName] = useState('')
  const [newTypeName, setNewTypeName] = useState('')
  const [deleteTypeId, setDeleteTypeId] = useState<string | null>(null)
  const deleteDialog = useConfirmDialog()

  function handleStartEdit(type: Type) {
    setEditingId(type.id)
    setEditName(type.name)
  }

  function handleCancelEdit() {
    setEditingId(null)
    setEditName('')
  }

  async function handleSaveEdit(typeId: string) {
    await updateType(typeId, { name: editName.trim() })
    setEditingId(null)
    setEditName('')
  }

  async function handleCreate() {
    if (!newTypeName.trim()) return
    await createType(newTypeName.trim())
    setNewTypeName('')
  }

  async function handleDelete(typeId: string) {
    await deleteType(typeId)
    deleteDialog.close()
    setDeleteTypeId(null)
  }

  function handleDeleteClick(typeId: string) {
    setDeleteTypeId(typeId)
    deleteDialog.open()
  }

  if (loading) {
    return <div className="text-sm text-muted-foreground">Loading types...</div>
  }

  return (
    <div className="space-y-4">
      {error && (
        <div className="text-sm text-destructive bg-destructive/10 p-2 rounded">
          {error}
        </div>
      )}

      <div className="flex gap-2">
        <Input
          placeholder="Type name..."
          value={newTypeName}
          onChange={(e) => setNewTypeName(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault()
              handleCreate()
            }
          }}
        />
        <Button onClick={handleCreate} disabled={!newTypeName.trim()}>
          Create Type
        </Button>
      </div>

      <div className="space-y-2">
        {types.length === 0 ? (
          <p className="text-sm text-muted-foreground">No types yet. Create one above.</p>
        ) : (
          types.map((type) => (
            <div key={type.id} className="flex items-center gap-2 p-2 border rounded">
              {editingId === type.id ? (
                <>
                  <Input
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="flex-1"
                    autoFocus
                  />
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleSaveEdit(type.id)}
                  >
                    Save
                  </Button>
                  <Button size="sm" variant="ghost" onClick={handleCancelEdit}>
                    Cancel
                  </Button>
                </>
              ) : (
                <>
                  <TypeBadge name={type.name} color={type.color} />
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleStartEdit(type)}
                  >
                    Edit
                  </Button>
                  <Button size="sm" variant="destructive" onClick={() => handleDeleteClick(type.id)}>
                    Delete
                  </Button>
                </>
              )}
            </div>
          ))
        )}
      </div>

      <ConfirmDialog
        open={deleteDialog.isOpen}
        onOpenChange={deleteDialog.setOpen}
        title="Delete Type"
        description={
          deleteTypeId
            ? `Are you sure you want to delete "${types.find((t) => t.id === deleteTypeId)?.name}"? Items with this type will lose the tag.`
            : ''
        }
        onConfirm={async () => {
          if (deleteTypeId) {
            await handleDelete(deleteTypeId)
          }
        }}
        variant="destructive"
        confirmLabel="Delete"
      />
    </div>
  )
}

