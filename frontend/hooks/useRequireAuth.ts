/**
 * Hook to require authentication on a page
 * Redirects to login if user is not authenticated
 */
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/useAuthStore'

export function useRequireAuth() {
  const router = useRouter()
  const { user, isHydrated, hydrate } = useAuthStore()
  const [isAuthorized, setIsAuthorized] = useState(false)

  // Hydrate auth on mount
  useEffect(() => {
    hydrate()
  }, [hydrate])

  // Check authorization after hydration
  useEffect(() => {
    if (isHydrated) {
      if (!user) {
        // Not authenticated, redirect to login
        router.push('/login')
      } else {
        // Authenticated, allow access
        setIsAuthorized(true)
      }
    }
  }, [isHydrated, user, router])

  return {
    isAuthorized,
    user,
    isLoading: !isHydrated,
  }
}
