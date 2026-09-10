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

/* Toast */
function toast(msg,type='info'){
  const el=document.createElement('div');
  el.className=`toast ${type}`; el.textContent=msg;
  document.getElementById('toastContainer').appendChild(el);
  setTimeout(()=>{ el.classList.add('fadeout'); setTimeout(()=>el.remove(),250); },2500);
}

function getKey(){ return document.getElementById('apiKeyInput').value.trim(); }
function showResult(id,data){ const el=document.getElementById(id); el.textContent=JSON.stringify(data,null,2); el.closest('.try-result').classList.add('show'); }

async function tryIt(endpoint){
  const key=getKey();
  if(!key){ toast('Masukkan API Key terlebih dahulu','error'); return; }
  try{
    const r=await fetch(`/pub/${endpoint}/${key}`);
    showResult(`try-${endpoint}-out`,await r.json());
  }catch(e){ toast('Request gagal: '+e.message,'error'); }
}
window.tryIt=tryIt;

async function tryItEmail(){
  const key=getKey(); if(!key){ toast('Masukkan API Key terlebih dahulu','error'); return; }
  const email=document.getElementById('try-email-input').value.trim();
  if(!email){ document.getElementById('try-email').classList.add('show'); return; }
  try{
    const r=await fetch(`/pub/email/${encodeURIComponent(email)}/${key}`);
    showResult('try-email-out',await r.json());
  }catch(e){ toast('Request gagal: '+e.message,'error'); }
}
window.tryItEmail=tryItEmail;

async function tryItMessages(){
  const key=getKey(); if(!key){ toast('Masukkan API Key terlebih dahulu','error'); return; }
  const email=document.getElementById('try-msg-input').value.trim();
  if(!email){ document.getElementById('try-messages').classList.add('show'); return; }
  try{
    const r=await fetch(`/pub/messages/${encodeURIComponent(email)}/${key}`);
    showResult('try-messages-out',await r.json());
  }catch(e){ toast('Request gagal: '+e.message,'error'); }
}
window.tryItMessages=tryItMessages;

/* Theme toggle */
document.getElementById('themeBtn')?.addEventListener('click',()=>{
  const t=document.documentElement.getAttribute('data-theme')==='dark'?'light':'dark';
  document.documentElement.setAttribute('data-theme',t);
  document.getElementById('themeBtn').textContent=t==='dark'?'☀️':'🌙';
  localStorage.setItem('theme',t);
});
