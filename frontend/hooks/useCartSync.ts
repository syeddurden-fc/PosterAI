/**
 * Hook to sync cart across all pages
 * Ensures cart count updates in navigation and other components
 */
import { useEffect } from 'react'
import { useCartStore } from '@/store/useCartStore'

export function useCartSync() {
  const { hydrate, items } = useCartStore()

  // Hydrate cart on mount
  useEffect(() => {
    hydrate()
  }, [hydrate])

  // Subscribe to cart changes
  useEffect(() => {
    const unsubscribe = useCartStore.subscribe(
      (state) => state.items,
      (items) => {
        // Cart items changed, this will trigger re-renders in components using getTotalCount
        console.log('Cart updated:', items.length, 'items')
      }
    )

    return () => unsubscribe()
  }, [])

  return {
    items,
    totalCount: useCartStore((state) => state.getTotalCount()),
    totalPrice: useCartStore((state) => state.getTotalPrice()),
  }
}
