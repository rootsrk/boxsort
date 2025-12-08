import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import type { Box, Item } from '@/lib/supabase/types'

interface PublicBoxViewProps {
  box: Box
  items: Item[]
}

export function PublicBoxView({ box, items }: PublicBoxViewProps) {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl">📦</span>
            <span className="font-bold text-xl">BoxSort</span>
          </div>
          <Link href="/login">
            <Button variant="outline" size="sm">
              Sign In
            </Button>
          </Link>
        </div>
      </header>

      {/* Content */}
      <main className="container mx-auto px-4 py-8 max-w-2xl">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-2xl font-mono">{box.funky_name}</CardTitle>
                <p className="text-sm text-muted-foreground mt-1">
                  {items.length} {items.length === 1 ? 'item' : 'items'} in this box
                </p>
              </div>
              <div className="text-4xl">📦</div>
            </div>
          </CardHeader>
          <CardContent>
            {items.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">This box is empty.</p>
            ) : (
              <div className="space-y-2">
                <h3 className="font-medium text-sm text-muted-foreground mb-3">Contents</h3>
                <ul className="space-y-2">
                  {items.map((item) => (
                    <li
                      key={item.id}
                      className="flex items-center gap-3 py-2 px-3 rounded-md bg-muted/50"
                    >
                      <span className="text-lg">•</span>
                      <div>
                        <p className="font-medium">{item.name}</p>
                        {item.description && (
                          <p className="text-sm text-muted-foreground">{item.description}</p>
                        )}
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Sign In Prompt */}
        <div className="mt-8 text-center">
          <p className="text-muted-foreground mb-4">
            Want to manage this box? Sign in to edit items and print QR codes.
          </p>
          <Link href="/login">
            <Button>Sign In for Full Access</Button>
          </Link>
        </div>
      </main>
    </div>
  )
}

