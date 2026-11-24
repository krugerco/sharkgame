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
export const FISH_TYPES = [
  { id: 'minnow',    r: 7,  speed: 95,  pts: 10,   school: [5, 9], depth: [0.0, 0.5] },
  { id: 'sardine',   r: 10, speed: 115, pts: 20,   school: [4, 7], depth: [0.05, 0.6] },
  { id: 'reef',      r: 13, speed: 85,  pts: 35,   school: [1, 3], depth: [0.3, 0.95] },
  { id: 'mackerel',  r: 17, speed: 130, pts: 60,   school: [3, 5], depth: [0.1, 0.6] },
  { id: 'snapper',   r: 22, speed: 100, pts: 100,  school: [1, 2], depth: [0.4, 0.95] },
  { id: 'tuna',      r: 30, speed: 150, pts: 180,  school: [2, 4], depth: [0.1, 0.7] },
  { id: 'grouper',   r: 40, speed: 70,  pts: 300,  school: [1, 1], depth: [0.6, 0.97] },
  { id: 'swordfish', r: 50, speed: 170, pts: 500,  school: [1, 1], depth: [0.2, 0.7] },
  { id: 'squid',     r: 60, speed: 90,  pts: 1000, school: [1, 1], depth: [0.7, 0.97] },
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
