CREATE TABLE IF NOT EXISTS scores (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  name       TEXT    NOT NULL,
  score      INTEGER NOT NULL,
  level      INTEGER NOT NULL DEFAULT 1,
  duration   INTEGER NOT NULL DEFAULT 0,
  client_id  TEXT,
  created_at TEXT    NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);
CREATE INDEX IF NOT EXISTS idx_scores_score ON scores (score DESC);
CREATE INDEX IF NOT EXISTS idx_scores_client_time ON scores (client_id, created_at);
