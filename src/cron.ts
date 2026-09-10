import type { D1Database } from '@cloudflare/workers-types';
import {
  deleteOldMessages,
  deleteOldInboxLogs,
  deleteOldCronLogs,
  cleanExpiredAdminSessions,
  addCronLog,
} from './db/queries';
import { getSetting } from './utils/settings';

export interface CronEnv {
  DB: D1Database;
}

/**
 * Cloudflare Workers Cron Trigger handler.
 * Runs every hour (configured in wrangler.toml: crons = ["0 * * * *"]).
 *
 * Tasks:
 * 1. Auto-delete old messages (if enabled)
 * 2. Delete old inbox_logs (older than 1 day, for rate limit reset)
 * 3. Delete old cron_logs (older than 3 days)
 * 4. Clean expired admin sessions
 */
export async function handleCron(env: CronEnv): Promise<void> {
  const db = env.DB;
  const now = new Date();

  try {
    // 1. Auto-delete messages
    const enabled = await getSetting<boolean>(db, 'auto_delete_enabled');
    if (enabled) {
      const value = Number(await getSetting<number>(db, 'delete_value') ?? 7);
      const unit = String(await getSetting<string>(db, 'delete_unit') ?? 'd');

      const cutoff = new Date(now);
      switch (unit) {
        case 'm': cutoff.setMinutes(cutoff.getMinutes() - value); break;
        case 'h': cutoff.setHours(cutoff.getHours() - value); break;
        case 'w': cutoff.setDate(cutoff.getDate() - value * 7); break;
        case 'mo': cutoff.setMonth(cutoff.getMonth() - value); break;
        default: cutoff.setDate(cutoff.getDate() - value); // 'd'
      }

      const deleted = await deleteOldMessages(db, cutoff.toISOString());
      if (deleted > 0) {
        await addCronLog(db, `Auto-deleted ${deleted} messages older than ${value}${unit}`);
      }
    }

    // 2. Delete old inbox_logs (older than 2 days — daily limit resets naturally)
    const logCutoff = new Date(now);
    logCutoff.setDate(logCutoff.getDate() - 2);
    await deleteOldInboxLogs(db, logCutoff.toISOString());

    // 3. Delete old cron_logs (older than 3 days)
    await deleteOldCronLogs(db);

    // 4. Clean expired admin sessions
    await cleanExpiredAdminSessions(db);

  } catch (err) {
    console.error('[cron] Error:', err);
    await addCronLog(db, `Cron error: ${String(err)}`).catch(() => {});
  }
}
