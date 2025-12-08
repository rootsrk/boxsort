import { PublicBoxClient } from './public-box-client'

// Required for static export - returns empty array
// With static export, this generates a static shell that fetches data client-side
export async function generateStaticParams() {
  return []
}

export default function PublicBoxPage() {
  return <PublicBoxClient />
}
