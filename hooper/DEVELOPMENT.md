# 🛠️ Fejlesztési Útmutató - UI5 Vonalkód Megerősítés

## 📋 Tartalomjegyzék
1. [Projekt Struktúra](#projekt-struktúra)
2. [Telepítés és Indítás](#telepítés-és-indítás)
3. [Fejlesztési Workflow](#fejlesztési-workflow)
4. [UI5 Verzió Kezelés](#ui5-verzió-kezelés)
5. [Kód Módosítás](#kód-módosítás)
6. [Tesztelés](#tesztelés)
7. [Gyakori Problémák](#gyakori-problémák)

---

## 📁 Projekt Struktúra

```
ui5-double-click-poc/
├── index.html              # Fő alkalmazás
├── SPECIFICATION.md        # Részletes követelmények
├── DEVELOPMENT.md          # Ez a fájl
├── SESSION_HANDOFF.md      # Projekt státusz
├── RUNBOOK.md             # Munkafolyamat szabályok
├── ui5.yaml               # UI5 konfiguráció
├── package.json           # NPM függőségek
├── node_modules/          # NPM csomagok
│   └── @openui5/          # Lokális UI5 1.105.0
├── resources/             # UI5 erőforrások (sap-ui-core.js, sap/*)
├── sap/                   # UI5 core könyvtárak (root szinten is kell!)
└── webapp/                # UI5 CLI struktúra
    └── manifest.json
```

---

## 🚀 Telepítés és Indítás

### Első telepítés (Clean Install)

```bash
# 1. Repository klónozása
git clone https://github.com/ac4y/ui5-double-click-poc
cd ui5-double-click-poc

# 2. NPM függőségek telepítése
npm install

# 3. UI5 erőforrások másolása
# A. Core resources
cp -r node_modules/@openui5/sap.ui.core/src/* resources/

# B. sap.m library
cp -r node_modules/@openui5/sap.m/src/sap/m resources/sap/

# C. Theme (sap_horizon)
cp -r node_modules/@openui5/themelib_sap_horizon/src/sap/ui/core/themes resources/sap/ui/core/
cp -r node_modules/@openui5/themelib_sap_horizon/src/sap/m/themes resources/sap/m/

# D. Root sap folder (FONTOS!)
cp -r resources/sap sap/

# 4. Szerver indítása
npx http-server -p 8200
```

### Szerver Indítása (Ha már telepítve van)

```bash
cd /c/work/ui5/ui5-double-click-poc
npx http-server -p 8200
```

**URL:** http://localhost:8200/index.html

---

## 🔄 Fejlesztési Workflow

### 1. Kód Módosítás

```bash
# Nyisd meg a fájlt kedvenc editoroddal
code index.html
# VAGY
notepad index.html
```

### 2. Mentés

Mentsd el a változtatásokat (`Ctrl+S`)

### 3. Tesztelés

```bash
# Böngésző frissítése
# - Chrome: Ctrl+Shift+R (hard refresh, cache nélkül)
# - Vagy inkognito ablak: chrome --incognito http://localhost:8200/index.html
```

### 4. Commit és Push

```bash
git add .
git commit -m "Rövid leírás a változtatásról

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
git push origin master
```

---

## 📦 UI5 Verzió Kezelés

### Jelenleg használt verzió: **OpenUI5 1.105.0**

#### Miért lokális UI5?
- Backend is 1.105.0-t használ → Kompatibilitás
- CDN-ek NEM szolgálják ki az 1.105.0-t (404 error)
- NPM biztosítja a pontos verziót

#### UI5 Verzió Ellenőrzése

```bash
grep '"version"' node_modules/@openui5/sap.ui.core/package.json
```

**Kimenet:**
```
  "version": "1.105.0",
```

#### Másik UI5 Verzió Telepítése

```bash
# Pl. 1.108.0-ra váltás
npm uninstall @openui5/sap.m @openui5/sap.ui.core @openui5/themelib_sap_horizon
npm install @openui5/sap.m@1.108.0 @openui5/sap.ui.core@1.108.0 @openui5/themelib_sap_horizon@1.108.0

# Erőforrások újramásolása
rm -rf resources sap
mkdir resources
cp -r node_modules/@openui5/sap.ui.core/src/* resources/
cp -r node_modules/@openui5/sap.m/src/sap/m resources/sap/
cp -r resources/sap sap/
```

---

## ✏️ Kód Módosítás

### Állapotgép Logika

Az alkalmazás 4 állapotban lehet:

```javascript
var STATE = {
    IDLE: "IDLE",           // Alapállapot
    PENDING: "PENDING",     // Első beolvasás után
    CONFIRMED: "CONFIRMED", // Sikeres megerősítés
    ERROR: "ERROR"          // Hibás beolvasás
};
```

### Állapotátmenetek

```
[IDLE]
  ↓ 1. scan (barcode)
[PENDING] (sárga)
  ↓ 2. scan (ugyanaz a barcode)
[CONFIRMED] (zöld) → 2mp után → [IDLE]

[PENDING]
  ↓ 2. scan (MÁSIK barcode)
[ERROR] (piros) → 1.5mp után → [PENDING]
```

### Színkódok Módosítása

```javascript
// PENDING állapot (első beolvasás)
domRef.style.backgroundColor = "#fff3cd"; // Sárga háttér
domRef.style.border = "2px solid #ffc107"; // Sárga keret

// CONFIRMED állapot (sikeres)
domRef.style.backgroundColor = "#d4edda"; // Zöld háttér
domRef.style.border = "2px solid #28a745"; // Zöld keret

// ERROR állapot (hiba)
domRef.style.backgroundColor = "#f8d7da"; // Piros háttér
domRef.style.border = "2px solid #dc3545"; // Piros keret
```

### Toast Üzenetek Módosítása

```javascript
// Első beolvasás
MessageToast.show("Először beolvasva - olvasd be újra a megerősítéshez!");

// Sikeres megerősítés
MessageToast.show("Megerősítve! Művelet végrehajtva.");

// Hiba
MessageToast.show("Hiba! Rossz vonalkód. Olvasd be újra ugyanazt: " + lastScannedBarcode);
```

### Timeout Értékek

```javascript
// Sikeres megerősítés után reset
setTimeout(function() {
    resetState();
}, 2000); // 2 másodperc

// Hiba után vissza PENDING állapotba
setTimeout(function() {
    currentState = STATE.PENDING;
    // Sárga színek újra
}, 1500); // 1.5 másodperc
```

---

## 🧪 Tesztelés

### 1. Manuális Tesztelés Böngészőben

1. Nyisd meg: http://localhost:8200/index.html
2. **Első beolvasás:** Kattints a "Teszt: 123456" gombra
   - ✅ Elvárt: Sárga háttér, toast üzenet
3. **Második beolvasás (helyes):** Kattints újra a "Teszt: 123456" gombra
   - ✅ Elvárt: Zöld háttér, 2mp után reset
4. **Második beolvasás (rossz):** Kattints a "Teszt: 789012" gombra (miután először 123456-ot olvastál be)
   - ✅ Elvárt: Piros háttér, 1.5mp után vissza sárga

### 2. Input Mezővel Tesztelés

1. Kattints az input mezőbe
2. Írd be: `ABC123`
3. Nyomj **ENTER**-t
   - ✅ Sárga háttér
4. Írd be újra: `ABC123`
5. Nyomj **ENTER**-t
   - ✅ Zöld háttér, sikeres megerősítés

### 3. ESC Billentyű Tesztelés

1. Végezz egy első beolvasást (sárga állapot)
2. Nyomj **ESC**-et
   - ✅ Visszaáll IDLE állapotra

### 4. Állapot Megjelenítő

Az oldal alján látható:
```
Állapot: PENDING | Utolsó vonalkód: 123456
```

Ez valós időben frissül minden beolvasás után.

---

## 🐛 Gyakori Problémák

### 1. UI5 Nem Töltődik Be (Üres Oldal)

**Tünet:** Fehér oldal, semmi nem jelenik meg

**Megoldás:**
```bash
# Ellenőrizd hogy a resources mappa létezik
ls resources/sap-ui-core.js

# Ha hiányzik, másold újra:
cp -r node_modules/@openui5/sap.ui.core/src/* resources/
```

### 2. "sap/ui/Global.js" 404 Error

**Tünet:** Console hibát ad: `failed to load 'sap/ui/Global.js' from ./sap/ui/Global.js: 404`

**Megoldás:**
```bash
# A /sap mappának root szinten is léteznie kell!
cp -r resources/sap sap/
```

### 3. Cache Problémák

**Tünet:** Változtatások nem jelennek meg

**Megoldás:**
- Hard refresh: `Ctrl+Shift+R`
- VAGY Inkognito mód: `chrome --incognito http://localhost:8200/index.html`

### 4. Port Foglalt (8200)

**Tünet:** `Address already in use`

**Megoldás:**
```bash
# Windows: Keress rá a processzre
netstat -ano | grep :8200

# Kill the process
taskkill //PID XXXXX //F

# Indítsd újra a szervert
npx http-server -p 8200
```

### 5. Színek Nem Jelennek Meg

**Tünet:** Input mező nem változtatja színét

**Ellenőrzés:**
1. Nyisd meg a böngésző DevTools-t (`F12`)
2. Menj a **Console** tabra
3. Keress hibákat

**Gyakori ok:** JavaScript hiba miatt a handleBarcodeScanned nem fut le

---

## 🔧 Hasznos Parancsok

### Git Műveletek

```bash
# Státusz ellenőrzése
git status

# Legutóbbi commit megtekintése
git log --oneline -1

# Változtatások visszavonása
git checkout -- index.html

# Új branch létrehozása
git checkout -b feature/new-feature
```

### NPM Műveletek

```bash
# Telepített csomagok listája
npm list --depth=0

# UI5 verzió ellenőrzése
npm list @openui5/sap.ui.core

# Cache tisztítása
npm cache clean --force
```

### Szerver Műveletek

```bash
# Szerver futtatása háttérben
npx http-server -p 8200 &

# Szerver leállítása
# Ctrl+C VAGY taskkill //PID XXXXX //F
```

---

## 📚 További Dokumentáció

- **SPECIFICATION.md** - Teljes követelmény specifikáció
- **SESSION_HANDOFF.md** - Projekt státusz és URL-ek
- **RUNBOOK.md** - Munkafolyamat szabályok (tesztelés, stb.)

---

## 💡 Tippek

### 1. Real-time Fejlesztés

- Használj **Live Server** VS Code extension-t
- Automatikusan frissül a böngésző minden mentés után

### 2. Debug Console Használata

```javascript
// Adj hozzá console.log-okat
console.log("Current state:", currentState);
console.log("Scanned barcode:", barcode);
console.log("Last scanned:", lastScannedBarcode);
```

### 3. State Machine Diagram

```
     ┌──────────────┐
     │     IDLE     │
     └──────┬───────┘
            │ scan(barcode)
            ▼
     ┌──────────────┐
     │   PENDING    │ ◄────┐
     │   (sárga)    │      │
     └──┬───────┬───┘      │
        │       │          │
        │       │ scan(másik) → ERROR (piros)
        │       └──────────┘      │
        │ scan(ugyanaz)           │ 1.5s
        ▼                         │
  ┌─────────────┐                │
  │  CONFIRMED  │                │
  │   (zöld)    │                │
  └──────┬──────┘                │
         │ 2s                    │
         └───────────────────────┘
```

---

**Utolsó frissítés:** 2026-02-12
**Verzió:** 1.0
**UI5 Verzió:** 1.105.0 (lokális, NPM)
**Szerver:** http-server (port 8200)
