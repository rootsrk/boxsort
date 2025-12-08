import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { useReducedMotion } from '@/lib/hooks/use-reduced-motion'

describe('useReducedMotion', () => {
  let originalMatchMedia: typeof window.matchMedia

  beforeEach(() => {
    originalMatchMedia = window.matchMedia
  })

  afterEach(() => {
    window.matchMedia = originalMatchMedia
  })

  it('should return false when prefers-reduced-motion is not set', () => {
    window.matchMedia = vi.fn().mockReturnValue({
      matches: false,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      addListener: vi.fn(),
      removeListener: vi.fn(),
      media: '',
      onchange: null,
      dispatchEvent: vi.fn(),
    })

    const { result } = renderHook(() => useReducedMotion())
    expect(result.current).toBe(false)
  })

  it('should return true when prefers-reduced-motion is set', () => {
    window.matchMedia = vi.fn().mockReturnValue({
      matches: true,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      addListener: vi.fn(),
      removeListener: vi.fn(),
      media: '',
      onchange: null,
      dispatchEvent: vi.fn(),
    })

    const { result } = renderHook(() => useReducedMotion())
    expect(result.current).toBe(true)
  })

  it('should update when media query changes', async () => {
    const listeners: Array<(event: MediaQueryListEvent) => void> = []
    let matches = false

    window.matchMedia = vi.fn().mockReturnValue({
      get matches() {
        return matches
      },
      addEventListener: vi.fn((event: string, callback: (event: MediaQueryListEvent) => void) => {
        listeners.push(callback)
      }),
      removeEventListener: vi.fn(),
      addListener: vi.fn(),
      removeListener: vi.fn(),
      media: '',
      onchange: null,
      dispatchEvent: vi.fn(),
    })

    const { result } = renderHook(() => useReducedMotion())
    expect(result.current).toBe(false)

    matches = true
    listeners.forEach((listener) => {
      listener({ matches: true } as MediaQueryListEvent)
    })

    await waitFor(() => {
      expect(result.current).toBe(true)
    })
  })
})

