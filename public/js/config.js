// Gameplay tuning. Pure data — no rendering here (see art.js for visuals).

export const WORLD = {
  depth: 2400,          // world height in units (y=0 surface, y=depth seabed)
  seabedMargin: 90,     // shark can't go deeper than depth - margin
  baseView: 720,        // units visible on the short screen axis at starting size
};

export const SHARK = {
  startRadius: 16,
  maxRadius: 72,
  baseSpeed: 240,       // units/s
  speedPerRadius: 2,
  boostMultiplier: 1.8,
  accel: 6,             // velocity smoothing factor
  turnRate: 8,          // heading smoothing factor
  staminaDrain: 35,     // per second while boosting
  staminaRegen: 16,
  edibleRatio: 0.85,    // can eat fish with radius <= shark.r * ratio
  growthXp: 400,        // r = start * sqrt(1 + xp / growthXp)
  invulnTime: 1.0,
};

export const STATS = {
  hungerMax: 100,
  hungerDrainBase: 2.5, // per second
  hungerDrainPerLevel: 0.35,
  starveDamage: 8,      // hp/s when hunger is empty
  regenWhenFed: 2,      // hp/s while hunger > 70
  comboWindow: 1.6,     // seconds
  comboMax: 8,
};

// r = collision/size radius (≈ half body length). depth = [min,max] fraction of world depth.
// Visuals for each id are chosen in art.js (SPRITE_MAP). heal = HP restored when eaten.
export const FISH_TYPES = [
  { id: 'minnow',    r: 7,  speed: 95,  pts: 10,  school: [5, 9], depth: [0.0, 0.5] },
  { id: 'sardine',   r: 10, speed: 115, pts: 20,  school: [4, 7], depth: [0.05, 0.6] },
  { id: 'reef',      r: 12, speed: 85,  pts: 30,  school: [1, 3], depth: [0.35, 0.97] },
  { id: 'mackerel',  r: 15, speed: 130, pts: 45,  school: [3, 5], depth: [0.1, 0.7] },
  { id: 'snapper',   r: 20, speed: 100, pts: 80,  school: [1, 2], depth: [0.4, 0.95] },
  { id: 'tuna',      r: 24, speed: 150, pts: 120, school: [2, 4], depth: [0.1, 0.7] },
  { id: 'turtle',    r: 30, speed: 60,  pts: 200, school: [1, 1], depth: [0.1, 0.6], heal: 20 },
  { id: 'seal',      r: 38, speed: 140, pts: 350, school: [1, 2], depth: [0.0, 0.4] },
  { id: 'grouper',   r: 44, speed: 70,  pts: 450, school: [1, 1], depth: [0.6, 0.97] },
  { id: 'bluefin',   r: 50, speed: 165, pts: 600, school: [1, 2], depth: [0.2, 0.8] },
  { id: 'swordfish', r: 54, speed: 175, pts: 800, school: [1, 1], depth: [0.2, 0.7] },
  { id: 'squid',     r: 60, speed: 90,  pts: 1100, school: [1, 1], depth: [0.7, 0.97] },
  { id: 'bigseal',   r: 62, speed: 120, pts: 1000, school: [1, 1], depth: [0.0, 0.5] },
];

export const GOLDEN = { chance: 0.02, ptsMultiplier: 8, heal: 25 };

export const HAZARD_TYPES = {
  jelly: { r: 26, damage: 12, knockback: 260 },
  mine:  { r: 26, damage: 30, knockback: 520, blastRadius: 120 },
  hook:  { r: 14, damage: 10, knockback: 200 },
};

// Target on-screen counts; scaled by level inside game.js.
export const SPAWN = {
  fishPerScreen: 28,
  jellyBase: 2, jellyPerLevel: 1,
  mineBase: 1, minePerLevel: 0.5,
  hookBase: 1, hookPerLevel: 0.34,
  despawnMargin: 900,
};

export const levelForRadius = (r) => 1 + Math.floor((r - SHARK.startRadius) / 6);
