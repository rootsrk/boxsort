'use client'

import { QRCodeSVG } from 'qrcode.react'
import { getBoxQRUrl } from '@/lib/utils/qr'

interface QRCodeProps {
  boxId: string
  boxName: string
  size?: number
  showLabel?: boolean
  className?: string
}

export function QRCode({ boxId, boxName, size = 128, showLabel = true, className = '' }: QRCodeProps) {
  const url = getBoxQRUrl(boxId)

  return (
    <div className={`qr-label inline-flex flex-col items-center ${className}`}>
      <div className="bg-white p-2 rounded-lg">
        <QRCodeSVG
          value={url}
          size={size}
          level="M"
          includeMargin={false}
        />
      </div>
      {showLabel && (
        <p className="mt-2 font-mono text-sm text-center font-medium">{boxName}</p>
      )}
    </div>
  )
}

interface PrintableQRProps {
  boxId: string
  boxName: string
}

export function PrintableQR({ boxId, boxName }: PrintableQRProps) {
  return (
    <div className="print-only qr-label p-4 border rounded-lg inline-block">
      <QRCode boxId={boxId} boxName={boxName} size={150} showLabel={true} />
    </div>
  )
}

