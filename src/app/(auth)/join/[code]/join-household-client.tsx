'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams, usePathname } from 'next/navigation'
import Link from 'next/link'
import { createBrowserClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'

export function JoinHouseholdClient() {
  const params = useParams()
  const pathname = usePathname()
  // For static export with GitHub Pages, fallback to extracting from pathname
  let code = params.code as string
  
  // If params only contains placeholder (due to 404.html fallback), extract from URL
  if (code === 'placeholder' && typeof window !== 'undefined') {
    const pathMatch = pathname.match(/^\/join\/([^/]+)/)
    if (pathMatch && pathMatch[1] && pathMatch[1] !== 'placeholder') {
      code = pathMatch[1]
    }
  }
  const router = useRouter()
  const supabase = createBrowserClient()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [, setIsNewUser] = useState(true)
  const [user, setUser] = useState<{ id: string; email?: string } | null>(null)

  useEffect(() => {
    // Check if user is already logged in
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) {
        setUser(data.user)
        setIsNewUser(false)
      }
    })
  }, [supabase])

  async function handleJoinExisting() {
    if (!user) return
    setError(null)
    setLoading(true)

    try {
      const { error: joinError } = await supabase.rpc('join_household', { code })

      if (joinError) {
        setError(joinError.message)
        return
      }

      router.push('/')
      router.refresh()
    } catch {
      setError('Failed to join household')
    } finally {
      setLoading(false)
    }
  }

  async function handleSignupAndJoin(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      // Sign up the user
      const { data: authData, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            display_name: displayName || email.split('@')[0],
          },
        },
      })

      if (signUpError) {
        setError(signUpError.message)
        return
      }

      if (!authData.user) {
        setError('Failed to create account')
        return
      }

      // Join the household
      const { error: joinError } = await supabase.rpc('join_household', { code })

      if (joinError) {
        setError(joinError.message)
        return
      }

      router.push('/')
      router.refresh()
    } catch {
      setError('An unexpected error occurred')
    } finally {
      setLoading(false)
    }
  }

  // User is already logged in - show join button
  if (user) {
    return (
      <Card>
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold">Join Household</CardTitle>
          <CardDescription>
            You&apos;re about to join a household with invite code: <code className="font-mono bg-muted px-1 rounded">{code}</code>
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <div className="p-3 text-sm text-destructive bg-destructive/10 rounded-md">{error}</div>
          )}
          <p className="text-sm text-muted-foreground">
            Signed in as <strong>{user.email}</strong>
          </p>
        </CardContent>
        <CardFooter className="flex flex-col space-y-4">
          <Button onClick={handleJoinExisting} className="w-full" disabled={loading}>
            {loading ? 'Joining...' : 'Join Household'}
          </Button>
          <p className="text-sm text-muted-foreground text-center">
            <Link href="/" className="text-primary hover:underline">
              Cancel
            </Link>
          </p>
        </CardFooter>
      </Card>
    )
  }

  // User is not logged in - show signup form
  return (
    <Card>
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-bold">Join Household</CardTitle>
        <CardDescription>
          Create an account to join the household with invite code: <code className="font-mono bg-muted px-1 rounded">{code}</code>
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSignupAndJoin}>
        <CardContent className="space-y-4">
          {error && (
            <div className="p-3 text-sm text-destructive bg-destructive/10 rounded-md">{error}</div>
          )}
          <div className="space-y-2">
            <label htmlFor="displayName" className="text-sm font-medium">
              Your Name
            </label>
            <Input
              id="displayName"
              type="text"
              placeholder="John"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              disabled={loading}
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="email" className="text-sm font-medium">
              Email
            </label>
            <Input
              id="email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={loading}
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="password" className="text-sm font-medium">
              Password
            </label>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              disabled={loading}
            />
          </div>
        </CardContent>
        <CardFooter className="flex flex-col space-y-4">
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? 'Creating account...' : 'Sign up & Join'}
          </Button>
          <p className="text-sm text-muted-foreground text-center">
            Already have an account?{' '}
            <Link href="/login" className="text-primary hover:underline">
              Sign in first
            </Link>
          </p>
        </CardFooter>
      </form>
    </Card>
  )
}

