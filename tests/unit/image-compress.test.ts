import { describe, it, expect, vi, beforeEach } from 'vitest'
import {
  compressImage,
  compressAvatar,
  compressItemImage,
  fileToDataUrl,
  isValidImageType,
  getExtensionFromMimeType,
} from '@/lib/utils/image-compress'

// Mock browser-image-compression
vi.mock('browser-image-compression', () => ({
  default: vi.fn().mockImplementation(async (file: File) => {
    // Return a mock compressed file
    return new File([new Blob(['compressed'])], file.name, { type: 'image/webp' })
  }),
}))

describe('image-compress', () => {
  let mockFile: File

  beforeEach(() => {
    mockFile = new File(['test image content'], 'test.jpg', { type: 'image/jpeg' })
  })

  describe('compressImage', () => {
    it('should compress an image with default options', async () => {
      const result = await compressImage(mockFile)

      expect(result).toBeInstanceOf(File)
      expect(result.type).toBe('image/webp')
    })

    it('should accept custom compression options', async () => {
      const result = await compressImage(mockFile, {
        maxSizeMB: 1,
        maxWidthOrHeight: 800,
      })

      expect(result).toBeInstanceOf(File)
    })
  })

  describe('compressAvatar', () => {
    it('should compress an image for avatar use', async () => {
      const result = await compressAvatar(mockFile)

      expect(result).toBeInstanceOf(File)
      // Avatar should be compressed
      expect(result.type).toBe('image/webp')
    })
  })

  describe('compressItemImage', () => {
    it('should compress an image for item use', async () => {
      const result = await compressItemImage(mockFile)

      expect(result).toBeInstanceOf(File)
      expect(result.type).toBe('image/webp')
    })
  })

  describe('fileToDataUrl', () => {
    it('should convert a file to a data URL', async () => {
      const result = await fileToDataUrl(mockFile)

      expect(result).toBeDefined()
      expect(typeof result).toBe('string')
      expect(result).toContain('data:')
    })
  })

  describe('isValidImageType', () => {
    it('should return true for valid image types', () => {
      const jpegFile = new File([''], 'test.jpg', { type: 'image/jpeg' })
      const pngFile = new File([''], 'test.png', { type: 'image/png' })
      const webpFile = new File([''], 'test.webp', { type: 'image/webp' })
      const gifFile = new File([''], 'test.gif', { type: 'image/gif' })

      expect(isValidImageType(jpegFile)).toBe(true)
      expect(isValidImageType(pngFile)).toBe(true)
      expect(isValidImageType(webpFile)).toBe(true)
      expect(isValidImageType(gifFile)).toBe(true)
    })

    it('should return false for invalid image types', () => {
      const textFile = new File([''], 'test.txt', { type: 'text/plain' })
      const pdfFile = new File([''], 'test.pdf', { type: 'application/pdf' })

      expect(isValidImageType(textFile)).toBe(false)
      expect(isValidImageType(pdfFile)).toBe(false)
    })
  })

  describe('getExtensionFromMimeType', () => {
    it('should return correct extension for known mime types', () => {
      expect(getExtensionFromMimeType('image/jpeg')).toBe('jpg')
      expect(getExtensionFromMimeType('image/png')).toBe('png')
      expect(getExtensionFromMimeType('image/webp')).toBe('webp')
      expect(getExtensionFromMimeType('image/gif')).toBe('gif')
    })

    it('should return webp for unknown mime types', () => {
      expect(getExtensionFromMimeType('image/unknown')).toBe('webp')
      expect(getExtensionFromMimeType('application/octet-stream')).toBe('webp')
    })
  })
})

