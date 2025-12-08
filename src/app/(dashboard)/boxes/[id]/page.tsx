import { Suspense } from 'react'
import { BoxDetailClient } from './box-detail-client'

interface PageProps {
  params: Promise<{ id: string }>
}

// Required for static export - returns empty array to make route fully dynamic
export async function generateStaticParams() {
  return []
}

export const dynamic = 'force-dynamic'

function BoxDetailClientWrapper({ boxId }: { boxId: string }) {
  return (
    <Suspense fallback={
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 w-64 bg-muted rounded" />
          <div className="h-64 bg-muted rounded-lg" />
        </div>
      </div>
    }>
      <BoxDetailClient boxId={boxId} />
    </Suspense>
  )
}

export default async function BoxDetailPage({ params }: PageProps) {
  const { id } = await params
  return <BoxDetailClientWrapper boxId={id} />
}
