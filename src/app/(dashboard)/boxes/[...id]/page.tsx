import { Suspense } from 'react'
import { BoxDetailClient } from './box-detail-client'

// For static export, generate a placeholder route
// All actual box IDs are handled via client-side routing
export function generateStaticParams() {
  return [{ id: ['placeholder'] }]
}

export default function BoxDetailPage() {
  return (
    <Suspense
      fallback={
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse space-y-4">
            <div className="h-8 w-64 bg-muted rounded" />
            <div className="h-64 bg-muted rounded-lg" />
          </div>
        </div>
      }
    >
      <BoxDetailClient />
    </Suspense>
  )
}
