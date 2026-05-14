# Quick Deployment Checklist

## 5-Minute Setup

### 1. Supabase Setup (2 min)
- [ ] Sign up at https://supabase.com
- [ ] Create project
- [ ] Copy Database URL
- [ ] Run migrations in SQL Editor

### 2. Railway Setup (2 min)
- [ ] Sign up at https://railway.app
- [ ] Connect GitHub
- [ ] Deploy backend folder
- [ ] Add DATABASE_URL env var
- [ ] Copy Railway URL

### 3. Vercel Setup (1 min)
- [ ] Sign up at https://vercel.com
- [ ] Import GitHub repo
- [ ] Set root to `frontend`
- [ ] Add NEXT_PUBLIC_API_URL env var
- [ ] Deploy

---

## Environment Variables Needed

### Railway (Backend)
```
DATABASE_URL=postgresql://postgres:PASSWORD@PROJECT-ID.supabase.co:5432/postgres
ENVIRONMENT=production
DEBUG=false
SECRET_KEY=your-secret-key
ALLOWED_ORIGINS=https://your-vercel-app.vercel.app
```

### Vercel (Frontend)
```
NEXT_PUBLIC_API_URL=https://your-railway-backend.railway.app
NEXT_PUBLIC_SUPABASE_URL=https://PROJECT-ID.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

---

## URLs After Deployment

- **Frontend**: `https://your-app.vercel.app`
- **Backend**: `https://your-backend.railway.app`
- **Database**: Supabase dashboard

---

## Test Commands

```bash
# Test backend
curl https://your-backend.railway.app/health

# Test frontend
Visit https://your-app.vercel.app in browser
```

---

## Cost: $0/month ✅

All services have free tiers that cover your needs!
