import { BoxDetailClient } from './box-detail-client'

export async function generateStaticParams() {
  return [
    {
      id: ['placeholder'],
    },
  ]
}

export default function BoxDetailPage() {
  return <BoxDetailClient />
}
