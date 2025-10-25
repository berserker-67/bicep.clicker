const DEFAULT = { strength:0, perClick:1, perSec:0, upgrades:{} };
const UPGRADE_DEFS = [
  {id:'calisthenics',name:'Calisthenics',desc:'Erhöht Klickkraft.',baseCost:10,costMult:1.6,type:'click',value:1,image:'assets/calisthenics.png'},
  {id:'gym',name:'Gym',desc:'Mehr Kraft pro Sekunde.',baseCost:100,costMult:1.7,type:'sec',value:5,image:'assets/gym.png'},
  {id:'protein',name:'Protein Pulver',desc:'Kleiner Klickbonus.',baseCost:25,costMult:1.55,type:'click',value:3,image:'assets/protein.png'},
  {id:'kreatin',name:'Kreatin',desc:'Mehr Kraft/sec.',baseCost:250,costMult:1.8,type:'sec',value:30,image:'assets/kreatin.png'},
  {id:'peptides',name:'Peptides',desc:'Klickbonus.',baseCost:900,costMult:1.9,type:'click',value:25,image:'assets/peptides.png'},
  {id:'anabolika',name:'Booster',desc:'Fiktiver starker Bonus.',baseCost:5000,costMult:2.25,type:'both',value:200,image:'assets/anabolika.png'}
];
const State={data:{...DEFAULT},save(){localStorage.setItem('dbclick',JSON.stringify(this.data))},load(){const v=JSON.parse(localStorage.getItem('dbclick'));if(v)this.data={...DEFAULT,...v};}};
State.load();
const sEl=document.getElementById('strength'),pcEl=document.getElementById('perClick'),psEl=document.getElementById('perSec'),list=document.getElementById('upgradesList');
function fmt(n){return Math.floor(n).toLocaleString('de-DE')}
function totals(){let pc=1,ps=0;for(const u of UPGRADE_DEFS){const c=State.data.upgrades[u.id]||0;if(c){if(u.type==='click')pc+=u.value*c;else if(u.type==='sec')ps+=u.value*c;else{pc+=u.value*c;ps+=u.value*0.15*c;}}}return{pc,ps};}
function ui(){const t=totals();sEl.textContent=fmt(State.data.strength);pcEl.textContent=fmt(t.pc);psEl.textContent=fmt(t.ps);list.innerHTML='';for(const u of UPGRADE_DEFS){const c=State.data.upgrades[u.id]||0;const cost=Math.floor(u.baseCost*Math.pow(u.costMult,c));const d=document.createElement('div');d.className='upgrade';d.innerHTML=`<img src="${u.image}"/><div><b>${u.name}</b><p>${u.desc}</p><button class='btn' data-id='${u.id}' ${State.data.strength<cost?'disabled':''}>${fmt(cost)} Kraft</button></div>`;list.appendChild(d);}}
document.getElementById('dumbbellBtn').onclick=()=>{const t=totals();State.data.strength+=t.pc;ui();State.save();};
list.onclick=e=>{const b=e.target.closest('button');if(!b)return;const u=UPGRADE_DEFS.find(x=>x.id===b.dataset.id);const c=State.data.upgrades[u.id]||0;const cost=Math.floor(u.baseCost*Math.pow(u.costMult,c));if(State.data.strength<cost)return;State.data.strength-=cost;State.data.upgrades[u.id]=c+1;ui();State.save();};
setInterval(()=>{const t=totals();State.data.strength+=t.ps;ui();State.save();},1000);
ui();