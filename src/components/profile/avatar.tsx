'use client'

import Image from 'next/image'
import { createBrowserClient } from '@/lib/supabase/client'

interface AvatarProps {
  displayName: string
  avatarUrl: string | null
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/)
  if (parts.length >= 2) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
  }
  if (parts[0].length > 0) {
    return parts[0][0].toUpperCase()
  }
  return '?'
}

export function Avatar({ displayName, avatarUrl, size = 'md', className = '' }: AvatarProps) {
  const supabase = createBrowserClient()
  
  const sizeClasses = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-16 h-16 text-lg',
  }

  const sizePixels = {
    sm: 32,
    md: 40,
    lg: 64,
  }

  if (avatarUrl) {
    // Get public URL if it's a storage path
    const publicUrl = avatarUrl.startsWith('http')
      ? avatarUrl
      : supabase.storage.from('avatars').getPublicUrl(avatarUrl).data.publicUrl

    return (
      <div className={`relative ${sizeClasses[size]} rounded-full overflow-hidden ${className}`}>
        <Image
          src={publicUrl}
          alt={`${displayName}'s avatar`}
          width={sizePixels[size]}
          height={sizePixels[size]}
          className="object-cover"
          data-testid="avatar-image"
        />
      </div>
    )
  }

  return (
    <div
      className={`${sizeClasses[size]} rounded-full bg-primary/10 text-primary flex items-center justify-center font-semibold ${className}`}
      data-testid="avatar-initials"
    >
      {getInitials(displayName)}
    </div>
  )
}

