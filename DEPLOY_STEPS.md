# Step-by-Step Deployment Guide

## Prerequisites
- GitHub account
- Supabase account (free)
- Railway account (free) or Render account (free)
- Vercel account (free)

---

## STEP 1: Setup Supabase Database

### 1.1 Create Supabase Project
1. Go to https://supabase.com
2. Click "Start your project"
3. Sign up with GitHub
4. Create new project:
   - Name: `wallcraft-ai`
   - Password: Generate strong password
   - Region: Choose closest to you
5. Wait for project to initialize (2-3 minutes)

### 1.2 Get Database Credentials
1. Go to Project Settings → Database
2. Copy:
   - **Host**: `[project-id].supabase.co`
   - **Database**: `postgres`
   - **User**: `postgres`
   - **Password**: Your generated password
   - **Port**: `5432`

### 1.3 Create Database URL
```
postgresql://postgres:[PASSWORD]@[PROJECT-ID].supabase.co:5432/postgres
```

### 1.4 Run Migrations
1. In Supabase dashboard, go to SQL Editor
2. Create new query
3. Copy and paste migrations from `backend/app/db/migrations/`
4. Execute

---

## STEP 2: Deploy Backend to Railway

### 2.1 Prepare Backend
1. Ensure `backend/Dockerfile` exists (already created)
2. Ensure `backend/requirements.txt` has all dependencies
3. Commit and push to GitHub

### 2.2 Deploy to Railway
1. Go to https://railway.app
2. Sign up with GitHub
3. Click "New Project"
4. Select "Deploy from GitHub repo"
5. Choose your `wallcraft-ai` repository
6. Select `backend` directory
7. Add environment variables:
   ```
   DATABASE_URL=postgresql://postgres:[PASSWORD]@[PROJECT-ID].supabase.co:5432/postgres
   ENVIRONMENT=production
   DEBUG=false
   SECRET_KEY=generate-random-string-here
   ALLOWED_ORIGINS=https://your-vercel-domain.vercel.app
   ```
8. Click Deploy
9. Wait for deployment (5-10 minutes)
10. Copy the Railway URL (e.g., `https://wallcraft-backend-prod.railway.app`)

---

## STEP 3: Deploy Frontend to Vercel

### 3.1 Prepare Frontend
1. Update `frontend/.env.production`:
   ```
   NEXT_PUBLIC_API_URL=https://your-railway-backend.railway.app
   NEXT_PUBLIC_SUPABASE_URL=https://[PROJECT-ID].supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   ```
2. Commit and push to GitHub

### 3.2 Deploy to Vercel
1. Go to https://vercel.com
2. Sign up with GitHub
3. Click "Import Project"
4. Select your `wallcraft-ai` repository
5. Configure project:
   - Framework: Next.js
   - Root Directory: `frontend`
6. Add environment variables:
   ```
   NEXT_PUBLIC_API_URL=https://your-railway-backend.railway.app
   NEXT_PUBLIC_SUPABASE_URL=https://[PROJECT-ID].supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   ```
7. Click Deploy
8. Wait for deployment (3-5 minutes)
9. Your app is live at `https://your-app.vercel.app`

---

## STEP 4: Configure CORS

### 4.1 Update Backend CORS
1. Edit `backend/app/middleware/cors.py`
2. Update `ALLOWED_ORIGINS`:
   ```python
   ALLOWED_ORIGINS = [
       "https://your-app.vercel.app",
       "http://localhost:3000",
   ]
   ```
3. Commit and push
4. Railway will auto-redeploy

---

## STEP 5: Setup Supabase Storage (Optional)

### 5.1 Create Storage Bucket
1. In Supabase dashboard, go to Storage
2. Create new bucket: `wallcraft-uploads`
3. Set to public
4. Add policy for authenticated users

### 5.2 Update Backend
Update `backend/app/core/config.py`:
```python
SUPABASE_URL = "https://[PROJECT-ID].supabase.co"
SUPABASE_KEY = "your-service-role-key"
STORAGE_BUCKET = "wallcraft-uploads"
```

---

## STEP 6: Verify Deployment

### 6.1 Test Backend
```bash
curl https://your-railway-backend.railway.app/health
```
Should return: `{"status":"ok",...}`

### 6.2 Test Frontend
Visit: `https://your-app.vercel.app`
Should load without errors

### 6.3 Test API Connection
1. Open browser DevTools (F12)
2. Go to Network tab
3. Try adding a poster to cart
4. Check that API calls go to your Railway backend

---

## STEP 7: Setup Auto-Deployment (Optional)

### 7.1 GitHub Actions
1. Create `.github/workflows/deploy.yml` (already created)
2. Add secrets to GitHub:
   - Go to Settings → Secrets
   - Add `RAILWAY_TOKEN`
   - Add `VERCEL_TOKEN`
3. Now every push to `main` auto-deploys!

---

## Troubleshooting

### Backend not connecting to database
- Check DATABASE_URL is correct
- Verify Supabase project is running
- Check firewall allows connections

### Frontend can't reach backend
- Check NEXT_PUBLIC_API_URL is correct
- Verify CORS is configured
- Check browser console for errors

### Vercel build fails
- Check `frontend/package.json` has all dependencies
- Verify `next.config.js` is correct
- Check build logs in Vercel dashboard

### Railway deployment fails
- Check `backend/Dockerfile` is correct
- Verify `requirements.txt` has all dependencies
- Check Railway logs for errors

---

## Cost Summary

| Service | Free Tier | Cost |
|---------|-----------|------|
| Supabase | 500MB DB, 1GB Storage | $0 |
| Railway | $5/month credit | $0 |
| Vercel | Unlimited deployments | $0 |
| **Total** | | **$0/month** |

---

## Next Steps

1. Monitor your deployments
2. Setup error tracking (Sentry - free tier)
3. Setup analytics (Vercel Analytics - free)
4. Scale as needed (upgrade plans when needed)

---

## Support

- Railway Docs: https://docs.railway.app
- Vercel Docs: https://vercel.com/docs
- Supabase Docs: https://supabase.com/docs
