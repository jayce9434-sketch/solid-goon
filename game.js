(() => {
'use strict';

const TITLE = 'STARJUNK';
const TAGLINE = 'Build it from scrap. Survive what finds you.';
const SAVE_KEY = 'starjunkSaveV4';
const $ = id => document.getElementById(id);
const rand = (a,b) => Math.random()*(b-a)+a;
const clamp = (v,a,b) => Math.max(a,Math.min(b,v));
const choose = arr => arr[Math.floor(Math.random()*arr.length)];
const shuffle = arr => [...arr].sort(()=>Math.random()-.5);
const dist = (a,b) => Math.hypot(a.x-b.x,a.y-b.y);
const todayKey = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
};

$('gameTitle').textContent = TITLE;
$('tagline').textContent = TAGLINE;
document.title = TITLE;

const screens = [...document.querySelectorAll('.screen')];
function showScreen(id){ screens.forEach(s=>s.classList.toggle('active',s.id===id)); }
function showOverlay(id,show=true){ $(id).classList.toggle('hidden',!show); }

const events = {
  halloween:{
    key:'halloween', name:'Night of the Lanterns', currency:'Cinder Candy', icon:'HALLOWEEN',
    start:new Date('2026-10-01T00:00:00'), end:new Date('2026-11-02T00:00:00'), endLabel:'Nov 1',
    color:'#ff9a5e', enemy:'hallowisp', boss:'LANTERN KING',
    rewards:[
      {at:25,type:'credits',amount:125,label:'125 credits'},
      {at:70,type:'crate',amount:1,label:'1 Salvage Crate'},
      {at:150,type:'skin',id:'lantern',label:'Lantern Wreck skin'},
      {at:300,type:'credits',amount:350,label:'350 credits'},
      {at:500,type:'skin',id:'graveglow',label:'Graveglow skin'},
      {at:800,type:'crate',amount:4,label:'4 Salvage Crates'},
      {at:1150,type:'skin',id:'witchfire',label:'Witchfire skin'},
      {at:1500,type:'crate',amount:8,label:'8 Salvage Crates'},
      {at:1900,type:'credits',amount:1600,label:'1,600 credits'}
    ]
  },
  fall:{
    key:'fall', name:'Rustfall Harvest', currency:'Amber Leaves', icon:'FALL',
    start:new Date('2026-09-01T00:00:00'), end:new Date('2026-12-02T00:00:00'), endLabel:'Dec 1',
    color:'#dca25c', enemy:'harvester', boss:'HARVEST ENGINE',
    rewards:[
      {at:35,type:'credits',amount:100,label:'100 credits'},
      {at:100,type:'crate',amount:1,label:'1 Salvage Crate'},
      {at:220,type:'skin',id:'copperleaf',label:'Copperleaf skin'},
      {at:400,type:'credits',amount:425,label:'425 credits'},
      {at:650,type:'skin',id:'harvest',label:'Harvest Core skin'},
      {at:1000,type:'crate',amount:5,label:'5 Salvage Crates'},
      {at:1350,type:'skin',id:'maple',label:'Maple Reactor skin'},
      {at:1750,type:'crate',amount:8,label:'8 Salvage Crates'},
      {at:2200,type:'credits',amount:1800,label:'1,800 credits'}
    ]
  }
};
function eventActive(e,now=new Date()){return now>=e.start&&now<e.end;}

const skins = {
  factory:{name:'Factory Mint',rarity:'common',c1:'#7df1b7',c2:'#173b31',desc:'The original salvage rig. Clean, bright, suspiciously intact.',source:'Starter'},
  carbon:{name:'Carbon Ghost',rarity:'uncommon',c1:'#d5dde8',c2:'#1f2833',desc:'Low-light plating and cold white reactor trim.',price:320},
  cobalt:{name:'Cobalt Runner',rarity:'rare',c1:'#76a7ff',c2:'#17284f',desc:'Fast-looking even when parked.',price:650},
  hazard:{name:'Hazard Stripe',rarity:'rare',c1:'#ffd45f',c2:'#3c3112',desc:'For pilots who consider warning labels a fashion statement.',price:700},
  void:{name:'Voidglass',rarity:'epic',c1:'#b38cff',c2:'#24183d',desc:'Recovered from something that was definitely not on the manifest.',crate:true},
  solar:{name:'Solar Flare',rarity:'legendary',c1:'#fff08a',c2:'#a23d16',desc:'A reactor shell that looks one bad decision from becoming a sunrise.',crate:true},
  lantern:{name:'Lantern Wreck',rarity:'event',c1:'#ff9d58',c2:'#32130b',desc:'Cinder-lit plating from Night of the Lanterns.',event:'halloween'},
  graveglow:{name:'Graveglow',rarity:'event',c1:'#86ff9f',c2:'#182417',desc:'A haunted salvage shell that refuses to stay dark.',event:'halloween'},
  copperleaf:{name:'Copperleaf',rarity:'event',c1:'#e3a35a',c2:'#4e2413',desc:'Autumn armor hammered from warm copper plates.',event:'fall'},
  harvest:{name:'Harvest Core',rarity:'event',c1:'#ffd27b',c2:'#5b2d12',desc:'Built from parts of the Harvest Engine.',event:'fall'},
  crown:{name:'Warden Crown',rarity:'legendary',c1:'#ff7d8b',c2:'#41151b',desc:'Clear wave 20 and the wreckyard starts respecting you.',milestone:'wave20'},
  glitch:{name:'Signal Error',rarity:'epic',c1:'#5effef',c2:'#35145b',desc:'A skin the hangar computer insists does not exist.',milestone:'kills1000'},
  gearjaw:{name:'Gearjaw Trophy',rarity:'legendary',c1:'#ffb35f',c2:'#3a2517',desc:'Machined from a Colossus jaw-core. Still warm.',crate:true},
  mirror:{name:'Mirrorbreak',rarity:'legendary',c1:'#edf0ff',c2:'#31264e',desc:'Reflective boss plating with an unstable violet seam.',crate:true},
  witchfire:{name:'Witchfire',rarity:'event',c1:'#c987ff',c2:'#24113a',desc:'A violet Halloween reactor wrapped in cinder-orange trim.',event:'halloween'},
  maple:{name:'Maple Reactor',rarity:'event',c1:'#f0b868',c2:'#482217',desc:'Late-season alloy with a glowing amber core.',event:'fall'}
};

const metaDefs = [
  {id:'hull',name:'Permanent Hull',desc:'+5 starting max HP per rank.',max:8,base:110},
  {id:'power',name:'Weapon Calibration',desc:'+3% starting damage per rank.',max:8,base:140},
  {id:'reactor',name:'Reactor Tuning',desc:'+2.5% starting fire speed per rank.',max:8,base:150},
  {id:'magnet',name:'Salvage Field',desc:'+12 starting pickup range per rank.',max:8,base:95},
  {id:'insurance',name:'Wreck Insurance',desc:'+4% end-of-run credits per rank.',max:6,base:180},
  {id:'boss',name:'Boss Intel',desc:'+3% damage to bosses per rank.',max:6,base:210}
];

const defaultProfile = () => ({
  version:4, level:1, xp:0, credits:0, crates:1,
  skins:['factory'], equipped:'factory', meta:{hull:0,power:0,reactor:0,magnet:0,insurance:0,boss:0},
  events:{halloween:{currency:0,total:0,claimed:[]},fall:{currency:0,total:0,claimed:[]}},
  stats:{bestWave:0,bestScore:0,kills:0,bosses:0,runs:0,creditsEarned:0,cratesOpened:0,eventBosses:0},
  daily:{date:'',progress:0,claimed:false},
  settings:{music:100,sfx:100,shake:70,damage:true,contrast:false,reduced:false}, milestones:[]
});

function loadProfile(){
  const base=defaultProfile();
  try{
    const raw=JSON.parse(localStorage.getItem(SAVE_KEY)||'null');
    if(raw){
      Object.assign(base,raw);
      base.meta=Object.assign(defaultProfile().meta,raw.meta||{});
      base.stats=Object.assign(defaultProfile().stats,raw.stats||{});
      base.settings=Object.assign(defaultProfile().settings,raw.settings||{});
      base.events={
        halloween:Object.assign(defaultProfile().events.halloween,raw.events?.halloween||{}),
        fall:Object.assign(defaultProfile().events.fall,raw.events?.fall||{})
      };
      base.daily=Object.assign(defaultProfile().daily,raw.daily||{});
      base.skins=Array.from(new Set(['factory',...(raw.skins||[])]));
      base.milestones=Array.isArray(raw.milestones)?raw.milestones:[];
      if(!skins[base.equipped])base.equipped='factory';
      return base;
    }
    const old=JSON.parse(localStorage.getItem('starjunkSave')||'null');
    if(old?.settings){
      base.stats.bestWave=old.settings.bestWave||0;
      base.stats.bestScore=old.settings.bestScore||0;
      base.settings.music=old.settings.music??100;
      base.settings.sfx=old.settings.sfx??100;
      base.settings.shake=old.settings.shake??70;
      base.settings.damage=old.settings.damage??true;
      base.settings.contrast=old.settings.contrast??false;
    }
  }catch(e){ console.warn('Save recovery failed',e); }
  return base;
}
let profile=loadProfile();
let settings=profile.settings;

function ensureDaily(){
  const key=todayKey();
  if(profile.daily.date!==key)profile.daily={date:key,progress:0,claimed:false};
}
function saveProfile(){profile.settings=settings;localStorage.setItem(SAVE_KEY,JSON.stringify(profile));refreshMenu();}
function xpNeed(){return 100+(profile.level-1)*55;}
function addXp(amount){
  profile.xp+=Math.max(0,Math.floor(amount));
  let leveled=0;
  while(profile.xp>=xpNeed()){
    profile.xp-=xpNeed();profile.level++;leveled++;profile.credits+=40+profile.level*8;
  }
  if(leveled)toast(`LEVEL ${profile.level}  +${40+profile.level*8} CREDITS`);
}
function unlockSkin(id,silent=false){
  if(!skins[id]||profile.skins.includes(id))return false;
  profile.skins.push(id);if(!silent)toast(`${skins[id].name.toUpperCase()} UNLOCKED`);return true;
}
function award(type,amount,id){
  if(type==='credits'){profile.credits+=amount;profile.stats.creditsEarned+=amount;}
  if(type==='crate')profile.crates+=amount;
  if(type==='xp')addXp(amount);
  if(type==='skin')unlockSkin(id);
}

function refreshMenu(){
  ensureDaily();
  $('levelText').textContent=profile.level;
  $('creditsText').textContent=profile.credits.toLocaleString();
  $('cratesText').textContent=profile.crates;
  $('xpText').textContent=`${profile.xp} / ${xpNeed()} XP`;
  $('xpFill').style.width=`${clamp(profile.xp/xpNeed()*100,0,100)}%`;
  $('bestLine').textContent=`Best wave ${profile.stats.bestWave} · Best score ${profile.stats.bestScore.toLocaleString()} · ${profile.stats.bosses} bosses destroyed`;
  const chips=$('eventChips');chips.innerHTML='';
  Object.values(events).forEach(e=>{
    const active=eventActive(e);const chip=document.createElement('span');
    chip.className=`event-chip ${e.key}`+(active?' active':'');
    chip.textContent=active?`${e.icon} LIVE · ${profile.events[e.key].currency} ${e.currency}`:`${e.icon} ENDED`;
    chips.appendChild(chip);
  });
  renderDaily();
}

function renderDaily(){
  ensureDaily();const d=profile.daily;const card=$('dailyCard');
  const ready=d.progress>=3&&!d.claimed;
  card.innerHTML=`<div><span class="kicker">DAILY SALVAGE</span><b>Clear 3 waves</b><small>${Math.min(3,d.progress)} / 3 · Reward: 160 credits + 1 crate</small></div><button id="dailyClaim" ${ready?'':'disabled'}>${d.claimed?'CLAIMED':ready?'CLAIM':'IN PROGRESS'}</button>`;
  const btn=$('dailyClaim');if(btn)btn.onclick=()=>{if(profile.daily.progress>=3&&!profile.daily.claimed){profile.daily.claimed=true;award('credits',160);award('crate',1);saveProfile();audio.reward();}};
}

function wireNavigation(){
  document.querySelectorAll('.backBtn').forEach(b=>b.addEventListener('click',()=>{showScreen('menu');refreshMenu();}));
  $('openPrivate').onclick=()=>showScreen('privateScreen');
  $('openSettings').onclick=()=>showScreen('settingsScreen');
  $('openHow').onclick=()=>showScreen('howScreen');
  $('openHangar').onclick=()=>{renderHangar();showScreen('hangarScreen');};
  $('openCrates').onclick=()=>{renderCrates();showScreen('cratesScreen');};
  $('openEvents').onclick=()=>{renderEvents();showScreen('eventsScreen');};
  $('openStats').onclick=()=>{renderStats();showScreen('statsScreen');};
}

const audio={
  ctx:null,master:null,musicGain:null,timer:null,step:0,mode:'menu',bossTheme:'scrap',
  seqs:{
    menu:[110,0,165,220,0,196,147,0,110,165,247,0,220,196,165,147],
    run:[110,165,220,165,147,196,247,196,123,185,247,185,147,220,294,220],
    scrap:[73,73,110,146,73,98,130,146,82,82,123,164,82,110,146,164],
    warden:[65,98,130,196,65,98,147,220,73,110,147,220,82,123,164,247],
    rail:[82,123,165,247,82,165,247,330,73,110,146,220,73,146,220,294],
    null:[92,138,207,276,103,155,233,311,82,123,185,247,69,103,155,207],
    halloween:[98,147,196,294,87,131,175,262,110,165,220,330,73,110,147,220],
    fall:[110,165,220,277,123,185,247,311,98,147,196,247,131,196,262,330],
    gear:[73,110,146,220,82,123,164,247,73,146,183,293,82,164,220,329],
    mirror:[123,185,247,370,139,208,277,416,110,165,220,330,147,220,294,440]
  },
  init(){
    if(this.ctx){if(this.ctx.state==='suspended')this.ctx.resume();return;}
    this.ctx=new (window.AudioContext||window.webkitAudioContext)();
    this.master=this.ctx.createGain();this.musicGain=this.ctx.createGain();this.musicGain.connect(this.master);this.master.connect(this.ctx.destination);this.setMusic();this.startMusic();
  },
  setMusic(){if(this.musicGain){const normalized=settings.music/100;this.musicGain.gain.value=Math.min(1.25,Math.pow(normalized,0.72)*.11);}},
  tone(freq,dur=.08,type='square',gain=.06,when=0,sfx=true){
    if(!this.ctx)return;const o=this.ctx.createOscillator(),g=this.ctx.createGain();o.type=type;o.frequency.value=freq;
    const mult=sfx?Math.min(5,Math.pow(settings.sfx/100,.72)):1;g.gain.value=Math.min(1.2,gain*mult);o.connect(g);g.connect(sfx?this.master:this.musicGain);
    const t=this.ctx.currentTime+when;g.gain.setValueAtTime(Math.max(.0001,g.gain.value),t);g.gain.exponentialRampToValueAtTime(.0001,t+dur);o.start(t);o.stop(t+dur+.02);
  },
  setMode(mode,bossTheme='scrap'){this.mode=mode;this.bossTheme=bossTheme;this.step=0;},
  shoot(){this.tone(245,.035,'square',.018)},hit(){this.tone(84,.065,'sawtooth',.04)},scrap(){this.tone(720,.045,'triangle',.025);this.tone(980,.035,'triangle',.018,.03)},dash(){this.tone(145,.13,'sawtooth',.035)},upgrade(){this.tone(440,.08,'triangle',.035);this.tone(660,.11,'triangle',.03,.065)},boss(){this.tone(52,.7,'sawtooth',.055);this.tone(78,.6,'square',.025,.15)},reward(){this.tone(523,.08,'triangle',.035);this.tone(659,.08,'triangle',.032,.07);this.tone(784,.14,'triangle',.03,.14)},crate(){this.tone(164,.18,'sawtooth',.035);this.tone(246,.18,'triangle',.035,.12);this.tone(493,.3,'triangle',.04,.25)},shield(){this.tone(320,.12,'sine',.035);this.tone(620,.2,'triangle',.025,.05)},
  startMusic(){
    if(this.timer)return;
    this.timer=setInterval(()=>{
      if(!this.ctx||this.ctx.state==='suspended')return;
      let key=this.mode==='boss'?this.bossTheme:this.mode;
      const seq=this.seqs[key]||this.seqs.run;const f=seq[this.step%seq.length];const beat=this.step;this.step++;
      if(f){
        const boss=this.mode==='boss';this.tone(f,boss?.17:.22,boss?'sawtooth':'triangle',boss?.14:.11,0,false);
        if(boss&&beat%2===0)this.tone(f/2,.22,'square',.085,0,false);
        if(boss&&beat%4===0)this.tone(Math.max(45,f/4),.08,'sawtooth',.05,.04,false);
        if(boss&&beat%8===6)this.tone(f*2,.06,'square',.035,.08,false);
        if((key==='halloween'||key==='fall')&&beat%4===2)this.tone(f*2,.09,'triangle',.045,.06,false);
      }
    },this.mode==='boss'?150:205);
  }
};

document.addEventListener('pointerdown',()=>audio.init(),{once:true,capture:true});

function setupSettings(){
  const rows=[['musicVolume','music'],['sfxVolume','sfx'],['shakeAmount','shake']];
  for(const [id,key] of rows){
    $(id).value=settings[key];const out=$(id.replace('Volume','Value').replace('Amount','Value'));out.textContent=settings[key]+'%';
    $(id).addEventListener('input',e=>{settings[key]=+e.target.value;out.textContent=settings[key]+'%';saveProfile();if(key==='music')audio.setMusic();});
  }
  $('damageNumbers').checked=settings.damage;$('highContrast').checked=settings.contrast;$('reducedParticles').checked=settings.reduced;
  $('damageNumbers').onchange=e=>{settings.damage=e.target.checked;saveProfile();};
  $('highContrast').onchange=e=>{settings.contrast=e.target.checked;document.body.classList.toggle('high-contrast',settings.contrast);saveProfile();};
  $('reducedParticles').onchange=e=>{settings.reduced=e.target.checked;saveProfile();};
  document.body.classList.toggle('high-contrast',settings.contrast);
  $('resetSave').onclick=()=>{if(confirm('Reset all STARJUNK progression, skins, records and settings?')){localStorage.removeItem(SAVE_KEY);location.reload();}};
}

function renderHangar(){
  $('hangarCredits').textContent=`${profile.credits.toLocaleString()} CREDITS`;
  const equipped=skins[profile.equipped]||skins.factory;
  $('equippedName').textContent=equipped.name;$('equippedDesc').textContent=equipped.desc;
  const grid=$('skinGrid');grid.innerHTML='';
  Object.entries(skins).forEach(([id,s])=>{
    const owned=profile.skins.includes(id);const canBuy=!owned&&s.price&&profile.credits>=s.price;
    const card=document.createElement('div');card.className='skin-card';card.style.setProperty('--swatch1',s.c1);card.style.setProperty('--swatch2',s.c2);
    let source=s.source?s.source:s.event?'Limited event':s.crate?'Crate drop':s.milestone?'Milestone':`${s.price||0} credits`;
    card.innerHTML=`<div class="skin-swatch"></div><span class="rarity ${s.rarity}">${s.rarity}</span><h4>${s.name}</h4><small>${s.desc}</small><small>${owned?'OWNED':source}</small><button ${(!owned&&!canBuy)?'disabled':''}>${profile.equipped===id?'EQUIPPED':owned?'EQUIP':s.price?`BUY ${s.price}`:'LOCKED'}</button>`;
    card.querySelector('button').onclick=()=>{
      if(owned){profile.equipped=id;saveProfile();renderHangar();return;}
      if(s.price&&profile.credits>=s.price){profile.credits-=s.price;unlockSkin(id);profile.equipped=id;audio.reward();saveProfile();renderHangar();}
    };
    grid.appendChild(card);
  });
  const meta=$('metaGrid');meta.innerHTML='';
  metaDefs.forEach(m=>{
    const lvl=profile.meta[m.id]||0;const cost=Math.floor(m.base*Math.pow(1.48,lvl));const b=document.createElement('button');b.className='upgrade';b.disabled=lvl>=m.max||profile.credits<cost;
    b.innerHTML=`<span class="rarity uncommon">PERMANENT</span><strong>${m.name} ${lvl}/${m.max}</strong><small>${m.desc}</small><span class="price">${lvl>=m.max?'MAXED':cost+' credits'}</span>`;
    b.onclick=()=>{if(lvl>=m.max||profile.credits<cost)return;profile.credits-=cost;profile.meta[m.id]=lvl+1;audio.upgrade();saveProfile();renderHangar();};meta.appendChild(b);
  });
  drawPreview();
}

function drawPreview(){
  const c=$('previewCanvas'),x=c.getContext('2d'),s=skins[profile.equipped]||skins.factory;const w=c.width,h=c.height;x.clearRect(0,0,w,h);
  const g=x.createRadialGradient(w/2,h/2,10,w/2,h/2,150);g.addColorStop(0,'#1c2a39');g.addColorStop(1,'#070b10');x.fillStyle=g;x.fillRect(0,0,w,h);
  x.save();x.translate(w/2,h/2);x.rotate(-.25);x.fillStyle=s.c2;for(let i=0;i<4;i++){x.rotate(Math.PI/2);x.fillRect(24,-8,30,16)}x.fillStyle=s.c1;x.beginPath();x.arc(0,0,34,0,Math.PI*2);x.fill();x.fillStyle='#07100d';x.beginPath();x.arc(0,0,12,0,Math.PI*2);x.fill();x.restore();
}

function weightedCrateReward(tier){
  const locked=Object.entries(skins).filter(([id,s])=>s.crate&&!profile.skins.includes(id));
  const roll=Math.random();
  const skinChance=tier===10?.72:tier===5?.38:tier===3?.18:.07;
  if(locked.length&&roll<skinChance){const [id,s]=choose(locked);return {type:'skin',id,label:s.name};}
  if(roll<skinChance+.18){const amount=tier===10?620:tier===5?320:tier===3?180:85;return {type:'xp',amount,label:`${amount} XP`};}
  if(roll<skinChance+.24&&tier>=3){const amount=tier===10?6:tier===5?3:1;return {type:'crate',amount,label:`${amount} bonus crate${amount===1?'':'s'}`};}
  const amount=Math.floor(rand(tier===10?1050:tier===5?600:tier===3?280:90,tier===10?1800:tier===5?1000:tier===3?520:210));
  return {type:'credits',amount,label:`${amount} credits`};
}
function renderCrates(){
  $('crateWallet').textContent=`${profile.crates} CRATES`;const grid=$('crateGrid');grid.innerHTML='';
  [
    {cost:1,name:'Salvage Crate',desc:'Credits, XP and a small chance at an exclusive skin.'},
    {cost:3,name:'Reinforced Cache',desc:'Bigger payouts with a much better skin chance.'},
    {cost:5,name:'Blackbox Vault',desc:'Heavy rewards, bonus crates and excellent skin odds.'},
    {cost:10,name:'Singularity Vault',desc:'Late-game cache with extreme payouts and a huge exclusive-skin chance.'}
  ].forEach(c=>{
    const card=document.createElement('div');card.className='crate-card';card.innerHTML=`<h3>${c.name}</h3><p>${c.desc}</p><strong>${c.cost} crate${c.cost>1?'s':''}</strong><button ${profile.crates<c.cost?'disabled':''}>OPEN</button>`;
    card.querySelector('button').onclick=()=>openCrate(c.cost,c.name);grid.appendChild(card);
  });
}
function openCrate(cost,name){
  if(profile.crates<cost)return;profile.crates-=cost;profile.stats.cratesOpened++;audio.crate();const r=weightedCrateReward(cost);award(r.type,r.amount||1,r.id);
  const out=$('crateResult');out.classList.remove('hidden');out.innerHTML=`<h3>${name.toUpperCase()} OPENED</h3><p>You found <b>${r.label}</b>.</p>`;saveProfile();renderCrates();
}

function renderEvents(){
  const wrap=$('eventList');wrap.innerHTML='';const now=new Date();
  Object.values(events).forEach(e=>{
    const state=profile.events[e.key],active=eventActive(e,now);const max=e.rewards[e.rewards.length-1].at;const card=document.createElement('div');card.className='event-card';
    card.innerHTML=`<div class="event-top"><div><span class="kicker">${active?'LIVE EVENT':'ARCHIVED EVENT'}</span><h3>${e.name}</h3><p>Seasonal enemies and event bosses drop ${e.currency}. Ends ${e.endLabel}.</p></div><b style="color:${e.color}">${state.currency} ${e.currency}</b></div><div class="event-progress"><i style="width:${clamp(state.total/max*100,0,100)}%;background:${e.color}"></i></div><div class="event-rewards"></div>`;
    const rw=card.querySelector('.event-rewards');e.rewards.forEach((r,i)=>{
      const claimed=state.claimed.includes(i),ready=state.total>=r.at&&!claimed;const d=document.createElement('div');d.className='reward-step'+(claimed?' claimed':ready?' ready':'');
      d.innerHTML=`<b>${r.at}</b><br>${r.label}<br><button ${ready?'':'disabled'}>${claimed?'CLAIMED':ready?'CLAIM':'LOCKED'}</button>`;d.querySelector('button').onclick=()=>claimEvent(e.key,i);rw.appendChild(d);
    });wrap.appendChild(card);
  });
}
function claimEvent(key,index){
  const e=events[key],state=profile.events[key],r=e.rewards[index];if(!r||state.claimed.includes(index)||state.total<r.at)return;
  state.claimed.push(index);award(r.type,r.amount||1,r.id);audio.reward();saveProfile();renderEvents();
}

const milestones=[
  {id:'wave10',name:'Double Digits',desc:'Reach wave 10.',done:()=>profile.stats.bestWave>=10,reward:'150 credits',grant:()=>award('credits',150)},
  {id:'wave20',name:'Warden Material',desc:'Reach wave 20.',done:()=>profile.stats.bestWave>=20,reward:'Warden Crown skin',grant:()=>unlockSkin('crown',true)},
  {id:'kills250',name:'Scrapstorm',desc:'Destroy 250 enemies.',done:()=>profile.stats.kills>=250,reward:'2 crates',grant:()=>award('crate',2)},
  {id:'kills1000',name:'Signal Error',desc:'Destroy 1,000 enemies.',done:()=>profile.stats.kills>=1000,reward:'Signal Error skin',grant:()=>unlockSkin('glitch',true)},
  {id:'boss10',name:'Boss Recycler',desc:'Destroy 10 bosses.',done:()=>profile.stats.bosses>=10,reward:'300 credits',grant:()=>award('credits',300)},
  {id:'crate20',name:'Unboxer',desc:'Open 20 crates.',done:()=>profile.stats.cratesOpened>=20,reward:'3 crates',grant:()=>award('crate',3)}
];
function syncMilestoneUnlocks(){let changed=false;for(const m of milestones){if(m.done()&&!profile.milestones.includes(m.id)){profile.milestones.push(m.id);m.grant?.();changed=true;}}return changed;}
function renderStats(){
  if(syncMilestoneUnlocks())localStorage.setItem(SAVE_KEY,JSON.stringify(profile));const s=profile.stats,g=$('statsGrid');g.innerHTML='';
  [['BEST WAVE',s.bestWave],['BEST SCORE',s.bestScore.toLocaleString()],['KILLS',s.kills.toLocaleString()],['BOSSES',s.bosses],['RUNS',s.runs],['CRATES OPENED',s.cratesOpened],['LEVEL',profile.level],['SKINS',`${profile.skins.length}/${Object.keys(skins).length}`]].forEach(([k,v])=>{const d=document.createElement('div');d.className='stat-card';d.innerHTML=`<span>${k}</span><b>${v}</b>`;g.appendChild(d);});
  const list=$('milestoneList');list.innerHTML='';milestones.forEach(m=>{const d=document.createElement('div');d.className='milestone'+(m.done()?' done':'');d.innerHTML=`<h4>${m.name}</h4><p>${m.desc}</p><small>${m.done()?'COMPLETE':'IN PROGRESS'} · ${m.reward}</small>`;list.appendChild(d);});
}

function toast(text){
  const m=$('message');if(!m)return;m.textContent=text;m.style.opacity=1;clearTimeout(toast.t);toast.t=setTimeout(()=>m.style.opacity=0,1500);
}

wireNavigation();setupSettings();refreshMenu();

const canvas=$('game'),ctx=canvas.getContext('2d');let W=0,H=0,DPR=1;
function resize(){DPR=Math.min(2,devicePixelRatio||1);W=innerWidth;H=innerHeight;canvas.width=Math.floor(W*DPR);canvas.height=Math.floor(H*DPR);ctx.setTransform(DPR,0,0,DPR,0,0);}
addEventListener('resize',resize);resize();

let game=null,runSerial=0,keys={},mouse={x:0,y:0,down:false};
addEventListener('keydown',e=>{keys[e.key.toLowerCase()]=true;if(e.key===' '){e.preventDefault();dash();}});
addEventListener('keyup',e=>keys[e.key.toLowerCase()]=false);
canvas.addEventListener('pointermove',e=>{mouse.x=e.clientX;mouse.y=e.clientY;});
canvas.addEventListener('pointerdown',e=>{mouse.down=true;mouse.x=e.clientX;mouse.y=e.clientY;});
addEventListener('pointerup',()=>mouse.down=false);

const joystick={active:false,id:null,dx:0,dy:0,cx:0,cy:0};const stick=$('joystick'),knob=stick.querySelector('.knob');
stick.addEventListener('pointerdown',e=>{joystick.active=true;joystick.id=e.pointerId;stick.setPointerCapture(e.pointerId);const r=stick.getBoundingClientRect();joystick.cx=r.left+r.width/2;joystick.cy=r.top+r.height/2;moveStick(e);});
stick.addEventListener('pointermove',e=>{if(joystick.active&&e.pointerId===joystick.id)moveStick(e);});
stick.addEventListener('pointerup',e=>{if(e.pointerId===joystick.id)resetStick();});stick.addEventListener('pointercancel',resetStick);
function moveStick(e){let dx=e.clientX-joystick.cx,dy=e.clientY-joystick.cy;const m=Math.hypot(dx,dy)||1,lim=38;if(m>lim){dx=dx/m*lim;dy=dy/m*lim;}joystick.dx=dx/lim;joystick.dy=dy/lim;knob.style.transform=`translate(${dx}px,${dy}px)`;}
function resetStick(){joystick.active=false;joystick.dx=joystick.dy=0;knob.style.transform='translate(0,0)';}

let mobileAim={active:false,angle:0};
$('aimPad').addEventListener('pointerdown',e=>{mobileAim.active=true;updateAim(e);$('aimPad').setPointerCapture(e.pointerId);});
$('aimPad').addEventListener('pointermove',e=>{if(mobileAim.active)updateAim(e);});$('aimPad').addEventListener('pointerup',()=>mobileAim.active=false);$('aimPad').addEventListener('pointercancel',()=>mobileAim.active=false);
function updateAim(e){if(game)mobileAim.angle=Math.atan2(e.clientY-game.player.y,e.clientX-game.player.x);}
$('fireBtn').addEventListener('pointerdown',()=>mouse.down=true);$('fireBtn').addEventListener('pointerup',()=>mouse.down=false);$('fireBtn').addEventListener('pointercancel',()=>mouse.down=false);$('dashBtn').onclick=dash;

function newPlayer(){
  const p={x:W/2,y:H/2,r:19,hp:100,maxHp:100,speed:212,fireRate:.23,fireCd:0,bulletSpeed:540,damage:16,spread:0,dashCd:0,dashMax:2.15,dashPower:260,inv:0,armor:0,magnet:92,crit:.06,critMult:2,shotCount:1,pierce:0,regen:0,bulletSize:4,burnChance:0,burnDamage:0,explodeChance:0,explodeDamage:0,chainChance:0,chainDamage:0,lifesteal:0,drones:0,droneDamage:8,droneRate:.8,dashDamage:0,maxShields:0,shields:0,secondWind:false,secondWindUsed:false,bossDamage:1+profile.meta.boss*.03,scrapBonus:0,scoreBonus:0,ricochet:0,execute:0,dashBlast:0,rage:1};
  p.maxHp+=profile.meta.hull*5;p.hp=p.maxHp;p.damage*=1+profile.meta.power*.03;p.fireRate*=Math.pow(.975,profile.meta.reactor);p.magnet+=profile.meta.magnet*12;return p;
}

function makeAlly(i){const names=['Mica','Rook','Patch','Vanta'];return{x:W/2+rand(-70,70),y:H/2+rand(-70,70),r:15,hp:80,maxHp:80,speed:160,fireCd:rand(0,.5),name:names[i%names.length],tone:i};}

function startRun(mode,bots=0,room='',threat=1){
  audio.init();audio.setMode('run');showScreen('gameScreen');showOverlay('gameOverScreen',false);showOverlay('pauseScreen',false);showOverlay('upgradeScreen',false);$('bossBar').classList.add('hidden');
  const serial=++runSerial;game={serial,startThreat:threat,mode,bots,room,player:newPlayer(),enemies:[],bullets:[],enemyBullets:[],scraps:[],particles:[],floaters:[],allies:[],mines:[],wave:Math.max(0,threat-1),score:0,scrap:0,kills:0,bossKills:0,eventBossKills:0,spawnLeft:0,spawnTimer:0,between:false,paused:false,time:0,shake:0,boss:null,selectedUpgrades:0,upgradeCounts:{},modifier:null,rerolls:0,combo:1,comboTimer:0,crateDrops:0,dailyWaves:0,droneCd:0,clearedWaves:new Set()};
  for(let i=0;i<bots;i++)game.allies.push(makeAlly(i));nextWave();chatSystem.reset();last=performance.now();requestAnimationFrame(t=>loop(t,serial));
}
$('playSolo').onclick=()=>startRun('solo',0);
$('playBots').onclick=()=>startRun('crew',2);
$('startPrivate').onclick=()=>{const code=$('roomCode').value.trim();let bots=+$('botCount').value;const threat=+$('startThreat').value||1;if(code.length>=5)bots=0;startRun('private',bots,code,threat);};

const enemyTypes={
  scout:{r:13,hp:27,speed:98,damage:11,color:'#ff8a7a',scrap:[1,3],unlock:1,weight:36},
  rammer:{r:19,hp:70,speed:73,damage:22,color:'#ffc66d',scrap:[2,5],unlock:2,weight:22,charge:true},
  gunner:{r:16,hp:50,speed:55,damage:9,color:'#bf8cff',scrap:[2,4],unlock:3,weight:18,shoot:true},
  splitter:{r:18,hp:62,speed:68,damage:13,color:'#70c9ff',scrap:[2,5],unlock:4,weight:13,split:true},
  sniper:{r:15,hp:45,speed:45,damage:24,color:'#ff75c8',scrap:[3,5],unlock:6,weight:8,sniper:true},
  miner:{r:17,hp:82,speed:58,damage:14,color:'#e4dc77',scrap:[3,6],unlock:7,weight:7,miner:true},
  bulwark:{r:23,hp:150,speed:42,damage:18,color:'#75d4c8',scrap:[4,7],unlock:9,weight:5,shield:70},
  swarm:{r:9,hp:17,speed:135,damage:7,color:'#ffb0a4',scrap:[1,2],unlock:11,weight:10},
  leech:{r:14,hp:64,speed:118,damage:12,color:'#79df91',scrap:[3,5],unlock:8,weight:8,vamp:true},
  orbiter:{r:15,hp:62,speed:74,damage:11,color:'#69dbff',scrap:[3,6],unlock:10,weight:7,orbit:true,shoot:true},
  brute:{r:29,hp:220,speed:38,damage:34,color:'#cf6f62',scrap:[6,11],unlock:12,weight:5},
  phaser:{r:15,hp:58,speed:96,damage:15,color:'#93a0ff',scrap:[4,6],unlock:14,weight:5,phase:true},
  hallowisp:{r:16,hp:48,speed:88,damage:14,color:'#ff9d58',scrap:[2,5],unlock:1,weight:0,event:'halloween',shoot:true},
  harvester:{r:20,hp:88,speed:62,damage:17,color:'#d99b58',scrap:[3,6],unlock:1,weight:0,event:'fall',charge:true}
};

function pickEnemyType(){
  const active=Object.values(events).filter(e=>eventActive(e));
  if(active.length&&Math.random()<.18){const ev=choose(active);return ev.enemy;}
  const pool=Object.entries(enemyTypes).filter(([k,t])=>!t.event&&t.unlock<=game.wave);
  let total=pool.reduce((s,[,t])=>s+t.weight,0),r=Math.random()*total;for(const [k,t] of pool){r-=t.weight;if(r<=0)return k;}return 'scout';
}
function spawnEnemy(type,x=null,y=null,scale=1,forcedElite=false){
  const t=enemyTypes[type];if(!t)return;
  if(x==null){const edge=Math.floor(rand(0,4));if(edge===0){x=rand(0,W);y=-40;}else if(edge===1){x=W+40;y=rand(0,H);}else if(edge===2){x=rand(0,W);y=H+40;}else{x=-40;y=rand(0,H);}}
  let elite=forcedElite||(game.wave>=6&&Math.random()<(game.modifier?.id==='elite'?.22:.04+game.wave*.0025));
  const diff=1+(game.wave-1)*.075;const modSpeed=game.modifier?.id==='overclock'?1.28:1;const eliteHp=elite?2.25:1;const eliteSpeed=elite?1.1:1;
  game.enemies.push({type,x,y,r:t.r*scale*(elite?1.16:1),hp:t.hp*diff*scale*eliteHp,maxHp:t.hp*diff*scale*eliteHp,shieldHp:(t.shield||0)*diff,shieldMax:(t.shield||0)*diff,speed:t.speed*(1+game.wave*.009)*modSpeed*eliteSpeed,damage:t.damage*(1+game.wave*.018),color:t.color,shootCd:rand(.5,1.7),specialCd:rand(1.8,3.6),scale,flash:0,elite,burn:0,burnTick:0,chargeTime:0,chargeAngle:0,phaseTimer:0});
}

const bossDefs=[
  {id:'scrap',name:'SCRAP TITAN',theme:'scrap',color:'#ff7272',hp:1,speed:50},
  {id:'warden',name:'THE WARDEN',theme:'warden',color:'#ff6578',hp:1.16,speed:44},
  {id:'rail',name:'RAILJAW',theme:'rail',color:'#ffb060',hp:.95,speed:64},
  {id:'null',name:'NULL BLOOM',theme:'null',color:'#b879ff',hp:1.08,speed:42},
  {id:'gear',name:'GEARJAW COLOSSUS',theme:'gear',color:'#ffb35f',hp:1.22,speed:52},
  {id:'mirror',name:'MIRROR CORE',theme:'mirror',color:'#e9ecff',hp:1.34,speed:58}
];
function chooseBoss(){
  if(eventActive(events.halloween)&&game.wave%10===0)return {id:'halloween',name:events.halloween.boss,theme:'halloween',color:'#ff9d58',hp:1.12,speed:48,event:'halloween'};
  if(eventActive(events.fall)&&game.wave%15===0)return {id:'fall',name:events.fall.boss,theme:'fall',color:'#e0a15b',hp:1.28,speed:39,event:'fall'};
  return bossDefs[(Math.floor(game.wave/5)-1)%bossDefs.length];
}
function spawnBoss(){
  if(!game||game.boss)return;const d=chooseBoss();const base=720+game.wave*175;game.boss={...d,x:W/2,y:-90,r:d.id==='fall'?58:d.id==='gear'?62:d.id==='mirror'?55:50,hp:base*d.hp,maxHp:base*d.hp,angle:0,shootCd:.9,burstCd:3.6,specialCd:5.2,flash:0,phase:1,charge:0};
  $('bossName').textContent=game.boss.name;$('bossPhase').textContent='PHASE I';$('bossFill').style.width='100%';$('bossBar').classList.remove('hidden');audio.setMode('boss',d.theme);audio.boss();announce(game.boss.name);
}

const modifiers=[
  {id:'overclock',name:'OVERCLOCKED HOSTILES',desc:'Enemies move 28% faster. +25% score.'},
  {id:'bounty',name:'SALVAGE RUSH',desc:'Enemies drop extra scrap.'},
  {id:'swarm',name:'SWARM SIGNAL',desc:'More enemies, lower individual health.'},
  {id:'elite',name:'ELITE TRANSMISSION',desc:'Elite enemy chance massively increased.'},
  {id:'blackout',name:'BLACKOUT',desc:'Visibility reduced. +35% score.'}
];
function rollModifier(){if(game.wave<3||game.wave%3!==0)return null;return choose(modifiers);}
function nextWave(){
  if(!game)return;game.wave++;game.between=false;game.selectedUpgrades=0;game.rerolls=0;game.modifier=rollModifier();
  const bossWave=game.wave%5===0;let count=5+Math.floor(game.wave*1.75);if(game.modifier?.id==='swarm')count=Math.floor(count*1.45);if(bossWave)count=Math.max(3,Math.floor(count*.38));
  game.spawnLeft=count;game.spawnTimer=.25;game.player.shields=game.player.maxShields;announce(`WAVE ${game.wave}`);$('waveText').textContent=game.wave;
  const banner=$('modifierBanner');if(game.modifier){banner.textContent=`${game.modifier.name} · ${game.modifier.desc}`;banner.classList.remove('hidden');setTimeout(()=>banner.classList.add('hidden'),2600);}else banner.classList.add('hidden');
  if(bossWave)setTimeout(()=>{if(game&&!game.paused&&!game.between)spawnBoss();},650);else audio.setMode('run');
}
function announce(t){toast(t);}

function shoot(from,angle,enemy=false,damage=null,speed=null,opts={}){
  const arr=enemy?game.enemyBullets:game.bullets;const p=game.player;
  arr.push({x:from.x+Math.cos(angle)*(from.r+5),y:from.y+Math.sin(angle)*(from.r+5),vx:Math.cos(angle)*(speed||(enemy?280:p.bulletSpeed)),vy:Math.sin(angle)*(speed||(enemy?280:p.bulletSpeed)),r:opts.r||(enemy?5:p.bulletSize),life:opts.life||2.25,damage:damage??p.damage,pierce:enemy?0:p.pierce,enemy,kind:opts.kind||'normal',explode:enemy?0:p.explodeChance,burn:enemy?0:p.burnChance,chain:enemy?0:p.chainChance,bounces:opts.bounces||0});
  if(!enemy)audio.shoot();
}
function nearestEnemy(p,max=9999,exclude=null){let best=null,bd=max;for(const e of game.enemies){if(e===exclude)continue;const d=dist(p,e);if(d<bd){bd=d;best=e;}}if(game.boss&&game.boss!==exclude){const d=dist(p,game.boss);if(d<bd)best=game.boss;}return best;}
function playerShoot(){
  const p=game.player;if(p.fireCd>0)return;let angle;if(mobileAim.active)angle=mobileAim.angle;else if(mouse.down)angle=Math.atan2(mouse.y-p.y,mouse.x-p.x);else{const e=nearestEnemy(p,560);if(!e)return;angle=Math.atan2(e.y-p.y,e.x-p.x);}
  p.fireCd=p.fireRate;const rageMult=p.hp/p.maxHp<.4?p.rage:1;for(let i=0;i<p.shotCount;i++){const off=(i-(p.shotCount-1)/2)*.115+rand(-p.spread,p.spread);shoot(p,angle+off,false,p.damage*rageMult,null,{bounces:p.ricochet});}
}
function dash(){
  if(!game||game.paused||game.between)return;const p=game.player;if(p.dashCd>0)return;let dx=joystick.dx+(keys.d||keys.arrowright?1:0)-(keys.a||keys.arrowleft?1:0),dy=joystick.dy+(keys.s||keys.arrowdown?1:0)-(keys.w||keys.arrowup?1:0);let m=Math.hypot(dx,dy);
  if(m<.2){const a=mobileAim.active?mobileAim.angle:Math.atan2(mouse.y-p.y,mouse.x-p.x);dx=Math.cos(a);dy=Math.sin(a);m=1;}
  const ox=p.x,oy=p.y;p.x=clamp(p.x+dx/m*p.dashPower,30,W-30);p.y=clamp(p.y+dy/m*p.dashPower,30,H-30);p.inv=.52;p.dashCd=p.dashMax;game.shake=10;audio.dash();burst(p.x,p.y,skin().c1,18);if(p.dashBlast>0)explodeAt(p.x,p.y,p.dashBlast,null);
  if(p.dashDamage>0){for(const e of [...game.enemies]){if(pointLineDistance(e.x,e.y,ox,oy,p.x,p.y)<e.r+42)damageEnemy(e,p.dashDamage,null,true);}if(game.boss&&pointLineDistance(game.boss.x,game.boss.y,ox,oy,p.x,p.y)<game.boss.r+42)damageBoss(p.dashDamage*.7);}
}
function pointLineDistance(px,py,x1,y1,x2,y2){const A=px-x1,B=py-y1,C=x2-x1,D=y2-y1;const dot=A*C+B*D,len=C*C+D*D;const t=len?clamp(dot/len,0,1):0;return Math.hypot(px-(x1+t*C),py-(y1+t*D));}

function damagePlayer(amount){
  const p=game.player;if(p.inv>0)return;if(p.shields>0){p.shields--;p.inv=.22;audio.shield();floater(p.x,p.y-28,'BLOCK','#8ceaff');return;}
  amount=Math.max(1,amount-p.armor);p.hp-=amount;p.inv=.34;game.shake=Math.max(game.shake,7);audio.hit();if(settings.damage)floater(p.x,p.y-28,`-${Math.ceil(amount)}`,'#ff8b8b');
  if(p.hp<=0){if(p.secondWind&&!p.secondWindUsed){p.secondWindUsed=true;p.hp=Math.max(1,p.maxHp*.5);p.inv=2;announce('SECOND WIND');burst(p.x,p.y,'#7df1b7',28);}else endGame();}
}
function damageEnemy(e,amount,bullet=null,noCrit=false){
  const p=game.player;let crit=false;if(!noCrit&&Math.random()<p.crit){amount*=p.critMult;crit=true;}
  if(e.shieldHp>0){const take=Math.min(e.shieldHp,amount);e.shieldHp-=take;amount-=take;if(amount<=0){e.flash=.04;return;}}
  e.hp-=amount;e.flash=.08;if(bullet&&Math.random()<bullet.burn){e.burn=Math.max(e.burn,p.burnDamage*4);e.burnTick=.25;}
  if(settings.damage)floater(e.x,e.y-18,Math.round(amount),crit?'#ffe27d':'#fff');
  if(bullet&&Math.random()<bullet.explode)explodeAt(e.x,e.y,p.explodeDamage,e);if(bullet&&Math.random()<bullet.chain)chainFrom(e,p.chainDamage);
  if(p.execute&&e.hp/e.maxHp<=p.execute)e.hp=0;
  if(e.hp<=0)killEnemy(e);
}
function damageBoss(amount,bullet=null){
  if(!game.boss)return;const p=game.player;let crit=Math.random()<p.crit;if(crit)amount*=p.critMult;amount*=p.bossDamage;game.boss.hp-=amount;game.boss.flash=.08;if(settings.damage)floater(game.boss.x,game.boss.y-55,Math.round(amount),crit?'#ffe27d':'#fff');
  if(bullet&&Math.random()<bullet.burn){game.boss.burn=(game.boss.burn||0)+p.burnDamage*.65;}if(game.boss.hp<=0)killBoss();
}
function explodeAt(x,y,damage,source){if(!damage)return;burst(x,y,'#ffbf6a',12);for(const e of [...game.enemies]){if(e!==source&&Math.hypot(e.x-x,e.y-y)<85+e.r)damageEnemy(e,damage,null,true);}if(game.boss&&Math.hypot(game.boss.x-x,game.boss.y-y)<100+game.boss.r)damageBoss(damage*.55);}
function chainFrom(source,damage){if(!damage)return;const target=nearestEnemy(source,190,source);if(!target)return;if(target===game.boss)damageBoss(damage);else damageEnemy(target,damage,null,true);for(let i=0;i<5;i++)game.particles.push({x:source.x+(target.x-source.x)*i/5,y:source.y+(target.y-source.y)*i/5,vx:0,vy:0,life:.16,color:'#8ceaff',size:3});}

function killEnemy(e){
  const idx=game.enemies.indexOf(e);if(idx>=0)game.enemies.splice(idx,1);const t=enemyTypes[e.type];let n=Math.floor(rand(t.scrap[0],t.scrap[1]+1));if(e.elite)n+=3;if(game.modifier?.id==='bounty')n=Math.ceil(n*1.7);n=Math.ceil(n*(1+game.player.scrapBonus));
  for(let i=0;i<n;i++)game.scraps.push({x:e.x+rand(-8,8),y:e.y+rand(-8,8),vx:rand(-70,70),vy:rand(-70,70),r:5,value:1});
  if(t.split&&e.scale>.65){for(let i=0;i<2;i++)spawnEnemy('scout',e.x+rand(-12,12),e.y+rand(-12,12),.7);}
  if(t.event){const gain=e.elite?5:Math.floor(rand(1,4));gainEvent(t.event,gain,e.x,e.y);}
  const comboMult=game.combo;let score=12+game.wave*2+(e.elite?35:0);if(game.modifier?.id==='overclock')score*=1.25;if(game.modifier?.id==='blackout')score*=1.35;game.score+=Math.floor(score*comboMult*(1+game.player.scoreBonus));game.kills++;game.combo=clamp(game.combo+.08,1,3);game.comboTimer=3.2;
  if(game.player.lifesteal>0&&Math.random()<game.player.lifesteal)game.player.hp=Math.min(game.player.maxHp,game.player.hp+2);
  burst(e.x,e.y,e.color,e.elite?15:8);
}
function gainEvent(key,amount,x,y){const s=profile.events[key];s.currency+=amount;s.total+=amount;floater(x,y-34,`+${amount} ${events[key].currency}` ,events[key].color);}
function killBoss(){
  const b=game.boss;if(!b)return;game.score+=900+game.wave*95;game.scrap+=32+game.wave*2;game.bossKills++;game.crateDrops++;if(Math.random()<.22)game.crateDrops++;
  if(b.event){const amount=45+game.wave*2;gainEvent(b.event,amount,b.x,b.y);game.eventBossKills++;profile.stats.eventBosses++;}
  if(b.id==='gear'&&Math.random()<.18)unlockSkin('gearjaw');if(b.id==='mirror'&&Math.random()<.18)unlockSkin('mirror');
  burst(b.x,b.y,b.color,settings.reduced?28:70);game.boss=null;$('bossBar').classList.add('hidden');announce('BOSS DOWN · CRATE SECURED');audio.reward();audio.setMode('run');localStorage.setItem(SAVE_KEY,JSON.stringify(profile));
}
function burst(x,y,color,n=10){if(settings.reduced)n=Math.ceil(n*.38);for(let i=0;i<n;i++)game.particles.push({x,y,vx:rand(-170,170),vy:rand(-170,170),life:rand(.25,.85),color,size:rand(2,6)});}
function floater(x,y,text,color){game.floaters.push({x,y,text,color,life:.7});}

function update(dt){
  if(!game||game.paused||game.between)return;const g=game,p=g.player;g.time+=dt;p.fireCd=Math.max(0,p.fireCd-dt);p.dashCd=Math.max(0,p.dashCd-dt);p.inv=Math.max(0,p.inv-dt);if(p.regen>0)p.hp=Math.min(p.maxHp,p.hp+p.regen*dt);
  if(g.comboTimer>0){g.comboTimer-=dt;if(g.comboTimer<=0)g.combo=1;}
  let dx=joystick.dx+(keys.d||keys.arrowright?1:0)-(keys.a||keys.arrowleft?1:0),dy=joystick.dy+(keys.s||keys.arrowdown?1:0)-(keys.w||keys.arrowup?1:0);let m=Math.hypot(dx,dy);if(m>1){dx/=m;dy/=m;}p.x=clamp(p.x+dx*p.speed*dt,24,W-24);p.y=clamp(p.y+dy*p.speed*dt,24,H-24);
  if(mouse.down||mobileAim.active||nearestEnemy(p,560))playerShoot();
  if(g.spawnLeft>0){g.spawnTimer-=dt;if(g.spawnTimer<=0){spawnEnemy(pickEnemyType());g.spawnLeft--;g.spawnTimer=Math.max(.16,.72-g.wave*.018);}}
  updateEnemies(dt);updateBoss(dt);updateBullets(dt);updateScrap(dt);updateAllies(dt);updateDrones(dt);updateParticles(dt);updateMines(dt);chatSystem.update(dt);
  if(!g.boss&&g.spawnLeft===0&&g.enemies.length===0&&!g.between)openWorkbench();
  $('hpText').textContent=Math.ceil(p.hp);$('scrapText').textContent=g.scrap;$('waveText').textContent=g.wave;$('comboText').textContent=`x${g.combo.toFixed(1)}`;$('dashCdText').textContent=p.dashCd<=0?'READY':p.dashCd.toFixed(1)+'s';
  $('threatPill').textContent=g.modifier?g.modifier.name:'STANDARD';
}

function updateEnemies(dt){
  const p=game.player;
  for(const e of [...game.enemies]){
    e.flash=Math.max(0,e.flash-dt);if(e.burn>0){e.burnTick-=dt;if(e.burnTick<=0){e.burnTick=.35;const d=Math.min(e.burn,e.burn*.28);e.burn-=d;e.hp-=d;if(e.hp<=0){killEnemy(e);continue;}}}
    let target=p;if(game.allies.length&&Math.random()<.003){const live=game.allies.filter(a=>a.hp>0);if(live.length)target=choose(live);}const a=Math.atan2(target.y-e.y,target.x-e.x),d=dist(e,target),t=enemyTypes[e.type];e.specialCd-=dt;e.shootCd-=dt;
    if(t.phase){e.phaseTimer+=dt;const hidden=(e.phaseTimer%3.1)>2.18;if(hidden){e.x+=Math.cos(a)*e.speed*1.7*dt;e.y+=Math.sin(a)*e.speed*1.7*dt;e.flash=.02;continue;}}
    if(t.sniper){
      if(d<300){e.x-=Math.cos(a)*e.speed*dt;e.y-=Math.sin(a)*e.speed*dt;}else if(d>470){e.x+=Math.cos(a)*e.speed*.7*dt;e.y+=Math.sin(a)*e.speed*.7*dt;}
      if(e.shootCd<=0&&d<620){shoot(e,a,true,e.damage,520,{r:4});e.shootCd=2.2;}
    }else if(t.miner){
      if(d>210){e.x+=Math.cos(a)*e.speed*dt;e.y+=Math.sin(a)*e.speed*dt;}if(e.specialCd<=0){game.mines.push({x:e.x,y:e.y,r:12,life:8,armed:.7,damage:e.damage*1.6});e.specialCd=2.8;}
    }else if(t.orbit){
      const desired=235,radial=clamp((d-desired)/desired,-1,1),ta=a+Math.PI/2;e.x+=(Math.cos(a)*radial*.75+Math.cos(ta)*.72)*e.speed*dt;e.y+=(Math.sin(a)*radial*.75+Math.sin(ta)*.72)*e.speed*dt;if(e.shootCd<=0&&d<560){shoot(e,a,true,e.damage,295);e.shootCd=1.12;}
    }else if(t.shoot){
      if(d>240){e.x+=Math.cos(a)*e.speed*dt;e.y+=Math.sin(a)*e.speed*dt;}else if(d<150){e.x-=Math.cos(a)*e.speed*.45*dt;e.y-=Math.sin(a)*e.speed*.45*dt;}if(e.shootCd<=0&&d<460){shoot(e,a,true,e.damage,270);e.shootCd=rand(1.0,1.65);}
    }else if(t.charge&&e.specialCd<=0&&d<420){
      e.chargeTime=.55;e.chargeAngle=a;e.specialCd=3.6;
    }else if(e.chargeTime>0){
      e.chargeTime-=dt;e.x+=Math.cos(e.chargeAngle)*e.speed*3.6*dt;e.y+=Math.sin(e.chargeAngle)*e.speed*3.6*dt;
    }else{e.x+=Math.cos(a)*e.speed*dt;e.y+=Math.sin(a)*e.speed*dt;}
    if(dist(e,p)<e.r+p.r){damagePlayer(e.damage*dt*2.2);if(t.vamp)e.hp=Math.min(e.maxHp,e.hp+e.damage*dt*.9);}
  }
}

function updateMines(dt){for(const m of [...game.mines]){m.life-=dt;m.armed-=dt;if(m.life<=0){game.mines.splice(game.mines.indexOf(m),1);continue;}if(m.armed<=0&&Math.hypot(m.x-game.player.x,m.y-game.player.y)<m.r+game.player.r+6){damagePlayer(m.damage);burst(m.x,m.y,'#ffd56e',14);game.mines.splice(game.mines.indexOf(m),1);}}}

function updateBoss(dt){
  const b=game.boss;if(!b)return;b.flash=Math.max(0,b.flash-dt);if(b.burn>0){const d=b.burn*dt*.18;b.burn=Math.max(0,b.burn-d);b.hp-=d;if(b.hp<=0){killBoss();return;}}
  const p=game.player,a=Math.atan2(p.y-b.y,p.x-b.x),d=dist(b,p);const ratio=b.hp/b.maxHp;const newPhase=ratio<.34?3:ratio<.67?2:1;if(newPhase!==b.phase){b.phase=newPhase;$('bossPhase').textContent=`PHASE ${['I','II','III'][newPhase-1]}`;announce(`${b.name} · PHASE ${newPhase}`);game.shake=14;}
  b.angle+=dt*(1+b.phase*.18);b.shootCd-=dt;b.burstCd-=dt;b.specialCd-=dt;
  if(b.id==='rail'){
    if(b.specialCd<=0){b.charge=.85;b.chargeAngle=a;b.specialCd=4.4-b.phase*.45;}if(b.charge>0){b.charge-=dt;b.x+=Math.cos(b.chargeAngle)*b.speed*5*dt;b.y+=Math.sin(b.chargeAngle)*b.speed*5*dt;}else if(d>240){b.x+=Math.cos(a)*b.speed*dt;b.y+=Math.sin(a)*b.speed*dt;}
    if(b.shootCd<=0){for(let i=-2;i<=2;i++)shoot(b,a+i*.09,true,12+game.wave*.5,360);b.shootCd=1.15/b.phase;}
  }else if(b.id==='null'){
    if(d>220){b.x+=Math.cos(a)*b.speed*dt;b.y+=Math.sin(a)*b.speed*dt;}if(b.shootCd<=0){for(let i=0;i<6+b.phase*2;i++)shoot(b,i/(6+b.phase*2)*Math.PI*2+b.angle,true,10+game.wave*.45,245);b.shootCd=1.4;}
    if(b.specialCd<=0){for(let i=0;i<2+b.phase;i++)spawnEnemy('swarm',b.x+rand(-50,50),b.y+rand(-50,50),1,b.phase===3&&i===0);b.specialCd=5.4-b.phase*.5;}
  }else if(b.id==='gear'){
    if(b.specialCd<=0){b.charge=.7;b.chargeAngle=a;b.specialCd=4.5-b.phase*.4;}if(b.charge>0){b.charge-=dt;b.x+=Math.cos(b.chargeAngle)*b.speed*4.6*dt;b.y+=Math.sin(b.chargeAngle)*b.speed*4.6*dt;}else if(d>210){b.x+=Math.cos(a)*b.speed*dt;b.y+=Math.sin(a)*b.speed*dt;}if(b.shootCd<=0){for(let i=-3;i<=3;i++)shoot(b,a+i*.105,true,12+game.wave*.5,330);b.shootCd=1.08-b.phase*.12;}if(b.burstCd<=0){for(let i=0;i<2+b.phase;i++)game.mines.push({x:clamp(p.x+rand(-130,130),20,W-20),y:clamp(p.y+rand(-90,90),20,H-20),r:14,life:7,armed:.85,damage:22+b.phase*6});b.burstCd=3.8-b.phase*.35;}
  }else if(b.id==='mirror'){
    if(d>230){b.x+=Math.cos(a)*b.speed*dt;b.y+=Math.sin(a)*b.speed*dt;}if(b.shootCd<=0){const n=8+b.phase*4;for(let i=0;i<n;i++){const aa=i/n*Math.PI*2+b.angle;shoot(b,aa,true,10+game.wave*.42,245+b.phase*20);shoot(b,-aa,true,8+game.wave*.35,205+b.phase*18);}b.shootCd=1.35-b.phase*.12;}if(b.specialCd<=0){for(let i=0;i<b.phase;i++)spawnEnemy('orbiter',b.x+rand(-65,65),b.y+rand(-65,65),.9,b.phase===3&&i===0);b.specialCd=5.7-b.phase*.45;}
  }else if(b.id==='halloween'){
    if(d>190){b.x+=Math.cos(a)*b.speed*dt;b.y+=Math.sin(a)*b.speed*dt;}if(b.shootCd<=0){for(let i=-2;i<=2;i++)shoot(b,a+i*.2,true,12+game.wave*.5,300);b.shootCd=.95;}
    if(b.specialCd<=0){for(let i=0;i<3+b.phase;i++)spawnEnemy('hallowisp',b.x+rand(-70,70),b.y+rand(-70,70),.9);b.specialCd=5.8-b.phase*.55;}
  }else if(b.id==='fall'){
    if(d>175){b.x+=Math.cos(a)*b.speed*dt;b.y+=Math.sin(a)*b.speed*dt;}if(b.burstCd<=0){for(let i=0;i<10+b.phase*3;i++)shoot(b,i/(10+b.phase*3)*Math.PI*2,true,10+game.wave*.4,215+b.phase*22);b.burstCd=3.6-b.phase*.35;}
    if(b.specialCd<=0){for(let i=0;i<2+b.phase;i++)spawnEnemy('harvester',b.x+rand(-90,90),b.y+rand(-90,90),.9);b.specialCd=6.2-b.phase*.45;}
  }else{
    if(d>185){b.x+=Math.cos(a)*b.speed*dt;b.y+=Math.sin(a)*b.speed*dt;}if(b.shootCd<=0){for(let i=-1-b.phase%2;i<=1+b.phase%2;i++)shoot(b,a+i*.14,true,11+game.wave*.55,285+b.phase*12);b.shootCd=Math.max(.42,1.0-b.phase*.12);}
    if(b.burstCd<=0){const shots=12+b.phase*4;for(let i=0;i<shots;i++)shoot(b,i/shots*Math.PI*2+b.angle,true,9+game.wave*.42,220+b.phase*10);b.burstCd=4.3-b.phase*.45;}
    if(b.id==='warden'&&b.specialCd<=0){for(let i=0;i<3;i++)spawnEnemy(i===0?'bulwark':'gunner',b.x+rand(-80,80),b.y+rand(-80,80),.9);b.specialCd=6.4-b.phase*.5;}
  }
  if(d<b.r+p.r)damagePlayer((24+b.phase*5)*dt);$('bossFill').style.width=Math.max(0,b.hp/b.maxHp*100)+'%';
}

function updateBullets(dt){
  for(const b of [...game.bullets]){
    b.x+=b.vx*dt;b.y+=b.vy*dt;b.life-=dt;let remove=b.life<=0;
    if(b.x<-20||b.x>W+20){if(b.bounces>0){b.vx*=-1;b.bounces--;}else remove=true;}if(b.y<-20||b.y>H+20){if(b.bounces>0){b.vy*=-1;b.bounces--;}else remove=true;}
    if(!remove){for(const e of [...game.enemies]){if(Math.hypot(b.x-e.x,b.y-e.y)<b.r+e.r){damageEnemy(e,b.damage,b);if(b.pierce>0)b.pierce--;else{remove=true;break;}}}if(!remove&&game.boss&&Math.hypot(b.x-game.boss.x,b.y-game.boss.y)<b.r+game.boss.r){damageBoss(b.damage,b);remove=true;}}
    if(remove)game.bullets.splice(game.bullets.indexOf(b),1);
  }
  for(const b of [...game.enemyBullets]){b.x+=b.vx*dt;b.y+=b.vy*dt;b.life-=dt;let remove=b.life<=0||b.x<-40||b.x>W+40||b.y<-40||b.y>H+40;if(!remove&&Math.hypot(b.x-game.player.x,b.y-game.player.y)<b.r+game.player.r){damagePlayer(b.damage);remove=true;}if(!remove){for(const a of game.allies){if(a.hp>0&&Math.hypot(b.x-a.x,b.y-a.y)<b.r+a.r){a.hp-=b.damage;remove=true;break;}}}if(remove)game.enemyBullets.splice(game.enemyBullets.indexOf(b),1);}
}
function updateScrap(dt){const p=game.player;for(const s of [...game.scraps]){s.vx*=.96;s.vy*=.96;s.x+=s.vx*dt;s.y+=s.vy*dt;const d=dist(s,p);if(d<p.magnet){const a=Math.atan2(p.y-s.y,p.x-s.x),pull=(1-d/p.magnet)*700;s.vx+=Math.cos(a)*pull*dt;s.vy+=Math.sin(a)*pull*dt;}if(d<p.r+10){game.scrap+=s.value;audio.scrap();game.scraps.splice(game.scraps.indexOf(s),1);}}}
function updateAllies(dt){for(const a of game.allies){if(a.hp<=0)continue;const p=game.player,da=dist(a,p),target=nearestEnemy(a,650);if(target){const ang=Math.atan2(target.y-a.y,target.x-a.x),d=dist(a,target);if(d>180){a.x+=Math.cos(ang)*a.speed*dt;a.y+=Math.sin(ang)*a.speed*dt;}a.fireCd-=dt;if(a.fireCd<=0){game.bullets.push({x:a.x,y:a.y,vx:Math.cos(ang)*470,vy:Math.sin(ang)*470,r:4,life:2,damage:10+game.wave*.28,pierce:0,enemy:false,explode:0,burn:0,chain:0,bounces:0});a.fireCd=.52;}}else if(da>90){const ang=Math.atan2(p.y-a.y,p.x-a.x);a.x+=Math.cos(ang)*a.speed*dt;a.y+=Math.sin(ang)*a.speed*dt;}a.x=clamp(a.x,20,W-20);a.y=clamp(a.y,20,H-20);}}
function updateDrones(dt){const p=game.player;if(!p.drones)return;game.droneCd-=dt;if(game.droneCd<=0){const t=nearestEnemy(p,520);if(t){for(let i=0;i<p.drones;i++){const ang=game.time*1.6+i/p.drones*Math.PI*2;const d={x:p.x+Math.cos(ang)*46,y:p.y+Math.sin(ang)*46,r:5};shoot(d,Math.atan2(t.y-d.y,t.x-d.x),false,p.droneDamage,460,{r:3});}game.droneCd=p.droneRate;}}}
function updateParticles(dt){for(const p of [...game.particles]){p.x+=p.vx*dt;p.y+=p.vy*dt;p.vx*=.96;p.vy*=.96;p.life-=dt;if(p.life<=0)game.particles.splice(game.particles.indexOf(p),1);}for(const f of [...game.floaters]){f.y-=35*dt;f.life-=dt;if(f.life<=0)game.floaters.splice(game.floaters.indexOf(f),1);}}

const upgrades=[
  {id:'hull',name:'Reinforced Hull',rarity:'common',tags:['armor'],desc:'+24 max HP and repair 24 HP.',base:12,max:8,apply:p=>{p.maxHp+=24;p.hp=Math.min(p.maxHp,p.hp+24);}},
  {id:'firerate',name:'Overclocked Cannon',rarity:'common',tags:['weapon'],desc:'Fire 12% faster.',base:14,max:8,apply:p=>p.fireRate=Math.max(.055,p.fireRate*.88)},
  {id:'damage',name:'Heavy Rounds',rarity:'common',tags:['weapon'],desc:'+7 bullet damage.',base:15,max:10,apply:p=>p.damage+=7},
  {id:'speed',name:'Thruster Pack',rarity:'common',tags:['mobility'],desc:'+22 movement speed.',base:11,max:7,apply:p=>p.speed+=22},
  {id:'magnet',name:'Magnetic Intake',rarity:'common',tags:['salvage'],desc:'+42 scrap pickup range.',base:9,max:6,apply:p=>p.magnet+=42},
  {id:'repair',name:'Emergency Repair',rarity:'common',tags:['armor'],desc:'Restore 60 HP immediately.',base:8,max:99,apply:p=>p.hp=Math.min(p.maxHp,p.hp+60)},
  {id:'barrel',name:'Long Barrel',rarity:'uncommon',tags:['weapon'],desc:'+18% bullet speed and +1 bullet size.',base:14,max:5,apply:p=>{p.bulletSpeed*=1.18;p.bulletSize=Math.min(9,p.bulletSize+1);}},
  {id:'armor',name:'Impact Plating',rarity:'uncommon',tags:['armor'],desc:'Reduce incoming damage by 1.7.',base:19,max:7,apply:p=>p.armor+=1.7},
  {id:'phase',name:'Phase Dash',rarity:'uncommon',tags:['dash','mobility'],desc:'Dash cooldown reduced by 17%.',base:18,max:6,apply:p=>p.dashMax=Math.max(.62,p.dashMax*.83)},
  {id:'crit',name:'Critical Relay',rarity:'uncommon',tags:['crit','weapon'],desc:'+7% critical chance.',base:18,max:6,apply:p=>p.crit=Math.min(.62,p.crit+.07)},
  {id:'nanites',name:'Repair Nanites',rarity:'uncommon',tags:['armor'],desc:'+1.1 HP/sec regeneration.',base:26,max:6,apply:p=>p.regen+=1.1},
  {id:'salvage',name:'Salvage Protocol',rarity:'uncommon',tags:['salvage'],desc:'+18% enemy scrap drops.',base:18,max:5,apply:p=>p.scrapBonus+=.18},
  {id:'twin',name:'Twin Mount',rarity:'rare',tags:['multishot','weapon'],desc:'+1 projectile per shot.',base:27,max:4,apply:p=>p.shotCount=Math.min(5,p.shotCount+1)},
  {id:'pierce',name:'Piercing Core',rarity:'rare',tags:['weapon'],desc:'Bullets pierce one extra target.',base:24,max:4,apply:p=>p.pierce=Math.min(4,p.pierce+1)},
  {id:'drone',name:'Drone Bay',rarity:'rare',tags:['drone'],desc:'Add an orbiting auto-cannon drone.',base:30,max:4,apply:p=>p.drones=Math.min(4,p.drones+1)},
  {id:'droneAmp',name:'Drone Amplifier',rarity:'rare',tags:['drone'],desc:'+6 drone damage and 12% faster drone fire.',base:25,max:5,requires:p=>p.drones>0,apply:p=>{p.droneDamage+=6;p.droneRate=Math.max(.28,p.droneRate*.88);}},
  {id:'dashRam',name:'Kinetic Dash',rarity:'rare',tags:['dash'],desc:'Dash path deals 42 damage.',base:26,max:6,apply:p=>p.dashDamage+=42},
  {id:'shield',name:'Pulse Shield',rarity:'rare',tags:['armor'],desc:'+1 shield charge each wave.',base:31,max:4,apply:p=>{p.maxShields++;p.shields++;}},
  {id:'bossHunter',name:'Boss Hunter',rarity:'rare',tags:['weapon'],desc:'+15% damage against bosses.',base:28,max:5,apply:p=>p.bossDamage+=.15},
  {id:'incendiary',name:'Incendiary Feed',rarity:'epic',tags:['burn','weapon'],desc:'+18% burn chance. Burns deal 7 damage/sec.',base:38,max:4,apply:p=>{p.burnChance=Math.min(.75,p.burnChance+.18);p.burnDamage+=7;}},
  {id:'explosive',name:'Volatile Rounds',rarity:'epic',tags:['explosive','weapon'],desc:'+12% explosion chance. Explosions deal 24 area damage.',base:42,max:4,apply:p=>{p.explodeChance=Math.min(.55,p.explodeChance+.12);p.explodeDamage+=24;}},
  {id:'chain',name:'Arc Relay',rarity:'epic',tags:['chain','weapon'],desc:'+14% chance to chain damage to another target.',base:40,max:4,apply:p=>{p.chainChance=Math.min(.6,p.chainChance+.14);p.chainDamage+=22;}},
  {id:'vamp',name:'Recycler Leech',rarity:'epic',tags:['armor','salvage'],desc:'Kills have a 12% chance to repair 2 HP.',base:36,max:4,apply:p=>p.lifesteal=Math.min(.55,p.lifesteal+.12)},
  {id:'glass',name:'Glass Reactor',rarity:'epic',tags:['weapon'],desc:'+35% damage, but -18 max HP.',base:34,max:3,apply:p=>{p.damage*=1.35;p.maxHp=Math.max(35,p.maxHp-18);p.hp=Math.min(p.hp,p.maxHp);}},
  {id:'second',name:'Second Wind',rarity:'legendary',tags:['armor'],desc:'Once per run, lethal damage restores 50% HP instead.',base:58,max:1,apply:p=>p.secondWind=true},
  {id:'critCore',name:'Golden Critical Core',rarity:'legendary',tags:['crit','weapon'],desc:'+0.6x critical multiplier and +8% crit chance.',base:62,max:2,apply:p=>{p.critMult+=.6;p.crit=Math.min(.7,p.crit+.08);}},
  {id:'arsenal',name:'Impossible Arsenal',rarity:'legendary',tags:['multishot','weapon'],desc:'+2 projectiles, +12 damage, fire 10% slower.',base:70,max:2,apply:p=>{p.shotCount=Math.min(7,p.shotCount+2);p.damage+=12;p.fireRate*=1.1;}},
  {id:'jackpot',name:'Salvage Jackpot',rarity:'legendary',tags:['salvage'],desc:'+45% scrap drops and +20% score.',base:66,max:2,apply:p=>{p.scrapBonus+=.45;p.scoreBonus+=.2;}},
  {id:'vector',name:'Vector Thrusters',rarity:'common',tags:['dash','mobility'],desc:'+48 dash distance.',base:12,max:6,apply:p=>p.dashPower+=48},
  {id:'caliber',name:'Siege Caliber',rarity:'uncommon',tags:['weapon'],desc:'+3 damage and +1 projectile size.',base:18,max:5,apply:p=>{p.damage+=3;p.bulletSize=Math.min(11,p.bulletSize+1);}},
  {id:'ricochet',name:'Bank Shot Rail',rarity:'rare',tags:['weapon'],desc:'Player shots bounce off the arena wall once.',base:33,max:2,apply:p=>p.ricochet=Math.min(2,p.ricochet+1)},
  {id:'execute',name:'Cutoff Protocol',rarity:'rare',tags:['crit','weapon'],desc:'Instantly destroy non-boss enemies below 9% HP.',base:35,max:3,apply:p=>p.execute=Math.min(.27,p.execute+.09)},
  {id:'dashBlast',name:'Afterburn Detonator',rarity:'epic',tags:['dash','explosive'],desc:'Every dash detonates for 34 area damage.',base:43,max:4,apply:p=>p.dashBlast+=34},
  {id:'rage',name:'Redline Reactor',rarity:'epic',tags:['weapon','armor'],desc:'Below 40% HP, deal +30% weapon damage.',base:42,max:3,apply:p=>p.rage+=.30},
  {id:'fortress',name:'Fortress Cell',rarity:'epic',tags:['armor'],desc:'+2 shield charges every wave.',base:49,max:2,apply:p=>{p.maxShields+=2;p.shields+=2;}},
  {id:'apex',name:'Apex Reactor',rarity:'legendary',tags:['weapon','mobility'],desc:'+25% damage and +15% speed, but -15 max HP.',base:74,max:2,apply:p=>{p.damage*=1.25;p.speed*=1.15;p.maxHp=Math.max(35,p.maxHp-15);p.hp=Math.min(p.hp,p.maxHp);}}
];
const rarityWeight={common:44,uncommon:30,rare:18,epic:7,legendary:1.5};
const rarityPrice={common:1,uncommon:1.2,rare:1.55,epic:2.05,legendary:2.8};
function pickUpgrade(){
  const available=upgrades.filter(u=>(game.upgradeCounts[u.id]||0)<u.max&&(!u.requires||u.requires(game.player)));let sum=available.reduce((s,u)=>s+rarityWeight[u.rarity],0),r=Math.random()*sum;for(const u of available){r-=rarityWeight[u.rarity];if(r<=0)return u;}return choose(available)||upgrades[0];
}
function rollUpgradeOptions(){const out=[];let guard=0;while(out.length<6&&guard++<80){const u=pickUpgrade();if(u&&!out.some(x=>x.id===u.id))out.push(u);}return out;}
function updateBuildTags(){
  const counts={};for(const u of upgrades){const n=game.upgradeCounts[u.id]||0;if(!n)continue;for(const t of u.tags)counts[t]=(counts[t]||0)+n;}
  $('buildTags').innerHTML=Object.entries(counts).sort((a,b)=>b[1]-a[1]).slice(0,8).map(([t,n])=>`<span>${t.toUpperCase()} ${n}</span>`).join('')||'<span>NO BUILD TAGS YET</span>';
}
function renderWorkbench(){
  const opts=rollUpgradeOptions(),wrap=$('upgradeOptions');wrap.innerHTML='';$('upgradeScrap').textContent=game.scrap;$('upgradeTitle').textContent=`Wave ${game.wave} cleared`;$('upgradeSubtitle').textContent=game.modifier?`Survived ${game.modifier.name}. Stack a build or patch the holes.`:'Buy as many upgrades as your scrap can afford.';updateBuildTags();
  for(const up of opts){const stacks=game.upgradeCounts[up.id]||0;const cost=Math.floor(up.base*(1+game.wave*.045)*(1+stacks*.25)*rarityPrice[up.rarity]);const b=document.createElement('button');b.className='upgrade'+(game.scrap<cost?' locked':'');b.innerHTML=`<span class="rarity ${up.rarity}">${up.rarity}</span><strong>${up.name}${stacks?` · ${stacks}/${up.max}`:''}</strong><small>${up.desc}</small><span class="price">${cost} scrap</span>`;
    b.onclick=()=>{if(game.scrap<cost||b.disabled)return;game.scrap-=cost;game.upgradeCounts[up.id]=(game.upgradeCounts[up.id]||0)+1;up.apply(game.player);audio.upgrade();game.selectedUpgrades++;$('upgradeScrap').textContent=game.scrap;b.disabled=true;b.classList.add('locked');updateBuildTags();chatSystem.sayUpgrade(up.name);};wrap.appendChild(b);
  }
  const rr=8+game.rerolls*5;$('rerollCost').textContent=`${rr} scrap`;$('rerollUpgrades').disabled=game.scrap<rr;
}
function openWorkbench(){
  if(game.between)return;game.between=true;game.enemyBullets.length=0;game.mines.length=0;
  if(!game.clearedWaves.has(game.wave)){game.clearedWaves.add(game.wave);game.dailyWaves++;profile.daily.progress=Math.min(3,profile.daily.progress+1);saveProfile();}
  renderWorkbench();showOverlay('upgradeScreen',true);
}
$('rerollUpgrades').onclick=()=>{if(!game)return;const cost=8+game.rerolls*5;if(game.scrap<cost)return;game.scrap-=cost;game.rerolls++;audio.upgrade();renderWorkbench();};
$('continueWave').onclick=()=>{if(!game)return;showOverlay('upgradeScreen',false);nextWave();};

const chatSystem={
  t:0,reset(){this.t=rand(4,7);$('crewChat').innerHTML='';},update(dt){if(!game||!game.allies.length)return;this.t-=dt;if(this.t<=0){this.t=rand(5,10);const lines=game.player.hp<35?['Hull is getting shredded.','Fall back toward me.','That health bar is NOT looking good.']:game.boss?['Boss pattern changed. Watch the lanes.','Focus fire. No hero moves.','That health bar is moving. Keep it up.']:game.combo>2?['That combo is disgusting.','Do not stop firing.','We are absolutely cooking this wave.']:['I found a clean angle.','Scrap on your left.','Keeping the lane clear.','This run is actually cooking.','I am stealing that upgrade next time.'];this.say(choose(lines));}},say(text){const live=game.allies.filter(a=>a.hp>0);if(!live.length)return;const a=choose(live),div=document.createElement('div');div.className='chatline';div.innerHTML=`<b>${a.name}:</b> ${text}`;$('crewChat').appendChild(div);while($('crewChat').children.length>4)$('crewChat').firstChild.remove();setTimeout(()=>div.remove(),6500);},sayUpgrade(name){if(game.allies.length)this.say(`Installing ${name}. Nice.`);}
};

function skin(){return skins[profile.equipped]||skins.factory;}
function draw(){
  if(!game)return;ctx.save();let sx=0,sy=0;if(game.shake>0){const amt=game.shake*(settings.shake/100);sx=rand(-amt,amt);sy=rand(-amt,amt);game.shake*=.84;}ctx.translate(sx,sy);
  ctx.fillStyle=game.modifier?.id==='blackout'?'#020305':'#070a0f';ctx.fillRect(-20,-20,W+40,H+40);drawGrid();drawSeasonal();
  for(const s of game.scraps){ctx.fillStyle='#ffd66e';ctx.fillRect(s.x-4,s.y-4,8,8);}for(const m of game.mines)drawMine(m);
  for(const b of game.bullets){ctx.fillStyle=skin().c1;ctx.beginPath();ctx.arc(b.x,b.y,b.r,0,Math.PI*2);ctx.fill();}
  for(const b of game.enemyBullets){ctx.fillStyle='#ff7c7c';ctx.beginPath();ctx.arc(b.x,b.y,b.r,0,Math.PI*2);ctx.fill();}
  for(const e of game.enemies)drawEnemy(e);if(game.boss)drawBoss(game.boss);for(const a of game.allies)drawAlly(a);drawDrones();drawPlayer(game.player);
  for(const p of game.particles){ctx.globalAlpha=clamp(p.life/.6,0,1);ctx.fillStyle=p.color;ctx.fillRect(p.x,p.y,p.size,p.size);ctx.globalAlpha=1;}ctx.font='900 14px system-ui';ctx.textAlign='center';for(const f of game.floaters){ctx.globalAlpha=clamp(f.life/.7,0,1);ctx.fillStyle=f.color;ctx.fillText(f.text,f.x,f.y);ctx.globalAlpha=1;}ctx.restore();
}
function drawGrid(){const size=54,ox=(-game.time*12)%size,oy=(game.time*5)%size;ctx.strokeStyle='rgba(118,144,173,.07)';ctx.lineWidth=1;for(let x=ox-size;x<W+size;x+=size){ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x,H);ctx.stroke();}for(let y=oy-size;y<H+size;y+=size){ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(W,y);ctx.stroke();}for(let i=0;i<28;i++){const x=(i*193)%W,y=(i*311)%H;ctx.fillStyle='rgba(255,255,255,.12)';ctx.fillRect(x,y,1,1);}}
function drawSeasonal(){if(settings.reduced)return;const now=new Date();if(eventActive(events.halloween)){ctx.globalAlpha=.12;ctx.fillStyle='#ff8c52';for(let i=0;i<8;i++){const x=(i*173+game.time*12)%W,y=(i*91+Math.sin(game.time+i)*20)%H;ctx.beginPath();ctx.arc(x,y,3,0,Math.PI*2);ctx.fill();}}if(eventActive(events.fall)){ctx.globalAlpha=.08;ctx.fillStyle='#e3aa63';for(let i=0;i<6;i++){const x=(i*217+game.time*8)%W,y=(i*137+game.time*16)%H;ctx.fillRect(x,y,7,3);}}ctx.globalAlpha=1;}
function drawPlayer(p){const s=skin();ctx.save();ctx.translate(p.x,p.y);if(p.inv>0)ctx.globalAlpha=.55+.45*Math.sin(game.time*35);ctx.rotate(game.time*.8);for(let i=0;i<4;i++){ctx.rotate(Math.PI/2);ctx.fillStyle=s.c2;ctx.fillRect(13,-5,13,10);}ctx.fillStyle=s.c1;ctx.beginPath();ctx.arc(0,0,p.r,0,Math.PI*2);ctx.fill();ctx.fillStyle='#08100d';ctx.beginPath();ctx.arc(0,0,7,0,Math.PI*2);ctx.fill();ctx.restore();if(p.shields>0){ctx.strokeStyle='#8ceaff';ctx.globalAlpha=.5;ctx.lineWidth=2;ctx.beginPath();ctx.arc(p.x,p.y,p.r+7,0,Math.PI*2);ctx.stroke();ctx.globalAlpha=1;}}
function drawDrones(){const p=game.player;if(!p.drones)return;for(let i=0;i<p.drones;i++){const a=game.time*1.6+i/p.drones*Math.PI*2,x=p.x+Math.cos(a)*46,y=p.y+Math.sin(a)*46;ctx.fillStyle='#91c7ff';ctx.beginPath();ctx.arc(x,y,6,0,Math.PI*2);ctx.fill();}}
function drawAlly(a){if(a.hp<=0)return;ctx.fillStyle='#6b8cff';ctx.beginPath();ctx.arc(a.x,a.y,a.r,0,Math.PI*2);ctx.fill();ctx.strokeStyle='rgba(255,255,255,.5)';ctx.stroke();ctx.fillStyle='rgba(0,0,0,.55)';ctx.fillRect(a.x-18,a.y-26,36,4);ctx.fillStyle='#7df1b7';ctx.fillRect(a.x-18,a.y-26,36*(a.hp/a.maxHp),4);}
function drawMine(m){ctx.save();ctx.translate(m.x,m.y);ctx.rotate(game.time*2);ctx.fillStyle=m.armed>0?'#756d42':'#ffd56e';for(let i=0;i<4;i++){ctx.rotate(Math.PI/2);ctx.fillRect(7,-2,8,4);}ctx.beginPath();ctx.arc(0,0,m.r,0,Math.PI*2);ctx.fill();ctx.restore();}
function drawEnemy(e){ctx.save();ctx.translate(e.x,e.y);ctx.fillStyle=e.flash>0?'#fff':e.color;if(e.type==='rammer'||e.type==='harvester'||e.type==='brute'){ctx.rotate(game.time*1.5);ctx.fillRect(-e.r,-e.r,e.r*2,e.r*2);}else if(e.type==='gunner'||e.type==='sniper'){ctx.beginPath();for(let i=0;i<6;i++){const a=i/6*Math.PI*2,r=i%2?e.r*.65:e.r;ctx.lineTo(Math.cos(a)*r,Math.sin(a)*r);}ctx.closePath();ctx.fill();}else if(e.type==='bulwark'){ctx.fillRect(-e.r,-e.r*.7,e.r*2,e.r*1.4);if(e.shieldHp>0){ctx.strokeStyle='#9ef5e8';ctx.lineWidth=3;ctx.strokeRect(-e.r-5,-e.r*.7-5,e.r*2+10,e.r*1.4+10);}}else{ctx.beginPath();ctx.arc(0,0,e.r,0,Math.PI*2);ctx.fill();}if(e.elite){ctx.strokeStyle='#ffe27d';ctx.lineWidth=2;ctx.beginPath();ctx.arc(0,0,e.r+5,0,Math.PI*2);ctx.stroke();}ctx.restore();}
function drawBoss(b){ctx.save();ctx.translate(b.x,b.y);ctx.rotate(b.angle);ctx.fillStyle=b.flash>0?'#fff':b.color;const arms=b.id==='null'?10:b.id==='fall'?6:b.id==='gear'?12:b.id==='mirror'?4:8;for(let i=0;i<arms;i++){ctx.rotate(Math.PI*2/arms);ctx.fillRect(b.r*.55,-6,b.r*.72,12);}ctx.beginPath();ctx.arc(0,0,b.r,0,Math.PI*2);ctx.fill();ctx.fillStyle='#210c12';ctx.beginPath();ctx.arc(0,0,b.r*.3,0,Math.PI*2);ctx.fill();ctx.restore();}

let last=performance.now();function loop(t,serial){if(!game||game.serial!==serial)return;const dt=Math.min(.033,(t-last)/1000);last=t;update(dt);draw();if(game&&game.serial===serial)requestAnimationFrame(n=>loop(n,serial));}

function endGame(){
  if(!game||game.ended)return;game.ended=true;game.paused=true;audio.setMode('menu');const score=Math.floor(game.score+game.wave*100+game.kills*5);const insurance=1+profile.meta.insurance*.04;const credits=Math.floor((game.wave*10+game.kills*1.25+game.bossKills*45+score/180)*insurance);const xp=Math.floor(game.wave*16+game.kills*2.1+game.bossKills*65);const crates=game.crateDrops+Math.floor(game.wave/12);
  profile.credits+=credits;profile.crates+=crates;profile.stats.creditsEarned+=credits;addXp(xp);profile.stats.bestWave=Math.max(profile.stats.bestWave,game.wave);profile.stats.bestScore=Math.max(profile.stats.bestScore,score);profile.stats.kills+=game.kills;profile.stats.bosses+=game.bossKills;profile.stats.runs++;syncMilestoneUnlocks();saveProfile();
  $('gameOverTitle').textContent=game.wave>=20?'Wreckyard Legend':game.wave>=10?'Legendary Wreck':'System Failure';$('gameOverStats').textContent=`Wave ${game.wave} · ${game.kills} destroyed · ${game.bossKills} bosses · ${score.toLocaleString()} score`;
  $('rewardBreakdown').innerHTML=`<b>RUN PAYOUT</b><br>+${credits} credits · +${xp} XP · +${crates} crate${crates===1?'':'s'}${game.eventBossKills?`<br>${game.eventBossKills} seasonal boss${game.eventBossKills===1?'':'es'} defeated`:''}`;showOverlay('gameOverScreen',true);
}
function quit(){saveProfile();game=null;showOverlay('pauseScreen',false);showOverlay('upgradeScreen',false);showOverlay('gameOverScreen',false);showScreen('menu');$('bossBar').classList.add('hidden');audio.setMode('menu');refreshMenu();}
$('retryBtn').onclick=()=>{const m=game?.mode||'solo',b=game?.bots||0,r=game?.room||'';const threat=game?.startThreat||1;game=null;startRun(m,b,r,threat);};$('menuBtn').onclick=quit;$('quitBtn').onclick=quit;
$('pauseBtn').onclick=()=>{if(!game)return;game.paused=true;showOverlay('pauseScreen',true);};$('resumeBtn').onclick=()=>{if(!game)return;game.paused=false;showOverlay('pauseScreen',false);last=performance.now();};
$('pauseSettings').onclick=()=>{showOverlay('pauseScreen',false);showScreen('settingsScreen');};
document.querySelectorAll('#settingsScreen .backBtn').forEach(b=>b.addEventListener('click',()=>{if(game){showScreen('gameScreen');showOverlay('pauseScreen',true);}}));
document.addEventListener('visibilitychange',()=>{if(document.hidden&&game&&!game.between&&!game.ended){game.paused=true;showOverlay('pauseScreen',true);}});

})();
