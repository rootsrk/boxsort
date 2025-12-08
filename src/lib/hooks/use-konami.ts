'use client'

import { useEffect, useState } from 'react'

const KONAMI_CODE = [
  'ArrowUp',
  'ArrowUp',
  'ArrowDown',
  'ArrowDown',
  'ArrowLeft',
  'ArrowRight',
  'ArrowLeft',
  'ArrowRight',
  'KeyB',
  'KeyA',
]

/**
 * Hook to detect Konami code input
 * Returns true when the code sequence is entered
 */
export function useKonami(onActivate?: () => void): boolean {
  const [activated, setActivated] = useState(false)
  const [sequence, setSequence] = useState<string[]>([])

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      const newSequence = [...sequence, event.code]
      
      // Keep only the last N keys (where N is the length of Konami code)
      const trimmedSequence = newSequence.slice(-KONAMI_CODE.length)
      setSequence(trimmedSequence)

      // Check if sequence matches Konami code
      if (
        trimmedSequence.length === KONAMI_CODE.length &&
        trimmedSequence.every((key, index) => key === KONAMI_CODE[index])
      ) {
        setActivated(true)
        if (onActivate) {
          onActivate()
        }
        // Reset after 3 seconds
        setTimeout(() => {
          setActivated(false)
          setSequence([])
        }, 3000)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [sequence, onActivate])

  return activated
}

