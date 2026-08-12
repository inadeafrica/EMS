# Demo / Simulated Data Setup

The Edge ships with simulated PV production, a grid meter, and a battery
pre-configured (see `src/tools/docker/edge/root/var/lib/openems-default-config/`),
so a fresh deployment already has live-looking data flowing on the Edge itself. The
one thing that's still a manual step is connecting that Edge to the Backend — the
Backend's demo Edge entries (`edge0`, `edge1`) need an explicit API key, and this repo
deliberately doesn't bake that link in automatically (so you can decide whether
`edge0` or `edge1` is "yours").

## 1. Log in to the Backend UI

Open `http://localhost:8080` and log in with **any** username/password (e.g.
`admin` / `admin`). The default `Metadata.File` backend provider does not check
credentials — it always logs you in as a single admin user. This is expected, not a
bug.

If the UI defaults to German, switch it from `http://localhost:8080/user` (there's no
separate English deployment — it auto-detects your browser's language and falls back
to German).

## 2. Connect the demo Edge to the Backend

Open the **Edge's** own Felix console (a different container/port than the Backend's):
`http://localhost:8090/system/console/configMgr`. Click **+** to add a new
configuration, search for factory **`Controller Api Backend`**, and set:
- `Apikey`: `d92IC4eEHyrqmiMab6GX` (this is `edge0`'s key from
  `src/tools/docker/backend/root/var/lib/openems-default-metadata/metadata.json` —
  use `9O8SAilNKoyYPs8ESUF5` instead if you want to connect as `edge1`)
- `Uri`: `ws://openems-backend:8081`

After saving, `edge0` should show as connected in the Backend UI within a few
seconds, and `http://localhost:8080/device/edge0/live` should show production, grid,
and battery data already moving.

## What's pre-configured

- **PV production** (`meter1`, fed by `datasource0`): a smooth daily curve (240
  points, sunrise to sunset) peaking at 500,000 W (500 kW), representing a 500 kW
  inverter behind a larger, 600 kWp panel array (i.e. the curve plateaus at the
  inverter's rating rather than climbing all the way to the array's DC potential —
  this is normal inverter clipping).
- **Grid meter** (`meter0`, fed by `datasource1`): a baseline ~50 kW site load,
  becoming a net export once production exceeds it, sampled at the same 240 points
  as production so the two move together.
- **Battery** (`ess0`): 500 kW / 1,000 kWh (a standard 2-hour commercial BESS sizing),
  starting at 50% SoC.
- **Balancing controller** (`ctrlBalancing0`): actively charges/discharges the battery
  to try to zero out the grid meter. Unlike a naive setup, this genuinely works here —
  `Simulator.GridMeter.Acting` automatically subtracts every `ManagedSymmetricEss`
  component's real active power from its own reading each cycle, so the battery's
  actions visibly show up in the grid number, not just in the battery's own SoC.

### Simulation duration

`Simulator.Datasource.Single.Direct` advances one array entry per OpenEMS Cycle, and
the default Cycle time is 1000ms (`Cycle.DEFAULT_CYCLE_TIME`) — this component has no
built-in way to slow that down (its `timeDelta` is hardcoded to `-1`, i.e. "every
Cycle", unlike `Simulator.Datasource.CSV.Direct`/`.CSV.Predefined`/`.Single.Channel`,
which do expose a configurable `Time-Delta` in seconds). With 240 points, a full
simulated day therefore takes **240 seconds (4 minutes)** of real time before
looping back to the start. An earlier version of this seed data used only 15 points,
which made a full "day" complete in 15 seconds and jump straight back to the start —
visually indistinguishable from noise. 240 points gives second-to-second changes that
are small enough to look continuous while still completing a full day/night cycle
within a few minutes of watching the Live view.

To change the pace: multiply/divide the number of points to speed up or slow down
the simulated day (e.g. 480 points ≈ 8 minutes/day, 120 points ≈ 2 minutes/day),
regenerating the curve at the new resolution — don't just repeat or truncate the
existing 240 values, or the shape will distort. Alternatively, switch `datasource0`/
`datasource1` to `Simulator.Datasource.CSV.Direct` (same underlying idea, but reads a
CSV blob and supports a real `Time-Delta` in seconds per entry) if you want to keep a
small, hand-editable list of points while still controlling real-time pacing
independently of point density.

## Customizing the simulated data

To model a different plant size, edit the values directly — either in the source
tree before building (`src/tools/docker/edge/root/var/lib/openems-default-config/Simulator/...`,
which only takes effect on a fresh Edge config volume — see the note below), or live
against a running deployment through the Edge's Felix console
(`http://localhost:8090/system/console/configMgr`):

- **`Simulator.Datasource.Single.Direct`** components (`datasource0` for production,
  `datasource1` for grid): edit the `Values` array. Scale the peak number to your
  target inverter/system size.
- **`Simulator.EssSymmetric.Reacting`** (`ess0`): edit `Max Apparent Power`,
  `Max charge/discharge power`, and `Capacity` to size a different battery. As a rule
  of thumb, size battery power close to the inverter's rating, and battery energy for
  1–4 hours of that power depending on the use case (1–2 hr for self-consumption/
  demand-charge shaving, up to 4 hr for longer backup or grid-service use cases); 2
  hours (kWh ≈ 2 × inverter kW) is the most common general-purpose default.

None of the simulator components have a "system size" concept beyond these raw
numbers — they just emit whatever you configure.

> **Felix web console gotcha**: array-typed fields (like `Values` above) render as
> **one input box per line**, not a single comma-separated string. Enter each number
> on its own line/box — pasting `0, 0, 60000, ...` as one line will silently fail to
> parse and leave the component with no data (shows as `-` in the UI).

> **Note on existing deployments**: the Edge only seeds its config directory from
> these defaults when it's empty (see
> `src/tools/docker/edge/root/etc/s6-overlay/s6-rc.d/init-openems-config/run`). If
> you already have a populated `./config/edge` on your host from a previous run, the
> new simulator defaults won't appear until you clear it — either delete
> `./config/edge/*` and restart, or `docker compose down -v` to remove the volume
> entirely (this also wipes any other config you've made, so back it up first if it
> matters).

## Verify

Go to `http://localhost:8080/device/edge0/live`. Within a few seconds you should see
production, grid import/export, and battery SoC/charge-discharge all moving. If
values still show `-` after connecting the Edge (step 2), check the Edge's Felix
console for components with an unresolved-reference status (red/yellow rather than
green).
