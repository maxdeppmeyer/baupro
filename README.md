# 🏗️ BauPro v2.0 - Bauherren Projektmanagement

Professionelle Web-App für komplettes Bauprojekt-Management.

## Features

- ✅ Unbegrenzte Projekte
- ✅ 11 spezialisierte Tabs pro Projekt
- ✅ Gantt-Zeitplan
- ✅ Kostencontrolling
- ✅ Aufgaben-Management
- ✅ Mängel-Register
- ✅ Bautagebuch
- ✅ Risikoanalyse
- ✅ 4 Checklisten
- ✅ 6 Förderungs-Infos
- ✅ KI-Assistent (Claude API)
- ✅ Vollständig responsive
- ✅ PWA (Offline möglich)

## Schnellstart

```bash
npm install
npm run dev
```

Dann öffne: http://localhost:5173

## Deployment

### Cloudflare Pages (Empfohlen)

1. Dieses Repository zu GitHub pushen
2. Zu https://pages.cloudflare.com/ gehen
3. "Create a project" → GitHub Repository verbinden
4. Build Settings:
   - Framework: Vite
   - Build command: npm run build
   - Build output: dist
5. Deploy!

### Alternative: Vercel oder Netlify

```bash
# Vercel
npm install -g vercel
vercel

# Netlify
npm install -g netlify-cli
netlify deploy --prod --dir=dist
```

## Lizenz

Private Use
