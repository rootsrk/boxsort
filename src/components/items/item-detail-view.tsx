'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { TypeBadge } from '@/components/types/type-badge'
import { useItemImage } from '@/lib/hooks/use-item-image'
import type { Item, Type } from '@/lib/supabase/types'

interface ItemDetailViewProps {
  item: Item & { types?: Type[] }
  householdId: string
}

export function ItemDetailView({ item, householdId }: ItemDetailViewProps) {
  const [imageUrl, setImageUrl] = useState<string | null>(null)
  const [imageError, setImageError] = useState(false)
  const { getSignedUrl } = useItemImage()

  useEffect(() => {
    async function loadImage() {
      if (!item.image_url) {
        setImageUrl(null)
        setImageError(false)
        return
      }

      try {
        const signedUrl = await getSignedUrl(item.image_url, householdId)
        if (signedUrl) {
          setImageUrl(signedUrl)
          setImageError(false)
        }
      } catch (error) {
        console.error('Failed to load image:', error)
        setImageError(true)
      }
    }

    loadImage()
  }, [item.image_url, householdId, getSignedUrl])

  const placeholderSvg = (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="200"
      height="200"
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
    <Card>
      <CardHeader>
        <CardTitle>Item Details</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Image */}
        <div className="flex justify-center">
          <div className="relative w-full max-w-md aspect-square bg-muted/50 rounded-lg overflow-hidden">
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
        </div>

        {/* Name */}
        <div>
          <h2 className="text-2xl font-bold mb-2">{item.name}</h2>
        </div>

        {/* Description */}
        {item.description && (
          <div>
            <h3 className="text-sm font-semibold text-muted-foreground mb-1">Description</h3>
            <p className="text-sm">{item.description}</p>
          </div>
        )}

        {/* Types */}
        {item.types && item.types.length > 0 && (
          <div>
            <h3 className="text-sm font-semibold text-muted-foreground mb-2">Types</h3>
            <div className="flex flex-wrap gap-2">
              {item.types.map((type) => (
                <TypeBadge key={type.id} name={type.name} color={type.color} />
              ))}
            </div>
          </div>
        )}

        {/* Metadata */}
        <div className="pt-4 border-t">
          <p className="text-xs text-muted-foreground">
            Created {new Date(item.created_at).toLocaleDateString()}
          </p>
        </div>
      </CardContent>
    </Card>
  )
}

