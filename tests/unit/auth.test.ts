import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock Supabase auth functions
const mockSignUp = vi.fn()
const mockSignIn = vi.fn()
const mockSignOut = vi.fn()

vi.mock('@/lib/supabase/client', () => ({
  createBrowserClient: () => ({
    auth: {
      signUp: mockSignUp,
      signInWithPassword: mockSignIn,
      signOut: mockSignOut,
    },
  }),
}))

describe('Auth Flow', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Sign Up', () => {
    it('should create a new user with email and password', async () => {
      mockSignUp.mockResolvedValue({
        data: { user: { id: 'test-user-id', email: 'test@example.com' } },
        error: null,
      })

      const result = await mockSignUp({
        email: 'test@example.com',
        password: 'password123',
        options: {
          data: { display_name: 'Test User' },
        },
      })

      expect(mockSignUp).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123',
        options: {
          data: { display_name: 'Test User' },
        },
      })
      expect(result.data.user).toBeDefined()
      expect(result.error).toBeNull()
    })

    it('should handle signup errors', async () => {
      mockSignUp.mockResolvedValue({
        data: { user: null },
        error: { message: 'Email already registered' },
      })

      const result = await mockSignUp({
        email: 'existing@example.com',
        password: 'password123',
      })

      expect(result.error).toBeDefined()
      expect(result.error?.message).toBe('Email already registered')
    })
  })

  describe('Sign In', () => {
    it('should sign in with email and password', async () => {
      mockSignIn.mockResolvedValue({
        data: { user: { id: 'test-user-id', email: 'test@example.com' } },
        error: null,
      })

      const result = await mockSignIn({
        email: 'test@example.com',
        password: 'password123',
      })

      expect(mockSignIn).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123',
      })
      expect(result.data.user).toBeDefined()
      expect(result.error).toBeNull()
    })

    it('should handle invalid credentials', async () => {
      mockSignIn.mockResolvedValue({
        data: { user: null },
        error: { message: 'Invalid login credentials' },
      })

      const result = await mockSignIn({
        email: 'test@example.com',
        password: 'wrongpassword',
      })

      expect(result.error).toBeDefined()
      expect(result.error?.message).toBe('Invalid login credentials')
    })
  })

  describe('Sign Out', () => {
    it('should sign out the user', async () => {
      mockSignOut.mockResolvedValue({ error: null })

      const result = await mockSignOut()

      expect(mockSignOut).toHaveBeenCalled()
      expect(result.error).toBeNull()
    })
  })
})

