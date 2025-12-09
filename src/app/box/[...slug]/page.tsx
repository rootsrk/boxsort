import { PublicBoxClient } from './public-box-client'

// Required for static export - must return at least one param
// We return a placeholder that will be handled client-side
// All actual box IDs will be fetched dynamically on the client
export async function generateStaticParams(): Promise<Array<{ slug: string[] }>> {
  // For catch-all routes [...slug], return array with slug as array of strings
  return [{ slug: ['placeholder'] }]
}

export default function PublicBoxPage() {
  return <PublicBoxClient />
}
