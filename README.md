# Deep Bite (2D shark game)

A simple 2D shark game that runs in any browser: phones, tablets, desktops.
It's plain HTML, CSS and JavaScript. There's no server code, no database and no build step.
It is hosted as static files on **Cloudflare**, and your best score is saved in your own browser.

**Gameplay:** swim, eat fish smaller than you, grow, and unlock bigger prey. Keep the
hunger bar up. Avoid jellyfish, sea mines and fishing hooks. Quick meals build a combo
multiplier. Golden fish are worth 8× points and heal you; sea turtles heal too.

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
  js/art.js             render layer: maps game entities to sprites  ← design hand-off
  js/audio.js           sound layer: audio files w/ synthesized fallbacks
  js/input.js           keyboard / mouse / touch
  js/ui.js              HUD, overlay screens, best score (localStorage)
  assets/sprites/       designer sprite set (png/svg, manifest.json, src/ generator)
  assets/audio/         sound files + manifest.json
  sw.js, manifest.webmanifest, icon*.{svg,png}   PWA
```

## Design hand-off

All visuals are isolated so design work drops in without touching game logic.

**Sprites:** the designer's set lives in `public/assets/sprites/` (sources in `src/`,
rebuilt with `node public/assets/sprites/src/build.js`). The game reads its `manifest.json`
directly. `SPRITE_MAP` at the top of `js/art.js` picks which sprite each game entity uses
and how big to draw it. One sprite can be reused at several sizes or tints; for example, tuna art is used for
both `tuna` and the larger `bluefin`. Anything without a sprite (currently mines and hooks) keeps a
placeholder shape. To add art: add it to the sprite set, rebuild, then add a line to `SPRITE_MAP`.

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

**Dashboard alternative (what this project uses):** in the Cloudflare dashboard go to **Workers & Pages → Create → Import a repository**,
pick this GitHub repo, set the deploy command to `npx wrangler deploy`, and save. Cloudflare redeploys on every push.

**Live deploys:** the `sharkgame` Worker is connected to this repo through Cloudflare's Git
integration, so every push to `main` redeploys the game automatically.
