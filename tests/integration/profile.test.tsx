import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { AvatarUpload } from '@/components/profile/avatar-upload'

// Mock Supabase
const mockUpload = vi.fn()
const mockUpdate = vi.fn()
const mockGetPublicUrl = vi.fn()

vi.mock('@/lib/supabase/client', () => ({
  createBrowserClient: vi.fn(() => ({
    storage: {
      from: vi.fn(() => ({
        upload: mockUpload,
        getPublicUrl: mockGetPublicUrl,
      })),
    },
    from: vi.fn(() => ({
      update: mockUpdate,
      eq: vi.fn(() => ({ eq: vi.fn() })),
    })),
    auth: {
      getUser: vi.fn(() => ({
        data: { user: { id: 'user-123' } },
      })),
    },
  })),
}))

vi.mock('@/lib/utils/image-compress', () => ({
  compressAvatar: vi.fn((file: File) => Promise.resolve(file)),
}))

describe('Profile Picture Upload Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockUpload.mockResolvedValue({ data: { path: 'user-123/avatar.webp' }, error: null })
    mockGetPublicUrl.mockReturnValue({ data: { publicUrl: 'https://example.com/avatar.webp' } })
    mockUpdate.mockResolvedValue({ error: null })
  })

  it('should allow user to select image file', async () => {
    const user = userEvent.setup()
    const onUploadComplete = vi.fn()
    const mockAuthUser = { id: 'user-123', email: 'test@example.com' } as { id: string; email: string }
    
    render(
      <AvatarUpload
        user={mockAuthUser}
        displayName="Test User"
        currentAvatarUrl={null}
        onUploadComplete={onUploadComplete}
      />
    )
    
    const fileInput = screen.getByRole('button', { name: /change picture/i })
    const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' })
    
    // Click button to trigger file input
    await user.click(fileInput)
    
    // Find the hidden file input
    const hiddenInput = document.querySelector('input[type="file"]') as HTMLInputElement
    expect(hiddenInput).toBeInTheDocument()
    
    await user.upload(hiddenInput, file)
    
    await waitFor(() => {
      expect(mockUpload).toHaveBeenCalled()
    })
  })

  it('should compress image before upload', async () => {
    const { compressAvatar } = await import('@/lib/utils/image-compress')
    const user = userEvent.setup()
    const onUploadComplete = vi.fn()
    const mockAuthUser = { id: 'user-123', email: 'test@example.com' } as { id: string; email: string }
    
    render(
      <AvatarUpload
        user={mockAuthUser}
        displayName="Test User"
        currentAvatarUrl={null}
        onUploadComplete={onUploadComplete}
      />
    )
    
    const fileInput = screen.getByRole('button', { name: /change picture/i })
    const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' })
    
    await user.click(fileInput)
    const hiddenInput = document.querySelector('input[type="file"]') as HTMLInputElement
    await user.upload(hiddenInput, file)
    
    await waitFor(() => {
      expect(compressAvatar).toHaveBeenCalledWith(file)
    })
  })

  it('should update user profile with avatar URL after upload', async () => {
    const user = userEvent.setup()
    const onUploadComplete = vi.fn()
    const mockAuthUser = { id: 'user-123', email: 'test@example.com' } as { id: string; email: string }
    
    render(
      <AvatarUpload
        user={mockAuthUser}
        displayName="Test User"
        currentAvatarUrl={null}
        onUploadComplete={onUploadComplete}
      />
    )
    
    const fileInput = screen.getByRole('button', { name: /change picture/i })
    const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' })
    
    await user.click(fileInput)
    const hiddenInput = document.querySelector('input[type="file"]') as HTMLInputElement
    await user.upload(hiddenInput, file)
    
    await waitFor(() => {
      expect(mockUpdate).toHaveBeenCalled()
      expect(onUploadComplete).toHaveBeenCalled()
    })
  })

  it('should show error message on upload failure', async () => {
    mockUpload.mockResolvedValue({ data: null, error: { message: 'Upload failed' } })
    const user = userEvent.setup()
    const mockAuthUser = { id: 'user-123', email: 'test@example.com' } as { id: string; email: string }
    
    render(
      <AvatarUpload
        user={mockAuthUser}
        displayName="Test User"
        currentAvatarUrl={null}
        onUploadComplete={vi.fn()}
      />
    )
    
    const fileInput = screen.getByRole('button', { name: /change picture/i })
    const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' })
    
    await user.click(fileInput)
    const hiddenInput = document.querySelector('input[type="file"]') as HTMLInputElement
    await user.upload(hiddenInput, file)
    
    await waitFor(() => {
      expect(screen.getByText(/error|failed/i)).toBeInTheDocument()
    })
  })
})

