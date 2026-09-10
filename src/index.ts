import api from './api/routes';
import pub from './api/public';
import adminRouter from './admin/routes';
import { handleEmail } from './email-handler';
import { handleCron } from './cron';
import type { EmailHandlerEnv } from './email-handler';
import type { ApiEnv } from './api/routes';
import type { PublicApiEnv } from './api/public';
import type { AdminEnv } from './admin/routes';
import type { CronEnv } from './cron';

/**
 * Sphixmail — Disposable Temp Mail on Cloudflare Workers
 * Developed by Devano Naufal (sphixray)
 *
 * Handles:
 * - fetch()      → API routes (static files via Cloudflare Assets)
 * - email()      → inbound email via Cloudflare Email Worker
 * - scheduled()  → cron cleanup via Cloudflare Cron Triggers
 */

export interface Env extends ApiEnv, EmailHandlerEnv, PublicApiEnv, AdminEnv, CronEnv {}

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url);

    // Internal session-based API
    if (url.pathname.startsWith('/api/')) {
      const apiUrl = new URL(request.url);
      apiUrl.pathname = url.pathname.slice(4); // strip '/api'
      return api.fetch(new Request(apiUrl, request), env, ctx);
    }

    // Public key-based API (/pub/domains/:key, /pub/messages/:email/:key, etc.)
    if (url.pathname.startsWith('/pub/')) {
      const pubUrl = new URL(request.url);
      pubUrl.pathname = url.pathname.slice(4); // strip '/pub'
      return pub.fetch(new Request(pubUrl, request), env, ctx);
    }

    // Admin API (/admin/login, /admin/stats, /admin/domains, etc.)
    if (url.pathname.startsWith('/admin/')) {
      const adminUrl = new URL(request.url);
      adminUrl.pathname = url.pathname.slice(6); // strip '/admin'
      return adminRouter.fetch(new Request(adminUrl, request), env, ctx);
    }

    return new Response('Not found', { status: 404 });
  },

  async email(message: ForwardableEmailMessage, env: Env, _ctx: ExecutionContext): Promise<void> {
    await handleEmail(message, env);
  },

  async scheduled(_event: ScheduledEvent, env: Env, _ctx: ExecutionContext): Promise<void> {
    await handleCron(env);
  },
};
