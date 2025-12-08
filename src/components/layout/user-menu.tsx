'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createBrowserClient } from '@/lib/supabase/client'
import { Avatar } from '@/components/profile/avatar'

interface UserMenuProps {
  displayName: string
  avatarUrl: string | null
}

export function UserMenu({ displayName, avatarUrl }: UserMenuProps) {
  const [isOpen, setIsOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)
  const router = useRouter()
  const supabase = createBrowserClient()

  // Close menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => {
        document.removeEventListener('mousedown', handleClickOutside)
      }
    }
  }, [isOpen])

  async function handleSignOut() {
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  return (
    <div className="relative" ref={menuRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary rounded-full"
        aria-label="User menu"
        aria-expanded={isOpen}
        data-testid="user-avatar"
      >
        <Avatar displayName={displayName} avatarUrl={avatarUrl} size="md" />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-background border rounded-lg shadow-lg z-50">
          <div className="py-1">
            <Link
              href="/profile"
              className="block px-4 py-2 text-sm hover:bg-muted"
              onClick={() => setIsOpen(false)}
            >
              View Profile
            </Link>
            <Link
              href="/settings"
              className="block px-4 py-2 text-sm hover:bg-muted"
              onClick={() => setIsOpen(false)}
            >
              Settings
            </Link>
            <div className="border-t my-1" />
            <button
              type="button"
              onClick={handleSignOut}
              className="w-full text-left px-4 py-2 text-sm text-destructive hover:bg-muted"
            >
              Sign Out
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

