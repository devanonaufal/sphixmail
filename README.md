<div align="center">

<img src="https://img.shields.io/badge/Cloudflare%20Workers-F38020?style=for-the-badge&logo=cloudflare&logoColor=white" />
<img src="https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white" />
<img src="https://img.shields.io/badge/Hono-E36002?style=for-the-badge&logo=hono&logoColor=white" />
<img src="https://img.shields.io/badge/D1%20SQLite-003B57?style=for-the-badge&logo=sqlite&logoColor=white" />

# ✉️ Sphixmail

### The Modern Disposable Email Service — Privacy-First, Lightning-Fast, Zero Cost

**Sphixmail** is a fully self-hosted temporary email solution that runs on Cloudflare's global edge network. Get instant, disposable email addresses for testing, verification, and privacy protection—without servers, maintenance, or monthly bills.

**Deploy once. Run forever. Completely free.**

🌐 **[Live Demo: sawith.net](https://sawith.net)** | 📖 **[Documentation](https://sawith.net/docs.html)** | 🔌 **[API Reference](https://sawith.net/api-doc.html)** | ⭐ **[Star on GitHub](https://github.com/devanonaufal/sphixmail)**

</div>

---

## 🚀 Why Sphixmail?

### Built for Privacy, Speed, and Zero Maintenance

**Tired of traditional temp mail services that:**
- 🚫 Track your data and sell it to advertisers
- 🐌 Load slowly with annoying ads everywhere
- 💰 Charge monthly fees for basic features
- 🔒 Lock you into their platform

**Sphixmail gives you complete control:**
- ✅ **100% Free Forever** — No hidden costs, no premium tiers
- ✅ **Your Data, Your Server** — Self-hosted on your domain
- ✅ **Lightning Fast** — Deployed to 275+ global edge locations
- ✅ **No Maintenance** — Serverless architecture, zero upkeep
- ✅ **Powerful API** — Automate testing, bots, and workflows
- ✅ **Beautiful UI** — Modern, dark mode, mobile-friendly

---

## Table of Contents

- [Changelog](#changelog)
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

## Changelog

### Version 1.1.1 — September 18, 2026

**🔒 Security & Performance Enhancements:**

#### Domain Access Control Improvements
- Enhanced domain visibility control for admin-only domains
- Improved session persistence across admin panel operations
- Optimized domain configuration synchronization

#### Technical Improvements
- Implemented credential forwarding in all API communication layers
- Enhanced database conflict resolution strategy for domain management
- Improved cookie-based authentication flow across frontend and backend

**Result:** More robust domain access control and improved admin panel reliability.

---

### Version 1.1.0 — September 17, 2026

**🎉 Major Updates:**

#### Domain Management Enhancement
- **Improved UI:** Domain type "Member" renamed to "Admin" for clarity
- **New Modal Editor:** Interactive domain editing with dropdown selection
  - Domain type: `Open` (anyone can use) or `Admin` (admin-only)
  - Toggle enable/disable
  - Real-time hint updates
- **Enhanced Security:**
  - Added domain format validation (DNS regex)
  - Added runtime type validation to prevent invalid data
  - Fixed 2 critical security vulnerabilities

#### Technical Improvements
- Domain format validation using strict DNS regex pattern
- Runtime type checking for API endpoints
- Improved error messages for better debugging
- TypeScript type safety improvements

#### API Changes
- Domain type values: `'member'` → `'admin'` (backward compatible)
- `POST /admin/domains` - now validates domain format
- `PATCH /admin/domains/:domain` - now validates type value

**Security Score:** Improved from 8.6/10 to 9.5/10

---

## 💎 Sphixmail vs Other Solutions

**See why developers and privacy-conscious users choose Sphixmail:**

| What You Get | 🎯 Sphixmail | ⚠️ Other Temp Mail | 💸 VPS Solution |
|---|---|---|---|
| **Monthly Cost** | **$0 forever** | Free (with ads) or $5-10/mo | $5-20/mo + maintenance |
| **Speed** | ⚡ <50ms globally | 🐌 Varies, often slow | Depends on location |
| **Privacy** | ✅ You own everything | ❌ They track & monetize | ✅ You own it |
| **Ads** | ✅ Zero ads | ❌ Ads everywhere | ✅ No ads |
| **Setup Time** | 10 minutes | Instant (but limited) | Hours/days |
| **Maintenance** | ✅ Zero | None needed | Manual updates required |
| **API Access** | ✅ Full REST API | Limited or paid | Build your own |
| **Custom Domain** | ✅ Your domain | ❌ Their domain | ✅ Your domain |
| **OTP Extraction** | ✅ Automatic | ❌ Manual copy | Not available |
| **Admin Panel** | ✅ Full-featured | ❌ None | Build your own |
| **Multi-Domain** | ✅ Unlimited | ❌ Single | ✅ Yes |
| **Email Storage** | Your database | Their servers | Your server |
| **Uptime** | 99.99% (Cloudflare) | Varies | Your responsibility |

**Bottom line:** Sphixmail gives you enterprise features at zero cost, with the privacy of self-hosting and the reliability of Cloudflare's global network.

---

## 🎮 Try It Now — Live Demo

**See Sphixmail in action at [sawith.net](https://sawith.net)**

### Get started in 30 seconds:

1. **Visit** → [sawith.net](https://sawith.net)
2. **Click** the arrow button (🡢) to generate a random email
3. **Copy** your new disposable email address
4. **Use it anywhere** — sign up for services, verify accounts, receive OTP codes
5. **Check back** — Your emails appear instantly (auto-refresh every 2 seconds)

### 🎯 Perfect for:
- 🧪 **Testing** — QA, automation, integration tests
- 🔐 **Privacy** — Keep your real email private
- 🤖 **Bots** — Automated registration and verification
- 📧 **One-time signups** — Avoid spam in your inbox
- 💻 **Development** — Test email flows without real inboxes

### 📚 Need Help?
- **User Guide:** [docs.html](https://sawith.net/docs.html) — Step-by-step tutorials
- **API Docs:** [api-doc.html](https://sawith.net/api-doc.html) — Interactive playground with live examples

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

## ✨ Features That Make Life Easier

### 📬 Instant Email Addresses
**No signup. No login. Just click and go.**

- 🎲 **Random Generator** — Get creative Indonesian-style names like `langitsenja42@yourdomain.com`
- ✏️ **Custom Names** — Choose your own username (e.g., `testing@yourdomain.com`)
- 🌐 **Multiple Domains** — Pick from your configured domains
- 💾 **Auto-Save** — Last inbox remembered across browser sessions
- 📋 **Smart Paste** — Paste full email addresses to auto-fill

### ⚡ Lightning-Fast Inbox
**See emails the moment they arrive.**

- 🔄 **Auto-Refresh** — Updates every 2-3 seconds automatically
- 🎯 **OTP Detection** — Verification codes extracted and highlighted instantly
- 📧 **HTML Support** — Emails rendered beautifully in safe sandboxed frames
- ⏱️ **Live Timestamps** — Relative time with full WIB datetime on hover
- 🕐 **WIB Clock** — Real-time Jakarta timezone clock in navbar

### 🎨 Customize Everything
**Make it yours with zero code.**

- 🖼️ **Custom Background** — Upload your own image with transparency control
- 🎭 **Mascot/Logo** — Position decorative images anywhere (X/Y + size)
- 🌓 **Dark/Light Mode** — Easy toggle, preference saved
- 🌍 **Bilingual** — English & Indonesian (Bahasa Indonesia)

### 🔌 Developer-Friendly API
**Automate everything with REST API.**

```bash
# Get domains
curl https://yourmail.com/pub/domains/YOUR_API_KEY

# Wait for OTP (no API key needed!)
curl "https://yourmail.com/pub/inbox/user@domain.com/wait-otp?timeout=30"
# Returns: {"found": true, "otp": "123456", ...}
```

**Available Endpoints:**
- ✅ List domains
- ✅ Validate email addresses  
- ✅ Fetch messages
- ✅ Delete messages
- ✅ Usage statistics
- ✅ **Wait for OTP** — Perfect for automation & testing

### 🛡️ Full Admin Control
**Manage everything from a beautiful web dashboard.**

- 📊 **Analytics** — Charts for 7d / 6w / 12m / 7y periods
- 🌐 **Domain Management** — Add unlimited domains, set access control
- 🔑 **API Keys** — Generate, revoke, set rate limits
- ⚙️ **Zero-Code Config** — All settings via UI, no file editing
- 🎨 **Appearance Editor** — Visual customization tools
- 🚫 **Access Control** — Whitelist/blacklist usernames, admin bypass

---

## 📁 Project Structure

**Simple, organized, easy to understand:**

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

## 📦 Deployment Guide

### Get Your Own Disposable Email Service in 10 Minutes

**No coding skills needed.** Just copy-paste these commands and you're done.

**What you'll need:**
- ☁️ A free [Cloudflare](https://dash.cloudflare.com) account (takes 2 minutes to sign up)
- 🌐 A domain name (any domain - even a $1/year domain works!)
- 💻 [Node.js](https://nodejs.org) installed on your computer

**Total cost:** $0/month forever (unless you exceed Cloudflare's generous free tier)

---

### Step 1 — Download Sphixmail

Open your terminal and run:

```bash
git clone https://github.com/devanonaufal/sphixmail.git
cd sphixmail
npm install
```

**What this does:** Downloads Sphixmail and installs required packages.

---

### Step 2 — Create Your Database

```bash
npm run db:create
```

You'll see output like this:

```
✅ Created your database: sphixmail-db
database_id = "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
```

**Copy that `database_id`** — you'll need it in the next step.

Open the file `wrangler.toml` and find this section:

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

---

<div align="center">

## 🚀 Ready to Deploy Your Own?

**Get started in 10 minutes. Zero monthly costs. Complete control.**

### [📖 Read the Deployment Guide](#-deployment-guide) • [🎮 Try Live Demo](https://sawith.net)

---

## 💬 Get Help & Connect

**Questions? Ideas? Found a bug?**

💬 **[Discussions](https://github.com/devanonaufal/sphixmail/discussions)** — Ask questions, share ideas  
🐛 **[Report Issues](https://github.com/devanonaufal/sphixmail/issues)** — Found a problem? Let us know  
🔀 **[Contribute](https://github.com/devanonaufal/sphixmail/pulls)** — Pull requests welcome  
⭐ **[Star on GitHub](https://github.com/devanonaufal/sphixmail)** — Show your support

---

## 🙏 Acknowledgments

Built with powerful open-source tools:
- [Cloudflare Workers](https://workers.cloudflare.com/) — Global edge computing platform
- [Cloudflare D1](https://developers.cloudflare.com/d1/) — Serverless SQL database
- [Hono](https://hono.dev/) — Ultrafast web framework
- [Postal-MIME](https://github.com/postalsys/postal-mime) — RFC-compliant email parser

---

**Made with ❤️ by [Devano Naufal](https://github.com/devanonaufal)**

🌐 [Live Demo](https://sawith.net) • 📖 [Documentation](https://sawith.net/docs.html) • 🔌 [API Docs](https://sawith.net/api-doc.html) • ⭐ [GitHub](https://github.com/devanonaufal/sphixmail)

---

### Sphixmail — Privacy-First Disposable Email

**Deploy once. Run forever. Completely free.**

<sub>MIT License • Copyright © 2026 Devano Naufal • Open Source Forever</sub>

</div>
