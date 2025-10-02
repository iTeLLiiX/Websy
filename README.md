# 🚀 WebsiteBuilder AI

**Der einfachste KI-Website-Builder für deutsche Kleinunternehmen**

Erstelle deine professionelle Website in unter 60 Sekunden mit KI-Power!

## ✨ Features

- 🎤 **Voice-to-Website**: Sprich deine Website einfach
- 📸 **Photo-to-Website**: Lade ein Foto hoch, KI erstellt die Website
- 💬 **Chat-Editing**: "Mach den Button größer" - KI macht es
- 🎨 **Auto-Branding**: KI wählt passende Farben und Styling
- 🍽️ **Restaurant-Templates**: 5 professionelle Vorlagen
- 💰 **Freemium Model**: 0€, 9€, 19€, 39€ pro Monat

## 🏗️ Tech Stack

### Frontend
- Next.js 14 + React 18 + TypeScript
- Tailwind CSS + Framer Motion
- React DnD für Drag & Drop
- Zustand für State Management

### Backend
- Node.js + Express + TypeScript
- PostgreSQL + Prisma ORM
- JWT Authentication
- Stripe Payment Integration

### AI Integration
- OpenAI GPT-4 für Content Generation
- Whisper API für Speech-to-Text
- DALL-E für Image Generation
- GPT-4 Vision für Image Analysis

## 🚀 Quick Start

### 1. Installation
```bash
# Alle Dependencies installieren
npm run setup

# Oder einzeln:
npm install
cd backend && npm install
cd ../frontend && npm install
```

### 2. Environment Setup
```bash
# Backend Environment
cp backend/env.example backend/.env
# Bearbeite backend/.env mit deinen API Keys

# Frontend Environment
cp frontend/env.example frontend/.env.local
# Bearbeite frontend/.env.local
```

### 3. Database Setup
```bash
# Prisma Client generieren
npm run db:generate

# Database Schema pushen
npm run db:push
```

### 4. Development starten
```bash
# Backend + Frontend gleichzeitig
npm run dev

# Oder einzeln:
npm run dev:backend  # Port 5000
npm run dev:frontend # Port 3000
```

### 5. Browser öffnen
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000
- API Health: http://localhost:5000/health

## 🐳 Docker Deployment

```bash
# Mit Docker starten
npm run docker:up

# Docker Images bauen
npm run docker:build

# Docker stoppen
npm run docker:down
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

## 🔑 Required API Keys

### OpenAI
```bash
OPENAI_API_KEY=sk-your-openai-api-key-here
```

### Stripe
```bash
STRIPE_SECRET_KEY=sk_test_your-stripe-secret-key
STRIPE_PUBLISHABLE_KEY=pk_test_your-stripe-publishable-key
```

### Database
```bash
DATABASE_URL=postgresql://username:password@localhost:5432/websitbuilder
```

## 🎯 Features im Detail

### Voice-to-Website
1. Nutzer spricht in Mikrofon
2. Whisper API transkribiert Audio
3. GPT-4 erstellt Website-Inhalt
4. Template wird automatisch gefüllt

### Photo-to-Website
1. Nutzer lädt Foto hoch
2. GPT-4 Vision analysiert Bild
3. KI erstellt passende Website
4. Auto-Branding wird angewendet

### Chat-Editing
1. Nutzer tippt: "Mach den Button größer"
2. GPT-4 versteht Intent
3. CSS wird automatisch angepasst
4. Änderung wird sofort angezeigt

## 💰 Business Model

### Preise
- **Kostenlos**: Subdomain, 5 Seiten, Basis-Templates
- **Starter (9€/Monat)**: Eigene Domain, KI-Features, Support
- **Professional (19€/Monat)**: Booking-System, Online-Shop, Analytics
- **Business (39€/Monat)**: Unbegrenzte Produkte, Team-Accounts, API

### Zielgruppe
- Deutsche Restaurants & Cafés
- Handwerker & Dienstleister
- Kleinunternehmen
- Selbstständige

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

### Docker Production
```bash
docker-compose -f docker-compose.prod.yml up -d
```

## 📊 Analytics & Monitoring

- **Google Analytics**: User Tracking
- **Sentry**: Error Monitoring
- **Stripe Dashboard**: Payment Analytics
- **Custom Analytics**: Website Builder Usage

## 🔒 Security

- JWT Authentication
- Rate Limiting
- Input Validation
- CORS Configuration
- Helmet Security Headers
- Environment Variables

## 🧪 Testing

```bash
# Backend Tests
cd backend && npm test

# Frontend Tests
cd frontend && npm test

# E2E Tests
npm run test:e2e
```

## 📈 Performance

- **Frontend**: < 2s Ladezeit
- **API**: < 100ms Response Time
- **AI Features**: < 3s Processing Time
- **Mobile**: 90+ Lighthouse Score

## 🌍 Internationalization

- Deutsch (Primär)
- Englisch (Geplant)
- Französisch (Geplant)

## 📞 Support

- **Email**: support@websitbuilder.ai
- **Docs**: https://docs.websitbuilder.ai
- **Community**: https://community.websitbuilder.ai

## 📄 License

MIT License - siehe [LICENSE](LICENSE) für Details.

## 🤝 Contributing

1. Fork das Repository
2. Erstelle Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit Changes (`git commit -m 'Add AmazingFeature'`)
4. Push Branch (`git push origin feature/AmazingFeature`)
5. Öffne Pull Request

---

**Made with ❤️ for German small businesses**