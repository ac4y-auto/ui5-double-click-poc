# Vonalkód Kétlépcsős Megerősítés — Fiori Beépítési Útmutató

## 🎯 Gyors Áttekintés

Ez a dokumentáció leírja, hogyan építhető be a **vonalkód kétlépcsős megerősítés** mechanizmus egy meglévő SAP Fiori alkalmazásba.

**Referencia implementáció:** `/Volumes/DevAPFS/work/ui5/sapui5-simple` (port 8600)

---

## 🔧 Custom Control Használata (Ajánlott)

### 1. Fájl másolása

```
your-fiori-app/
└── webapp/
    └── control/
        └── BarcodeConfirmInput.js    # Forrás: sapui5-simple/webapp/control/
```

### 2. Namespace regisztráció

Az `index.html` `data-sap-ui-resourceroots`-ban a namespace már lefedi a `control/` almappát is — nincs extra teendő, ha a namespace helyes.

### 3. View-ban használat

```xml
<mvc:View
    xmlns:mvc="sap.ui.core.mvc"
    xmlns="sap.m"
    xmlns:bc="your.app.namespace.control"
    controllerName="your.app.namespace.controller.Main">

    <Shell>
        <App>
            <pages>
                <Page title="Megerősítés">
                    <content>
                        <bc:BarcodeConfirmInput
                            id="barcodeInput"
                            title="Vonalkód Kétlépcsős Megerősítés"
                            confirmed=".onBarcodeConfirmed"
                            error=".onBarcodeError"
                            reset=".onBarcodeReset"/>
                    </content>
                </Page>
            </pages>
        </App>
    </Shell>
</mvc:View>
```

### 4. Controller event handlerek

```javascript
sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/m/MessageToast",
    "sap/m/MessageBox"
], function (Controller, MessageToast, MessageBox) {
    "use strict";

    return Controller.extend("your.app.namespace.controller.Main", {

        onInit: function () {},

        onBarcodeConfirmed: function (oEvent) {
            var barcode = oEvent.getParameter("barcode");
            // Üzleti logika: könyvelés, raktári művelet, stb.
            MessageBox.success("Megerősítve: " + barcode);
        },

        onBarcodeError: function (oEvent) {
            var scanned = oEvent.getParameter("scanned");
            var expected = oEvent.getParameter("expected");
            // Opcionális: extra hibanaplózás
        },

        onBarcodeReset: function () {
            // Opcionális: állapot visszaállítás kezelése
        }
    });
});
```

---

## 📋 BarcodeConfirmInput — API referencia

### Properties

| Property | Típus | Default | Leírás |
|----------|-------|---------|--------|
| `title` | string | "Vonalkód Kétlépcsős Megerősítés" | Fejléc szöveg |
| `placeholder` | string | "Olvasd be a vonalkódot..." | Input placeholder |
| `inputWidth` | CSSSize | "400px" | Input mező szélessége |

### Events

| Event | Paraméterek | Leírás |
|-------|-------------|--------|
| `confirmed` | `barcode: string` | Sikeres kétlépéses megerősítés |
| `error` | `scanned: string`, `expected: string` | Eltérő vonalkód beolvasva |
| `reset` | — | Állapot visszaállítva IDLE-re |

### Állapotgép

```
IDLE → (1. beolvasás) → PENDING (sárga)
PENDING → (ugyanaz)   → CONFIRMED (zöld) → 2s → IDLE
PENDING → (eltérő)    → ERROR (piros) → 1.5s → PENDING
ESC bármelyik állapotból → IDLE
```

---

## ⚡ Standalone (index.html) verzió

Ha nem MVC struktúrába, hanem egyszerű `sap.ui.require` alapú oldalba kell:

Lásd: `ui5-double-click-poc/index.html` — a teljes logika inline, custom control nélkül.

**Mikor használd?**
- Gyors POC / prototípus
- Nem MVC projekt
- Minimális fájlstruktúra szükséges

**Mikor használd a custom controlt?**
- Meglévő Fiori MVC alkalmazás
- Több helyen szükséges a kontrol
- Enterprise, hosszú távú karbantartás

---

## 🐛 Troubleshooting

### Control nem jelenik meg
Ellenőrizd a namespace-t a view-ban:
```xml
xmlns:bc="your.app.namespace.control"
```

### Events nem tüzelnek
Ellenőrizd, hogy a handler nevek egyeznek-e a view-ban és a controllerben.

### Vizuális visszajelzés nem működik
A `_setInputStyle` a `getDomRef("inner")`-t használja — ellenőrizd, hogy a DOM renderelt-e már.

---

**Utolsó frissítés:** 2026-02-17
**Referencia:** `sapui5-simple` projekt, port 8600
