<div align="center">

<img src="https://img.shields.io/badge/Cloudflare%20Workers-F38020?style=for-the-badge&logo=cloudflare&logoColor=white" />
<img src="https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white" />
<img src="https://img.shields.io/badge/Hono-E36002?style=for-the-badge&logo=hono&logoColor=white" />
<img src="https://img.shields.io/badge/D1%20SQLite-003B57?style=for-the-badge&logo=sqlite&logoColor=white" />

# ✉ Sphixmail

### Disposable Temporary Email — Self-Hosted, Serverless, Free

**Sphixmail** is a fully self-hosted disposable email service built on Cloudflare Workers. No server, no VPS, no monthly cost. Deploy it to 275+ edge locations worldwide in minutes.

🌐 **[Live Demo: sawith.net](https://sawith.net)** | 📖 **[Documentation](https://sawith.net/docs.html)** | 🔌 **[API Reference](https://sawith.net/api-doc.html)**

*Built with ❤️ by [Devano Naufal](https://github.com/devanonaufal)*

</div>

---

## Table of Contents

- [Why Sphixmail?](#why-sphixmail)
- [Live Demo](#live-demo)
- [Features](#features)
- [Screenshots](#screenshots)
- [Project Structure](#project-structure)
- [Deployment Guide](#deployment-guide)
- [Configuration](#configuration)
- [Public REST API](#public-rest-api)
- [Documentation](#documentation)
- [Security](#security)
- [Database Schema](#database-schema)
- [Multi-Domain](#multi-domain)
- [Maintenance](#maintenance)
- [Contributing](#contributing)
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

## Live Demo

Try Sphixmail instantly at **[sawith.net](https://sawith.net)**

**Quick Start:**
1. Visit [sawith.net](https://sawith.net)
2. Click the arrow button to generate a random email address
3. Copy the email and use it anywhere
4. Return to see incoming messages in real-time

**Full Documentation:** [docs.html](https://sawith.net/docs.html)  
**API Reference:** [api-doc.html](https://sawith.net/api-doc.html) (interactive playground)

---

## Screenshots

<div align="center">

### 🌙 Dark Mode - Main Interface
*Clean, modern UI with auto-refreshing inbox and OTP detection*

### ☀️ Light Mode - Email Reading
*HTML emails rendered safely in isolated iframe with syntax highlighting*

### 🔧 Admin Panel - Dashboard
*Real-time statistics with charts for 7 days, 6 weeks, 12 months, or 7 years*

### 🎨 Appearance Customization
*Custom backgrounds, mascot positioning, and transparency controls*

</div>

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

## Documentation

### 📚 Complete User Guide

Visit **[sawith.net/docs.html](https://sawith.net/docs.html)** for comprehensive documentation including:

- **Getting Started**: Creating your first inbox
- **Email Management**: Receiving, reading, and organizing messages
- **OTP Auto-detection**: Automatic verification code extraction
- **API Integration**: Complete REST API reference with examples
- **FAQ**: Common questions and troubleshooting

### 🔌 Interactive API Documentation

Visit **[sawith.net/api-doc.html](https://sawith.net/api-doc.html)** for:

- **Live API Playground**: Test endpoints directly in your browser
- **Request/Response Examples**: Copy-paste ready code snippets
- **Authentication Guide**: API key setup and usage
- **Rate Limiting Info**: Understand usage quotas
- **Long-polling Guide**: OTP wait endpoint usage

### 📖 Available in Multiple Languages

All documentation is available in:
- 🇺🇸 **English**
- 🇮🇩 **Bahasa Indonesia**

Toggle language in the top-right corner of any page.

### 🎓 Quick Links

- [How to create a custom username](https://sawith.net/docs.html#create)
- [Understanding OTP auto-extraction](https://sawith.net/docs.html#otp)
- [Using the wait-otp endpoint](https://sawith.net/docs.html#api-wait)
- [Setting up API keys](https://sawith.net/admin.html)
- [Multi-domain configuration](https://sawith.net/docs.html#api-domains)

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

Contributions are welcome! Whether it's bug reports, feature requests, or code improvements, your help makes Sphixmail better for everyone.

### 🐛 Found a Bug?

1. Check [existing issues](https://github.com/devanonaufal/sphixmail/issues) to avoid duplicates
2. Open a new issue with:
   - Clear description of the problem
   - Steps to reproduce
   - Expected vs actual behavior
   - Your environment (browser, OS, Cloudflare region if relevant)

### 💡 Have a Feature Request?

1. Open an issue with the `enhancement` label
2. Describe the feature and its use case
3. Explain why it would benefit other users

### 🔧 Want to Contribute Code?

1. Fork this repository
2. Create a feature branch: `git checkout -b feature/your-feature`
3. Make your changes following the existing code style
4. Test thoroughly (both frontend and backend if applicable)
5. Commit with clear messages: `git commit -m "feat: add your feature"`
6. Push to your fork: `git push origin feature/your-feature`
7. Open a Pull Request with:
   - Clear description of changes
   - Screenshots/demos for UI changes
   - Any breaking changes highlighted

### 📋 Development Setup

```bash
# Clone your fork
git clone https://github.com/YOUR-USERNAME/sphixmail.git
cd sphixmail

# Install dependencies
npm install

# Run local development
npm run dev

# Test database migrations
npm run db:local
```

### 🎨 Code Style

- **TypeScript**: Follow existing patterns in `src/`
- **Frontend**: Vanilla JS (no frameworks), semantic HTML, CSS custom properties
- **Comments**: Add `ponytail:` comments for deliberate simplifications with upgrade paths
- **Commits**: Use conventional commit format (`feat:`, `fix:`, `docs:`, `refactor:`)

---

## License

**MIT License** — Free to use, modify, and distribute.

Copyright (c) 2026 Devano Naufal

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

---

## Acknowledgments

**Sphixmail** is built with:
- [Cloudflare Workers](https://workers.cloudflare.com/) - Serverless edge computing
- [Cloudflare D1](https://developers.cloudflare.com/d1/) - Distributed SQLite database
- [Hono](https://hono.dev/) - Lightweight web framework
- [Postal-MIME](https://github.com/postalsys/postal-mime) - Fast email parser

Special thanks to the open-source community for these amazing tools.

---

<div align="center">

## 🌟 Support This Project

If Sphixmail helps you, consider:

⭐ **[Star this repository](https://github.com/devanonaufal/sphixmail)** on GitHub

🐛 **[Report issues](https://github.com/devanonaufal/sphixmail/issues)** to help improve it

🔀 **[Contribute code](https://github.com/devanonaufal/sphixmail/pulls)** to add features

---

**Built with ❤️ by [Devano Naufal](https://github.com/devanonaufal)**

🌐 [Live Demo](https://sawith.net) • 📖 [Documentation](https://sawith.net/docs.html) • 🔌 [API Reference](https://sawith.net/api-doc.html)

---

*Sphixmail - Free, Fast, and Privacy-Focused Temporary Email*

</div>
