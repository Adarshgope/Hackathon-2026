# VORTEX

**Vessel Optimization & Rate Tracking for East-coast eXports/imports**
Smart India Hackathon 2026 · Problem Statement **SIH26006**

Predictive freight analytics for bulk cargo chartering across India's eastern
seaboard — forecast rate volatility, respect port constraint envelopes, pick the
right vessel class, and price the cargo all the way to the godown.

---

## Running it

Two processes: Flask on **5000**, Vite on **5173**.

### Backend

```bash
cd backend
python3 -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
python run.py                      # http://localhost:5000
```

> **macOS:** Control Center's AirPlay Receiver also listens on port 5000.
> `run.py` detects this and tells you what to do — either turn AirPlay Receiver
> off in *System Settings → General → AirDrop & Handoff*, or run on another port:
>
> ```bash
> PORT=5050 python run.py
> ```

### Frontend

```bash
cd frontend
npm install
npm run dev                        # http://localhost:5173
```

If the backend is on a non-default port, point the frontend at it:

```bash
VITE_API_URL=http://localhost:5050 npm run dev
```

### Signing in

Register a new account, or use the seeded demo desk:

```
demo@vortex.in  /  vortex2026
```

The login screen also has an **Explore with the demo desk** button that skips the
API entirely.

---

## MongoDB

The connection string is intentionally **empty** so you can paste your Atlas
credentials in. Open `backend/app/config.py`:

```python
MONGO_URI = os.environ.get("MONGO_URI", "")   # ← paste your Atlas URI here
```

or export it instead:

```bash
export MONGO_URI="mongodb+srv://<user>:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority"
```

With no URI the app runs on an in-memory store with the same interface, so
registration and login work out of the box. `GET /api/health` reports which
backing store is live.

---

## What's in it

### Module 1 — Scroll-driven landing page

One pinned GSAP `ScrollTrigger` timeline drives a five-stage story:

| Stage | What happens |
|-------|--------------|
| **1 · Hero** | The VORTEX container hangs on heavy chains over an animated deep-sea swell |
| **2 · Deck landing** | A cargo vessel enters from the left and stops beneath it; her three deck containers read **RELIABLE**, **ACCURATE**, **TRUSTED** |
| **2 · The drop** | The chains pay out at a steady pace, the container seats on the stack, and the frame shudders on impact as the twist-locks engage |
| **3 · Outro** | A gold wipe hands over to the outbound leg; the fully stacked vessel glides right to left with specular sweeps and a gentle container vibration |
| **4 · About** | Two-column block: illustrated terminal with a floating trust card, plus the platform pitch and six capability bullets |
| **5 · Footer** | Deep navy, social links, suggestion box, contact |

The whole scene is laid out in a fixed 1280×720 coordinate space
(`src/lib/scene.js`) and scaled to the viewport — that is what makes the
container land exactly on the stack at any screen size. `prefers-reduced-motion`
skips the choreography and renders the final composition.

### Module 2 — Dashboard

| Tab | Contents |
|-----|----------|
| **KPI Overview** | Live Baltic indices, active vessels in transit, average port dwell, landed cost delta, bunker price, fleet idle time · index board · fleet telemetry · congestion bars · risk feed |
| **Route Optimization** | Origin/destination selector, speed-vs-fuel optimiser (cube law), port constraint check, ranked vessel-class comparison, berth availability windows, full port × class constraint map |
| **Freight Predictor** | 90d/180d/1y history with a 30/60/90-day forecast and 95% confidence cone, procurement calendar scored FIX/WATCH/AVOID, and a 14-lane rate matrix |
| **Landed Cost** | Full cost stack (FOB → freight → insurance → duty → handling → demurrage → inland → holding → interest → stockout), inventory cover position, and an optimal-parcel-size sweep |

---

## API

All routes are under `/api`. `flask-cors` is used when installed; otherwise the
app adds the headers itself.

| Method | Route | Purpose |
|---|---|---|
| GET | `/api/health` | Service + database status |
| GET | `/api/kpis` | Dashboard KPI tiles |
| GET | `/api/indices` | Baltic indices and bunker price |
| GET | `/api/ports` | Discharge and load ports with constraint envelopes |
| GET | `/api/vessel-classes` | Handysize → Capesize particulars |
| GET | `/api/routes` | The 14 trade lanes |
| GET | `/api/vessels?count=` | Live fleet telemetry |
| GET | `/api/congestion` | Queue depth and berth occupancy |
| GET | `/api/alerts` | Congestion and laycan risk warnings |
| GET | `/api/berths?port=&days=` | Forward berth window plan |
| GET | `/api/freight/history?route=&days=` | Historical spot rates |
| GET | `/api/freight/forecast?route=&horizon=` | Forecast with confidence band |
| GET | `/api/freight/matrix` | Every lane: spot, 30-day move, signal |
| GET | `/api/freight/timing?route=&horizon=` | Weekly procurement calendar |
| GET | `/api/optimize/constraints` | Port × vessel-class feasibility grid |
| GET | `/api/optimize/feasibility?port=&vessel_class=` | Single berthing check |
| POST | `/api/optimize/voyage` | Speed/fuel optimisation + class ranking |
| POST | `/api/cost/landed` | Landed cost stack + optimal parcel size |
| POST | `/api/auth/register` · `/api/auth/login` · GET `/api/auth/me` | Session |

### The models behind the numbers

- **Freight series** — mean-reverting (Ornstein–Uhlenbeck style) around a
  seasonal anchor with two humps: pre-monsoon coal stocking and the post-monsoon
  restock. Congestion shocks decay over about a fortnight.
- **Forecast** — momentum from the 10/45-day moving-average spread, decaying over
  ~3 weeks into mean reversion, with a 95% cone widening as √t.
- **Speed optimisation** — propulsion consumption scales with the *cube* of
  speed; auxiliaries do not. Total cost = bunkers + charter hire + port charges +
  demurrage, swept across the class's practical speed band.
- **Port feasibility** — draft plus under-keel clearance (10% or 1.0 m, whichever
  is larger) against berth draft, with cargo derated by tonnes-per-centimetre
  immersion (TPC ≈ 3.77 · dwt^⅔, fitted to Handysize ≈ 38, Panamax ≈ 68,
  Capesize ≈ 120 t/cm). LOA and beam are hard gates.
- **Landed cost** — the full CIF-to-godown stack, plus working-capital interest
  on inventory and a stockout penalty when stock cover falls short of the
  replenishment lead time.

Generators are seeded off a stable key, so the same lane produces the same
history on every reload while vessel positions and index ticks advance with the
clock.

---

## Offline behaviour

Every dashboard request goes through `fetchOrFallback`. If Flask is unreachable
the same generators run in the browser (`src/lib/fallback.js`) and each panel
badges itself **DEMO** instead of **LIVE**, so a demo never shows an empty chart.

---

## Layout

```
backend/
  run.py                    entry point, port preflight
  requirements.txt
  app/
    __init__.py             application factory + CORS
    config.py               MONGO_URI lives here (left empty)
    db.py                   Mongo access with an in-memory fallback
    domain.py               ports, vessel classes, trade lanes, indices
    routes/                 auth · market · ops · optimize blueprints
    services/
      mockdata.py           seeded generators
      engine.py             feasibility, voyage optimiser, landed cost
      auth.py               PBKDF2 credentials + signed session tokens
frontend/
  src/
    lib/                    api client, offline mirror, hooks, formatting, scene
    components/landing/     Navbar · ScrollStage · ShipScene · About · Footer
    components/dashboard/   ui primitives + the four tabs
    pages/                  Landing · AuthPage · Dashboard
```

---

## Design system

*Ocean Blue & Shipment Box Gold.* Deep navy `#0A192F` / `#0B2545`, ocean cobalt
`#134074`, coastal blue `#1D4ED8`–`#3B82F6`; cargo gold `#EAB308`, amber
`#F59E0B`, hazard yellow `#FDE047`. Surfaces are frosted glass over dark ocean.

Chart series use a separate four-step categorical set
(`#d97706 · #3b82f6 · #059669 · #f43f5e`) chosen for the dark chart surface:
every step sits inside the OKLCH 0.48–0.67 dark lightness band, clears the chroma
floor, holds worst-adjacent colour-blind ΔE 8.3 and normal-vision ΔE 24.0, and
exceeds 3:1 contrast. Charts with a single series use the brand gold instead. No
chart uses two y-axes.
