/* Bizep Clicker — Upgrade Edition
   - loads upgrades from ./assets/upgrades.json
   - purchases are stored in localStorage as 'bicep_save'
   - supports export/import of save as JSON file
*/

const arm = document.getElementById('arm');
const dumb = document.getElementById('dumbbell');
const bicepWrap = document.getElementById('bicep-wrap');
const strengthEl = document.getElementById('strength');
const perClickEl = document.getElementById('perClick');
const autoEl = document.getElementById('auto');
const upgradesList = document.getElementById('upgradesList');
const resetBtn = document.getElementById('reset');
const exportBtn = document.getElementById('export');
const importBtn = document.getElementById('importBtn');
const importFile = document.getElementById('importFile');

let state = {
  strength: 0,
  perClick: 1,
  autoPerSecond: 0,
  bought: {} // upgradeId -> level or true
};

let upgrades = []; // loaded from JSON

function saveToLocal(){
  localStorage.setItem('bicep_save', JSON.stringify(state));
}

function loadFromLocal(){
  const s = localStorage.getItem('bicep_save');
  if(s){
    try{
      state = JSON.parse(s);
    }catch(e){
      console.error('save load failed', e);
    }
  }
}

async function loadUpgrades(){
  try{
    const res = await fetch('./assets/upgrades.json');
    upgrades = await res.json();
    renderUpgrades();
  }catch(e){
    console.error('cannot load upgrades.json', e);
  }
}

function renderUpgrades(){
  upgradesList.innerHTML = '';
  upgrades.forEach(u => {
    const div = document.createElement('div');
    div.className = 'upgrade';
    const meta = document.createElement('div');
    meta.className = 'meta';
    const title = document.createElement('h3');
    title.textContent = u.name + ' — ' + u.cost + '€';
    const desc = document.createElement('p');
    desc.textContent = u.desc;
    meta.appendChild(title);
    meta.appendChild(desc);

    const btn = document.createElement('button');
    btn.textContent = state.bought[u.id] ? 'Gekauft' : 'Kaufen';
    btn.disabled = !!state.bought[u.id];
    btn.onclick = ()=> buyUpgrade(u, btn);

    div.appendChild(meta);
    div.appendChild(btn);
    upgradesList.appendChild(div);
  });
}

function buyUpgrade(u, btn){
  if(state.bought[u.id]) return;
  if(state.strength >= u.cost){
    state.strength -= u.cost;
    applyUpgrade(u);
    state.bought[u.id] = true;
    btn.textContent = 'Gekauft';
    btn.disabled = true;
    updateHud();
    saveToLocal();
  }else{
    alert('Nicht genug Stärke — trainiere mehr!');
  }
}

function applyUpgrade(u){
  // supports types: perClickAdd, perClickMult, autoAdd
  if(u.perClickAdd) state.perClick += u.perClickAdd;
  if(u.perClickMult) state.perClick *= u.perClickMult;
  if(u.autoAdd) state.autoPerSecond += u.autoAdd;
}

function updateHud(){
  strengthEl.textContent = Math.floor(state.strength);
  perClickEl.textContent = Number(state.perClick).toFixed(2);
  autoEl.textContent = Number(state.autoPerSecond).toFixed(2);
  // arm scale based on strength
  const scale = 1 + Math.min(1.2, state.strength / 2000);
  arm.style.setProperty('--s', scale.toFixed(3));
  arm.style.transform = `scale(${scale})`;
}

function doCurlAnimation(){
  dumb.classList.remove('curl-anim');
  arm.classList.remove('bicep-grow');
  void dumb.offsetWidth;
  void arm.offsetWidth;
  dumb.classList.add('curl-anim');
  arm.classList.add('bicep-grow');
  setTimeout(()=>{
    dumb.classList.remove('curl-anim');
    arm.classList.remove('bicep-grow');
  },650);
}

bicepWrap.addEventListener('click', ()=>{
  state.strength += state.perClick;
  // small scale bump
  doCurlAnimation();
  updateHud();
  saveToLocal();
});

resetBtn.addEventListener('click', ()=>{
  if(confirm('Alles zurücksetzen?')){
    state = {strength:0, perClick:1, autoPerSecond:0, bought:{}};
    renderUpgrades();
    updateHud();
    saveToLocal();
  }
});

// auto gain loop
setInterval(()=>{
  if(state.autoPerSecond > 0){
    state.strength += state.autoPerSecond/5;
    updateHud();
    saveToLocal();
  }
}, 200);

// export / import
exportBtn.addEventListener('click', ()=>{
  const blob = new Blob([JSON.stringify(state, null, 2)], {type:'application/json'});
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'bicep_save.json';
  a.click();
  URL.revokeObjectURL(url);
});

importBtn.addEventListener('click', ()=> importFile.click());
importFile.addEventListener('change', (e)=>{
  const f = e.target.files[0];
  if(!f) return;
  const reader = new FileReader();
  reader.onload = ()=>{
    try{
      const data = JSON.parse(reader.result);
      state = data;
      renderUpgrades();
      updateHud();
      saveToLocal();
      alert('Save importiert.');
    }catch(err){
      alert('Fehler beim Einlesen der Datei.');
    }
  };
  reader.readAsText(f);
});

// init
loadFromLocal();
loadUpgrades().then(()=>{
  // apply already-bought upgrades (in case page loaded after purchases)
  upgrades.forEach(u=>{ if(state.bought[u.id]) applyUpgrade(u); });
  updateHud();
});
