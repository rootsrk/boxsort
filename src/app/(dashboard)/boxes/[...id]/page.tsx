import { BoxDetailClient } from './box-detail-client'

// Force static rendering for static export
export const dynamic = 'force-static'

// For static export, generate a placeholder route
// All actual box IDs are handled via client-side routing
export async function generateStaticParams() {
  // For catch-all routes [...id], return array with id as array of strings
  // The param key must match the route segment name (id for [...id])
  return [
    {
      id: ['placeholder'],
    },
  ]
}

export default function BoxDetailPage() {
  return <BoxDetailClient />
}
