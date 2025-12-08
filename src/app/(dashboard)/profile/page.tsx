'use client'

export const dynamic = 'force-dynamic'

import { useUser } from '@/lib/hooks/use-user'
import { AvatarUpload } from '@/components/profile/avatar-upload'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export default function ProfilePage() {
  const { authUser, user, loading } = useUser()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !authUser) {
      router.push('/login')
    }
  }, [authUser, loading, router])

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

  if (!authUser || !user) {
    return null
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <h1 className="text-3xl font-bold mb-8">Profile</h1>

      <Card>
        <CardHeader>
          <CardTitle>Profile Picture</CardTitle>
          <CardDescription>Update your profile picture</CardDescription>
        </CardHeader>
        <CardContent>
          <AvatarUpload
            user={authUser}
            displayName={user.display_name}
            currentAvatarUrl={user.avatar_url}
            onUploadComplete={() => {
              // Refresh will happen via useUser hook
              window.location.reload()
            }}
          />
        </CardContent>
      </Card>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Account Information</CardTitle>
          <CardDescription>Your account details</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium text-muted-foreground">Display Name</label>
            <p className="text-lg">{user.display_name}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-muted-foreground">Email</label>
            <p className="text-lg">{authUser.email}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-muted-foreground">Member Since</label>
            <p className="text-lg">
              {new Date(user.created_at).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

