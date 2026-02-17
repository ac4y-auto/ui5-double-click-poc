# UI5 Double-Click POC - Vonalkód Kétlépcsős Megerősítés

## 📋 Projekt Áttekintés

Ez a projekt egy **vonalkód kétlépcsős megerősítési mechanizmust** valósít meg SAPUI5-ben.

**Használati eset:** Raktári/logisztikai környezetben hibamegelőzés — a felhasználó kétszer olvassa be ugyanazt a vonalkódot a művelet jóváhagyásához.

---

## 🎯 Működés

1. **Első beolvasás** → PENDING állapot (sárga keret), várakozás megerősítésre
2. **Második beolvasás (ugyanaz)** → CONFIRMED (zöld keret), művelet végrehajtva, auto-reset
3. **Második beolvasás (eltérő)** → ERROR (piros keret), visszaáll PENDING-re
4. **ESC** → megszakítás, IDLE

---

## 📁 Fájlstruktúra

```
ui5-double-click-poc/
├── index.html                    # ⭐ Fő alkalmazás (standalone, fiori-tools-proxy)
├── control/
│   ├── DoubleClickInput.js       # Dupla-kattintás custom control (referencia)
│   └── PureDoubleClickInput.js   # Vegytiszta UI5 dupla-kattintás (referencia)
├── controller/
│   └── Main.controller.js        # MVC controller
├── view/
│   └── Main.view.xml             # MVC nézet
├── ui5.yaml                      # SAPUI5 1.105.0, local mód
├── ui5-cdn.yaml                  # CDN mód
├── ui5-backend.yaml              # Backend proxy mód
├── ui5-hybrid.yaml               # Hybrid mód
├── package.json                  # fiori run, smart-start scriptek
├── start.js                      # Smart Start (port konfliktus detektálás)
└── hooper/                       # Dokumentáció
```

---

## 🚀 Indítás

```bash
cd ui5-double-click-poc
npm start
# http://localhost:8200/index.html
```

**Módok:**
```bash
npm run start:local    # SAPUI5 1.105.0 lokálisan (~/.ui5 cache)
npm run start:cdn      # CDN mód
npm run start:backend  # Backend proxy
npm run start:hybrid   # Hybrid
npm run smart-start    # Port konfliktus auto-kezeléssel
```

---

## 🔧 Fiori Alkalmazásba Beépítés

Részletes útmutató: **[FIORI_INTEGRATION.md](./FIORI_INTEGRATION.md)**

**Referencia implementáció:** `/Volumes/DevAPFS/work/ui5/sapui5-simple`
- Proper MVC struktúra
- `BarcodeConfirmInput` custom control (`webapp/control/BarcodeConfirmInput.js`)
- Port: 8600

---

## 📊 Állapotgép

```
IDLE → (beolvasás) → PENDING → (ugyanaz) → CONFIRMED → (2s) → IDLE
                              → (eltérő)  → ERROR → (1.5s) → PENDING
       ESC bármelyik állapotból → IDLE
```

---

## 📄 Verzió

- **SAPUI5:** 1.105.0
- **Téma:** sap_horizon
- **Port:** 8200
- **Szerver:** fiori run (`@sap/ux-ui5-tooling`)
