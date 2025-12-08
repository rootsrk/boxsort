import { JoinHouseholdClient } from './join-household-client'

interface PageProps {
  params: Promise<{ code: string }>
}

// Required for static export - returns empty array to make route fully dynamic
export async function generateStaticParams() {
  return []
}

export const dynamic = 'force-dynamic'

export default async function JoinHouseholdPage({ params }: PageProps) {
  const { code } = await params
  return <JoinHouseholdClient code={code} />
}
