/* Final script: manipulates embedded SVG via object -> contentDocument.
   Loads upgrades from assets/upgrades.json, saves to localStorage, export/import.
*/
const armObj = document.getElementById('armobj');
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
let handElem = null;

let state = {
  strength: 0,
  perClick: 1,
  autoPerSecond: 0,
  bought: {}
};

let upgrades = [];

function saveToLocal(){ localStorage.setItem('bicep_final_save', JSON.stringify(state)); }
function loadFromLocal(){ const s = localStorage.getItem('bicep_final_save'); if(s) state = JSON.parse(s); }

async function loadUpgrades(){ try{ const res = await fetch('./assets/upgrades.json'); upgrades = await res.json(); renderUpgrades(); }catch(e){ console.error('upgrades load failed', e); } }

function renderUpgrades(){
  upgradesList.innerHTML = '';
  upgrades.forEach(u=>{
    const div = document.createElement('div'); div.className='upgrade';
    const meta = document.createElement('div'); meta.className='meta';
    const title = document.createElement('h3'); title.textContent = u.name + ' — ' + u.cost + '€';
    const desc = document.createElement('p'); desc.textContent = u.desc;
    meta.appendChild(title); meta.appendChild(desc);
    const btn = document.createElement('button'); btn.textContent = state.bought[u.id] ? 'Gekauft' : 'Kaufen'; btn.disabled = !!state.bought[u.id];
    btn.onclick = ()=> buyUpgrade(u, btn);
    div.appendChild(meta); div.appendChild(btn); upgradesList.appendChild(div);
  });
}

function buyUpgrade(u, btn){
  if(state.bought[u.id]) return;
  if(state.strength >= u.cost){
    state.strength -= u.cost;
    applyUpgrade(u);
    state.bought[u.id] = true;
    btn.textContent = 'Gekauft'; btn.disabled = true;
    updateHud(); saveToLocal();
  }else{ alert('Nicht genug Stärke!'); }
}

function applyUpgrade(u){
  if(u.perClickAdd) state.perClick += u.perClickAdd;
  if(u.perClickMult) state.perClick *= u.perClickMult;
  if(u.autoAdd) state.autoPerSecond += u.autoAdd;
  // keep numbers reasonable
  state.perClick = Math.round(state.perClick*100)/100;
  state.autoPerSecond = Math.round(state.autoPerSecond*100)/100;
}

function updateHud(){
  document.getElementById('strength').textContent = Math.floor(state.strength);
  document.querySelector('#perClick')?.textContent = (state.perClick||1).toFixed(2);
  document.querySelector('#auto')?.textContent = (state.autoPerSecond||0).toFixed(2);
  // visually scale arm slightly by strength but ensure HUD isn't covered
  const scale = 1 + Math.min(1.2, state.strength / 2500);
  const armWrap = document.querySelector('.armwrap');
  armWrap.style.transform = `scale(${scale})`;
}

function triggerCurl(){
  if(!svgDoc) return;
  if(!forearmElem) return;
  // animate forearm rotation around origin point (300,200) used in SVG transform
  const keyframes = [
    { transform: 'rotate(0deg)', offset: 0 },
    { transform: 'rotate(-38deg)', offset: 0.35 },
    { transform: 'rotate(-20deg)', offset: 0.65 },
    { transform: 'rotate(0deg)', offset: 1 }
  ];
  const anim = forearmElem.animate(keyframes, { duration: 650, easing: 'cubic-bezier(.2,.9,.2,1)' });
  anim.onfinish = ()=>{
    // no-op; could sync plate movement if needed
  };
  // also tiny scale pulse to arm
  armwrap.animate([{ transform: armwrap.style.transform }, { transform: armwrap.style.transform + ' scale(1.03)' }, { transform: armwrap.style.transform }], { duration: 650, easing: 'ease-out' });
}

armwrap.addEventListener('click', ()=>{
  state.strength += state.perClick;
  updateHud();
  saveToLocal();
  triggerCurl();
});

resetBtn.addEventListener('click', ()=>{
  if(confirm('Alles zurücksetzen?')){
    state = {strength:0, perClick:1, autoPerSecond:0, bought:{}};
    renderUpgrades();
    updateHud();
    saveToLocal();
  }
});

// auto gain
setInterval(()=>{
  if(state.autoPerSecond > 0){ state.strength += state.autoPerSecond/5; updateHud(); saveToLocal(); }
}, 200);

// export/import
exportBtn.addEventListener('click', ()=>{
  const blob = new Blob([JSON.stringify(state, null, 2)], {type:'application/json'});
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a'); a.href = url; a.download='bicep_final_save.json'; a.click(); URL.revokeObjectURL(url);
});
importBtn.addEventListener('click', ()=> importFile.click());
importFile.addEventListener('change', (e)=>{
  const f = e.target.files[0]; if(!f) return;
  const reader = new FileReader();
  reader.onload = ()=>{
    try{ state = JSON.parse(reader.result); renderUpgrades(); updateHud(); saveToLocal(); alert('Save importiert.'); }catch(err){ alert('Fehler beim Einlesen.'); }
  };
  reader.readAsText(f);
});

// when embedded SVG is ready, get forearm element reference to animate
armObj.addEventListener('load', ()=>{
  try{
    svgDoc = armObj.contentDocument;
    forearmElem = svgDoc.getElementById('forearm');
    handElem = svgDoc.getElementById('hand');
    // ensure transform origin is correct by setting style
    if(forearmElem) forearmElem.style.transformOrigin = '300px 200px';
  }catch(e){ console.error('Cannot access svg object', e); }
});

// init
loadFromLocal();
loadUpgrades().then(()=>{
  // apply previously bought upgrades to state effects
  upgrades.forEach(u=>{ if(state.bought[u.id]) applyUpgrade(u); });
  updateHud();
});
