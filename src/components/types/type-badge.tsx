'use client'

import { getContrastingTextColor } from '@/lib/utils/type-colors'

interface TypeBadgeProps {
  name: string
  color: string
  onClick?: () => void
  className?: string
}

export function TypeBadge({ name, color, onClick, className = '' }: TypeBadgeProps) {
  const textColor = getContrastingTextColor(color)

  const baseClasses = 'inline-flex items-center px-2 py-1 rounded-full text-xs font-medium transition-colors'
  const clickableClasses = onClick ? 'cursor-pointer hover:opacity-80' : ''

  return (
    <span
      className={`${baseClasses} ${clickableClasses} ${className}`}
      style={{
        backgroundColor: color,
        color: textColor,
      }}
      onClick={onClick}
      data-testid="type-badge"
    >
      {name}
    </span>
  )
}

