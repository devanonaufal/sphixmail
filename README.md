<div align="center">

<img src="https://img.shields.io/badge/Cloudflare%20Workers-F38020?style=for-the-badge&logo=cloudflare&logoColor=white" />
<img src="https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white" />
<img src="https://img.shields.io/badge/Hono-E36002?style=for-the-badge&logo=hono&logoColor=white" />
<img src="https://img.shields.io/badge/D1%20SQLite-003B57?style=for-the-badge&logo=sqlite&logoColor=white" />

# ✉️ Sphixmail

### The Modern Disposable Email Service — Privacy-First, Lightning-Fast, Zero Cost

Sphixmail is a fully self-hosted, temporary email solution that runs on Cloudflare's global edge network. Get instant, disposable email addresses for testing, verification, and privacy protection — without servers, maintenance, or monthly bills.

**Deploy once. Run forever. Completely free.**

[**Live Demo**](https://sphixray.com) · [**Documentation**](https://sphixray.com/docs.html) · [**API Reference**](https://sphixray.com/api-doc.html) · [**GitHub**](https://github.com/devanonaufal/sphixmail)

</div>

---

## Table of Contents

- [Why Sphixmail?](#why-sphixmail)
- [Sphixmail vs. Other Solutions](#sphixmail-vs-other-solutions)
- [Live Demo](#live-demo)
- [Features](#features)
- [Project Structure](#project-structure)
- [Deployment Guide](#deployment-guide)
- [Configuration](#configuration)
- [Public REST API](#public-rest-api)
- [Documentation](#documentation)
- [Security](#security)
- [Database Schema](#database-schema)
- [Multi-Domain Support](#multi-domain-support)
- [Maintenance](#maintenance)
- [Contributing](#contributing)
- [License](#license)
- [Acknowledgments](#acknowledgments)

---

## Why Sphixmail?

Traditional temp mail services often track your data, load slowly under ad networks, or charge monthly fees for basic features. Sphixmail gives you complete control instead:

- **100% free forever** — no hidden costs, no premium tiers
- **Your data, your server** — self-hosted on your own domain
- **Lightning fast** — deployed to 275+ global edge locations
- **Zero maintenance** — serverless architecture, no upkeep required
- **Powerful API** — automate testing, bots, and workflows
- **Modern UI** — clean design with dark mode and mobile support

---

## Sphixmail vs. Other Solutions

| Capability | Sphixmail | Typical Temp Mail | Self-Managed VPS |
|---|---|---|---|
| Monthly cost | $0 forever | Free (with ads) or $5–10/mo | $5–20/mo + upkeep |
| Speed | Sub-50ms globally | Varies, often slow | Depends on location |
| Privacy | You own everything | Tracked and monetized | You own it |
| Ads | None | Common | None |
| Setup time | ~10 minutes | Instant, but limited | Hours to days |
| Maintenance | None | None needed | Manual updates required |
| API access | Full REST API | Limited or paid | Build your own |
| Custom domain | Yes | No | Yes |
| OTP extraction | Automatic | Manual | Not available |
| Admin panel | Full-featured | None | Build your own |
| Multi-domain support | Unlimited | Single domain | Yes |
| Email storage | Your database | Their servers | Your server |
| Uptime | 99.99% (Cloudflare) | Varies | Your responsibility |

**Bottom line:** Sphixmail delivers enterprise-grade features at zero cost, combining the privacy of self-hosting with the reliability of Cloudflare's global network.

---

## Live Demo

Try Sphixmail at **[sphixray.com](https://sphixray.com)**:

1. Visit [sphixray.com](https://sphixray.com)
2. Click the arrow button (→) to generate a random email address
3. Copy your new disposable address
4. Use it anywhere — sign-ups, verifications, OTP codes
5. Check back — new messages appear automatically (auto-refresh every 2 seconds)

**Use cases:**
- Testing — QA, automation, integration tests
- Privacy — keep your real email address private
- Bots — automated registration and verification flows
- One-time signups — avoid spam in your primary inbox
- Development — test email flows without a real inbox

**Guides:** [User Guide](https://sphixray.com/docs.html) · [Interactive API Docs](https://sphixray.com/api-doc.html)

---

## Screenshots

| Dark Mode — Main Interface | Light Mode — Email Reading |
|---|---|
| Clean, auto-refreshing inbox with OTP detection | HTML emails rendered safely in an isolated iframe |

| Admin Panel — Dashboard | Appearance Customization |
|---|---|
| Real-time statistics across 7 days, 6 weeks, 12 months, or 7 years | Custom backgrounds, mascot positioning, and transparency controls |

---

## Features

### Instant Email Addresses
- **Random generator** — Indonesian-style names, e.g. `langitsenja42@yourdomain.com`
- **Custom names** — choose your own username (e.g. `testing@yourdomain.com`)
- **Multiple domains** — select from any configured domain
- **Auto-save** — last inbox remembered across browser sessions
- **Smart paste** — paste a full email address to auto-fill the field

### Fast, Real-Time Inbox
- **Auto-refresh** every 2–3 seconds
- **OTP detection** — verification codes extracted and highlighted automatically
- **HTML support** — emails rendered safely in sandboxed frames
- **Live timestamps** — relative time, with full WIB datetime on hover
- **WIB clock** — real-time Jakarta timezone clock in the navbar

### Customization
- **Custom background** — upload an image with adjustable transparency
- **Mascot/logo** — position decorative images anywhere (X/Y + size)
- **Dark/light mode** — toggle with saved preference
- **Bilingual** — English and Bahasa Indonesia

### Developer-Friendly API

```bash
# Get domains
curl https://yourmail.com/pub/domains/YOUR_API_KEY

# Wait for OTP (no API key needed)
curl "https://yourmail.com/pub/inbox/user@domain.com/wait-otp?timeout=30"
# Returns: {"found": true, "otp": "123456", ...}
```

Available endpoints:
- List domains
- Validate email addresses
- Fetch messages
- Delete messages
- Usage statistics
- Wait for OTP (ideal for automation and testing)

### Full Admin Control
- **Analytics** — charts for 7d / 6w / 12m / 7y periods
- **Domain management** — add unlimited domains with access control
- **API keys** — generate, revoke, and set rate limits
- **Zero-code configuration** — all settings managed via the UI
- **Appearance editor** — visual customization tools
- **Access control** — whitelist/blacklist usernames, admin bypass

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

No server experience needed — everything runs free on Cloudflare. Total cost: **$0/month**, unless you exceed Cloudflare's generous free tier.

**Prerequisites:**
- A free [Cloudflare](https://dash.cloudflare.com) account
- A domain connected to Cloudflare (required to receive email)
- [Node.js](https://nodejs.org) v18 or higher installed locally

### Step 1 — Download Sphixmail

```bash
git clone https://github.com/devanonaufal/sphixmail.git
cd sphixmail
npm install
```

This downloads Sphixmail and installs its dependencies.

### Step 2 — Create Your Database

```bash
npm run db:create
```

Output will look like this:

```
✅ Created your database: sphixmail-db
database_id = "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
```

Copy the `database_id` value. Open `wrangler.toml` and paste it into:

```toml
[[d1_databases]]
binding = "DB"
database_name = "sphixmail-db"
database_id = "PASTE-YOUR-ID-HERE"
```

### Step 3 — Configure Environment

Edit the `[vars]` section in `wrangler.toml`:

```toml
[vars]
APP_NAME = "Sphixmail"
MAIL_DOMAIN = "mail.yourdomain.com"       # Primary domain (additional domains added via Admin Panel)
WEB_HOST = "sphixmail.yourdomain.com"     # Domain for the web UI
ADMIN_PASSWORD_HASH = "your-sha256-hash"  # See Step 4
```

### Step 4 — Generate an Admin Password Hash

```bash
node -e "
  const p = 'yourPassword';
  crypto.subtle.digest('SHA-256', new TextEncoder().encode(p))
    .then(b => console.log([...new Uint8Array(b)].map(x=>x.toString(16).padStart(2,'0')).join('')));
"
```

Copy the resulting hash into `ADMIN_PASSWORD_HASH` in `wrangler.toml`.

### Step 5 — Deploy

```bash
# Initialize database tables
npm run db:migrate

# Deploy to Cloudflare
npm run deploy
```

### Step 6 — Enable Email Routing

In the [Cloudflare Dashboard](https://dash.cloudflare.com):

1. Select your domain → **Email** → **Email Routing**
2. Click **Enable Email Routing**
3. Under **Catch-all address**, set the action to **Send to Worker** and select `sphixmail`
4. Save

All emails sent to `*@mail.yourdomain.com` will now be processed by Sphixmail.

### After Deployment

1. Open `https://yourwebdomain.com/admin.html`
2. Log in with username `admin` and the password you set
3. Go to the **API Keys** tab to create a key and start using the API

---

## Configuration

### Full `wrangler.toml` Example

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
crons = ["0 * * * *"]   # Automatic cleanup every hour
```

### Admin Panel Settings Reference

| Key | Description | Default |
|---|---|---|
| `forbidden_usernames` | Blocked usernames, e.g. `["admin","root"]` | `[]` |
| `username_min` | Minimum username length | `3` |
| `username_max` | Maximum username length | `30` |
| `daily_inbox_limit` | Max inboxes per session per day (`0` = unlimited) | `10` |
| `auto_delete_enabled` | Enable automatic message deletion | `false` |
| `delete_value` | Amount of time before deletion (e.g. `7`) | `7` |
| `delete_unit` | Unit: `m` = minute, `h` = hour, `d` = day, `w` = week, `mo` = month | `d` |
| `max_messages_per_inbox` | Max stored messages per inbox (`0` = unlimited) | `50` |

---

## Public REST API

Base URL: `https://yourmail.com/pub/`

All endpoints require an API key except `wait-otp`. Create keys under **Admin Panel → API Keys**.

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

### Wait for OTP (No API Key Required)

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

### User Guide

Visit **[sphixray.com/docs.html](https://sphixray.com/docs.html)** for full documentation, including:

- Getting started — creating your first inbox
- Email management — receiving, reading, and organizing messages
- OTP auto-detection — automatic verification code extraction
- API integration — complete REST API reference with examples
- FAQ — common questions and troubleshooting

### Interactive API Documentation

Visit **[sphixray.com/api-doc.html](https://sphixray.com/api-doc.html)** for:

- A live API playground to test endpoints in your browser
- Ready-to-use request/response examples
- Authentication and API key setup
- Rate limiting details
- Long-polling guide for the OTP wait endpoint

Documentation is available in **English** and **Bahasa Indonesia** — toggle the language in the top-right corner of any page.

**Quick links:**
- [Creating a custom username](https://sphixray.com/docs.html#create)
- [Understanding OTP auto-extraction](https://sphixray.com/docs.html#otp)
- [Using the wait-otp endpoint](https://sphixray.com/docs.html#api-wait)
- [Setting up API keys](https://sphixray.com/admin.html)
- [Multi-domain configuration](https://sphixray.com/docs.html#api-domains)

---

## Security

- **Admin login** — HttpOnly + SameSite cookie, expires after 24 hours
- **Lockout** — 5 failed login attempts trigger a 15-minute lockout
- **API keys** — stored in the database, revocable at any time, with optional expiry
- **Rate limiting** — per-minute request cap per API key
- **Public inbox model** — any address is readable by anyone, by design, for disposable/OTP use
- **Safe HTML rendering** — emails render inside a sandboxed iframe; no external scripts execute
- **Password hashing** — SHA-256 via the Web Crypto API
- **Anti-devtools** — right-click and keyboard shortcuts are blocked on the public UI

---

## Database Schema

Tables are created automatically on first deploy:

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

## Multi-Domain Support

Support multiple email domains simultaneously — no redeployment needed:

1. Enable Email Routing for each domain in the Cloudflare Dashboard and route its catch-all to the `sphixmail` worker
2. Open **Admin Panel → Domains** → click **Add Domain**
3. Enter the domain name and save

The new domain appears immediately in the frontend dropdown and starts receiving emails.

> `MAIL_DOMAIN` in `wrangler.toml` is only used as the initial seed domain on first deploy. All domain management afterward is done through the Admin Panel.

---

## Maintenance

**Redeploy after code changes:**
```bash
npm run deploy
```

**Run database migrations after schema changes:**
```bash
npm run db:migrate
```
> Safe to run multiple times — existing data is never dropped.

**Automatic cleanup (cron):** every hour, Cloudflare runs maintenance to:
- Delete old messages (if auto-delete is enabled in Settings)
- Purge old logs (older than 2–3 days)
- Remove expired admin sessions

---

## Contributing

Contributions are welcome — bug reports, feature requests, and code improvements all help make Sphixmail better.

### Reporting a Bug
1. Check [existing issues](https://github.com/devanonaufal/sphixmail/issues) to avoid duplicates
2. Open a new issue including:
   - A clear description of the problem
   - Steps to reproduce
   - Expected vs. actual behavior
   - Your environment (browser, OS, Cloudflare region if relevant)

### Requesting a Feature
1. Open an issue with the `enhancement` label
2. Describe the feature and its use case
3. Explain the benefit to other users

### Contributing Code
1. Fork this repository
2. Create a feature branch: `git checkout -b feature/your-feature`
3. Make your changes, following the existing code style
4. Test thoroughly (frontend and backend, as applicable)
5. Commit with a clear message: `git commit -m "feat: add your feature"`
6. Push to your fork: `git push origin feature/your-feature`
7. Open a pull request including:
   - A clear description of the changes
   - Screenshots or demos for UI changes
   - Any breaking changes, clearly highlighted

### Development Setup

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

### Code Style
- **TypeScript** — follow existing patterns in `src/`
- **Frontend** — vanilla JS (no frameworks), semantic HTML, CSS custom properties
- **Comments** — use `ponytail:` comments for deliberate simplifications with an upgrade path
- **Commits** — follow the conventional commit format (`feat:`, `fix:`, `docs:`, `refactor:`)

---

## License

MIT License — free to use, modify, and distribute.

Copyright © 2026 Devano Naufal

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

---

## Acknowledgments

Sphixmail is built with:

- [Cloudflare Workers](https://workers.cloudflare.com/) — serverless edge computing
- [Cloudflare D1](https://developers.cloudflare.com/d1/) — distributed SQLite database
- [Hono](https://hono.dev/) — lightweight web framework
- [Postal-MIME](https://github.com/postalsys/postal-mime) — fast, RFC-compliant email parser

Special thanks to the open-source community for these tools.

---

<div align="center">

### Ready to deploy your own?

Get started in 10 minutes, with zero monthly cost and complete control.

[**Read the Deployment Guide**](#deployment-guide) · [**Try the Live Demo**](https://sphixray.com)

**Questions, ideas, or bugs?**
[Discussions](https://github.com/devanonaufal/sphixmail/discussions) · [Report an Issue](https://github.com/devanonaufal/sphixmail/issues) · [Pull Requests](https://github.com/devanonaufal/sphixmail/pulls) · [Star on GitHub](https://github.com/devanonaufal/sphixmail)

---

**Made with ❤️ by [Devano Naufal](https://github.com/devanonaufal)**

[Live Demo](https://sphixray.com) · [Documentation](https://sphixray.com/docs.html) · [API Docs](https://sphixray.com/api-doc.html) · [GitHub](https://github.com/devanonaufal/sphixmail)

<sub>MIT License · Copyright © 2026 Devano Naufal · Open Source Forever</sub>

</div>
