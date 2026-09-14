/* ── Anti-inspect ───────────────────────────────────── */
(function() {
  // Skip in mascot edit mode (iframe preview)
  const isMascotEdit = new URLSearchParams(location.search).get('mascotEdit') === '1';
  if (isMascotEdit) return;
  
  // Block right-click
  document.addEventListener('contextmenu', e => e.preventDefault());
  // Block F12, Ctrl+Shift+I, Ctrl+Shift+J, Ctrl+Shift+C, Ctrl+U
  document.addEventListener('keydown', e => {
    if (e.key === 'F12') { e.preventDefault(); return false; }
    if (e.ctrlKey && e.shiftKey && ['I','J','C'].includes(e.key.toUpperCase())) { e.preventDefault(); return false; }
    if (e.ctrlKey && e.key.toUpperCase() === 'U') { e.preventDefault(); return false; }
    if (e.metaKey && e.altKey && e.key.toUpperCase() === 'I') { e.preventDefault(); return false; }
  });
  // Detect devtools via window size threshold — blur content if opened
  const threshold = 160;
  function check() {
    const devOpen = (window.outerWidth - window.innerWidth > threshold) ||
                    (window.outerHeight - window.innerHeight > threshold);
    document.body.style.filter = devOpen ? 'blur(8px)' : '';
    document.body.style.userSelect = devOpen ? 'none' : '';
  }
  setInterval(check, 1000);
})();

/* ── Theme ──────────────────────────────────────────── */
function getTheme() { return localStorage.getItem('theme') || 'dark'; }
function applyTheme(t) {
  document.documentElement.setAttribute('data-theme', t);
  const btn = document.getElementById('themeBtn');
  if (btn) btn.textContent = t === 'dark' ? '☀️' : '🌙';
  localStorage.setItem('theme', t);
}
applyTheme(getTheme());

/* ── i18n ───────────────────────────────────────────── */
const LANG = {
  id: {
    yourEmail: 'Email sementaramu', btnCreate: 'Buat Inbox', btnRandom: 'Acak',
    labelCurrentEmail: 'Inbox aktif', labelStats: 'Statistik',
    statEmails: 'Email diterima', statDomains: 'Domain aktif',
    labelHowto: 'Cara pakai', labelInbox: 'Inbox', btnRefresh: 'Refresh',
    emptyTitle: 'Inbox kosong', emptySub: 'Email yang kamu terima akan muncul di sini.',
    howto1: 'Buka Sphixmail', howto2: 'Salin email', howto3: 'Terima email',
    copied: 'Alamat email disalin!', deleted: 'Inbox dihapus',
    created: 'Inbox berhasil dibuat!', errorCreate: 'Gagal membuat inbox',
    usernameRequired: 'Masukkan username dulu',
    msgBadge: (n) => `${n} pesan`, navEmailCount: (n) => `${n} email diterima`,
  },
  en: {
    yourEmail: 'Your temporary email', btnCreate: 'Create Inbox', btnRandom: 'Random',
    labelCurrentEmail: 'Active inbox', labelStats: 'Statistics',
    statEmails: 'Emails received', statDomains: 'Active domains',
    labelHowto: 'How to use', labelInbox: 'Inbox', btnRefresh: 'Refresh',
    emptyTitle: 'Inbox is empty', emptySub: 'Emails you receive will appear here.',
    howto1: 'Open Sphixmail', howto2: 'Copy the email', howto3: 'Receive email',
    copied: 'Email address copied!', deleted: 'Inbox deleted',
    created: 'Inbox created!', errorCreate: 'Failed to create inbox',
    usernameRequired: 'Enter a username first',
    msgBadge: (n) => `${n} message${n !== 1 ? 's' : ''}`,
    navEmailCount: (n) => `${n} emails received`,
  }
};

/* ── State ──────────────────────────────────────────── */
let lang = localStorage.getItem('lang') || 'en';
let sessionId = localStorage.getItem('sphixSessionId') || '';
let currentAddress = '';
let inboxList = [];
let pollTimer = null;

/* ── Starfield ──────────────────────────────────────── */
function initStarfield() {
  const canvas = document.getElementById('starfield');
  const ctx = canvas.getContext('2d');
  let stars = [];
  const resize = () => { canvas.width = innerWidth; canvas.height = innerHeight; };
  const makeStars = () => { stars = Array.from({ length: 120 }, () => ({ x: Math.random() * canvas.width, y: Math.random() * canvas.height, r: Math.random() * 1.2 + 0.2, a: Math.random(), da: (Math.random() * 0.004 + 0.001) * (Math.random() < 0.5 ? 1 : -1) })); };
  const draw = () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (const s of stars) {
      s.a = Math.max(0.05, Math.min(1, s.a + s.da));
      if (s.a <= 0.05 || s.a >= 1) s.da *= -1;
      ctx.beginPath(); ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255,255,255,${s.a})`; ctx.fill();
    }
    requestAnimationFrame(draw);
  };
  resize(); makeStars(); draw();
  window.addEventListener('resize', () => { resize(); makeStars(); });
}

/* ── i18n apply ─────────────────────────────────────── */
function applyLang() {
  const t = LANG[lang];
  const map = {
    labelYourEmail: t.yourEmail, btnCreateLabel: t.btnCreate, btnRandomLabel: t.btnRandom,
    labelCurrentEmail: t.labelCurrentEmail,
    labelHowto: t.labelHowto, labelInbox: t.labelInbox, btnRefreshLabel: t.btnRefresh,
    emptyTitle: t.emptyTitle,
    howto1: t.howto1, howto2: t.howto2, howto3: t.howto3,
  };
  for (const [id, text] of Object.entries(map)) {
    const el = document.getElementById(id);
    if (el) el.textContent = text;
  }
  // emptySub is now plain text only (link removed)
  const su = document.getElementById('emptySub');
  if (su) { su.textContent = t.emptySub; }
  // update lang toggle active state
  const enBtn = document.getElementById('langEn');
  const idBtn = document.getElementById('langId');
  if (enBtn) enBtn.classList.toggle('active', lang === 'en');
  if (idBtn) idBtn.classList.toggle('active', lang === 'id');
}

/* ── Toast ──────────────────────────────────────────── */
function toast(msg, type = 'info', duration = 2800) {
  const container = document.getElementById('toastContainer');
  // dedup: skip if same message already visible
  if ([...container.children].some(c => c.textContent === msg)) return;
  const el = document.createElement('div');
  el.className = `toast ${type}`; el.textContent = msg;
  container.appendChild(el);
  setTimeout(() => { el.classList.add('fadeout'); setTimeout(() => el.remove(), 250); }, duration);
}

/* ── Helpers ─────────────────────────────────────────── */
const escHtml = (s = '') => s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');

const WIB = { timeZone: 'Asia/Jakarta' };

/* Force UTC parse — SQLite stores without Z suffix */
function parseUTC(iso) {
  if (!iso) return new Date();
  return new Date(iso.endsWith('Z') || iso.includes('+') ? iso : iso + 'Z');
}

function toWIB(iso) {
  return parseUTC(iso).toLocaleString('id-ID', {
    timeZone: 'Asia/Jakarta',
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit', second: '2-digit',
    hour12: false,
  }) + ' WIB';
}

function relativeTime(iso) {
  const s = Math.floor((Date.now() - parseUTC(iso).getTime()) / 1000);
  if (s < 60) return `${s}s ago`;
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  return `${Math.floor(s / 86400)}d ago`;
}

/* Realtime WIB clock in navbar */
function startNavClock() {
  const el = document.getElementById('navClock');
  if (!el) return;
  const tick = () => {
    el.textContent = new Date().toLocaleTimeString('id-ID', {
      timeZone: 'Asia/Jakarta', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false,
    }) + ' WIB';
  };
  tick();
  setInterval(tick, 1000);
}

/* ── API helpers ────────────────────────────────────── */
const apiHeaders = () => ({ 'x-session-id': sessionId });

async function apiGet(path) {
  const r = await fetch(path, { headers: apiHeaders() });
  if (!r.ok) throw new Error(await r.text());
  return r.json();
}
async function apiPost(path, body) {
  const r = await fetch(path, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...apiHeaders() },
    body: JSON.stringify(body),
  });
  if (!r.ok) {
    const err = await r.json().catch(() => ({}));
    throw new Error(err.error || r.statusText);
  }
  return r.json();
}
async function apiDelete(path) {
  const r = await fetch(path, { method: 'DELETE', headers: apiHeaders() });
  if (!r.ok) throw new Error(await r.text());
  return r.json();
}

/* ── Session ────────────────────────────────────────── */
async function ensureSession() {
  if (sessionId) return;
  const d = await fetch('/api/session').then(r => r.json());
  sessionId = d.sessionId;
  localStorage.setItem('sphixSessionId', sessionId);
}

/* ── Config ─────────────────────────────────────────── */
let activeDomains = [];
/* ── Appearance ─────────────────────────────────────── */
function applyBackground(config) {
  const root = document.documentElement;
  const hasCustomBg = !!(config.bgEnabled && config.bgImage);
  root.classList.toggle('custom-bg', hasCustomBg);
  if (hasCustomBg) {
    root.style.setProperty('--bg-image-url', `url("${config.bgImage}")`);
    const transparency = Math.min(100, Math.max(0, Number(config.bgTransparency) || 0));
    root.style.setProperty('--card-alpha', String((100 - transparency) / 100));
  } else {
    root.style.removeProperty('--bg-image-url');
    root.style.removeProperty('--card-alpha');
  }
}

function applyMascot(cfg) {
  const img = document.getElementById('mascotImg');
  if (!img) return;
  const enabled = !!cfg.mascotEnabled;
  const src = typeof cfg.mascotImage === 'string' ? cfg.mascotImage : '';
  const shouldShow = enabled && !!src;
  if (shouldShow) {
    if (img.src !== src) img.src = src;
    img.style.left = `${Number.isFinite(cfg.mascotX) ? cfg.mascotX : parseFloat(cfg.mascotX) || 50}%`;
    img.style.top = `${Number.isFinite(cfg.mascotY) ? cfg.mascotY : parseFloat(cfg.mascotY) || 50}%`;
    const size = Number.isFinite(cfg.mascotSize) ? cfg.mascotSize : (parseFloat(cfg.mascotSize) || 110);
    img.style.width = `${Math.min(400, Math.max(24, size))}px`;
    img.style.display = 'block';
  } else {
    img.style.display = 'none';
    img.removeAttribute('src');
  }
}

/* ── Config ─────────────────────────────────────────── */
async function loadConfig() {
  const config = await apiGet('/api/config');
  document.title = `${config.appName} — Disposable Temp Mail`;
  document.getElementById('navTitle').textContent = config.appName;

  activeDomains = config.mailDomains || (config.mailDomain ? [config.mailDomain] : []);
  const sel = document.getElementById('domainSelect');
  sel.innerHTML = activeDomains.map(d => `<option value="${d}">@${d}</option>`).join('');
  // Restore last selected domain only if still active
  const savedDomain = localStorage.getItem('selectedDomain');
  if (savedDomain && activeDomains.includes(savedDomain)) sel.value = savedDomain;
  sel.addEventListener('change', () => localStorage.setItem('selectedDomain', sel.value));

  // Update active domains stat
  const domEl = document.getElementById('statDomains');
  if (domEl) domEl.textContent = activeDomains.length;

  // Apply appearance settings
  applyBackground(config);
  applyMascot({
    mascotEnabled: config.mascotEnabled,
    mascotImage: config.mascotImage,
    mascotX: config.mascotX,
    mascotY: config.mascotY,
    mascotSize: config.mascotSize,
  });
}

/* ── Stats ─────────────────────────────────────────── */
// ponytail: /api/stats route requires API key via /pub/stats/:key
// If a public no-auth stats endpoint is added later, wire it here
async function loadStats() { /* no-op: no public stats endpoint */ }

/* ── Inboxes ────────────────────────────────────────── */
async function loadInboxes() {
  inboxList = await apiGet('/api/inboxes');
  const cached = localStorage.getItem('activeInbox');

  // Check if cached inbox domain is still active
  const cachedDomain = cached ? cached.split('@')[1] : null;
  const cachedValid = cached && cachedDomain && activeDomains.includes(cachedDomain);
  if (!cachedValid && cached) {
    // Domain offline — clear stale cache
    localStorage.removeItem('activeInbox');
  }

  const found = cachedValid && inboxList.find(i => i.address === cached);
  if (found) {
    setActiveInbox(found.address);
  } else if (cachedValid) {
    // Not in session but valid domain — restore directly (public shared model)
    setActiveInbox(cached);
  } else if (inboxList.length > 0 && !currentAddress) {
    const valid = inboxList.find(i => activeDomains.includes(i.address.split('@')[1]));
    if (valid) setActiveInbox(valid.address);
  }
  renderInboxList();
}

function renderInboxList() {
  // inbox switcher removed from UI — only one active inbox shown
}

function setActiveInbox(address) {
  currentAddress = address;
  localStorage.setItem('activeInbox', address);
  // Restore username input field
  const parts = address.split('@');
  const usernameEl = document.getElementById('usernameInput');
  if (usernameEl && parts[0]) usernameEl.value = parts[0];
  const domainEl = document.getElementById('domainSelect');
  if (domainEl && parts[1]) domainEl.value = parts[1];
  // Update both old and new email display elements
  const disp1 = document.getElementById('currentEmailDisplay');
  if (disp1) disp1.textContent = address;
  renderInboxList();
  loadMessages();
  restartPoll();
  // Update nav status text
  const navSt = document.getElementById('navStatusText');
  if (navSt) navSt.textContent = address.split('@')[0] + '@…';
  // Mark create button as ready
  const applyBtn = document.getElementById('createBtn');
  if (applyBtn) applyBtn.setAttribute('data-siap', '1');
}

/* ── Create inbox ────────────────────────────────────── */
async function createInbox(localPart) {
  const domain = document.getElementById('domainSelect').value;
  const body = {};
  if (localPart) body.localPart = localPart;
  if (domain) body.domain = domain;
  try {
    const inbox = await apiPost('/api/inboxes', body);
    // Deduplicate and prepend new inbox
    inboxList = [inbox, ...inboxList.filter(i => i.address !== inbox.address)];
    setActiveInbox(inbox.address); // also calls renderInboxList + loadMessages
    toast(LANG[lang].created, 'success');
    // Start fast polling for 30 seconds to quickly catch incoming emails
    restartPoll(true);
  } catch (err) {
    toast(err.message || LANG[lang].errorCreate, 'error');
  }
}

/* ── Delete inbox ────────────────────────────────────── */
async function deleteInbox(address) {
  await apiDelete(`/api/inboxes/${encodeURIComponent(address)}`);
  inboxList = inboxList.filter(i => i.address !== address);
  if (currentAddress === address) {
    currentAddress = inboxList[0]?.address || '';
    if (currentAddress) {
      setActiveInbox(currentAddress);
    } else {
      document.getElementById('currentEmailDisplay').textContent = '—';
      renderMessages([]);
    }
  }
  renderInboxList();
  toast(LANG[lang].deleted, 'info');
}

/* ── Messages ────────────────────────────────────────── */
async function loadMessages() {
  if (!currentAddress) return;
  try {
    const msgs = await apiGet(`/api/inboxes/${encodeURIComponent(currentAddress)}/messages`);
    renderMessages(msgs);
  } catch { /* silent on poll failure */ }
}

function extractOTP(subject, body, bodyHtml) {
  // match 4-8 digit standalone numbers
  let text = (subject || '') + ' ' + (body || '');
  // If body empty but HTML exists, strip HTML tags
  if (!body && bodyHtml) {
    text = (subject || '') + ' ' + bodyHtml.replace(/<[^>]+>/g, ' ');
  }
  const m = text.match(/\b(\d{4,8})\b/);
  return m ? m[1] : null;
}

function renderMessages(msgs) {
  const t = LANG[lang];
  const badgeEl = document.getElementById('msgBadge');
  if (badgeEl) badgeEl.textContent = t.msgBadge(msgs.length);

  const list = document.getElementById('msgList');
  if (msgs.length === 0) {
    let es = document.getElementById('emptyState');
    if (!es) {
      list.innerHTML = `<div class="empty-state" id="emptyState">
        <div class="vmail-loader">
          <div class="vmail-box"><div class="side-left"></div><div class="side-right"></div><div class="side-top"></div></div>
          <div class="vmail-box"><div class="side-left"></div><div class="side-right"></div><div class="side-top"></div></div>
          <div class="vmail-box"><div class="side-left"></div><div class="side-right"></div><div class="side-top"></div></div>
          <div class="vmail-box"><div class="side-left"></div><div class="side-right"></div><div class="side-top"></div></div>
        </div>
        <div class="empty-title" id="emptyTitle"></div>
        <div class="empty-sub" id="emptySub"></div>
      </div>`;
    }
    const ti = document.getElementById('emptyTitle'); if(ti) ti.textContent = t.emptyTitle;
    const su = document.getElementById('emptySub'); if(su) su.textContent = t.emptySub;
    return;
  }
  // Remove emptyState if still in DOM from static HTML or previous render
  document.getElementById('emptyState')?.remove();
  list.innerHTML = msgs.map(m => {
    const otp = extractOTP(m.subject, m.body_text || m.body, m.body_html);
    const sender = m.from_address || '';
    const senderName = sender.split('@')[0] || sender;
    const initial = (senderName[0] || '?').toUpperCase();
    const preview = (m.body_text || m.body || '').replace(/\s+/g, ' ').trim().slice(0, 100);
    return `
    <div class="msg-item ${m.is_seen ? '' : 'unread'}" data-id="${escHtml(m.id)}">
      <div class="msg-avatar">${escHtml(initial)}</div>
      <div class="msg-content">
        <div class="msg-meta">
          <span class="msg-from">${escHtml(sender)}</span>
          <span class="msg-time" title="${toWIB(m.received_at)}">${relativeTime(m.received_at)}</span>
        </div>
        <div class="msg-subject">${escHtml(m.subject || '(no subject)')}</div>
        ${preview ? `<div class="msg-preview">${escHtml(preview)}</div>` : ''}
        ${otp ? `<div class="msg-otp-row">
          <span class="msg-otp-badge">${escHtml(otp)}</span>
          <button class="msg-otp-copy" data-otp="${escHtml(otp)}">Copy</button>
        </div>` : ''}
      </div>
    </div>`;
  }).join('');
  list.querySelectorAll('.msg-item').forEach(el => {
    el.addEventListener('click', () => openMessage(msgs.find(m => m.id === el.dataset.id)));
  });
  // OTP copy buttons — stop propagation so modal doesn't open
  list.querySelectorAll('.msg-otp-copy').forEach(btn => {
    btn.addEventListener('click', e => {
      e.stopPropagation();
      navigator.clipboard.writeText(btn.dataset.otp).then(() => toast('OTP copied!', 'success'));
    });
  });
}

/* ── Message modal ───────────────────────────────────── */
function openMessage(msg) {
  if (!msg) return;
  document.getElementById('modalSubject').textContent = msg.subject;
  document.getElementById('modalMeta').textContent = `From: ${msg.from_address} · ${toWIB(msg.received_at)}`;

  const body = document.getElementById('modalBody');
  body.innerHTML = '';
  if (msg.body_html) {
    const frame = document.createElement('iframe');
    frame.setAttribute('sandbox', 'allow-same-origin');
    frame.style.cssText = 'width:100%;border:none;min-height:200px;border-radius:8px';
    body.appendChild(frame);
    // Write after appended so contentDocument is accessible
    try {
      const doc = frame.contentDocument;
      doc.open(); doc.write(msg.body_html); doc.close();
      frame.style.height = (doc.body?.scrollHeight || 300) + 32 + 'px';
    } catch { /* cross-origin guard */ }
  } else {
    body.style.whiteSpace = 'pre-wrap';
    body.textContent = msg.body || '(empty)';
  }

  document.getElementById('modalOverlay').classList.add('open');
  msg.is_seen = 1; // local optimistic update
}

/* ── Polling ─────────────────────────────────────────── */
let fastPollTimeout = null;

function restartPoll(useFastPoll = false) {
  if (pollTimer) clearInterval(pollTimer);
  if (fastPollTimeout) clearTimeout(fastPollTimeout);
  
  const interval = useFastPoll ? 2000 : 3000;
  pollTimer = setInterval(() => { if (currentAddress) loadMessages(); }, interval);
  
  // If fast poll, switch to normal after 30 seconds
  if (useFastPoll) {
    fastPollTimeout = setTimeout(() => restartPoll(false), 30000);
  }
}

/* ── Mobile sidebar toggle ────────────────────────── */
function wireMobileSidebar() {
  const toggle = document.getElementById('sidebarToggle');
  const sidebar = document.querySelector('.dm-side');
  if (!toggle || !sidebar) return;
  toggle.addEventListener('click', () => sidebar.classList.toggle('sidebar-open'));
  // Close sidebar when user clicks inbox panel on mobile
  document.querySelector('.dm-main')?.addEventListener('click', () => {
    if (window.innerWidth < 769) sidebar.classList.remove('sidebar-open');
  });
}

/* ── Event wiring ────────────────────────────────────── */
function wireEvents() {
  // EN | ID toggle
  document.getElementById('langEn')?.addEventListener('click', () => {
    lang = 'en'; localStorage.setItem('lang', lang); applyLang(); loadMessages();
  });
  document.getElementById('langId')?.addEventListener('click', () => {
    lang = 'id'; localStorage.setItem('lang', lang); applyLang(); loadMessages();
  });

  document.getElementById('themeBtn')?.addEventListener('click', () => {
    applyTheme(getTheme() === 'dark' ? 'light' : 'dark');
  });

  document.getElementById('createBtn').addEventListener('click', async () => {
    const val = document.getElementById('usernameInput').value.trim();
    if (!val) { toast(LANG[lang].usernameRequired, 'error'); return; }
    await ensureSession();
    await createInbox(val);
  });

  document.getElementById('randomBtn').addEventListener('click', () => {
    const firstNames = [
      'emma','olivia','sophia','isabella','mia','amelia','luna','chloe','elena','aurora',
      'aria','stella','violet','claire','nora','elise','amelie','ingrid','astrid','freya',
      'sienna','isla','julia','alice','anna','lena','nina','eva','lea','sara',
      'maja','ida','hanna','lisa','ella','signe','katja','petra','diana','irene',
      'vera','rosa','clara','ines','valentina','camille','elisa','nadine','bianca',
      'chiara','francesca','giovanna','beatrice','federica','silvia','margot','juliette','celine','manon',
      'zoe','louise','eloise','charlotte','mathilde','marine','pauline','helene','vivienne','cecile',
      'annika','britta','greta','lotte','marlene','sabine','ursula','yvonne','colette','brigitte',
      'liam','noah','oliver','elias','lucas','finn','leo','max','felix','jan',
      'erik','anders','bjorn','sven','lars','henrik','magnus','oskar','tobias','viktor',
      'matthias','lukas','stefan','fabian','florian','moritz','simon','tim','philipp','christian',
      'marco','luca','giulio','matteo','davide','giacomo','lorenzo','pietro','filippo','andrea',
      'pierre','nicolas','thomas','antoine','baptiste','hugo','theo','alexis','romain','quentin',
      'dmitri','alexei','nikolai','sergei','ivan','igor','mikhail','andrei','roman','vadim',
      'james','george','harry','william','edward','henry','arthur','alfred','charlie','oscar',
      'rafael','gabriel','samuel','nathaniel','dominic','benjamin','julian','kasper','leander','felix',
    ];
    const lastNames = [
      'mueller','schmidt','schneider','fischer','weber','meyer','wagner','becker','schulz','hoffmann',
      'klein','wolf','schroeder','neumann','zimmermann','braun','krueger','hartmann','lange','werner',
      'rossi','ferrari','esposito','bianchi','romano','colombo','ricci','marino','greco','conti',
      'martin','bernard','thomas','petit','robert','richard','durand','dubois','moreau','simon',
      'garcia','martinez','rodriguez','sanchez','lopez','gonzalez','perez','torres','fernandez','diaz',
      'smith','jones','williams','brown','taylor','davies','evans','wilson','thomas','roberts',
      'anderson','johnson','eriksson','lindqvist','karlsson','johansson','nilsson','larsson','svensson','persson',
      'novak','dvorak','cerny','blaha','horak','pospisil','kral','jelinek','kopecky','fiala',
      'kowalski','wojcik','kowalczyk','kaminski','lewandowski','zielinski','szymanski','wozniak','dabrowski','kozlowski',
      'dupont','lambert','bonnet','francois','legrand','garnier','faure','rousseau','blanc','chevalier',
    ];
    const pick = arr => arr[Math.floor(Math.random() * arr.length)];
    const num = String(Math.floor(Math.random() * 90 + 10)); // 2-digit
    const username = pick(firstNames) + pick(lastNames) + num;
    document.getElementById('usernameInput').value = username;
    createInbox(username);
  });

  // Block non-alphanumeric in username input
  document.getElementById('usernameInput').addEventListener('input', e => {
    const cleaned = e.target.value.replace(/[^a-z0-9]/gi, '');
    if (cleaned !== e.target.value) e.target.value = cleaned;
  });

  document.getElementById('usernameInput').addEventListener('keydown', e => {
    if (e.key === 'Enter') document.getElementById('createBtn').click();
  });

  document.getElementById('copyBtn').addEventListener('click', () => {
    if (!currentAddress) return;
    navigator.clipboard.writeText(currentAddress)
      .then(() => toast(LANG[lang].copied, 'success'))
      .catch(() => toast('Copy failed — use Ctrl+C', 'error'));
  });

  document.getElementById('refreshBtn').addEventListener('click', loadMessages);

  // Modal close
  const overlay = document.getElementById('modalOverlay');
  document.getElementById('modalClose').addEventListener('click', () => overlay.classList.remove('open'));
  overlay.addEventListener('click', e => { if (e.target === overlay) overlay.classList.remove('open'); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape') overlay.classList.remove('open'); });
}

/* ── Mascot Edit Mode (iframe preview) ─────────────────── */
const IS_MASCOT_EDIT = new URLSearchParams(location.search).get('mascotEdit') === '1';
if (IS_MASCOT_EDIT) {
  window.addEventListener('message', (e) => {
    if (e.origin !== location.origin) return;
    if (e.data.type === 'mascotUpdate') {
      applyMascot({
        mascotEnabled: true,
        mascotImage: e.data.image,
        mascotX: e.data.x,
        mascotY: e.data.y,
        mascotSize: e.data.size,
      });
      const img = document.getElementById('mascotImg');
      if (img && img.style.display === 'block') {
        img.classList.add('mascot-editable');
        let isDragging = false;
        img.addEventListener('mousedown', () => { isDragging = true; img.classList.add('mascot-dragging'); });
        document.addEventListener('mousemove', (ev) => {
          if (!isDragging) return;
          const x = (ev.clientX / window.innerWidth) * 100;
          const y = (ev.clientY / window.innerHeight) * 100;
          img.style.left = `${x}%`;
          img.style.top = `${y}%`;
          window.parent.postMessage({ type: 'mascotPositionUpdate', x, y }, location.origin);
        });
        document.addEventListener('mouseup', () => { isDragging = false; img.classList.remove('mascot-dragging'); });
      }
    }
  });
  window.parent.postMessage({ type: 'mascotPreviewReady' }, location.origin);
}

/* ── Bootstrap ────────────────────────────────────── */
async function init() {
  initStarfield();
  applyLang();
  wireEvents();
  wireMobileSidebar();
  startNavClock();

  await ensureSession();
  await loadConfig();
  await loadInboxes();
  loadStats();
  restartPoll();
}

init();
