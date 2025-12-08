'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { createBrowserClient } from '@/lib/supabase/client'
import { PublicBoxView } from '@/components/boxes/public-box-view'
import type { Box, Item } from '@/lib/supabase/types'
import { Skeleton } from '@/components/ui/skeleton'

export function PublicBoxClient() {
  const params = useParams()
  const id = params.id as string
  const [box, setBox] = useState<Box | null>(null)
  const [items, setItems] = useState<Item[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    async function fetchBoxData() {
      if (!id) return

      const supabase = createBrowserClient()

      // Fetch box and items - this is a public route, RLS allows public read
      const { data: boxData, error: boxError } = await supabase
        .from('boxes')
        .select('*')
        .eq('id', id)
        .single()

      if (boxError || !boxData) {
        setError(true)
        setLoading(false)
        return
      }

      setBox(boxData)

      // Update page title
      document.title = `${boxData.funky_name} | BoxSort`

      const { data: itemsData } = await supabase
        .from('items')
        .select('*')
        .eq('box_id', id)
        .order('created_at', { ascending: false })

      setItems(itemsData || [])
      setLoading(false)
    }

    fetchBoxData()
  }, [id])

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <header className="border-b">
          <div className="container mx-auto px-4 py-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-2xl">📦</span>
              <span className="font-bold text-xl">BoxSort</span>
            </div>
          </div>
        </header>
        <main className="container mx-auto px-4 py-8 max-w-2xl">
          <Skeleton className="h-64 w-full" />
        </main>
      </div>
    )
  }

  if (error || !box) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">Box Not Found</h1>
          <p className="text-muted-foreground">The box you&apos;re looking for doesn&apos;t exist.</p>
        </div>
      </div>
    )
  }

  return <PublicBoxView box={box} items={items} />
}

