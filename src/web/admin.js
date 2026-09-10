/* Theme */
(function(){
  const t=localStorage.getItem('theme')||'dark';
  document.documentElement.setAttribute('data-theme',t);
  const btn=document.getElementById('themeBtn');
  if(btn) btn.textContent=t==='dark'?'☀️':'🌙';
})();

/* Starfield */
(function(){
  const c=document.getElementById('starfield'),x=c.getContext('2d');
  let s=[];
  function isDark(){ return document.documentElement.getAttribute('data-theme')==='dark'; }
  function resize(){ c.width=innerWidth; c.height=innerHeight; }
  function make(n){ s=Array.from({length:n},()=>({x:Math.random()*c.width,y:Math.random()*c.height,r:Math.random()*1.2+0.2,a:Math.random(),da:(Math.random()*0.004+0.001)*(Math.random()<0.5?1:-1)})); }
  function draw(){ x.clearRect(0,0,c.width,c.height); if(isDark()) for(const p of s){p.a=Math.max(0.05,Math.min(1,p.a+p.da));if(p.a<=0.05||p.a>=1)p.da*=-1;x.beginPath();x.arc(p.x,p.y,p.r,0,Math.PI*2);x.fillStyle=`rgba(255,255,255,${p.a})`;x.fill();} requestAnimationFrame(draw); }
  resize(); make(120); draw();
  addEventListener('resize',()=>{ resize(); make(120); });
})();

/* Toast */
function toast(msg, type='info'){
  const container=document.getElementById('toastContainer');
  if([...container.children].some(c=>c.textContent===msg)) return;
  const el=document.createElement('div');
  el.className=`toast ${type}`; el.textContent=msg;
  container.appendChild(el);
  setTimeout(()=>{ el.classList.add('fadeout'); setTimeout(()=>el.remove(),250); },2800);
}

/* Helpers */
const $ = id => document.getElementById(id);
const esc = s => (s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
/* Force UTC parse — SQLite stores without Z suffix */
function parseUTC(iso){ if(!iso) return new Date(); return new Date(iso.endsWith('Z')||iso.includes('+')?iso:iso+'Z'); }
function rel(iso){ const s=Math.floor((Date.now()-parseUTC(iso))/1000); if(s<60)return s+'s ago'; if(s<3600)return Math.floor(s/60)+'m ago'; if(s<86400)return Math.floor(s/3600)+'h ago'; return Math.floor(s/86400)+'d ago'; }
function toWIB(iso){ return parseUTC(iso).toLocaleString('id-ID',{timeZone:'Asia/Jakarta',day:'2-digit',month:'short',year:'numeric',hour:'2-digit',minute:'2-digit',second:'2-digit',hour12:false})+' WIB'; }

/* ── Custom Modal Helpers ────────────────────────── */
function _openModal() { document.getElementById('admModalOverlay').classList.add('open'); }
function _closeModal() { document.getElementById('admModalOverlay').classList.remove('open'); }

// admPrompt(title, fields) → Promise<object|null>
// fields: [{id, label, placeholder, value}]
function admPrompt(title, fields) {
  return new Promise(resolve => {
    const titleEl = document.getElementById('admModalTitle');
    const content = document.getElementById('admModalContent');
    const confirmBtn = document.getElementById('admModalConfirm');
    const cancelBtn = document.getElementById('admModalCancel');
    titleEl.textContent = title;
    confirmBtn.textContent = 'Tambah';
    confirmBtn.className = 'adm-modal-confirm';
    content.innerHTML = fields.map(f => `
      <div style="margin-bottom:14px">
        <div class="adm-modal-label">${f.label}</div>
        <input id="_mf_${f.id}" class="adm-modal-input" placeholder="${f.placeholder||''}" value="${f.value||''}" />
      </div>`).join('');
    _openModal();
    // Focus first input
    setTimeout(() => document.getElementById('_mf_'+fields[0].id)?.focus(), 60);
    const done = (ok) => {
      _closeModal();
      confirmBtn.onclick = null; cancelBtn.onclick = null;
      if (!ok) { resolve(null); return; }
      const result = {};
      fields.forEach(f => { result[f.id] = document.getElementById('_mf_'+f.id)?.value || ''; });
      resolve(result);
    };
    confirmBtn.onclick = () => done(true);
    cancelBtn.onclick = () => done(false);
    // Enter key submits
    content.onkeydown = e => { if(e.key==='Enter') done(true); };
  });
}

// admConfirm(title, body, danger?) → Promise<boolean>
function admConfirm(title, body, danger = false) {
  return new Promise(resolve => {
    const titleEl = document.getElementById('admModalTitle');
    const content = document.getElementById('admModalContent');
    const confirmBtn = document.getElementById('admModalConfirm');
    const cancelBtn = document.getElementById('admModalCancel');
    titleEl.textContent = title;
    content.innerHTML = `<div class="adm-modal-body">${body}</div>`;
    confirmBtn.textContent = danger ? 'Hapus' : 'Ya';
    confirmBtn.className = 'adm-modal-confirm' + (danger ? ' danger' : '');
    _openModal();
    const done = (ok) => { _closeModal(); confirmBtn.onclick=null; cancelBtn.onclick=null; resolve(ok); };
    confirmBtn.onclick = () => done(true);
    cancelBtn.onclick = () => done(false);
  });
}

/* ────────────────────────────────────────── */

async function api(method, path, body){
  const r = await fetch('/admin'+path, {
    method, headers:{'Content-Type':'application/json'},
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await r.json().catch(()=>({}));
  if(!r.ok) throw new Error(data.error || r.statusText);
  return data;
}

/* ─── LOGIN ─────────────────────────────────────────────── */
async function tryLogin(){
  const user=$('loginUser').value.trim();
  const pass=$('loginPass').value;
  const errEl=$('loginError');
  errEl.style.display='none';
  try{
    await api('POST','/login',{username:user,password:pass});
    showAdmin();
  }catch(err){
    errEl.textContent=err.message;
    errEl.style.display='block';
  }
}

$('loginBtn').addEventListener('click', tryLogin);
$('loginPass').addEventListener('keydown', e=>{ if(e.key==='Enter') tryLogin(); });
$('pwToggle').addEventListener('click',function(){
  const i=$('loginPass'); i.type=i.type==='password'?'text':'password'; this.textContent=i.type==='password'?'👁':'🙈';
});

/* ─── CHECK AUTH ────────────────────────────────────────── */
async function init(){
  try{
    await api('GET','/me');
    showAdmin();
  }catch{
    // Show login page — already visible by default
  }
}

function showAdmin(){
  $('loginPage').style.display='none';
  const loginNav=$('adminLoginNav');
  if(loginNav) loginNav.style.display='none';
  $('adminLayout').style.display='flex';
  loadDashboard();
}

/* ─── LOGOUT ────────────────────────────────────────────── */
$('logoutBtn').addEventListener('click', async()=>{
  await api('POST','/logout').catch(()=>{});
  location.reload();
});

/* ─── TABS ──────────────────────────────────────────────── */
document.querySelectorAll('.admin-tab').forEach(tab=>{
  tab.addEventListener('click',()=>{
    document.querySelectorAll('.admin-tab').forEach(t=>t.classList.remove('active'));
    document.querySelectorAll('.tab-panel').forEach(p=>p.classList.remove('active'));
    tab.classList.add('active');
    $('tab-'+tab.dataset.tab).classList.add('active');
    // dashboard is already loaded on showAdmin(); only lazy-load other tabs
    const loaders={domains:loadDomains,apikeys:loadApiKeys,settings:loadSettings,cronlogs:loadCronLogs};
    loaders[tab.dataset.tab]?.();
  });
});

/* ─── DASHBOARD ─────────────────────────────────────────── */
let currentPeriod='7d';
function animateCount(el, target, duration=800){
  if(!el) return;
  const start=parseInt(el.textContent)||0, range=target-start, startTime=performance.now();
  function step(now){
    const p=Math.min((now-startTime)/duration,1);
    const ease=1-Math.pow(1-p,3); // ease-out cubic
    el.textContent=Math.round(start+range*ease).toLocaleString();
    if(p<1) requestAnimationFrame(step);
  }
  requestAnimationFrame(step);
}
async function loadDashboard(){
  const data = await api('GET',`/stats?period=${currentPeriod}`).catch(()=>null);
  if(!data) return;
  animateCount($('sc-totalMsg'), data.totalMessages);
  animateCount($('sc-totalInbox'), data.totalInboxes);
  animateCount($('sc-current'), data.currentMessages);
  animateCount($('sc-unread'), data.unreadMessages);

  renderChart(data.chart.messages, 'chartBars', false);
  renderChart(data.chart.inboxes, 'chartBarsInbox', true);
  renderLatest(data.latestMessages);
}

function renderChart(points, targetId, isInbox){
  const el = $(targetId); if(!el) return;
  if(!points||points.length===0){ el.innerHTML='<div style="color:var(--text-3);font-size:12px">Belum ada data</div>'; return; }
  const max=Math.max(...points.map(p=>p.count),1);
  el.innerHTML=points.map(p=>`
    <div class="chart-bar-wrap">
      <div class="chart-bar${isInbox?' inbox':''}" style="height:${Math.max(2,Math.round((p.count/max)*110))}px" title="${p.count}"></div>
      <div class="chart-label">${p.date.slice(5)}</div>
    </div>`).join('');
}

function renderLatest(msgs){
  $('latestMsgTable').innerHTML=(msgs||[]).map(m=>`<tr>
    <td>${esc(m.from_address)}</td><td>${esc(m.subject)}</td>
    <td style="color:var(--cyan)">${esc(m.inbox_address)}</td>
    <td title="${toWIB(m.received_at)}">${rel(m.received_at)}</td></tr>`).join('');
}

document.querySelectorAll('.period-btn').forEach(btn=>{
  btn.addEventListener('click',()=>{
    document.querySelectorAll('.period-btn').forEach(b=>b.classList.remove('active'));
    btn.classList.add('active');
    currentPeriod=btn.dataset.period;
    loadDashboard();
  });
});

/* ─── DOMAINS ───────────────────────────────────────────── */
async function loadDomains(){
  const domains=await api('GET','/domains').catch(()=>[]);
  // Card grid
  const grid=document.getElementById('domainGrid');
  if(grid) grid.innerHTML=domains.map(d=>`
    <div class="domain-card">
      <div class="domain-card-head">
        <div class="domain-card-name" title="${esc(d.domain)}">${esc(d.domain)}</div>
        <span class="badge ${d.is_active?'badge-green':'badge-red'}">${d.is_active?'Active':'Inactive'}</span>
      </div>
      <div class="domain-card-actions">
        <button class="domain-edit-btn" onclick="toggleDomainActive('${esc(d.domain)}',${d.is_active})">${d.is_active?'✕ Nonaktifkan':'✓ Aktifkan'}</button>
        <button class="domain-del-btn" onclick="delDomain('${esc(d.domain)}')" title="Hapus">🗑</button>
      </div>
    </div>`).join('');
  // Also keep hidden table for backward compat
  $('domainTable').innerHTML=domains.map(d=>`<tr><td>${esc(d.domain)}</td></tr>`).join('');
}
async function toggleDomainActive(domain,active){ await api('PATCH',`/domains/${encodeURIComponent(domain)}`,{is_active:!active}); loadDomains(); }
async function toggleDomainType(domain,type){ await api('PATCH',`/domains/${encodeURIComponent(domain)}`,{type:type==='open'?'member':'open'}); loadDomains(); }
async function delDomain(domain){
  const ok = await admConfirm('Hapus Domain', `Hapus domain <b>${esc(domain)}</b>? Tindakan ini tidak dapat dibatalkan.`, true);
  if(!ok) return;
  await api('DELETE',`/domains/${encodeURIComponent(domain)}`);
  loadDomains(); toast('Domain dihapus');
}
window.toggleDomainActive=toggleDomainActive; window.toggleDomainType=toggleDomainType; window.delDomain=delDomain;

$('addDomainBtn').addEventListener('click', async () => {
  const result = await admPrompt('Tambah Domain', [
    { id: 'domain', label: 'Domain', placeholder: 'contoh: mail.example.com' }
  ]);
  if (!result || !result.domain.trim()) return;
  await api('POST', '/domains', { domain: result.domain.trim(), type: 'open' });
  loadDomains(); toast('Domain ditambahkan', 'success');
});

/* ─── API KEYS ──────────────────────────────────────────── */
async function loadApiKeys(){
  const keys=await api('GET','/api-keys').catch(()=>[]);
  $('apiKeyTable').innerHTML=keys.map(k=>`<tr>
    <td style="color:var(--text-1)">${esc(k.label)||'—'}</td>
    <td><code style="font-size:11px;color:var(--cyan)">${esc(k.key_masked)}</code>
      <button onclick="copyText('${esc(k.key_full)}')" style="background:none;border:none;color:var(--text-3);cursor:pointer;font-size:13px;padding:2px 6px" title="Salin key penuh">📋</button></td>
    <td>${k.rate_limit_per_min}/min</td>
    <td>${k.expires_at?rel(k.expires_at):'Tidak ada'}</td>
    <td><span class="badge ${k.is_active?'badge-green':'badge-red'}">${k.is_active?'Aktif':'Nonaktif'}</span></td>
    <td style="display:flex;gap:6px">
      ${k.is_active?`<button class="tbl-action" onclick="revokeKey('${esc(k.key_full)}')">Revoke</button>`:''}
      <button class="tbl-action del" onclick="deleteKey('${esc(k.key_full)}')">Hapus</button>
    </td></tr>`).join('');
}
async function revokeKey(key){
  const ok = await admConfirm('Nonaktifkan API Key', 'API Key ini akan dinonaktifkan dan tidak bisa digunakan lagi.');
  if(!ok) return;
  await api('PATCH',`/api-keys/${encodeURIComponent(key)}/revoke`);
  loadApiKeys(); toast('Key dinonaktifkan');
}
async function deleteKey(key){
  const ok = await admConfirm('Hapus API Key', 'Hapus permanen API Key ini? Tindakan ini tidak dapat dibatalkan.', true);
  if(!ok) return;
  await api('DELETE',`/api-keys/${encodeURIComponent(key)}`);
  loadApiKeys(); toast('Key dihapus');
}
window.revokeKey=revokeKey; window.deleteKey=deleteKey;

$('addKeyBtn').addEventListener('click', async () => {
  const result = await admPrompt('Buat API Key', [
    { id: 'label', label: 'Label', placeholder: 'contoh: Bot Saya' },
    { id: 'rate',  label: 'Rate limit per menit', placeholder: '60', value: '60' },
  ]);
  if (!result) return;
  const rate = parseInt(result.rate) || 60;
  const data = await api('POST', '/api-keys', { label: result.label, rate_limit_per_min: rate });
  await navigator.clipboard.writeText(data.key).catch(() => {});
  toast(`Key dibuat & disalin: ${data.key.slice(0,16)}...`, 'success');
  loadApiKeys();
});

/* ─── SETTINGS ──────────────────────────────────────────── */
async function loadSettings(){
  const s=await api('GET','/settings').catch(()=>({}));
  const str = key => { const v=s[key]; return typeof v==='string'?v:JSON.stringify(v??''); };
  const num = key => s[key]??'';
  $('s-app_name').value=str('app_name');
  $('s-footer_text').value=str('footer_text');
  $('s-social_links').value=typeof s.social_links==='object'?JSON.stringify(s.social_links):str('social_links');
  $('s-forbidden_usernames').value=JSON.stringify(s.forbidden_usernames??[]);
  $('s-username_min').value=num('username_min');
  $('s-username_max').value=num('username_max');
  $('s-daily_inbox_limit').value=num('daily_inbox_limit');
  $('s-disable_used_email').checked=!!s.disable_used_email;
  $('s-max_messages_per_inbox').value=num('max_messages_per_inbox');
  $('s-auto_delete_enabled').checked=!!s.auto_delete_enabled;
  $('s-delete_value').value=num('delete_value');
  $('s-delete_unit').value=str('delete_unit').replace(/"/g,'')||'d';
  // Detect changes
  const hint=$('settingsChangedHint');
  if(hint) hint.style.display='none';
  document.querySelectorAll('#tab-settings input,#tab-settings select').forEach(el=>{
    el.addEventListener('input',()=>{ if(hint) hint.style.display='inline'; },{once:false});
    el.addEventListener('change',()=>{ if(hint) hint.style.display='inline'; },{once:false});
  });
}

$('saveSettingsBtn').addEventListener('click',async()=>{
  function tryJson(s){ try{ return JSON.parse(s); }catch{ return s; } }
  const body={
    app_name: $('s-app_name').value,
    footer_text: $('s-footer_text').value,
    social_links: tryJson($('s-social_links').value),
    forbidden_usernames: tryJson($('s-forbidden_usernames').value),
    username_min: parseInt($('s-username_min').value),
    username_max: parseInt($('s-username_max').value),
    daily_inbox_limit: parseInt($('s-daily_inbox_limit').value),
    disable_used_email: $('s-disable_used_email').checked,
    max_messages_per_inbox: parseInt($('s-max_messages_per_inbox').value),
    auto_delete_enabled: $('s-auto_delete_enabled').checked,
    delete_value: parseInt($('s-delete_value').value)||1,
    delete_unit: $('s-delete_unit').value,
  };
  try{
    await api('PATCH','/settings',body);
    toast('Pengaturan disimpan','success');
    const hint=$('settingsChangedHint'); if(hint) hint.style.display='none';
  }catch(err){
    toast('Gagal simpan: '+err.message,'error');
  }
});

$('savePasswordBtn').addEventListener('click',async()=>{
  const username=$('pw-username').value.trim()||'admin';
  const password=$('pw-password').value;
  if(password.length<8){ toast('Password minimal 8 karakter','error'); return; }
  await api('POST','/settings/password',{username,password});
  toast('Password berhasil diubah','success');
  $('pw-password').value='';
});

$('exportBtn').addEventListener('click',async()=>{
  const r=await fetch('/admin/settings/export');
  const blob=await r.blob();
  const url=URL.createObjectURL(blob);
  const a=document.createElement('a'); a.href=url; a.download='sphixmail-settings.json'; a.click();
  URL.revokeObjectURL(url);
  toast('Settings diekspor','success');
});

$('importFile').addEventListener('change',async function(){
  const file=this.files[0]; if(!file) return;
  const text=await file.text();
  let data; try{ data=JSON.parse(text); }catch{ toast('File JSON tidak valid','error'); return; }
  await api('POST','/settings/import',data);
  toast('Settings diimpor','success');
  loadSettings();
  this.value='';
});

/* ─── CRON LOGS ─────────────────────────────────────────── */
async function loadCronLogs(){
  const logs=await api('GET','/cron-logs').catch(()=>[]);
  $('cronLogTable').innerHTML=(logs.length?logs:[{message:'Belum ada log.',created_at:new Date().toISOString()}]).map(l=>`<tr>
    <td style="white-space:nowrap;color:var(--text-3)">${rel(l.created_at)}</td>
    <td>${esc(l.message)}</td></tr>`).join('');
}

/* ─── Utils ─────────────────────────────────────────────── */
function copyText(text){ navigator.clipboard.writeText(text).then(()=>toast('Disalin!','success')); }
window.copyText=copyText;

/* ─── Boot ──────────────────────────────────────────────── */
document.getElementById('themeBtn')?.addEventListener('click',()=>{
  const t=document.documentElement.getAttribute('data-theme')==='dark'?'light':'dark';
  document.documentElement.setAttribute('data-theme',t);
  document.getElementById('themeBtn').textContent=t==='dark'?'☀️':'🌙';
  localStorage.setItem('theme',t);
});
init();
