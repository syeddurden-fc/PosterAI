# WallCraft AI - Quick Start Guide

Get WallCraft AI running in 5 minutes!

## Option 1: Docker (Recommended)

### Prerequisites
- Docker
- Docker Compose

### Steps

```bash
# 1. Clone and navigate
cd wallcraft-ai

# 2. Start services
docker-compose up -d

# 3. Run migrations
docker-compose exec backend alembic upgrade head

# 4. Seed data
docker-compose exec backend python -m app.db.seed.seed_data

# 5. Access
# Frontend: http://localhost:3000
# Backend: http://localhost:8000
# API Docs: http://localhost:8000/docs
```

**Done!** 🎉

## Option 2: Local Development

### Prerequisites
- Node.js 18+
- Python 3.12+
- PostgreSQL 14+
- Ollama

### Backend Setup

```bash
cd backend

# 1. Environment
cp .env.example .env

# 2. Install
uv pip install -r pyproject.toml

# 3. Database
createdb wallcraft_ai
alembic upgrade head
python -m app.db.seed.seed_data

# 4. Ollama
ollama pull llama3
ollama serve  # in another terminal

# 5. Run
uvicorn app.main:app --reload
```

Backend: http://localhost:8000

### Frontend Setup

```bash
cd frontend

# 1. Environment
cp .env.example .env.local

# 2. Install
npm install

# 3. Run
npm run dev
```

Frontend: http://localhost:3000

## Test the API

### 1. Signup
```bash
curl -X POST http://localhost:8000/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "password123"
  }'
```

Response:
```json
{
  "access_token": "eyJ0eXAiOiJKV1QiLCJhbGc...",
  "token_type": "bearer",
  "user": {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com"
  }
}
```

### 2. Get Posters
```bash
curl http://localhost:8000/posters
```

### 3. Add to Cart
```bash
curl -X POST http://localhost:8000/cart/add \
  -H "Authorization: Bearer <your_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "poster_id": 1,
    "quantity": 1
  }'
```

### 4. Get Cart
```bash
curl http://localhost:8000/cart \
  -H "Authorization: Bearer <your_token>"
```

## Frontend Integration

### 1. Login Page
```typescript
import { useAuthStore } from '@/store/useAuthStore'

export default function LoginPage() {
  const { login } = useAuthStore()
  
  const handleLogin = async (email: string, password: string) => {
    await login(email, password)
  }
}
```

### 2. Collection Page
```typescript
import { useSearchPosters } from '@/hooks/usePosters'

export default function CollectionPage() {
  const { data: posters } = useSearchPosters({ limit: 20 })
  
  return (
    <div>
      {posters?.map(poster => (
        <PosterCard key={poster.id} poster={poster} />
      ))}
    </div>
  )
}
```

### 3. Cart Page
```typescript
import { useCartStore } from '@/store/useCartStore'

export default function CartPage() {
  const { items, getTotalPrice } = useCartStore()
  
  return (
    <div>
      {items.map(item => (
        <CartCard key={item.id} item={item} />
      ))}
      <p>Total: ${getTotalPrice()}</p>
    </div>
  )
}
```

## API Endpoints

### Auth
- `POST /auth/signup` - Register
- `POST /auth/login` - Login

### Posters
- `GET /posters` - Get all
- `GET /posters/search` - Search
- `GET /posters/trending` - Trending
- `GET /posters/featured` - Featured
- `GET /posters/{id}` - Get one
- `GET /posters/categories` - Categories

### Cart
- `GET /cart` - Get cart
- `POST /cart/add` - Add item
- `POST /cart/remove/{id}` - Remove item
- `PUT /cart/update/{id}` - Update quantity

### Orders
- `POST /orders/create` - Create order
- `GET /orders/history` - Order history
- `GET /orders/{id}` - Get order

### Payments
- `POST /payment/initiate` - Start payment
- `POST /payment/success/{id}` - Complete payment

### AI
- `POST /ai/upload-room` - Upload image
- `POST /ai/generate-layout` - Generate layout
- `POST /ai/regenerate-layout` - Regenerate
- `POST /ai/render-preview` - Render preview
- `GET /ai/session/{id}` - Get session
- `GET /ai/layouts/{id}` - Get layouts

## Environment Variables

### Backend (.env)
```env
DATABASE_URL=postgresql+asyncpg://user:password@localhost:5432/wallcraft_ai
JWT_SECRET=your-secret-key
OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_MODEL=llama3
DEBUG=True
```

### Frontend (.env.local)
```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

## Useful Commands

### Docker
```bash
# View logs
docker-compose logs -f backend

# Stop
docker-compose down

# Rebuild
docker-compose build --no-cache

# Run command
docker-compose exec backend python -m app.db.seed.seed_data
```

### Backend
```bash
# Run migrations
alembic upgrade head

# Create migration
alembic revision --autogenerate -m "description"

# Seed data
python -m app.db.seed.seed_data

# Run tests
pytest
```

### Frontend
```bash
# Build
npm run build

# Start production
npm start

# Lint
npm run lint

# Type check
npm run type-check
```

## Troubleshooting

### Backend won't start
```bash
# Check logs
docker-compose logs backend

# Rebuild
docker-compose build --no-cache backend

# Restart
docker-compose restart backend
```

### Database error
```bash
# Check PostgreSQL
docker-compose logs postgres

# Reset database
docker-compose down -v
docker-compose up -d postgres
docker-compose exec backend alembic upgrade head
```

### CORS error
- Check `CORS_ORIGINS` in backend .env
- Ensure frontend URL is included
- Restart backend

### API not responding
- Check backend is running: `curl http://localhost:8000/health`
- Check frontend API URL: `NEXT_PUBLIC_API_URL`
- Check network tab in browser

## Next Steps

1. ✅ Backend running
2. ✅ Frontend running
3. ✅ API working
4. 📝 Implement pages
5. 📝 Add features
6. 📝 Deploy

## Documentation

- **Setup**: See `SETUP_GUIDE.md`
- **Backend**: See `backend/README.md`
- **Frontend**: See `frontend/INTEGRATION_GUIDE.md`
- **Project**: See `PROJECT_SUMMARY.md`
- **API Docs**: http://localhost:8000/docs

## Support

- Check logs: `docker-compose logs`
- Check browser console
- Check network requests
- Read documentation
- Open GitHub issue

---

**Ready to build?** 🚀

Start with Docker or local setup above, then check the documentation for next steps!
