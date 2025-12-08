'use client'

import { QRCodeSVG } from 'qrcode.react'
import { getBoxQRUrl } from '@/lib/utils/qr'

interface PrintableQRProps {
  boxId: string
  boxName: string
  size?: number
}

export function PrintableQR({ boxId, boxName, size = 150 }: PrintableQRProps) {
  const url = getBoxQRUrl(boxId)

  return (
    <div className="qr-label flex flex-col items-center p-4 border rounded-lg bg-white">
      <div className="bg-white p-2">
        <QRCodeSVG value={url} size={size} level="M" includeMargin={false} />
      </div>
      <p className="mt-2 font-mono text-sm text-center font-semibold text-black">{boxName}</p>
    </div>
  )
}

