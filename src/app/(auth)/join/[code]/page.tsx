import { JoinHouseholdClient } from './join-household-client'

// Required for static export - must return at least one param
// The placeholder will be pre-rendered, but actual codes are handled client-side
export async function generateStaticParams() {
  return [{ code: 'placeholder' }]
}

export default function JoinHouseholdPage() {
  return <JoinHouseholdClient />
}
