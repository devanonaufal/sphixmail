import type { D1Database } from '@cloudflare/workers-types';

/**
 * Read a setting value from D1. Returns parsed JSON value or null.
 */
export async function getSetting<T = unknown>(db: D1Database, key: string): Promise<T | null> {
  const row = await db.prepare('SELECT value FROM settings WHERE key = ?').bind(key).first<{ value: string }>();
  if (!row) return null;
  try {
    return JSON.parse(row.value) as T;
  } catch {
    return row.value as unknown as T;
  }
}

/**
 * Write a setting value to D1. Serializes to JSON.
 */
export async function setSetting(db: D1Database, key: string, value: unknown): Promise<void> {
  const json = JSON.stringify(value);
  await db
    .prepare('INSERT INTO settings (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value')
    .bind(key, json)
    .run();
}

/**
 * Read all settings as a plain object.
 */
export async function getAllSettings(db: D1Database): Promise<Record<string, unknown>> {
  const rows = await db.prepare('SELECT key, value FROM settings').all<{ key: string; value: string }>();
  const out: Record<string, unknown> = {};
  for (const row of rows.results) {
    try { out[row.key] = JSON.parse(row.value); } catch { out[row.key] = row.value; }
  }
  return out;
}

/**
 * Bulk-import settings from a plain object (for import/restore).
 */
export async function importSettings(db: D1Database, data: Record<string, unknown>): Promise<void> {
  const stmts = Object.entries(data).map(([key, value]) =>
    db.prepare('INSERT INTO settings (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value')
      .bind(key, JSON.stringify(value))
  );
  await db.batch(stmts);
}
