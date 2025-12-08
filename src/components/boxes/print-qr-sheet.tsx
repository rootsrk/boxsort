'use client'

import { useEffect } from 'react'
import { PrintableQR } from './printable-qr'
import { Button } from '@/components/ui/button'
import type { Box } from '@/lib/supabase/types'

interface PrintQRSheetProps {
  boxes: Box[]
  onClose: () => void
}

export function PrintQRSheet({ boxes, onClose }: PrintQRSheetProps) {
  useEffect(() => {
    // Add class to body to hide other content when printing
    document.body.classList.add('print-mode')
    return () => {
      document.body.classList.remove('print-mode')
    }
  }, [])

  function handlePrint() {
    window.print()
  }

  if (boxes.length === 0) {
    return null
  }

  return (
    <div className="fixed inset-0 z-50 bg-background">
      {/* Controls - hidden when printing */}
      <div className="no-print sticky top-0 bg-background border-b p-4 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">Print QR Codes</h2>
          <p className="text-sm text-muted-foreground">
            {boxes.length} {boxes.length === 1 ? 'box' : 'boxes'} selected
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handlePrint}>Print</Button>
        </div>
      </div>

      {/* QR Grid - optimized for printing */}
      <div className="p-8">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6 print-grid">
          {boxes.map((box) => (
            <PrintableQR key={box.id} boxId={box.id} boxName={box.funky_name} size={120} />
          ))}
        </div>
      </div>
    </div>
  )
}

