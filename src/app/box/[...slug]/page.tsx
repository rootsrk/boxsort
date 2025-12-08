import { PublicBoxClient } from './public-box-client'

// Required for static export - must return at least one param
// We return a placeholder that will be handled client-side
// All actual box IDs will be fetched dynamically on the client
export async function generateStaticParams() {
  return [{ slug: ['placeholder'] }]
}

export default function PublicBoxPage() {
  return <PublicBoxClient />
}
