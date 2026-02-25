# ScanConfirmHelper — Használat TL;DR

> Gyors referencia. Teljes verzió: [SCAN-CONFIRM-USAGE-GUIDE.md](SCAN-CONFIRM-USAGE-GUIDE.md) | Beépítés: [SCAN-CONFIRM-INTEGRATION-GUIDE.md](SCAN-CONFIRM-INTEGRATION-GUIDE.md)

---

## Hozzáférés

```typescript
// A kontrollerben (onInit()-ben példányosítva):
this._scanConfirm   // ScanConfirmHelper
```

---

## API

```typescript
await this._scanConfirm.handleScan(oEvent, strProp, strChildProp)  // scan kezelése
this._scanConfirm.getState("WarehouseCode")   // "IDLE" | "PENDING" | "CONFIRMED" | "ERROR"
this._scanConfirm.resetField("WarehouseCode") // egy mező → IDLE
this._scanConfirm.resetAll()                  // összes mező → IDLE
```

---

## Leggyakoribb minták

```typescript
// Alap scan handler
public async onWarehouseScan(oEvent: Event): Promise<void> {
    await this._scanConfirm.handleScan(oEvent, "WarehouseCode", null);
}

// Mégse / dialog bezárás
this._scanConfirm.resetAll();

// Submit csak ha CONFIRMED
const bReady = this._scanConfirm.getState("FromWarehouse") === "CONFIRMED"
            && this._scanConfirm.getState("ToWarehouse")   === "CONFIRMED";
```

---

## Vizuális állapotok

| Állapot | Szín | Jelentés |
|---------|------|----------|
| `IDLE` | Normál | Vár az első scanre |
| `PENDING` | 🟡 Sárga | Első scan megvolt, megerősítés kell |
| `CONFIRMED` | 🟢 Zöld | Sikeres, logika lefutott |
| `ERROR` | 🔴 Piros + alarm téma | Eltérő kód érkezett |

---

## Tudnivalók

- **Nincs időkorlát PENDING-ben** — szándékos
- **Egy helper, több mező** — minden `strProp` saját állapotgép
- **Mező ID: `"id" + strProp`** — pl. `strProp = "FromWarehouse"` → `byId("idFromWarehouse")`
- **`errorBehavior: "reset-to-pending"`** — hiba után az első scan megmarad
- **ERROR-ban a scan ignorálva** — MessageBox bezárásáig
