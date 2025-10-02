# 🚀 Websy - Start Testing Now!

## 🎯 Quick Start (5 Minuten)

### 1. Backend starten
```bash
cd backend
npm install
npm run dev
```
**✅ Erwartung**: Server läuft auf http://localhost:5000

### 2. Frontend starten (neues Terminal)
```bash
cd frontend
npm install
npm run dev
```
**✅ Erwartung**: App läuft auf http://localhost:3000

### 3. Browser öffnen
- **Websy App**: http://localhost:3000
- **API Health**: http://localhost:5000/health

## 🧪 Was du sofort testen kannst:

### ✅ Landing Page
- [ ] **Websy Logo** und Branding
- [ ] **"Kostenlos starten"** Button
- [ ] **"Mit Sprache erstellen"** Button
- [ ] **Free vs Pro** Vergleich
- [ ] **Navigation** (Header/Footer)

### ✅ Authentication
- [ ] **Register**: http://localhost:3000/auth/register
- [ ] **Login**: http://localhost:3000/auth/login
- [ ] **Demo-Zugang**: "Demo-Daten verwenden" Button

### ✅ Dashboard
- [ ] **Free User Status**: Plan-Anzeige
- [ ] **Upgrade-Prompts**: Banner für Free Users
- [ ] **Website-Limits**: "Neue Website" Button
- [ ] **Quick Actions**: Alle Buttons

### ✅ Templates
- [ ] **Template-Grid**: 5 Restaurant-Templates
- [ ] **Filter**: Kategorie-Filter
- [ ] **Suche**: Template-Suche
- [ ] **Template-Auswahl**: Weiterleitung

### ✅ Builder
- [ ] **Builder-Interface**: Sidebar, Preview
- [ ] **Device-Views**: Desktop/Tablet/Mobile
- [ ] **AI-Features**: Voice, Photo, Chat, Branding
- [ ] **Component-Library**: Drag & Drop

### ✅ Pricing
- [ ] **Plan-Vergleich**: Free vs Pro
- [ ] **Feature-Tabelle**: Detaillierter Vergleich
- [ ] **FAQ**: Häufige Fragen
- [ ] **CTA-Buttons**: Upgrade-Prompts

## 🎯 Test-User Journey:

### 1. **Neuer User**
1. Landing Page → "Kostenlos starten"
2. Register → Account erstellen
3. Dashboard → Free Plan sehen
4. Template wählen → Builder öffnen
5. Website erstellen → Wow-Effekt!

### 2. **Free User**
1. Dashboard → Upgrade-Prompts sehen
2. Premium-Feature klicken → Paywall
3. Pricing → Pro Plan wählen
4. Payment → Upgrade zu Pro

### 3. **Pro User**
1. Dashboard → Alle Features nutzen
2. Builder → Premium-Templates
3. Analytics → SEO-Tools
4. Online-Shop → E-Commerce

## 🐛 Häufige Probleme & Fixes:

### Problem: Import-Fehler
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

### Problem: Fehlende Dependencies
```bash
cd frontend
npm install class-variance-authority
```

### Problem: Database Connection
```bash
cd backend
cp env.example .env
# DATABASE_URL anpassen
npm run db:generate
npm run db:push
```

## 🚨 Critical Tests:

- [ ] **Landing Page lädt** ohne Fehler
- [ ] **Register/Login** funktioniert
- [ ] **Dashboard** zeigt korrekte Daten
- [ ] **Paywall** unterscheidet Free/Pro
- [ ] **Builder** öffnet sich
- [ ] **Responsive Design** auf Mobile

## 🎉 Success!

Wenn alle Tests grün sind → **Websy ist bereit für den Launch!** 🚀

**Nächste Schritte:**
1. Database Setup
2. Stripe Integration
3. AI Features
4. Deployment
