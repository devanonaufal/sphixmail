/* ── Anti-inspect ───────────────────────────────────── */
(function() {
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

/* Theme */
(function(){
  const t=localStorage.getItem('theme')||'light';
  document.documentElement.setAttribute('data-theme',t);
  const btn=document.getElementById('themeBtn');
  if(btn) btn.textContent=t==='dark'?'☀️':'🌙';
})();

/* Starfield */
(function(){
  const c=document.getElementById('starfield'),x=c.getContext('2d');
  let s=[];
  function resize(){ c.width=innerWidth; c.height=innerHeight; }
  function make(n){ s=Array.from({length:n},()=>({x:Math.random()*c.width,y:Math.random()*c.height,r:Math.random()*1.2+0.2,a:Math.random(),da:(Math.random()*0.004+0.001)*(Math.random()<0.5?1:-1)})); }
  function draw(){ x.clearRect(0,0,c.width,c.height); for(const p of s){p.a=Math.max(0.05,Math.min(1,p.a+p.da));if(p.a<=0.05||p.a>=1)p.da*=-1;x.beginPath();x.arc(p.x,p.y,p.r,0,Math.PI*2);x.fillStyle=`rgba(255,255,255,${p.a})`;x.fill();} requestAnimationFrame(draw); }
  resize(); make(120); draw();
  addEventListener('resize',()=>{ resize(); make(120); });
})();

/* Load base URL from config */
fetch('/api/config').then(r=>r.json()).then(cfg=>{
  const base=`https://${cfg.webHost||location.host}`;
  document.getElementById('baseUrl').textContent=base;
  document.querySelectorAll('.code-block').forEach(el=>{
    el.innerHTML=el.innerHTML.replace(/https:\/\/sphixmail\.example\.com/g,base);
  });
}).catch(()=>{});

/* API key persistence */
const keyInput=document.getElementById('apiKeyInput');
keyInput.value=localStorage.getItem('sphixApiKey')||'';
keyInput.addEventListener('input',()=>localStorage.setItem('sphixApiKey',keyInput.value.trim()));
document.getElementById('apiKeyVis').addEventListener('click',function(){
  keyInput.type=keyInput.type==='password'?'text':'password';
  this.textContent=keyInput.type==='password'?'👁':'🙈';
});

/* Accordion */
document.querySelectorAll('.endpoint-head').forEach(el=>{
  el.addEventListener('click',()=>el.closest('.endpoint-card').classList.toggle('open'));
});

/* Copy code */
function copyCode(blockId){
  const el=document.getElementById(blockId);
  const text=el.innerText.replace(/^copy\n?/,'').trim();
  navigator.clipboard.writeText(text).then(()=>toast('Disalin!','success'));
}
window.copyCode=copyCode;

/* Test endpoint */
async function testEndpoint(endpoint){
  const key=document.getElementById('apiKeyInput').value.trim();
  const base=document.getElementById('baseUrl').textContent||location.origin;
  const outId=endpoint+'Out';
  const out=document.getElementById(outId);
  if(!out) return;
  out.textContent='Loading...';
  out.style.color='var(--text-3)';
  try{
    let url='';
    if(endpoint==='domains') url=`${base}/pub/domains/${key}`;
    else if(endpoint==='validate') url=`${base}/pub/email/test@sphixray.com/${key}`;
    else if(endpoint==='messages') url=`${base}/pub/messages/test@sphixray.com/${key}?limit=3`;
    else if(endpoint==='stats') url=`${base}/pub/stats/${key}?filters=total_messages,current_messages`;
    const r=await fetch(url);
    const json=await r.json();
    out.textContent=JSON.stringify(json,null,2);
    out.style.color=r.ok?'var(--green)':'var(--red)';
  }catch(e){
    out.textContent='Error: '+e.message;
    out.style.color='var(--red)';
  }
}
window.testEndpoint=testEndpoint;

/* Toast */
function toast(msg,type='info'){
  const c=document.getElementById('toastContainer');
  if(!c) return;
  if([...c.children].some(x=>x.textContent===msg)) return;
  const el=document.createElement('div');
  el.className=`toast ${type}`;
  el.textContent=msg;
  c.appendChild(el);
  setTimeout(()=>{ el.classList.add('fadeout'); setTimeout(()=>el.remove(),250); },2800);
}

/* Profile Dropdown */
async function checkAdminSession() {
  try {
    const r = await fetch('/admin/me');
    return r.ok;
  } catch {
    return false;
  }
}

function setupProfileDropdown() {
  const profileBtn = document.getElementById('navProfileBtn');
  const profileWrap = document.getElementById('navProfileWrap');
  const logoutBtn = document.getElementById('navProfileLogout');

  if (!profileBtn || !profileWrap) return;

  profileBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    profileWrap.classList.toggle('open');
  });

  document.addEventListener('click', (e) => {
    if (!profileWrap.contains(e.target)) {
      profileWrap.classList.remove('open');
    }
  });

  if (logoutBtn) {
    logoutBtn.addEventListener('click', async () => {
      await fetch('/admin/logout', { method: 'POST' }).catch(() => {});
      location.reload();
    });
  }
}

(async function initProfileMenu() {
  const isAdmin = await checkAdminSession();
  const adminBtn = document.getElementById('navAdminBtn');
  const profileWrap = document.getElementById('navProfileWrap');
  if (isAdmin) {
    if (adminBtn) adminBtn.style.display = 'none';
    if (profileWrap) profileWrap.style.display = 'block';
    setupProfileDropdown();
  }
})();
