/**
 * Hook to require authentication for protected pages
 */

import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/useAuthStore'
import { useEffect, useState } from 'react'

export function useRequireAuth() {
  const router = useRouter()
  const { user, isLoading } = useAuthStore()
  const [isAuthorized, setIsAuthorized] = useState(false)

  useEffect(() => {
    if (!isLoading) {
      if (!user) {
        // Not authenticated, redirect to login
        router.push('/login')
        setIsAuthorized(false)
      } else {
        // Authenticated
        setIsAuthorized(true)
      }
    }
  }, [user, isLoading, router])

  return { isAuthorized, isLoading }
}
