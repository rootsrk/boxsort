'use client'

import { useRef, useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { CameraCapture } from '@/components/ui/camera-capture'
import { useItemImage } from '@/lib/hooks/use-item-image'
import { isValidImageType } from '@/lib/utils/image-compress'
import Image from 'next/image'

interface ItemImageUploadProps {
  itemId: string
  householdId: string
  currentImageUrl: string | null
  onUploadComplete?: (path: string) => void
}

export function ItemImageUpload({
  itemId,
  householdId,
  currentImageUrl,
  onUploadComplete,
}: ItemImageUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [showCamera, setShowCamera] = useState(false)
  const { uploadImage, getSignedUrl, deleteImage, uploading, error } = useItemImage()
  const [displayUrl, setDisplayUrl] = useState<string | null>(null)

  // Load signed URL for current image
  useEffect(() => {
    if (currentImageUrl && !displayUrl) {
      getSignedUrl(currentImageUrl, householdId).then((url) => {
        if (url) setDisplayUrl(url)
      })
    }
  }, [currentImageUrl, displayUrl, householdId, getSignedUrl])

  async function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    if (!isValidImageType(file)) {
      alert('Please select a valid image file (JPEG, PNG, or WebP)')
      return
    }

    await handleFileUpload(file)
  }

  async function handleFileUpload(file: File) {
    // Create preview
    const reader = new FileReader()
    reader.onload = () => {
      setPreviewUrl(reader.result as string)
    }
    reader.readAsDataURL(file)

    // Upload the file
    const path = await uploadImage(file, itemId, householdId)
    if (path && onUploadComplete) {
      onUploadComplete(path)
      // Get signed URL for display
      const signedUrl = await getSignedUrl(path, householdId)
      if (signedUrl) setDisplayUrl(signedUrl)
    }
    setPreviewUrl(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  async function handleCameraCapture(file: File) {
    await handleFileUpload(file)
  }

  function handleClick() {
    fileInputRef.current?.click()
  }

  const imageUrl = previewUrl || displayUrl

  return (
    <div className="space-y-2">
      {imageUrl ? (
        <div className="relative w-full h-48 rounded-lg overflow-hidden border">
          <Image
            src={imageUrl}
            alt="Item preview"
            fill
            className="object-cover"
          />
        </div>
      ) : (
        <div className="w-full h-48 rounded-lg border-2 border-dashed border-muted-foreground/25 flex items-center justify-center bg-muted/50">
          <div className="text-center text-muted-foreground">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="48"
              height="48"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="mx-auto mb-2"
            >
              <rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
              <circle cx="9" cy="9" r="2" />
              <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
            </svg>
            <p className="text-sm">No image</p>
          </div>
        </div>
      )}

      <div className="flex gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleClick}
          disabled={uploading}
          aria-label="Upload item image"
          className="flex-1"
        >
          {uploading ? 'Uploading...' : imageUrl ? 'Change Image' : 'Choose from Gallery'}
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => setShowCamera(true)}
          disabled={uploading}
          className="flex-1"
        >
          📷 Take Photo
        </Button>
        {imageUrl && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={async () => {
              await deleteImage(itemId, householdId)
              setPreviewUrl(null)
              setDisplayUrl(null)
              if (onUploadComplete) {
                onUploadComplete('')
              }
            }}
          >
            Remove
          </Button>
        )}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        capture="environment"
        onChange={handleFileSelect}
        className="hidden"
        aria-label="Upload item image"
      />

      <CameraCapture
        open={showCamera}
        onOpenChange={setShowCamera}
        onCapture={handleCameraCapture}
      />

      {error && (
        <div className="text-sm text-destructive bg-destructive/10 p-2 rounded">
          {error}
        </div>
      )}

      <p className="text-xs text-muted-foreground">
        JPEG, PNG, or WebP. Max 5MB.
      </p>
    </div>
  )
}

