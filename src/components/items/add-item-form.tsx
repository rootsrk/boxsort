'use client'

import { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { TypeSelector } from './type-selector'
import { CameraCapture } from '@/components/ui/camera-capture'
import { useItemImage } from '@/lib/hooks/use-item-image'
import { isValidImageType } from '@/lib/utils/image-compress'
import Image from 'next/image'

interface AddItemFormProps {
  onAddItem: (
    name: string,
    description?: string,
    imageUrl?: string | null,
    typeIds?: string[]
  ) => Promise<{ id: string } | null | unknown>
  autoFocus?: boolean
  householdId: string | null
}

export function AddItemForm({ onAddItem, autoFocus, householdId }: AddItemFormProps) {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [loading, setLoading] = useState(false)
  const [selectedTypes, setSelectedTypes] = useState<string[]>([])
  const [selectedImageFile, setSelectedImageFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [showCamera, setShowCamera] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const { uploadImage, uploading } = useItemImage()

  useEffect(() => {
    if (autoFocus && inputRef.current) {
      inputRef.current.focus()
    }
  }, [autoFocus])

  function handleImageSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    if (!isValidImageType(file)) {
      alert('Please select a valid image file (JPEG, PNG, or WebP)')
      return
    }

    setSelectedImageFile(file)
    const reader = new FileReader()
    reader.onload = () => {
      setPreviewUrl(reader.result as string)
    }
    reader.readAsDataURL(file)
  }

  function handleCameraCapture(file: File) {
    setSelectedImageFile(file)
    const reader = new FileReader()
    reader.onload = () => {
      setPreviewUrl(reader.result as string)
    }
    reader.readAsDataURL(file)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim()) return

    setLoading(true)
    try {
      // Create item first
      const result = await onAddItem(
        name.trim(),
        description.trim() || undefined,
        null,
        selectedTypes
      )

      // If item was created and we have an image, upload it
      if (
        result &&
        typeof result === 'object' &&
        'id' in result &&
        selectedImageFile &&
        householdId
      ) {
        await uploadImage(selectedImageFile, result.id as string, householdId)
      }

      // Reset form
      setName('')
      setDescription('')
      setSelectedTypes([])
      setSelectedImageFile(null)
      setPreviewUrl(null)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
      // Keep focus for adding more items
      inputRef.current?.focus()
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="flex gap-2">
        <Input
          ref={inputRef}
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Add item (e.g., Winter Jacket)"
          disabled={loading}
          className="flex-1"
        />
        <Button type="submit" disabled={loading || !name.trim()}>
          {loading ? 'Adding...' : 'Add'}
        </Button>
      </div>

      {householdId && (
        <>
          <Input
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Description (optional)"
            disabled={loading}
          />

          {/* Image Upload */}
          <div className="space-y-2">
            {previewUrl ? (
              <div className="relative w-full h-48 rounded-lg overflow-hidden border">
                <Image src={previewUrl} alt="Item preview" fill className="object-cover" />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="absolute top-2 right-2"
                  onClick={() => {
                    setSelectedImageFile(null)
                    setPreviewUrl(null)
                    if (fileInputRef.current) {
                      fileInputRef.current.value = ''
                    }
                  }}
                  disabled={loading || uploading}
                >
                  Remove
                </Button>
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
                onClick={() => fileInputRef.current?.click()}
                disabled={loading || uploading}
                className="flex-1"
              >
                {uploading ? 'Uploading...' : previewUrl ? 'Change Image' : 'Choose from Gallery'}
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setShowCamera(true)}
                disabled={loading || uploading}
                className="flex-1"
              >
                📷 Take Photo
              </Button>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              capture="environment"
              onChange={handleImageSelect}
              className="hidden"
              aria-label="Upload item image"
            />
            <CameraCapture
              open={showCamera}
              onOpenChange={setShowCamera}
              onCapture={handleCameraCapture}
            />
            <p className="text-xs text-muted-foreground">JPEG, PNG, or WebP. Max 5MB.</p>
          </div>

          <TypeSelector
            selectedTypes={selectedTypes}
            onSelectionChange={setSelectedTypes}
            householdId={householdId}
          />
        </>
      )}
    </form>
  )
}
