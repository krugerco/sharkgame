// Pure validation helpers (unit tested in test/validate.test.js).

export const LIMITS = {
  nameMax: 16,
  scoreMax: 10_000_000,
  levelMax: 99,
  durationMax: 6 * 60 * 60, // 6h in seconds
  pointsPerSecondMax: 2500, // plausibility ceiling
};

export function sanitizeName(raw) {
  if (typeof raw !== 'string') return null;
  const name = raw
    .normalize('NFKC')
    .replace(/[^\p{L}\p{N} _.\-]/gu, '')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, LIMITS.nameMax);
  return name.length ? name : null;
}

const isInt = (v) => Number.isInteger(v);

/** Returns { ok: true, value } or { ok: false, error }. */
export function validateSubmission(body) {
  if (!body || typeof body !== 'object') return { ok: false, error: 'Invalid body' };
  const name = sanitizeName(body.name);
  if (!name) return { ok: false, error: 'Name is required' };

  const { score, level = 1, duration = 0 } = body;
  if (!isInt(score) || score < 0 || score > LIMITS.scoreMax) return { ok: false, error: 'Invalid score' };
  if (!isInt(level) || level < 1 || level > LIMITS.levelMax) return { ok: false, error: 'Invalid level' };
  if (!isInt(duration) || duration < 0 || duration > LIMITS.durationMax) return { ok: false, error: 'Invalid duration' };
  if (score > Math.max(1, duration) * LIMITS.pointsPerSecondMax) return { ok: false, error: 'Score not plausible' };

  const clientId = typeof body.clientId === 'string' && /^[a-zA-Z0-9-]{8,64}$/.test(body.clientId)
    ? body.clientId : null;

  return { ok: true, value: { name, score, level, duration, clientId } };
}
