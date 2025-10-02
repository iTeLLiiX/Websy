#!/bin/bash

echo "🚀 WebsiteBuilder AI - Quick Deploy Script"
echo "=========================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Check if git is initialized
if [ ! -d ".git" ]; then
    echo -e "${YELLOW}⚠️  Git repository not found. Initializing...${NC}"
    git init
    git add .
    git commit -m "Initial commit"
fi

echo -e "${BLUE}📋 Deployment Checklist:${NC}"
echo "1. ✅ Frontend für Vercel vorbereiten"
echo "2. ✅ Backend für Railway vorbereiten"
echo "3. ✅ Environment Variables konfigurieren"
echo "4. ✅ Database setup"

echo -e "\n${BLUE}🔧 Frontend Setup (Vercel):${NC}"
cd frontend
echo "Installing dependencies..."
npm install

echo "Building frontend..."
npm run build

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Frontend build successful${NC}"
else
    echo -e "${RED}❌ Frontend build failed${NC}"
    exit 1
fi

cd ..

echo -e "\n${BLUE}🔧 Backend Setup (Railway):${NC}"
cd backend
echo "Installing dependencies..."
npm install

echo "Building backend..."
npm run build

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Backend build successful${NC}"
else
    echo -e "${RED}❌ Backend build failed${NC}"
    exit 1
fi

cd ..

echo -e "\n${GREEN}🎉 Setup completed successfully!${NC}"
echo -e "\n${YELLOW}📝 Next Steps:${NC}"
echo "1. Push to GitHub:"
echo "   git add ."
echo "   git commit -m 'Ready for deployment'"
echo "   git push origin main"

echo -e "\n2. Deploy Frontend on Vercel:"
echo "   - Go to vercel.com"
echo "   - Connect your GitHub repository"
echo "   - Set Root Directory to 'frontend'"
echo "   - Add Environment Variables:"
echo "     NEXT_PUBLIC_API_URL=https://your-backend.railway.app"
echo "     NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_..."

echo -e "\n3. Deploy Backend on Railway:"
echo "   - Go to railway.app"
echo "   - Create new project from GitHub"
echo "   - Set Root Directory to 'backend'"
echo "   - Add PostgreSQL database"
echo "   - Set Environment Variables:"
echo "     DATABASE_URL=postgresql://..."
echo "     JWT_SECRET=your-secret-key"
echo "     OPENAI_API_KEY=sk-..."
echo "     STRIPE_SECRET_KEY=sk_test_..."
echo "     FRONTEND_URL=https://your-frontend.vercel.app"

echo -e "\n4. Setup Database:"
echo "   - After backend is deployed, run:"
echo "     npm run db:setup"

echo -e "\n${BLUE}🌐 Demo URLs after deployment:${NC}"
echo "- Frontend: https://your-project.vercel.app"
echo "- Backend: https://your-backend.railway.app"
echo "- Demo Website: https://demo-restaurant.websitbuilder.ai"

echo -e "\n${GREEN}Happy Deploying! 🚀${NC}"
