'use client'

import { useEffect } from 'react'
import { Button } from './button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from './dialog'
import { useCamera } from '@/lib/hooks/use-camera'

interface CameraCaptureProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onCapture: (file: File) => void
  onError?: (error: string) => void
}

export function CameraCapture({ open, onOpenChange, onCapture, onError }: CameraCaptureProps) {
  const { isOpen, error, startCamera, stopCamera, capturePhoto, videoRef } = useCamera()

  useEffect(() => {
    if (open) {
      startCamera()
    } else {
      stopCamera()
    }

    // Cleanup on unmount
    return () => {
      stopCamera()
    }
  }, [open, startCamera, stopCamera])

  useEffect(() => {
    if (error && onError) {
      onError(error)
    }
  }, [error, onError])

  async function handleCapture() {
    const file = await capturePhoto()
    if (file) {
      onCapture(file)
      stopCamera()
      onOpenChange(false)
    }
  }

  function handleClose() {
    stopCamera()
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[90vw] max-w-[95vw]">
        <DialogHeader className="mb-4">
          <DialogTitle>Take Photo</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 mb-4">
          {error ? (
            <div className="text-sm text-destructive bg-destructive/10 p-4 rounded">
              {error}
            </div>
          ) : (
            <div className="relative w-full bg-black rounded-lg overflow-hidden" style={{ aspectRatio: '4/3', maxHeight: '60vh' }}>
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover"
              />
              {!isOpen && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/50 z-10">
                  <div className="text-white text-center">
                    <div className="animate-spin mb-2">📷</div>
                    <p>Starting camera...</p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
        <DialogFooter className="mt-4 pt-4 border-t gap-2">
          <Button 
            type="button"
            variant="outline" 
            onClick={handleClose} 
            className="flex-1 sm:flex-initial min-w-[100px]"
          >
            Cancel
          </Button>
          <Button 
            type="button"
            onClick={handleCapture} 
            disabled={!isOpen || !!error} 
            className="flex-1 sm:flex-initial min-w-[100px]"
          >
            Capture Photo
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

