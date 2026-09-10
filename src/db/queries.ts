import type { D1Database } from '@cloudflare/workers-types';

// ============================================================
// Types
// ============================================================

export interface Inbox {
  address: string;
  created_at: string;
}

export interface Message {
  id: string;
  inbox_address: string;
  from_address: string;
  subject: string;
  body: string;
  body_html: string;
  received_at: string;
  is_seen: number;
}

export interface Session {
  id: string;
  created_at: string;
}

export interface Domain {
  domain: string;
  type: 'open' | 'member';
  is_active: number;
  added_at: string;
}

export interface ApiKey {
  key: string;
  label: string;
  rate_limit_per_min: number;
  expires_at: string | null;
  is_active: number;
  created_at: string;
  last_used_at: string | null;
}

// ============================================================
// Inboxes
// ============================================================

export async function getInbox(db: D1Database, address: string): Promise<Inbox | null> {
  return db.prepare('SELECT * FROM inboxes WHERE address = ?').bind(address).first<Inbox>();
}

export async function createInbox(db: D1Database, address: string): Promise<void> {
  await db.prepare('INSERT OR IGNORE INTO inboxes (address) VALUES (?)').bind(address).run();
}

export async function inboxExists(db: D1Database, address: string): Promise<boolean> {
  const row = await db.prepare('SELECT 1 FROM inboxes WHERE address = ? LIMIT 1').bind(address).first();
  return !!row;
}

export async function getSessionInboxes(db: D1Database, sessionId: string): Promise<Inbox[]> {
  return db
    .prepare(
      `SELECT i.* FROM inboxes i
       INNER JOIN session_inboxes si ON si.inbox_address = i.address
       WHERE si.session_id = ?
       ORDER BY i.created_at DESC`
    )
    .bind(sessionId)
    .all<Inbox>()
    .then(r => r.results);
}

// ============================================================
// Messages
// ============================================================

export async function getMessages(db: D1Database, inboxAddress: string): Promise<Message[]> {
  return db
    .prepare('SELECT * FROM messages WHERE inbox_address = ? ORDER BY received_at DESC')
    .bind(inboxAddress)
    .all<Message>()
    .then(r => r.results);
}

export async function getMessage(db: D1Database, id: string): Promise<Message | null> {
  return db.prepare('SELECT * FROM messages WHERE id = ?').bind(id).first<Message>();
}

export async function insertMessage(
  db: D1Database,
  msg: Pick<Message, 'id' | 'inbox_address' | 'from_address' | 'subject' | 'body' | 'body_html'>
): Promise<void> {
  await db
    .prepare(
      `INSERT INTO messages (id, inbox_address, from_address, subject, body, body_html)
       VALUES (?, ?, ?, ?, ?, ?)`
    )
    .bind(msg.id, msg.inbox_address, msg.from_address, msg.subject, msg.body, msg.body_html)
    .run();
}

export async function deleteMessage(db: D1Database, id: string): Promise<void> {
  await db.prepare('DELETE FROM messages WHERE id = ?').bind(id).run();
}

export async function deleteOldMessages(db: D1Database, beforeIso: string): Promise<number> {
  const result = await db
    .prepare("DELETE FROM messages WHERE received_at < ?")
    .bind(beforeIso)
    .run();
  return result.meta.changes ?? 0;
}

export async function countMessages(db: D1Database): Promise<number> {
  const row = await db.prepare('SELECT COUNT(*) as c FROM messages').first<{ c: number }>();
  return row?.c ?? 0;
}

export async function getLatestMessages(db: D1Database, limit = 15): Promise<Message[]> {
  return db
    .prepare('SELECT * FROM messages ORDER BY received_at DESC LIMIT ?')
    .bind(limit)
    .all<Message>()
    .then(r => r.results);
}

export async function trimInboxMessages(db: D1Database, inboxAddress: string, max: number): Promise<void> {
  // Keep only newest `max` messages; delete older ones
  await db
    .prepare(
      `DELETE FROM messages WHERE inbox_address = ? AND id NOT IN (
         SELECT id FROM messages WHERE inbox_address = ? ORDER BY received_at DESC LIMIT ?
       )`
    )
    .bind(inboxAddress, inboxAddress, max)
    .run();
}

// ============================================================
// Sessions
// ============================================================

export async function ensureSession(db: D1Database, sessionId: string): Promise<void> {
  await db.prepare('INSERT OR IGNORE INTO sessions (id) VALUES (?)').bind(sessionId).run();
}

export async function linkInboxToSession(db: D1Database, sessionId: string, address: string): Promise<void> {
  await db
    .prepare('INSERT OR IGNORE INTO session_inboxes (session_id, inbox_address) VALUES (?, ?)')
    .bind(sessionId, address)
    .run();
}

export async function unlinkInboxFromSession(db: D1Database, sessionId: string, address: string): Promise<void> {
  await db
    .prepare('DELETE FROM session_inboxes WHERE session_id = ? AND inbox_address = ?')
    .bind(sessionId, address)
    .run();
}

export async function isInboxInSession(db: D1Database, sessionId: string, address: string): Promise<boolean> {
  const row = await db
    .prepare('SELECT 1 FROM session_inboxes WHERE session_id = ? AND inbox_address = ? LIMIT 1')
    .bind(sessionId, address)
    .first();
  return !!row;
}

// ============================================================
// Domains
// ============================================================

export async function getActiveDomains(db: D1Database, type?: 'open' | 'member'): Promise<Domain[]> {
  if (type) {
    return db
      .prepare('SELECT * FROM domains WHERE is_active = 1 AND type = ? ORDER BY added_at ASC')
      .bind(type)
      .all<Domain>()
      .then(r => r.results);
  }
  return db
    .prepare('SELECT * FROM domains WHERE is_active = 1 ORDER BY added_at ASC')
    .all<Domain>()
    .then(r => r.results);
}

export async function getAllDomains(db: D1Database): Promise<Domain[]> {
  return db.prepare('SELECT * FROM domains ORDER BY added_at ASC').all<Domain>().then(r => r.results);
}

export async function upsertDomain(db: D1Database, domain: string, type: 'open' | 'member' = 'open'): Promise<void> {
  await db
    .prepare('INSERT OR IGNORE INTO domains (domain, type) VALUES (?, ?)')
    .bind(domain, type)
    .run();
}

export async function setDomainActive(db: D1Database, domain: string, active: boolean): Promise<void> {
  await db.prepare('UPDATE domains SET is_active = ? WHERE domain = ?').bind(active ? 1 : 0, domain).run();
}

export async function setDomainType(db: D1Database, domain: string, type: 'open' | 'member'): Promise<void> {
  await db.prepare('UPDATE domains SET type = ? WHERE domain = ?').bind(type, domain).run();
}

export async function deleteDomain(db: D1Database, domain: string): Promise<void> {
  await db.prepare('DELETE FROM domains WHERE domain = ?').bind(domain).run();
}

// ============================================================
// API Keys
// ============================================================

export async function getApiKey(db: D1Database, key: string): Promise<ApiKey | null> {
  return db.prepare('SELECT * FROM api_keys WHERE key = ? AND is_active = 1').bind(key).first<ApiKey>();
}

export async function getAllApiKeys(db: D1Database): Promise<ApiKey[]> {
  return db.prepare('SELECT * FROM api_keys ORDER BY created_at DESC').all<ApiKey>().then(r => r.results);
}

export async function createApiKey(db: D1Database, key: string, label: string, rateLimitPerMin: number, expiresAt: string | null): Promise<void> {
  await db
    .prepare('INSERT INTO api_keys (key, label, rate_limit_per_min, expires_at) VALUES (?, ?, ?, ?)')
    .bind(key, label, rateLimitPerMin, expiresAt)
    .run();
}

export async function revokeApiKey(db: D1Database, key: string): Promise<void> {
  await db.prepare('UPDATE api_keys SET is_active = 0 WHERE key = ?').bind(key).run();
}

export async function deleteApiKey(db: D1Database, key: string): Promise<void> {
  await db.prepare('DELETE FROM api_keys WHERE key = ?').bind(key).run();
}

export async function touchApiKey(db: D1Database, key: string): Promise<void> {
  await db.prepare("UPDATE api_keys SET last_used_at = datetime('now') WHERE key = ?").bind(key).run();
}

// ============================================================
// Stats
// ============================================================

export async function incrementStat(db: D1Database, type: string, count = 1): Promise<void> {
  const today = new Date().toISOString().slice(0, 10);
  await db
    .prepare(
      `INSERT INTO stats (type, count, date) VALUES (?, ?, ?)
       ON CONFLICT(type, date) DO UPDATE SET count = count + excluded.count`
    )
    .bind(type, count, today)
    .run();
}

export async function getStatsChart(db: D1Database, type: string, days = 7): Promise<{ date: string; count: number }[]> {
  return db
    .prepare(
      `SELECT date, SUM(count) as count FROM stats
       WHERE type = ? AND date >= date('now', ?)
       GROUP BY date ORDER BY date ASC`
    )
    .bind(type, `-${days - 1} days`)
    .all<{ date: string; count: number }>()
    .then(r => r.results);
}

export async function getTotalStat(db: D1Database, type: string): Promise<number> {
  const row = await db
    .prepare('SELECT SUM(count) as total FROM stats WHERE type = ?')
    .bind(type)
    .first<{ total: number }>();
  return row?.total ?? 0;
}

// ============================================================
// Inbox Logs (rate limiting + used-email protection)
// ============================================================

export async function logInboxCreated(db: D1Database, sessionId: string, email: string): Promise<void> {
  await db
    .prepare('INSERT INTO inbox_logs (session_id, email) VALUES (?, ?)')
    .bind(sessionId, email)
    .run();
}

export async function countTodayInboxes(db: D1Database, sessionId: string): Promise<number> {
  const row = await db
    .prepare(
      `SELECT COUNT(*) as c FROM inbox_logs
       WHERE session_id = ? AND created_at >= date('now')`
    )
    .bind(sessionId)
    .first<{ c: number }>();
  return row?.c ?? 0;
}

export async function emailUsedByOtherSession(db: D1Database, email: string, sessionId: string): Promise<boolean> {
  const row = await db
    .prepare('SELECT 1 FROM inbox_logs WHERE email = ? AND session_id != ? LIMIT 1')
    .bind(email, sessionId)
    .first();
  return !!row;
}

export async function deleteOldInboxLogs(db: D1Database, beforeIso: string): Promise<void> {
  await db.prepare('DELETE FROM inbox_logs WHERE created_at < ?').bind(beforeIso).run();
}

// ============================================================
// Admin Sessions
// ============================================================

export async function createAdminSession(db: D1Database, token: string, expiresAt: string): Promise<void> {
  await db
    .prepare('INSERT INTO admin_sessions (token, expires_at) VALUES (?, ?)')
    .bind(token, expiresAt)
    .run();
}

export async function getAdminSession(db: D1Database, token: string): Promise<{ token: string; expires_at: string } | null> {
  return db
    .prepare('SELECT * FROM admin_sessions WHERE token = ? AND expires_at > ?')
    .bind(token, new Date().toISOString())
    .first<{ token: string; expires_at: string }>();
}

export async function deleteAdminSession(db: D1Database, token: string): Promise<void> {
  await db.prepare('DELETE FROM admin_sessions WHERE token = ?').bind(token).run();
}

export async function cleanExpiredAdminSessions(db: D1Database): Promise<void> {
  await db.prepare("DELETE FROM admin_sessions WHERE expires_at < datetime('now')").run();
}

// ============================================================
// Cron Logs
// ============================================================

export async function addCronLog(db: D1Database, message: string): Promise<void> {
  await db.prepare('INSERT INTO cron_logs (message) VALUES (?)').bind(message).run();
}

export async function getCronLogs(db: D1Database, limit = 50): Promise<{ id: number; message: string; created_at: string }[]> {
  return db
    .prepare('SELECT * FROM cron_logs ORDER BY created_at DESC LIMIT ?')
    .bind(limit)
    .all<{ id: number; message: string; created_at: string }>()
    .then(r => r.results);
}

export async function deleteOldCronLogs(db: D1Database): Promise<void> {
  await db.prepare("DELETE FROM cron_logs WHERE created_at < datetime('now', '-3 days')").run();
}

// ============================================================
// Admin Credentials
// ============================================================

export async function getAdminCredentials(db: D1Database): Promise<{ username: string; password_hash: string } | null> {
  return db.prepare('SELECT username, password_hash FROM admin WHERE id = 1').first<{ username: string; password_hash: string }>();
}

export async function upsertAdmin(db: D1Database, username: string, passwordHash: string): Promise<void> {
  await db
    .prepare(
      `INSERT INTO admin (id, username, password_hash) VALUES (1, ?, ?)
       ON CONFLICT(id) DO UPDATE SET username = excluded.username, password_hash = excluded.password_hash, updated_at = datetime('now')`
    )
    .bind(username, passwordHash)
    .run();
}
