import { JoinHouseholdClient } from './join-household-client'

// For static export, we need to provide at least one param
// but the actual route will be handled dynamically on the client
export async function generateStaticParams() {
  // Return empty array to skip pre-rendering, route will be handled client-side
  return []
}

export default function JoinHouseholdPage() {
  return <JoinHouseholdClient />
}
