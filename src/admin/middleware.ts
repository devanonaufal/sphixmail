import type { MiddlewareHandler } from 'hono';
import type { D1Database } from '@cloudflare/workers-types';
import { getAdminSession } from '../db/queries';

export interface AdminAuthEnv {
  DB: D1Database;
}

const COOKIE_NAME = 'sphixmail_admin';

export function getCookieToken(cookieHeader: string | null | undefined): string | null {
  if (!cookieHeader) return null;
  const match = cookieHeader.match(new RegExp(`(?:^|;\\s*)${COOKIE_NAME}=([^;]+)`));
  return match ? match[1] : null;
}

/**
 * Middleware: require valid admin session cookie.
 * Returns 401 JSON if not authenticated.
 */
export const requireAdmin: MiddlewareHandler<{ Bindings: AdminAuthEnv }> = async (c, next) => {
  const token = getCookieToken(c.req.header('cookie'));
  if (!token) return c.json({ error: 'Unauthorized' }, 401);

  const session = await getAdminSession(c.env.DB, token);
  if (!session) return c.json({ error: 'Unauthorized' }, 401);

  await next();
};
