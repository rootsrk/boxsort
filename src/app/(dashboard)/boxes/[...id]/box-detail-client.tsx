'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams, useParams } from 'next/navigation'
import Link from 'next/link'
import { createBrowserClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import { ItemList } from '@/components/items/item-list'
import { AddItemForm } from '@/components/items/add-item-form'
import { ItemDetailView } from '@/components/items/item-detail-view'
import { QRCode } from '@/components/boxes/qr-code'
import { useItems } from '@/lib/hooks/use-items'
import { generateFunkyName } from '@/lib/utils/name-generator'
import { printQRLabels } from '@/lib/utils/qr'
import type { Box } from '@/lib/supabase/types'

export function BoxDetailClient() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const params = useParams()
  const supabase = createBrowserClient()

  // Handle catch-all route - id is an array, take the first element as the box ID
  const idParam = params.id as string[] | string
  const boxId = Array.isArray(idParam) ? idParam[0] : idParam

  const [box, setBox] = useState<Box | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [regenerating, setRegenerating] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [isAddItemExpanded, setIsAddItemExpanded] = useState(false)

  const { items, loading: itemsLoading, addItem, deleteItem } = useItems(boxId || null)
  const [householdId, setHouseholdId] = useState<string | null>(null)

  // Get selected item from query parameter
  const selectedItemId = searchParams.get('item')
  const selectedItem = selectedItemId ? items.find((item) => item.id === selectedItemId) : null

  useEffect(() => {
    async function loadBox() {
      if (!boxId) {
        setError('Invalid box ID')
        setLoading(false)
        return
      }

      const { data, error: fetchError } = await supabase
        .from('boxes')
        .select('*')
        .eq('id', boxId)
        .single()

      if (fetchError) {
        setError(fetchError.message)
      } else {
        setBox(data)
        setHouseholdId(data?.household_id || null)
      }
      setLoading(false)
    }

    loadBox()
  }, [boxId, supabase])

  async function handleRegenerateName() {
    if (!box) return
    setRegenerating(true)
    try {
      const newName = generateFunkyName()
      const { data, error: updateError } = await supabase
        .from('boxes')
        .update({ funky_name: newName })
        .eq('id', box.id)
        .select()
        .single()

      if (updateError) throw updateError
      setBox(data)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to regenerate name')
    } finally {
      setRegenerating(false)
    }
  }

  async function handleDeleteBox() {
    if (!box) return
    setDeleting(true)
    try {
      const { error: deleteError } = await supabase.from('boxes').delete().eq('id', box.id)

      if (deleteError) throw deleteError
      router.push('/')
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to delete box')
      setDeleting(false)
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 w-64 bg-muted rounded" />
          <div className="h-64 bg-muted rounded-lg" />
        </div>
      </div>
    )
  }

  if (error || !box) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold text-destructive mb-4">Box not found</h2>
          <p className="text-muted-foreground mb-4">{error || 'This box does not exist.'}</p>
          <Link href="/">
            <Button>Go back</Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <Link
            href="/"
            className="text-sm text-muted-foreground hover:text-foreground mb-2 inline-block"
          >
            ← Back to boxes
          </Link>
          <div className="flex items-center gap-2">
            <h1 className="text-3xl font-bold font-mono">{box.funky_name}</h1>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleRegenerateName}
              disabled={regenerating}
              title="Regenerate name"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className={regenerating ? 'animate-spin' : ''}
              >
                <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" />
                <path d="M21 3v5h-5" />
                <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" />
                <path d="M8 16H3v5" />
              </svg>
            </Button>
          </div>
          <p className="text-muted-foreground">
            {items.length} {items.length === 1 ? 'item' : 'items'} • Created{' '}
            {new Date(box.created_at).toLocaleDateString()}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={printQRLabels}>
            Print QR
          </Button>
          <Button
            variant="destructive"
            onClick={() => setShowDeleteConfirm(true)}
            disabled={deleting}
          >
            {deleting ? 'Deleting...' : 'Delete Box'}
          </Button>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-8">
        {/* Items Section */}
        <div className="md:col-span-2 space-y-6">
          {selectedItem && householdId ? (
            <div className="space-y-4">
              <ItemDetailView
                item={selectedItem}
                householdId={householdId}
                boxId={boxId}
                onDelete={async (id: string) => {
                  await deleteItem(id)
                }}
              />
              <div className="flex justify-end">
                <Button
                  variant="outline"
                  onClick={() => router.replace(`/boxes/${boxId}`, { scroll: false })}
                >
                  Back to Items
                </Button>
              </div>
            </div>
          ) : (
            <>
              {/* Add Item Form - Collapsible Card */}
              <Card>
                <CardHeader
                  className="cursor-pointer"
                  onClick={() => setIsAddItemExpanded(!isAddItemExpanded)}
                >
                  <div className="flex items-center justify-between">
                    <CardTitle>Add New Item</CardTitle>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={(e) => {
                        e.stopPropagation()
                        setIsAddItemExpanded(!isAddItemExpanded)
                      }}
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
                        className={`transition-transform ${isAddItemExpanded ? 'rotate-180' : ''}`}
                      >
                        <path d="m6 9 6 6 6-6" />
                      </svg>
                    </Button>
                  </div>
                </CardHeader>
                <div
                  className={`overflow-hidden transition-all duration-300 ease-in-out mt-4 ${
                    isAddItemExpanded ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0'
                  }`}
                >
                  {isAddItemExpanded && (
                    <CardContent>
                      <AddItemForm
                        onAddItem={async (...args) => {
                          const result = await addItem(...args)
                          // Collapse after successful add
                          setIsAddItemExpanded(false)
                          return result
                        }}
                        autoFocus={isAddItemExpanded}
                        householdId={householdId}
                      />
                    </CardContent>
                  )}
                </div>
              </Card>

              {/* Items List - Separate Card */}
              <Card>
                <CardHeader>
                  <CardTitle>
                    Items{' '}
                    {items.length > 0 && (
                      <span className="text-muted-foreground font-normal">({items.length})</span>
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ItemList
                    items={items}
                    loading={itemsLoading}
                    boxId={boxId}
                    householdId={householdId || ''}
                    onDeleteItem={async (id: string) => {
                      await deleteItem(id)
                    }}
                  />
                </CardContent>
              </Card>
            </>
          )}
        </div>

        {/* QR Code Section */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>QR Code</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col items-center">
              <QRCode boxId={box.id} boxName={box.funky_name} size={180} />
              <p className="text-sm text-muted-foreground mt-4 text-center">
                Print this QR code and attach it to your physical box.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Print-only QR */}
      <div className="print-only fixed inset-0 flex items-center justify-center bg-white">
        <QRCode boxId={box.id} boxName={box.funky_name} size={300} />
      </div>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        open={showDeleteConfirm}
        onOpenChange={setShowDeleteConfirm}
        title="Delete Box"
        description={`Are you sure you want to delete "${box.funky_name}" and all its items? This action cannot be undone.`}
        confirmLabel="Delete"
        variant="destructive"
        onConfirm={handleDeleteBox}
        loading={deleting}
      />
    </div>
  )
}
