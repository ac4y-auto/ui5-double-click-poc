# OpenUI5 → SAPUI5 átkapcsolási útmutató

> Univerzális útmutató bármely UI5 projekthez.
> A UI5 CLI v4 (specVersion 3.0) alapú projektek esetén.

---

## Mi a különbség?

| | OpenUI5 | SAPUI5 |
|---|---|---|
| **Licenc** | Apache 2.0 (nyílt forráskódú) | SAP kereskedelmi licenc |
| **Könyvtárak** | Csak az alap library-k (sap.m, sap.ui.core, sap.ui.layout, stb.) | Minden library (sap.suite.ui.microchart, sap.ui.comp, sap.ushell, stb.) |
| **CDN** | `https://sdk.openui5.org/` | `https://ui5.sap.com/` |
| **NPM scope** | `@openui5/*` | `@sapui5/*` |
| **UI5 CLI framework name** | `OpenUI5` | `SAPUI5` |
| **Mikor kell SAPUI5?** | Ha sap.ui.comp, sap.suite, sap.ushell vagy egyéb SAPUI5-only library kell |

---

## Érintett fájlok

```
projekt/
├── ui5.yaml                  ← framework.name + framework.version
├── ui5-*.yaml                ← minden yaml variáns (pl. ui5-backend.yaml)
├── package.json              ← @openui5/* → @sapui5/* (ha van benne)
├── config.js                 ← CDN URL (ha van dinamikus bootstrap)
├── index.html / *.html       ← bootstrap script src (ha statikus)
└── manifest.json             ← minUI5Version (opcionális frissítés)
```

---

## 1. lépés: `ui5.yaml` (és minden variánsa)

### Előtte (OpenUI5):
```yaml
framework:
  name: OpenUI5
  version: "1.105.0"
  libraries:
    - name: sap.m
    - name: sap.ui.core
    - name: themelib_sap_horizon
```

### Utána (SAPUI5):
```yaml
framework:
  name: SAPUI5
  version: "1.105.0"
  libraries:
    - name: sap.m
    - name: sap.ui.core
    - name: themelib_sap_horizon
    # Most már elérhetők a SAPUI5-only library-k is:
    # - name: sap.ui.comp
    # - name: sap.ushell
    # - name: sap.suite.ui.microchart
```

> **Fontos:** Ha több yaml fájlod van (pl. `ui5.yaml`, `ui5-backend.yaml`), mindegyiket módosítsd!

---

## 2. lépés: `package.json` (ha van `@openui5/*` dependency)

### Előtte:
```json
"devDependencies": {
    "@openui5/sap.m": "^1.105.0",
    "@openui5/sap.ui.core": "^1.105.0",
    "@openui5/themelib_sap_horizon": "^1.105.0"
}
```

### Utána – A. opció (ajánlott): Töröld a UI5 csomagokat!

```json
"devDependencies": {
    // nincs @openui5/* és nincs @sapui5/* sem
}
```

A UI5 CLI v4 a `ui5.yaml` framework szekciója alapján automatikusan letölti és cache-eli a library-kat a `~/.ui5/framework/` mappába. **Nem kell NPM-ből telepíteni!**

### Utána – B. opció: Cseréld le `@sapui5/*`-re

```json
"devDependencies": {
    "@sapui5/sap.m": "^1.105.0",
    "@sapui5/sap.ui.core": "^1.105.0",
    "@sapui5/themelib_sap_horizon": "^1.105.0"
}
```

> **Figyelem:** A UI5 CLI v4 **nem engedi** hogy ugyanaz a library a `package.json`-ban ÉS a `ui5.yaml`-ban is szerepeljen. Ha az A. opciót választod (ajánlott), a `ui5.yaml` kezeli a library-kat. Ha a B. opciót választod, akkor a `ui5.yaml`-ból vedd ki a `libraries` szekciót.

---

## 3. lépés: CDN URL-ek (ha vannak)

### HTML bootstrap (statikus):
```html
<!-- Előtte (OpenUI5) -->
<script src="https://sdk.openui5.org/resources/sap-ui-core.js"></script>

<!-- Utána (SAPUI5) – fix verzió ajánlott -->
<script src="https://ui5.sap.com/1.105.0/resources/sap-ui-core.js"></script>

<!-- Utána (SAPUI5) – latest (csak teszthez!) -->
<script src="https://ui5.sap.com/resources/sap-ui-core.js"></script>
```

### JavaScript config (dinamikus, pl. config.js):
```javascript
// Előtte (OpenUI5)
cdn: {
    name: 'CDN (OpenUI5 Latest)',
    url: 'https://sdk.openui5.org/resources/sap-ui-core.js'
}

// Utána (SAPUI5) – fix verzió
cdn: {
    name: 'CDN (SAPUI5 1.105.0)',
    url: 'https://ui5.sap.com/1.105.0/resources/sap-ui-core.js'
}
```

### CDN domain összefoglaló:

| Framework | CDN URL | Megjegyzés |
|---|---|---|
| OpenUI5 | `https://sdk.openui5.org/` | Nincs verziózott URL |
| SAPUI5 (latest) | `https://ui5.sap.com/` | Csak teszthez! |
| SAPUI5 (fix verzió) | `https://ui5.sap.com/1.105.0/` | Produkciós ajánlás |
| SAPUI5 (on-premise) | `http://<szerver>:<port>/sap/public/bc/ui5_ui5/1/` | ABAP szerver |

---

## 4. lépés: `manifest.json` (opcionális)

A `minUI5Version` nem különbözik OpenUI5 és SAPUI5 között, de érdemes ellenőrizni:

```json
"sap.ui5": {
    "dependencies": {
        "minUI5Version": "1.105.0",
        "libs": {
            "sap.ui.core": {},
            "sap.m": {}
            // SAPUI5-only library-k hozzáadhatók:
            // "sap.ui.comp": {},
            // "sap.ushell": {}
        }
    }
}
```

---

## 5. lépés: `node_modules` újraépítése

```bash
# 1. Törlés
rm -rf node_modules package-lock.json

# 2. Újratelepítés
npm install

# 3. UI5 framework cache törlése (opcionális, tiszta állapothoz)
rm -rf ~/.ui5/framework/

# 4. Teszt – ui5 serve letölti az SAPUI5 library-kat
npx ui5 serve --port 8300
```

> Az első `ui5 serve` indítás tovább tarthat, mert letölti a SAPUI5 library-kat a `~/.ui5/framework/` cache-be. Utána gyors.

---

## Gyors ellenőrző lista

- [ ] `ui5.yaml` – `framework.name: SAPUI5`
- [ ] Minden `ui5-*.yaml` variáns – `framework.name: SAPUI5`
- [ ] `package.json` – `@openui5/*` eltávolítva (vagy `@sapui5/*`-re cserélve)
- [ ] HTML fájlok – CDN URL `sdk.openui5.org` → `ui5.sap.com`
- [ ] `config.js` / bootstrap konfig – CDN URL frissítve
- [ ] `manifest.json` – SAPUI5-only library-k hozzáadva a dependencies-hez
- [ ] `node_modules` törölve és újraépítve
- [ ] `ui5 serve` fut hiba nélkül
- [ ] Böngészőben ellenőrizve: F12 → Console → nincs 404 a library-kra

---

## Gyakori hibák

### "Duplicate framework dependency definition(s)"
**Ok:** `@openui5/*` (vagy `@sapui5/*`) a `package.json`-ban ÉS `ui5.yaml` framework.libraries-ben is.
**Megoldás:** Töröld a `@openui5/*` / `@sapui5/*` csomagokat a `package.json`-ból. A `ui5.yaml` kezeli.

### "Unable to find source directory 'webapp'"
**Ok:** A projekt gyökérben vannak a fájlok, nem `webapp/` almappában.
**Megoldás:** Add hozzá a `ui5.yaml`-hoz:
```yaml
resources:
  configuration:
    paths:
      webapp: "."
```

### "Could not resolve framework library sap.ui.comp"
**Ok:** `framework.name` még `OpenUI5`, de SAPUI5-only library-t használsz.
**Megoldás:** Állítsd át `SAPUI5`-re a `ui5.yaml`-ban.

### CDN 404 hiba
**Ok:** Az adott verzió nem érhető el a választott CDN-en.
**Megoldás:** Ellenőrizd az elérhető verziókat: https://sapui5.hana.ondemand.com/versionoverview.html

---

## Visszaállás SAPUI5 → OpenUI5

Pontosan fordítva:
1. `ui5.yaml`: `framework.name: OpenUI5`
2. CDN: `https://sdk.openui5.org/`
3. Töröld a SAPUI5-only library-kat a dependencies-ből
4. `rm -rf node_modules ~/.ui5/framework/ && npm install`
