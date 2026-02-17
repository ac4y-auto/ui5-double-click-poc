# UI5 Double-Click POC - Session Handoff

## 📍 Projekt állapot

**Fókusz:** Vonalkód kétlépcsős megerősítés (barcode two-step confirmation)

### Elérhető URL:
- **Főoldal:** http://localhost:8200/index.html

### Szerver indítása:
```bash
cd /Volumes/DevAPFS/work/ui5/ui5-double-click-poc
npm start
```

---

## 📦 Projekt állapot

### Git:
- **Remote:** https://github.com/ac4y/ui5-double-click-poc
- **Branch:** master
- **Szerver:** fiori run (`@sap/ux-ui5-tooling`), port 8200

### UI5:
- **Verzió:** SAPUI5 1.105.0
- **Téma:** sap_horizon
- **Forrás:** lokális cache (`~/.ui5/`) — fiori-tools-proxy

---

## 🎯 Mi van az index.html-ben

Csak a vonalkód kétlépcsős megerősítés — tab nélkül, egyenesen a főoldalon:

**Állapotgép:** IDLE → PENDING → CONFIRMED → IDLE
**ESC:** megszakítás bármikor
**Vizuális visszajelzés:** sárga (PENDING), zöld (CONFIRMED), piros (ERROR)

---

## 🔗 Referencia implementáció (MVC)

A proper custom control verzió itt van:

```
/Volumes/DevAPFS/work/ui5/sapui5-simple/
├── webapp/control/BarcodeConfirmInput.js   # Custom control
├── webapp/view/Main.view.xml               # XML view
└── webapp/controller/Main.controller.js   # Controller
```

Port: 8600, `npm start`

Részletek: **[FIORI_INTEGRATION.md](./FIORI_INTEGRATION.md)**

---

## 💡 Gyors ellenőrzés

```bash
# Port fut?
curl -s -o /dev/null -w "%{http_code}" http://localhost:8200/index.html

# Git státusz
git status
```

**Utolsó frissítés:** 2026-02-17
