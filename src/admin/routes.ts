import { Hono } from 'hono';
import type { D1Database } from '@cloudflare/workers-types';
import { requireAdmin, getCookieToken } from './middleware';
import {
  getAdminCredentials,
  upsertAdmin,
  createAdminSession,
  deleteAdminSession,
  getAllDomains,
  upsertDomain,
  deleteDomain,
  setDomainActive,
  setDomainType,
  getAllApiKeys,
  createApiKey,
  revokeApiKey,
  getMessages,
  getMessage,
  deleteMessage,
  getLatestMessages,
  getTotalStat,
  countMessages,
  getStatsChart,
  getCronLogs,
} from '../db/queries';
import { getAllSettings, getSetting, setSetting, importSettings } from '../utils/settings';
import { hashPassword, verifyPassword } from '../utils/hash';

export interface AdminEnv {
  DB: D1Database;
  MAIL_DOMAIN: string;
  ADMIN_PASSWORD_HASH: string;
}

const COOKIE_NAME = 'sphixmail_admin';
const SESSION_TTL_HOURS = 24;

function setCookie(token: string): string {
  const expires = new Date(Date.now() + SESSION_TTL_HOURS * 60 * 60 * 1000).toUTCString();
  return `${COOKIE_NAME}=${token}; Path=/; HttpOnly; SameSite=Strict; Expires=${expires}`;
}

function clearCookie(): string {
  return `${COOKIE_NAME}=; Path=/; HttpOnly; SameSite=Strict; Max-Age=0`;
}

// Generate API key: rm_ + 32 random hex chars
function generateApiKey(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(16));
  const hex = Array.from(bytes).map(b => b.toString(16).padStart(2, '0')).join('');
  return `rm_${hex}`;
}

const admin = new Hono<{ Bindings: AdminEnv }>();

// ============================================================
// AUTH
// ============================================================

// POST /admin/login
admin.post('/login', async (c) => {
  const body = await c.req.json().catch(() => ({})) as { username?: string; password?: string };
  const { username = '', password = '' } = body;
  const db = c.env.DB;

  // Lockout check
  const lockoutUntil = await getSetting<string>(db, 'admin_lockout_until') ?? '';
  if (lockoutUntil && new Date(lockoutUntil) > new Date()) {
    const remaining = Math.ceil((new Date(lockoutUntil).getTime() - Date.now()) / 1000);
    return c.json({ error: `Too many failed attempts. Try again in ${remaining}s` }, 429);
  }

  // Validate credentials
  // Priority: check admin table first, fallback to ADMIN_PASSWORD_HASH env var
  const adminCreds = await getAdminCredentials(db);
  let valid = false;

  if (adminCreds && adminCreds.password_hash) {
    valid = adminCreds.username === username && await verifyPassword(password, adminCreds.password_hash);
  } else if (c.env.ADMIN_PASSWORD_HASH) {
    // First-time setup: use env var, then seed admin table
    const hashMatch = await verifyPassword(password, c.env.ADMIN_PASSWORD_HASH);
    if (username === 'admin' && hashMatch) {
      await upsertAdmin(db, username, c.env.ADMIN_PASSWORD_HASH);
      valid = true;
    }
  }

  if (!valid) {
    // Increment lockout counter
    const count = Number(await getSetting<number>(db, 'admin_lockout_count') ?? 0) + 1;
    await setSetting(db, 'admin_lockout_count', count);
    if (count >= 5) {
      const until = new Date(Date.now() + 15 * 60 * 1000).toISOString();
      await setSetting(db, 'admin_lockout_until', until);
      await setSetting(db, 'admin_lockout_count', 0);
      return c.json({ error: 'Too many failed attempts. Locked for 15 minutes.' }, 429);
    }
    return c.json({ error: `Invalid credentials (${count}/5 attempts)` }, 401);
  }

  // Reset lockout
  await setSetting(db, 'admin_lockout_count', 0);
  await setSetting(db, 'admin_lockout_until', '');

  // Create session
  const token = crypto.randomUUID();
  const expiresAt = new Date(Date.now() + SESSION_TTL_HOURS * 60 * 60 * 1000).toISOString();
  await createAdminSession(db, token, expiresAt);

  return new Response(JSON.stringify({ ok: true }), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
      'Set-Cookie': setCookie(token),
    },
  });
});

// POST /admin/logout
admin.post('/logout', async (c) => {
  const token = getCookieToken(c.req.header('cookie'));
  if (token) await deleteAdminSession(c.env.DB, token);
  return new Response(JSON.stringify({ ok: true }), {
    status: 200,
    headers: { 'Content-Type': 'application/json', 'Set-Cookie': clearCookie() },
  });
});

// GET /admin/me — check auth status
admin.get('/me', requireAdmin, async (c) => {
  const creds = await getAdminCredentials(c.env.DB);
  return c.json({ username: creds?.username ?? 'admin' });
});

// ============================================================
// DASHBOARD STATS
// ============================================================

admin.get('/stats', requireAdmin, async (c) => {
  const db = c.env.DB;
  const period = c.req.query('period') ?? '7d';

  let chartDays = 7;
  if (period === '6w') chartDays = 42;
  else if (period === '12m') chartDays = 365;
  else if (period === '7y') chartDays = 365 * 7;

  const [msgChart, inboxChart, totalMsg, totalInbox, latest, unreadRow] = await Promise.all([
    getStatsChart(db, 'messages_received', chartDays),
    getStatsChart(db, 'emails_created', chartDays),
    getTotalStat(db, 'messages_received'),
    getTotalStat(db, 'emails_created'),
    getLatestMessages(db, 15),
    db.prepare('SELECT COUNT(*) as c FROM messages WHERE is_seen = 0').first<{ c: number }>(),
  ]);

  const currentMessages = await countMessages(db);

  return c.json({
    totalMessages: totalMsg,
    totalInboxes: totalInbox,
    currentMessages,
    unreadMessages: unreadRow?.c ?? 0,
    chart: { messages: msgChart, inboxes: inboxChart },
    latestMessages: latest,
  });
});

// ============================================================
// DOMAINS
// ============================================================

admin.get('/domains', requireAdmin, async (c) => {
  const domains = await getAllDomains(c.env.DB);
  return c.json(domains);
});

admin.post('/domains', requireAdmin, async (c) => {
  const { domain, type = 'open' } = await c.req.json().catch(() => ({})) as { domain?: string; type?: 'open' | 'member' };
  if (!domain) return c.json({ error: 'domain required' }, 400);
  await upsertDomain(c.env.DB, domain.trim().toLowerCase(), type);
  return c.json({ ok: true });
});

admin.patch('/domains/:domain', requireAdmin, async (c) => {
  const domain = decodeURIComponent(c.req.param('domain'));
  const body = await c.req.json().catch(() => ({})) as { is_active?: boolean; type?: 'open' | 'member' };
  if (body.is_active !== undefined) await setDomainActive(c.env.DB, domain, body.is_active);
  if (body.type) await setDomainType(c.env.DB, domain, body.type);
  return c.json({ ok: true });
});

admin.delete('/domains/:domain', requireAdmin, async (c) => {
  const domain = decodeURIComponent(c.req.param('domain'));
  await deleteDomain(c.env.DB, domain);
  return c.json({ ok: true });
});

// ============================================================
// API KEYS
// ============================================================

admin.get('/api-keys', requireAdmin, async (c) => {
  const keys = await getAllApiKeys(c.env.DB);
  // Mask key: show only prefix rm_ + last 4 chars
  return c.json(keys.map(k => ({
    ...k,
    key_masked: k.key.slice(0, 6) + '...' + k.key.slice(-4),
    key_full: k.key, // send full key — admin can copy it
  })));
});

admin.post('/api-keys', requireAdmin, async (c) => {
  const body = await c.req.json().catch(() => ({})) as {
    label?: string;
    rate_limit_per_min?: number;
    expires_at?: string;
  };
  const key = generateApiKey();
  await createApiKey(
    c.env.DB,
    key,
    body.label ?? '',
    body.rate_limit_per_min ?? 60,
    body.expires_at ?? null,
  );
  return c.json({ ok: true, key }); // return full key once on creation
});

admin.patch('/api-keys/:key/revoke', requireAdmin, async (c) => {
  await revokeApiKey(c.env.DB, c.req.param('key'));
  return c.json({ ok: true });
});

admin.delete('/api-keys/:key', requireAdmin, async (c) => {
  await c.env.DB.prepare('DELETE FROM api_keys WHERE key = ?').bind(c.req.param('key')).run();
  return c.json({ ok: true });
});

// ============================================================
// MESSAGES (admin view)
// ============================================================

admin.get('/messages', requireAdmin, async (c) => {
  const db = c.env.DB;
  const inbox = c.req.query('inbox') ?? '';
  const page = Math.max(1, parseInt(c.req.query('page') ?? '1'));
  const limit = Math.min(50, parseInt(c.req.query('limit') ?? '20'));
  const offset = (page - 1) * limit;

  let query = 'SELECT * FROM messages';
  const params: unknown[] = [];

  if (inbox) {
    query += ' WHERE inbox_address = ?';
    params.push(inbox);
  }
  query += ' ORDER BY received_at DESC LIMIT ? OFFSET ?';
  params.push(limit, offset);

  const [rows, total] = await Promise.all([
    db.prepare(query).bind(...params).all<import('../db/queries').Message>().then(r => r.results),
    db.prepare(inbox ? 'SELECT COUNT(*) as c FROM messages WHERE inbox_address = ?' : 'SELECT COUNT(*) as c FROM messages')
      .bind(...(inbox ? [inbox] : []))
      .first<{ c: number }>(),
  ]);

  return c.json({ messages: rows, total: total?.c ?? 0, page, limit });
});

admin.delete('/messages/:id', requireAdmin, async (c) => {
  const msg = await getMessage(c.env.DB, c.req.param('id'));
  if (!msg) return c.json({ error: 'Not found' }, 404);
  await deleteMessage(c.env.DB, c.req.param('id'));
  return c.json({ ok: true });
});

// Bulk delete
admin.post('/messages/bulk-delete', requireAdmin, async (c) => {
  const { ids } = await c.req.json().catch(() => ({ ids: [] })) as { ids: string[] };
  if (!Array.isArray(ids) || ids.length === 0) return c.json({ error: 'ids array required' }, 400);
  const stmts = ids.map(id => c.env.DB.prepare('DELETE FROM messages WHERE id = ?').bind(id));
  await c.env.DB.batch(stmts);
  return c.json({ ok: true, deleted: ids.length });
});

// ============================================================
// SETTINGS
// ============================================================

admin.get('/settings', requireAdmin, async (c) => {
  return c.json(await getAllSettings(c.env.DB));
});

admin.patch('/settings', requireAdmin, async (c) => {
  const body = await c.req.json().catch(() => ({})) as Record<string, unknown>;
  for (const [key, value] of Object.entries(body)) {
    await setSetting(c.env.DB, key, value);
  }
  return c.json({ ok: true });
});

// Change admin password
admin.post('/settings/password', requireAdmin, async (c) => {
  const { username, password } = await c.req.json().catch(() => ({})) as { username?: string; password?: string };
  if (!password || password.length < 8) return c.json({ error: 'Password must be at least 8 characters' }, 400);
  const hash = await hashPassword(password);
  await upsertAdmin(c.env.DB, username ?? 'admin', hash);
  return c.json({ ok: true });
});

// Export settings
admin.get('/settings/export', requireAdmin, async (c) => {
  const data = await getAllSettings(c.env.DB);
  return new Response(JSON.stringify(data, null, 2), {
    headers: {
      'Content-Type': 'application/json',
      'Content-Disposition': 'attachment; filename="sphixmail-settings.json"',
    },
  });
});

// Import settings
admin.post('/settings/import', requireAdmin, async (c) => {
  const body = await c.req.json().catch(() => null);
  if (!body || typeof body !== 'object') return c.json({ error: 'Invalid JSON' }, 400);
  await importSettings(c.env.DB, body as Record<string, unknown>);
  return c.json({ ok: true });
});

// ============================================================
// CRON LOGS
// ============================================================

admin.get('/cron-logs', requireAdmin, async (c) => {
  const logs = await getCronLogs(c.env.DB, 100);
  return c.json(logs);
});

export default admin;
