/**
 * Generates the URL that a QR code should point to for a given box
 */
export function getBoxQRUrl(boxId: string): string {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
  return `${baseUrl}/box/${boxId}`
}

/**
 * Generates a filename for downloading a QR code
 */
export function getQRFilename(boxName: string): string {
  return `qr-${boxName}.png`
}

/**
 * Triggers print dialog for QR code labels
 */
export function printQRLabels(): void {
  if (typeof window !== 'undefined') {
    window.print()
  }
}

