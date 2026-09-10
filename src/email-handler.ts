import PostalMime from 'postal-mime';
import type { D1Database } from '@cloudflare/workers-types';
import { createInbox, inboxExists, insertMessage, incrementStat, trimInboxMessages } from './db/queries';
import { getSetting } from './utils/settings';

export interface EmailHandlerEnv {
  DB: D1Database;
  MAIL_DOMAIN: string;
}

/**
 * Handles inbound email via Cloudflare Email Worker.
 * Called for every email received at any @<MAIL_DOMAIN> address.
 */
export async function handleEmail(message: ForwardableEmailMessage, env: EmailHandlerEnv): Promise<void> {
  const to = message.to.toLowerCase();
  const from = message.from.toLowerCase();

  console.log(`[email] Received from=${from} to=${to}`);

  try {
    const rawStream = message.raw;
    const parser = new PostalMime();
    const parsed = await parser.parse(rawStream);

    const subject = parsed.subject || '(no subject)';
    const body = parsed.text?.trim() || '';
    const body_html = parsed.html || '';

    const db = env.DB;

    // Auto-create inbox if doesn't exist
    if (!(await inboxExists(db, to))) {
      await createInbox(db, to);
      console.log(`[email] Created new inbox: ${to}`);
    }

    // Store message
    const msgId = `msg_${Date.now()}_${crypto.randomUUID().slice(0, 8)}`;
    await insertMessage(db, { id: msgId, inbox_address: to, from_address: from, subject, body, body_html });

    // Increment daily stats
    await incrementStat(db, 'messages_received');

    // Trim inbox if over max_messages_per_inbox
    const maxStr = await getSetting<number>(db, 'max_messages_per_inbox');
    const max = Number(maxStr ?? 50);
    if (max > 0) {
      await trimInboxMessages(db, to, max);
    }

    console.log(`[email] Stored message ${msgId} for ${to}`);
  } catch (err) {
    console.error(`[email] Failed to process email for ${to}:`, err);
    // Don't throw — never bounce
  }
}
