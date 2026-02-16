# Hybrid mód – Fejlesztői útmutató

> **Cél:** UI5 alkalmazás fejlesztése helyi gépen úgy, hogy a UI5 library-kat egy távoli backend
> szerverről tölti be **reverse proxy-n keresztül**, CORS probléma nélkül.

---

## Mi az a Hybrid mód?

A Hybrid mód ötvözi a helyi fejlesztés kényelmét a backend szerver UI5 resource-aival:

```
Böngésző (localhost:8200)
    │
    ├── /index.html    ← helyi fájl (ui5 serve kiszolgálja)
    ├── /Component.js               ← helyi fájl
    ├── /view/App.view.xml          ← helyi fájl
    │
    └── /proxy/resources/sap-ui-core.js
            │
            ▼ (ui5-middleware-simpleproxy)
        http://192.168.1.10:9000/resources/sap-ui-core.js
                                        ← backend szerver UI5 library-k
```

**Minden kérés same-origin (localhost:8200)** → nincs CORS hiba, nincs mixed content warning.

---

## Miért kell ez?

### A probléma: Backend mód (direct) hibái

A közvetlen backend mód (`?env=backend`) így tölti be a UI5-öt:
```javascript
url: 'http://192.168.1.10:9000/resources/sap-ui-core.js'
```

Ez három okból problémás:
1. **CORS hiba** – a böngésző blokkolja a cross-origin kérést (`localhost:8200` → `192.168.1.10:9000`)
2. **Hardkódolt IP** – nem hordozható környezetek között (DEV/QAS/PRD)
3. **Nincs cache buster** – verziófrissítésnél nem invalidálódik a cache

### A megoldás: Hybrid mód (proxy)

```javascript
url: '/proxy/resources/sap-ui-core.js'
```

- Relatív URL → **same-origin**, nincs CORS
- A proxy middleware átirányítja a kérést a backend szerverre
- A backend cím **egyetlen helyen** van konfigurálva (`ui5-backend.yaml`)
- Env var-ral felülírható (`.env` fájl) → transzportálható

---

## Architektúra

### Fájlok és szerepük

```
ui5-double-click-poc/
│
├── ui5.yaml                  ← Alap config (CDN/Local módhoz, proxy nélkül)
├── ui5-backend.yaml          ← Hybrid config (simpleproxy middleware-rel)
├── config.js                 ← Böngésző oldali env config (4 üzemmód URL-ek)
├── package.json              ← npm scripts (start / start:cdn / start:local / start:backend / start:hybrid)
├── index.html                ← Egyetlen belépési pont (?env= paraméterrel)
│
├── .vscode/
│   ├── launch.json           ← 4 debug konfiguráció (CDN / Local / Backend / Hybrid)
│   ├── tasks.json            ← 4 háttér task (serve:cdn / serve:local / serve:backend / serve:hybrid)
│   └── settings.json         ← VS Code beállítások
│
└── node_modules/
    ├── @ui5/cli/                     ← UI5 CLI v3
    └── ui5-middleware-simpleproxy/    ← Proxy middleware (Hybrid módhoz)
```

### Kérés útvonala

```
1. Böngésző kéri:  GET http://localhost:8200/proxy/resources/sap-ui-core.js
                                                 │
2. ui5 serve fogadja a kérést                    │
                                                 │
3. simpleproxy middleware egyeztet:               │
   mountPath: /proxy  ← egyezik!                │
                                                 │
4. Proxy továbbít:    GET http://192.168.1.10:9000/resources/sap-ui-core.js
   (a /proxy prefix levágva, baseUri elé ragasztva)
                                                 │
5. Backend válaszol:  200 OK + sap-ui-core.js    │
                                                 │
6. Proxy visszaküldi a böngészőnek               │
   (same-origin, nincs CORS header szükséges)
```

---

## Beüzemelés lépésről lépésre

### Előfeltételek

- Node.js 18+
- npm 9+
- A projekt már tartalmazza a szükséges dependency-ket

### 1. lépés: `ui5-middleware-simpleproxy` telepítése

Ha még nincs telepítve:
```bash
npm install --save-dev ui5-middleware-simpleproxy
```

> A mi projektünkben már benne van a `package.json`-ban.

### 2. lépés: `ui5-backend.yaml` létrehozása

Hozd létre a projekt gyökerében:

```yaml
specVersion: "3.0"
metadata:
  name: ui5-splash-screen-poc
type: application
resources:
  configuration:
    paths:
      webapp: "."           # Ha a fájlok a gyökérben vannak (nem webapp/ mappában)
framework:
  name: OpenUI5
  version: "1.105.0"
  libraries:
    - name: sap.m
    - name: sap.ui.core
    - name: themelib_sap_horizon
server:
  customMiddleware:
    - name: ui5-middleware-simpleproxy
      afterMiddleware: compression
      mountPath: /proxy                              # ← Ezen az útvonalon érhető el
      configuration:
        baseUri: "http://192.168.1.10:9000"          # ← Backend szerver címe
        strictSSL: false                             # ← Self-signed cert esetén
```

**Fontos részletek:**
- `mountPath: /proxy` – minden `/proxy/*` kérést a proxy kezeli
- `baseUri` – a backend szerver alap URL-je (port-tal együtt)
- `strictSSL: false` – ha a backend HTTPS-t használ self-signed tanúsítvánnyal
- `afterMiddleware: compression` – a compression middleware után fut (ajánlott sorrend)

### 3. lépés: `config.js` – hybrid üzemmód hozzáadása

```javascript
const UI5_CONFIGS = {
    // ... meglévő módok (cdn, local, backend) ...

    hybrid: {
        name: 'Hybrid (backend via proxy)',
        url: '/proxy/resources/sap-ui-core.js',
        description: 'Uses UI5 from backend server via local reverse proxy (CORS-safe)'
    }
};
```

A lényeg: `/proxy/resources/sap-ui-core.js` – relatív URL, a `/proxy` prefix egyezik a
`ui5-backend.yaml` `mountPath`-jával.

### 4. lépés: `package.json` – npm script

```json
{
  "scripts": {
    "start:hybrid": "npx ui5 serve --port 8200 --config ui5-backend.yaml --open index.html?env=hybrid"
  }
}
```

**Paraméterek:**
- `--port 8200` – fejlesztői szerver portja
- `--config ui5-backend.yaml` – a proxy-s konfigurációt használja (nem az alap `ui5.yaml`-t)
- `--open ...?env=hybrid` – automatikusan megnyitja a böngészőt hybrid módban

### 5. lépés: Indítás

```bash
npm run start:hybrid
```

Várt kimenet:
```
info graph:helpers:ui5Framework Using OpenUI5 version: 1.105.0
Server started
URL: http://localhost:8200
```

Böngészőben: `http://localhost:8200/index.html?env=hybrid`

---

## VS Code integráció

Mind a 4 üzemmód elérhető a VS Code Run and Debug panelről (Ctrl+Shift+D).

### launch.json (`.vscode/launch.json`)

```json
{
    "version": "0.2.0",
    "configurations": [
        {
            "name": "CDN mód (SAPUI5 CDN)",
            "type": "chrome",
            "request": "launch",
            "url": "http://localhost:8200/index.html?env=cdn",
            "webRoot": "${workspaceFolder}",
            "preLaunchTask": "serve:cdn",
            "runtimeArgs": ["--auto-open-devtools-for-tabs"]
        },
        {
            "name": "Local mód (ui5 serve)",
            "type": "chrome",
            "request": "launch",
            "url": "http://localhost:8200/index.html?env=local",
            "webRoot": "${workspaceFolder}",
            "preLaunchTask": "serve:local",
            "runtimeArgs": ["--auto-open-devtools-for-tabs"]
        },
        {
            "name": "Backend mód (direkt)",
            "type": "chrome",
            "request": "launch",
            "url": "http://localhost:8200/index.html?env=backend",
            "webRoot": "${workspaceFolder}",
            "preLaunchTask": "serve:backend",
            "runtimeArgs": ["--auto-open-devtools-for-tabs"]
        },
        {
            "name": "Hybrid mód (proxy → backend)",
            "type": "chrome",
            "request": "launch",
            "url": "http://localhost:8200/index.html?env=hybrid",
            "webRoot": "${workspaceFolder}",
            "preLaunchTask": "serve:hybrid",
            "runtimeArgs": ["--auto-open-devtools-for-tabs"]
        }
    ]
}
```

### tasks.json (`.vscode/tasks.json`)

Minden launch konfigurációhoz tartozik egy háttér task, amely elindítja a megfelelő szervert:

| Task | Szerver | Megjegyzés |
|------|---------|------------|
| `serve:cdn` | `http-server -p 8200` | Statikus szerver, UI5 CDN-ről |
| `serve:local` | `ui5 serve --port 8200` | UI5 CLI, framework cache-ből |
| `serve:backend` | `http-server -p 8200` | Statikus szerver, UI5 direkt backend-ről |
| `serve:hybrid` | `ui5 serve --port 8200 --config ui5-backend.yaml` | UI5 CLI + proxy middleware |

```json
{
    "version": "2.0.0",
    "tasks": [
        {
            "label": "serve:cdn",
            "type": "shell",
            "command": "npx http-server -p 8200",
            "isBackground": true,
            "problemMatcher": {
                "pattern": { "regexp": "^$" },
                "background": {
                    "activeOnStart": true,
                    "beginsPattern": "^(Starting up|Hit CTRL)",
                    "endsPattern": "^(Available on|Hit CTRL)"
                }
            },
            "presentation": { "reveal": "silent", "panel": "shared", "group": "serve" }
        },
        {
            "label": "serve:local",
            "type": "npm",
            "script": "start:local",
            "isBackground": true,
            "problemMatcher": {
                "pattern": { "regexp": "^$" },
                "background": {
                    "activeOnStart": true,
                    "beginsPattern": "^(Starting up|Server started)",
                    "endsPattern": "^(Available on|URL: http)"
                }
            },
            "presentation": { "reveal": "silent", "panel": "shared", "group": "serve" }
        },
        {
            "label": "serve:backend",
            "type": "shell",
            "command": "npx http-server -p 8200",
            "isBackground": true,
            "problemMatcher": {
                "pattern": { "regexp": "^$" },
                "background": {
                    "activeOnStart": true,
                    "beginsPattern": "^(Starting up|Hit CTRL)",
                    "endsPattern": "^(Available on|Hit CTRL)"
                }
            },
            "presentation": { "reveal": "silent", "panel": "shared", "group": "serve" }
        },
        {
            "label": "serve:hybrid",
            "type": "npm",
            "script": "start:hybrid",
            "isBackground": true,
            "problemMatcher": {
                "pattern": { "regexp": "^$" },
                "background": {
                    "activeOnStart": true,
                    "beginsPattern": "^(Starting up|Server started)",
                    "endsPattern": "^(Available on|URL: http)"
                }
            },
            "presentation": { "reveal": "silent", "panel": "shared", "group": "serve" }
        }
    ]
}
```

**Használat:** VS Code → Run and Debug (Ctrl+Shift+D) → válaszd ki az üzemmódot → F5

> **Megjegyzés:** A CDN és Backend módok `http-server`-t használnak (statikus szerver),
> a Local és Hybrid módok `ui5 serve`-öt (UI5 CLI szerver). A `ui5 serve` szükséges
> a framework cache-hez (Local) és a proxy middleware-hez (Hybrid).

---

## Backend cím felülírása

### A. opció: `.env` fájl (ajánlott)

A `ui5-middleware-simpleproxy` automatikusan támogatja a `.env` fájlt:

```bash
# .env (a projekt gyökerében, NE COMMITOLD!)
UI5_MIDDLEWARE_SIMPLE_PROXY_BASEURI=http://192.168.1.10:9000
```

Ez felülírja a `ui5-backend.yaml`-ban lévő `baseUri` értéket.

**Előnyök:**
- Fejlesztőnként eltérő backend cím
- Nem kell a yaml-t módosítani
- `.gitignore`-ban tartható

### B. opció: `ui5-backend.yaml` módosítása

Közvetlenül a yaml fájlban:
```yaml
configuration:
  baseUri: "http://uj-szerver:9000"
```

### C. opció: Környezeti változó parancssorból

```bash
UI5_MIDDLEWARE_SIMPLE_PROXY_BASEURI=http://masik-szerver:9000 npx ui5 serve --port 8200 --config ui5-backend.yaml
```

---

## A 4 üzemmód összehasonlítása

| | CDN | Local | Backend | **Hybrid** |
|---|---|---|---|---|
| **Szerver** | http-server | ui5 serve | http-server | **ui5 serve + proxy** |
| **UI5 forrás** | SAPUI5 CDN | UI5 CLI cache | Backend (direkt) | **Backend (proxy-n keresztül)** |
| **CORS** | Nincs gond | Nincs gond | **VAN** probléma | **Nincs** gond |
| **Offline** | ✗ Internet kell | ✓ | ✗ Backend kell | ✗ Backend kell |
| **Transzportálható** | ✓ | ✓ | ✗ Hardkódolt IP | **✓** Env var-ral |
| **SAP ajánlás** | Csak teszthez | Fejlesztéshez | Nem ajánlott | **Igen (reverse proxy)** |
| **NPM parancs** | `start:cdn` | `start:local` | `start:backend` | **`start:hybrid`** |
| **URL paraméter** | `?env=cdn` | `?env=local` | `?env=backend` | **`?env=hybrid`** |
| **VS Code launch** | CDN mód | Local mód | Backend mód | **Hybrid mód** |

---

## Hibakeresés

### A proxy nem továbbít (404)

**Ellenőrizd:**
1. A `mountPath` egyezik a `config.js`-ben lévő URL prefix-szel?
   - yaml: `mountPath: /proxy`
   - config.js: `url: '/proxy/resources/sap-ui-core.js'`
2. A `baseUri` helyes? (protokoll + host + port)
3. A backend szerver fut és elérhető?
   ```bash
   curl http://192.168.1.10:9000/resources/sap-ui-core.js -I
   ```

### "Unable to find source directory 'webapp'"

Hiányzik a `resources.configuration.paths.webapp` a yaml-ból:
```yaml
resources:
  configuration:
    paths:
      webapp: "."
```

### "Duplicate framework dependency definition(s)"

A `package.json`-ban lévő `@openui5/*` csomagok ütköznek a `ui5.yaml` framework szekciójával.
**Megoldás:** Töröld az `@openui5/*` csomagokat a `package.json`-ból.
Részletek: [OPENUI5_TO_SAPUI5_MIGRATION.md](./OPENUI5_TO_SAPUI5_MIGRATION.md)

### ECONNREFUSED / timeout

A backend szerver nem elérhető. Ellenőrizd:
```bash
ping 192.168.1.10
curl http://192.168.1.10:9000/ -v
```

### Böngésző konzolban "Failed to load UI5"

Nyisd meg a DevTools → Network tabot, és keresd a `/proxy/resources/sap-ui-core.js` kérést:
- **404** → a proxy nem fut (rossz yaml config vagy nem `ui5 serve`-vel indítottad)
- **502/503** → a backend nem válaszol
- **Nincs kérés** → a `config.js`-ben nincs `hybrid` kulcs, vagy az `?env=hybrid` hiányzik az URL-ből

---

## Tippek

### Több backend proxy egyszerre

Ha több backend szolgáltatásra van szükség (pl. UI5 + OData):

```yaml
server:
  customMiddleware:
    - name: ui5-middleware-simpleproxy
      afterMiddleware: compression
      mountPath: /proxy
      configuration:
        baseUri: "http://192.168.1.10:9000"
        strictSSL: false
    - name: ui5-middleware-simpleproxy
      afterMiddleware: compression
      mountPath: /odata
      configuration:
        baseUri: "http://192.168.1.10:8080/sap/opu/odata"
        strictSSL: false
```

### Basic Auth a backend felé

```yaml
configuration:
  baseUri: "http://192.168.1.10:9000"
  username: "SAP_USER"
  password: "SAP_PASS"
```

Vagy `.env` fájlban:
```bash
UI5_MIDDLEWARE_SIMPLE_PROXY_USERNAME=SAP_USER
UI5_MIDDLEWARE_SIMPLE_PROXY_PASSWORD=SAP_PASS
```

### Cache buster (produktív backend)

Ha a backend támogatja a cache buster-t:
```javascript
hybrid: {
    url: '/proxy/resources/sap-ui-cachebuster/sap-ui-core.js'
}
```

---

## Gyors ellenőrző lista

Új fejlesztő setup-ja:

- [ ] `git clone` + `npm install`
- [ ] `.env.example` → `.env` másolás, backend cím beállítása
- [ ] `npm run start:hybrid`
- [ ] Böngészőben megjelenik az app
- [ ] F12 → Console → `[UI5 Bootstrap] Environment: Hybrid (backend via proxy)`
- [ ] F12 → Network → `/proxy/resources/sap-ui-core.js` → 200 OK
