/* Einfaches Klick-Game: Bizep wächst und macht eine Curl-Animation.
   Läuft als statische Website (z.B. GitHub Pages). */
const bicepWrap = document.getElementById('bicep-wrap');
const bicepImg = document.getElementById('bicep');
const dumb = document.getElementById('dumbbell');
const strengthEl = document.getElementById('strength');
const perClickEl = document.getElementById('perClick');
const resetBtn = document.getElementById('reset');

let strength = 0;
let perClick = 1;
let scale = 1;
const SCALE_STEP = 0.015; // wieviel größer pro Klick
const MAX_SCALE = 2.2;

function updateHud(){
  strengthEl.textContent = Math.floor(strength);
  perClickEl.textContent = perClick;
  bicepImg.style.setProperty('--s', scale.toFixed(3));
}

function doCurlAnimation(){
  // kurz Hantel hochziehen + kleiner Puls
  dumb.classList.remove('curl-anim');
  bicepImg.classList.remove('bicep-grow');
  // trigger reflow
  void dumb.offsetWidth;
  void bicepImg.offsetWidth;
  dumb.classList.add('curl-anim');
  bicepImg.classList.add('bicep-grow');
  // nach Ende Animation zurücksetzen (cleanup)
  setTimeout(()=>{
    dumb.classList.remove('curl-anim');
    bicepImg.classList.remove('bicep-grow');
  },650);
}

bicepWrap.addEventListener('click', (e)=>{
  strength += perClick;
  // Scale langsam erhöhen, aber nie über MAX_SCALE
  scale = Math.min(MAX_SCALE, scale + SCALE_STEP);
  doCurlAnimation();
  updateHud();
});

resetBtn.addEventListener('click', ()=>{
  strength = 0;
  scale = 1;
  updateHud();
});

// kleine automatische "idle"-Pulsanimation, damit es lebendiger wirkt
setInterval(()=>{
  // leichte entspannung wenn größer als 1
  if(scale > 1.02){
    scale = Math.max(1, scale - 0.008);
    updateHud();
  }
}, 1200);

// initial
updateHud();
