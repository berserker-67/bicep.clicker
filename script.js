const upgradesUrl = './assets/upgrades.json';
const bgEl = document.getElementById('bg');
const dumbEl = document.getElementById('dumb');
const decorEl = document.getElementById('decor');
const armObj = document.getElementById('armobj');
const armPng = document.getElementById('armpng');
const armwrap = document.getElementById('armwrap');
const upgradesList = document.getElementById('upgradesList');
const strengthEl = document.getElementById('strength');
const perClickEl = document.getElementById('perClick');
const autoEl = document.getElementById('auto');
const exportBtn = document.getElementById('export');
const importBtn = document.getElementById('importBtn');
const importFile = document.getElementById('importFile');
const resetBtn = document.getElementById('reset');

let upgrades = [];
let state = { strength:0, perClick:1, autoPerSecond:0, bought:{} , stage:0 };

function save(){ localStorage.setItem('bicep_evo_save', JSON.stringify(state)); }
function load(){ const s = localStorage.getItem('bicep_evo_save'); if(s) state = JSON.parse(s); }

async function loadUpgrades(){ const res = await fetch(upgradesUrl); upgrades = await res.json(); renderUpgrades(); applyBoughtEffects(); updateHud(); }

function renderUpgrades(){ upgradesList.innerHTML=''; upgrades.forEach(u=>{ const row = document.createElement('div'); row.className='upgrade'; const meta = document.createElement('div'); meta.innerHTML = '<strong>'+u.name+'</strong><div style="font-size:12px;color:#9fb0c8">'+u.desc+'</div>'; const btn = document.createElement('button'); btn.textContent = state.bought[u.id] ? 'Gekauft' : 'Kaufen'; btn.disabled = !!state.bought[u.id]; btn.onclick = ()=> buy(u,btn); row.appendChild(meta); row.appendChild(btn); upgradesList.appendChild(row); }); }

function buy(u, btn){ if(state.strength >= u.cost){ state.strength -= u.cost; state.bought[u.id]=true; // change scene and dumbbell if provided
  if(u.scene) setScene(u.scene); if(u.dumb) setDumb(u.dumb); if(u.decor) setDecor(u.decor); applyEffect(u); btn.textContent='Gekauft'; btn.disabled=true; save(); updateHud(); btn.animate([{transform:'scale(1)'},{transform:'scale(1.05)'},{transform:'scale(1)'}],{duration:350}); } else { btn.animate([{transform:'translateX(0)'},{transform:'translateX(-6px)'},{transform:'translateX(6px)'},{transform:'translateX(0)'}],{duration:350}); } }

function applyEffect(u){ if(u.perClickAdd) state.perClick += u.perClickAdd; if(u.perClickMult) state.perClick *= u.perClickMult; if(u.autoAdd) state.autoPerSecond += u.autoAdd; state.perClick = Math.round(state.perClick*100)/100; state.autoPerSecond = Math.round(state.autoPerSecond*100)/100; }

function applyBoughtEffects(){ upgrades.forEach(u=>{ if(state.bought[u.id]) applyEffect(u); }); // set last bought scene/dumb if any
  const boughtIds = Object.keys(state.bought); if(boughtIds.length){ const last = upgrades.find(u=>u.id===boughtIds[boughtIds.length-1]); if(last){ if(last.scene) setScene(last.scene); if(last.dumb) setDumb(last.dumb); if(last.decor) setDecor(last.decor); } } }

function setScene(filename){ // fade transition
  const prev = bgEl.cloneNode(true); prev.style.position='absolute'; prev.style.left='0'; prev.style.top='0'; prev.style.opacity='1'; prev.style.transition='opacity 400ms'; bgEl.parentNode.appendChild(prev); setTimeout(()=>{ prev.style.opacity='0'; },20); setTimeout(()=>{ prev.remove(); },420); bgEl.src = './assets/'+filename; }

function setDumb(filename){ dumbEl.src = './assets/'+filename; // small scale pulse
  dumbEl.animate([{transform:'scale(1)'},{transform:'scale(1.08)'},{transform:'scale(1)'}],{duration:500}); }

function setDecor(filename){ decorEl.innerHTML=''; const img = document.createElement('img'); img.src='./assets/'+filename; img.style.width='100%'; img.style.height='100%'; img.style.objectFit='contain'; decorEl.appendChild(img); decorEl.animate([{opacity:0},{opacity:1}],{duration:450}); }

function updateHud(){ document.getElementById('strength').textContent = Math.floor(state.strength); // show perClick & auto if present
  // ensure perClick element exists
  if(!document.getElementById('perClick')){ const p = document.createElement('div'); p.id='perClick'; } // no visual element being used here beyond stats
}

function curlAnim(){ // animate dumbbell and arm via SVG if possible
  if(armObj && armObj.contentDocument){ try{ const svg = armObj.contentDocument; const fore = svg.getElementById('forearm'); if(fore){ fore.animate([{transform:'rotate(0deg)'},{transform:'rotate(-42deg)'},{transform:'rotate(-18deg)'},{transform:'rotate(0deg)'}],{duration:650,easing:'cubic-bezier(.2,.9,.2,1)'}); } }catch(e){ /* ignore */ } }
  // dumb wobble
  dumbEl.animate([{transform:'rotate(0deg)'},{transform:'rotate(-8deg)'},{transform:'rotate(4deg)'},{transform:'rotate(0deg)'}],{duration:700}); }

// click handling
armwrap.addEventListener('click', ()=>{ state.strength += state.perClick; updateHud(); save(); curlAnim(); });

// auto gain loop
setInterval(()=>{ if(state.autoPerSecond>0){ state.strength += state.autoPerSecond/5; updateHud(); save(); } },200);

// export/import/reset
exportBtn.addEventListener('click', ()=>{ const blob = new Blob([JSON.stringify(state,null,2)],{type:'application/json'}); const url = URL.createObjectURL(blob); const a=document.createElement('a'); a.href=url; a.download='bicep_evo_save.json'; a.click(); URL.revokeObjectURL(url); });
importBtn.addEventListener('click', ()=> importFile.click()); importFile.addEventListener('change', (e)=>{ const f=e.target.files[0]; if(!f) return; const r=new FileReader(); r.onload=()=>{ state = JSON.parse(r.result); renderUpgrades(); applyBoughtEffects(); updateHud(); save(); alert('Save imported'); }; r.readAsText(f); });
resetBtn.addEventListener('click', ()=>{ if(confirm('Alles zurücksetzen?')){ state = { strength:0, perClick:1, autoPerSecond:0, bought:{}, stage:0 }; renderUpgrades(); setScene('bg_0_homeless.png'); setDumb('dumb_0_none.png'); decorEl.innerHTML=''; save(); updateHud(); } });

// init load
load(); loadUpgrades().then(()=>{ if(!state.bought) state.bought={}; applyBoughtEffects(); updateHud(); renderUpgrades(); setScene('bg_0_homeless.png'); setDumb('dumb_0_none.png'); });
