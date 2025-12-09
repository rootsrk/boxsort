'use client'

import { useEffect } from 'react'

/**
 * Handles failed RSC payload requests in static export gracefully
 * Next.js App Router tries to fetch RSC payloads that don't exist in static export
 * This component suppresses console errors and prevents unhandled rejections
 * without modifying global fetch (which could break other functionality)
 */
export function RSCErrorHandler() {
  useEffect(() => {
    // Suppress console errors for RSC payload 404s (they're expected in static export)
    const originalError = console.error
    console.error = (...args: unknown[]) => {
      const message = args.join(' ')
      // Don't log errors for missing RSC payloads in static export
      if (
        typeof message === 'string' &&
        (message.includes('_next._') ||
          message.includes('_rsc=') ||
          (message.includes('404') && message.includes('_next')))
      ) {
        return // Suppress these expected errors
      }
      originalError(...args)
    }

    // Handle unhandled promise rejections for RSC fetch errors
    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      const reason = event.reason
      if (reason) {
        const message =
          reason instanceof Error
            ? reason.message
            : typeof reason === 'string'
              ? reason
              : String(reason)
        
        // Suppress errors for missing RSC payloads (expected in static export)
        if (
          typeof message === 'string' &&
          (message.includes('_next._') ||
            message.includes('_rsc=') ||
            message.includes('Failed to fetch') ||
            (message.includes('404') && message.includes('_next')))
        ) {
          event.preventDefault()
          return
        }
      }
    }

    window.addEventListener('unhandledrejection', handleUnhandledRejection)

    return () => {
      console.error = originalError
      window.removeEventListener('unhandledrejection', handleUnhandledRejection)
    }
  }, [])

  return null
}

