'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState, useRef, useEffect } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { UserMenu } from './user-menu'
import { useUser } from '@/lib/hooks/use-user'
import { useKonami } from '@/lib/hooks/use-konami'

interface HeaderProps {
  showSearch?: boolean
}

export function Header({ showSearch = true }: HeaderProps) {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState('')
  const [logoSpin, setLogoSpin] = useState(false)
  const clickCountRef = useRef(0)
  const clickTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const { user } = useUser()
  const konamiActivated = useKonami(() => {
    // Konami code easter egg - show geometric explosion animation
    document.body.style.animation = 'none'
    setTimeout(() => {
      document.body.style.animation = 'bauhaus-explosion 0.5s ease-out'
      setTimeout(() => {
        document.body.style.animation = ''
      }, 500)
    }, 10)
  })

  function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`)
    }
  }

  function handleLogoClick() {
    clickCountRef.current += 1

    // Reset counter after 1 second
    if (clickTimeoutRef.current) {
      clearTimeout(clickTimeoutRef.current)
    }

    clickTimeoutRef.current = setTimeout(() => {
      clickCountRef.current = 0
    }, 1000)

    // If clicked 3 times, spin the logo
    if (clickCountRef.current >= 3) {
      setLogoSpin(true)
      setTimeout(() => {
        setLogoSpin(false)
        clickCountRef.current = 0
      }, 1000)
    }
  }

  useEffect(() => {
    return () => {
      if (clickTimeoutRef.current) {
        clearTimeout(clickTimeoutRef.current)
      }
    }
  }, [])

  return (
    <header className="sticky top-0 z-40 border-b-2 border-border bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between gap-4">
        <Link
          href="/"
          className="flex items-center gap-2 font-bold text-xl"
          onClick={handleLogoClick}
        >
          <span
            className={`text-2xl transition-transform duration-1000 ${logoSpin ? 'rotate-360' : ''}`}
            style={
              logoSpin
                ? {
                    filter:
                      'drop-shadow(0 0 8px var(--bauhaus-red)) drop-shadow(0 0 8px var(--bauhaus-blue))',
                  }
                : {}
            }
          >
            📦
          </span>
          <span className="hidden sm:inline">BoxSort</span>
        </Link>

        {showSearch && (
          <form onSubmit={handleSearch} className="flex-1 max-w-md">
            <div className="relative">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
              >
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.3-4.3" />
              </svg>
              <Input
                type="search"
                placeholder="Search items..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 w-full"
              />
            </div>
          </form>
        )}

        <nav className="flex items-center gap-2">
          {user ? (
            <UserMenu displayName={user.display_name} avatarUrl={user.avatar_url} />
          ) : (
            <Link href="/settings">
              <Button variant="ghost" size="icon" title="Settings">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
                  <circle cx="12" cy="12" r="3" />
                </svg>
              </Button>
            </Link>
          )}
        </nav>
      </div>
    </header>
  )
}
