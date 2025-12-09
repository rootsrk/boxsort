'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import { TypeBadge } from '@/components/types/type-badge'
import { useItemImage } from '@/lib/hooks/use-item-image'
import { createBrowserClient } from '@/lib/supabase/client'
import type { Item, Type } from '@/lib/supabase/types'

interface ItemCardProps {
  item: Item & { types?: Type[] }
  boxId: string
  householdId: string
  onDelete?: (id: string) => Promise<void>
}

export function ItemCard({ item, boxId, householdId, onDelete }: ItemCardProps) {
  const [imageUrl, setImageUrl] = useState<string | null>(null)
  const [imageError, setImageError] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const { getSignedUrl } = useItemImage()
  const supabase = createBrowserClient()

  useEffect(() => {
    async function loadImage() {
      if (!item.image_url) {
        setImageUrl(null)
        setImageError(false)
        return
      }

      try {
        // Get signed URL for private bucket
        const signedUrl = await getSignedUrl(item.image_url, householdId)
        if (signedUrl) {
          setImageUrl(signedUrl)
          setImageError(false)
        }
      } catch {
        setImageError(true)
      }
    }

    loadImage()
  }, [item.image_url, householdId, getSignedUrl])

  async function handleDelete() {
    if (!onDelete) return
    setDeleting(true)
    try {
      await onDelete(item.id)
    } catch {
      // Error handling is done by the parent component
    } finally {
      setDeleting(false)
      setShowDeleteConfirm(false)
    }
  }

  const placeholderSvg = (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="100"
      height="100"
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
    <>
      <div
        className="border rounded-lg overflow-hidden hover:shadow-md transition-shadow bg-card relative group"
        data-testid="item-card"
        data-item-id={item.id}
      >
        <Link href={`/boxes/${boxId}?item=${item.id}`} className="block">
          <div className="aspect-square relative bg-muted/50">
            {imageUrl && !imageError ? (
              <Image
                src={imageUrl}
                alt={item.name}
                fill
                className="object-cover"
                onError={() => setImageError(true)}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                {placeholderSvg}
              </div>
            )}
          </div>
          <div className="p-4">
            <h3 className="font-semibold mb-2 line-clamp-2">{item.name}</h3>
            {item.description && (
              <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                {item.description}
              </p>
            )}
            {item.types && item.types.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {item.types.map((type) => (
                  <TypeBadge
                    key={type.id}
                    name={type.name}
                    color={type.color}
                  />
                ))}
              </div>
            )}
          </div>
        </Link>
        {onDelete && (
          <Button
            type="button"
            variant="destructive"
            size="icon"
            className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity z-10 h-8 w-8"
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              setShowDeleteConfirm(true)
            }}
            disabled={deleting}
            title="Delete item"
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
        )}
      </div>
      {onDelete && (
        <ConfirmDialog
          open={showDeleteConfirm}
          onOpenChange={setShowDeleteConfirm}
          title="Delete Item"
          description={`Are you sure you want to delete "${item.name}"? This action cannot be undone.`}
          confirmLabel="Delete"
          variant="destructive"
          onConfirm={handleDelete}
          loading={deleting}
        />
      )}
    </>
  )
}

