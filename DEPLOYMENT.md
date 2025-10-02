# 🚀 WebsiteBuilder AI - Deployment Guide

## Vercel + Railway Deployment

### 1. **Frontend auf Vercel deployen**

#### Schritt 1: Vercel Account erstellen
- Gehe zu [vercel.com](https://vercel.com)
- Erstelle einen Account oder logge dich ein

#### Schritt 2: GitHub Repository verbinden
- Forke oder klone das Repository
- Verbinde dein GitHub Repository mit Vercel

#### Schritt 3: Vercel Projekt konfigurieren
```bash
# Im frontend Ordner
cd frontend
```

**Vercel Settings:**
- **Framework Preset**: Next.js
- **Root Directory**: `frontend`
- **Build Command**: `npm run build`
- **Output Directory**: `.next`
- **Install Command**: `npm install`

#### Schritt 4: Environment Variables setzen
In Vercel Dashboard → Settings → Environment Variables:

```
NEXT_PUBLIC_API_URL=https://your-backend-url.railway.app
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_key
```

### 2. **Backend auf Railway deployen**

#### Schritt 1: Railway Account erstellen
- Gehe zu [railway.app](https://railway.app)
- Erstelle einen Account mit GitHub

#### Schritt 2: PostgreSQL Database erstellen
- Klicke auf "New Project"
- Wähle "Provision PostgreSQL"
- Kopiere die DATABASE_URL

#### Schritt 3: Backend deployen
- Klicke auf "New Project"
- Wähle "Deploy from GitHub repo"
- Wähle dein Repository
- Setze **Root Directory** auf `backend`

#### Schritt 4: Environment Variables setzen
```
DATABASE_URL=postgresql://...
JWT_SECRET=your-super-secret-jwt-key
OPENAI_API_KEY=sk-your-openai-key
STRIPE_SECRET_KEY=sk_test_your_stripe_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret
FRONTEND_URL=https://your-frontend.vercel.app
NODE_ENV=production
```

#### Schritt 5: Database Setup
```bash
# Nach dem ersten Deploy, führe aus:
npm run db:setup
```

### 3. **Alternative: Render.com**

Falls Railway nicht funktioniert, kannst du auch Render.com verwenden:

#### Backend auf Render:
1. Gehe zu [render.com](https://render.com)
2. Erstelle einen neuen "Web Service"
3. Verbinde dein GitHub Repository
4. **Settings:**
   - **Root Directory**: `backend`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm run start`
   - **Environment**: Node

#### PostgreSQL auf Render:
1. Erstelle einen neuen "PostgreSQL" Service
2. Kopiere die externe URL
3. Setze als `DATABASE_URL` in deinem Backend Service

### 4. **Domain Setup (Optional)**

#### Custom Domain für Frontend:
1. In Vercel Dashboard → Settings → Domains
2. Füge deine Domain hinzu
3. Folge den DNS Anweisungen

#### Custom Domain für Backend:
1. In Railway/Render → Settings → Domains
2. Füge deine Domain hinzu
3. Aktualisiere `FRONTEND_URL` in den Environment Variables

### 5. **SSL und HTTPS**

Beide Services (Vercel und Railway/Render) bieten automatisch SSL-Zertifikate.

### 6. **Monitoring und Logs**

#### Vercel:
- **Analytics**: Automatisch aktiviert
- **Logs**: In Vercel Dashboard → Functions → Logs

#### Railway:
- **Logs**: In Railway Dashboard → Deployments → Logs
- **Metrics**: Automatisch verfügbar

#### Render:
- **Logs**: In Render Dashboard → Logs
- **Metrics**: In Dashboard verfügbar

### 7. **Troubleshooting**

#### Häufige Probleme:

**Frontend Build Fehler:**
```bash
# Lokal testen
cd frontend
npm run build
```

**Backend Connection Fehler:**
- Prüfe Environment Variables
- Prüfe CORS Settings
- Prüfe Database Connection

**Database Connection:**
```bash
# Database Status prüfen
npm run db:test
```

### 8. **Production Checklist**

- [ ] Environment Variables gesetzt
- [ ] Database migriert (`npm run db:setup`)
- [ ] SSL Zertifikate aktiv
- [ ] CORS richtig konfiguriert
- [ ] Stripe Keys korrekt
- [ ] OpenAI API Key gesetzt
- [ ] Domain DNS konfiguriert

### 9. **Kosten Übersicht**

#### Vercel (Frontend):
- **Hobby Plan**: Kostenlos (100GB Bandwidth)
- **Pro Plan**: $20/Monat (1TB Bandwidth)

#### Railway (Backend + Database):
- **Starter**: $5/Monat (512MB RAM)
- **Developer**: $20/Monat (8GB RAM)

#### Render (Alternative):
- **Starter**: Kostenlos (750 Stunden/Monat)
- **Starter+**: $7/Monat (unlimited)

### 10. **Quick Deploy Commands**

```bash
# 1. Repository klonen
git clone https://github.com/your-username/websitbuilder.git
cd websitbuilder

# 2. Frontend für Vercel vorbereiten
cd frontend
npm install
npm run build

# 3. Backend für Railway vorbereiten
cd ../backend
npm install
npm run build

# 4. Database setup (nach Deploy)
npm run db:setup
```

### 11. **Demo URLs nach Deploy**

- **Frontend**: `https://your-project.vercel.app`
- **Backend API**: `https://your-backend.railway.app`
- **Demo Website**: `https://demo-restaurant.websitbuilder.ai`

### 12. **Support**

Bei Problemen:
1. Prüfe die Logs in Vercel/Railway Dashboard
2. Teste lokal mit `npm run dev`
3. Prüfe Environment Variables
4. Prüfe Database Connection

**Happy Deploying! 🚀**