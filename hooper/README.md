# UI5 Dupla-Kattintásos Input - POC Projekt

## 📋 Projekt Áttekintés

Ez a projekt bemutat **két különböző megoldást** arra, hogyan lehet UI5-ben olyan input mezőket létrehozni, amelyek csak **dupla kattintás után válnak szerkeszthetővé**.

**Használati eset:** Védett adatmezők, ahol véletlenszerű módosítást meg akarjuk akadályozni.

---

## 🎯 Megoldások

### 1️⃣ **Hibrid Megoldás** (`DoubleClickInput.js`)
- ✅ Működőképes, tesztelt
- ⚠️ Használ natív JavaScript API-kat (`setTimeout`, `addEventListener`)
- 📦 Gyors implementáció
- 🔧 Egyszerűbb karbantartás

**Használat esetén:**
- Gyors prototípus készítés
- Nem kritikus a 100% UI5 megfelelőség
- Már van hasonló implementáció a projektben

### 2️⃣ **Vegytiszta UI5 Megoldás** (`PureDoubleClickInput.js`)
- ✅ 100% UI5 API használat
- ✨ UI5 Delegate használata click kezelésre
- ⏰ `sap.ui.core.Core.delayedCall()` setTimeout helyett
- 🎯 `selectText()` natív DOM select() helyett
- 📚 Enterprise-ready, best practice követés

**Használat esetén:**
- Nagyvállalati környezet
- Szigorú UI5 szabványok
- Long-term maintenance
- SAP audit compliance

---

## 📁 Fájlstruktúra

```
ui5-double-click-poc/
├── control/
│   ├── DoubleClickInput.js           # Hibrid megoldás ⚡
│   └── PureDoubleClickInput.js       # Vegytiszta UI5 ✨
│
├── controller/
│   └── Main.controller.js            # Controller-alapú logic
│
├── view/
│   └── Main.view.xml                 # Főoldal view
│
├── index-demo.html                   # ⭐ Fő demó (egyszerű, tiszta)
├── simple-demo.html                  # Minimális demó
├── final-demo.html                   # Splash screen-es verzió
├── working-demo.html                 # Tesztverzió
├── test-pure.html                    # Vegytiszta control teszt
│
├── FIORI_INTEGRATION.md              # 📘 Integrációs útmutató
├── README.md                         # Ez a fájl
│
├── Component.js
├── manifest.json
├── index.html
└── package.json
```

---

## 🚀 Gyors Start

### Szerver Indítása

```bash
cd ui5-double-click-poc
npx http-server -p 8200
```

### Demo Megnyitása

- **Egyszerű demó (ajánlott):** http://localhost:8200/index-demo.html
- **Minimális demó:** http://localhost:8200/simple-demo.html
- **Splash screen-es verzió:** http://localhost:8200/final-demo.html
- **Vegytiszta control teszt:** http://localhost:8200/test-pure.html

---

## 🔧 Használat

### XML View-ban

```xml
<mvc:View
    xmlns:mvc="sap.ui.core.mvc"
    xmlns="sap.m"
    xmlns:custom="ui5.doubleclick.poc.control">

    <!-- Vegytiszta verzió (ajánlott) -->
    <custom:PureDoubleClickInput
        value="{model>/data}"
        placeholder="Dupla kattintás a szerkesztéshez"
        clickTimeout="500"
        firstClickMessage="Első kattintás!"
        secondClickMessage="Szerkeszthető!"
        doubleClick=".onDoubleClick" />

    <!-- Hibrid verzió -->
    <custom:DoubleClickInput
        value="{model>/value}"
        placeholder="Védett mező"
        doubleClick=".onInputDoubleClick" />
</mvc:View>
```

### JavaScript-ben

```javascript
sap.ui.define([
    "ui5/doubleclick/poc/control/PureDoubleClickInput"
], function(PureDoubleClickInput) {

    var oInput = new PureDoubleClickInput({
        value: "Védett adat",
        width: "300px",
        clickTimeout: 600,
        doubleClick: function(oEvent) {
            console.log("Dupla kattintás történt!");
        }
    });

    // Hozzáadás containerhez
    this.byId("container").addItem(oInput);
});
```

---

## ⚖️ Hibrid vs Vegytiszta - Összehasonlítás

| Funkció | Hibrid | Vegytiszta |
|---------|--------|------------|
| **Click kezelés** | `addEventListener("click")` | UI5 Delegate `onclick` |
| **Timeout** | `setTimeout()` / `clearTimeout()` | `Core.delayedCall()` |
| **Blur event** | `attachBrowserEvent("blur")` | UI5 Delegate `onfocusout` |
| **Szöveg kijelölés** | DOM `select()` | `selectText()` API |
| **DOM hozzáférés** | `getDomRef()` | Minimális, csak UI5 API |
| **Kód komplexitás** | Egyszerűbb | Kicsit komplexebb |
| **SAP Best Practice** | Nem teljesen | ✅ Teljes mértékben |
| **Teljesítmény** | Gyorsabb | Hasonló |
| **Maintenance** | Könnyebb | Enterprise-ready |

---

## 🎨 Funkciók

### Alapvető Működés

1. **Első kattintás:**
   - Visual feedback (highlight)
   - Toast üzenet megjelenítése
   - `firstClick` event tüzelése
   - Timeout indítása (alapértelmezett: 500ms)

2. **Második kattintás** (timeout-on belül):
   - Mező szerkeszthetővé válik
   - Automatikus fókusz
   - Teljes szöveg kijelölése
   - `doubleClick` event tüzelése
   - Toast üzenet

3. **Blur (fókusz elvesztése):**
   - Automatikus visszaváltás read-only módba
   - Style osztályok eltávolítása

### Testreszabható Tulajdonságok (PureDoubleClickInput)

```javascript
{
    clickTimeout: 500,              // ms két kattintás között
    firstClickMessage: "...",       // Első kattintás üzenet
    secondClickMessage: "...",      // Második kattintás üzenet
    value: "...",                   // Input érték
    placeholder: "...",             // Placeholder szöveg
    width: "300px",                 // Szélesség
    enabled: true,                  // Engedélyezve/letiltva
    editable: false                 // Kezdeti állapot (mindig false!)
}
```

### Események

```javascript
{
    firstClick: function(oEvent) {
        // Első kattintásra
    },
    doubleClick: function(oEvent) {
        // Dupla kattintásra (szerkeszthetővé váláskor)
    },
    change: function(oEvent) {
        // Érték változásakor
    }
}
```

---

## 📘 Fiori Integrációs Útmutató

Részletes útmutató a **[FIORI_INTEGRATION.md](./FIORI_INTEGRATION.md)** fájlban:

- ✅ Custom Control használata
- ✅ Controller-alapú megoldás
- ✅ Táblázatban használat
- ✅ Best Practices
- ✅ Troubleshooting
- ✅ Accessibility
- ✅ Audit Trail
- ✅ Engedélyezés kezelés

---

## 🧪 Tesztelés

### Manuális Teszt

1. Nyisd meg: http://localhost:8200/demo.html vagy pure-demo.html
2. Kattints egyszer egy védett mezőre
   - ✅ Highlight megjelenik
   - ✅ Toast üzenet: "Első kattintás..."
3. Kattints még egyszer (500ms-en belül)
   - ✅ Mező szerkeszthetővé válik
   - ✅ Automatikus fókusz
   - ✅ Toast üzenet: "Szerkeszthető!"
4. Kattints ki a mezőből
   - ✅ Visszavált read-only módba

### Automatikus Teszt (QUnit)

```javascript
QUnit.test("Dupla kattintás teszt", function(assert) {
    var oInput = new PureDoubleClickInput();
    oInput.placeAt("qunit-fixture");
    sap.ui.getCore().applyChanges();

    assert.equal(oInput.getEditable(), false, "Kezdetben nem szerkeszthető");

    // Első kattintás
    oInput._handleClickEvent();
    assert.equal(oInput._clickCount, 1, "Click count = 1");

    // Második kattintás
    oInput._handleClickEvent();
    assert.equal(oInput.getEditable(), true, "Második kattintás után szerkeszthető");

    oInput.destroy();
});
```

---

## 💡 Best Practices

### 1. Timeout Beállítás

```javascript
// ❌ Túl rövid - felhasználó nem ér oda
clickTimeout: 200

// ✅ Optimális - kényelmes, de nem frusztráló
clickTimeout: 500

// ⚠️ Túl hosszú - idegesítő várakozás
clickTimeout: 2000
```

### 2. Accessibility

```xml
<!-- Tooltip hozzáadása -->
<custom:PureDoubleClickInput
    value="{value}"
    tooltip="Ez a mező védett. Dupla kattintással szerkeszthető." />
```

### 3. Audit Logging

```javascript
onDoubleClick: function(oEvent) {
    var oInput = oEvent.getSource();

    // Log a szerkesztés kezdetét
    this.getOwnerComponent().getModel("audit").create("/AuditLog", {
        user: sap.ushell.Container.getUser().getId(),
        action: "EDIT_START",
        field: oInput.getId(),
        timestamp: new Date(),
        oldValue: oInput.getValue()
    });
}
```

### 4. Engedélyezés

```javascript
onInit: function() {
    var bCanEdit = this._checkUserPermission("EDIT_PROTECTED_FIELDS");

    if (!bCanEdit) {
        this.byId("protectedInput").setEnabled(false);
    }
}
```

### 5. Validáció

```javascript
onChange: function(oEvent) {
    var oInput = oEvent.getSource();
    var sValue = oInput.getValue();

    if (!this._validateInput(sValue)) {
        oInput.setValueState("Error");
        oInput.setValueStateText("Érvénytelen érték!");
        oInput.setEditable(false);
    }
}
```

---

## 🐛 Troubleshooting

### Probléma: Control nem jelenik meg

**Megoldás:** Ellenőrizd a namespace-t:
```xml
xmlns:custom="ui5.doubleclick.poc.control"
```

### Probléma: Kattintás nem működik

**Megoldás:** Ellenőrizd:
- Control `editable="false"` állapotban van?
- Van `press` event handler (hibrid verzió)?
- UI5 Delegate megfelelően van hozzáadva (vegytiszta)?

### Probléma: Timeout túl gyors

**Megoldás:** Növeld a `clickTimeout` értéket:
```xml
<custom:PureDoubleClickInput clickTimeout="700" />
```

### Probléma: Toast üzenetek nem jelennek meg

**Megoldás:**
- Ellenőrizd a MessageToast import-ot
- Állítsd be a property értékeket
- Nézd meg a console.log hibákat

---

## 📊 Vegytiszta UI5 - Technikai Részletek

### Mi teszi "vegytisztává"?

#### ✅ Amit használunk (UI5 API):

1. **UI5 Delegate** - Event kezelés
```javascript
this._clickDelegate = {
    onclick: function(oEvent) { ... },
    onfocusout: function(oEvent) { ... }
};
this.addEventDelegate(this._clickDelegate, this);
```

2. **Core.delayedCall()** - Timeout
```javascript
sap.ui.core.Core.prototype.delayedCall(500, this, function() {
    // Kód futtatása 500ms múlva
});
```

3. **selectText()** - Szöveg kijelölés
```javascript
this.selectText(0, this.getValue().length);
```

4. **UI5 Event System** - Custom events
```javascript
this.fireDoubleClick();
this.fireFirstClick();
```

#### ❌ Amit NEM használunk (natív):

- ~~`setTimeout()` / `clearTimeout()`~~
- ~~`addEventListener()` / `removeEventListener()`~~
- ~~`getDomRef().select()`~~
- ~~`attachBrowserEvent("blur")`~~

---

## 🔮 Továbbfejlesztési Lehetőségek

1. **i18n támogatás** - Üzenetek külső fájlból
2. **Különböző védelmi szintek** - 2x, 3x kattintás opció
3. **Vizuális testreszabás** - Egyedi színek, animációk
4. **Szerepkör-alapú védelem** - User role integration
5. **Billentyűzet támogatás** - `Enter` `Enter` kombináció
6. **Mobile gesture** - Double-tap támogatás
7. **Undo/Redo** - Visszavonás támogatás
8. **Confirmation dialog** - Opcionális megerősítés

---

## 📞 Támogatás & Contribution

### Kérdések?

Nézd meg a [FIORI_INTEGRATION.md](./FIORI_INTEGRATION.md) fájlt részletes integrációs útmutatóért.

### Bug Report

Ha hibát találsz:
1. Ellenőrizd a console.log-ot
2. Nézd meg a [Troubleshooting](#-troubleshooting) szekciót
3. Készíts issue-t a pontos leírással

---

## 📄 Licenc & Verzió

- **Verzió:** 1.0.0
- **Utolsó frissítés:** 2026-02-12
- **UI5 Kompatibilitás:** 1.105.x+
- **Fiori Verzió:** 2.0, 3.0 (Horizon Theme)
- **Browser Support:** Chrome, Firefox, Safari, Edge

---

## ⭐ Összefoglalás

| ✅ Amit kapsz | 📦 Fájlok |
|--------------|----------|
| Hibrid megoldás | `DoubleClickInput.js` |
| Vegytiszta UI5 | `PureDoubleClickInput.js` |
| Controller logic | `Main.controller.js` |
| Integrációs útmutató | `FIORI_INTEGRATION.md` |
| Demo alkalmazások | `demo.html`, `pure-demo.html` |
| Dokumentáció | `README.md` (ez a fájl) |

**Használd a vegytiszta verziót enterprise környezetben, a hibridet gyors prototípusokhoz!** 🚀
