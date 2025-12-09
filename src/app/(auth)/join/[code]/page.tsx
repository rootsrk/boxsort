import { JoinHouseholdClient } from './join-household-client'

export async function generateStaticParams() {
  return [{ code: 'placeholder' }]
}

export default function JoinHouseholdPage() {
  return <JoinHouseholdClient />
}
