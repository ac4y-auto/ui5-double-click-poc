# Double-Click Input - WMS Integrációs Útmutató

Ez az útmutató leírja, hogyan kell integrálni a dupla-kattintással szerkeszthető input mezőt a meglévő WMS SAPUI5/TypeScript projektbe (`sapui5-wms`). A mező **alapállapotban read-only**, és kizárólag dupla kattintásra válik szerkeszthetővé – védi a kritikus adatmezőket a véletlen módosítástól.

---

## Koncepció: Miért dupla-kattintásos védelem?

Raktári (WMS) környezetben a felhasználók mobil eszközökön, gyakran sietve dolgoznak. Egyetlen véletlen érintés egy mennyiség vagy cikkszám mezőn hibás adatot eredményezhet. A dupla-kattintásos védelem ezt akadályozza meg:

- **Első kattintás**: vizuális visszajelzés (sárga highlight) + toast üzenet, 500ms időablak nyílik
- **Második kattintás** (időablakon belül): a mező szerkeszthetővé válik, autofókusz + szöveg kijelölés
- **Fókuszvesztés (blur)**: automatikusan visszaáll read-only módba

A kontrol az `ntt.wms.m.Input`-ból származik, így az `inputmode` property és a mobil billentyűzet kezelés öröklődik.

---

## Előfeltételek

- SAPUI5 1.105+ (szükséges az `addEventDelegate` API-hoz)
- TypeScript alapú UI5 projekt
- Meglévő `ntt.wms.m.Input` custom kontrol (`webapp/m/Input.ts`)
- `sap_horizon` téma

---

## 1. DoubleClickInput.ts bemásolása

**Forrás:** `wms-integration/m/DoubleClickInput.ts`
**Cél:** `webapp/m/DoubleClickInput.ts`

Az `ntt.wms.m.Input`-ból származó kontrol, amely tartalmazza:
- UI5 Event Delegate alapú kattintás-követés (nem natív `addEventListener`)
- Konfigurálható timeout (alapértelmezetten 500ms)
- Konfigurálható toast üzenetek (`firstClickMessage`, `secondClickMessage`, `lockedMessage`)
- `doubleClick` és `firstClick` egyedi események
- Automatikus blur → read-only visszaállás
- Az `inputmode` property öröklődik az `ntt.wms.m.Input`-ból

### Testreszabás

A kontrol property-jei XML view-ban és kódból is állíthatók:

```typescript
new DoubleClickInput({
    value: "{lines>Quantity}",
    clickTimeout: 300,                              // rövidebb timeout
    firstClickMessage: "Koppints még egyszer!",     // egyedi üzenet
    secondClickMessage: "Most szerkesztheted",
    lockedMessage: "Visszazárva"
});
```

---

## 2. CSS stílusok hozzáadása

**Forrás:** `wms-integration/css/style.snippet.css`
**Cél:** `webapp/css/style.css` — a fájl végéhez hozzáfűzni

Három állapothoz tartozó stílus:
- `.doubleClickInput` — alapállapot (pointer cursor)
- `.doubleClickInputHighlight` — első kattintás (sárga border + háttér)
- `.doubleClickInputEdit` — szerkeszthető mód (kék border)

---

## 3. Használat XML view-ban

Az `xmlns:wmsm="ntt.wms.m"` névtér már deklarálva van a WMS view-kban.

### Egyedülálló mező (form-ban)

```xml
<f:FormElement label="{i18n>Quantity}">
    <f:fields>
        <wmsm:DoubleClickInput
            value="{/Quantity}"
            width="100%" />
    </f:fields>
</f:FormElement>
```

### Táblázat cellában

```xml
<ColumnListItem>
    <cells>
        <Text text="{lines>ItemCode}" />
        <wmsm:DoubleClickInput
            value="{lines>Quantity}"
            width="100%"
            clickTimeout="500"
            doubleClick="onQuantityEditable" />
        <Text text="{lines>WhsCode}" />
    </cells>
</ColumnListItem>
```

---

## 4. Használat controllerből (TypeScript)

### Import

```typescript
import DoubleClickInput from "../m/DoubleClickInput";
```

### Programatikus létrehozás

```typescript
const oInput = new DoubleClickInput({
    value: "{lines>Quantity}",
    width: "100%",
    doubleClick: (oEvent: Event) => {
        Log.info("Mező szerkeszthetővé vált");
    }
});
```

### Létező Input lecserélése DoubleClickInput-ra

Ha egy meglévő `wmsm:Input`-ot (ami editable="false") szeretnél átállítani, cseréld le a view XML-ben:

```xml
<!-- ELŐTTE -->
<wmsm:Input value="{lines>Quantity}" editable="false" />

<!-- UTÁNA -->
<wmsm:DoubleClickInput value="{lines>Quantity}" />
```

A `DoubleClickInput` automatikusan `editable: false`-ként indul — nem kell explicit beállítani.

---

## 5. Integrációs pontok a WMS projektben

Az alábbi view-k és controllerek a legvalószínűbb integrációs célpontok:

### Táblázat sorok mennyiség mezői

| View | Leírás | Jelölt mező |
|------|--------|-------------|
| `PickListDetails.view.xml` | Komissiózás tételsorok | Mennyiség cella |
| `StockTransfer.view.xml` | Átraktározás tételek | Mennyiség cella |
| `InventoryGenExits.view.xml` | Kiadás tételek | Mennyiség cella |
| `InventoryGenEntries.view.xml` | Bevételezés tételek | Mennyiség cella |
| `InventoryCountingDetails.view.xml` | Leltár sorok | Számolt mennyiség |

### Dialog-ban lévő mezők

A `BaseDocumentController.ts` több helyen hoz létre `Input` kontrolokat dialog-okban (`editable: false`).
Ezek szintén lecserélhetők `DoubleClickInput`-ra, ha a védelem szükséges.

### Fontos: NEM kell lecserélni mindenhol

Az alábbi mezőknél **NE** használj DoubleClickInput-ot:
- Vonalkód beolvasó mezők (ezek mindig editálhatók kell legyenek)
- Raktár/polc választó mezők (value help-pel működnek)
- Keresőmezők (`SearchField`)
- Dátum mezők (`DatePicker`)

---

## 6. Eseménykezelés példák

### doubleClick esemény — mentés előtti validáció

```typescript
public onQuantityEditable(oEvent: Event): void {
    const oInput = oEvent.getSource() as DoubleClickInput;
    const sPath = oInput.getBindingContext("lines")?.getPath();

    Log.info(`Mező szerkeszthetővé vált: ${sPath}`, undefined, "WMS");

    // Opcionális: eredeti érték mentése visszaállításhoz
    (oInput as any)._originalValue = oInput.getValue();
}
```

### Blur utáni érték-ellenőrzés (controller-ben)

```typescript
// A DoubleClickInput blur-kor automatikusan read-only-ra áll.
// Ha az értékváltozást is szeretnéd kezelni, használd a standard change eseményt:

<wmsm:DoubleClickInput
    value="{lines>Quantity}"
    change="onQuantityChanged"
    doubleClick="onQuantityEditable" />
```

```typescript
public onQuantityChanged(oEvent: Event): void {
    const oInput = oEvent.getSource() as DoubleClickInput;
    const sNewValue = oEvent.getParameter("value");

    if (parseFloat(sNewValue) <= 0) {
        MessageBox.error("A mennyiség nem lehet nulla vagy negatív!");
        oInput.setValue((oInput as any)._originalValue || "0");
    }
}
```

---

## Fájlok összefoglalása

| Fájl | Művelet | Leírás |
|------|---------|--------|
| `webapp/m/DoubleClickInput.ts` | **ÚJ** | Dupla-kattintásos input kontrol |
| `webapp/css/style.css` | **MÓDOSÍTÁS** | +24 sor CSS (3 állapot stílus) |

A `Component.ts` **NEM módosul** – a kontrol önálló, nem igényel Component-szintű inicializálást.
A `manifest.json` **NEM módosul** – nincs új library dependency.

---

## Működési elv

1. A `DoubleClickInput` az `ntt.wms.m.Input`-ból származik → örökli az `inputmode` kezelést
2. Az `init()` metódus `editable: false`-ra állítja a mezőt és regisztrálja az Event Delegate-et
3. **Első kattintás**: `doubleClickInputHighlight` CSS class hozzáadása, `firstClick` event, timeout indítás
4. **Második kattintás** (timeout-on belül): `editable: true`, fókusz, szöveg kijelölés, `doubleClick` event
5. **Blur (fókuszvesztés)**: `editable: false`, CSS class eltávolítás
6. A timeout lejárta után a highlight resetelődik (ha nem volt második kattintás)

```
   ┌─────────┐   1st click   ┌───────────┐   2nd click   ┌────────────┐
   │ LOCKED  │──────────────→│ HIGHLIGHT │──────────────→│  EDITABLE  │
   │ (r/o)   │               │  (r/o)    │               │  (r/w)     │
   └─────────┘←──────────────└───────────┘               └────────────┘
        ↑       timeout reset                    blur          │
        └──────────────────────────────────────────────────────┘
```

---

## Konfigurálható property-k

| Property | Típus | Alapérték | Leírás |
|----------|-------|-----------|--------|
| `clickTimeout` | int | 500 | Két kattintás közötti max idő (ms) |
| `firstClickMessage` | string | "Első kattintás – kattints még egyszer..." | Toast az első kattintásnál |
| `secondClickMessage` | string | "Szerkeszthető mód aktiválva" | Toast a második kattintásnál |
| `lockedMessage` | string | "Mező védve" | Toast blur-kor |
| `inputmode` | string | "text" / "none" | Öröklött – mobil billentyűzet kezelés |

## Egyedi események

| Esemény | Mikor tüzel | Paraméterek |
|---------|-------------|-------------|
| `doubleClick` | Második kattintás → mező szerkeszthetővé vált | — |
| `firstClick` | Első kattintás → highlight | — |
| `change` | Érték változott (standard UI5) | `value`, `newValue` |
