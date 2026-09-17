-- Sphixmail D1 Schema
-- Run: wrangler d1 execute sphixmail-db --remote --file=src/db/schema.sql

-- ============================================================
-- CORE: Inboxes & Messages
-- ============================================================

CREATE TABLE IF NOT EXISTS inboxes (
  address TEXT PRIMARY KEY,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS messages (
  id TEXT PRIMARY KEY,
  inbox_address TEXT NOT NULL,
  from_address TEXT NOT NULL,
  subject TEXT DEFAULT '(no subject)',
  body TEXT DEFAULT '',
  body_html TEXT DEFAULT '',
  received_at TEXT NOT NULL DEFAULT (datetime('now')),
  is_seen INTEGER NOT NULL DEFAULT 0,
  FOREIGN KEY (inbox_address) REFERENCES inboxes(address)
);

CREATE INDEX IF NOT EXISTS idx_messages_inbox ON messages(inbox_address);
CREATE INDEX IF NOT EXISTS idx_messages_received ON messages(inbox_address, received_at DESC);

-- ============================================================
-- SESSIONS (anonymous browser sessions)
-- ============================================================

CREATE TABLE IF NOT EXISTS sessions (
  id TEXT PRIMARY KEY,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS session_inboxes (
  session_id TEXT NOT NULL,
  inbox_address TEXT NOT NULL,
  PRIMARY KEY (session_id, inbox_address),
  FOREIGN KEY (session_id) REFERENCES sessions(id),
  FOREIGN KEY (inbox_address) REFERENCES inboxes(address)
);

CREATE INDEX IF NOT EXISTS idx_session_inboxes_session ON session_inboxes(session_id);

-- ============================================================
-- DOMAINS
-- ============================================================

CREATE TABLE IF NOT EXISTS domains (
  domain TEXT PRIMARY KEY,
  type TEXT NOT NULL DEFAULT 'open',    -- 'open' | 'admin'
  is_active INTEGER NOT NULL DEFAULT 1,
  added_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- ============================================================
-- ADMIN
-- ============================================================

CREATE TABLE IF NOT EXISTS admin (
  id INTEGER PRIMARY KEY DEFAULT 1,
  username TEXT NOT NULL DEFAULT 'admin',
  password_hash TEXT NOT NULL DEFAULT '',
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS admin_sessions (
  token TEXT PRIMARY KEY,
  expires_at TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- ============================================================
-- SETTINGS (key-value store for all admin config)
-- ============================================================

CREATE TABLE IF NOT EXISTS settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL
);

-- Default settings (INSERT OR IGNORE so redeploy is safe)
INSERT OR IGNORE INTO settings (key, value) VALUES ('app_name', '"Sphixmail"');
INSERT OR IGNORE INTO settings (key, value) VALUES ('footer_text', '"© Sphixmail by Devano Naufal (sphixray)"');
INSERT OR IGNORE INTO settings (key, value) VALUES ('social_links', '{}');
INSERT OR IGNORE INTO settings (key, value) VALUES ('forbidden_usernames', '["admin","root","abuse","support","postmaster","hostmaster","webmaster","info","noreply","no-reply"]');
INSERT OR IGNORE INTO settings (key, value) VALUES ('username_min', '3');
INSERT OR IGNORE INTO settings (key, value) VALUES ('username_max', '30');
INSERT OR IGNORE INTO settings (key, value) VALUES ('disable_used_email', 'false');
INSERT OR IGNORE INTO settings (key, value) VALUES ('daily_inbox_limit', '10');
INSERT OR IGNORE INTO settings (key, value) VALUES ('auto_delete_enabled', 'false');
INSERT OR IGNORE INTO settings (key, value) VALUES ('delete_value', '7');
INSERT OR IGNORE INTO settings (key, value) VALUES ('delete_unit', '"d"');
INSERT OR IGNORE INTO settings (key, value) VALUES ('max_messages_per_inbox', '50');
INSERT OR IGNORE INTO settings (key, value) VALUES ('admin_lockout_count', '0');
INSERT OR IGNORE INTO settings (key, value) VALUES ('admin_lockout_until', '""');

-- ============================================================
-- API KEYS
-- ============================================================

CREATE TABLE IF NOT EXISTS api_keys (
  key TEXT PRIMARY KEY,
  label TEXT NOT NULL DEFAULT '',
  rate_limit_per_min INTEGER DEFAULT 60,
  expires_at TEXT,                       -- NULL = never expires
  is_active INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  last_used_at TEXT
);

CREATE TABLE IF NOT EXISTS api_usage (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  api_key TEXT NOT NULL,
  endpoint TEXT NOT NULL,
  called_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_api_usage_key_time ON api_usage(api_key, called_at);

-- ============================================================
-- STATS (daily counters)
-- ============================================================

CREATE TABLE IF NOT EXISTS stats (
  type TEXT NOT NULL,      -- 'emails_created' | 'messages_received'
  count INTEGER NOT NULL DEFAULT 0,
  date TEXT NOT NULL,      -- YYYY-MM-DD
  PRIMARY KEY (type, date)
);

-- ============================================================
-- INBOX LOGS (for rate limiting & used-email protection)
-- ============================================================

CREATE TABLE IF NOT EXISTS inbox_logs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  session_id TEXT NOT NULL,
  email TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_inbox_logs_session ON inbox_logs(session_id, created_at);
CREATE INDEX IF NOT EXISTS idx_inbox_logs_email ON inbox_logs(email);

-- ============================================================
-- CRON LOGS
-- ============================================================

CREATE TABLE IF NOT EXISTS cron_logs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  message TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
