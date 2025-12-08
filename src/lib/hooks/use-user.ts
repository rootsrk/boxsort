'use client'

import { useEffect, useState } from 'react'
import { createBrowserClient } from '@/lib/supabase/client'
import type { User, Household } from '@/lib/supabase/types'
import type { User as AuthUser } from '@supabase/supabase-js'

interface UseUserReturn {
  authUser: AuthUser | null
  user: User | null
  household: Household | null
  loading: boolean
  error: string | null
  refresh: () => Promise<void>
}

export function useUser(): UseUserReturn {
  const [authUser, setAuthUser] = useState<AuthUser | null>(null)
  const [user, setUser] = useState<User | null>(null)
  const [household, setHousehold] = useState<Household | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const supabase = createBrowserClient()

  async function loadUser() {
    try {
      setLoading(true)
      setError(null)

      // Get auth user
      const { data: authData, error: authError } = await supabase.auth.getUser()
      
      if (authError || !authData.user) {
        setAuthUser(null)
        setUser(null)
        setHousehold(null)
        return
      }

      setAuthUser(authData.user)

      // Get user profile
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('id', authData.user.id)
        .single()

      if (userError) {
        setError(userError.message)
        return
      }

      setUser(userData)

      // Get household if user has one
      if (userData?.household_id) {
        const { data: householdData, error: householdError } = await supabase
          .from('households')
          .select('*')
          .eq('id', userData.household_id)
          .single()

        if (householdError) {
          setError(householdError.message)
          return
        }

        setHousehold(householdData)
      } else {
        setHousehold(null)
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load user')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadUser()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        loadUser()
      } else {
        setAuthUser(null)
        setUser(null)
        setHousehold(null)
        setLoading(false)
      }
    })

    return () => {
      subscription.unsubscribe()
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  return {
    authUser,
    user,
    household,
    loading,
    error,
    refresh: loadUser,
  }
}

