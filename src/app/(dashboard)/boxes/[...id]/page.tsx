import { BoxDetailClient } from './box-detail-client'

// Force static rendering for static export
export const dynamic = 'force-static'

// For static export, generate a placeholder route
// All actual box IDs are handled via client-side routing
export function generateStaticParams() {
  return [{ id: ['placeholder'] }]
}

export default function BoxDetailPage() {
  return <BoxDetailClient />
}
