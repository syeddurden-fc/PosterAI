#!/bin/bash

# WallCraft AI - Deployment Commands
# Run these commands in order to deploy your application

echo "🚀 WallCraft AI Deployment Script"
echo "=================================="

# Step 1: Prepare for deployment
echo ""
echo "Step 1: Preparing for deployment..."
echo "- Ensure all code is committed to GitHub"
echo "- Run: git add . && git commit -m 'Prepare for deployment'"
echo "- Run: git push origin main"

# Step 2: Create Supabase project
echo ""
echo "Step 2: Setup Supabase"
echo "- Go to https://supabase.com"
echo "- Create new project"
echo "- Copy Database URL"
echo "- Run migrations in SQL Editor"

# Step 3: Deploy to Railway
echo ""
echo "Step 3: Deploy Backend to Railway"
echo "- Go to https://railway.app"
echo "- Connect GitHub repository"
echo "- Select backend folder"
echo "- Add environment variables:"
echo "  DATABASE_URL=postgresql://postgres:PASSWORD@PROJECT-ID.supabase.co:5432/postgres"
echo "  ENVIRONMENT=production"
echo "  DEBUG=false"
echo "  SECRET_KEY=your-secret-key"
echo "  ALLOWED_ORIGINS=https://your-vercel-app.vercel.app"
echo "- Deploy"
echo "- Copy Railway URL"

# Step 4: Deploy to Vercel
echo ""
echo "Step 4: Deploy Frontend to Vercel"
echo "- Go to https://vercel.com"
echo "- Import GitHub repository"
echo "- Set root directory to 'frontend'"
echo "- Add environment variables:"
echo "  NEXT_PUBLIC_API_URL=https://your-railway-backend.railway.app"
echo "  NEXT_PUBLIC_SUPABASE_URL=https://PROJECT-ID.supabase.co"
echo "  NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key"
echo "- Deploy"

# Step 5: Update CORS
echo ""
echo "Step 5: Update CORS Configuration"
echo "- Edit backend/app/middleware/cors.py"
echo "- Update ALLOWED_ORIGINS with your Vercel domain"
echo "- Commit and push: git push origin main"
echo "- Railway will auto-redeploy"

# Step 6: Test
echo ""
echo "Step 6: Test Your Deployment"
echo "- Test backend: curl https://your-railway-backend.railway.app/health"
echo "- Test frontend: Visit https://your-app.vercel.app"
echo "- Test API: Try adding a poster to cart"

# Step 7: Monitor
echo ""
echo "Step 7: Monitor Your Application"
echo "- Railway: Check logs in dashboard"
echo "- Vercel: Check analytics in dashboard"
echo "- Supabase: Check database in dashboard"

echo ""
echo "✅ Deployment complete!"
echo "Your app is now live at: https://your-app.vercel.app"
echo ""
echo "📚 For detailed instructions, see DEPLOY_STEPS.md"
echo "📋 For quick reference, see QUICK_DEPLOY.md"
