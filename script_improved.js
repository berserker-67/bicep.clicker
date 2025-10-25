const armObj = document.getElementById('armobj');
const armPng = document.getElementById('armpng');
const dumbPng = document.querySelector('.dumbpng');
const armwrap = document.getElementById('armwrap');
const strengthEl = document.getElementById('strength');
const perClickEl = document.getElementById('perClick');
const autoEl = document.getElementById('auto');
const upgradesList = document.getElementById('upgradesList');
const resetBtn = document.getElementById('reset');
const exportBtn = document.getElementById('export');
const importBtn = document.getElementById('importBtn');
const importFile = document.getElementById('importFile');

let svgDoc = null;
let forearmElem = null;
let usingSvg = true;

let state = { strength:0, perClick:1, autoPerSecond:0, bought:{} };
let upgrades = [];

function saveToLocal(){ localStorage.setItem('bicep_improved_save', JSON.stringify(state)); }
function loadFromLocal(){ const s = localStorage.getItem('bicep_improved_save'); if(s) state = JSON.parse(s); }

async function loadUpgrades(){ try{ const res = await fetch('./assets/upgrades.json'); upgrades = await res.json(); renderUpgrades(); }catch(e){ console.error('failed loading upgrades', e); } }

function renderUpgrades(){ upgradesList.innerHTML = ''; upgrades.forEach(u=>{ const row = document.createElement('div'); row.className='upgrade'; const meta = document.createElement('div'); meta.className='meta'; const title = document.createElement('h3'); title.textContent = u.name + ' — ' + u.cost + '€'; const desc = document.createElement('p'); desc.textContent = u.desc; meta.appendChild(title); meta.appendChild(desc); const btn = document.createElement('button'); btn.textContent = state.bought[u.id] ? 'Gekauft' : 'Kaufen'; btn.disabled = !!state.bought[u.id]; btn.onclick = ()=> buyUpgrade(u, btn); row.appendChild(meta); row.appendChild(btn); upgradesList.appendChild(row); }); }

function buyUpgrade(u, btn){ if(state.bought[u.id]) return; if(state.strength >= u.cost){ state.strength -= u.cost; applyUpgrade(u); state.bought[u.id] = true; btn.disabled = true; btn.textContent='Gekauft'; updateHud(); saveToLocal(); btn.animate([{transform:'scale(1)'},{transform:'scale(1.06)'},{transform:'scale(1)'}], {duration:400, easing:'ease-out'}); }else{ btn.animate([{transform:'translateX(0)'},{transform:'translateX(-6px)'},{transform:'translateX(6px)'},{transform:'translateX(0)'}], {duration:420}); } }

function applyUpgrade(u){ if(u.perClickAdd) state.perClick += u.perClickAdd; if(u.perClickMult) state.perClick *= u.perClickMult; if(u.autoAdd) state.autoPerSecond += u.autoAdd; state.perClick = Math.round(state.perClick*100)/100; state.autoPerSecond = Math.round(state.autoPerSecond*100)/100; }

function updateHud(){ document.getElementById('strength').textContent = Math.floor(state.strength); let pc = document.getElementById('perClick'); if(!pc){ pc = document.createElement('div'); pc.id='perClick'; document.querySelector('.hud-top').appendChild(pc); } pc.textContent = (state.perClick||1).toFixed(2); document.getElementById('auto').textContent = (state.autoPerSecond||0).toFixed(2); const scale = 1 + Math.min(1.1, state.strength/4000); armwrap.style.transform = `scale(${scale})`; }

function curlAnimation(){ if(dumbPng) dumbPng.animate([{transform:'rotate(0deg)'},{transform:'rotate(-8deg)'},{transform:'rotate(4deg)'},{transform:'rotate(0deg)'}], {duration:700, easing:'cubic-bezier(.2,.9,.2,1)'}); if(usingSvg && forearmElem){ const anim = forearmElem.animate([{transform:'rotate(0deg)'},{transform:'rotate(-42deg)'},{transform:'rotate(-18deg)'},{transform:'rotate(0deg)'}], {duration:650, easing:'cubic-bezier(.2,.9,.2,1)'}); anim.onfinish = ()=>{}; }else{ armwrap.animate([{transform:armwrap.style.transform+' translateY(0)'},{transform:armwrap.style.transform+' translateY(-24px) rotate(-6deg)'},{transform:armwrap.style.transform+' translateY(0) rotate(0deg)'}], {duration:650, easing:'ease-out'}); } }

armwrap.addEventListener('click', ()=>{ state.strength += state.perClick; updateHud(); saveToLocal(); curlAnimation(); });

resetBtn.addEventListener('click', ()=>{ if(confirm('Alles zurücksetzen?')){ state = { strength:0, perClick:1, autoPerSecond:0, bought:{} }; renderUpgrades(); updateHud(); saveToLocal(); } });

setInterval(()=>{ if(state.autoPerSecond>0){ state.strength += state.autoPerSecond/5; updateHud(); saveToLocal(); } }, 200);

exportBtn.addEventListener('click', ()=>{ const blob = new Blob([JSON.stringify(state,null,2)],{type:'application/json'}); const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href=url; a.download='bicep_improved_save.json'; a.click(); URL.revokeObjectURL(url); });
importBtn.addEventListener('click', ()=> importFile.click());
importFile.addEventListener('change', (e)=>{ const f = e.target.files[0]; if(!f) return; const r = new FileReader(); r.onload = ()=>{ try{ state = JSON.parse(r.result); renderUpgrades(); updateHud(); saveToLocal(); alert('Save importiert'); }catch(e){ alert('Fehler beim Einlesen'); } }; r.readAsText(f); });

armObj.addEventListener('load', ()=>{ try{ svgDoc = armObj.contentDocument; forearmElem = svgDoc.getElementById('forearm'); if(forearmElem) forearmElem.style.transformOrigin = '300px 200px'; usingSvg = true; armPng.style.display = 'none'; }catch(e){ console.warn('SVG access failed, using PNG fallback', e); usingSvg = false; armObj.style.display = 'none'; armPng.style.display = 'block'; } });

setTimeout(()=>{ if(!svgDoc){ armObj.style.display='none'; armPng.style.display='block'; usingSvg=false; } }, 800);

loadFromLocal(); loadUpgrades().then(()=>{ upgrades.forEach(u=>{ if(state.bought[u.id]) applyUpgrade(u); }); renderUpgrades(); updateHud(); });
