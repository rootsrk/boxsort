import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function BoxNotFound() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-destructive mb-4">Box not found</h2>
        <p className="text-muted-foreground mb-4">This box does not exist or may have been deleted.</p>
        <Link href="/">
          <Button>Go back to boxes</Button>
        </Link>
      </div>
    </div>
  )
}

