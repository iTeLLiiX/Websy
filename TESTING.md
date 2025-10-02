# 🧪 Websy Testing Guide

## 🚀 Quick Start Testing

### 1. Backend starten
```bash
cd backend
npm install
npm run dev
```

### 2. Frontend starten
```bash
cd frontend
npm install
npm run dev
```

### 3. Browser öffnen
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000
- API Health: http://localhost:5000/health

## 🧪 Test-Szenarien

### 1. Landing Page Test
- [ ] **Hero-Section**: Logo, Headline, CTA-Buttons
- [ ] **Features**: Alle 6 Feature-Cards
- [ ] **Pricing**: Free vs Pro Vergleich
- [ ] **Navigation**: Header, Footer, Links

### 2. Authentication Test
- [ ] **Register**: `/auth/register` - Neuen Account erstellen
- [ ] **Login**: `/auth/login` - Anmelden
- [ ] **Demo-Zugang**: "Demo-Daten verwenden" Button
- [ ] **Logout**: Abmelden funktioniert

### 3. Dashboard Test
- [ ] **Free User**: Plan-Status, Website-Limit
- [ ] **Upgrade-Prompts**: Banner für Free Users
- [ ] **Website-Liste**: Leer-Zustand und mit Websites
- [ ] **Quick Actions**: Alle Buttons funktionieren

### 4. Templates Test
- [ ] **Template-Grid**: Alle 5 Restaurant-Templates
- [ ] **Filter**: Kategorie-Filter funktioniert
- [ ] **Suche**: Template-Suche funktioniert
- [ ] **Template-Auswahl**: Weiterleitung zu Builder

### 5. Builder Test
- [ ] **Builder-Interface**: Sidebar, Preview, Device-Views
- [ ] **AI-Features**: Voice, Photo, Chat, Branding Buttons
- [ ] **Page-Navigation**: Seiten-Management
- [ ] **Component-Library**: Drag & Drop Komponenten

### 6. Paywall Test
- [ ] **Free Limits**: Website-Limit, Feature-Locks
- [ ] **Upgrade-Prompts**: Verschiedene Varianten
- [ ] **Pro Features**: Alle Premium-Features
- [ ] **Pricing-Page**: Plan-Vergleich, FAQ

## 🔧 Backend API Tests

### 1. Health Check
```bash
curl http://localhost:5000/health
```

### 2. Auth Endpoints
```bash
# Register
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test@example.com","password":"test123"}'

# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"test123"}'
```

### 3. Templates Endpoint
```bash
curl http://localhost:5000/api/templates
```

## 🐛 Bekannte Issues & Fixes

### 1. Import-Pfade
**Problem**: `@/` Imports funktionieren nicht
**Fix**: 
```bash
# In frontend/tsconfig.json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["./*"]
    }
  }
}
```

### 2. Missing Dependencies
**Problem**: Fehlende UI-Komponenten
**Fix**:
```bash
cd frontend
npm install class-variance-authority
```

### 3. Database Connection
**Problem**: Prisma kann nicht verbinden
**Fix**:
```bash
cd backend
# .env Datei erstellen
cp env.example .env
# Database URL anpassen
npm run db:generate
npm run db:push
```

## 📱 Mobile Testing

### 1. Responsive Design
- [ ] **Mobile View**: Alle Seiten auf Handy
- [ ] **Tablet View**: Mittlere Bildschirmgröße
- [ ] **Desktop View**: Große Bildschirme

### 2. Touch Interactions
- [ ] **Touch Navigation**: Swipe, Tap funktioniert
- [ ] **Mobile Menu**: Hamburger-Menü
- [ ] **Touch Targets**: Buttons groß genug

## 🎯 User Journey Tests

### 1. Free User Journey
1. **Landing Page** → "Kostenlos starten"
2. **Register** → Account erstellen
3. **Dashboard** → Free Plan Status sehen
4. **Template wählen** → Restaurant-Template
5. **Builder** → Website erstellen
6. **Upgrade-Prompt** → Pro Features sehen

### 2. Pro User Journey
1. **Landing Page** → "Pro ausprobieren"
2. **Pricing** → Pro Plan wählen
3. **Payment** → Stripe Checkout
4. **Dashboard** → Pro Features nutzen
5. **Builder** → Alle Premium-Features

## 🔍 Debugging

### 1. Console Logs
```javascript
// Frontend Debug
console.log('User:', user)
console.log('Subscription:', subscription)
console.log('Websites:', websites)
```

### 2. Network Tab
- [ ] **API Calls**: Alle Requests erfolgreich
- [ ] **Error Responses**: 404, 500 Errors
- [ ] **Loading States**: Spinner, Skeleton

### 3. Database
```bash
# Prisma Studio öffnen
cd backend
npm run db:studio
```

## 📊 Performance Tests

### 1. Page Load Times
- [ ] **Landing Page**: < 2 Sekunden
- [ ] **Dashboard**: < 1 Sekunde
- [ ] **Builder**: < 3 Sekunden

### 2. API Response Times
- [ ] **Auth**: < 500ms
- [ ] **Templates**: < 1 Sekunde
- [ ] **Websites**: < 800ms

## 🚨 Critical Tests

### 1. Authentication Flow
- [ ] **Register** → **Login** → **Dashboard**
- [ ] **Logout** → **Redirect** zu Landing
- [ ] **Token Expiry** → **Re-login**

### 2. Paywall Logic
- [ ] **Free User** → **Feature Locks**
- [ ] **Pro User** → **All Features**
- [ ] **Upgrade** → **Feature Unlock**

### 3. Data Persistence
- [ ] **Website Creation** → **Database Save**
- [ ] **Template Selection** → **Builder Load**
- [ ] **User Settings** → **Profile Update**

## 🎉 Success Criteria

### ✅ Frontend funktioniert
- Alle Seiten laden ohne Fehler
- Navigation funktioniert
- Responsive Design
- UI-Komponenten funktionieren

### ✅ Backend funktioniert
- API Endpoints antworten
- Database Verbindung
- Authentication
- File Upload

### ✅ Paywall funktioniert
- Free/Pro Unterscheidung
- Upgrade-Prompts
- Feature-Locks
- Pricing-Integration

**Wenn alle Tests grün sind → Websy ist bereit für den Launch! 🚀**
