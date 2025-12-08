import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const query = searchParams.get('q')

  if (!query || !query.trim()) {
    return NextResponse.json({ data: [], error: null })
  }

  try {
    const supabase = await createServerClient()

    const { data, error } = await supabase.rpc('search_items', {
      search_query: query.trim(),
    })

    if (error) {
      return NextResponse.json({ data: null, error: error.message }, { status: 500 })
    }

    return NextResponse.json({ data, error: null })
  } catch (e) {
    return NextResponse.json(
      { data: null, error: e instanceof Error ? e.message : 'Search failed' },
      { status: 500 }
    )
  }
}

