// ─────────────────────────────────────────────────────────────────────────────
// RENDER LAYER — the only file that decides how things look.
//
// Game logic (game.js) calls the draw* functions below with entity data in
// WORLD units. Every draw call first looks for a sprite registered in
//   /assets/sprites/manifest.json
// and falls back to a simple placeholder shape if none is provided.
//
// Sprite manifest keys:
//   shark, shark.bite               (bite = mouth-open variant, optional)
//   fish.<id>  (ids from config.js FISH_TYPES), fish.golden
//   hazard.jelly, hazard.mine, hazard.hook
//   bg.far, bg.mid, bg.near         (tiling parallax layers, optional)
//   bg.seabed                       (1920x300 bottom strip, drawn 1:1 at the seabed)
//
// Sprite entry:
//   { "src": "shark.png",   // relative to /assets/sprites/
//     "frames": 1,          // horizontal strip frame count
//     "fps": 8,
//     "size": 4.6,          // drawn width in multiples of the entity radius
//     "facing": "right",    // which way the art faces
//     "anchor": [0.5, 0.5], // pivot within the frame (0..1)
//     "parallax": 0.3 }     // bg.* only: scroll factor
// ─────────────────────────────────────────────────────────────────────────────

import { WORLD } from './config.js';
import { hash } from './util.js';

const sprites = {};

export async function loadArt() {
  try {
    const res = await fetch('/assets/sprites/manifest.json');
    if (!res.ok) return;
    const manifest = await res.json();
    await Promise.all(Object.entries(manifest).map(([key, def]) => new Promise((resolve) => {
      const img = new Image();
      img.onload = () => { sprites[key] = { frames: 1, fps: 8, size: 3, facing: 'right', anchor: [0.5, 0.5], parallax: 0.5, ...def, img }; resolve(); };
      img.onerror = () => { console.warn('sprite failed', key); resolve(); };
      img.src = `/assets/sprites/${def.src}`;
    })));
  } catch { /* no manifest — placeholders only */ }
}

// Draws a registered sprite centred on the current transform origin, facing +x.
function drawSprite(ctx, key, r, t) {
  const s = sprites[key];
  if (!s) return false;
  const fw = s.img.width / s.frames;
  const fh = s.img.height;
  const w = r * s.size;
  const h = w * (fh / fw);
  const frame = s.frames > 1 ? Math.floor(t * s.fps) % s.frames : 0;
  ctx.save();
  if (s.facing === 'left') ctx.scale(-1, 1);
  ctx.drawImage(s.img, frame * fw, 0, fw, fh, -w * s.anchor[0], -h * s.anchor[1], w, h);
  ctx.restore();
  return true;
}

// Orient so the entity faces its heading but never renders upside-down.
function orient(ctx, x, y, angle) {
  ctx.translate(x, y);
  ctx.rotate(angle);
  if (Math.cos(angle) < 0) ctx.scale(1, -1);
}

// ── Background ───────────────────────────────────────────────────────────────

const PLACEHOLDER = {
  waterTop: '#2b7fb3', waterBottom: '#03101f', sky: '#9fd3f0',
  sand: '#5a5038', rock: '#0b2a40',
};

// bg.seabed is a 1920x300 strip drawn 1:1 in world units with its top at
// depth - 180. Its sand line follows the same curve as art/sprites.js seabed().
const SEABED_TILE = 1920, SEABED_TOP = 180;

export function seabedY(x) {
  if (sprites['bg.seabed']) {
    const u = (((x % SEABED_TILE) + SEABED_TILE) % SEABED_TILE) / SEABED_TILE;
    return WORLD.depth - 60 + Math.sin(u * Math.PI * 4) * 22 + Math.sin(u * Math.PI * 10) * 9;
  }
  return WORLD.depth - 60 + Math.sin(x * 0.004) * 25 + Math.sin(x * 0.013) * 10;
}

export function drawBackground(ctx, cam, t) {
  const { x: cx, y: cy, w, h } = cam;
  const left = cx - w / 2, top = cy - h / 2;

  // water column
  const g = ctx.createLinearGradient(0, 0, 0, WORLD.depth);
  g.addColorStop(0, PLACEHOLDER.waterTop);
  g.addColorStop(1, PLACEHOLDER.waterBottom);
  ctx.fillStyle = g;
  ctx.fillRect(left, Math.max(0, top), w, h);
  if (top < 0) { ctx.fillStyle = PLACEHOLDER.sky; ctx.fillRect(left, top, w, -top); }

  // optional sprite parallax layers
  for (const key of ['bg.far', 'bg.mid', 'bg.near']) {
    const s = sprites[key];
    if (!s) continue;
    const scaleH = WORLD.depth / s.img.height;
    const tw = s.img.width * scaleH;
    const offset = cx * (1 - s.parallax);
    const start = Math.floor((left - offset) / tw) * tw + offset;
    for (let x = start; x < left + w; x += tw) ctx.drawImage(s.img, x, 0, tw, WORLD.depth);
  }

  // placeholder: distant rocks (parallax 0.5)
  if (!sprites['bg.far']) {
    ctx.fillStyle = PLACEHOLDER.rock;
    const p = 0.5, step = 300;
    const off = cx * p;
    for (let i = Math.floor((left - off) / step) - 1; i < (left + w - off) / step + 1; i++) {
      const hgt = 150 + hash(i) * 350;
      const x = i * step + off;
      ctx.beginPath();
      ctx.moveTo(x - 40, WORLD.depth);
      ctx.lineTo(x + 60 + hash(i + 7) * 80, WORLD.depth - hgt);
      ctx.lineTo(x + step + 40, WORLD.depth);
      ctx.fill();
    }
  }

  // surface line
  if (top < 40) {
    ctx.strokeStyle = 'rgba(255,255,255,0.6)';
    ctx.lineWidth = 3;
    ctx.beginPath();
    for (let x = left - 20; x <= left + w + 20; x += 20) {
      const y = Math.sin(x * 0.02 + t * 2) * 4;
      x === left - 20 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    }
    ctx.stroke();
  }

  // seabed sprite strip (rocks, kelp, sand)
  const bed = sprites['bg.seabed'];
  if (bed && top + h > WORLD.depth - SEABED_TOP) {
    const y = WORLD.depth - SEABED_TOP;
    ctx.fillStyle = '#22322f';
    ctx.fillRect(left, y + bed.img.height - 2, w, Math.max(0, top + h - (y + bed.img.height - 2)));
    for (let x = Math.floor(left / SEABED_TILE) * SEABED_TILE; x < left + w; x += SEABED_TILE) {
      ctx.drawImage(bed.img, x, y, SEABED_TILE, bed.img.height);
    }
  }

  // placeholder seabed
  if (!bed && top + h > WORLD.depth - 120) {
    ctx.fillStyle = PLACEHOLDER.sand;
    ctx.beginPath();
    ctx.moveTo(left - 20, WORLD.depth + 200);
    for (let x = left - 20; x <= left + w + 40; x += 30) ctx.lineTo(x, seabedY(x));
    ctx.lineTo(left + w + 40, WORLD.depth + 200);
    ctx.fill();

    // placeholder seaweed
    ctx.strokeStyle = '#2f6b3a';
    ctx.lineWidth = 6;
    ctx.lineCap = 'round';
    const step = 70;
    for (let i = Math.floor(left / step) - 1; i < (left + w) / step + 1; i++) {
      if (hash(i * 3.1) < 0.55) continue;
      const x = i * step + hash(i) * 40;
      const base = seabedY(x);
      const hgt = 60 + hash(i * 1.7) * 140;
      ctx.beginPath();
      ctx.moveTo(x, base);
      for (let k = 1; k <= 6; k++) {
        const yy = base - (hgt * k) / 6;
        ctx.lineTo(x + Math.sin(t * 1.5 + i + k * 0.6) * k * 3, yy);
      }
      ctx.stroke();
    }
  }
}

// Depth fog drawn over the world (makes deeper water darker).
export function drawDepthFog(ctx, cam) {
  const g = ctx.createLinearGradient(0, 0, 0, WORLD.depth);
  g.addColorStop(0, 'rgba(2,10,25,0)');
  g.addColorStop(1, 'rgba(2,10,25,0.55)');
  ctx.fillStyle = g;
  ctx.fillRect(cam.x - cam.w / 2, Math.max(0, cam.y - cam.h / 2), cam.w, cam.h);
}

// ── Shark ────────────────────────────────────────────────────────────────────

export function drawShark(ctx, s, t) {
  ctx.save();
  orient(ctx, s.x, s.y, s.angle);
  if (s.invuln > 0 && Math.floor(t * 20) % 2 === 0) ctx.globalAlpha = 0.45;

  const key = s.mouth > 0.5 && sprites['shark.bite'] ? 'shark.bite' : 'shark';
  if (!drawSprite(ctx, key, s.r, t)) placeholderShark(ctx, s, t);
  ctx.restore();
}

function placeholderShark(ctx, s, t) {
  const r = s.r;
  const sway = Math.sin(s.tailPhase) * 0.25 * r;
  // body
  ctx.fillStyle = '#6f8799';
  ctx.beginPath();
  ctx.moveTo(2.0 * r, 0);
  ctx.quadraticCurveTo(1.0 * r, -0.95 * r, -1.0 * r, -0.45 * r);
  ctx.lineTo(-1.9 * r, -0.12 * r);
  ctx.lineTo(-2.6 * r, -0.9 * r + sway);  // tail top
  ctx.lineTo(-2.25 * r, sway * 0.5);
  ctx.lineTo(-2.5 * r, 0.65 * r + sway);  // tail bottom
  ctx.lineTo(-1.9 * r, 0.12 * r);
  ctx.lineTo(-1.0 * r, 0.45 * r);
  ctx.quadraticCurveTo(1.0 * r, 0.85 * r, 2.0 * r, 0);
  ctx.fill();
  // belly
  ctx.fillStyle = '#d9e2e8';
  ctx.beginPath();
  ctx.moveTo(1.9 * r, 0.12 * r);
  ctx.quadraticCurveTo(0.6 * r, 0.75 * r, -1.2 * r, 0.35 * r);
  ctx.quadraticCurveTo(0.4 * r, 0.35 * r, 1.9 * r, 0.12 * r);
  ctx.fill();
  // fins
  ctx.fillStyle = '#5a7183';
  ctx.beginPath();
  ctx.moveTo(0.4 * r, -0.7 * r); ctx.lineTo(-0.2 * r, -1.6 * r); ctx.lineTo(-0.6 * r, -0.55 * r); ctx.fill();
  ctx.beginPath();
  ctx.moveTo(0.6 * r, 0.45 * r); ctx.lineTo(-0.1 * r, 1.2 * r); ctx.lineTo(0.1 * r, 0.45 * r); ctx.fill();
  // eye
  ctx.fillStyle = '#111';
  ctx.beginPath(); ctx.arc(1.25 * r, -0.22 * r, 0.11 * r, 0, Math.PI * 2); ctx.fill();
  // mouth
  if (s.mouth > 0.05) {
    ctx.fillStyle = '#3a0d12';
    ctx.beginPath();
    ctx.moveTo(1.95 * r, 0.05 * r);
    ctx.lineTo(1.1 * r, 0.3 * r);
    ctx.lineTo(1.85 * r, (0.15 + 0.5 * s.mouth) * r);
    ctx.fill();
  } else {
    ctx.strokeStyle = '#2a3a46'; ctx.lineWidth = Math.max(1, r * 0.06);
    ctx.beginPath(); ctx.moveTo(1.85 * r, 0.18 * r); ctx.lineTo(1.2 * r, 0.32 * r); ctx.stroke();
  }
}

// ── Fish ─────────────────────────────────────────────────────────────────────

const FISH_COLORS = {
  minnow: '#c9e4f5', sardine: '#9fc7e0', reef: '#f39b3a', mackerel: '#4f8fae',
  snapper: '#d9534f', tuna: '#2f4f75', grouper: '#7a6a4f', swordfish: '#36628a', squid: '#a65fb5',
};

export function drawFish(ctx, f, t, edible) {
  ctx.save();
  orient(ctx, f.x, f.y, f.angle);
  const key = f.golden ? 'fish.golden' : `fish.${f.type.id}`;
  if (!drawSprite(ctx, key, f.r, t + f.phase)) placeholderFish(ctx, f, t, edible);
  else if (!edible) {
    // gameplay cue kept with real art: a faint red rim on fish too big to eat
    ctx.strokeStyle = 'rgba(255,90,90,0.35)'; ctx.lineWidth = Math.max(1.5, f.r * 0.06);
    ctx.beginPath(); ctx.ellipse(0, 0, f.r * 1.25, f.r * 0.62, 0, 0, Math.PI * 2); ctx.stroke();
  }
  ctx.restore();
}

function placeholderFish(ctx, f, t, edible) {
  const r = f.r;
  const sway = Math.sin(t * 10 + f.phase) * 0.25 * r;
  const color = f.golden ? '#ffd23f' : FISH_COLORS[f.type.id] || '#ccc';
  if (f.golden) { ctx.shadowColor = '#ffd23f'; ctx.shadowBlur = 20; }
  ctx.fillStyle = color;
  if (f.type.id === 'squid') {
    ctx.beginPath(); ctx.ellipse(0.3 * r, 0, r * 0.9, r * 0.35, 0, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = color; ctx.lineWidth = r * 0.08;
    for (let i = -2; i <= 2; i++) {
      ctx.beginPath(); ctx.moveTo(-0.5 * r, i * 0.08 * r);
      ctx.quadraticCurveTo(-1.1 * r, i * 0.15 * r + sway, -1.7 * r, i * 0.22 * r - sway); ctx.stroke();
    }
  } else {
    ctx.beginPath(); ctx.ellipse(0, 0, r, r * 0.5, 0, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath();
    ctx.moveTo(-0.8 * r, 0); ctx.lineTo(-1.5 * r, -0.5 * r + sway); ctx.lineTo(-1.5 * r, 0.5 * r + sway); ctx.fill();
    if (f.type.id === 'swordfish') {
      ctx.strokeStyle = color; ctx.lineWidth = r * 0.06;
      ctx.beginPath(); ctx.moveTo(r, 0); ctx.lineTo(1.9 * r, -0.05 * r); ctx.stroke();
    }
  }
  ctx.shadowBlur = 0;
  ctx.fillStyle = '#111';
  ctx.beginPath(); ctx.arc(0.55 * r, -0.12 * r, Math.max(1.2, r * 0.09), 0, Math.PI * 2); ctx.fill();
  // placeholder affordance: inedible fish get a red outline
  if (!edible) {
    ctx.strokeStyle = 'rgba(255,80,80,0.55)'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.ellipse(0, 0, r * 1.05, r * 0.6, 0, 0, Math.PI * 2); ctx.stroke();
  }
}

// ── Hazards ──────────────────────────────────────────────────────────────────

export function drawHazard(ctx, h, t) {
  if (h.kind === 'mine') {
    // chain to seabed
    ctx.strokeStyle = 'rgba(40,40,40,0.8)'; ctx.lineWidth = 2; ctx.setLineDash([5, 4]);
    ctx.beginPath(); ctx.moveTo(h.x, h.y); ctx.lineTo(h.anchorX, seabedY(h.anchorX)); ctx.stroke();
    ctx.setLineDash([]);
  } else if (h.kind === 'hook') {
    ctx.strokeStyle = 'rgba(230,230,230,0.7)'; ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.moveTo(h.x, -400); ctx.lineTo(h.x, h.y - h.r); ctx.stroke();
  }

  ctx.save();
  ctx.translate(h.x, h.y);
  if (!drawSprite(ctx, `hazard.${h.kind}`, h.r, t + h.phase)) {
    if (h.kind === 'jelly') {
      const pulse = 1 + Math.sin(t * 3 + h.phase) * 0.08;
      ctx.fillStyle = 'rgba(240,120,220,0.65)';
      ctx.beginPath(); ctx.ellipse(0, 0, h.r * pulse, h.r * 0.7 / pulse, 0, Math.PI, 0); ctx.fill();
      ctx.strokeStyle = 'rgba(240,150,230,0.6)'; ctx.lineWidth = 2;
      for (let i = -2; i <= 2; i++) {
        ctx.beginPath(); ctx.moveTo(i * h.r * 0.35, 0);
        for (let k = 1; k <= 4; k++) ctx.lineTo(i * h.r * 0.35 + Math.sin(t * 3 + k + i) * 4, k * h.r * 0.4);
        ctx.stroke();
      }
    } else if (h.kind === 'mine') {
      ctx.fillStyle = '#2b2f33';
      for (let i = 0; i < 8; i++) {
        const a = (i / 8) * Math.PI * 2;
        ctx.fillRect(Math.cos(a) * h.r - 3, Math.sin(a) * h.r - 3, 6, 6);
      }
      ctx.beginPath(); ctx.arc(0, 0, h.r * 0.85, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = Math.sin(t * 6 + h.phase) > 0 ? '#ff3b30' : '#5a1210';
      ctx.beginPath(); ctx.arc(0, -h.r * 0.3, 4, 0, Math.PI * 2); ctx.fill();
    } else if (h.kind === 'hook') {
      ctx.strokeStyle = '#d0d4d8'; ctx.lineWidth = 3;
      ctx.beginPath(); ctx.moveTo(0, -h.r); ctx.lineTo(0, h.r * 0.4); ctx.arc(-h.r * 0.5, h.r * 0.4, h.r * 0.5, 0, Math.PI); ctx.stroke();
      ctx.fillStyle = '#c0605a';
      ctx.beginPath(); ctx.ellipse(-h.r * 0.5, h.r * 0.9, h.r * 0.45, h.r * 0.2, 0, 0, Math.PI * 2); ctx.fill();
    }
  }
  ctx.restore();
}

// ── Effects ──────────────────────────────────────────────────────────────────

export function drawParticle(ctx, p) {
  const a = Math.max(0, p.life / p.max);
  ctx.globalAlpha = a;
  if (p.kind === 'bubble') {
    ctx.strokeStyle = 'rgba(220,240,255,0.9)'; ctx.lineWidth = 1.2;
    ctx.beginPath(); ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2); ctx.stroke();
  } else {
    ctx.fillStyle = p.color || '#fff';
    ctx.beginPath(); ctx.arc(p.x, p.y, p.size * (0.5 + a * 0.5), 0, Math.PI * 2); ctx.fill();
  }
  ctx.globalAlpha = 1;
}

export function drawPopup(ctx, p) {
  const a = Math.max(0, p.life / p.max);
  ctx.globalAlpha = a;
  ctx.font = `bold ${p.size}px system-ui, sans-serif`;
  ctx.textAlign = 'center';
  ctx.lineWidth = 3;
  ctx.strokeStyle = 'rgba(0,0,0,0.5)';
  ctx.strokeText(p.text, p.x, p.y);
  ctx.fillStyle = p.color || '#fff';
  ctx.fillText(p.text, p.x, p.y);
  ctx.globalAlpha = 1;
}

export const EFFECT_COLORS = { bite: '#e9eef2', golden: '#ffd23f', hurt: '#ff6b6b', boom: '#ffb347' };
