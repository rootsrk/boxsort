import { notFound } from 'next/navigation'
import { createServerClient } from '@/lib/supabase/server'
import { PublicBoxView } from '@/components/boxes/public-box-view'

interface PageProps {
  params: Promise<{ id: string }>
}

// Required for static export - returns empty array to make route fully dynamic
export async function generateStaticParams() {
  return []
}

export default async function PublicBoxPage({ params }: PageProps) {
  const { id } = await params
  const supabase = await createServerClient()

  // Fetch box and items - this is a public route, RLS allows public read
  const { data: box, error: boxError } = await supabase
    .from('boxes')
    .select('*')
    .eq('id', id)
    .single()

  if (boxError || !box) {
    notFound()
  }

  const { data: items } = await supabase
    .from('items')
    .select('*')
    .eq('box_id', id)
    .order('created_at', { ascending: false })

  return <PublicBoxView box={box} items={items || []} />
}

export async function generateMetadata({ params }: PageProps) {
  const { id } = await params
  const supabase = await createServerClient()

  const { data: box } = await supabase.from('boxes').select('funky_name').eq('id', id).single()

  if (!box) {
    return {
      title: 'Box Not Found | BoxSort',
    }
  }

  return {
    title: `${box.funky_name} | BoxSort`,
    description: `View contents of box ${box.funky_name}`,
  }
}

