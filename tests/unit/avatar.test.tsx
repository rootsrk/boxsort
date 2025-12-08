import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Avatar } from '@/components/profile/avatar'

// Mock Supabase storage
vi.mock('@/lib/supabase/client', () => ({
  createBrowserClient: vi.fn(() => ({
    storage: {
      from: vi.fn(() => ({
        getPublicUrl: vi.fn((path: string) => ({
          data: { publicUrl: `https://example.com/storage/${path}` },
        })),
      })),
    },
  })),
}))

describe('Avatar', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should display user initials when no avatar URL provided', () => {
    render(<Avatar displayName="John Doe" avatarUrl={null} />)
    
    expect(screen.getByText('JD')).toBeInTheDocument()
  })

  it('should display initials from display name', () => {
    render(<Avatar displayName="Jane Smith" avatarUrl={null} />)
    
    expect(screen.getByText('JS')).toBeInTheDocument()
  })

  it('should handle single word names', () => {
    render(<Avatar displayName="Madonna" avatarUrl={null} />)
    
    expect(screen.getByText('M')).toBeInTheDocument()
  })

  it('should display avatar image when URL is provided', () => {
    const avatarUrl = 'user123/avatar.webp'
    render(<Avatar displayName="John Doe" avatarUrl={avatarUrl} />)
    
    const img = screen.getByRole('img')
    expect(img).toBeInTheDocument()
    expect(img).toHaveAttribute('alt', "John Doe's avatar")
  })

  it('should have circular styling', () => {
    const { container } = render(<Avatar displayName="Test" avatarUrl={null} />)
    
    const avatar = container.firstChild
    expect(avatar).toHaveClass('rounded-full')
  })

  it('should handle empty display name gracefully', () => {
    render(<Avatar displayName="" avatarUrl={null} />)
    
    // Should render something (empty string or placeholder)
    expect(screen.getByTestId('avatar-initials') || screen.getByRole('img')).toBeInTheDocument()
  })
})

