<div align="center">

<img src="https://img.shields.io/badge/Cloudflare%20Workers-F38020?style=for-the-badge&logo=cloudflare&logoColor=white" />
<img src="https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white" />
<img src="https://img.shields.io/badge/Hono-E36002?style=for-the-badge&logo=hono&logoColor=white" />
<img src="https://img.shields.io/badge/D1%20SQLite-003B57?style=for-the-badge&logo=sqlite&logoColor=white" />

# ✉ Sphixmail

### Disposable Temporary Email — Self-Hosted, Serverless, Free

**Sphixmail** is a fully self-hosted disposable email service built on Cloudflare Workers. No server, no VPS, no monthly cost. Deploy it to 275+ edge locations worldwide in minutes.

*Built by [Devano Naufal](https://github.com/devanonaufal)*

</div>

---

## Table of Contents

- [Why Sphixmail?](#why-sphixmail)
- [Features](#features)
- [Project Structure](#project-structure)
- [Deployment Guide](#deployment-guide)
- [Configuration](#configuration)
- [Public REST API](#public-rest-api)
- [Security](#security)
- [Database Schema](#database-schema)
- [Multi-Domain](#multi-domain)
- [Maintenance](#maintenance)
- [License](#license)

---

## Why Sphixmail?

| Feature | Sphixmail | Alternatives |
|---|---|---|
| **Hosting cost** | Free (CF Workers free tier) | $5–$20/month VPS |
| **Infrastructure** | Serverless, 275+ edge nodes | Single server |
| **Latency** | < 50ms globally | Location-dependent |
| **Data ownership** | ✅ You own your data | ❌ Third-party servers |
| **REST API** | ✅ Built-in with API Keys | Limited / paid |
| **Admin Panel** | ✅ Full-featured web UI | ❌ None |
| **OTP Auto-extract** | ✅ Automatic | ❌ Manual |
| **Multi-domain** | ✅ Unlimited via Admin Panel | Limited |
| **Open source** | ✅ MIT License | Varies |

---

## Features

### 📬 Instant Disposable Inbox
- Create a temporary email address instantly — **no sign-up, no login required**
- Custom username or randomly generated (Indonesian-style names)
- Multiple domains supported — user can pick at creation time
- **Fast polling**: 2-second refresh for 30 seconds after inbox creation, then 3-second normal polling
- **Smart paste**: paste a full email address (`user@domain.com`) to auto-fill username and select domain
- **Auto-detect OTP**: extracts verification codes from plain text and HTML emails
- **One-click OTP copy**: badge + copy button appears automatically when OTP detected
- HTML emails rendered safely inside an isolated iframe
- Last active inbox and selected domain persisted via `localStorage` across refreshes

### 🕐 Realtime WIB Clock
- Live clock (Asia/Jakarta / WIB) displayed in the navbar
- All email timestamps shown as relative time with full WIB datetime on hover
- UTC-aware timestamp parsing — no timezone drift from SQLite storage

### 🎨 Appearance Customization
- **Custom background**: upload image with adjustable transparency
- **Mascot/decoration**: position a character or logo anywhere on the page (X/Y coordinates + size)
- **Smart change detection**: "unsaved changes" warning only appears when settings actually differ from saved state
- All appearance settings managed through Admin Panel — no code changes required

### 🌐 REST API for Developers
Connect Sphixmail to bots, scripts, or automation tools using API Keys:

```
GET    /pub/domains/[apikey]            → list active domains
GET    /pub/email/[email]/[apikey]      → validate email address
GET    /pub/messages/[email]/[apikey]   → fetch all messages in inbox
DELETE /pub/message/[id]/[apikey]       → delete a specific message
GET    /pub/stats/[apikey]              → usage statistics
GET    /pub/inbox/[email]/wait-otp      → wait for OTP email (no key required)
```

### ⚡ Automatic OTP Extraction
OTP codes are extracted automatically from incoming emails (both plain text and HTML):

```bash
curl "https://yourmail.com/pub/inbox/user@domain.com/wait-otp?timeout=30&subject_contains=OTP"

# Response:
# { "found": true, "otp": "123456", "message": {...} }
```

Ideal for automated testing, registration bots, and scraping workflows.

### 🛡️ Full-Featured Admin Panel
Manage everything through a secure web-based admin panel:

- **Dashboard** — statistics and charts for received messages (7d / 6w / 12m / 7y)
- **Domains** — add/remove domains, set open or member-only access, toggle active state
- **API Keys** — create, revoke, and manage keys with per-minute rate limits
- **Settings** — configure all options without touching code
- **Appearance** — customize background, mascot, and visual theme
- **Access Control** — whitelist/blacklist username phrases with admin bypass

### ⚙️ Zero-Code Configuration
Everything configurable from the admin panel — no file edits or redeployment needed:

| Setting | Description |
|---|---|
| Forbidden usernames | Block reserved words (admin, root, etc.) — exact match |
| Whitelist phrases | Require username to contain specific phrases (e.g., "test", "demo") |
| Blacklist phrases | Block usernames containing specific phrases (e.g., "spam", "abuse") |
| Admin bypass | Logged-in admin can create any username, bypassing all restrictions |
| Username length | Min and max character limits |
| Daily inbox limit | Max inboxes per session per day |
| Auto-delete messages | Delete after X minutes/hours/days/weeks |
| Max messages per inbox | Storage cap per inbox |
| Export / Import settings | Backup and restore configuration |

### 🌍 Internationalization
Available in **English 🇺🇸** and **Bahasa Indonesia 🇮🇩** — toggle in the top-right corner. Preference is saved automatically.

---

## Project Structure

```
sphixmail/
├── wrangler.toml              # Cloudflare Workers configuration
├── package.json
├── tsconfig.json
└── src/
    ├── index.ts               # Entry point: handles fetch, email, and cron events
    ├── email-handler.ts       # Processes and stores inbound emails
    ├── cron.ts                # Hourly cleanup scheduler
    ├── api/
    │   ├── routes.ts          # Internal session-based API
    │   └── public.ts          # Public API (API key authenticated)
    ├── admin/
    │   ├── middleware.ts      # Admin auth middleware
    │   └── routes.ts          # All admin endpoints
    ├── db/
    │   ├── schema.sql         # Database schema
    │   └── queries.ts         # Database access functions
    ├── utils/
    │   ├── random-address.ts  # Random email address generator
    │   ├── otp-extractor.ts   # OTP code extractor
    │   ├── hash.ts            # Password hashing (SHA-256)
    │   └── settings.ts        # Admin settings read/write
    └── web/
        ├── index.html         # Main page
        ├── api-doc.html       # Interactive API documentation
        ├── admin.html         # Admin panel
        ├── app.js             # Main page logic
        ├── api-doc.js         # API documentation logic
        ├── admin.js           # Admin panel logic
        └── styles.css         # Styles (dark mode, amber, glassmorphism)
```

---

## Deployment Guide

> No server experience needed. Everything runs free on Cloudflare.

### Prerequisites
- A [Cloudflare](https://dash.cloudflare.com) account (free)
- A domain connected to Cloudflare (required to receive email)
- [Node.js](https://nodejs.org) v18 or higher installed locally

---

### Step 1 — Clone & Install

```bash
git clone https://github.com/devanonaufal/sphixmail.git
cd sphixmail
npm install
```

---

### Step 2 — Create the Database

```bash
npm run db:create
```

Copy the `database_id` from the output:

```
✅ Created your database: sphixmail-db
database_id = "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
```

Open `wrangler.toml` and paste the ID:

```toml
[[d1_databases]]
binding = "DB"
database_name = "sphixmail-db"
database_id = "PASTE-YOUR-ID-HERE"
```

---

### Step 3 — Configure Environment

Edit the `[vars]` section in `wrangler.toml`:

```toml
[vars]
APP_NAME = "Sphixmail"
MAIL_DOMAIN = "mail.yourdomain.com"       # Primary domain (additional domains added via Admin Panel)
WEB_HOST = "sphixmail.yourdomain.com"     # Domain for the web UI
ADMIN_PASSWORD_HASH = "your-sha256-hash"  # See Step 4
```

---

### Step 4 — Generate Admin Password Hash

```bash
node -e "
  const p = 'yourPassword';
  crypto.subtle.digest('SHA-256', new TextEncoder().encode(p))
    .then(b => console.log([...new Uint8Array(b)].map(x=>x.toString(16).padStart(2,'0')).join('')));
"
```

Copy the output and paste it into `ADMIN_PASSWORD_HASH` in `wrangler.toml`.

---

### Step 5 — Deploy

```bash
# Initialize database tables
npm run db:migrate

# Deploy to Cloudflare
npm run deploy
```

---

### Step 6 — Enable Email Routing

In [Cloudflare Dashboard](https://dash.cloudflare.com):

1. Select your domain → **Email** → **Email Routing**
2. Click **Enable Email Routing**
3. Scroll to **Catch-all address** → action: **Send to Worker** → select `sphixmail`
4. Save

All emails sent to `*@mail.yourdomain.com` will now be processed by Sphixmail.

---

### After Deployment

1. Open `https://yourwebdomain.com/admin.html`
2. Log in with username `admin` and the password you set
3. Go to **API Keys** tab → create a new key to start using the API

---

## Configuration

### Full wrangler.toml example

```toml
name = "sphixmail"
main = "src/index.ts"
compatibility_date = "2025-06-01"

[[d1_databases]]
binding = "DB"
database_name = "sphixmail-db"
database_id = "YOUR-DATABASE-ID"

[vars]
APP_NAME = "Sphixmail"
MAIL_DOMAIN = "mail.example.com"         # Primary domain only — add more via Admin Panel
WEB_HOST = "sphixmail.example.com"
ADMIN_PASSWORD_HASH = "your-sha256-hash"

[triggers]
crons = ["0 * * * *"]   # automatic cleanup every hour
```

### Admin Panel Settings Reference

| Key | Description | Default |
|---|---|---|
| `forbidden_usernames` | Blocked usernames, e.g. `["admin","root"]` | `[]` |
| `username_min` | Minimum username length | `3` |
| `username_max` | Maximum username length | `30` |
| `daily_inbox_limit` | Max inboxes per session per day (0 = unlimited) | `10` |
| `auto_delete_enabled` | Enable automatic message deletion | `false` |
| `delete_value` | Amount to delete after (e.g. `7`) | `7` |
| `delete_unit` | Unit: `m`=minute, `h`=hour, `d`=day, `w`=week, `mo`=month | `d` |
| `max_messages_per_inbox` | Max stored messages per inbox (0 = unlimited) | `50` |

---

## Public REST API

Base URL: `https://yourmail.com/pub/`

All endpoints require an API Key except `wait-otp`. Create keys in **Admin Panel → API Keys**.

### List Active Domains

```
GET /pub/domains/[apikey]
```

```json
{
  "success": true,
  "count": 1,
  "domains": [
    { "domain": "mail.example.com", "type": "open", "added_at": "2026-01-01T00:00:00Z" }
  ]
}
```

### Validate Email

```
GET /pub/email/[email]/[apikey]
```

```json
{ "success": true, "email": "user@mail.example.com", "local": "user", "domain": "mail.example.com" }
```

### Fetch Messages

```
GET /pub/messages/[email]/[apikey]
GET /pub/messages/[email]/[apikey]?limit=5
```

```json
{
  "success": true,
  "count": 1,
  "messages": [{
    "id": "msg_123",
    "from": "noreply@github.com",
    "subject": "Verify your account",
    "body_text": "...",
    "body_html": "...",
    "received_at": "2026-09-10T00:00:00Z"
  }]
}
```

### Delete Message

```
DELETE /pub/message/[id]/[apikey]
```

```json
{ "success": true, "deleted_id": "msg_123" }
```

### Statistics

```
GET /pub/stats/[apikey]
GET /pub/stats/[apikey]?filters=total_messages,unread_messages
```

```json
{
  "data": {
    "total_messages": 1234,
    "current_messages": 87,
    "unread_messages": 12,
    "unread_messages_percentage": "14%"
  }
}
```

### Wait for OTP (no API Key required)

Blocks until an OTP email arrives or the timeout is reached:

```
GET /pub/inbox/[email]/wait-otp
GET /pub/inbox/[email]/wait-otp?timeout=30&subject_contains=OTP&after=[message_id]
```

| Parameter | Description | Default |
|---|---|---|
| `timeout` | Max wait time in seconds (max: 60) | `30` |
| `subject_contains` | Filter by keyword in subject | — |
| `after` | Only return emails after this message ID | — |

```bash
curl "https://yourmail.com/pub/inbox/user%40mail.example.com/wait-otp?timeout=30"
# { "found": true, "otp": "123456", "message": { ... } }
# or on timeout:
# { "found": false, "message": "Timeout - no email received" }
```

---

## Security

- **Admin login**: HttpOnly + SameSite cookie, expires after 24 hours
- **Lockout**: 5 failed login attempts → 15-minute lockout
- **API Keys**: stored in database, revocable at any time, optional expiry date
- **Rate limiting**: per-minute request cap per API key
- **Public inbox model**: any address is readable by anyone — designed for disposable/OTP use
- **Safe HTML email**: rendered inside a sandboxed iframe — no external scripts execute
- **Password hashing**: SHA-256 via Web Crypto API
- **Anti-devtools**: right-click and keyboard shortcut blocking on the public UI

---

## Database Schema

Tables created automatically on first deploy:

| Table | Purpose |
|---|---|
| `inboxes` | Registered inbox addresses |
| `messages` | Incoming emails |
| `sessions` | Anonymous browser sessions |
| `session_inboxes` | Session ↔ inbox associations |
| `domains` | Active email domains |
| `admin` | Admin login credentials |
| `admin_sessions` | Admin session tokens |
| `api_keys` | API key records |
| `settings` | Admin-configurable settings |
| `stats` | Daily usage statistics |
| `inbox_logs` | Inbox creation history (rate limiting) |

---

## Multi-Domain

Support multiple email domains simultaneously — **no redeployment needed**:

1. Enable Email Routing for each domain in Cloudflare Dashboard and route catch-all to the `sphixmail` worker
2. Open **Admin Panel → Domains** → click **Add Domain**
3. Enter the domain name → Save

The new domain immediately appears in the frontend dropdown and starts receiving emails.

> `MAIL_DOMAIN` in `wrangler.toml` is only used as the initial seed domain on first deploy. All domain management after that is done through the Admin Panel.

---

## Maintenance

### Redeploy after code changes:
```bash
npm run deploy
```

### Run database migrations (after schema changes):
```bash
npm run db:migrate
```

> Safe to run multiple times — existing data is never dropped.

### Automatic Cleanup (Cron)
Every hour, Cloudflare runs automated maintenance:
- Delete old messages (if auto-delete is enabled in Settings)
- Purge old logs (> 2–3 days)
- Remove expired admin sessions

---

## Contributing

Pull requests, bug reports, and feature ideas are welcome.

1. Fork this repository
2. Create a branch: `git checkout -b feature/your-feature`
3. Commit your changes: `git commit -m "feat: add your feature"`
4. Push: `git push origin feature/your-feature`
5. Open a Pull Request

---

## License

MIT License — free to use, modify, and distribute.

---

<div align="center">

Built with ❤️ by **[Devano Naufal](https://github.com/devanonaufal)**

*If this project helps you, consider leaving a ⭐ on GitHub!*

</div>
