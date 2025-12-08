'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
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
  const { getSignedUrl } = useItemImage()
  const supabase = createBrowserClient()

  useEffect(() => {
    async function loadImage() {
      if (!item.image_url) {
        setImageUrl(null)
        return
      }

      // Get signed URL for private bucket
      const signedUrl = await getSignedUrl(item.image_url, householdId)
      if (signedUrl) {
        setImageUrl(signedUrl)
      }
    }

    loadImage()
  }, [item.image_url, householdId, getSignedUrl])

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
    <div
      className="border rounded-lg overflow-hidden hover:shadow-md transition-shadow bg-card"
      data-testid="item-card"
    >
      <Link href={`/boxes/${boxId}?item=${item.id}`} className="block">
        <div className="aspect-square relative bg-muted/50">
          {imageUrl ? (
            <Image
              src={imageUrl}
              alt={item.name}
              fill
              className="object-cover"
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
    </div>
  )
}

