import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function BoxNotFound() {
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
      <main className="container mx-auto px-4 py-16">
        <div className="text-center">
          <div className="text-6xl mb-4">📦❌</div>
          <h1 className="text-3xl font-bold mb-4">Box Not Found</h1>
          <p className="text-muted-foreground mb-8 max-w-md mx-auto">
            This box doesn&apos;t exist or may have been deleted. The QR code might be outdated.
          </p>
          <div className="flex gap-4 justify-center">
            <Link href="/">
              <Button variant="outline">Go Home</Button>
            </Link>
            <Link href="/login">
              <Button>Sign In</Button>
            </Link>
          </div>
        </div>
      </main>
    </div>
  )
}

