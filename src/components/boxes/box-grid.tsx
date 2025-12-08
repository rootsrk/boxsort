'use client'

import { BoxCard } from './box-card'
import { SkeletonGrid } from '@/components/ui/skeleton'
import { StaggeredList } from '@/components/ui/staggered-list'
import type { Box } from '@/lib/supabase/types'

interface BoxGridProps {
  boxes: (Box & { item_count?: number })[]
  loading?: boolean
  selectedBoxes?: string[]
  onSelectBox?: (box: Box) => void
  emptyMessage?: string
}

export function BoxGrid({
  boxes,
  loading,
  selectedBoxes = [],
  onSelectBox,
  emptyMessage = 'No boxes yet. Add your first box to get started!',
}: BoxGridProps) {
  if (loading) {
    return <SkeletonGrid count={6} />
  }

  if (boxes.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-6xl mb-4">📦</div>
        <p className="text-muted-foreground">{emptyMessage}</p>
      </div>
    )
  }

  return (
    <StaggeredList
      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
      staggerDelay={0.05}
      direction="up"
    >
      {boxes.map((box) => (
        <BoxCard
          key={box.id}
          box={box}
          selected={selectedBoxes.includes(box.id)}
          onSelect={onSelectBox}
        />
      ))}
    </StaggeredList>
  )
}

