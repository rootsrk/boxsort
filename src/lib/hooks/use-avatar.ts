'use client'

import { useState, useCallback } from 'react'
import { createBrowserClient } from '@/lib/supabase/client'
import { compressAvatar, getExtensionFromMimeType } from '@/lib/utils/image-compress'

interface UseAvatarReturn {
  avatarUrl: string | null
  uploading: boolean
  error: string | null
  uploadAvatar: (file: File) => Promise<string | null>
  deleteAvatar: () => Promise<boolean>
  getPublicUrl: (path: string) => string
}

export function useAvatar(userId: string | null): UseAvatarReturn {
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const supabase = createBrowserClient()

  const uploadAvatar = useCallback(
    async (file: File): Promise<string | null> => {
      if (!userId) {
        setError('User ID is required')
        return null
      }

      setUploading(true)
      setError(null)

      try {
        // Compress the image
        const compressedFile = await compressAvatar(file)
        const ext = getExtensionFromMimeType(compressedFile.type)
        const path = `${userId}/avatar.${ext}`

        // Upload to storage
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('avatars')
          .upload(path, compressedFile, {
            upsert: true,
            contentType: compressedFile.type,
          })

        if (uploadError) {
          setError(uploadError.message)
          return null
        }

        // Update user profile with the path
        const { error: updateError } = await supabase
          .from('users')
          .update({ avatar_url: uploadData.path })
          .eq('id', userId)

        if (updateError) {
          setError(updateError.message)
          return null
        }

        // Get public URL
        const { data: urlData } = supabase.storage.from('avatars').getPublicUrl(uploadData.path)
        setAvatarUrl(urlData.publicUrl)

        return urlData.publicUrl
      } catch (e) {
        const message = e instanceof Error ? e.message : 'Failed to upload avatar'
        setError(message)
        return null
      } finally {
        setUploading(false)
      }
    },
    [userId, supabase]
  )

  const deleteAvatar = useCallback(async (): Promise<boolean> => {
    if (!userId || !avatarUrl) {
      return false
    }

    setUploading(true)
    setError(null)

    try {
      // Extract path from URL or use stored path
      const path = avatarUrl.includes('/storage/')
        ? avatarUrl.split('/storage/')[1]
        : `${userId}/avatar.webp`

      // Delete from storage
      const { error: deleteError } = await supabase.storage.from('avatars').remove([path])

      if (deleteError) {
        setError(deleteError.message)
        return false
      }

      // Update user profile
      const { error: updateError } = await supabase
        .from('users')
        .update({ avatar_url: null })
        .eq('id', userId)

      if (updateError) {
        setError(updateError.message)
        return false
      }

      setAvatarUrl(null)
      return true
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Failed to delete avatar'
      setError(message)
      return false
    } finally {
      setUploading(false)
    }
  }, [userId, avatarUrl, supabase])

  const getPublicUrl = useCallback(
    (path: string): string => {
      const { data } = supabase.storage.from('avatars').getPublicUrl(path)
      return data.publicUrl
    },
    [supabase]
  )

  return {
    avatarUrl,
    uploading,
    error,
    uploadAvatar,
    deleteAvatar,
    getPublicUrl,
  }
}

