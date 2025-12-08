'use client'

import { useReducedMotion } from '@/lib/hooks/use-reduced-motion'

interface BauhausPatternProps {
  variant?: 'default' | 'circles' | 'triangles'
  className?: string
  opacity?: number
}

export function BauhausPattern({
  variant = 'default',
  className = '',
  opacity = 0.1,
}: BauhausPatternProps) {
  const prefersReducedMotion = useReducedMotion()

  const baseClasses = 'bauhaus-pattern absolute inset-0 pointer-events-none -z-10'
  const variantClasses = {
    default: 'bauhaus-pattern',
    circles: 'bauhaus-pattern-circles',
    triangles: 'bauhaus-pattern-triangles',
  }

  if (prefersReducedMotion) {
    return null
  }

  return (
    <div
      className={`${baseClasses} ${variantClasses[variant]} ${className}`}
      style={{ opacity }}
      aria-hidden="true"
    />
  )
}
