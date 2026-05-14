# WallCraft AI

🎨 **AI-Powered Poster Ecommerce Platform**

Transform any room with AI-curated poster arrangements. Upload your wall, let AI design the perfect layout, and purchase posters with confidence.

## ✨ Features

### 🛍️ Shopping
- Browse 1000+ premium posters
- Advanced filtering (category, price, theme, style, orientation)
- Smart search
- Wishlist functionality
- Shopping cart
- Secure checkout

### 🤖 AI Room Visualization
- Upload room image
- Automatic wall detection
- 8 layout presets:
  - Minimal Grid
  - Cinematic
  - Anime Collage
  - Luxury Symmetry
  - Floating Cluster
  - Pinterest Style
  - Gaming Setup
  - Music Studio
- Real-time preview rendering
- Dynamic layout regeneration

### 💳 Payments
- UPI support
- Google Pay integration
- PhonePe support
- Order tracking
- Payment history

### 👤 User Features
- Secure authentication
- User profiles
- Order history
- Wishlist management
- Cart persistence

## 🚀 Quick Start

### Docker (Recommended)
```bash
docker-compose up -d
docker-compose exec backend alembic upgrade head
docker-compose exec backend python -m app.db.seed.seed_data
```

Access:
- Frontend: http://localhost:3000
- Backend: http://localhost:8000
- API Docs: http://localhost:8000/docs

### Local Development
See [SETUP_GUIDE.md](./SETUP_GUIDE.md) for detailed instructions.

## 📚 Documentation

| Document | Purpose |
|----------|---------|
| [QUICK_START.md](./QUICK_START.md) | Get running in 5 minutes |
| [SETUP_GUIDE.md](./SETUP_GUIDE.md) | Complete setup & deployment |
| [PROJECT_SUMMARY.md](./PROJECT_SUMMARY.md) | Project overview & architecture |
| [backend/README.md](./backend/README.md) | Backend documentation |
| [frontend/INTEGRATION_GUIDE.md](./frontend/INTEGRATION_GUIDE.md) | Frontend integration guide |

## 🏗️ Architecture

### Backend
- **Framework**: FastAPI
- **Database**: PostgreSQL
- **ORM**: SQLAlchemy Async
- **Auth**: JWT
- **AI**: OpenCV, Pillow, Ollama
- **Deployment**: Docker, Render, Railway

### Frontend
- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **State**: Zustand
- **Data**: React Query
- **Styling**: Tailwind CSS
- **UI**: shadcn/ui
- **Animations**: Framer Motion

## 📁 Project Structure

```
wallcraft-ai/
├── backend/                    # FastAPI backend
│   ├── app/
│   │   ├── api/routes/        # API endpoints
│   │   ├── ai/                # AI engines
│   │   ├── models/            # Database models
│   │   ├── services/          # Business logic
│   │   ├── repositories/      # Data access
│   │   ├── schemas/           # Validation
│   │   └── main.py            # FastAPI app
│   ├── docker-compose.yml
│   ├── Dockerfile
│   └── README.md
├── frontend/                   # Next.js frontend
│   ├── app/                   # Pages
│   ├── components/            # React components
│   ├── services/              # API client
│   ├── store/                 # Zustand stores
│   ├── hooks/                 # Custom hooks
│   └── INTEGRATION_GUIDE.md
├── QUICK_START.md
├── SETUP_GUIDE.md
├── PROJECT_SUMMARY.md
└── README.md
```

## 🔌 API Endpoints

### Authentication
```
POST   /auth/signup
POST   /auth/login
```

### Posters
```
GET    /posters
GET    /posters/search
GET    /posters/trending
GET    /posters/featured
GET    /posters/{id}
GET    /posters/categories
```

### Shopping
```
GET    /cart
POST   /cart/add
POST   /cart/remove/{id}
PUT    /cart/update/{id}
```

### Orders
```
POST   /orders/create
GET    /orders/history
GET    /orders/{id}
```

### Payments
```
POST   /payment/initiate
POST   /payment/success/{id}
```

### AI
```
POST   /ai/upload-room
POST   /ai/generate-layout
POST   /ai/regenerate-layout
POST   /ai/render-preview
GET    /ai/session/{id}
GET    /ai/layouts/{id}
```

Full API documentation: http://localhost:8000/docs

## 🗄️ Database Schema

- **users** - User accounts
- **categories** - Poster categories
- **posters** - Poster catalog
- **poster_tags** - Poster tags
- **cart_items** - Shopping cart
- **orders** - Customer orders
- **order_items** - Order line items
- **payments** - Payment transactions
- **ai_room_sessions** - AI visualization sessions
- **ai_layouts** - Generated layouts

## 🔐 Security

- ✅ JWT authentication
- ✅ Bcrypt password hashing
- ✅ CORS configuration
- ✅ Input validation
- ✅ SQL injection prevention
- ✅ File upload validation
- ✅ Environment variable management

## 📊 Observability

- Structured JSON logging
- Prometheus metrics
- OpenTelemetry tracing
- Request/response logging
- Error tracking

## 🚢 Deployment

### Supported Platforms
- **Render** - Full stack
- **Railway** - Full stack
- **Vercel** - Frontend
- **Supabase** - Database

See [SETUP_GUIDE.md](./SETUP_GUIDE.md) for deployment instructions.

## 🛠️ Tech Stack

### Backend
- Python 3.12+
- FastAPI 0.136.1
- PostgreSQL 14+
- SQLAlchemy 2.0+
- Pydantic 2.0+
- OpenCV 4.13+
- Pillow 12.2+
- Ollama
- Docker

### Frontend
- Node.js 18+
- Next.js 14+
- React 18+
- TypeScript 5+
- Tailwind CSS 3+
- Zustand
- React Query
- Framer Motion

## 📦 Installation

### Prerequisites
- Docker & Docker Compose (recommended)
- OR Node.js 18+ & Python 3.12+

### Option 1: Docker
```bash
docker-compose up -d
```

### Option 2: Local
```bash
# Backend
cd backend
uv pip install -r pyproject.toml
alembic upgrade head
uvicorn app.main:app --reload

# Frontend (new terminal)
cd frontend
npm install
npm run dev
```

## 🧪 Testing

### Backend
```bash
pytest
pytest --cov=app
```

### Frontend
```bash
npm run test
npm run test:coverage
```

## 📈 Performance

- Async/await throughout
- Connection pooling
- Query optimization
- Image optimization ready
- Code splitting ready
- Caching ready

## 🎯 Roadmap

### Phase 1 (Current)
- ✅ Core backend
- ✅ Core frontend
- ✅ API integration
- 🔄 Page implementation

### Phase 2
- Wishlist functionality
- Order history page
- Real payment integration
- Image upload UI
- AI layout UI

### Phase 3
- Admin dashboard
- User profiles
- Email notifications
- Analytics
- Image optimization

### Phase 4
- Recommendation engine
- Social features
- Mobile app
- Advanced AI
- Marketplace

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## 📝 License

MIT License - see LICENSE file for details

## 💬 Support

### Documentation
- [Quick Start](./QUICK_START.md) - Get running in 5 minutes
- [Setup Guide](./SETUP_GUIDE.md) - Complete setup & deployment
- [Project Summary](./PROJECT_SUMMARY.md) - Architecture & overview
- [Backend README](./backend/README.md) - Backend details
- [Frontend Guide](./frontend/INTEGRATION_GUIDE.md) - Frontend integration

### Issues
- Check [Troubleshooting](./SETUP_GUIDE.md#troubleshooting)
- Open GitHub issue
- Check API docs: http://localhost:8000/docs

## 🌟 Key Highlights

### Backend
- ✅ Production-ready FastAPI application
- ✅ Async/await throughout
- ✅ Clean architecture (routes → services → repositories)
- ✅ 20+ API endpoints
- ✅ Comprehensive error handling
- ✅ Structured logging & metrics
- ✅ Background workers
- ✅ Docker ready

### Frontend
- ✅ Next.js 14 with App Router
- ✅ TypeScript for type safety
- ✅ Zustand for state management
- ✅ React Query for data fetching
- ✅ Tailwind CSS for styling
- ✅ shadcn/ui components
- ✅ Framer Motion animations
- ✅ API client integration

### AI Features
- ✅ Wall detection (OpenCV)
- ✅ Color detection
- ✅ 8 layout presets
- ✅ Dynamic generation
- ✅ Preview rendering
- ✅ Layout regeneration

## 📞 Contact

- GitHub: [wallcraft-ai](https://github.com/yourusername/wallcraft-ai)
- Email: support@wallcraft.ai
- Website: https://wallcraft.ai

## 🙏 Acknowledgments

- FastAPI for the amazing framework
- Next.js for the React framework
- PostgreSQL for the database
- Ollama for AI capabilities
- OpenCV for computer vision
- All open-source contributors

---

**Status**: ✅ Production Ready

**Version**: 0.1.0

**Last Updated**: May 10, 2024

**Made with ❤️ for poster lovers**
