import { PublicBoxClient } from './public-box-client'

export async function generateStaticParams(): Promise<Array<{ slug: string[] }>> {
  return [{ slug: ['placeholder'] }]
}

export default function PublicBoxPage() {
  return <PublicBoxClient />
}
