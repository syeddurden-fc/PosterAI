/**
 * API client for WallCraft AI backend
 * Handles all HTTP requests to the backend
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

interface RequestOptions extends RequestInit {
  headers?: Record<string, string>
}

// ============ Response Types ============

export interface Category {
  id: number
  name: string
  slug: string
}

export interface Poster {
  id: number
  title: string
  description?: string
  image_url: string
  category_id: number
  category?: Category
  price: number
  width: number
  height: number
  orientation: string
  style: string
  theme: string
  rating: number
  is_featured: boolean
}

export interface PosterPlacement {
  poster_id: number
  x: number
  y: number
  width: number
  height: number
  rotation: number
}

export interface LayoutMetadata {
  layout_type: string
  wall_color: string
  placements: PosterPlacement[]
  wall_width: number
  wall_height: number
}

export interface AIRoomSession {
  id: number
  user_id: number
  wall_image_path: string
  wall_color?: string
  layout_style?: string
  status: string
  created_at: string
  expires_at: string
}

export interface AILayout {
  id: number
  session_id: number
  layout_type: string
  layout_metadata_json: string
  generated_preview_path?: string
  created_at: string
}

export interface CartItem {
  poster_id: number
  quantity: number
  poster?: Poster
}

export interface Cart {
  id: number
  user_id: number
  items: CartItem[]
  total_count: number
  total_price: number
  created_at: string
  updated_at: string
}

export interface Order {
  id: number
  user_id: number
  items: CartItem[]
  total_price: number
  status: string
  created_at: string
  updated_at: string
}

export interface AuthResponse {
  access_token: string
  token_type: string
  user?: {
    id: number
    name: string
    email: string
  }
}

class APIClient {
  private baseURL: string
  private token: string | null = null

  constructor(baseURL: string = API_BASE_URL) {
    this.baseURL = baseURL
    // Load token from localStorage if available
    if (typeof window !== 'undefined') {
      this.token = localStorage.getItem('auth_token')
    }
  }

  setToken(token: string) {
    this.token = token
    localStorage.setItem('auth_token', token)
  }

  clearToken() {
    this.token = null
    localStorage.removeItem('auth_token')
  }

  private getHeaders(): Record<string, string> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    }

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`
    }

    return headers
  }

  private async request<T>(
    endpoint: string,
    options: RequestOptions = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`
    const headers = {
      ...this.getHeaders(),
      ...options.headers,
    }

    const response = await fetch(url, {
      ...options,
      headers,
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({}))
      throw new Error(error.detail || `HTTP ${response.status}`)
    }

    return response.json()
  }

  // Public method for making requests (can be used by components)
  async publicRequest<T>(
    endpoint: string,
    options: RequestOptions = {}
  ): Promise<T> {
    return this.request<T>(endpoint, options)
  }

  // Auth endpoints
  async signup(data: { name: string; email: string; password: string }): Promise<AuthResponse> {
    const response = await this.request<AuthResponse>('/auth/signup', {
      method: 'POST',
      body: JSON.stringify(data),
    })
    if (response.access_token) {
      this.setToken(response.access_token)
    }
    return response
  }

  async login(data: { email: string; password: string }): Promise<AuthResponse> {
    const response = await this.request<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(data),
    })
    if (response.access_token) {
      this.setToken(response.access_token)
    }
    return response
  }

  // Poster endpoints
  async getPosters(skip: number = 0, limit: number = 20): Promise<Poster[]> {
    return this.request<Poster[]>(`/posters?skip=${skip}&limit=${limit}`)
  }

  async searchPosters(params: {
    search?: string
    category?: string
    min_price?: number
    max_price?: number
    theme?: string
    style?: string
    orientation?: string
    skip?: number
    limit?: number
  }): Promise<Poster[]> {
    const queryParams = new URLSearchParams()
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        queryParams.append(key, String(value))
      }
    })
    return this.request<Poster[]>(`/posters/search?${queryParams.toString()}`)
  }

  async getPoster(id: number): Promise<Poster> {
    return this.request<Poster>(`/posters/${id}`)
  }

  async getTrendingPosters(limit: number = 10): Promise<Poster[]> {
    return this.request<Poster[]>(`/posters/trending?limit=${limit}`)
  }

  async getFeaturedPosters(limit: number = 10): Promise<Poster[]> {
    return this.request<Poster[]>(`/posters/featured?limit=${limit}`)
  }

  async getCategories(): Promise<Category[]> {
    return this.request<Category[]>('/posters/categories')
  }

  // Cart endpoints
  async getCart(): Promise<Cart> {
    return this.request<Cart>('/cart')
  }

  async addToCart(posterId: number, quantity: number = 1): Promise<Cart> {
    return this.request<Cart>('/cart/add', {
      method: 'POST',
      body: JSON.stringify({ poster_id: posterId, quantity }),
    })
  }

  async removeFromCart(posterId: number): Promise<Cart> {
    return this.request<Cart>(`/cart/remove/${posterId}`, {
      method: 'POST',
    })
  }

  async updateCartQuantity(posterId: number, quantity: number): Promise<Cart> {
    return this.request<Cart>(`/cart/update/${posterId}?quantity=${quantity}`, {
      method: 'PUT',
    })
  }

  // Order endpoints
  async createOrder(items: Array<{ poster_id: number; quantity: number }>): Promise<Order> {
    return this.request<Order>('/orders/create', {
      method: 'POST',
      body: JSON.stringify({ items }),
    })
  }

  async getOrderHistory(skip: number = 0, limit: number = 20): Promise<Order[]> {
    return this.request<Order[]>(`/orders/history?skip=${skip}&limit=${limit}`)
  }

  async getOrder(orderId: number): Promise<Order> {
    return this.request<Order>(`/orders/${orderId}`)
  }

  // Payment endpoints
  async initiatePayment(orderId: number, paymentProvider: string): Promise<{ payment_id: number; url: string }> {
    return this.request<{ payment_id: number; url: string }>('/payment/initiate', {
      method: 'POST',
      body: JSON.stringify({
        order_id: orderId,
        payment_provider: paymentProvider,
      }),
    })
  }

  async completePayment(paymentId: number, transactionRef: string): Promise<{ status: string }> {
    return this.request<{ status: string }>(`/payment/success/${paymentId}?transaction_ref=${transactionRef}`, {
      method: 'POST',
    })
  }

  // AI endpoints
  async uploadRoom(file: File): Promise<AIRoomSession> {
    const formData = new FormData()
    formData.append('file', file)

    const headers = this.getHeaders()
    delete headers['Content-Type'] // Let browser set it for FormData

    const response = await fetch(`${this.baseURL}/ai/upload-room`, {
      method: 'POST',
      headers: {
        Authorization: headers['Authorization'] || '',
      },
      body: formData,
    })

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`)
    }

    return response.json()
  }

  async generateLayout(sessionId: number, posterIds: number[], layoutPreset: string): Promise<AILayout> {
    return this.request<AILayout>('/ai/generate-layout', {
      method: 'POST',
      body: JSON.stringify({
        session_id: sessionId,
        poster_ids: posterIds,
        layout_preset: layoutPreset,
      }),
    })
  }

  async regenerateLayout(sessionId: number, layoutId: number): Promise<AILayout> {
    return this.request<AILayout>('/ai/regenerate-layout', {
      method: 'POST',
      body: JSON.stringify({
        session_id: sessionId,
        layout_id: layoutId,
      }),
    })
  }

  async renderPreview(sessionId: number, layoutId: number): Promise<{ preview_path: string }> {
    return this.request<{ preview_path: string }>('/ai/render-preview', {
      method: 'POST',
      body: JSON.stringify({
        session_id: sessionId,
        layout_id: layoutId,
      }),
    })
  }

  async getSession(sessionId: number): Promise<AIRoomSession> {
    return this.request<AIRoomSession>(`/ai/session/${sessionId}`)
  }

  async getLayouts(sessionId: number): Promise<AILayout[]> {
    return this.request<AILayout[]>(`/ai/layouts/${sessionId}`)
  }
}

export const apiClient = new APIClient()
