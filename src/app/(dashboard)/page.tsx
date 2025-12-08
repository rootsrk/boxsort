'use client'

export const dynamic = 'force-dynamic'

import { useState } from 'react'
import Link from 'next/link'
import { BoxGrid } from '@/components/boxes/box-grid'
import { AddBoxDialog } from '@/components/boxes/add-box-dialog'
import { PrintQRSheet } from '@/components/boxes/print-qr-sheet'
import { Button } from '@/components/ui/button'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import { useBoxes } from '@/lib/hooks/use-boxes'
import { useUser } from '@/lib/hooks/use-user'
import type { Box } from '@/lib/supabase/types'

export default function DashboardPage() {
  const { household, loading: userLoading } = useUser()
  const { boxes, loading: boxesLoading, addBox, deleteBoxes } = useBoxes(household?.id ?? null)
  
  const [selectMode, setSelectMode] = useState(false)
  const [selectedBoxes, setSelectedBoxes] = useState<string[]>([])
  const [showPrintSheet, setShowPrintSheet] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [deleting, setDeleting] = useState(false)

  function toggleSelectMode() {
    if (selectMode) {
      setSelectedBoxes([]) // Clear when exiting select mode
    }
    setSelectMode(!selectMode)
  }

  async function handleAddBox(funkyName: string) {
    if (!household) {
      throw new Error('You need to create or join a household first')
    }
    await addBox(funkyName)
  }

  function handleSelectBox(box: Box) {
    if (!selectMode) return
    
    setSelectedBoxes((prev) =>
      prev.includes(box.id) ? prev.filter((id) => id !== box.id) : [...prev, box.id]
    )
  }

  function handleSelectAll() {
    if (selectedBoxes.length === boxes.length) {
      setSelectedBoxes([])
    } else {
      setSelectedBoxes(boxes.map((b) => b.id))
    }
  }

  function handlePrintSelected() {
    if (selectedBoxes.length > 0) {
      setShowPrintSheet(true)
    }
  }

  async function handleDeleteSelected() {
    if (selectedBoxes.length === 0) return
    
    setDeleting(true)
    try {
      await deleteBoxes(selectedBoxes)
      setSelectedBoxes([])
      setSelectMode(false)
      setShowDeleteConfirm(false)
    } catch (error) {
      console.error('Failed to delete boxes:', error)
      // Error is handled by the hook and will be displayed
    } finally {
      setDeleting(false)
    }
  }

  const selectedBoxData = boxes.filter((b) => selectedBoxes.includes(b.id))

  if (userLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse">
          <div className="h-8 w-48 bg-muted rounded mb-4" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-32 bg-muted rounded-lg" />
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (!household) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-12">
          <div className="text-6xl mb-4">🏠</div>
          <h2 className="text-2xl font-bold mb-2">No Household Yet</h2>
          <p className="text-muted-foreground mb-4">
            You need to create or join a household before you can add boxes.
          </p>
          <Link href="/settings">
            <Button size="lg">Create a Household</Button>
          </Link>
          <p className="text-sm text-muted-foreground mt-4">
            Or use an invite link if someone shared one with you.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">Your Boxes</h1>
          <p className="text-muted-foreground">{household.name}</p>
        </div>
        <div className="flex gap-2">
          {selectMode ? (
            <>
              <Button variant="outline" size="sm" onClick={handleSelectAll}>
                {selectedBoxes.length === boxes.length ? 'Deselect All' : 'Select All'}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handlePrintSelected}
                disabled={selectedBoxes.length === 0}
              >
                Print ({selectedBoxes.length})
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => setShowDeleteConfirm(true)}
                disabled={selectedBoxes.length === 0 || deleting}
              >
                {deleting ? 'Deleting...' : `Delete (${selectedBoxes.length})`}
              </Button>
              <Button variant="ghost" size="sm" onClick={toggleSelectMode}>
                Cancel
              </Button>
            </>
          ) : (
            <>
              {boxes.length > 0 && (
              <Button variant="outline" onClick={toggleSelectMode}>
                Bulk Edit
              </Button>
              )}
              <AddBoxDialog onAddBox={handleAddBox} />
            </>
          )}
        </div>
      </div>

      <BoxGrid
        boxes={boxes}
        loading={boxesLoading}
        selectedBoxes={selectMode ? selectedBoxes : undefined}
        onSelectBox={selectMode ? handleSelectBox : undefined}
      />

      {/* Print Sheet Modal */}
      {showPrintSheet && (
        <PrintQRSheet boxes={selectedBoxData} onClose={() => setShowPrintSheet(false)} />
      )}

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        open={showDeleteConfirm}
        onOpenChange={setShowDeleteConfirm}
        title="Delete Boxes"
        description={
          selectedBoxes.length === 1
            ? `Are you sure you want to delete this box and all its items? This action cannot be undone.`
            : `Are you sure you want to delete ${selectedBoxes.length} boxes and all their items? This action cannot be undone.`
        }
        confirmLabel="Delete"
        variant="destructive"
        onConfirm={handleDeleteSelected}
        loading={deleting}
      />
    </div>
  )
}
