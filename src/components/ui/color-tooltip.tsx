'use client'

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useReducedMotion } from '@/lib/hooks/use-reduced-motion'

interface ColorTooltipProps {
  color: string
  colorName?: string
  children: React.ReactNode
}

export function ColorTooltip({ color, colorName, children }: ColorTooltipProps) {
  const [showTooltip, setShowTooltip] = useState(false)
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 })
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)
  const elementRef = useRef<HTMLDivElement>(null)
  const prefersReducedMotion = useReducedMotion()

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [])

  function handleTouchStart(e: React.TouchEvent) {
    if (prefersReducedMotion) return
    
    const touch = e.touches[0]
    const rect = elementRef.current?.getBoundingClientRect()
    if (rect) {
      setTooltipPosition({
        x: touch.clientX - rect.left,
        y: touch.clientY - rect.top,
      })
    }

    timeoutRef.current = setTimeout(() => {
      setShowTooltip(true)
    }, 500) // Long press = 500ms
  }

  function handleTouchEnd() {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }
    setTimeout(() => {
      setShowTooltip(false)
    }, 2000) // Show for 2 seconds
  }

  function handleMouseEnter(e: React.MouseEvent) {
    if (prefersReducedMotion) return
    
    const rect = elementRef.current?.getBoundingClientRect()
    if (rect) {
      setTooltipPosition({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      })
    }
    setShowTooltip(true)
  }

  function handleMouseLeave() {
    setShowTooltip(false)
  }

  const colorInfo = colorName || color

  return (
    <div
      ref={elementRef}
      className="relative"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {children}
      <AnimatePresence>
        {showTooltip && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.2 }}
            className="absolute z-50 pointer-events-none"
            style={{
              left: `${tooltipPosition.x}px`,
              top: `${tooltipPosition.y - 40}px`,
              transform: 'translateX(-50%)',
            }}
          >
            <div className="bg-black text-white text-xs px-3 py-2 rounded shadow-lg whitespace-nowrap">
              <div className="flex items-center gap-2">
                <div
                  className="w-4 h-4 rounded border-2 border-white"
                  style={{ backgroundColor: color }}
                />
                <span className="font-mono">{colorInfo}</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

