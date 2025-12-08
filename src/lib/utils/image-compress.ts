import imageCompression from 'browser-image-compression'

export interface CompressionOptions {
  maxSizeMB?: number
  maxWidthOrHeight?: number
  useWebWorker?: boolean
  fileType?: string
  initialQuality?: number
}

const DEFAULT_OPTIONS: CompressionOptions = {
  maxSizeMB: 0.5, // 500KB max
  maxWidthOrHeight: 1200, // Max dimension
  useWebWorker: true, // Non-blocking
  fileType: 'image/webp', // Modern format
  initialQuality: 0.8, // Good balance
}

/**
 * Compress an image file to a smaller size while maintaining quality
 * @param file - The image file to compress
 * @param options - Compression options (optional)
 * @returns Compressed file as Blob
 */
export async function compressImage(
  file: File,
  options: CompressionOptions = {}
): Promise<File> {
  const mergedOptions = { ...DEFAULT_OPTIONS, ...options }

  try {
    const compressedFile = await imageCompression(file, mergedOptions)
    return compressedFile
  } catch (error) {
    console.error('Image compression failed:', error)
    // Return original file if compression fails
    return file
  }
}

/**
 * Compress an image specifically for avatars (smaller dimensions)
 * @param file - The image file to compress
 * @returns Compressed file as Blob
 */
export async function compressAvatar(file: File): Promise<File> {
  return compressImage(file, {
    maxSizeMB: 0.2, // 200KB for avatars
    maxWidthOrHeight: 400, // Smaller for avatars
    fileType: 'image/webp',
    initialQuality: 0.85,
  })
}

/**
 * Compress an image specifically for item photos
 * @param file - The image file to compress
 * @returns Compressed file as Blob
 */
export async function compressItemImage(file: File): Promise<File> {
  return compressImage(file, {
    maxSizeMB: 0.5, // 500KB for items
    maxWidthOrHeight: 1200,
    fileType: 'image/webp',
    initialQuality: 0.8,
  })
}

/**
 * Convert a File to a base64 data URL
 * @param file - The file to convert
 * @returns Promise resolving to base64 data URL
 */
export function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

/**
 * Check if a file is a valid image type
 * @param file - The file to check
 * @returns True if the file is a valid image
 */
export function isValidImageType(file: File): boolean {
  const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
  return validTypes.includes(file.type)
}

/**
 * Get the file extension from a MIME type
 * @param mimeType - The MIME type
 * @returns File extension (e.g., 'webp', 'jpg')
 */
export function getExtensionFromMimeType(mimeType: string): string {
  const mimeToExt: Record<string, string> = {
    'image/jpeg': 'jpg',
    'image/png': 'png',
    'image/webp': 'webp',
    'image/gif': 'gif',
  }
  return mimeToExt[mimeType] || 'webp'
}

