/**
 * Custom hook for fetching and managing posters
 */
import { useQuery } from '@tanstack/react-query'
import { apiClient } from '@/services/api'

export function usePosters(skip: number = 0, limit: number = 20) {
  return useQuery({
    queryKey: ['posters', skip, limit],
    queryFn: () => apiClient.getPosters(skip, limit),
  })
}

export function useSearchPosters(params: {
  search?: string
  category?: string
  min_price?: number
  max_price?: number
  theme?: string
  style?: string
  orientation?: string
  skip?: number
  limit?: number
}) {
  return useQuery({
    queryKey: ['posters-search', params],
    queryFn: () => apiClient.searchPosters(params),
  })
}

export function usePoster(id: number) {
  return useQuery({
    queryKey: ['poster', id],
    queryFn: () => apiClient.getPoster(id),
  })
}

export function useTrendingPosters(limit: number = 10) {
  return useQuery({
    queryKey: ['trending-posters', limit],
    queryFn: () => apiClient.getTrendingPosters(limit),
  })
}

export function useFeaturedPosters(limit: number = 10) {
  return useQuery({
    queryKey: ['featured-posters', limit],
    queryFn: () => apiClient.getFeaturedPosters(limit),
  })
}

export function useCategories() {
  return useQuery({
    queryKey: ['categories'],
    queryFn: () => apiClient.getCategories(),
  })
}
