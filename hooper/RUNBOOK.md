# 🔧 Runbook - UI5 Double-Click POC

**Projekt**: UI5 Double-Click POC
**Lokáció**: `/Volumes/DevAPFS/work/ui5/ui5-double-click-poc`
**Port**: 8200
**Létrehozva**: 2026-02-12

---

## 🎯 KRITIKUS SZABÁLYOK

### 0. Engedélykérés

**NE KÉRJ FELESLEGES ENGEDÉLYT!** Ha a felhasználó kiadott egy feladatot, csináld meg. Fájlok szerkesztése, létrehozása, törlése, git műveletek — mind mehet engedély nélkül. Csak akkor kérdezz, ha tényleg nem egyértelmű a szándék.

### 1. UI5 Library Használat 🚨

**⚠️ KIZÁRÓLAG SAPUI5 HASZNÁLHATÓ! OpenUI5 TILOS! ⚠️**

- ✅ **SAPUI5** - Hivatalos SAP UI5 library
- ❌ **OpenUI5** - **TILOS** használni

**Helyes CDN URL:**
```javascript
// ✅ HELYES - SAPUI5
url: 'https://sapui5.hana.ondemand.com/resources/sap-ui-core.js'

// ❌ TILOS - OpenUI5
url: 'https://sdk.openui5.org/resources/sap-ui-core.js'  // NE használd!
```

**Ha OpenUI5-öt találsz:**
1. AZONNAL javítsd a `config.js`-t SAPUI5-re
2. Futtasd: `node build.js cdn`
3. Indítsd újra a szervert

### 2. Tesztelési Protokoll ⚠️

**MINDIG Claude tesztel először böngészőben, CSAK UTÁNA szól a usernek!**

1. ✅ Módosítások elvégzése
2. ✅ Böngésző megnyitása/frissítése
3. ✅ Funkciók tesztelése (screenshot, console, network)
4. ✅ Hibák ellenőrzése
5. ✅ **CSAK EZUTÁN** értesíteni a felhasználót

```
❌ ROSSZ: "Kész, próbáld ki a böngészőben!"
✅ JÓ: "Teszteltem böngészőben, minden működik. Most már te is megnézheted!"
```

### 3. Session Debrief 📋

**MINDEN session végén kötelező DEBRIEF írása!**

**Helye:** `hooper/DEBRIEF_v{VERSION}.md`

**Tartalom:**
- ✅ Mi készült el (funkciók, fájlok, javítások)
- ✅ Milyen problémák merültek fel
- ✅ Milyen döntések születtek (jó + rossz)
- ✅ Tanulságok
- ✅ Következő lépés (TODO lista)

**Mikor?** Session vége előtt 15-30 perccel.

---

## 🚀 Szerver Működés

### Aktív Szerver
- **Port**: 8200
- **URL**: http://localhost:8200/index.html

### Szerver Indítás (Smart Start)

Az üzemmód a szerver indításakor fix, build-time injection:

```bash
# CDN mód (alapértelmezett)
npm start
# vagy
npm run smart-start:cdn

# Local mód
npm run smart-start:local

# Backend mód
npm run smart-start:backend

# Hybrid mód
npm run smart-start:hybrid
```

**Hogyan működik?**
1. `start.js` ellenőrzi a port foglaltságot, szükség esetén leállítja a régi process-t
2. `build.js` beinjektálja a `window.UI5_ENVIRONMENT` változót az `index.html`-be
3. Elindítja a megfelelő szervert (http-server vagy UI5 CLI)

**Nincs szükség URL paraméterre!** (`?env=cdn` NEM létezik)

### Szerver Leállítás
```bash
# macOS
lsof -ti:8200 | xargs kill -9

# Windows
netstat -ano | findstr :8200
taskkill /PID [PID] /F
```

---

## 🌍 Environment Módok

Egyetlen URL minden módhoz: `http://localhost:8200/index.html`

A mód a `npm run smart-start:<env>` paranccsal választható.

---

## 🧪 Tesztelési Checklist

### Minden Változtatás Után:
- [ ] Oldal betöltődik
- [ ] UI5 komponensek renderelődnek
- [ ] Dupla-kattintás működik (1x highlight, 2x editable)
- [ ] Toast üzenetek megjelennek
- [ ] Szerkesztés után blur visszaállítja read-only módot
- [ ] Vonalkód megerősítés működik (IDLE → PENDING → CONFIRMED)
- [ ] Console-ban nincs hiba
- [ ] Network-ben UI5 betölt (200 OK)

---

## 📝 Git Workflow

### Commit Üzenet Formátum:
```
type: Short description

- Detailed change 1
- Detailed change 2

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>
```

### Types:
- `feat:` - Új funkció
- `fix:` - Bugfix
- `docs:` - Dokumentáció
- `refactor:` - Refaktorálás
- `chore:` - Karbantartás

### Branch stratégia
- **master:** Production ready kód
- **feature/*** : Új funkciók fejlesztése

---

## 🐛 Hibaelhárítás

### UI5 nem tölt be
1. **Hard refresh**: `Ctrl+Shift+R` (cache tisztítás)
2. Ellenőrizd a CDN elérhetőségét (Network tab)
   - Ha 503 hiba → `npm run smart-start:local`
3. Console hibák ellenőrzése (`F12` → Console tab)
4. Ha semmi sem segít → Inkognito mód próba

**Gyakori hibák:**
- **Üres oldal** = UI5 CDN nem elérhető vagy cache probléma
- **503 error** = CDN túlterhelt
- **CORS error** = Backend mód konfigurációs probléma → használd hybrid módot
- **i18n 404** = Nem kritikus, i18n fájlok opcionálisak

### Dupla-kattintás nem működik
1. Event listener csatolva van-e
2. setTimeout megfelelően fut-e
3. Editable property változik-e

### Port Foglalt
A `start.js` (Smart Start) automatikusan kezeli — leállítja a saját régi process-t. Ha más alkalmazás foglalja:
```bash
PORT=9000 npm run smart-start:cdn
```

---

## 📊 Monitoring

### Browser DevTools
- **Console**: Hibaüzenetek, `[UI5 Bootstrap]` logok
- **Network**: `sap-ui-core.js` betöltés, status kódok
- **Application**: sessionStorage értékek

---

## ✅ Session Start Checklist

1. [ ] Git status ellenőrzés
2. [ ] Szerver indítás: `npm start`
3. [ ] Böngésző: http://localhost:8200/index.html
4. [ ] Claude tesztel először
5. [ ] Előző DEBRIEF elolvasása

## ✅ Session End Checklist

1. [ ] Minden változtatás commit-olva
2. [ ] Push GitHub-ra
3. [ ] DEBRIEF írása (`hooper/DEBRIEF_v{VERSION}.md`)
4. [ ] SESSION_HANDOFF.md frissítve

---

## 📞 Gyors Referencia

### Dokumentációk
Minden doki a `hooper/` mappában.

### GitHub
- **Repo**: https://github.com/ac4y-auto/ui5-double-click-poc
- **Branch**: master

### Testvér projektek
- **Splash Screen POC**: `/Volumes/DevAPFS/work/ui5/ui5-splash-screen-poc` (port 8300, `hopper/`)
- **Themes POC**: `/Volumes/DevAPFS/work/ui5/ui5-themes-gb-change-poc` (hopper/)

---

**Utolsó frissítés:** 2026-02-15
**Verziók:** UI5 1.105.0, Node.js v20.20.0
