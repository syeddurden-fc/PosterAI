# WallCraft AI - Zero Cost Deployment Guide

## Overview
- **Frontend**: Vercel (Next.js native support)
- **Backend**: Railway.app or Render
- **Database**: Supabase (PostgreSQL)
- **Storage**: Supabase Storage

## Step 1: Setup Supabase

1. Go to https://supabase.com and sign up (free)
2. Create a new project
3. Get your credentials:
   - Project URL
   - Anon Key
   - Service Role Key
   - Database Password

## Step 2: Migrate Database to Supabase

1. In Supabase dashboard, go to SQL Editor
2. Run the migrations from `backend/app/db/migrations/`
3. Or use: `psql postgresql://[user]:[password]@[host]/[database] < migrations.sql`

## Step 3: Deploy Backend to Railway.app

1. Go to https://railway.app and sign up
2. Connect your GitHub repository
3. Create new project → Deploy from GitHub
4. Set environment variables:
   ```
   DATABASE_URL=postgresql://user:password@host/database
   ENVIRONMENT=production
   DEBUG=false
   ```
5. Railway will auto-deploy on git push

## Step 4: Deploy Frontend to Vercel

1. Go to https://vercel.com and sign up
2. Import your GitHub repository
3. Set environment variables:
   ```
   NEXT_PUBLIC_API_URL=https://your-railway-backend.railway.app
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   ```
4. Deploy!

## Step 5: Configure CORS

Update backend CORS settings for your Vercel domain:
```python
# backend/app/middleware/cors.py
ALLOWED_ORIGINS = [
    "https://your-app.vercel.app",
    "http://localhost:3000",
]
```

## Cost Breakdown
- Supabase: FREE (500MB database, 1GB storage)
- Railway: FREE ($5/month credit, usually enough)
- Vercel: FREE (unlimited deployments)
- **Total: $0/month**

## Monitoring
- Railway: Built-in logs and monitoring
- Vercel: Built-in analytics
- Supabase: Built-in database monitoring
