'use client'

import { useRef, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Avatar } from './avatar'
import { useAvatar } from '@/lib/hooks/use-avatar'
import { isValidImageType } from '@/lib/utils/image-compress'
import type { User as AuthUser } from '@supabase/supabase-js'

interface AvatarUploadProps {
  user: AuthUser
  displayName: string
  currentAvatarUrl: string | null
  onUploadComplete?: (url: string) => void
}

export function AvatarUpload({
  user,
  displayName,
  currentAvatarUrl,
  onUploadComplete,
}: AvatarUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const { uploadAvatar, uploading, error } = useAvatar(user.id)

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    if (!isValidImageType(file)) {
      alert('Please select a valid image file (JPEG, PNG, or WebP)')
      return
    }

    // Create preview
    const reader = new FileReader()
    reader.onload = () => {
      setPreviewUrl(reader.result as string)
    }
    reader.readAsDataURL(file)

    // Upload the file
    uploadAvatar(file).then((url) => {
      if (url && onUploadComplete) {
        onUploadComplete(url)
      }
      setPreviewUrl(null)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    })
  }

  function handleClick() {
    fileInputRef.current?.click()
  }

  const displayUrl = previewUrl || currentAvatarUrl

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <Avatar displayName={displayName} avatarUrl={displayUrl} size="lg" />
        <div className="flex flex-col gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={handleClick}
            disabled={uploading}
            aria-label="Upload avatar"
          >
            {uploading ? 'Uploading...' : 'Change Picture'}
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            capture="environment"
            onChange={handleFileSelect}
            className="hidden"
            aria-label="Upload avatar"
          />
          <p className="text-sm text-muted-foreground">
            JPEG, PNG, or WebP. Max 2MB.
          </p>
        </div>
      </div>
      {error && (
        <div className="text-sm text-destructive bg-destructive/10 p-2 rounded">
          {error}
        </div>
      )}
    </div>
  )
}

