import { validateSubmission } from './validate.js';

const JSON_HEADERS = {
  'content-type': 'application/json; charset=utf-8',
  'cache-control': 'no-store',
};

const json = (data, status = 200, extra = {}) =>
  new Response(JSON.stringify(data), { status, headers: { ...JSON_HEADERS, ...extra } });

const RATE_LIMIT_PER_MINUTE = 6;

async function listScores(env, url) {
  const limit = Math.min(Math.max(parseInt(url.searchParams.get('limit') || '20', 10) || 20, 1), 100);
  const { results } = await env.DB
    .prepare('SELECT name, score, level, duration, created_at FROM scores ORDER BY score DESC, id ASC LIMIT ?')
    .bind(limit)
    .all();
  return json({ scores: results }, 200, { 'cache-control': 'public, max-age=10' });
}

async function submitScore(request, env) {
  if (!(request.headers.get('content-type') || '').includes('application/json')) {
    return json({ error: 'Expected JSON' }, 415);
  }
  let body;
  try { body = await request.json(); } catch { return json({ error: 'Invalid JSON' }, 400); }

  const check = validateSubmission(body);
  if (!check.ok) return json({ error: check.error }, 400);
  const s = check.value;

  if (s.clientId) {
    const recent = await env.DB
      .prepare("SELECT COUNT(*) AS n FROM scores WHERE client_id = ? AND created_at > strftime('%Y-%m-%dT%H:%M:%fZ','now','-1 minute')")
      .bind(s.clientId)
      .first();
    if (recent && recent.n >= RATE_LIMIT_PER_MINUTE) return json({ error: 'Too many submissions' }, 429);
  }

  await env.DB
    .prepare('INSERT INTO scores (name, score, level, duration, client_id) VALUES (?, ?, ?, ?, ?)')
    .bind(s.name, s.score, s.level, s.duration, s.clientId)
    .run();

  const rankRow = await env.DB
    .prepare('SELECT COUNT(*) + 1 AS rank FROM scores WHERE score > ?')
    .bind(s.score)
    .first();

  return json({ ok: true, rank: rankRow ? rankRow.rank : null }, 201);
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.pathname === '/api/health') return json({ ok: true, db: Boolean(env.DB) });

    if (url.pathname === '/api/scores') {
      if (!env.DB) return json({ error: 'Leaderboard unavailable' }, 503);
      try {
        if (request.method === 'GET') return await listScores(env, url);
        if (request.method === 'POST') return await submitScore(request, env);
        return json({ error: 'Method not allowed' }, 405, { allow: 'GET, POST' });
      } catch (err) {
        console.error('scores error', err);
        return json({ error: 'Leaderboard unavailable' }, 503);
      }
    }

    if (url.pathname.startsWith('/api/')) return json({ error: 'Not found' }, 404);
    return env.ASSETS.fetch(request);
  },
};
