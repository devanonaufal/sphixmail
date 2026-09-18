# ✉️ Sphixmail

Personal disposable email service with OTP auto-extraction API. Built on Cloudflare Workers — zero cost, zero maintenance.

**Live:** [sphixray.com](https://sphixray.com)

---

## Tech Stack

- **Cloudflare Workers** — Serverless edge computing
- **Cloudflare D1** — SQLite database
- **Cloudflare Email Routing** — Catch-all email handler
- **Hono** — Web framework
- **TypeScript** — Type-safe backend
- **Vanilla JS** — Frontend

---

## Features

- ✅ Auto OTP extraction (4-8 digit codes)
- ✅ REST API with key-based authentication
- ✅ Multi-domain support
- ✅ Real-time inbox (2s auto-refresh)
- ✅ HTML email rendering (sandboxed iframe)
- ✅ Admin panel (stats, domains, API keys, settings)
- ✅ Dark/light mode
- ✅ Auto-cleanup cron (hourly)
- ✅ Rate limiting per API key

---

## Project Structure

```
sphixmail/
├── wrangler.toml              # Cloudflare config
├── src/
│   ├── index.ts               # Main entry point
│   ├── email-handler.ts       # Email processing (MIME parser, inline images)
│   ├── cron.ts                # Hourly cleanup
│   ├── api/
│   │   ├── routes.ts          # Session-based API
│   │   └── public.ts          # Public REST API (with API key)
│   ├── admin/
│   │   ├── routes.ts          # Admin endpoints
│   │   └── middleware.ts      # Auth middleware
│   ├── db/
│   │   ├── schema.sql         # Database schema
│   │   └── queries.ts         # DB queries
│   ├── utils/
│   │   ├── random-address.ts  # Indonesian name generator
│   │   ├── otp-extractor.ts   # OTP regex extraction
│   │   ├── hash.ts            # SHA-256 password hashing
│   │   └── settings.ts        # Settings helpers
│   └── web/
│       ├── index.html         # Main UI
│       ├── admin.html         # Admin panel
│       ├── api-doc.html       # API docs
│       ├── docs.html          # User guide
│       ├── app.js             # Main UI logic
│       ├── admin.js           # Admin logic
│       ├── api-doc.js         # API docs logic
│       ├── docs.js            # Docs logic
│       └── styles.css         # Global styles
```

---

## Quick Start

### 1. Setup

```bash
git clone <this-repo>
cd sphixmail
npm install
```

### 2. Create Database

```bash
npm run db:create
# Copy database_id from output
```

Edit `wrangler.toml`:
```toml
[[d1_databases]]
database_id = "YOUR-DATABASE-ID-HERE"

[vars]
MAIL_DOMAIN = "sphixray.com"
WEB_HOST = "sphixray.com"
ADMIN_PASSWORD_HASH = "your-sha256-hash"
```

Generate password hash:
```bash
node -e "const p='yourPassword';crypto.subtle.digest('SHA-256',new TextEncoder().encode(p)).then(b=>console.log([...new Uint8Array(b)].map(x=>x.toString(16).padStart(2,'0')).join('')))"
```

### 3. Deploy

```bash
npm run db:migrate
npm run deploy
```

### 4. Setup Email Routing

Di Cloudflare Dashboard:
1. Domain → Email Routing → Enable
2. Catch-all address → Send to Worker → `sphixmail`

---

## API Documentation

Base URL: `https://sphixray.com/pub/`

All endpoints require API key (create in Admin Panel).

### List Domains
```bash
GET /pub/domains/:apikey
```

### Validate Email
```bash
GET /pub/email/:email/:apikey
```

### Get Messages
```bash
GET /pub/messages/:email/:apikey?limit=10
```

### Delete Message
```bash
DELETE /pub/message/:id/:apikey
```

### Get Stats
```bash
GET /pub/stats/:apikey
```

### Wait for OTP (Long-Polling)
```bash
GET /pub/inbox/:email/wait-otp/:apikey?timeout=60&subject_contains=verify
```

Response:
```json
{
  "found": true,
  "otp": "123456",
  "message": {
    "id": "msg_abc",
    "from": "noreply@service.com",
    "subject": "Your OTP",
    "body_text": "Your code is: 123456",
    "received_at": "2026-09-18T10:00:00Z"
  }
}
```

**Full API docs:** [sphixray.com/api-doc.html](https://sphixray.com/api-doc.html)

---

## Bot Automation Example

```python
import requests

API_KEY = "rm_your_api_key"
BASE = "https://sphixray.com"
email = "bot123@sphixray.com"

# 1. Register to target service
# ...

# 2. Wait for OTP
r = requests.get(
    f"{BASE}/pub/inbox/{email}/wait-otp/{API_KEY}",
    params={"timeout": 60, "subject_contains": "verify"}
)

# 3. Get OTP
if r.json()["found"]:
    otp = r.json()["otp"]
    print(f"OTP: {otp}")
    # Use OTP in your bot...
```

---

## Configuration

### Settings (via Admin Panel)

- `forbidden_usernames` - Blacklist usernames
- `username_min/max` - Length validation
- `daily_inbox_limit` - Rate limiting
- `auto_delete_enabled` - Auto cleanup
- `delete_value/unit` - Cleanup interval
- `max_messages_per_inbox` - Inbox quota

### Domain Types

- **open** - Public, anyone can use
- **admin** - Only visible when logged in as admin

---

## Maintenance

### Redeploy
```bash
npm run deploy
```

### Database Migration
```bash
npm run db:migrate
```

### Cron Jobs
Automatic cleanup runs every hour (configured in `wrangler.toml`):
- Delete old messages (if auto-delete enabled)
- Clean expired sessions
- Purge old logs

---

## Admin Access

URL: `https://sphixray.com/admin.html`  
Default username: `admin`  
Password: as configured in `wrangler.toml`

Features:
- Dashboard with charts (7d/6w/12m/7y)
- Domain management
- API key management (create, revoke, rate limits)
- Settings editor
- Appearance customization (background, mascot)

---

## Security Notes

- All API endpoints require valid API key
- Admin login: HttpOnly cookie, 24h session, 15min lockout after 5 failed attempts
- Passwords: SHA-256 hashed (consider upgrading to PBKDF2 for production)
- HTML emails: rendered in sandboxed iframe
- Rate limiting: per API key
- No external scripts loaded

---

## Tech Details

- **Worker limits:** 100k requests/day (free tier)
- **D1 limits:** 5GB storage, 5M rows (free tier)
- **Email routing:** 200 emails/day (free tier)
- **Global edge:** Deployed to 275+ locations
- **Response time:** <50ms average

---

## Notes

Private project for personal use.

Built by: Devano Naufal  
Domain: sphixray.com  
Stack: Cloudflare Workers + D1 + Hono
