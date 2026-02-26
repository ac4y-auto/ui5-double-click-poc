# 📋 Projekt Specifikáció - Kétlépcsős Vonalkód Megerősítés

## 🎯 Projekt Neve
**Nem dupla-kattintás POC**, hanem **Kétlépcsős Vonalkód Megerősítési Mechanizmus**

## 📖 Üzleti Kontextus

### Raktári/Logisztikai Környezet
A funkció célja egy **hibamegelőzési mechanizmus** biztosítása raktári műveletek során, hogy elkerüljük a téves tárhelyre való könyvelést vagy rossz művelet végrehajtását.

## 🔄 Működési Logika

### 1. Első Vonalkód Beolvasás
**Cél:** Adatok betöltése és megjelenítése

**Mi történik:**
- Felhasználó beolvassa a vonalkód-olvasóval a tárhely/termék vonalkódot
- Rendszer betölti és megjeleníti a kapcsolódó adatokat (tárhely információ, termék részletek, stb.)
- **A beolvasott vonalkód értéke megjelenik az Input mezőben** — a felhasználó vizuálisan ellenőrizheti
- Input mező **sárga háttérrel** jelzi: "Megerősítésre vár"
- Toast üzenet: "Először beolvasva - olvasd be újra a megerősítéshez!"
- Rendszer **várakozó/megerősítésre váró állapotba** kerül

**Fontos:**
- Nincs időkorlát!
- A felhasználónak ideje van ellenőrizni a megjelenített információkat
- Akár másodpercek vagy percek is eltelhetnek

### 2. Második Vonalkód Beolvasás (Ugyanaz!)
**Cél:** Művelet megerősítése és végrehajtása

**Mi történik:**
- Felhasználó **ugyanazt a vonalkódot** olvassa be újra
- Rendszer ellenőrzi: ugyanaz a vonalkód?
  - ✅ **Igen** → Művelet megerősítve, végrehajtás
  - ❌ **Nem** → Hibaüzenet: "Rossz vonalkód! Olvasd be újra ugyanazt!"
- Sikeres megerősítés esetén:
  - Input mező **zöld háttérrel** jelzi: "Megerősítve!"
  - Toast üzenet: "Megerősítve! Művelet végrehajtva."
  - Szerkeszthetővé válik (ha szükséges)

### 3. Állapot Visszaállítás
- **Blur esemény** (fókusz elvesztése) → Vissza alapállapotba
- **ESC billentyű** → Megerősítés megszakítása
- **Új vonalkód beolvasása** → Reset és új megerősítési ciklus kezdődik

## 🎨 Vizuális Jelzések

### Alap Állapot (Várakozás)
- Normál keret
- Placeholder: "Olvasd be a vonalkódot..."

### Első Beolvasás (Megerősítésre Vár)
- **A beolvasott vonalkód értéke megjelenik a mezőben**
- **Sárga háttér** (#fff3cd)
- **Sárga keret** (2px solid #ffc107)
- Toast: "Először beolvasva - olvasd be újra a megerősítéshez!"

### Második Beolvasás - Sikeres (Megerősítve)
- **Zöld háttér** (#d4edda)
- **Zöld keret** (2px solid #28a745)
- Toast: "Megerősítve! Művelet végrehajtva."

### Második Beolvasás - Hibás (Rossz Vonalkód)
- **Piros háttér** (#f8d7da)
- **Piros keret** (2px solid #dc3545)
- Toast: "Hiba! Rossz vonalkód. Olvasd be újra ugyanazt!"
- Visszaáll "Megerősítésre Vár" állapotba

## 💡 Használati Példa

```
Raktáros munkamenet:

1. Raktáros bemegy a 'A-12-05' tárhelyre
2. Beolvassa a tárhely vonalkódját (123456)
   → Mezőben megjelenik: "123456"
   → Képernyőn megjelenik: "Tárhely: A-12-05, Kapacitás: 50 db"
   → Mező SÁRGA

3. Raktáros ellenőrzi:
   - "Igen, jó helyen vagyok"
   - "Ez tényleg az A-12-05 tárhely"

4. Raktáros újra beolvassa UGYANAZT a vonalkódot (123456)
   → Mező ZÖLD
   → Művelet megerősítve, rendszer könyvel

VAGY

4. Raktáros MÁSIK vonalkódot olvas be (789012)
   → Mező PIROS
   → Hibaüzenet: "Rossz vonalkód!"
   → Marad SÁRGA állapotban, várakozik az újra beolvasásra
```

## 🔧 Technikai Követelmények

### Input Mező Állapotai
1. **IDLE** (várakozás) - Normál
2. **PENDING** (első beolvasás) - Sárga, megerősítésre vár
3. **CONFIRMED** (második beolvasás helyes) - Zöld, megerősítve
4. **ERROR** (második beolvasás helytelen) - Piros, vissza PENDING-be

### Tárolandó Adatok
- **lastScannedBarcode** - Utoljára beolvasott vonalkód
- **currentState** - Jelenlegi állapot (IDLE | PENDING | CONFIRMED | ERROR)
- **scannedData** - Első beolvasáshoz tartozó adatok (opcionális)

### Események
- `onBarcodeScanned` - Vonalkód beolvasva
- `onConfirmationSuccess` - Megerősítés sikeres
- `onConfirmationError` - Megerősítés sikertelen
- `onReset` - Állapot visszaállítás

## ⚠️ Fontos Megjegyzések

### Amit NEM kell implementálni:
- ❌ Időkorlát (500ms timeout) - **Nincs időkorlát!**
- ❌ Dupla-kattintás detektálás
- ❌ Gyors egymásutáni click-ek kezelése

### Amit implementálni KELL:
- ✅ Két külön scan event kezelése
- ✅ Vonalkód összehasonlítás
- ✅ Várakozó állapot fenntartása időkorlát nélkül
- ✅ Vizuális feedback minden állapothoz
- ✅ Beolvasott érték megjelenítése PENDING állapotban (ellenőrzéshez)
- ✅ Hibakezelés (rossz vonalkód újraolvasása)

## 📊 Állapotgép

```
[IDLE]
  ↓ (Első beolvasás)
[PENDING] ← (Rossz vonalkód) [ERROR]
  ↓ (Ugyanaz a vonalkód)
[CONFIRMED]
  ↓ (Blur / ESC / Újabb beolvasás)
[IDLE]
```

---

**Verzió:** 1.1
**Utolsó frissítés:** 2026-02-26
**Státusz:** Specifikáció véglegesítve
**Következő lépés:** Implementáció átírása az új specifikáció alapján
