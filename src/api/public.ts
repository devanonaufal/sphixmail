import { Hono } from 'hono';
import type { D1Database } from '@cloudflare/workers-types';
import {
  getActiveDomains,
  getApiKey,
  touchApiKey,
  getMessages,
  getMessage,
  deleteMessage,
  countMessages,
  getTotalStat,
  getLatestMessages,
} from '../db/queries';
import { getSetting } from '../utils/settings';
import { extractOtp } from '../utils/otp-extractor';

export interface PublicApiEnv {
  DB: D1Database;
  MAIL_DOMAIN: string;
}

const pub = new Hono<{ Bindings: PublicApiEnv }>();

// ---- API key validation middleware ----
async function validateKey(db: D1Database, key: string): Promise<boolean> {
  if (!key) return false;
  const apiKey = await getApiKey(db, key);
  if (!apiKey) return false;
  // Check expiry
  if (apiKey.expires_at && new Date(apiKey.expires_at) < new Date()) return false;
  await touchApiKey(db, key);
  return true;
}

function unauthorized() {
  return Response.json({ success: false, error: 'Invalid or missing API key' }, { status: 401 });
}

// ---- GET /domains/[apikey] ----
pub.get('/domains/:apikey', async (c) => {
  if (!(await validateKey(c.env.DB, c.req.param('apikey')))) return unauthorized();

  const domains = await getActiveDomains(c.env.DB);
  return c.json({
    success: true,
    count: domains.length,
    domains: domains.map(d => ({ domain: d.domain, type: d.type, added_at: d.added_at })),
  });
});

// ---- GET /email/[email]/[apikey] ----
pub.get('/email/:email/:apikey', async (c) => {
  if (!(await validateKey(c.env.DB, c.req.param('apikey')))) return unauthorized();

  const email = decodeURIComponent(c.req.param('email')).toLowerCase();
  const [local, domain] = email.split('@');
  if (!local || !domain) return c.json({ success: false, error: 'Invalid email format' }, 400);

  // Validate domain is active
  const domains = await getActiveDomains(c.env.DB);
  if (!domains.some(d => d.domain === domain)) {
    return c.json({ success: false, error: `Domain not active: ${domain}` }, 400);
  }

  // Validate forbidden usernames
  const forbidden = await getSetting<string[]>(c.env.DB, 'forbidden_usernames') ?? [];
  if (forbidden.includes(local)) {
    return c.json({ success: false, error: 'Username not allowed' }, 406);
  }

  // Validate length
  const min = Number(await getSetting<number>(c.env.DB, 'username_min') ?? 3);
  const max = Number(await getSetting<number>(c.env.DB, 'username_max') ?? 30);
  if (local.length < min || local.length > max) {
    return c.json({ success: false, error: `Username length must be between ${min} and ${max}` }, 406);
  }

  return c.json({
    success: true,
    email,
    local,
    domain,
    message: 'Email is valid and ready to use',
  });
});

// ---- GET /messages/[email]/[apikey] ----
pub.get('/messages/:email/:apikey', async (c) => {
  if (!(await validateKey(c.env.DB, c.req.param('apikey')))) return unauthorized();

  const email = decodeURIComponent(c.req.param('email')).toLowerCase();
  const limit = parseInt(c.req.query('limit') || '0');

  let messages = await getMessages(c.env.DB, email);
  if (limit > 0) messages = messages.slice(0, limit);

  return c.json({
    success: true,
    email,
    count: messages.length,
    messages: messages.map(m => ({
      id: m.id,
      from: m.from_address,
      subject: m.subject,
      preview: (m.body || m.body_html.replace(/<[^>]+>/g, '')).slice(0, 100),
      body_text: m.body,
      body_html: m.body_html,
      received_at: m.received_at,
    })),
  });
});

// ---- DELETE /message/[message_id]/[apikey] ----
pub.delete('/message/:message_id/:apikey', async (c) => {
  if (!(await validateKey(c.env.DB, c.req.param('apikey')))) return unauthorized();

  const id = c.req.param('message_id');
  const msg = await getMessage(c.env.DB, id);
  if (!msg) return c.json({ success: false, error: 'Message not found' }, 404);

  await deleteMessage(c.env.DB, id);
  return c.json({ success: true, message: 'Message deleted successfully', deleted_id: id });
});

// ---- GET /stats/[apikey] ----
pub.get('/stats/:apikey', async (c) => {
  if (!(await validateKey(c.env.DB, c.req.param('apikey')))) return unauthorized();

  const filtersParam = c.req.query('filters') || '';
  const filters = filtersParam ? filtersParam.split(',') : [];
  const want = (f: string) => filters.length === 0 || filters.includes(f);

  const db = c.env.DB;
  const data: Record<string, unknown> = {};

  if (want('total_messages')) {
    data.total_messages = await getTotalStat(db, 'messages_received');
    data.current_messages = await countMessages(db);
  }
  if (want('total_inboxes_created')) {
    data.total_inboxes_created = await getTotalStat(db, 'emails_created');
  }
  if (want('most_popular_receiver')) {
    const row = await db
      .prepare('SELECT inbox_address, COUNT(*) as c FROM messages GROUP BY inbox_address ORDER BY c DESC LIMIT 1')
      .first<{ inbox_address: string; c: number }>();
    data.most_popular_receiver = row?.inbox_address ?? '';
    data.most_popular_receiver_count = row?.c ?? 0;
  }
  if (want('most_popular_sender')) {
    const row = await db
      .prepare('SELECT from_address, COUNT(*) as c FROM messages GROUP BY from_address ORDER BY c DESC LIMIT 1')
      .first<{ from_address: string; c: number }>();
    data.most_popular_sender = row?.from_address ?? '';
    data.most_popular_sender_count = row?.c ?? 0;
  }
  if (want('unread_messages')) {
    const unread = await db
      .prepare('SELECT COUNT(*) as c FROM messages WHERE is_seen = 0')
      .first<{ c: number }>();
    const total = await countMessages(db);
    data.unread_messages = unread?.c ?? 0;
    data.unread_messages_percentage = total > 0
      ? Math.round(((unread?.c ?? 0) / total) * 100) + '%'
      : '0%';
  }
  if (want('latest_messages')) {
    data.latest_messages = await getLatestMessages(db, 15);
  }

  return c.json({ success: true, data });
});

// ---- GET /inbox/[email]/wait-otp/[apikey] ----
// Long-polling: wait until OTP email arrives or timeout
pub.get('/inbox/:email/wait-otp/:apikey', async (c) => {
  // Validate API key first
  if (!(await validateKey(c.env.DB, c.req.param('apikey')))) return unauthorized();

  const email = decodeURIComponent(c.req.param('email')).toLowerCase();
  const timeout = Math.min(parseInt(c.req.query('timeout') || '30'), 60); // max 60s
  const subjectContains = (c.req.query('subject_contains') || '').toLowerCase();
  const afterId = c.req.query('after') || '';

  const db = c.env.DB;
  const deadline = Date.now() + timeout * 1000;
  const pollInterval = 2000; // poll every 2 seconds

  while (Date.now() < deadline) {
    let messages = await getMessages(db, email);

    // Filter: only after given message_id
    if (afterId) {
      const idx = messages.findIndex(m => m.id === afterId);
      if (idx !== -1) messages = messages.slice(0, idx); // newer messages are at front (DESC)
    }

    // Filter: subject_contains
    if (subjectContains) {
      messages = messages.filter(m => m.subject.toLowerCase().includes(subjectContains));
    }

    if (messages.length > 0) {
      const msg = messages[0];
      const otp = extractOtp(msg.body || msg.body_html.replace(/<[^>]+>/g, ''));
      return c.json({
        found: true,
        message: {
          id: msg.id,
          from: msg.from_address,
          subject: msg.subject,
          body_text: msg.body,
          received_at: msg.received_at,
        },
        otp,
      });
    }

    // Wait before next poll
    await new Promise(r => setTimeout(r, pollInterval));
  }

  return c.json({ found: false, message: 'Timeout - no email received' });
});

export default pub;
