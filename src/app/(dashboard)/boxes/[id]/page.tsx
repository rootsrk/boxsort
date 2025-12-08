import { Suspense } from 'react'
import { BoxDetailClient } from './box-detail-client'

interface PageProps {
  params: Promise<{ id: string }>
}

// Required for static export - must return at least one param
// The placeholder will be pre-rendered, but actual box IDs are handled client-side
export async function generateStaticParams() {
  return [{ id: 'placeholder' }]
}

function BoxDetailClientWrapper({ boxId }: { boxId: string }) {
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
      <BoxDetailClient boxId={boxId} />
    </Suspense>
  )
}

export default async function BoxDetailPage({ params }: PageProps) {
  const { id } = await params
  return <BoxDetailClientWrapper boxId={id} />
}
