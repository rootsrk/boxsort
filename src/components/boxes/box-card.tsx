'use client'

import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { Box } from '@/lib/supabase/types'

interface BoxCardProps {
  box: Box & { item_count?: number }
  onSelect?: (box: Box) => void
  selected?: boolean
}

export function BoxCard({ box, onSelect, selected }: BoxCardProps) {
  return (
    <Link href={`/boxes/${box.id}`}>
      <Card
        className={`cursor-pointer transition-all hover:shadow-md hover:border-primary/50 ${
          selected ? 'ring-2 ring-primary' : ''
        }`}
        onClick={(e) => {
          if (onSelect) {
            e.preventDefault()
            onSelect(box)
          }
        }}
      >
        <CardHeader className="pb-2">
          <CardTitle className="text-lg font-mono">{box.funky_name}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            {box.item_count !== undefined ? (
              <>
                {box.item_count} {box.item_count === 1 ? 'item' : 'items'}
              </>
            ) : (
              'Click to view items'
            )}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            Created {new Date(box.created_at).toLocaleDateString()}
          </p>
        </CardContent>
      </Card>
    </Link>
  )
}

