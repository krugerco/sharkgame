// Core simulation. No DOM access — renders via art.js and reports events
// (eat, hurt, levelup, gameover, ...) through `onEvent` for audio/UI/haptics.

import { WORLD, SHARK, STATS, FISH_TYPES, GOLDEN, HAZARD_TYPES, SPAWN, levelForRadius } from './config.js';
import { clamp, lerp, rand, randInt, dist2, damp, angleLerp } from './util.js';
import * as Art from './art.js';

export class Game {
  constructor(onEvent = () => {}) {
    this.onEvent = onEvent;
    this.demo = false; // attract mode: no damage, no hunger, no scoring events
    this.cam = { x: 0, y: 0, w: 1280, h: 720, scale: 1, zoom: 1 };
    this.screen = { w: 1280, h: 720 };
    this.reset();
  }

  reset() {
    this.time = 0;
    this.score = 0;
    this.xp = 0;
    this.eaten = 0;
    this.combo = 1;
    this.comboTimer = 0;
    this.level = 1;
    this.over = false;
    this.shake = 0;
    this.bumpCooldown = 0;
    this.shark = {
      x: 0, y: WORLD.depth * 0.25, vx: 0, vy: 0, angle: 0,
      r: SHARK.startRadius, targetR: SHARK.startRadius,
      health: 100, hunger: STATS.hungerMax, stamina: 100,
      invuln: 0, tailPhase: 0, mouth: 0, boosting: false,
    };
    this.fish = [];
    this.hazards = [];
    this.particles = [];
    this.popups = [];
    this.cam.x = this.shark.x;
    this.cam.y = this.shark.y;
    this.cam.zoom = 1;
    this.resize(this.screen.w, this.screen.h);
    this._fillInitial();
  }

  resize(w, h) {
    this.screen.w = w; this.screen.h = h;
    let scale = Math.min(w, h) / (WORLD.baseView * this.cam.zoom);
    if (h / scale > WORLD.depth * 0.9) scale = h / (WORLD.depth * 0.9);
    this.cam.scale = scale;
    this.cam.w = w / scale;
    this.cam.h = h / scale;
  }

  screenToWorld(px, py) {
    return { x: this.cam.x + (px - this.screen.w / 2) / this.cam.scale, y: this.cam.y + (py - this.screen.h / 2) / this.cam.scale };
  }

  _emit(type, data) { if (!this.demo) this.onEvent(type, data); }

  isEdible(f) { return f.r <= this.shark.r * SHARK.edibleRatio; }

  // ── update ────────────────────────────────────────────────────────────────

  update(dt, input) {
    if (this.over) { this._updateEffects(dt); return; }
    this.time += dt;
    this._updateShark(dt, input);
    this._updateCamera(dt);
    this._spawn();
    this._updateFish(dt);
    this._updateHazards(dt);
    if (!this.demo) this._updateStats(dt);
    this._updateEffects(dt);
  }

  _updateShark(dt, input) {
    const s = this.shark;
    let dir = input.keyDirection();
    let throttle = 1;
    if (!dir && input.pointer.active) {
      const p = this.screenToWorld(input.pointer.x, input.pointer.y);
      const dx = p.x - s.x, dy = p.y - s.y;
      const d = Math.hypot(dx, dy);
      if (d > s.r * 0.5) { dir = { x: dx / d, y: dy / d }; throttle = clamp(d / (s.r * 6), 0.15, 1); }
    }

    const wantBoost = input.boost && s.stamina > 1 && dir;
    s.boosting = Boolean(wantBoost);
    s.stamina = clamp(s.stamina + (s.boosting ? -SHARK.staminaDrain : SHARK.staminaRegen) * dt, 0, 100);

    const max = (SHARK.baseSpeed + s.r * SHARK.speedPerRadius) * (s.boosting ? SHARK.boostMultiplier : 1);
    const tx = dir ? dir.x * max * throttle : 0;
    const ty = dir ? dir.y * max * throttle : 0;
    const k = damp(SHARK.accel, dt);
    s.vx = lerp(s.vx, tx, k);
    s.vy = lerp(s.vy, ty, k);
    s.x += s.vx * dt;
    s.y += s.vy * dt;

    const minY = s.r * 0.6;
    const maxY = WORLD.depth - SHARK.seabedMargin - s.r * 0.4;
    if (s.y < minY) { s.y = minY; s.vy = Math.max(0, s.vy); }
    if (s.y > maxY) { s.y = maxY; s.vy = Math.min(0, s.vy); }

    const speed = Math.hypot(s.vx, s.vy);
    if (speed > 20) s.angle = angleLerp(s.angle, Math.atan2(s.vy, s.vx), damp(SHARK.turnRate, dt));
    s.tailPhase += dt * (3 + speed / 40);
    s.invuln = Math.max(0, s.invuln - dt);

    // grow smoothly
    s.r = lerp(s.r, s.targetR, damp(3, dt));

    if (s.boosting && Math.random() < dt * 25) {
      this._particle('bubble', s.x - Math.cos(s.angle) * s.r * 2, s.y - Math.sin(s.angle) * s.r * 2, rand(2, 5));
    }
  }

  _updateCamera(dt) {
    const s = this.shark;
    const targetZoom = Math.sqrt(s.r / SHARK.startRadius);
    if (Math.abs(targetZoom - this.cam.zoom) > 0.001) {
      this.cam.zoom = lerp(this.cam.zoom, targetZoom, damp(2, dt));
      this.resize(this.screen.w, this.screen.h);
    }
    const k = damp(5, dt);
    this.cam.x = lerp(this.cam.x, s.x + s.vx * 0.25, k);
    const halfH = this.cam.h / 2;
    const minY = -40 + halfH, maxY = WORLD.depth + 40 - halfH;
    const ty = minY > maxY ? WORLD.depth / 2 : clamp(s.y, minY, maxY);
    this.cam.y = lerp(this.cam.y, ty, k);
    this.shake = Math.max(0, this.shake - dt * 30);
  }

  // ── spawning ──────────────────────────────────────────────────────────────

  _offscreenX(extra = 0) {
    const side = Math.random() < 0.5 ? -1 : 1;
    return this.cam.x + side * (this.cam.w / 2 + 80 + extra + Math.random() * 400);
  }

  _pickFishType() {
    const r = this.shark.r;
    const weights = FISH_TYPES.map((t) => {
      const ratio = t.r / r;
      if (ratio < 0.2) return 0.25;
      if (ratio <= SHARK.edibleRatio) return 1;
      if (ratio < 1.8) return 0.4;
      return 0.06;
    });
    let total = weights.reduce((a, b) => a + b, 0) * Math.random();
    for (let i = 0; i < FISH_TYPES.length; i++) { total -= weights[i]; if (total <= 0) return FISH_TYPES[i]; }
    return FISH_TYPES[0];
  }

  _spawnSchool(x, y) {
    const type = this._pickFishType();
    const golden = Math.random() < GOLDEN.chance && type.r <= this.shark.r * SHARK.edibleRatio;
    const n = golden ? 1 : randInt(type.school[0], type.school[1]);
    const cy = y ?? rand(type.depth[0], type.depth[1]) * (WORLD.depth - 200) + 60;
    const angle = Math.random() < 0.5 ? rand(-0.3, 0.3) : Math.PI + rand(-0.3, 0.3);
    for (let i = 0; i < n; i++) {
      this.fish.push({
        type, golden,
        x: x + rand(-1, 1) * type.r * 4, y: clamp(cy + rand(-1, 1) * type.r * 3, 40, WORLD.depth - 120),
        r: type.r * rand(0.9, 1.1),
        angle: angle + rand(-0.15, 0.15),
        speed: type.speed * rand(0.85, 1.15) * (golden ? 1.4 : 1),
        phase: Math.random() * 10,
        fleeing: 0,
      });
    }
  }

  _spawnHazard(kind, x) {
    const def = HAZARD_TYPES[kind];
    const h = { kind, x, r: def.r * rand(0.85, 1.2), phase: Math.random() * 10, vx: 0, vy: 0 };
    if (kind === 'jelly') { h.y = rand(150, WORLD.depth - 250); h.vx = rand(-12, 12); }
    if (kind === 'mine') { h.anchorX = x; h.baseY = WORLD.depth - rand(200, 800); h.y = h.baseY; }
    if (kind === 'hook') { h.baseY = rand(150, Math.min(1200, WORLD.depth * 0.5)); h.y = h.baseY; h.baseX = x; }
    this.hazards.push(h);
  }

  _targets() {
    const area = (this.cam.w * this.cam.h) / (1280 * 720);
    const L = this.level - 1;
    return {
      fish: Math.round(clamp(SPAWN.fishPerScreen * area, 18, 70)),
      jelly: Math.round((SPAWN.jellyBase + L * SPAWN.jellyPerLevel) * Math.max(1, area * 0.6)),
      mine: Math.round(SPAWN.mineBase + L * SPAWN.minePerLevel),
      hook: Math.round(SPAWN.hookBase + L * SPAWN.hookPerLevel),
    };
  }

  _fillInitial() {
    const t = this._targets();
    let guard = 0;
    while (this.fish.length < t.fish && guard++ < 50) {
      let x;
      do { x = this.cam.x + rand(-1, 1) * (this.cam.w / 2 + 400); } while (Math.abs(x - this.shark.x) < 200);
      this._spawnSchool(x);
    }
  }

  _spawn() {
    const limit = this.cam.w / 2 + SPAWN.despawnMargin;
    this.fish = this.fish.filter((f) => Math.abs(f.x - this.cam.x) < limit);
    this.hazards = this.hazards.filter((h) => Math.abs(h.x - this.cam.x) < limit && !h.dead);

    const t = this._targets();
    if (this.fish.length < t.fish) this._spawnSchool(this._offscreenX());
    const counts = { jelly: 0, mine: 0, hook: 0 };
    for (const h of this.hazards) counts[h.kind]++;
    // give the player a grace period at the start
    if (this.time < 4) return;
    for (const kind of Object.keys(counts)) {
      if (counts[kind] < t[kind]) { this._spawnHazard(kind, this._offscreenX(200)); break; }
    }
  }

  // ── fish ──────────────────────────────────────────────────────────────────

  _updateFish(dt) {
    const s = this.shark;
    const mouthX = s.x + Math.cos(s.angle) * s.r * 1.7;
    const mouthY = s.y + Math.sin(s.angle) * s.r * 1.7;
    const fleeR = 160 + s.r * 4;
    let nearPrey = false;

    for (let i = this.fish.length - 1; i >= 0; i--) {
      const f = this.fish[i];
      const edible = this.isEdible(f);
      const dx = f.x - s.x, dy = f.y - s.y;
      const d2 = dx * dx + dy * dy;

      let spd = f.speed * 0.5;
      if (edible && d2 < fleeR * fleeR) {
        f.angle = angleLerp(f.angle, Math.atan2(dy, dx) + Math.sin(this.time * 3 + f.phase) * 0.6, damp(4, dt));
        spd = f.speed;
      } else {
        f.angle += Math.sin(this.time * 0.7 + f.phase) * 0.4 * dt;
      }
      // keep fish inside the water column
      if (f.y < 50) f.angle = angleLerp(f.angle, 0.6 * Math.sign(Math.cos(f.angle) || 1), damp(3, dt));
      if (f.y > WORLD.depth - 140) f.angle = angleLerp(f.angle, -0.6 * Math.sign(Math.cos(f.angle) || 1), damp(3, dt));

      f.x += Math.cos(f.angle) * spd * dt;
      f.y = clamp(f.y + Math.sin(f.angle) * spd * dt, 30, WORLD.depth - 110);

      const md2 = dist2(f.x, f.y, mouthX, mouthY);
      if (edible) {
        if (md2 < (s.r * 3) ** 2) nearPrey = true;
        if (md2 < (f.r * 0.8 + s.r * 0.6) ** 2) { this._eat(f); this.fish.splice(i, 1); }
      } else if (d2 < (f.r * 0.8 + s.r * 0.9) ** 2) {
        // too big: bounce off
        const d = Math.sqrt(d2) || 1;
        s.vx -= (dx / d) * 220; s.vy -= (dy / d) * 220;
        if (this.bumpCooldown <= 0) {
          this.bumpCooldown = 0.8;
          this._popup('Too big!', f.x, f.y - f.r, '#ffb3b3', 18);
          this._emit('bump');
        }
      }
    }
    this.bumpCooldown -= dt;
    s.mouth = lerp(s.mouth, nearPrey ? 1 : 0, damp(12, dt));
  }

  _eat(f) {
    const s = this.shark;
    if (this.demo) { for (let i = 0; i < 6; i++) this._particle('bit', f.x, f.y, rand(1.5, 3.5), Art.EFFECT_COLORS.bite); return; }
    this.combo = this.comboTimer > 0 ? Math.min(this.combo + 1, STATS.comboMax) : 1;
    this.comboTimer = STATS.comboWindow;
    const pts = Math.round(f.type.pts * (f.golden ? GOLDEN.ptsMultiplier : 1) * this.combo);
    this.score += pts;
    this.xp += f.type.pts * (f.golden ? 3 : 1);
    this.eaten++;
    s.hunger = clamp(s.hunger + 35 * Math.pow(f.r / s.r, 1.2) + 4, 0, STATS.hungerMax);
    if (f.golden) s.health = clamp(s.health + GOLDEN.heal, 0, 100);

    s.targetR = Math.min(SHARK.maxRadius, SHARK.startRadius * Math.sqrt(1 + this.xp / SHARK.growthXp));
    const newLevel = levelForRadius(s.targetR);
    if (newLevel > this.level) {
      this.level = newLevel;
      s.health = clamp(s.health + 15, 0, 100);
      this._popup(`LEVEL ${newLevel}`, s.x, s.y - s.r * 2.5, '#7fffd4', 34, 1.6);
      this._emit('levelup', { level: newLevel });
    }

    const color = f.golden ? Art.EFFECT_COLORS.golden : Art.EFFECT_COLORS.bite;
    for (let i = 0; i < 6; i++) this._particle('bit', f.x, f.y, rand(1.5, 3.5), color);
    this._popup(`+${pts}${this.combo > 1 ? ` x${this.combo}` : ''}`, f.x, f.y - f.r, f.golden ? '#ffd23f' : '#fff', 16 + Math.min(this.combo, 8));
    this._emit(f.golden ? 'golden' : 'eat', { combo: this.combo });
  }

  // ── hazards ───────────────────────────────────────────────────────────────

  _updateHazards(dt) {
    const s = this.shark;
    const hx = s.x + Math.cos(s.angle) * s.r * 1.3;
    const hy = s.y + Math.sin(s.angle) * s.r * 1.3;
    for (const h of this.hazards) {
      if (h.kind === 'jelly') {
        h.x += h.vx * dt;
        h.y += Math.sin(this.time * 1.2 + h.phase) * 18 * dt;
      } else if (h.kind === 'mine') {
        h.y = h.baseY + Math.sin(this.time + h.phase) * 8;
      } else if (h.kind === 'hook') {
        h.x = h.baseX + Math.sin(this.time * 0.8 + h.phase) * 14;
        h.y = h.baseY + Math.sin(this.time * 0.5 + h.phase) * 30;
      }
      if (s.invuln > 0 || h.dead || this.demo) continue;
      const hitBody = dist2(h.x, h.y, s.x, s.y) < (h.r * 0.8 + s.r * 0.8) ** 2;
      const hitHead = dist2(h.x, h.y, hx, hy) < (h.r * 0.8 + s.r * 0.6) ** 2;
      if (hitBody || hitHead) this._hitHazard(h);
    }
  }

  _hitHazard(h) {
    const s = this.shark;
    const def = HAZARD_TYPES[h.kind];
    const dx = s.x - h.x, dy = s.y - h.y;
    const d = Math.hypot(dx, dy) || 1;
    s.vx += (dx / d) * def.knockback;
    s.vy += (dy / d) * def.knockback;
    s.health -= def.damage;
    s.invuln = SHARK.invulnTime;
    this.combo = 1; this.comboTimer = 0;
    this.shake = h.kind === 'mine' ? 18 : 8;
    this._popup(`-${def.damage}`, s.x, s.y - s.r * 1.5, '#ff6b6b', 22);
    if (h.kind === 'mine') {
      h.dead = true;
      for (let i = 0; i < 30; i++) this._particle('bit', h.x, h.y, rand(3, 7), Art.EFFECT_COLORS.boom, 400);
      // blast also catches nearby fish
      for (let i = this.fish.length - 1; i >= 0; i--) {
        if (dist2(this.fish[i].x, this.fish[i].y, h.x, h.y) < def.blastRadius ** 2) this.fish.splice(i, 1);
      }
      this._emit('boom');
    } else {
      if (h.kind === 'hook') h.dead = true;
      for (let i = 0; i < 10; i++) this._particle('bit', s.x, s.y, rand(2, 4), Art.EFFECT_COLORS.hurt);
      this._emit('hurt', { kind: h.kind });
    }
    if (s.health <= 0) this._gameOver();
  }

  // ── stats & effects ───────────────────────────────────────────────────────

  _updateStats(dt) {
    const s = this.shark;
    this.comboTimer = Math.max(0, this.comboTimer - dt);
    if (this.comboTimer === 0) this.combo = 1;
    s.hunger = Math.max(0, s.hunger - (STATS.hungerDrainBase + (this.level - 1) * STATS.hungerDrainPerLevel) * dt);
    if (s.hunger <= 0) s.health -= STATS.starveDamage * dt;
    else if (s.hunger > 70) s.health = Math.min(100, s.health + STATS.regenWhenFed * dt);
    if (s.health <= 0) this._gameOver();
  }

  _gameOver() {
    if (this.over) return;
    this.over = true;
    this.shark.health = 0;
    for (let i = 0; i < 25; i++) this._particle('bubble', this.shark.x, this.shark.y, rand(2, 7));
    this._emit('gameover', this.summary());
  }

  summary() {
    return {
      score: this.score, level: this.level, eaten: this.eaten,
      duration: Math.round(this.time), size: Math.round(this.shark.r),
    };
  }

  _particle(kind, x, y, size, color, spread = 120) {
    const a = Math.random() * Math.PI * 2;
    const v = Math.random() * spread;
    this.particles.push({
      kind, x, y, size, color,
      vx: Math.cos(a) * v, vy: Math.sin(a) * v - (kind === 'bubble' ? 40 : 0),
      life: kind === 'bubble' ? rand(0.8, 1.6) : rand(0.3, 0.7), max: 1,
    });
    const p = this.particles[this.particles.length - 1];
    p.max = p.life;
    if (this.particles.length > 400) this.particles.shift();
  }

  _popup(text, x, y, color, size = 18, life = 0.9) {
    this.popups.push({ text, x, y, color, size, life, max: life });
  }

  _updateEffects(dt) {
    for (const p of this.particles) {
      p.life -= dt;
      p.x += p.vx * dt; p.y += p.vy * dt;
      if (p.kind === 'bubble') { p.vy -= 60 * dt; p.vx *= 0.96; } else { p.vx *= 0.9; p.vy *= 0.9; }
    }
    this.particles = this.particles.filter((p) => p.life > 0 && p.y > 0);
    for (const p of this.popups) { p.life -= dt; p.y -= 40 * dt; }
    this.popups = this.popups.filter((p) => p.life > 0);
  }

  // ── render ────────────────────────────────────────────────────────────────

  render(ctx, dpr) {
    const { cam, screen } = this;
    const k = dpr * cam.scale;
    const sx = this.shake ? (Math.random() - 0.5) * this.shake : 0;
    const sy = this.shake ? (Math.random() - 0.5) * this.shake : 0;
    ctx.setTransform(k, 0, 0, k, dpr * screen.w / 2 - k * (cam.x + sx), dpr * screen.h / 2 - k * (cam.y + sy));

    const t = this.time;
    Art.drawBackground(ctx, cam, t);
    const left = cam.x - cam.w / 2 - 150, right = cam.x + cam.w / 2 + 150;
    for (const h of this.hazards) if (h.x > left && h.x < right) Art.drawHazard(ctx, h, t);
    for (const f of this.fish) if (f.x > left && f.x < right) Art.drawFish(ctx, f, t, this.isEdible(f));
    if (!this.over) Art.drawShark(ctx, this.shark, t);
    for (const p of this.particles) Art.drawParticle(ctx, p);
    Art.drawDepthFog(ctx, cam);
    for (const p of this.popups) Art.drawPopup(ctx, p);
  }
}
