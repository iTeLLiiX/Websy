# 🚀 WebsiteBuilder AI - Setup Guide

## 📋 Voraussetzungen

- Node.js 18+ 
- PostgreSQL 14+
- Git

## 🛠️ Installation

### 1. Repository klonen
```bash
git clone <repository-url>
cd WebseiteBuilder
```

### 2. Dependencies installieren
```bash
# Alle Dependencies installieren
npm run install:all

# Oder einzeln:
npm install
cd backend && npm install
cd ../frontend && npm install
```

### 3. Environment Setup

#### Backend Environment
```bash
cd backend
cp env.example .env
```

Bearbeite `backend/.env` mit deinen Werten:
```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/websitbuilder?schema=public"

# JWT
JWT_SECRET="your-super-secret-jwt-key-here"
JWT_EXPIRES_IN="7d"

# OpenAI
OPENAI_API_KEY="sk-your-openai-api-key-here"

# Stripe
STRIPE_SECRET_KEY="sk_test_your-stripe-secret-key-here"
STRIPE_PUBLISHABLE_KEY="pk_test_your-stripe-publishable-key-here"
STRIPE_WEBHOOK_SECRET="whsec_your-stripe-webhook-secret-here"

# App Configuration
NODE_ENV="development"
PORT=5000
FRONTEND_URL="http://localhost:3000"
```

#### Frontend Environment
```bash
cd frontend
cp env.example .env.local
```

Bearbeite `frontend/.env.local`:
```env
NEXT_PUBLIC_API_URL=http://localhost:5000
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your-stripe-publishable-key-here
```

### 4. Database Setup

#### PostgreSQL Database erstellen
```sql
CREATE DATABASE websitbuilder;
```

#### Prisma Setup
```bash
cd backend

# Prisma Client generieren
npm run db:generate

# Database Schema pushen
npm run db:push

# Oder mit Migrationen:
npm run db:migrate

# Templates seeden
npm run db:seed
```

### 5. Development starten

#### Option 1: Alles gleichzeitig
```bash
# Im Root-Verzeichnis
npm run dev
```

#### Option 2: Einzeln starten
```bash
# Backend (Terminal 1)
cd backend
npm run dev

# Frontend (Terminal 2)
cd frontend
npm run dev
```

### 6. Browser öffnen
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000
- API Health: http://localhost:5000/health
- Prisma Studio: `cd backend && npm run db:studio`

## 🐳 Docker Setup (Optional)

```bash
# Mit Docker starten
npm run docker:up

# Docker Images bauen
npm run docker:build

# Docker stoppen
npm run docker:down
```

## 🔑 API Keys Setup

### OpenAI API Key
1. Gehe zu https://platform.openai.com/api-keys
2. Erstelle einen neuen API Key
3. Füge ihn in `backend/.env` ein

### Stripe API Keys
1. Gehe zu https://dashboard.stripe.com/apikeys
2. Kopiere die Test Keys
3. Füge sie in `backend/.env` und `frontend/.env.local` ein

## 📊 Database Management

### Reset Database
```bash
cd backend
npm run db:reset
```

### Prisma Studio öffnen
```bash
cd backend
npm run db:studio
```

### Neue Migration erstellen
```bash
cd backend
npm run db:migrate
```

## 🧪 Testing

```bash
# Backend Tests
cd backend && npm test

# Frontend Tests
cd frontend && npm test

# E2E Tests
npm run test:e2e
```

## 🚀 Deployment

### Vercel (Frontend)
```bash
cd frontend
vercel --prod
```

### Railway/Heroku (Backend)
```bash
cd backend
# Deploy zu Railway oder Heroku
```

## 📁 Projektstruktur

```
WebseiteBuilder/
├── frontend/                 # Next.js Frontend
│   ├── app/                 # App Router
│   ├── components/          # React Components
│   ├── contexts/           # React Contexts
│   ├── lib/                # Utilities & API
│   └── types/              # TypeScript Types
├── backend/                 # Express Backend
│   ├── src/
│   │   ├── routes/         # API Routes
│   │   ├── services/       # Business Logic
│   │   ├── middleware/     # Express Middleware
│   │   └── utils/          # Utilities
│   └── prisma/             # Database Schema
├── docker-compose.yml       # Docker Setup
└── .cursorrules            # Development Rules
```

## 🔧 Troubleshooting

### Port bereits in Verwendung
```bash
# Port 3000 freigeben
lsof -ti:3000 | xargs kill -9

# Port 5000 freigeben
lsof -ti:5000 | xargs kill -9
```

### Database Connection Issues
```bash
# Prisma Client neu generieren
cd backend
npm run db:generate

# Database neu pushen
npm run db:push
```

### Node Modules Issues
```bash
# Node modules löschen und neu installieren
rm -rf node_modules package-lock.json
npm install
```

## 📞 Support

Bei Problemen:
1. Prüfe die Console-Logs
2. Überprüfe die Environment-Variablen
3. Stelle sicher, dass PostgreSQL läuft
4. Überprüfe die API Keys

## 🎯 Nächste Schritte

Nach dem Setup:
1. Teste die API-Endpoints
2. Erstelle einen Test-Account
3. Teste die Template-Erstellung
4. Implementiere die AI-Features
5. Teste die Payment-Integration

**Viel Erfolg beim Entwickeln! 🚀**
