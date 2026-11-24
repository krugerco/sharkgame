// Leaderboard client for the Worker API (/api/scores).

const CLIENT_KEY = 'deepbite.clientId';

function clientId() {
  let id = localStorage.getItem(CLIENT_KEY);
  if (!id) {
    id = (crypto.randomUUID?.() || Math.random().toString(36).slice(2) + Date.now().toString(36));
    localStorage.setItem(CLIENT_KEY, id);
  }
  return id;
}

export async function fetchScores(limit = 20) {
  const res = await fetch(`/api/scores?limit=${limit}`);
  if (!res.ok) throw new Error(`Leaderboard unavailable (${res.status})`);
  return (await res.json()).scores;
}

export async function submitScore({ name, score, level, duration }) {
  const res = await fetch('/api/scores', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ name, score, level, duration, clientId: clientId() }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || `Submit failed (${res.status})`);
  return data; // { ok, rank }
}
