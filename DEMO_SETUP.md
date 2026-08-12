# Demo / Simulated Data Setup

`make start` brings up a fully working OpenEMS Edge, Backend, and UI — but the seeded
default configuration has **no simulated devices and no real hardware**, so the UI
will look empty (no production, no grid, no battery data) until you configure some
components. This guide walks through wiring up a simulated PV + grid + battery system
so you can see the system actually working end to end.

This is manual, one-time configuration done through Apache Felix's web console
(OpenEMS's built-in OSGi configuration UI), not something baked into the Docker image.

## 1. Log in to the Backend UI

Open `http://localhost:8080` and log in with **any** username/password (e.g.
`admin` / `admin`). The default `Metadata.File` backend provider does not check
credentials — it always logs you in as a single admin user. This is expected, not a
bug.

If the UI defaults to German, switch it from `http://localhost:8080/user` (there's no
separate English deployment — it auto-detects your browser's language and falls back
to German).

## 2. Connect the demo Edge to the Backend

Two demo Edge entries (`edge0`, `edge1`) are pre-seeded in the Backend's
`metadata.json`, but no real Edge is registered against them yet — that's why they
show "Das Gerät ist nicht verbunden!" / "The device is not connected!" on the overview
page. To connect the `openems-edge` container to the Backend:

1. Open the **Edge's** own Felix console (a different container/port than the
   Backend's): `http://localhost:8090/system/console/configMgr`
2. Click **+** to add a new configuration, search for factory **`Controller Api
   Backend`**, and set:
   - `Apikey`: `d92IC4eEHyrqmiMab6GX` (this is `edge0`'s key from
     `src/tools/docker/backend/root/var/lib/openems-default-metadata/metadata.json` —
     use `9O8SAilNKoyYPs8ESUF5` instead if you want to connect as `edge1`)
   - `Uri`: `ws://openems-backend:8081`

After saving, `edge0` should show as connected in the Backend UI within a few
seconds.

## 3. Add simulated data sources

All configuration below is done in the **Edge's** Felix console
(`http://localhost:8090/system/console/configMgr`), not the Backend's.

> **Felix web console gotcha**: array-typed fields (like `Values` below) render as
> **one input box per line**, not a single comma-separated string. Enter each number
> on its own line/box — pasting `0, 0, 60000, ...` as one line will silently fail to
> parse and leave the component with no data (shows as `-` in the UI).

### Simulated PV production (500 kW inverter, 600 kWp array)

**Datasource** — factory `Simulator.Datasource.Single.Direct`:
- Component-ID: `datasource0`
- Values (one per line): `0`, `0`, `60000`, `180000`, `350000`, `480000`, `500000`,
  `500000`, `500000`, `480000`, `350000`, `180000`, `60000`, `0`, `0`
  (a rough daily curve, clipped at `500000` W — the inverter's rating — even though
  the panels could produce up to 600 kWp DC at solar noon)

**Meter** — factory `Simulator.ProductionMeter.Acting`:
- Component-ID: `meter1`
- Datasource-ID: `datasource0`

### Simulated grid meter

**Datasource** — factory `Simulator.Datasource.Single.Direct`:
- Component-ID: `datasource1`
- Values (one per line): `50000`, `50000`, `20000`, `-100000`, `-280000`, `-430000`,
  `-510000`, `-530000`, `-510000`, `-430000`, `-280000`, `-100000`, `20000`, `50000`,
  `50000`
  (positive = importing from grid, negative = exporting; models a ~50 kW baseline
  site load with export once solar production exceeds it)

**Meter** — factory `Simulator.GridMeter.Acting`:
- Component-ID: `meter0`
- Datasource-ID: `datasource1`
- Need frequency Step response?: leave unchecked

Meters push values every Cycle automatically — no Scheduler wiring needed for these
two.

### Simulated battery (500 kW / 1,000 kWh — a standard 2-hour commercial BESS sizing)

**ESS** — factory `Simulator.Ess.Symmetric.Reacting`:
- Component-ID: `ess0`
- Max Apparent Power [VA]: `500000`
- Max charge power [W]: `500000`
- Max discharge power [W]: `500000`
- Capacity [Wh]: `1000000`
- Initial State of Charge [%]: `50`
- Grid mode: `ON_GRID`

**Controller** (required — the ESS won't charge/discharge without one) — factory
`Controller Ess Balancing`:
- Component-ID: `ctrlBalancing0`
- Ess-ID: `ess0`
- Grid-Meter-ID: `meter0`
- Target Grid Setpoint: `0`

Unlike meters, **controllers must be added to the Scheduler** to run. Edit the
existing `Scheduler.AllAlphabetically.default` configuration (factory
`Scheduler.AllAlphabetically`) and set:
- `controllers.ids`: `ctrlBalancing0`

Note: because the grid meter's values above are independently scripted rather than
physically simulated, the grid reading itself won't actually reach zero even though
the balancing controller is trying to zero it out — but the battery's state of charge
and charge/discharge power will correctly respond to the scripted grid curve, which is
enough to see the system work end to end.

## 4. Verify

Go to `http://localhost:8080/device/edge0/live`. Within a few seconds you should see
production, grid import/export, and battery SoC/charge-discharge all moving. If
values still show `-`, check the Edge's Felix console for a components with
unresolved references (a red/yellow status rather than green) — usually a typo in a
`Datasource-ID`/`Ess-ID`/`Grid-Meter-ID` field, or the array-values formatting gotcha
above.

## Scaling this to a different system size

None of the simulator components have a "system size" concept — they just emit
whatever numbers you configure. To model a different plant, just change the peak
values in the datasource arrays and the ESS's power/capacity fields proportionally.
For real-world battery sizing guidance: commercial/industrial (C&I) solar+storage
projects typically size battery power close to the inverter's rating, and battery
energy for 1–4 hours of that power depending on the use case (self-consumption vs.
demand-charge shaving vs. longer backup) — 2-hour systems (battery kWh ≈ 2 ×
inverter kW) are the most common general-purpose default.
