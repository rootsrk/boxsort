'use client'

import { useState, useRef, useCallback } from 'react'

interface UseCameraReturn {
  isOpen: boolean
  error: string | null
  startCamera: () => Promise<void>
  stopCamera: () => void
  capturePhoto: () => Promise<File | null>
  videoRef: React.RefObject<HTMLVideoElement | null>
}

export function useCamera(): UseCameraReturn {
  const [isOpen, setIsOpen] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const streamRef = useRef<MediaStream | null>(null)

  const startCamera = useCallback(async () => {
    try {
      setError(null)
      
      // Request camera access
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'environment', // Use back camera on mobile
          width: { ideal: 1920 },
          height: { ideal: 1080 },
        },
        audio: false,
      })

      streamRef.current = stream
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        await videoRef.current.play()
        setIsOpen(true)
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to access camera'
      setError(message)
      setIsOpen(false)
      
      // Provide helpful error messages
      if (err instanceof DOMException) {
        if (err.name === 'NotAllowedError') {
          setError('Camera access denied. Please allow camera access in your browser settings.')
        } else if (err.name === 'NotFoundError') {
          setError('No camera found. Please check your device.')
        } else if (err.name === 'NotReadableError') {
          setError('Camera is already in use by another application.')
        }
      }
    }
  }, [])

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop())
      streamRef.current = null
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null
    }
    setIsOpen(false)
    setError(null)
  }, [])

  const capturePhoto = useCallback(async (): Promise<File | null> => {
    if (!videoRef.current || !streamRef.current) {
      return null
    }

    try {
      const video = videoRef.current
      const canvas = document.createElement('canvas')
      canvas.width = video.videoWidth
      canvas.height = video.videoHeight
      
      const ctx = canvas.getContext('2d')
      if (!ctx) {
        throw new Error('Failed to get canvas context')
      }

      // Draw the video frame to canvas
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height)

      // Convert canvas to blob
      return new Promise((resolve, reject) => {
        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error('Failed to capture photo'))
              return
            }
            
            // Create a File from the blob
            const file = new File([blob], `photo-${Date.now()}.jpg`, {
              type: 'image/jpeg',
            })
            resolve(file)
          },
          'image/jpeg',
          0.92 // Quality
        )
      })
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to capture photo'
      setError(message)
      return null
    }
  }, [])

  return {
    isOpen,
    error,
    startCamera,
    stopCamera,
    capturePhoto,
    videoRef,
  }
}

