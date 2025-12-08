'use client'

import { useState, useCallback } from 'react'
import { createBrowserClient } from '@/lib/supabase/client'
import { compressItemImage, getExtensionFromMimeType } from '@/lib/utils/image-compress'

interface UseItemImageReturn {
  imageUrl: string | null
  uploading: boolean
  error: string | null
  uploadImage: (file: File, itemId: string, householdId: string) => Promise<string | null>
  deleteImage: (itemId: string, householdId: string) => Promise<boolean>
  getSignedUrl: (path: string, householdId: string) => Promise<string | null>
}

export function useItemImage(): UseItemImageReturn {
  const [imageUrl, setImageUrl] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const supabase = createBrowserClient()

  const uploadImage = useCallback(
    async (file: File, itemId: string, householdId: string): Promise<string | null> => {
      if (!itemId || !householdId) {
        setError('Item ID and Household ID are required')
        return null
      }

      setUploading(true)
      setError(null)

      try {
        // Compress the image
        const compressedFile = await compressItemImage(file)
        const ext = getExtensionFromMimeType(compressedFile.type)
        const path = `${householdId}/${itemId}.${ext}`

        // Upload to storage
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('item-images')
          .upload(path, compressedFile, {
            upsert: true,
            contentType: compressedFile.type,
          })

        if (uploadError) {
          setError(uploadError.message)
          return null
        }

        // Update item with the path
        const { error: updateError } = await supabase
          .from('items')
          .update({ image_url: uploadData.path })
          .eq('id', itemId)

        if (updateError) {
          setError(updateError.message)
          return null
        }

        setImageUrl(uploadData.path)
        return uploadData.path
      } catch (e) {
        const message = e instanceof Error ? e.message : 'Failed to upload image'
        setError(message)
        return null
      } finally {
        setUploading(false)
      }
    },
    [supabase]
  )

  const deleteImage = useCallback(
    async (itemId: string, householdId: string): Promise<boolean> => {
      if (!itemId || !householdId) {
        return false
      }

      setUploading(true)
      setError(null)

      try {
        // Get current image path from item
        const { data: itemData } = await supabase
          .from('items')
          .select('image_url')
          .eq('id', itemId)
          .single()

        if (!itemData?.image_url) {
          return false
        }

        const path = itemData.image_url

        // Delete from storage
        const { error: deleteError } = await supabase.storage.from('item-images').remove([path])

        if (deleteError) {
          setError(deleteError.message)
          return false
        }

        // Update item
        const { error: updateError } = await supabase
          .from('items')
          .update({ image_url: null })
          .eq('id', itemId)

        if (updateError) {
          setError(updateError.message)
          return false
        }

        setImageUrl(null)
        return true
      } catch (e) {
        const message = e instanceof Error ? e.message : 'Failed to delete image'
        setError(message)
        return false
      } finally {
        setUploading(false)
      }
    },
    [supabase]
  )

  const getSignedUrl = useCallback(
    async (path: string, householdId: string): Promise<string | null> => {
      if (!path || !householdId) {
        return null
      }

      try {
        const { data, error: urlError } = await supabase.storage
          .from('item-images')
          .createSignedUrl(path, 3600) // 1 hour expiry

        if (urlError) {
          setError(urlError.message)
          return null
        }

        return data.signedUrl
      } catch (e) {
        const message = e instanceof Error ? e.message : 'Failed to get signed URL'
        setError(message)
        return null
      }
    },
    [supabase]
  )

  return {
    imageUrl,
    uploading,
    error,
    uploadImage,
    deleteImage,
    getSignedUrl,
  }
}

