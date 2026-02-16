# Dupla-Kattintásos Input Beépítése Fiori Alkalmazásba

## 📋 Tartalomjegyzék
1. [Gyors Áttekintés](#gyors-áttekintés)
2. [Custom Control Használata](#custom-control-használata)
3. [Controller-alapú Megoldás](#controller-alapú-megoldás)
4. [Vegytiszta UI5 Megoldás](#vegytiszta-ui5-megoldás)
5. [Best Practices](#best-practices)

---

## 🎯 Gyors Áttekintés

Ez a dokumentáció részletezi, hogyan építhető be a dupla-kattintásos input funkció egy meglévő SAP Fiori alkalmazásba.

**Két fő megközelítés:**
1. **Custom Control** - Újrafelhasználható komponens (ajánlott)
2. **Controller Logic** - Gyors implementáció meglévő Input controlokhoz

---

## 🔧 Custom Control Használata

### 1. Fájlok Másolása

Másold át a custom control fájlt a Fiori projektedbe:

```
your-fiori-app/
├── webapp/
│   ├── control/
│   │   ├── DoubleClickInput.js           # Hibrid megoldás
│   │   └── PureDoubleClickInput.js       # Vegytiszta UI5 (ajánlott)
```

### 2. View-ban Használat (XML)

**Namespace hozzáadása:**
```xml
<mvc:View
    xmlns:mvc="sap.ui.core.mvc"
    xmlns="sap.m"
    xmlns:custom="your.app.namespace.control"
    controllerName="your.app.namespace.controller.Main">
```

**Control használata:**
```xml
<!-- Vegytiszta UI5 verzió -->
<custom:PureDoubleClickInput
    id="myProtectedInput"
    value="{model>/someValue}"
    placeholder="Dupla kattintás a szerkesztéshez"
    width="300px"
    clickTimeout="500"
    firstClickMessage="Első kattintás - kattints még egyszer"
    secondClickMessage="Most szerkeszthető!"
    doubleClick=".onDoubleClick"
    firstClick=".onFirstClick" />

<!-- Hibrid verzió (ha a vegytiszta problémás) -->
<custom:DoubleClickInput
    id="myInput2"
    value="{model>/anotherValue}"
    placeholder="Védett mező"
    doubleClick=".onInputDoubleClicked" />
```

### 3. Táblázatban Használat

```xml
<Table items="{model>/items}">
    <columns>
        <Column><Text text="Név"/></Column>
        <Column><Text text="Érték"/></Column>
    </columns>
    <items>
        <ColumnListItem>
            <cells>
                <Text text="{model>name}"/>
                <custom:PureDoubleClickInput
                    value="{model>value}"
                    width="100%"
                    clickTimeout="600" />
            </cells>
        </ColumnListItem>
    </items>
</Table>
```

### 4. Controller-ben Event Kezelés

```javascript
sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/m/MessageToast"
], function (Controller, MessageToast) {
    "use strict";

    return Controller.extend("your.app.namespace.controller.Main", {

        onDoubleClick: function(oEvent) {
            var oInput = oEvent.getSource();
            var sValue = oInput.getValue();

            console.log("Dupla kattintás történt, érték:", sValue);

            // Itt végezhetsz további műveleteket
            // pl. audit log, validáció, stb.
        },

        onFirstClick: function(oEvent) {
            var oInput = oEvent.getSource();

            console.log("Első kattintás, figyelmeztetés a felhasználónak");

            // Egyedi logika az első kattintásra
        }

    });
});
```

### 5. Programozott Létrehozás

```javascript
// Controller-ben vagy Fragment-ben
var oProtectedInput = new your.app.namespace.control.PureDoubleClickInput({
    value: "{model>/data/protectedField}",
    placeholder: "Dupla kattintás szükséges",
    width: "250px",
    clickTimeout: 700,
    firstClickMessage: "Biztosan szerkeszteni szeretnéd?",
    secondClickMessage: "Szerkeszthető!",
    doubleClick: function(oEvent) {
        // Event handler
        MessageToast.show("Szerkesztés megkezdve!");
    }
});

// Hozzáadás egy containerhez
this.byId("myContainer").addItem(oProtectedInput);
```

---

## 🎮 Controller-alapú Megoldás

Ha NEM akarsz custom controlt használni, hanem meglévő `sap.m.Input`-okat szeretnél védeni:

### 1. Controller Kód

```javascript
sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/m/MessageToast"
], function (Controller, MessageToast) {
    "use strict";

    return Controller.extend("your.app.namespace.controller.Main", {

        onInit: function() {
            // Click tracking minden input mezőhöz
            this._clickTracking = {};
            this._clickTimeout = 500;
        },

        /**
         * Attach this to Input's press event
         */
        onInputPress: function(oEvent) {
            var oInput = oEvent.getSource();
            var sInputId = oInput.getId();

            // Initialize tracking
            if (!this._clickTracking[sInputId]) {
                this._clickTracking[sInputId] = {
                    count: 0,
                    lastClick: 0
                };
            }

            var oTracking = this._clickTracking[sInputId];
            var currentTime = Date.now();

            // Timeout check
            if (currentTime - oTracking.lastClick > this._clickTimeout) {
                oTracking.count = 0;
            }

            oTracking.count++;
            oTracking.lastClick = currentTime;

            if (oTracking.count === 1) {
                // Első kattintás
                MessageToast.show("Első kattintás - kattints még egyszer");
                oInput.addStyleClass("sapUiHighlight");

                // Reset after timeout
                var that = this;
                setTimeout(function() {
                    oTracking.count = 0;
                    oInput.removeStyleClass("sapUiHighlight");
                }, this._clickTimeout);

            } else if (oTracking.count >= 2) {
                // Második kattintás - szerkeszthető
                oInput.setEditable(true);
                oInput.removeStyleClass("sapUiHighlight");
                MessageToast.show("Szerkeszthető!");

                setTimeout(function() {
                    oInput.focus();
                }, 50);

                oTracking.count = 0;

                // Blur után vissza read-only
                oInput.attachEventOnce("change", function() {
                    oInput.setEditable(false);
                });
            }
        }

    });
});
```

### 2. View-ban Használat

```xml
<Input
    value="{model>/value}"
    editable="false"
    press=".onInputPress" />
```

---

## 🧪 Vegytiszta UI5 Megoldás

A `PureDoubleClickInput.js` előnyei:

### ✅ Miért Vegytiszta?

1. **UI5 Delegate használat** helyett natív DOM események
2. **sap.ui.core.Core.delayedCall()** helyett `setTimeout()`
3. **UI5 Event System** minden event kezeléshez
4. **selectText() metódus** natív `.select()` helyett

### 🔍 Különbségek

| Funkció | Hibrid Verzió | Vegytiszta Verzió |
|---------|---------------|-------------------|
| Click kezelés | `addEventListener()` | UI5 Delegate `onclick` |
| Timeout | `setTimeout()` | `Core.delayedCall()` |
| Blur kezelés | `attachBrowserEvent()` | UI5 Delegate `onfocusout` |
| Szöveg kijelölés | DOM `select()` | `selectText()` API |
| DOM hozzáférés | `getDomRef()` | Minimális, csak UI5 API |

### 📦 Használat

Pontosan ugyanúgy, mint a hibrid verzió:

```xml
<custom:PureDoubleClickInput
    value="{model>/data}"
    clickTimeout="500" />
```

---

## 📚 Best Practices

### 1. **Válaszd a Custom Control-t**
- ✅ Újrafelhasználható több helyen
- ✅ Tiszta separation of concerns
- ✅ Könnyebb tesztelés
- ✅ Standard UI5 property binding

### 2. **Timeout Beállítás**
```javascript
// Túl rövid (felhasználó nem ér oda)
clickTimeout: 200  // ❌

// Optimális
clickTimeout: 500  // ✅

// Túl hosszú (frusztráló várakozás)
clickTimeout: 2000 // ❌
```

### 3. **Accessibility**
Adj hozzá tooltip-et, hogy látássérültek is megértsék:

```xml
<custom:PureDoubleClickInput
    value="{model>/value}"
    tooltip="Ez a mező védett. Dupla kattintással szerkeszthető." />
```

### 4. **Audit Trail**
Használd a `doubleClick` eventet audit logolásra:

```javascript
onDoubleClick: function(oEvent) {
    var oInput = oEvent.getSource();
    var sOldValue = oInput.getValue();

    // Audit log
    this._auditService.log({
        user: this._getCurrentUser(),
        action: "FIELD_EDIT_START",
        field: oInput.getId(),
        oldValue: sOldValue,
        timestamp: new Date()
    });
}
```

### 5. **Validáció**
Használj change eventet validációhoz:

```xml
<custom:PureDoubleClickInput
    value="{model>/amount}"
    change=".onAmountChange" />
```

```javascript
onAmountChange: function(oEvent) {
    var oInput = oEvent.getSource();
    var sValue = oInput.getValue();

    if (isNaN(sValue)) {
        oInput.setValueState("Error");
        oInput.setValueStateText("Csak számot adj meg!");
        oInput.setEditable(false);
        return;
    }

    oInput.setValueState("None");
}
```

### 6. **Engedélyezés**
Kapcsold ki a funkciót, ha a felhasználónak nincs joga:

```javascript
onInit: function() {
    var bHasEditPermission = this._checkPermission("EDIT_PROTECTED_FIELDS");

    if (!bHasEditPermission) {
        // Teljesen disable-eld
        this.byId("protectedInput").setEnabled(false);
    }
}
```

---

## 🚀 Gyors Start Checklist

- [ ] Custom control fájl bemásolva
- [ ] Namespace beállítva a View-ban
- [ ] Control hozzáadva a View-hoz
- [ ] Event handlerek implementálva
- [ ] Timeout érték tesztelve
- [ ] Tooltip hozzáadva (accessibility)
- [ ] Audit logging beállítva (ha szükséges)
- [ ] Engedélyezés ellenőrzés hozzáadva
- [ ] Tesztelve mobil eszközön
- [ ] Tesztelve billentyűzettel (accessibility)

---

## 🐛 Troubleshooting

### Probléma: "Control nem jelenik meg"
**Megoldás:** Ellenőrizd a namespace-t:
```xml
xmlns:custom="your.app.namespace.control"
```

### Probléma: "Click event nem működik"
**Megoldás:** Ellenőrizd, hogy a control `editable="false"` állapotban van-e.

### Probléma: "Timeout túl gyors"
**Megoldás:** Növeld a `clickTimeout` értéket:
```xml
<custom:PureDoubleClickInput clickTimeout="700" />
```

### Probléma: "Toast üzenetek nem jelennek meg"
**Megoldás:** Ellenőrizd a MessageToast importot és a property értékeket.

---

## 📞 Továbbfejlesztési Lehetőségek

1. **Konfiguráció külső fájlból** - i18n üzenetek
2. **Különböző védelmi szintek** - 2x, 3x kattintás
3. **Vizuális feedback testreszabása** - egyedi színek
4. **Szerepkör-alapú engedélyezés** - integrálva
5. **Billentyűzet támogatás** - Enter Enter kombináció

---

**Verzió:** 1.0
**Utolsó frissítés:** 2026-02-12
**UI5 Verzió:** 1.105.x+
**Kompatibilitás:** Fiori 2.0, Fiori 3.0 (Horizon Theme)
