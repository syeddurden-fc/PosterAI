/**
 * Shopping cart store using Zustand with persistence
 */
import { create } from 'zustand'
import { apiClient } from '@/services/api'

interface Poster {
  id: number
  title: string
  price: number
  imageUrl: string
  category: string
}

interface CartItem {
  id: number
  poster: Poster
  quantity: number
}

interface CartStore {
  items: CartItem[]
  isLoading: boolean
  error: string | null
  isHydrated: boolean
  fetchCart: () => Promise<void>
  addItem: (posterId: number, quantity?: number) => Promise<void>
  removeItem: (posterId: number) => Promise<void>
  updateQuantity: (posterId: number, quantity: number) => Promise<void>
  clearCart: () => void
  getTotalCount: () => number
  getTotalPrice: () => number
  hydrate: () => Promise<void>
}

export const useCartStore = create<CartStore>((set, get) => ({
  items: [],
  isLoading: false,
  error: null,
  isHydrated: false,

  hydrate: async () => {
    // Load cart from backend on client side
    if (typeof window !== 'undefined') {
      try {
        await get().fetchCart()
        set({ isHydrated: true })
      } catch (error) {
        console.error('Failed to hydrate cart:', error)
        set({ isHydrated: true })
      }
    }
  },

  fetchCart: async () => {
    set({ isLoading: true, error: null })
    try {
      const response = await apiClient.getCart()
      console.log("Cart response:", response)
      // Handle both direct items array and nested structure
      const items = response.items || response.cart_items || []
      set({ items, isLoading: false })
    } catch (error) {
      console.error("Cart fetch error:", error)
      set({
        error: error instanceof Error ? error.message : 'Failed to fetch cart',
        isLoading: false,
      })
    }
  },

  addItem: async (posterId: number, quantity: number = 1) => {
    set({ isLoading: true, error: null })
    try {
      const response = await apiClient.addToCart(posterId, quantity)
      console.log("Add to cart response:", response)
      const items = response.items || response.cart_items || []
      set({ items, isLoading: false })
    } catch (error) {
      console.error("Add to cart error:", error)
      set({
        error: error instanceof Error ? error.message : 'Failed to add item',
        isLoading: false,
      })
      throw error
    }
  },

  removeItem: async (posterId: number) => {
    set({ isLoading: true, error: null })
    try {
      const response = await apiClient.removeFromCart(posterId)
      console.log("Remove from cart response:", response)
      const items = response.items || response.cart_items || []
      set({ items, isLoading: false })
    } catch (error) {
      console.error("Remove from cart error:", error)
      set({
        error: error instanceof Error ? error.message : 'Failed to remove item',
        isLoading: false,
      })
      throw error
    }
  },

  updateQuantity: async (posterId: number, quantity: number) => {
    set({ isLoading: true, error: null })
    try {
      if (quantity <= 0) {
        // If quantity is 0 or less, remove the item
        const response = await apiClient.removeFromCart(posterId)
        const items = response.items || response.cart_items || []
        set({ items, isLoading: false })
      } else {
        // Update to the new quantity
        const response = await apiClient.updateCartQuantity(posterId, quantity)
        console.log("Update quantity response:", response)
        const items = response.items || response.cart_items || []
        set({ items, isLoading: false })
      }
    } catch (error) {
      console.error("Update quantity error:", error)
      set({
        error: error instanceof Error ? error.message : 'Failed to update quantity',
        isLoading: false,
      })
      throw error
    }
  },

  clearCart: () => {
    set({ items: [] })
  },

  getTotalCount: () => {
    return get().items.reduce((sum, item) => sum + item.quantity, 0)
  },

  getTotalPrice: () => {
    return get().items.reduce((sum, item) => sum + item.poster.price * item.quantity, 0)
  },
}))
