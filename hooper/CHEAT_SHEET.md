# 🚀  CHEAT SHEET - UI5 Splash Screen POC

**Projekt-specifikus fontos információk** - Gyors referencia a munka során

---

## 🎯 PROJEKT ALAPADATOK

### Portok
- **Dev szerver port**: `8300`
- **URL**: http://localhost:8300
- **Főoldal**: http://localhost:8300/index-configurable.html

### UI5 Verzió
- **Minimum verzió**: `1.120.0` (manifest.json)
- **Használt verzió**: Latest stable from CDN (dinamikus)
- **Theme**: `sap_horizon`
- **CompatVersion**: `edge`

### CDN Konfiguráció
**Bevált CDN** (alapértelmezett):
```
https://sdk.openui5.org/resources/sap-ui-core.js
```

**Konkrét verzióhoz**:
```
https://sdk.openui5.org/1.120.2/resources/sap-ui-core.js
```

**Előnyök**:
- ✅ OpenUI5 hivatalos SDK
- ✅ Ingyenes
- ✅ Mindig elérhető
- ✅ Automatikusan frissül (vagy fixálható verzió)
- ✅ Production-ready

---

## 🌍 KÖRNYEZETEK

### 1. CDN Mode (Alapértelmezett)
```
http://localhost:8300/index-configurable.html?env=cdn
```
- URL: https://sdk.openui5.org/resources/sap-ui-core.js
- Státusz: ✅ Működik

### 2. Backend Mode
```
http://localhost:8300/index-configurable.html?env=backend
```
- URL: http://192.168.1.10:9000/resources/sap-ui-core.js
- Státusz: ⏸️ Jelenleg offline (várható)

### 3. Local Mode
```
http://localhost:8300/index-configurable.html?env=local
```
- URL: ./node_modules/@openui5/sap.ui.core/resources/sap-ui-core.js
- Státusz: ⚠️ Függőségek telepítése szükséges

---

## 📦 NPM PARANCSOK

```bash
# Szerver indítás
npm start                  # CDN mode
npm run start:cdn          # CDN mode explicit
npm run start:backend      # Backend mode
npm run start:local        # Local mode

# Függőségek telepítése
npm install

# Függőségek ellenőrzése
npm list
```

---

## 🔧 SZERVER MŰVELETEK

### Szerver indítás
```bash
npm start
# Vagy
npx http-server -p 8300
```

### Port ellenőrzés
```bash
netstat -ano | findstr :8300
```

### Szerver leállítás
```bash
# PID megtalálása után
cmd //c "taskkill /PID [PID] /F"
```

### Háttérben futó task leállítás
```bash
# Ha task ID-vel fut (pl. b079a0d)
# TaskStop tool használata vagy
# PID alapján kill
```

---

## 🎬 SPLASH SCREEN BEÁLLÍTÁSOK

### Videó Fájlok
- **Videó**: `splash-video.mp4` (908KB)
- **Poster**: `splash-poster.jpeg` (25KB)

### Időzítés
```javascript
// index-configurable.html, sor ~135
setTimeout(function() {
    splash.classList.add('fade-out');
}, 500); // <- 500ms delay UI5 betöltés után
```

### Videó Sebesség
```javascript
// index-configurable.html, sor ~80
video.playbackRate = 0.2; // 5x lassabb (0.2 = 20%)
```

### Fade-out Animáció
```css
/* index-configurable.html, sor ~24 */
transition: opacity 0.5s ease-out; /* 500ms fade */
```

### Videó Méret
```css
/* index-configurable.html, sor ~32-35 */
#splash-video {
    width: 80%;   /* Képernyő 80%-a */
    height: 80%;
    object-fit: contain;
}
```

---

## 🔐 GIT & GITHUB

### Repository
- **GitHub URL**: https://github.com/ac4y-auto/ui5-splash-screen-poc
- **User**: ac4y-auto
- **Organization**: ac4y-auto
- **Branch**: main
- **Remote**: origin

### Git Alapok
```bash
# Státusz
git status

# Add + Commit
git add .
git commit -m "feat: Your message

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"

# Push
git push origin main

# Pull
git pull origin main

# Log
git log --oneline -10
```

### Commit Típusok
- `feat:` - Új funkció
- `fix:` - Bugfix
- `docs:` - Dokumentáció
- `refactor:` - Kód átszervezés
- `test:` - Tesztek
- `chore:` - Build, dependencies
- `style:` - Formázás

---

## 📁 FONTOS FÁJLOK

### Főbb HTML fájlok
- `index-configurable.html` - **Fő alkalmazás** (multi-env)
- `index.html` - CDN verzió (legacy)
- `index-demo.html` - Demo verzió (CSS animáció)

### Konfiguráció
- `config.js` - Környezeti beállítások (CDN/Local/Backend URL-ek)
- `manifest.json` - UI5 app manifest
- `package.json` - NPM konfiguráció

### UI5 Fájlok
- `Component.js` - UI5 Component
- `view/App.view.xml` - View
- `controller/App.controller.js` - Controller

### Dokumentáció
- `README.md` - Használati útmutató
- `KONZEPCIÓ.md` - Architektúra (432 sor)
- `FEJLESZTOI_UTASITAS.md` - Integráció
- `SESSION_HANDOFF.md` - Session handoff
- `RUNBOOK.md` - Működési útmutató
- `GIT_CHEAT_SHEET.md` - Ez a fájl

---

## 🛠️ GYORS HIBAELHÁRÍTÁS

### "Port already in use"
```bash
netstat -ano | findstr :8300
cmd //c "taskkill /PID [PID] /F"
npm start
```

### "UI5 nem tölt be"
1. Ellenőrizd a Network tab-ot (F12)
2. CDN elérhető-e: https://sdk.openui5.org/resources/sap-ui-core.js
3. Console error-ok
4. Hard reload: Ctrl+Shift+R

### "Backend not reachable"
- Normális, ha 192.168.1.10:9000 offline
- Használd CDN mode-ot helyette

### "Splash screen nem jelenik meg"
1. Ellenőrizd: splash-video.mp4 létezik
2. Ellenőrizd: splash-poster.jpeg létezik
3. Browser console hibák
4. Cache törlés

---

## 🎨 CONFIG.JS MÓDOSÍTÁS

### Backend URL változtatás
```javascript
// config.js
backend: {
    name: 'Backend Server',
    url: 'http://YOUR_IP:YOUR_PORT/resources/sap-ui-core.js',
    description: 'Uses UI5 from custom backend server'
}
```

### CDN verzió rögzítése
```javascript
// config.js
cdn: {
    name: 'CDN (OpenUI5 SDK)',
    url: 'https://sdk.openui5.org/1.120.2/resources/sap-ui-core.js', // <- Konkrét verzió
    description: 'Uses OpenUI5 1.120.2 from official CDN'
}
```

---

## 🧪 TESZTELÉSI URL-EK

### CDN
```
http://localhost:8300/index-configurable.html?env=cdn
http://localhost:8300/index.html
```

### Backend
```
http://localhost:8300/index-configurable.html?env=backend
```

### Local
```
http://localhost:8300/index-configurable.html?env=local
```

### Demo (CSS animáció)
```
http://localhost:8300/index-demo.html
```

---

## 📊 PROJEKT STÁTUSZ

### Commitok (Jelenlegi: 3)
1. `f3ba0ff` - Initial commit
2. `98446df` - Multi-environment support
3. `50c5a2d` - Splash screen timing fix (120s → 500ms)

### Telepített NPM Packages
```json
{
  "devDependencies": {
    "cross-env": "^7.0.3",
    "http-server": "^14.1.1"
  }
}
```

### Node.js
- Verzió: v20.20.0

---

## 💡 GYORS TIPPEK

### LocalStorage ellenőrzés
```javascript
// Browser Console
localStorage.getItem('ui5_env')  // Aktuális env
localStorage.setItem('ui5_env', 'backend')  // Env váltás
localStorage.clear()  // Összes törlése
```

### UI5 verzió lekérdezés runtime-ban
```javascript
// Browser Console (UI5 betöltés után)
sap.ui.version
```

### Environment info
```javascript
// Browser Console
console.log('Current env:', getCurrentEnv());
console.log('Bootstrap URL:', getUI5BootstrapUrl());
```

### Splash screen manual trigger
```javascript
// Browser Console
document.getElementById('splash-screen').classList.remove('fade-out');
```

---

## 🔍 HASZNOS LINKEK

- **OpenUI5 SDK**: https://sdk.openui5.org/
- **OpenUI5 GitHub**: https://github.com/SAP/openui5
- **OpenUI5 Docs**: https://sdk.openui5.org/documentation
- **Project GitHub**: https://github.com/ac4y-auto/ui5-splash-screen-poc

---

## ⚡ GYORS START

```bash
# 1. Project directory
cd C:\work\ui5\ui5-splash-screen-poc

# 2. Start server
npm start

# 3. Open browser
# http://localhost:8300/index-configurable.html

# 4. Git check
git status
```

---

**Utolsó frissítés**: 2026-02-12
**Verzió**: 1.0
**Állapot**: ✅ Működik (CDN mode)
