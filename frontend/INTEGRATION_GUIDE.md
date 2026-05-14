# Frontend Integration Guide

This guide explains how the frontend is integrated with the WallCraft AI backend.

## Setup

### 1. Environment Configuration

Create a `.env.local` file in the frontend directory:

```bash
cp .env.example .env.local
```

Update the API URL:

```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

For production:

```env
NEXT_PUBLIC_API_URL=https://your-backend-domain.com
```

### 2. Install Dependencies

```bash
npm install
# or
yarn install
# or
pnpm install
```

### 3. Run Development Server

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

Visit http://localhost:3000

## API Integration

### API Client

The API client is located at `services/api.ts` and provides methods for all backend endpoints.

```typescript
import { apiClient } from '@/services/api'

// Authentication
await apiClient.signup({ name, email, password })
await apiClient.login({ email, password })

// Posters
await apiClient.getPosters(skip, limit)
await apiClient.searchPosters(params)
await apiClient.getPoster(id)
await apiClient.getTrendingPosters(limit)
await apiClient.getFeaturedPosters(limit)
await apiClient.getCategories()

// Cart
await apiClient.getCart()
await apiClient.addToCart(posterId, quantity)
await apiClient.removeFromCart(posterId)
await apiClient.updateCartQuantity(posterId, quantity)

// Orders
await apiClient.createOrder(items)
await apiClient.getOrderHistory(skip, limit)
await apiClient.getOrder(orderId)

// Payments
await apiClient.initiatePayment(orderId, paymentProvider)
await apiClient.completePayment(paymentId, transactionRef)

// AI
await apiClient.uploadRoom(file)
await apiClient.generateLayout(sessionId, posterIds, layoutPreset)
await apiClient.regenerateLayout(sessionId, layoutId)
await apiClient.renderPreview(sessionId, layoutId)
await apiClient.getSession(sessionId)
await apiClient.getLayouts(sessionId)
```

### State Management

#### Authentication Store

```typescript
import { useAuthStore } from '@/store/useAuthStore'

const { user, token, signup, login, logout } = useAuthStore()
```

#### Cart Store

```typescript
import { useCartStore } from '@/store/useCartStore'

const {
  items,
  fetchCart,
  addItem,
  removeItem,
  updateQuantity,
  getTotalCount,
  getTotalPrice,
} = useCartStore()
```

#### Workspace Store

```typescript
import { useWorkspaceStore } from '@/store/useWorkspaceStore'

const {
  wallImage,
  placedPosters,
  selectedPosterId,
  activePreset,
  setWallImage,
  addPoster,
  updatePosterPosition,
  updatePosterSize,
  removePoster,
  selectPoster,
  setActivePreset,
} = useWorkspaceStore()
```

### Custom Hooks

#### usePosters

```typescript
import { usePosters, useSearchPosters, useTrendingPosters } from '@/hooks/usePosters'

// Get all posters
const { data: posters, isLoading } = usePosters(0, 20)

// Search posters
const { data: results } = useSearchPosters({
  search: 'cyberpunk',
  category: 'anime',
  min_price: 100,
  max_price: 500,
})

// Get trending
const { data: trending } = useTrendingPosters(10)
```

## Page Integration

### Login Page (`/login`)

```typescript
import { useAuthStore } from '@/store/useAuthStore'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const router = useRouter()
  const { login, isLoading, error } = useAuthStore()

  const handleLogin = async (email: string, password: string) => {
    try {
      await login(email, password)
      router.push('/collection')
    } catch (err) {
      // Error is stored in store
    }
  }

  return (
    // Your login form
  )
}
```

### Collection Page (`/collection`)

```typescript
import { useSearchPosters } from '@/hooks/usePosters'
import { useCartStore } from '@/store/useCartStore'

export default function CollectionPage() {
  const [category, setCategory] = useState<string>()
  const [search, setSearch] = useState<string>()

  const { data: posters, isLoading } = useSearchPosters({
    category,
    search,
    skip: 0,
    limit: 20,
  })

  const { addItem } = useCartStore()

  const handleAddToCart = async (posterId: number) => {
    await addItem(posterId, 1)
  }

  return (
    // Your collection layout
  )
}
```

### Workspace Page (`/workspace`)

```typescript
import { useWorkspaceStore } from '@/store/useWorkspaceStore'
import { apiClient } from '@/services/api'

export default function WorkspacePage() {
  const {
    wallImage,
    placedPosters,
    setWallImage,
    addPoster,
    setActivePreset,
  } = useWorkspaceStore()

  const handleUploadRoom = async (file: File) => {
    const session = await apiClient.uploadRoom(file)
    setWallImage(session.wall_image_path)
  }

  const handleGenerateLayout = async (posterIds: number[], preset: string) => {
    const layout = await apiClient.generateLayout(
      session.id,
      posterIds,
      preset
    )
    setActivePreset(preset)
  }

  return (
    // Your workspace layout
  )
}
```

### Cart Page (`/cart`)

```typescript
import { useCartStore } from '@/store/useCartStore'
import { apiClient } from '@/services/api'

export default function CartPage() {
  const { items, removeItem, updateQuantity, getTotalPrice } = useCartStore()

  const handleCheckout = async () => {
    const order = await apiClient.createOrder(
      items.map(item => ({
        poster_id: item.poster.id,
        quantity: item.quantity,
      }))
    )
    // Redirect to payment
  }

  return (
    // Your cart layout
  )
}
```

## Authentication Flow

1. User signs up/logs in
2. Backend returns JWT token
3. Token is stored in localStorage via `apiClient.setToken()`
4. Token is automatically included in all subsequent requests
5. On logout, token is cleared

## Error Handling

All API calls should handle errors:

```typescript
try {
  await apiClient.login(email, password)
} catch (error) {
  const message = error instanceof Error ? error.message : 'Unknown error'
  // Show error to user
}
```

## Mock Data

For development without backend, mock data is available at `lib/mock-data.ts`:

```typescript
import {
  mockPosters,
  mockCategories,
  mockTestimonials,
  mockLayoutPresets,
  mockRecommendations,
} from '@/lib/mock-data'
```

## Backend Requirements

Ensure the backend is running:

```bash
cd backend
python -m uvicorn app.main:app --reload
```

Or with Docker:

```bash
docker-compose up
```

## Troubleshooting

### CORS Errors

Ensure backend CORS is configured correctly in `.env`:

```env
CORS_ORIGINS=http://localhost:3000,http://localhost:8000
```

### Authentication Errors

- Check token is being stored: `localStorage.getItem('auth_token')`
- Verify token format: `Bearer <token>`
- Check token expiration

### API Connection Errors

- Verify backend is running
- Check `NEXT_PUBLIC_API_URL` is correct
- Check network tab in browser DevTools

## Production Deployment

### Frontend (Vercel)

1. Connect GitHub repo
2. Set environment variables:
   ```
   NEXT_PUBLIC_API_URL=https://your-backend-domain.com
   ```
3. Deploy

### Backend (Render/Railway)

1. Connect GitHub repo
2. Set environment variables (see backend README)
3. Deploy

## Next Steps

1. Implement remaining pages (login, signup, payment success)
2. Add form validation
3. Add loading states and error handling
4. Add toast notifications
5. Implement wishlist functionality
6. Add order history page
7. Implement payment integration
8. Add image upload for room visualization
9. Implement AI layout generation UI
10. Add preview rendering

## Support

For issues, check:
- Backend logs: `docker-compose logs backend`
- Frontend console: Browser DevTools
- Network requests: Browser Network tab
