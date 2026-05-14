/**
 * Authentication store using Zustand with session storage persistence
 */
import { create } from 'zustand'
import { apiClient } from '@/services/api'

interface User {
  id: number
  name: string
  email: string
}

interface AuthStore {
  user: User | null
  token: string | null
  isLoading: boolean
  error: string | null
  isHydrated: boolean
  signup: (name: string, email: string, password: string) => Promise<void>
  login: (email: string, password: string) => Promise<void>
  logout: () => void
  clearError: () => void
  hydrate: () => void
}

export const useAuthStore = create<AuthStore>((set, get) => ({
  user: null,
  token: null,
  isLoading: false,
  error: null,
  isHydrated: false,

  hydrate: () => {
    // Load from sessionStorage on client side
    if (typeof window !== 'undefined') {
      try {
        const storedAuth = sessionStorage.getItem('auth_state')
        if (storedAuth) {
          const { user, token } = JSON.parse(storedAuth)
          set({ user, token, isHydrated: true })
          if (token) {
            apiClient.setToken(token)
          }
        } else {
          set({ isHydrated: true })
        }
      } catch (error) {
        console.error('Failed to hydrate auth state:', error)
        set({ isHydrated: true })
      }
    }
  },

  signup: async (name: string, email: string, password: string) => {
    set({ isLoading: true, error: null })
    try {
      const response = await apiClient.signup({ name, email, password })
      const authState = {
        user: response.user,
        token: response.access_token,
      }
      
      // Store in sessionStorage
      if (typeof window !== 'undefined') {
        sessionStorage.setItem('auth_state', JSON.stringify(authState))
      }
      
      set({
        user: response.user,
        token: response.access_token,
        isLoading: false,
      })
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Signup failed',
        isLoading: false,
      })
      throw error
    }
  },

  login: async (email: string, password: string) => {
    set({ isLoading: true, error: null })
    try {
      const response = await apiClient.login({ email, password })
      const authState = {
        user: response.user,
        token: response.access_token,
      }
      
      // Store in sessionStorage
      if (typeof window !== 'undefined') {
        sessionStorage.setItem('auth_state', JSON.stringify(authState))
      }
      
      set({
        user: response.user,
        token: response.access_token,
        isLoading: false,
      })
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Login failed',
        isLoading: false,
      })
      throw error
    }
  },

  logout: () => {
    apiClient.clearToken()
    
    // Clear from sessionStorage
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem('auth_state')
    }
    
    set({ user: null, token: null })
  },

  clearError: () => set({ error: null }),
}))
