# Deep Bite (2D shark game)

A simple 2D shark game that runs in any browser: phones, tablets, desktops.
It's plain HTML, CSS and JavaScript. There's no server code, no database and no build step.
It is hosted as static files on **Cloudflare**, and your best score is saved in your own browser.

**Gameplay:** swim, eat fish smaller than you, grow, and unlock bigger prey. Keep the
hunger bar up. Avoid jellyfish, sea mines and fishing hooks. Quick meals build a combo
multiplier. Golden fish are worth 8× points and heal you.

| Input    | Move                     | Boost                         | Pause     |
|----------|--------------------------|-------------------------------|-----------|
| Touch    | Hold & drag              | On-screen BOOST button        | II button |
| Mouse    | Point                    | Hold mouse button             | II button |
| Keyboard | WASD / arrows            | Space / Shift                 | Esc / P   |

## Project layout

```
public/                 static files served by Workers Assets (no build step)
  index.html            screens + HUD markup
  style.css             placeholder styles (CSS tokens at the top)
  js/main.js            entry: game loop, wiring, screen flow
  js/game.js            simulation: shark, fish AI, spawning, hazards, scoring
  js/config.js          ALL gameplay tuning (speeds, fish table, hazards, difficulty)
  js/art.js             render layer: sprites w/ placeholder fallbacks  ← design hand-off
  js/audio.js           sound layer: audio files w/ synthesized fallbacks
  js/input.js           keyboard / mouse / touch
  js/ui.js              HUD, overlay screens, best score (localStorage)
  assets/sprites/       designer sprites + manifest.json
  assets/audio/         sound files + manifest.json
  sw.js, manifest.webmanifest, icon*.{svg,png}   PWA
```

## Design hand-off

All visuals are isolated so design work drops in without touching game logic.

**Current art:** every creature, hazard and background layer has a realistic sprite, generated
from `art/sprites.js`. Edit that file and run `node art/build.js` (needs Playwright) to rebuild
the PNGs in `public/assets/sprites/` and the manifest. `art/preview.png` shows the full set, and
`art/svg/` holds vector copies (plus a seal and a sea turtle the game doesn't use yet).
`bg.seabed` is a 1920×300 strip drawn at the bottom of the world; `seabedY()` in `art.js`
follows its sand line.

**Sprites:** put images in `public/assets/sprites/` and register them in
`public/assets/sprites/manifest.json`. Anything not registered keeps its placeholder.

```json
{
  "shark":        { "src": "shark.png", "frames": 6, "fps": 10, "size": 4.6, "facing": "right" },
  "shark.bite":   { "src": "shark-bite.png", "size": 4.6 },
  "fish.minnow":  { "src": "minnow.png", "frames": 4, "fps": 12, "size": 3 },
  "fish.golden":  { "src": "golden.png", "size": 3 },
  "hazard.jelly": { "src": "jelly.png", "frames": 4, "fps": 6, "size": 2.4 },
  "bg.far":       { "src": "bg-far.png", "parallax": 0.3 }
}
```

- Keys: `shark`, `shark.bite`, `fish.<id>` (`minnow sardine reef mackerel snapper tuna grouper swordfish squid`), `fish.golden`, `hazard.jelly|mine|hook`, `bg.far|mid|near`.
- Animated sprites are horizontal strips (`frames` > 1).
- `size` is the drawn width as a multiple of the entity's collision radius. Fish radii are listed in `js/config.js`.
- `anchor` is the pivot point (default `[0.5, 0.5]`). `facing` is the direction the art faces (`right` by default).
- `bg.*` layers tile horizontally and are scaled to the full world depth (2400 units).

**Audio:** put files in `public/assets/audio/` and map them in `manifest.json`:
`chomp golden bump hurt boom levelup gameover music`. Each one replaces its synthesized placeholder.

**UI:** `index.html` + `style.css` are functional placeholders. Restyle freely, but keep
these element ids (used by `js/ui.js`): `hud score combo level bar-health bar-hunger
bar-stamina pause-btn boost-btn mute-btn screen-menu screen-pause screen-over
menu-best over-score over-best over-stats`. Buttons work through `data-action`
(`play pause resume menu mute`). Bars expose `--value` (0–1) and get a `.low` class below 25%.

## Run it locally

```bash
npm install
```

```bash
npm run dev
```

Then open http://localhost:8787. Any static file server pointed at `public/` also works.
Opening `index.html` straight from disk won't work, because browsers block JS modules on `file://`.
Add `?debug` to the URL to expose `window.__deepbite` for testing.

## Put it live on Cloudflare

1. Create a free account at dash.cloudflare.com.
2. Run these on your computer, inside this folder:

```bash
npm install
```

```bash
npx wrangler login
```

```bash
npm run deploy
```

Wrangler prints your live link (`https://sharkgame.<you>.workers.dev`). Run `npm run deploy` again after any change.

**No-terminal alternative:** in the Cloudflare dashboard go to **Workers & Pages → Create → Import a repository**,
pick this GitHub repo, set the deploy command to `npx wrangler deploy`, and save. Cloudflare redeploys on every push.

**Automatic deploys from GitHub Actions (optional):** `.github/workflows/deploy.yml` deploys on every push
to `main` once the repo secrets `CLOUDFLARE_API_TOKEN` (an "Edit Cloudflare Workers" token) and
`CLOUDFLARE_ACCOUNT_ID` are set.
