# Code Changes Required for Deployment

## 1. Backend Configuration Changes

### File: `backend/app/core/config.py`

Add these settings for production:

```python
import os
from typing import Optional

class Settings:
    # ... existing settings ...
    
    # Production settings
    ENVIRONMENT: str = os.getenv("ENVIRONMENT", "development")
    DEBUG: bool = os.getenv("DEBUG", "false").lower() == "true"
    
    # Database - supports both local and Supabase
    DATABASE_URL: str = os.getenv(
        "DATABASE_URL",
        "postgresql://user:password@localhost/wallcraft"
    )
    
    # CORS - allow Vercel domain
    ALLOWED_ORIGINS: list = os.getenv(
        "ALLOWED_ORIGINS",
        "http://localhost:3000,http://localhost:3001"
    ).split(",")
    
    # Security
    SECRET_KEY: str = os.getenv("SECRET_KEY", "your-secret-key-change-in-production")
    
    # Session
    SESSION_EXPIRY_HOURS: int = int(os.getenv("SESSION_EXPIRY_HOURS", "24"))
    
    # Temp directory - use /tmp for Railway/Render
    TEMP_DIR: str = os.getenv("TEMP_DIR", "/tmp/wallcraft")
    
    # Logging
    LOG_LEVEL: str = os.getenv("LOG_LEVEL", "INFO" if ENVIRONMENT == "production" else "DEBUG")
```

### File: `backend/app/middleware/cors.py`

Update CORS configuration:

```python
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import get_settings

def setup_cors(app):
    settings = get_settings()
    
    # Parse allowed origins from environment
    allowed_origins = [origin.strip() for origin in settings.ALLOWED_ORIGINS]
    
    app.add_middleware(
        CORSMiddleware,
        allow_origins=allowed_origins,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )
```

---

## 2. Frontend Configuration Changes

### File: `frontend/.env.local` (for local development)

```
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### File: `frontend/.env.production` (for Vercel)

```
NEXT_PUBLIC_API_URL=https://your-railway-backend.railway.app
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### File: `frontend/services/api.ts`

Update API client to use environment variables:

```typescript
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

class APIClient {
  private baseURL: string
  private token: string | null = null

  constructor(baseURL: string = API_BASE_URL) {
    this.baseURL = baseURL
    if (typeof window !== 'undefined') {
      this.token = localStorage.getItem('auth_token')
    }
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

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      })

      if (!response.ok) {
        const error = await response.json().catch(() => ({}))
        throw new Error(error.detail || `HTTP ${response.status}`)
      }

      return response.json()
    } catch (error) {
      console.error(`API Error: ${endpoint}`, error)
      throw error
    }
  }
  
  // ... rest of the class ...
}

export const apiClient = new APIClient()
```

---

## 3. Database Migration for Supabase

### File: `backend/app/db/migrations/001_initial_schema.sql`

Ensure this works with Supabase PostgreSQL:

```sql
-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255),
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Posters table
CREATE TABLE IF NOT EXISTS posters (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    image_url VARCHAR(500),
    category_id INTEGER,
    price DECIMAL(10, 2),
    width INTEGER,
    height INTEGER,
    orientation VARCHAR(50),
    style VARCHAR(100),
    theme VARCHAR(100),
    rating DECIMAL(3, 1),
    is_featured BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Cart table
CREATE TABLE IF NOT EXISTS carts (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Cart items table
CREATE TABLE IF NOT EXISTS cart_items (
    id SERIAL PRIMARY KEY,
    cart_id INTEGER NOT NULL REFERENCES carts(id) ON DELETE CASCADE,
    poster_id INTEGER NOT NULL REFERENCES posters(id) ON DELETE CASCADE,
    quantity INTEGER DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- AI Sessions table
CREATE TABLE IF NOT EXISTS ai_room_sessions (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    wall_image_path VARCHAR(500),
    wall_color VARCHAR(50),
    layout_style VARCHAR(100),
    status VARCHAR(50) DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- AI Layouts table
CREATE TABLE IF NOT EXISTS ai_layouts (
    id SERIAL PRIMARY KEY,
    session_id INTEGER NOT NULL REFERENCES ai_room_sessions(id) ON DELETE CASCADE,
    layout_type VARCHAR(100),
    layout_metadata_json JSONB,
    generated_preview_path VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_carts_user_id ON carts(user_id);
CREATE INDEX idx_cart_items_cart_id ON cart_items(cart_id);
CREATE INDEX idx_ai_sessions_user_id ON ai_room_sessions(user_id);
CREATE INDEX idx_ai_layouts_session_id ON ai_layouts(session_id);
```

---

## 4. Docker Configuration

### File: `backend/Dockerfile` (already created)

Already set up for Railway/Render deployment.

### File: `backend/requirements.txt`

Ensure all dependencies are listed:

```
fastapi==0.104.1
uvicorn[standard]==0.24.0
sqlalchemy==2.0.23
psycopg2-binary==2.9.9
pydantic==2.5.0
pydantic-settings==2.1.0
python-jose[cryptography]==3.3.0
passlib[bcrypt]==1.7.4
python-multipart==0.0.6
aiofiles==23.2.1
pillow==10.1.0
numpy==1.26.2
opencv-python==4.8.1.78
```

---

## 5. GitHub Actions Workflow

### File: `.github/workflows/deploy.yml` (already created)

This enables automatic deployment on every push to main.

---

## Summary of Changes

1. ✅ Backend configuration supports environment variables
2. ✅ Frontend uses environment variables for API URL
3. ✅ CORS configured for production domain
4. ✅ Database migrations compatible with Supabase
5. ✅ Docker configuration for Railway/Render
6. ✅ GitHub Actions for auto-deployment

---

## Deployment Checklist

- [ ] Update `backend/app/core/config.py` with environment variables
- [ ] Update `backend/app/middleware/cors.py` with dynamic origins
- [ ] Create `.env.production` files
- [ ] Verify `backend/Dockerfile` exists
- [ ] Verify `backend/requirements.txt` is complete
- [ ] Push to GitHub
- [ ] Create Supabase project
- [ ] Deploy to Railway
- [ ] Deploy to Vercel
- [ ] Test API connection
- [ ] Monitor logs

All done! Your app is ready for zero-cost deployment! 🚀
