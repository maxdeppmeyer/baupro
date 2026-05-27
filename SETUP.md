# 🚀 BauPro Quick Setup

## 1. GitHub Repository erstellen

```bash
# Im baupro-final Verzeichnis
git init
git add .
git commit -m "Initial commit: BauPro v2.0"

# GitHub: Neues Repository "baupro" erstellen
# Dann diese Befehle ausführen (USERNAME ersetzen!):

git remote add origin https://github.com/USERNAME/baupro.git
git branch -M main
git push -u origin main
```

## 2. Cloudflare Pages Setup

1. Gehe zu https://pages.cloudflare.com/
2. Klicke **"Create a project"**
3. Wähle **"Connect to Git"**
4. Autorisiere GitHub
5. Wähle Repository: **baupro**
6. **Build Settings:**
   - Framework: **Vite**
   - Build command: `npm run build`
   - Build output directory: `dist`
7. Klicke **"Save and Deploy"**

**Fertig!** 🎉
Deine App läuft unter: `https://baupro-xxx.pages.dev`

## 3. GitHub Secrets für Auto-Deploy (Optional)

Falls du automatisches Deployment möchtest:

1. GitHub → Settings → Secrets and variables → Actions
2. Füge folgende Secrets hinzu:

```
CLOUDFLARE_API_TOKEN = (von https://dash.cloudflare.com/profile/api-tokens)
CLOUDFLARE_ACCOUNT_ID = (von Cloudflare Dashboard)
```

Danach: Jeder `git push` deployed automatisch! 🚀

## 4. Auf Android testen

1. Website in Chrome öffnen
2. Menü (⋮) → **"Zum Startbildschirm hinzufügen"**
3. Name: "BauPro" → **Hinzufügen**
4. App-Icon auf Homescreen! 🎉
5. Offline funktioniert auch!

---

**Fertig in 5 Minuten! 🚀**
