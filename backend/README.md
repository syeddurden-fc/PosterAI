# WallCraft AI - Backend

Production-ready AI-powered poster ecommerce backend built with FastAPI, PostgreSQL, and Ollama.

## Features

- **User Authentication**: JWT-based auth with secure password hashing
- **Poster Management**: Browse, search, filter, and manage poster catalog
- **Shopping Cart**: Add/remove items, manage quantities
- **Order Management**: Create orders, track order history
- **Payment Processing**: Support for UPI, GPay, PhonePe
- **AI Room Visualization**: 
  - Upload room images
  - Detect wall color and area
  - Generate poster arrangements with multiple layout presets
  - Render realistic previews
  - Regenerate layouts dynamically
- **Layout Presets**: Minimal Grid, Cinematic, Anime Collage, Luxury Symmetry, Floating Cluster, Pinterest Style, Gaming Setup, Music Studio
- **Observability**: Structured logging, metrics, distributed tracing
- **Background Workers**: Automatic cleanup of expired sessions and temporary files

## Tech Stack

- **Framework**: FastAPI 0.136.1
- **Python**: 3.12+
- **Database**: PostgreSQL with SQLAlchemy Async ORM
- **AI**: OpenCV (wall detection), Pillow (rendering), Ollama (layout suggestions)
- **Auth**: JWT with python-jose
- **Observability**: OpenTelemetry, Prometheus
- **Package Manager**: uv

## Project Structure

```
backend/
├── app/
│   ├── api/
│   │   ├── routes/
│   │   │   ├── auth.py          # Authentication endpoints
│   │   │   ├── poster.py        # Poster catalog endpoints
│   │   │   ├── cart.py          # Shopping cart endpoints
│   │   │   ├── order.py         # Order management endpoints
│   │   │   ├── payment.py       # Payment endpoints
│   │   │   └── ai.py            # AI visualization endpoints
│   │   └── deps.py              # Dependency injection
│   ├── ai/
│   │   ├── wall_detection.py    # Wall detection using OpenCV
│   │   ├── layout_engine.py     # Layout generation engine
│   │   └── render_engine.py     # Image rendering with Pillow
│   ├── core/
│   │   ├── config.py            # Configuration management
│   │   └── security.py          # JWT and password utilities
│   ├── db/
│   │   ├── base.py              # Base model and mixins
│   │   ├── session.py           # Async session management
│   │   ├── migrations/          # Alembic migrations
│   │   └── seed/                # Database seeding
│   ├── middleware/
│   │   └── cors.py              # CORS configuration
│   ├── models/
│   │   ├── user.py              # User model
│   │   ├── poster.py            # Poster and category models
│   │   ├── cart.py              # Cart item model
│   │   ├── order.py             # Order and payment models
│   │   └── ai.py                # AI session and layout models
│   ├── observability/
│   │   ├── logging.py           # Structured logging
│   │   ├── metrics.py           # Prometheus metrics
│   │   └── tracing.py           # OpenTelemetry tracing
│   ├── repositories/
│   │   ├── base.py              # Base repository with CRUD
│   │   ├── user.py              # User repository
│   │   ├── poster.py            # Poster repository
│   │   ├── cart.py              # Cart repository
│   │   ├── order.py             # Order repository
│   │   └── ai.py                # AI repository
│   ├── schemas/
│   │   ├── user.py              # User schemas
│   │   ├── poster.py            # Poster schemas
│   │   ├── cart.py              # Cart schemas
│   │   ├── order.py             # Order schemas
│   │   └── ai.py                # AI schemas
│   ├── services/
│   │   ├── auth.py              # Authentication service
│   │   ├── poster.py            # Poster service
│   │   ├── cart.py              # Cart service
│   │   ├── order.py             # Order service
│   │   └── ai.py                # AI service
│   ├── utils/
│   │   └── validators.py        # Validation utilities
│   ├── workers/
│   │   └── cleanup_worker.py    # Background cleanup worker
│   └── main.py                  # FastAPI application factory
├── .env.example                 # Environment variables template
├── alembic.ini                  # Alembic configuration
├── docker-compose.yml           # Docker Compose setup
├── Dockerfile                   # Docker image
├── pyproject.toml               # Project dependencies
└── README.md                    # This file
```

## Setup

### Prerequisites

- Python 3.12+
- PostgreSQL 14+
- Ollama (for AI features)
- Docker & Docker Compose (optional)

### Local Development

1. **Clone and setup**:
```bash
cd backend
cp .env.example .env
```

2. **Install dependencies**:
```bash
# Using uv (recommended)
uv pip install -r pyproject.toml

# Or using pip
pip install -e .
```

3. **Setup database**:
```bash
# Create PostgreSQL database
createdb wallcraft_ai

# Run migrations
alembic upgrade head

# Seed sample data
python -m app.db.seed.seed_data
```

4. **Setup Ollama**:
```bash
# Download and run Ollama
ollama pull llama3
ollama serve
```

5. **Run backend**:
```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

Visit http://localhost:8000/docs for API documentation.

### Docker Setup

```bash
# Build and run with Docker Compose
docker-compose up -d

# Run migrations
docker-compose exec backend alembic upgrade head

# Seed data
docker-compose exec backend python -m app.db.seed.seed_data
```

## API Endpoints

### Authentication
- `POST /auth/signup` - Register new user
- `POST /auth/login` - Login user

### Posters
- `GET /posters` - Get all posters
- `GET /posters/search` - Search posters with filters
- `GET /posters/trending` - Get trending posters
- `GET /posters/featured` - Get featured posters
- `GET /posters/{id}` - Get poster details
- `GET /posters/categories` - Get all categories

### Cart
- `GET /cart` - Get user's cart
- `POST /cart/add` - Add poster to cart
- `POST /cart/remove/{poster_id}` - Remove from cart
- `PUT /cart/update/{poster_id}` - Update quantity

### Orders
- `POST /orders/create` - Create order
- `GET /orders/history` - Get order history
- `GET /orders/{id}` - Get order details

### Payments
- `POST /payment/initiate` - Initiate payment
- `POST /payment/success/{payment_id}` - Mark payment successful

### AI Visualization
- `POST /ai/upload-room` - Upload room image
- `POST /ai/generate-layout` - Generate poster layout
- `POST /ai/regenerate-layout` - Regenerate with variations
- `POST /ai/render-preview` - Render preview image
- `GET /ai/session/{session_id}` - Get session details
- `GET /ai/layouts/{session_id}` - Get session layouts

## Environment Variables

```env
# Application
APP_NAME=WallCraft AI
DEBUG=True
ENVIRONMENT=development

# Database
DATABASE_URL=postgresql+asyncpg://user:password@localhost:5432/wallcraft_ai

# JWT
JWT_SECRET=your-super-secret-key-change-in-production
JWT_ALGORITHM=HS256
JWT_EXPIRATION_HOURS=24

# Ollama
OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_MODEL=llama3

# Storage
UPLOAD_DIR=./uploads
MAX_UPLOAD_SIZE_MB=50
TEMP_DIR=./temp

# Cleanup
SESSION_EXPIRY_HOURS=24
PREVIEW_CLEANUP_HOURS=24

# CORS
CORS_ORIGINS=http://localhost:3000,http://localhost:8000

# OpenTelemetry
OTEL_ENABLED=False
OTEL_EXPORTER_OTLP_ENDPOINT=http://localhost:4317
```

## Database Schema

### Users
- id (PK)
- name
- email (unique)
- password_hash
- created_at, updated_at

### Categories
- id (PK)
- name (unique)
- slug (unique)
- created_at, updated_at

### Posters
- id (PK)
- title
- description
- image_url
- category_id (FK)
- price
- width, height
- orientation
- style, theme
- rating
- is_featured
- created_at, updated_at

### Cart Items
- id (PK)
- user_id (FK)
- poster_id (FK)
- quantity
- created_at, updated_at

### Orders
- id (PK)
- user_id (FK)
- total_amount
- payment_status
- created_at, updated_at

### Order Items
- id (PK)
- order_id (FK)
- poster_id (FK)
- quantity
- price
- created_at, updated_at

### Payments
- id (PK)
- order_id (FK)
- payment_provider
- payment_status
- transaction_reference
- created_at, updated_at

### AI Room Sessions
- id (PK)
- user_id (FK)
- wall_image_path
- wall_color
- layout_style
- status
- expires_at
- created_at, updated_at

### AI Layouts
- id (PK)
- session_id (FK)
- layout_type
- layout_metadata_json
- generated_preview_path
- created_at, updated_at

## Layout Presets

### Minimal Grid
Clean grid arrangement with even spacing.

### Cinematic
Dramatic asymmetric layout with large focal poster.

### Anime Collage
Overlapping collage style with rotations.

### Luxury Symmetry
Perfectly balanced symmetrical arrangement.

### Floating Cluster
Scattered floating arrangement with varied sizes.

### Pinterest Style
Masonry-like layout with varying heights.

### Gaming Setup
Gaming-focused arrangement with central focus.

### Music Studio
Music-themed diagonal arrangement.

## AI Features

### Wall Detection
- Detects dominant wall color using k-means clustering
- Estimates wall area boundaries
- Extracts image dimensions

### Layout Generation
- 8 preset layout styles
- Automatic poster placement
- Considers wall dimensions
- Supports rotation and scaling

### Preview Rendering
- Realistic shadow effects
- Poster overlay composition
- Gaussian blur for depth
- JPEG/PNG export

### Dynamic Regeneration
- Regenerate with positional variations
- Maintain layout style
- Update on poster changes

## Background Workers

### Cleanup Worker
- Runs every hour
- Deletes expired AI sessions (24h default)
- Removes unpaid preview images (24h default)
- Cleans up temporary files

## Observability

### Logging
- Structured JSON logging
- Request/response logging
- Error tracking

### Metrics
- Request count and duration
- Business metrics (orders, layouts)
- Active sessions gauge

### Tracing
- OpenTelemetry integration
- Distributed tracing support
- OTLP exporter

## Security

- JWT-based authentication
- Bcrypt password hashing
- CORS configuration
- Input validation
- SQL injection prevention (SQLAlchemy)
- File upload validation

## Performance

- Async/await throughout
- Connection pooling
- Query optimization
- Caching ready
- Horizontal scaling support

## Deployment

### Render
```bash
# Connect GitHub repo
# Set environment variables
# Deploy
```

### Railway
```bash
# Connect GitHub repo
# Add PostgreSQL plugin
# Set environment variables
# Deploy
```

### Supabase
```bash
# Use Supabase PostgreSQL
# Update DATABASE_URL
# Deploy to any platform
```

## Testing

```bash
# Run tests (when added)
pytest

# With coverage
pytest --cov=app
```

## Contributing

1. Create feature branch
2. Make changes
3. Run tests
4. Submit PR

## License

MIT

## Support

For issues and questions, please open an issue on GitHub.
