'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from './supabase'

/**
 * Redirect to /login if not authenticated.
 * Optionally verify the user's profile role.
 * Returns `true` while the check is in progress.
 */
export function useRequireAuth(requiredRole?: 'user' | 'admin' | 'superadmin'): boolean {
  const router = useRouter()
  const [checking, setChecking] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data }) => {
      if (!data.session) {
        router.replace('/login')
        return
      }

      if (requiredRole) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', data.session.user.id)
          .single()

        if (!profile || (profile as { role: string }).role !== requiredRole) {
          router.replace('/login')
          return
        }
      }

      setChecking(false)
    })
  }, [router, requiredRole])

  return checking
}
