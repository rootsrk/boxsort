'use client'

export const dynamic = 'force-dynamic'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createBrowserClient } from '@/lib/supabase/client'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { AvatarUpload } from '@/components/profile/avatar-upload'
import type { Household, User } from '@/lib/supabase/types'
import type { User as AuthUser } from '@supabase/supabase-js'

export default function SettingsPage() {
  const router = useRouter()
  const supabase = createBrowserClient()
  
  const [authUser, setAuthUser] = useState<AuthUser | null>(null)
  const [user, setUser] = useState<User | null>(null)
  const [household, setHousehold] = useState<Household | null>(null)
  const [loading, setLoading] = useState(true)
  const [copying, setCopying] = useState(false)
  const [regenerating, setRegenerating] = useState(false)
  const [creating, setCreating] = useState(false)
  const [newHouseholdName, setNewHouseholdName] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  async function loadData() {
    const { data: authData } = await supabase.auth.getUser()
    if (!authData.user) {
      router.push('/login')
      return
    }
    
    setAuthUser(authData.user)

    // Get user profile
    const { data: userData } = await supabase
      .from('users')
      .select('*')
      .eq('id', authData.user.id)
      .single()

    if (userData) {
      setUser(userData)

      // Get household
      if (userData.household_id) {
        const { data: householdData } = await supabase
          .from('households')
          .select('*')
          .eq('id', userData.household_id)
          .single()

        if (householdData) {
          setHousehold(householdData)
        }
      }
    }

    setLoading(false)
  }

  useEffect(() => {
    loadData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const inviteUrl = household
    ? `${process.env.NEXT_PUBLIC_APP_URL || window.location.origin}/join/${household.invite_code}`
    : ''

  async function copyInviteLink() {
    if (!inviteUrl) return
    setCopying(true)
    try {
      await navigator.clipboard.writeText(inviteUrl)
      setSuccess('Invite link copied!')
      setTimeout(() => setSuccess(null), 3000)
    } catch {
      setError('Failed to copy link')
    } finally {
      setCopying(false)
    }
  }

  async function regenerateInviteCode() {
    if (!household) return
    setRegenerating(true)
    setError(null)

    try {
      const { data, error: rpcError } = await supabase.rpc('regenerate_invite_code', {
        household_uuid: household.id,
      })

      if (rpcError) {
        setError(rpcError.message)
        return
      }

      setHousehold({ ...household, invite_code: data })
      setSuccess('Invite code regenerated!')
      setTimeout(() => setSuccess(null), 3000)
    } catch {
      setError('Failed to regenerate code')
    } finally {
      setRegenerating(false)
    }
  }

  async function createHousehold() {
    if (!authUser || !newHouseholdName.trim()) return
    setCreating(true)
    setError(null)

    try {
      // Try using the database function first
      const { data: householdId, error: rpcError } = await supabase.rpc('create_household_for_user', {
        user_id: authUser.id,
        household_name: newHouseholdName.trim(),
      })

      if (rpcError) {
        // Fallback: try direct insert
        const { data: newHousehold, error: insertError } = await supabase
          .from('households')
          .insert({
            name: newHouseholdName.trim(),
            owner_id: authUser.id,
          })
          .select()
          .single()

        if (insertError) {
          setError(insertError.message)
          return
        }

        // Update user's household_id
        await supabase
          .from('users')
          .update({ household_id: newHousehold.id })
          .eq('id', authUser.id)

        setHousehold(newHousehold)
      } else {
        // Fetch the created household
        const { data: newHousehold } = await supabase
          .from('households')
          .select('*')
          .eq('id', householdId)
          .single()

        if (newHousehold) {
          setHousehold(newHousehold)
        }
      }

      setSuccess('Household created! Redirecting...')
      setNewHouseholdName('')
      
      // Redirect to home after a short delay to show success message
      setTimeout(() => {
        router.push('/')
        router.refresh()
      }, 1000)
    } catch {
      setError('Failed to create household')
    } finally {
      setCreating(false)
    }
  }

  async function handleSignOut() {
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 w-48 bg-muted rounded" />
          <div className="h-64 bg-muted rounded-lg" />
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <h1 className="text-3xl font-bold mb-8">Settings</h1>

      {error && (
        <div className="mb-4 p-3 text-sm text-destructive bg-destructive/10 rounded-md">{error}</div>
      )}
      {success && (
        <div className="mb-4 p-3 text-sm text-green-600 bg-green-100 dark:bg-green-900/20 rounded-md">
          {success}
        </div>
      )}

      <div className="space-y-6">
        {/* Profile Section */}
        <Card>
          <CardHeader>
            <CardTitle>Profile</CardTitle>
            <CardDescription>Your account information</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {authUser && user && (
              <AvatarUpload
                user={authUser}
                displayName={user.display_name}
                currentAvatarUrl={user.avatar_url}
                onUploadComplete={() => {
                  // Refresh user data
                  router.refresh()
                  loadData()
                }}
              />
            )}
            <div>
              <label className="text-sm font-medium text-muted-foreground">Display Name</label>
              <p className="text-lg">{user?.display_name}</p>
            </div>
          </CardContent>
        </Card>

        {/* Household Section */}
        <Card>
          <CardHeader>
            <CardTitle>Household</CardTitle>
            <CardDescription>Manage your household and invite members</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {household ? (
              <>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Household Name</label>
                  <p className="text-lg">{household.name}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Invite Link</label>
                  <div className="flex gap-2 mt-1">
                    <Input value={inviteUrl} readOnly className="font-mono text-sm" />
                    <Button variant="outline" onClick={copyInviteLink} disabled={copying}>
                      {copying ? 'Copying...' : 'Copy'}
                    </Button>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    Share this link with family members to let them join your household.
                  </p>
                </div>
                <div>
                  <Button variant="outline" onClick={regenerateInviteCode} disabled={regenerating}>
                    {regenerating ? 'Regenerating...' : 'Regenerate Invite Code'}
                  </Button>
                  <p className="text-sm text-muted-foreground mt-1">
                    This will invalidate the current invite link.
                  </p>
                </div>
              </>
            ) : (
              <div className="space-y-4">
                <p className="text-muted-foreground">
                  You haven&apos;t joined a household yet. Create one below or use an invite link to join an existing one.
                </p>
                <div>
                  <label htmlFor="householdName" className="text-sm font-medium">
                    Household Name
                  </label>
                  <div className="flex gap-2 mt-1">
                    <Input
                      id="householdName"
                      placeholder="Smith Family"
                      value={newHouseholdName}
                      onChange={(e) => setNewHouseholdName(e.target.value)}
                      disabled={creating}
                    />
                    <Button onClick={createHousehold} disabled={creating || !newHouseholdName.trim()}>
                      {creating ? 'Creating...' : 'Create'}
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Sign Out */}
        <Card>
          <CardHeader>
            <CardTitle>Account</CardTitle>
          </CardHeader>
          <CardContent>
            <Button variant="destructive" onClick={handleSignOut}>
              Sign Out
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

