# Shark Game 2D sprites

Realistic side-view art for the game. All creatures **face right**; flip horizontally (`scaleX = -1`) to face left.

| Sprite | Size (px) | Role |
|---|---|---|
| `shark` | 512×256 | Player: great white, mouth closed |
| `shark_bite` | 512×256 | Player: bite frame (jaw open, teeth showing). Same size and anchor as `shark`, so swap textures directly |
| `sardine` | 128×64 | Small prey (schools) |
| `tuna` | 256×128 | Large prey (bluefin) |
| `seal` | 256×128 | Large prey (harbor seal) |
| `turtle` | 256×128 | Neutral / bonus (green sea turtle) |
| `jellyfish` | 128×256 | Hazard (moon jelly) |
| `minnow` | 256×128 | Small prey (anchovy-type, schools) |
| `reef` | 256×128 | Small prey (butterflyfish) |
| `mackerel` | 256×128 | Prey (Atlantic mackerel) |
| `snapper` | 256×128 | Prey (red snapper) |
| `grouper` | 256×128 | Large prey (mottled grouper) |
| `swordfish` | 384×128 | Large prey; the bill extends past the body |
| `squid` | 256×128 | Large prey; swims mantle-first, arms trailing |
| `golden` | 256×128 | Bonus fish (golden trevally); glow is part of the art |
| `mine` | 128×128 | Hazard (moored sea mine); spikes reach 58px from centre |
| `hook` | 64×128 | Hazard (baited hook); line attaches at the eye, top centre |
| `rock_spires` | 1920×1080 | Distant rock silhouettes, transparent; tiles horizontally |
| `background_ocean` | 1920×1080 | Full-screen water: light rays, caustics, floating particles |
| `seabed` | 1920×300 | Bottom strip with rocks and kelp; tiles horizontally |

## Files

- `png/NAME.png` and `png/NAME@2x.png`: transparent PNGs, ready for any engine.
- `svg/NAME.svg`: vector versions (scale cleanly, can be inlined in HTML).
- `manifest.json`: path, size, **anchor** (normalized pivot; e.g. the shark pivots at its center of mass, the jellyfish at its bell) and role for every sprite. Load it to avoid hard-coding sizes.

## Hit boxes

Suggested collision ellipses, in sprite pixels:

- shark: center (300,132), radii 200×38. Mouth (bite zone): center (470,145), radius 28
- sardine: center (68,31), radii 50×13
- tuna: center (150,66), radii 100×30
- seal: center (140,66), radii 105×26
- minnow / mackerel / snapper / grouper / squid / golden: centered on the anchor, radius ≈ 0.42 × body length (≈100px)
- reef: center (145,64), radii 80×42
- swordfish: center (159,64), radii 118×22 (bill not included)
- mine: center (64,64), radius 40 (58 with spikes)
- turtle: center (150,62), radii 90×28
- jellyfish: bell center (64,45), radii 54×34; tentacles x 26–104, y 70–244

## Editing

All art is generated from `src/sprites.js`. After editing, rebuild:

```bash
node public/assets/sprites/src/build.js
```

This needs Playwright (used to render the PNGs). `--svg-only` skips the PNG render.
