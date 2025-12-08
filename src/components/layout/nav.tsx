'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const navItems = [
  { href: '/', label: 'Boxes', icon: '📦' },
  { href: '/search', label: 'Search', icon: '🔍' },
  { href: '/settings', label: 'Settings', icon: '⚙️' },
]

export function Nav() {
  const pathname = usePathname()

  return (
    <nav className="hidden md:flex flex-col gap-1 p-4 border-r border-border min-w-[200px]">
      {navItems.map((item) => {
        const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href))
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`flex items-center gap-3 px-3 py-2 rounded-md transition-colors ${
              isActive
                ? 'bg-primary text-primary-foreground'
                : 'hover:bg-muted'
            }`}
          >
            <span>{item.icon}</span>
            <span>{item.label}</span>
          </Link>
        )
      })}
    </nav>
  )
}

