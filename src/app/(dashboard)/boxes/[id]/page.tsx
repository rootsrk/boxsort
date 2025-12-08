import { BoxDetailClient } from './box-detail-client'

interface PageProps {
  params: Promise<{ id: string }>
}

// Required for static export - returns empty array to make route fully dynamic
export async function generateStaticParams() {
  return []
}

export const dynamic = 'force-dynamic'

export default async function BoxDetailPage({ params }: PageProps) {
  const { id } = await params
  return <BoxDetailClient boxId={id} />
}
