import { Hono } from 'hono';
import type { D1Database } from '@cloudflare/workers-types';
import {
  getInbox,
  createInbox,
  inboxExists,
  getSessionInboxes,
  getMessages,
  ensureSession,
  linkInboxToSession,
  unlinkInboxFromSession,
  getActiveDomains,
  upsertDomain,
  incrementStat,
  logInboxCreated,
  countTodayInboxes,
} from '../db/queries';
import { generateUniqueAddress } from '../utils/random-address';
import { getSetting } from '../utils/settings';
import { hasAdminSession } from '../admin/middleware';

export interface ApiEnv {
  DB: D1Database;
  APP_NAME: string;
  MAIL_DOMAIN: string;
  WEB_HOST: string;
  ADMIN_PASSWORD_HASH: string;
}

/**
 * Sync domains from MAIL_DOMAIN env var into the domains table on first use.
 * This ensures domain records exist even before admin sets them up.
 */
async function syncEnvDomains(db: D1Database, mailDomain: string): Promise<void> {
  const envDomains = mailDomain.split(',').map(d => d.trim()).filter(Boolean);
  await Promise.all(envDomains.map(d => upsertDomain(db, d, 'open')));
}

function sessionId(c: { req: { header: (k: string) => string | undefined } }): string | null {
  return (c.req.header('x-session-id') || '').trim() || null;
}

const api = new Hono<{ Bindings: ApiEnv }>();

// ---- GET /config ----
api.get('/config', async (c) => {
  await syncEnvDomains(c.env.DB, c.env.MAIL_DOMAIN);
  const domains = await getActiveDomains(c.env.DB, 'open');
  const domainList = domains.map(d => d.domain);
  const appName = await getSetting<string>(c.env.DB, 'app_name') ?? c.env.APP_NAME ?? 'Sphixmail';
  
  // Appearance settings
  const bgEnabled = !!(await getSetting<boolean>(c.env.DB, 'bg_enabled'));
  const bgImage = await getSetting<string>(c.env.DB, 'bg_image') ?? '';
  const bgTransparency = Number(await getSetting<number>(c.env.DB, 'bg_transparency') ?? 65);
  const mascotEnabled = !!(await getSetting<boolean>(c.env.DB, 'mascot_enabled'));
  const mascotImage = await getSetting<string>(c.env.DB, 'mascot_image') ?? '';
  const mascotX = Number(await getSetting<number>(c.env.DB, 'mascot_x') ?? 50);
  const mascotY = Number(await getSetting<number>(c.env.DB, 'mascot_y') ?? 50);
  const mascotSize = Number(await getSetting<number>(c.env.DB, 'mascot_size') ?? 110);

  return c.json({
    appName,
    mailDomain: domainList[0] ?? '',
    mailDomains: domainList,
    webHost: c.env.WEB_HOST,
    bgEnabled,
    bgImage,
    bgTransparency,
    mascotEnabled,
    mascotImage,
    mascotX,
    mascotY,
    mascotSize,
  });
});

// ---- GET /session ----
api.get('/session', async (c) => {
  let sid = sessionId(c);
  if (!sid) sid = crypto.randomUUID();
  await ensureSession(c.env.DB, sid);
  return c.json({ sessionId: sid });
});

// ---- GET /inboxes ----
api.get('/inboxes', async (c) => {
  const sid = sessionId(c);
  if (!sid) return c.json({ error: 'Missing x-session-id' }, 400);
  const inboxes = await getSessionInboxes(c.env.DB, sid);
  return c.json(inboxes);
});

// ---- POST /inboxes ----
api.post('/inboxes', async (c) => {
  const sid = sessionId(c);
  if (!sid) return c.json({ error: 'Missing x-session-id' }, 400);

  await ensureSession(c.env.DB, sid);

  const body = await c.req.json().catch(() => ({}));
  console.log('[DEBUG POST /inboxes] body:', JSON.stringify(body), 'session:', sid);
  const db = c.env.DB;

  // Sync domains
  await syncEnvDomains(db, c.env.MAIL_DOMAIN);
  const activeDomains = await getActiveDomains(db, 'open');
  const domainList = activeDomains.map(d => d.domain);

  // Domain selection
  const requestedDomain = ((body.domain || '') as string).trim().toLowerCase();
  if (requestedDomain && !domainList.includes(requestedDomain)) {
    return c.json({ error: `Invalid domain: ${requestedDomain}. Allowed: ${domainList.join(', ')}` }, 400);
  }
  const domain = requestedDomain || domainList[0] || '';
  if (!domain) return c.json({ error: 'No active domain available. Configure MAIL_DOMAIN in wrangler.toml.' }, 503);

  // Daily limit check
  const dailyLimit = Number(await getSetting<number>(db, 'daily_inbox_limit') ?? 10);
  if (dailyLimit > 0) {
    const todayCount = await countTodayInboxes(db, sid);
    if (todayCount >= dailyLimit) {
      return c.json({ error: `Daily inbox limit reached (max ${dailyLimit} per day)` }, 429);
    }
  }

  // Username
  const requested = ((body.localPart || '') as string).trim().toLowerCase().replace(/[^a-z0-9]/g, '');
  let address: string;

  if (requested) {
    const isAdmin = await hasAdminSession(db, c.req.header('cookie'));
    console.log('[DEBUG] isAdmin:', isAdmin, 'requested:', requested);
    if (!isAdmin) {
      const normalizePhrases = (value: unknown): string[] => {
        if (!value) return [];
        if (Array.isArray(value)) {
          return value.filter((item): item is string => typeof item === 'string')
            .map(item => item.trim().toLowerCase()).filter(Boolean);
        }
        return [];
      };
      const [forbidden, whitelist, blacklist] = await Promise.all([
        getSetting<string[]>(db, 'forbidden_usernames'),
        getSetting<string[]>(db, 'whitelist_phrases'),
        getSetting<string[]>(db, 'blacklist_phrases'),
      ]);
      console.log('[DEBUG] forbidden:', forbidden, 'whitelist:', whitelist, 'blacklist:', blacklist);
      const blocked = [...normalizePhrases(forbidden), ...normalizePhrases(blacklist)];
      console.log('[DEBUG] blocked phrases:', blocked);
      if (blocked.some(phrase => requested.includes(phrase))) {
        console.log('[DEBUG] BLOCKED!');
        return c.json({ error: 'Username not allowed' }, 406);
      }
      const allowed = normalizePhrases(whitelist);
      if (allowed.length && !allowed.some(phrase => requested.includes(phrase))) {
        console.log('[DEBUG] NOT IN WHITELIST!');
        return c.json({ error: 'Username does not match an allowed phrase' }, 406);
      }
    }

    // Length validation
    const min = Number(await getSetting<number>(db, 'username_min') ?? 3);
    const max = Number(await getSetting<number>(db, 'username_max') ?? 30);
    if (requested.length < min || requested.length > max) {
      return c.json({ error: `Username length must be between ${min} and ${max}` }, 406);
    }

    address = `${requested}@${domain}`;

  } else {
    address = await generateUniqueAddress((addr) => inboxExists(db, addr), domain);
  }

  // Create inbox + link to session
  await createInbox(db, address);
  await linkInboxToSession(db, sid, address);

  // Log for rate limiting & used-email tracking
  await logInboxCreated(db, sid, address);

  // Stats
  await incrementStat(db, 'emails_created');

  const inbox = await getInbox(db, address);
  return c.json(inbox!, 201);
});

// ---- DELETE /inboxes/:address ----
api.delete('/inboxes/:address', async (c) => {
  const sid = sessionId(c);
  if (!sid) return c.json({ error: 'Missing x-session-id' }, 400);
  const address = decodeURIComponent(c.req.param('address'));
  await unlinkInboxFromSession(c.env.DB, sid, address);
  return c.json({ ok: true });
});

// ---- GET /inboxes/:address/messages ----
api.get('/inboxes/:address/messages', async (c) => {
  const address = decodeURIComponent(c.req.param('address'));
  const messages = await getMessages(c.env.DB, address);
  return c.json(messages);
});

export default api;
