import { JoinHouseholdClient } from './join-household-client'

// Required for static export - must return at least one param
// We return a placeholder that will be handled client-side
export async function generateStaticParams() {
  return [{ code: 'placeholder' }]
}

export default function JoinHouseholdPage() {
  return <JoinHouseholdClient />
}
