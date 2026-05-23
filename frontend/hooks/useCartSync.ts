/**
 * Hook to sync cart across all pages
 * Ensures cart count updates in navigation and other components
 */
import { useEffect } from 'react'
import { useCartStore } from '@/store/useCartStore'

export function useCartSync() {
  const { hydrate, items } = useCartStore()
  const totalCount = useCartStore((state) => state.getTotalCount())
  const totalPrice = useCartStore((state) => state.getTotalPrice())

  // Hydrate cart on mount
  useEffect(() => {
    hydrate()
  }, [hydrate])

  return {
    items,
    totalCount,
    totalPrice,
  }
}
