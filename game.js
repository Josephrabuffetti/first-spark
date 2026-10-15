(() => {
'use strict';
const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];
const byId=Object.fromEntries(ITEMS.map(x=>[x.id,x]));
const key='first-spark-v1', starters=ITEMS.slice(0,4).map(x=>x.id);
const colors={Cosmos:'#e9c58b',World:'#9abff2',Life:'#a5e2be'};
const defaultState=()=>({version:1,discovered:[...starters],name:'Pale Blue',sound:false,reduced:matchMedia('(prefers-reduced-motion: reduce)').matches,completed:false,world:WorldHistory.fresh()});
let state=defaultState(), storageAvailable=true;
function validate(s){if(!s||s.version!==1||!Array.isArray(s.discovered)||s.discovered.some(x=>!byId[x])||!starters.every(x=>s.discovered.includes(x)))throw Error('This is not a valid First Spark save.');const found=new Set(starters);let changed=true;while(changed){changed=false;for(const [a,b,c] of RECIPES)if(s.discovered.includes(c)&&found.has(a)&&found.has(b)&&!found.has(c)){found.add(c);changed=true;}}if(s.discovered.some(x=>!found.has(x)))throw Error('This save contains discoveries without their ingredients.');return {version:1,discovered:[...new Set(s.discovered)],name:typeof s.name==='string'?s.name.slice(0,30).trim()||'Pale Blue':'Pale Blue',sound:!!s.sound,reduced:!!s.reduced,completed:!!s.completed&&s.discovered.includes('biosphere'),world:WorldHistory.clean(s.world)};}
try{const saved=localStorage.getItem(key);if(saved)state=validate(JSON.parse(saved));}catch(e){storageAvailable=false;}
let selected=[null,null],filter='All',fresh=null,view='universe',hintTarget=null,hintLevel=0,audioContext;
let merging=false, dragging=null, suppressClick=false;
let observing=false;
let exploring=false, inspected='planet', camera={zoom:1,x:0,y:0}, targetCamera={zoom:1,x:0,y:0};
let scenePulse=null, cameraDrag=null;
let pendingReveal=null,pendingCompletion=false;
const motionMetrics=new URLSearchParams(location.search).has('motion-check')?{draws:[],intervals:[],last:0}:null;if(motionMetrics)window.__SPARK_MOTION_METRICS__=motionMetrics;
const formation=new FormationModel.Controller(FormationModel.profile(state.discovered,view,observing),performance.now());
let replayFrom=null,replayTo=null,worldRunning=false,worldElapsed=0,worldLast=0,worldEffect=null,worldEffectTimer;
let settledArt=['A universe, waiting to happen','An ember of possibility in the cosmic dark'];
const worldFeatures=['biofilm','metabolism','transport','planet','heat','volcano','atmosphere','ocean','minerals','vent','light','organics','cell','microbes','photosynthesis','cyanobacteria','biosphere'];
const lifeExpansion=["nitrogen", "phosphate", "sulfur", "ammonia", "aminoacids", "peptides", "proteins", "sugars", "nucleobases", "nucleosides", "nucleotides", "rna", "dna", "enzymes", "atp", "metabolism", "biofilm", "transport", "co2", "fermentation"];
const clamp=(n,a,b)=>Math.max(a,Math.min(b,n));

const has=id=>state.discovered.includes(id);
function save(){try{localStorage.setItem(key,JSON.stringify(state));storageAvailable=true;}catch(e){storageAvailable=false;}$('#save-status').textContent=storageAvailable?'Saved on this browser':'Saving unavailable — export progress';}
function say(message,success=false){$('#feedback').textContent=message;$('#feedback').classList.toggle('success',success);}
function renderCollection(){const query=$('#search').value.trim().toLowerCase();const items=state.discovered.map(id=>byId[id]).filter(i=>(filter==='All'||i.category===filter)&&i.name.toLowerCase().includes(query));$('#ingredients').replaceChildren();for(const item of items){const b=document.createElement('button');b.className='ingredient'+(item.id===fresh?' fresh':'');b.draggable=false;b.dataset.ingredient=item.id;b.style.setProperty('--item-color',colors[item.category]);b.innerHTML=`<span class="glyph">${item.glyph}</span><span class="item-name">${item.name}</span>${item.id===fresh?'<span class="tag">NEW</span>':''}`;b.setAttribute('aria-label',`Add ${item.name} to cradle`);b.addEventListener('click',()=>{if(!suppressClick&&!merging)choose(item.id);});b.addEventListener('pointerdown',e=>beginDrag(e,item.id,null));b.addEventListener('dragstart',e=>{e.dataTransfer.setData('text/plain',item.id);e.dataTransfer.effectAllowed='copy';});$('#ingredients').append(b);}if(!items.length){const p=document.createElement('p');p.className='empty';p.textContent='No discoveries here yet. Try another filter or keep experimenting.';$('#ingredients').append(p);}$('#count').textContent=`${state.discovered.length} / ${ITEMS.length}`;}
function choose(id,index){if(merging||!has(id))return;if(index===undefined)index=selected[0]===null?0:selected[1]===null?1:0;selected[index]=id;renderSlots();}
function renderSlots(){selected.forEach((id,i)=>{const b=$(`#slot-${i}`);b.classList.toggle('filled',!!id);b.innerHTML=id?`<span style="color:${colors[byId[id].category]}">${byId[id].glyph}</span><small>${byId[id].name}</small>`:`<span>+</span><small>${i?'Second':'First'} ingredient</small>`;b.setAttribute('aria-label',id?`${byId[id].name}, click to remove`:`Choose ${i?'second':'first'} ingredient`);});$('#combine').disabled=merging||selected.some(x=>!x);$('.mixing').classList.toggle('ready',selected.every(Boolean));$('.mixing').classList.toggle('occupied',selected.some(Boolean));}
function recipeFor(a,b){return RECIPES.find(r=>(r[0]===a&&r[1]===b)||(r[0]===b&&r[1]===a));}
function playTone(){if(!state.sound)return;try{audioContext??=new(window.AudioContext||window.webkitAudioContext)();audioContext.resume();[392,523.25,659.25].forEach((freq,i)=>{const o=audioContext.createOscillator(),g=audioContext.createGain(),t=audioContext.currentTime+i*.09;o.type='sine';o.frequency.value=freq;g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(.04,t+.025);g.gain.exponentialRampToValueAtTime(.001,t+.6);o.connect(g);g.connect(audioContext.destination);o.start(t);o.stop(t+.65);});}catch(e){}}
async function combine(){if(merging||selected.some(x=>!x))return;merging=true;renderSlots();$('.mixing').classList.add('merging');await new Promise(resolve=>setTimeout(resolve,state.reduced?0:540));$('.mixing').classList.remove('merging');merging=false;renderSlots();const r=recipeFor(...selected);if(!r){failedMerge();say('Nothing new this time. Try a different pairing — curiosity costs nothing.');return;}if(has(r[2])){selected=[r[2],null];renderSlots();revealDiscovery(r[2],false);say(`Rediscovered ${byId[r[2]].name}. Keep experimenting!`);return;}state.discovered.push(r[2]);fresh=r[2];hintTarget=null;hintLevel=0;selected=[r[2],null];if(r[2]==='planet'||r[2]==='ocean'||r[2]==='biosphere')view='planet';save();render();revealDiscovery(r[2],true);say(`Discovered ${byId[r[2]].name}! ${byId[r[0]].name} + ${byId[r[1]].name}`,true);playTone();if(r[2]==='biosphere'&&!state.completed){state.completed=true;save();$('#completion-detail').textContent=`${state.name} is alive. You have found ${state.discovered.length} of ${ITEMS.length} discoveries.`;pendingCompletion=true;}flushFormationEffects();}
function renderSceneText(){
 const phase=FormationModel.profile(state.discovered,view,observing).phase;
 const stageArt={seed:['A universe, waiting to happen','Energy, before the first structures.'],bang:['The first expansion','A diffuse beginning, still unfolding.'],expansion:['An expanding universe','Energy and matter spread into the dark.'],cooling:['A cooling universe','The first structures have yet to form.'],hydrogen:['The raw material of stars','Hydrogen gathers into cold diffuse gas.'],cloud:['A cold gas cloud','Gravity collects denser knots of material.'],protostar:['Your first protostar','A contracting cloud surrounds a hot center.'],star:['Your first star','Fusion sustains a new light in the dark.'],dust:['Stardust and new possibilities','Stellar material carries the ingredients of worlds.'],disk:['A planetary disk','Gas and grains circle the star.'],rock:['The building blocks of worlds','Rocky clumps collect inside the disk.']};
 const art=has('planet')?(has('ocean')?['An ocean of possibility','Your world is becoming a home.']:['A world made of stardust','A new world beside its parent star.']):stageArt[phase];
 settledArt=art;$('#art-title').textContent=art[0];$('#art-subtitle').textContent=art[1];
let stage=has('biosphere')?4:has('cell')?3:has('planet')?2:has('star')?1:0;const titles=['Everything starts<br>with a little nothing.','A light in<br>the endless dark.','A world waiting<br>to become something.','The smallest life.<br>The biggest beginning.','A little world.<br>Brimming with possibility.'];const descriptions=['An empty canvas. A few possibilities.<br>What will you bring into existence?','From a cloud of possibility, a star.<br>Everything that follows begins here.','Give it oceans. Give it chemistry.<br>Give the extraordinary a place to begin.','A boundary. A little chemistry. A beginning.<br>Help your first life find its place.','You made a home for life.<br>Imagine what it could become.'];$('#scene-title').innerHTML=titles[stage];$('#scene-description').innerHTML=descriptions[stage];$('#chapter-label').textContent=['CHAPTER 01 · THE BEGINNING','CHAPTER 01 · FIRST LIGHT','CHAPTER 01 · A NEW WORLD','CHAPTER 01 · LIFE AWAKENS','CHAPTER 01 · A LIVING OCEAN'][stage];$('#scene-caption').textContent=has('biosphere')?'An entire beginning, made by you.':has('microbes')?'Tiny colonies. An ocean of possibility.':has('ocean')?'Water has found a home.':has('planet')?'Stardust, becoming somewhere.':has('star')?'Your first star is shining.':has('bang')?'There is something where there was nothing.':'The quiet before everything.';$('#planet-view').disabled=!has('planet');$('#planet-view').textContent='Planet'+(!has('planet')?' ◇':'');$('#planet-view').classList.toggle('active',view==='planet');$('#cosmic-view').classList.toggle('active',view==='universe');$('#world-label').hidden=!(view==='planet'&&has('planet'));$('#world-name').textContent=state.name;const milestones=['bang','star','planet','biosphere'];$$('[data-step]').forEach((el,i)=>el.classList.toggle('done',has(milestones[i])));$('#bench-guide').innerHTML=has('bang')?(has('biosphere')?'Your ocean is alive. Explore any discoveries you missed.':'Follow your curiosity. Every discovery opens another door.'):'Try combining <strong>Energy</strong> and <strong>Possibility</strong>.';syncFormation();}
function render(){document.body.classList.toggle('reduced-motion',state.reduced);renderCollection();renderSlots();renderSceneText();renderExplorer();renderLifeProgress();renderTimeline();draw(performance.now());}
function confirmAction(message){return new Promise(resolve=>{const d=document.createElement('dialog'),p=document.createElement('p'),yes=document.createElement('button'),no=document.createElement('button');p.textContent=message;yes.textContent='Confirm';yes.className='primary';no.textContent='Cancel';no.style.marginLeft='12px';d.append(p,yes,no);document.body.append(d);const finish=value=>{d.close();d.remove();resolve(value);};yes.onclick=()=>finish(true);no.onclick=()=>finish(false);d.oncancel=e=>{e.preventDefault();finish(false);};d.showModal();no.focus();});} function showJournal(){const list=$('#journal-list');list.replaceChildren();for(const id of [...state.discovered].reverse()){const item=byId[id],r=RECIPES.find(r=>r[2]===id),entry=document.createElement('article');entry.className='journal-entry';entry.innerHTML=`<h3><span style="color:${colors[item.category]}">${item.glyph}</span> ${item.name} <span class="science-tag">${item.science}</span></h3><span class="recipe">${r?`${byId[r[0]].name} + ${byId[r[1]].name}`:'Starting ingredient'}</span><p>${item.note}</p>`;list.append(entry);}$('#journal').showModal();}
$('#combine').onclick=combine;$('#clear').onclick=()=>{if(merging)return;selected=[null,null];renderSlots();say('A clean slate. What will you try?');};$('#search').oninput=renderCollection;
$$('[data-filter]').forEach(b=>b.onclick=()=>{filter=b.dataset.filter;$$('[data-filter]').forEach(x=>x.classList.toggle('active',x===b));renderCollection();});
for(let i=0;i<2;i++){const slot=$(`#slot-${i}`);slot.addEventListener('pointerdown',e=>{if(selected[i])beginDrag(e,selected[i],i);});slot.onclick=()=>{if(merging||suppressClick)return;if(selected[i]){selected[i]=null;renderSlots();}else{$('#search').focus();say('Choose an ingredient from your collection.');}};slot.ondragover=e=>{e.preventDefault();slot.classList.add('dragover');};slot.ondragleave=()=>slot.classList.remove('dragover');slot.ondrop=e=>{e.preventDefault();slot.classList.remove('dragover');choose(e.dataTransfer.getData('text/plain'),i);};}
$('#hint').onclick=()=>{if(merging)return;const next=RECIPES.find(r=>!has(r[2])&&has(r[0])&&has(r[1]));if(!next){say('You discovered everything in Chapter One. Your universe is complete!',true);return;}if(hintTarget!==next[2]){hintTarget=next[2];hintLevel=0;}hintLevel++;if(hintLevel===1)say(`A nudge: ${byId[next[0]].name} could help you discover ${byId[next[2]].name}. Tap again for the pairing.`);else{say(`Try ${byId[next[0]].name} + ${byId[next[1]].name}. The cradle is ready.`);selected=next.slice(0,2);renderSlots();}};
$('#cosmic-view').onclick=()=>{setExploring(false);view='universe';renderSceneText();draw(performance.now());};$('#planet-view').onclick=()=>{if(has('planet')){view='planet';renderSceneText();draw(performance.now());}};
$('#journal-open').onclick=showJournal;$('#how-open').onclick=()=>$('#how').showModal();function openSettings(){$('#name-input').value=state.name;$('#sound').checked=state.sound;$('#motion').checked=state.reduced;$('#settings-feedback').textContent='';$('#settings').showModal();}$('#settings-open').onclick=()=>{if(!merging)openSettings();};$('#rename-world').onclick=openSettings;
$$('[data-close]').forEach(b=>b.onclick=()=>b.closest('dialog').close());$$('dialog').forEach(d=>d.addEventListener('close',()=>queueMicrotask(flushFormationEffects)));$$('dialog').forEach(d=>d.addEventListener('click',e=>{if(e.target===d){const r=d.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)d.close();}}));
$('#save-name').onclick=()=>{state.name=$('#name-input').value.trim().slice(0,30)||'Pale Blue';save();renderSceneText();renderExplorer();$('#settings-feedback').textContent='Your world has a name: '+state.name;};$('#sound').onchange=e=>{state.sound=e.target.checked;save();if(state.sound)playTone();};$('#motion').onchange=e=>{state.reduced=e.target.checked;if(state.reduced)formation.finish(performance.now());document.body.classList.toggle('reduced-motion',state.reduced);save();draw(performance.now());};
$('#reset').onclick=async()=>{if(!await confirmAction('Start over? Your current discoveries will be erased. You can export progress first.'))return;cancelFormationEffects();setExploring(false);scenePulse=null;state=defaultState();formation.reset(FormationModel.profile(state.discovered,'universe'),performance.now());selected=[null,null];fresh=null;filter='All';view='universe';hintTarget=null;hintLevel=0;$('#search').value='';$$('[data-filter]').forEach(b=>b.classList.toggle('active',b.dataset.filter==='All'));save();render();$('#settings').close();say('A new beginning. Try Energy + Possibility.');};
$('#export-save').onclick=()=>{const blob=new Blob([JSON.stringify(state,null,2)],{type:'application/json'}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download='first-spark-progress.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);$('#settings-feedback').textContent='Progress exported.';};$('#import-save').onchange=async e=>{const file=e.target.files[0];if(!file)return;try{if(file.size>100000)throw Error('This file is too large to be a progress save.');const next=validate(JSON.parse(await file.text()));if(!await confirmAction('Replace your current progress with this save?'))return;cancelFormationEffects();setExploring(false);scenePulse=null;state=next;formation.reset(FormationModel.profile(state.discovered,has('planet')?'planet':'universe'),performance.now());selected=[null,null];fresh=null;hintTarget=null;hintLevel=0;view=has('planet')?'planet':'universe';save();render();$('#name-input').value=state.name;$('#sound').checked=state.sound;$('#motion').checked=state.reduced;$('#settings-feedback').textContent='Progress restored.';}catch(err){$('#settings-feedback').textContent='Could not import: '+err.message;}finally{e.target.value='';}};
document.addEventListener('keydown',e=>{if(e.key==='/'&&!$('dialog[open]')&&!['INPUT','TEXTAREA'].includes(document.activeElement.tagName)){e.preventDefault();$('#search').focus();}});
const phaseLabels={seed:['A quiet beginning','Energy, before the first structures.'],bang:['The first expansion','Energy spreads into a diffuse, cooling beginning.'],expansion:['Space is expanding','The glowing material spreads and cools.'],cooling:['The universe cools','Diffuse matter becomes quieter and cooler.'],hydrogen:['Gas begins to gather','Hydrogen gives the cloud its raw material.'],cloud:['Gravity gathers a cloud','Cold gas and dust collect into denser knots.'],protostar:['A protostar is taking shape','The cloud contracts; its center grows hotter.'],star:['Fusion is igniting','A hot core brightens as the surrounding cloud clears.'],dust:['Stardust fills the scene','Enriched material spreads around the star.'],disk:['A planetary disk is forming','Gas and grains settle into a broad, rotating disk.'],rock:['Grains gather into rock','Irregular clumps begin to collect in the disk.'],planet:['A world is coming together','Disk material collects into a distinct rocky body.']};
function syncFormation(){
 const now=performance.now(),next=FormationModel.profile(state.discovered,view,observing),old=formation.target;
 let duration=next.phase==='star'?6200:next.phase==='planet'?6000:next.phase==='protostar'?5200:4200;
 if(next.phase===formation.phase){if(next.values.focus!==old.focus||next.values.inspection!==old.inspection)duration=1700;else if(next.values.ocean!==old.ocean)duration=3600;else if(next.values.atmosphere!==old.atmosphere)duration=2800;else if(next.values.life!==old.life)duration=3000;}
 const before=formation.sample(now);
 if(formation.retarget(next,now,state.reduced?0:duration)){
 if(next.values.focus===old.focus&&next.values.inspection===old.inspection||next.phase!==formation.phase||next.values.planet!==old.planet){replayFrom={phase:next.phase,values:before};replayTo=next;}
 let label=phaseLabels[next.phase];if(next.values.ocean!==old.ocean)label=['An ocean is gathering','Water spreads over the same cooling rocky world.'];else if(next.values.atmosphere!==old.atmosphere)label=['An atmosphere is gathering','A faint envelope slowly thickens around your world.'];else if(next.values.life!==old.life)label=['Life is finding a foothold','Microbial color gradually spreads along the coasts.'];else if((next.values.focus!==old.focus||next.values.inspection!==old.inspection)&&next.phase===formation.phase&&old.planet===next.values.planet)label=['Following your world','The camera moves gently between star and planet.'];
 formation.label=label;$('#formation-status').textContent=label[1];
 }
}
function formationUI(now){
 const active=formation.active(now)&&!state.reduced,scene=$('.universe');scene.dataset.phase=formation.phase;scene.dataset.forming=String(active);
 $('#formation-panel').hidden=!active;$('#replay-formation').textContent=state.reduced?'Enable animations':active?'↻ Restart formation':'↻ Watch formation';$('.scene-art-caption').classList.toggle('forming',active);$('#art-subtitle').hidden=active;
 const title=active?(formation.label||phaseLabels[formation.phase])[0]:settledArt[0];if($('#art-title').textContent!==title)$('#art-title').textContent=title;
 $('#formation-progress').value=Math.round(formation.progress(now)*100);
}
function cancelFormationEffects(){$('#event-message').textContent='A world of possibilities awaits.';$('#clock-event').textContent='A world in motion';clearTimeout(worldEffectTimer);worldRunning=false;worldElapsed=0;worldEffect=null;replayFrom=null;replayTo=null;pendingReveal=null;pendingCompletion=false;clearTimeout(revealTimer);$('#discovery-reveal').classList.remove('show');}
function flushFormationEffects(){if(formation.active(performance.now())&&!state.reduced)return;if(pendingReveal){const item=pendingReveal;pendingReveal=null;revealDiscovery(item.id,item.isNew,true);}if(pendingCompletion&&!$('dialog[open]')){pendingCompletion=false;$('#completion').showModal();}}

function renderTimeline(){
 const w=state.world,enabled=has('planet');if(!enabled||w.year===0){$('#event-message').textContent='A world of possibilities awaits.';$('#clock-event').textContent='A world in motion';}else if($('#event-message').textContent==='A world of possibilities awaits.'){const e=w.history.at(-1);$('#event-message').textContent=e?'Last event · Year '+e.year.toLocaleString()+': '+WorldHistory.events[e.type].title+'. '+WorldHistory.events[e.type].detail:'Your world is taking its first steps through time.';$('#clock-event').textContent=e?WorldHistory.events[e.type].title:'A world in motion';}$('#year-label').textContent=enabled?'Year '+w.year.toLocaleString():'Time begins with a planet.';
 $('#time-description').textContent=enabled?(worldRunning?'Time is running · 1,000 years every 8 seconds':'Time is paused · advance when you are ready'):'Create a planet to begin its history.';
 $('#watch-world').disabled=!enabled;$('#world-clock').hidden=!exploring;$('#clock-year').textContent='Year '+w.year.toLocaleString();$('#clock-run').textContent=worldRunning?'Ⅱ Pause':'▶ Run';$('#clock-step').disabled=formation.active(performance.now());$('#advance-time').disabled=!enabled||formation.active(performance.now());$('#play-time').disabled=!enabled;$('#play-time').textContent=worldRunning?'Ⅱ Pause time':'▶ Run time';$('#play-time').setAttribute('aria-pressed',String(worldRunning));
 $('#world-vitals').replaceChildren();if(enabled)for(const [label,value]of [['Surface warmth',w.heat],['Available minerals',w.nutrients],['Oxygenation',w.oxygen]]){const el=document.createElement('div');const title=document.createElement('span');title.textContent=label;const number=document.createElement('b');number.textContent=Math.round(value)+' / 100';title.append(number);const bar=document.createElement('meter');bar.min=0;bar.max=100;bar.value=value;bar.setAttribute('aria-label',label);el.append(title,bar);$('#world-vitals').append(el);}
 $('#species-list').replaceChildren();for(const id of w.species){const a=document.createElement('article'),h=document.createElement('h3'),p=document.createElement('p');h.textContent=WorldHistory.lineages[id].name;p.textContent=WorldHistory.lineages[id].detail;a.append(h,p);$('#species-list').append(a);}
 if(enabled&&!w.species.length){const p=document.createElement('p');p.textContent='Discover cells, oceans, and energy sources. Then advance time to see microbial lineages adapt.';$('#species-list').append(p);}
}
function advanceWorld(){
 if(!has('planet')||formation.active(performance.now()))return;
 const result=WorldHistory.advance(state.world,state.discovered);state.world=result.s;
 let message='Year '+state.world.year.toLocaleString()+': your world continues to change.';
 if(result.event){const event=WorldHistory.events[result.event.type];message=event.title+'. '+event.detail;worldEffect={type:result.event.type,start:performance.now()};clearTimeout(worldEffectTimer);worldEffectTimer=setTimeout(()=>{worldEffect=null;draw(performance.now());},8000);view='planet';renderSceneText();}
 if(result.evolved.length)message+=' New lineage: '+result.evolved.map(id=>WorldHistory.lineages[id].name).join(', ')+'.';
 $('#event-message').textContent=message;$('#clock-event').textContent=result.event?WorldHistory.events[result.event.type].title:result.evolved.length?'A new lineage emerges':'A quieter passage of time';save();renderTimeline();draw(performance.now());
}
$('#advance-time').onclick=advanceWorld;$('#clock-step').onclick=advanceWorld;$('#clock-run').onclick=()=>$('#play-time').click();$('#watch-world').onclick=()=>{setExploring(true);$('.universe').scrollIntoView({behavior:state.reduced?'instant':'smooth',block:'start'});};
$('#play-time').onclick=()=>{worldRunning=!worldRunning;worldElapsed=0;renderTimeline();};
$('#history-open').onclick=()=>{const list=$('#history-list');list.replaceChildren();for(const e of [...state.world.history].reverse()){const row=document.createElement('article'),h=document.createElement('h3'),p=document.createElement('p');h.textContent='Year '+e.year.toLocaleString()+' · '+WorldHistory.events[e.type].title;p.textContent=WorldHistory.events[e.type].detail;row.append(h,p);list.append(row);}if(!state.world.history.length)list.textContent='No events yet. A new event arrives every 3,000 world years.';$('#history-dialog').showModal();};
$('#replay-formation').onclick=()=>{
 if(state.reduced){state.reduced=false;$('#motion').checked=false;document.body.classList.remove('reduced-motion');save();}
 const now=performance.now();if(replayFrom&&replayTo){const pose=FormationModel.profile(state.discovered,view,observing).values;formation.reset({phase:replayFrom.phase,values:{...replayFrom.values,focus:pose.focus,inspection:pose.inspection}},now);formation.retarget({phase:replayTo.phase,values:{...replayTo.values,focus:pose.focus,inspection:pose.inspection}},now,6200);}else{const target=FormationModel.profile(state.discovered,view,observing),from={phase:target.phase,values:{...target.values}};if(has('planet')){from.values.planet=.03;from.values.planetSize=.04;from.values.dust=.95;from.values.disk=1;}else if(has('star')){from.values.star=.03;from.values.starSize=.05;from.values.gas=.95;from.values.gasSize=1.6;}else{from.values.gas=.03;from.values.gasSize=.3;from.values.core=.02;}formation.reset(from,now);formation.retarget(target,now,6200);}formation.label=phaseLabels[formation.phase];$('#formation-status').textContent=formation.label[1];draw(now);
};

function renderLifeProgress(){const n=lifeExpansion.filter(has).length;$('#life-path-open').textContent=`Life pathways · ${n} / ${lifeExpansion.length}`;}
function openLifePaths(){
 const groups=[['The ingredients','Nitrogen, minerals, and the chemistry life can use.',['nitrogen','phosphate','sulfur','ammonia','co2']],['Proteins & energy','From amino acids to chemistry that powers a cell.',['aminoacids','peptides','proteins','enzymes','atp','metabolism','transport','fermentation']],['Genetic chemistry','Sugars and bases become the building blocks of information.',['sugars','nucleobases','nucleosides','nucleotides','rna','dna']],['Living communities','Microbes begin to build a shared home.',['biofilm']]];
 const list=$('#life-path-list');list.replaceChildren();
 for(const[title,description,ids]of groups){const card=document.createElement('article');card.className='life-path-card';const h=document.createElement('h3');h.textContent=title;const p=document.createElement('p');p.textContent=description;const progress=document.createElement('small');progress.textContent=`${ids.filter(has).length} / ${ids.length} discovered`;const tokens=document.createElement('div');tokens.className='path-tokens';for(const id of ids){const token=document.createElement('span');token.classList.toggle('unlocked',has(id));token.textContent=byId[id].name;tokens.append(token);}card.append(h,p,progress,tokens);
 const next=RECIPES.find(r=>ids.includes(r[2])&&!has(r[2])&&has(r[0])&&has(r[1]));if(next){const b=document.createElement('button');b.className='primary';b.textContent='Prepare '+byId[next[2]].name;b.onclick=()=>{if(merging)return;filter='All';$('#search').value='';$$('[data-filter]').forEach(x=>x.classList.toggle('active',x.dataset.filter==='All'));selected=next.slice(0,2);renderCollection();renderSlots();$('#life-paths').close();say(`Ready: ${byId[next[0]].name} + ${byId[next[1]].name}. Press Merge.`);$('#combine').focus();};card.append(b);}else if(ids.every(has)){const done=document.createElement('p');done.textContent='Pathway complete';done.className='path-complete';card.append(done);}else{const hint=document.createElement('p');hint.className='path-locked';const missing=RECIPES.find(r=>ids.includes(r[2])&&!has(r[2]));hint.textContent=missing?`Next: discover ${byId[missing[0]].name} and ${byId[missing[1]].name}.`:'Keep discovering.';card.append(hint);}list.append(card);
 }$('#life-paths').showModal();
}
$('#life-path-open').onclick=()=>{if(!merging)openLifePaths();};

// Exploration is a temporary camera mode; it never changes saved progress.
function renderExplorer(){
 $('#world-controls').hidden=!has('planet')||exploring;
 $('#explorer').hidden=!exploring;
 $('#explorer-name').textContent=state.name;
 if(!has(inspected))inspected='planet';
 const list=$('#world-features');list.replaceChildren();
 for(const id of worldFeatures.filter(has)){
  const b=document.createElement('button');b.textContent=byId[id].glyph+' '+byId[id].name;
  b.setAttribute('aria-pressed',String(id===inspected));
  b.onclick=()=>{inspected=id;scenePulse={start:performance.now(),color:colors[byId[id].category]};renderExplorer();draw(performance.now());};list.append(b);
 }
 const item=byId[inspected];$('#feature-detail').replaceChildren();
 const title=document.createElement('h3'),note=document.createElement('p');title.textContent=item.name;note.textContent=item.note;$('#feature-detail').append(title,note);
}
function resetCamera(){targetCamera={zoom:1,x:0,y:0};if(state.reduced)camera={...targetCamera};updateCamera();}
function setExploring(value){
 exploring=value&&has('planet');observing=exploring;$('.universe').classList.toggle('observing',observing);$('#observe-scene').setAttribute('aria-pressed',String(observing));$('.universe').classList.toggle('exploring',exploring);
 if(exploring){view='planet';resetCamera();}else resetCamera();
 if(exploring){clearTimeout(revealTimer);$('#discovery-reveal').classList.remove('show');}cameraDrag=null;renderSceneText();renderExplorer();renderTimeline();draw(performance.now());
}
function updateCamera(){
 const limit=(targetCamera.zoom-1)*Math.min(width,height)*.25;
 targetCamera.x=clamp(targetCamera.x,-limit,limit);targetCamera.y=clamp(targetCamera.y,-limit,limit);
 if(state.reduced)camera={...targetCamera};
 $('#zoom-level').textContent=Math.round(targetCamera.zoom*100)+'%';
 $('#zoom-in').disabled=targetCamera.zoom>=3.5;$('#zoom-out').disabled=targetCamera.zoom<=1;
 draw(performance.now());
}
function zoomWorld(delta){targetCamera.zoom=clamp(Math.round((targetCamera.zoom+delta)*100)/100,1,3.5);updateCamera();}
$('#observe-scene').onclick=()=>{
 if(observing){setExploring(false);resetCamera();return;}
 if(has('planet')){setExploring(true);return;}
 observing=true;$('.universe').classList.add('observing');$('#observe-scene').setAttribute('aria-pressed','true');resetCamera();renderSceneText();draw(performance.now());
};
$('#explore-world').onclick=()=>{setExploring(true);$('#leave-world').focus();};
$('#leave-world').onclick=()=>{setExploring(false);$('#explore-world').focus();};
$('#zoom-in').onclick=()=>zoomWorld(.25);$('#zoom-out').onclick=()=>zoomWorld(-.25);$('#reset-camera').onclick=resetCamera;
$('#cosmos').addEventListener('wheel',e=>{if(!observing)return;e.preventDefault();zoomWorld(e.deltaY<0?.12:-.12);},{passive:false});
$('#cosmos').addEventListener('pointerdown',e=>{if(!observing||e.button!==0)return;cameraDrag={pointer:e.pointerId,x:e.clientX,y:e.clientY};e.currentTarget.setPointerCapture(e.pointerId);});
$('#cosmos').addEventListener('pointermove',e=>{if(!cameraDrag||cameraDrag.pointer!==e.pointerId)return;targetCamera.x+=e.clientX-cameraDrag.x;targetCamera.y+=e.clientY-cameraDrag.y;cameraDrag.x=e.clientX;cameraDrag.y=e.clientY;updateCamera();});
for(const event of ['pointerup','pointercancel','lostpointercapture'])$('#cosmos').addEventListener(event,e=>{if(cameraDrag?.pointer!==e.pointerId)return;cameraDrag=null;if(e.currentTarget.hasPointerCapture(e.pointerId))e.currentTarget.releasePointerCapture(e.pointerId);});
document.addEventListener('keydown',e=>{if($('dialog[open]')||['INPUT','TEXTAREA'].includes(document.activeElement.tagName))return;if(e.key==='Escape'&&observing){setExploring(false);resetCamera();$('#observe-scene').focus();}else if(['+','=','-','0'].includes(e.key)){e.preventDefault();if(e.key==='0')resetCamera();else zoomWorld(e.key==='-'?-.25:.25);}});

// Pointer-driven merging supports mouse, pen, touch, and keyboard alternatives.
$('.universe').append($('.workbench'));
$('.mixing').setAttribute('aria-label','Creation field: drop ingredients together');
$('.mixing').insertAdjacentHTML('afterbegin','<div class="field-rings" aria-hidden="true"><i></i><i></i><i></i></div><span class="field-label">DRAG ONE INTO THE OTHER</span>');
let revealTimer;
function beginDrag(e,id,slot){
 if(merging||e.button!==0||!has(id))return;
 const origin=e.currentTarget;
 dragging={id,slot,origin,pointer:e.pointerId,x:e.clientX,y:e.clientY,active:false,ghost:null};
 origin.setPointerCapture(e.pointerId);
 origin.addEventListener('pointermove',moveDrag);
 origin.addEventListener('pointerup',endDrag);
 origin.addEventListener('pointercancel',cancelDrag);
}
function moveDrag(e){
 if(!dragging||e.pointerId!==dragging.pointer)return;
 const d=dragging;
 if(!d.active&&Math.hypot(e.clientX-d.x,e.clientY-d.y)<7)return;
 if(!d.active){d.active=true;suppressClick=true;d.ghost=document.createElement('div');d.ghost.className='drag-orb';d.ghost.innerHTML=`<span>${byId[d.id].glyph}</span><small>${byId[d.id].name}</small>`;d.ghost.style.setProperty('--orb-color',colors[byId[d.id].category]);document.body.append(d.ghost);d.origin.classList.add('is-dragging');document.body.classList.add('is-grabbing');}
 e.preventDefault();d.ghost.style.left=e.clientX+'px';d.ghost.style.top=e.clientY+'px';
 const field=$('.mixing').getBoundingClientRect();const inside=e.clientX>=field.left&&e.clientX<=field.right&&e.clientY>=field.top&&e.clientY<=field.bottom;
 $('.mixing').classList.toggle('drag-over',inside);
 for(let i=0;i<2;i++){const r=$(`#slot-${i}`).getBoundingClientRect();const close=selected[i]&&i!==d.slot&&Math.hypot(e.clientX-r.left-r.width/2,e.clientY-r.top-r.height/2)<r.width*.9;$(`#slot-${i}`).classList.toggle('magnetic',!!close&&inside);}
}
function cleanupDrag(){if(!dragging)return;const d=dragging;d.ghost?.remove();d.origin.classList.remove('is-dragging');d.origin.removeEventListener('pointermove',moveDrag);d.origin.removeEventListener('pointerup',endDrag);d.origin.removeEventListener('pointercancel',cancelDrag);if(d.origin.hasPointerCapture(d.pointer))d.origin.releasePointerCapture(d.pointer);document.body.classList.remove('is-grabbing');$('.mixing').classList.remove('drag-over');$$('.magnetic').forEach(x=>x.classList.remove('magnetic'));dragging=null;setTimeout(()=>suppressClick=false,0);}
function cancelDrag(){cleanupDrag();}
function endDrag(e){
 if(!dragging||e.pointerId!==dragging.pointer)return;const d=dragging;
 if(!d.active){cleanupDrag();return;}
 const field=$('.mixing').getBoundingClientRect();const inside=e.clientX>=field.left&&e.clientX<=field.right&&e.clientY>=field.top&&e.clientY<=field.bottom;
 let target=-1;for(let i=0;i<2;i++){const r=$(`#slot-${i}`).getBoundingClientRect();if(selected[i]&&i!==d.slot&&Math.hypot(e.clientX-r.left-r.width/2,e.clientY-r.top-r.height/2)<r.width*.9)target=i;}
 cleanupDrag();
 if(!inside){say('Drop ingredients inside the glowing creation field.');return;}
 if(target!==-1){if(d.slot===null)selected[1-target]=d.id;renderSlots();combine();}
 else if(d.slot===null){const empty=selected.indexOf(null);choose(d.id,empty!==-1?empty:(e.clientX<field.left+field.width/2?0:1));say('Now drag another ingredient onto this one, or choose two and press Merge.');}
}
function failedMerge(){const field=$('.mixing');field.classList.remove('no-match');void field.offsetWidth;field.classList.add('no-match');setTimeout(()=>field.classList.remove('no-match'),650);}
function revealDiscovery(id,isNew,settled=false){
 if(!settled&&formation.active(performance.now())&&!state.reduced){pendingReveal={id,isNew};return;}
 const item=byId[id],el=$('#discovery-reveal');clearTimeout(revealTimer);el.classList.remove('show');el.style.setProperty('--reveal-color',colors[item.category]);el.innerHTML=`<span class="reveal-symbol">${item.glyph}</span><div><span class="eyebrow">${isNew?'NEW DISCOVERY':'FOUND AGAIN'}</span><strong>${item.name}</strong><small>${item.category} · ${state.discovered.length} / ${ITEMS.length} discoveries</small></div>`;void el.offsetWidth;el.classList.add('show');revealTimer=setTimeout(()=>el.classList.remove('show'),3600);
 const box=$('.mixing').getBoundingClientRect(),scene=$('.universe').getBoundingClientRect();
 if(!state.reduced)for(let i=0;i<22;i++){const p=document.createElement('i'),angle=i*Math.PI*2/22;p.className='spark';p.style.cssText=`left:${box.left-scene.left+box.width/2}px;top:${box.top-scene.top+box.height/2}px;--dx:${Math.cos(angle)*(65+Math.random()*100)}px;--dy:${Math.sin(angle)*(40+Math.random()*85)}px;--spark-color:${colors[item.category]};animation-delay:${Math.random()*80}ms`;$('#merge-particles').append(p);setTimeout(()=>p.remove(),1200);}
}
document.addEventListener('keydown',e=>{if(e.key==='Escape')cancelDrag();});
// Locally hosted artwork: see ASSET_CREDITS.md for creators and licenses.
const canvas=$('#cosmos'),ctx=canvas.getContext('2d');let width=1,height=1;
const renderQuality={scale:1,slow:0,last:0};
function applyResolution(){const ratio=Math.min(devicePixelRatio||1,2)*renderQuality.scale;canvas.width=Math.round(width*ratio);canvas.height=Math.round(height*ratio);ctx.setTransform(ratio,0,0,ratio,0,0);}
const artwork={};let artRevision=0;
for(const [name,file] of Object.entries({nebula:'ai-nebula.webp',earth:'ai-ocean.webp',rocky:'ai-rocky.webp',sun:'ai-stellar.webp',gas:'ai-cold-cloud.webp'})){
 const img=new Image();artwork[name]=img;
 img.onload=()=>{artRevision++;draw(performance.now());};
 img.onerror=()=>{artwork[name]=null;draw(performance.now());};img.src='assets/'+file;
}
const ready=img=>img&&img.complete&&img.naturalWidth>0;
let seed=2718;const random=()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296;};
const stars=Array.from({length:95},()=>({x:random(),y:random(),r:random()*.8+.2,a:random(),phase:random()*6.28}));
function resize(){const rect=canvas.getBoundingClientRect();width=rect.width;height=rect.height;applyResolution();updateCamera();draw(performance.now());}new ResizeObserver(resize).observe(canvas);
const glowSprites=new Map();
function glow(x,y,r,inner,color){
 if(x+r<0||x-r>width||y+r<0||y-r>height)return;
 const key=inner+'|'+color;let sprite=glowSprites.get(key);
 if(!sprite){sprite=document.createElement('canvas');sprite.width=sprite.height=192;const g=sprite.getContext('2d'),gradient=g.createRadialGradient(96,96,0,96,96,96);gradient.addColorStop(0,inner);gradient.addColorStop(.3,color);gradient.addColorStop(1,'transparent');g.fillStyle=gradient;g.fillRect(0,0,192,192);glowSprites.set(key,sprite);if(glowSprites.size>32)glowSprites.delete(glowSprites.keys().next().value);}
 ctx.drawImage(sprite,x-r,y-r,r*2,r*2);
}

function circle(x,y,r,color){ctx.beginPath();ctx.arc(x,y,Math.max(0,r),0,Math.PI*2);ctx.fillStyle=color;ctx.fill();}
let backdrop=null,backdropKey='';
function paintNebula(t,visual){
 const key=[Math.round(width),Math.round(height),Math.round(visual.background*100),artRevision].join(':');
 if(!backdrop||backdropKey!==key){backdrop=document.createElement('canvas');backdrop.width=Math.round(width);backdrop.height=Math.round(height);const g=backdrop.getContext('2d');
 g.fillStyle='#070e1c';g.fillRect(0,0,width,height);
 if(ready(artwork.nebula)){
  const scale=Math.max(width/artwork.nebula.width,height*.8/artwork.nebula.height)*1.08;
  g.save();g.globalAlpha=visual.background;
  g.drawImage(artwork.nebula,width*.52-artwork.nebula.width*scale*.5+Math.sin(t*.08)*8,-height*.16,artwork.nebula.width*scale,artwork.nebula.height*scale);g.restore();
 }
 const shade=g.createLinearGradient(0,0,0,height);shade.addColorStop(0,'#09132622');shade.addColorStop(.48,'#09142638');shade.addColorStop(.68,'#080f1de8');shade.addColorStop(1,'#080f1d');g.fillStyle=shade;g.fillRect(0,0,width,height);
 const left=g.createLinearGradient(0,0,width,0);left.addColorStop(0,'#080f1dba');left.addColorStop(.55,'#080f1d22');left.addColorStop(1,'#080f1d00');g.fillStyle=left;g.fillRect(0,0,width,height);

 backdropKey=key;}
 ctx.drawImage(backdrop,0,0,width,height);
 for(const s of stars)circle(s.x*width,s.y*height,s.r,`rgba(205,227,248,${s.a*(.25+Math.sin(t*2+s.phase)*.08)})`);
}

const pixels=new WeakMap(),projections=new Map(),sphereFrames=new WeakMap();
function imagePixels(image){if(pixels.has(image))return pixels.get(image);const c=document.createElement('canvas');c.width=1024;c.height=512;const g=c.getContext('2d');g.drawImage(image,0,0,1024,512);const data=g.getImageData(0,0,1024,512).data;pixels.set(image,data);return data;}
function projection(size){
 if(projections.has(size))return projections.get(size);const out=[];
 for(let y=0;y<size;y++)for(let x=0;x<size;x++){const nx=(x+.5)*2/size-1,ny=(y+.5)*2/size-1,d=nx*nx+ny*ny;if(d>=1)continue;const nz=Math.sqrt(1-d),light=Math.max(.035,nx*-.48+ny*-.35+nz*.8);
 out.push({k:(y*size+x)*4,u:(Math.atan2(nx,nz)/(Math.PI*2)+.5)*1024,v:clamp(Math.floor((Math.asin(ny)/Math.PI+.5)*512),0,511),light:.12+light*.92,edge:Math.min(1,nz*14),shine:Math.pow(Math.max(0,nx*-.38+ny*-.38+nz*.84),45)});}
 projections.set(size,out);return out;
}
let nativeClouds=null;
function cloudPixels(){
 if(nativeClouds)return nativeClouds;const data=new Uint8Array(1024*512*4);
 for(let y=0;y<512;y++)for(let x=0;x<1024;x++){const u=x/1024*Math.PI*2,v=y/512*Math.PI;
 const n=Math.sin(u*5+Math.sin(v*8))*Math.cos(v*5)+.4*Math.sin(u*13-v*7)+.2*Math.cos(u*29+v*19);
 const c=clamp((n-.4)*190,0,255);data[(y*1024+x)*4]=c;
 }return nativeClouds=data;
}
function sphere(image,t,size,clouds=false,emissive=false,options={}){
 const cache=sphereFrames.get(image)||new Map();sphereFrames.set(image,cache);
 const key=[size,clouds,emissive].join(':'),cached=cache.get(key),now=performance.now();
 const offset=Math.floor(t*16)%1024,cloudOffset=Math.floor(t*4);
 const signature=[offset,cloudOffset,Math.round((options.blend||0)*100),Math.round((options.life||0)*100),Math.round((options.atmosphere||0)*100)].join(':');
 if(cached&&cached.revision===artRevision&&cached.signature===signature)return cached.canvas;
 const frame=cached?.canvas||document.createElement('canvas');if(!cached){frame.width=size;frame.height=size;}const g=cached?.context||frame.getContext('2d'),im=cached?.pixels||g.createImageData(size,size),map=imagePixels(image),second=options.secondary&&(options.blend||0)>.001?imagePixels(options.secondary):null,blend=options.blend||0,cloud=clouds?cloudPixels():null;
 for(const p of projection(size)){const u=(Math.floor(p.u)+offset+1024)%1024,source=(p.v*1024+u)*4;let alpha=0,cloudSource=0;
  if(cloud){cloudSource=(p.v*1024+(u+cloudOffset+1024)%1024)*4;alpha=Math.max(0,(cloud[cloudSource]-75)/180)*.65*(options.atmosphere||0);}
  const light=emissive?.8+p.light*.2:p.light,landMap=second||map;
  const elevation=second?Math.max(.02,Math.min(.78,(second[source]*.65+second[source+1]*.25-second[source+2]*.25)/190+.08)):0;
  const localBlend=second?FormationModel.smooth((blend-elevation)/.22):0;
  const land=options.life&&landMap[source]>landMap[source+2]*.78&&landMap[source+1]>landMap[source]*.92;
  for(let ch=0;ch<3;ch++){let value=map[source+ch];if(second)value=value*(1-localBlend)+second[source+ch]*localBlend;if(land&&options.life){value*=ch===0?1-options.life*.16:ch===1?1+options.life*.12:1-options.life*.10;}if(cloud)value=value*(1-alpha)+235*alpha;if(!emissive&&clouds&&map[source+2]>map[source]*1.15)value+=p.shine*65;im.data[p.k+ch]=Math.min(255,value*light);}
  im.data[p.k+3]=255*p.edge;
 }g.putImageData(im,0,0);cache.set(key,{canvas:frame,context:g,pixels:im,image,time:now,revision:artRevision,signature});return frame;
}
function drawPlanet(x,y,r,t,visual,mini=false){
 if(r<.3||!ready(artwork.rocky))return;
 glow(x,y,r*1.25,`rgba(100,190,235,${visual.atmosphere*.12})`,'#2174a30a');
 const image=visual.ocean>=.999&&ready(artwork.earth)?artwork.earth:artwork.rocky;
 const options={secondary:image===artwork.rocky&&ready(artwork.earth)?artwork.earth:null,blend:visual.ocean,life:visual.life,atmosphere:visual.atmosphere};
 ctx.save();ctx.globalAlpha=visual.planet;ctx.drawImage(sphere(image,t,mini?96:observing?416:304,true,false,options),x-r,y-r,r*2,r*2);ctx.restore();
 if(visual.atmosphere>.001){ctx.save();ctx.globalAlpha=visual.atmosphere*visual.planet;ctx.shadowBlur=mini?3:12;ctx.shadowColor='#7bc8ff';ctx.strokeStyle='#9bdaff70';ctx.lineWidth=mini?.7:1.5;ctx.beginPath();ctx.arc(x,y,r,Math.PI*.8,Math.PI*1.88);ctx.stroke();ctx.restore();}
}
function drawEmber(x,y,r,t,stellar=false){
 glow(x,y,r*3.2,stellar?'#ffb55888':'#efad6644','#b3573820');
 if(ready(artwork.sun))ctx.drawImage(sphere(artwork.sun,t,r<42?96:r<90?192:256,false,true),x-r,y-r,r*2,r*2);
 else circle(x,y,r,'#e9bb77');
 ctx.save();ctx.globalCompositeOperation='screen';
 const streak=ctx.createLinearGradient(x-r*3,y,x+r*3,y);streak.addColorStop(0,'transparent');streak.addColorStop(.5,stellar?'#ffe9bfaa':'#ffe7bd66');streak.addColorStop(1,'transparent');ctx.fillStyle=streak;ctx.fillRect(x-r*3,y-1,r*6,2);ctx.restore();
}
const grains=Array.from({length:100},()=>({angle:random()*Math.PI*2,radial:random(),lift:random()-.5,speed:.12+random()*.30,shade:random()}));
function drawColdGas(x,y,r,t,v){
 const strength=v.gas*(1-v.focus)*(1-v.focus);if(!ready(artwork.gas)||strength<.002)return;
 const seconds=t/.13,collapse=formation.active(performance.now())&&['cloud','protostar','star'].includes(formation.phase),size=r*v.gasSize*1.5;
 ctx.save();ctx.translate(x,y);ctx.scale(1,v.flatten);ctx.rotate(-.18+seconds*.035);
 ctx.globalAlpha=strength*.70;ctx.drawImage(artwork.gas,-size,-size,size*2,size*2);
 // Independently moving wisps deform the silhouette rather than scaling one picture.
 for(let i=0;i<5;i++){const a=i*2.399+seconds*(.09+i*.012),reach=size*(.13+.07*Math.sin(seconds*.5+i));ctx.save();ctx.translate(Math.cos(a)*reach,Math.sin(a)*reach);ctx.rotate(a*.35);ctx.globalAlpha=strength*.16;ctx.drawImage(artwork.gas,-size*.65,-size*.55,size*1.3,size*1.1);ctx.restore();}
 ctx.restore();ctx.save();ctx.lineCap='round';
 for(let i=0;i<grains.length;i++){const grain=grains[i],cycle=(grain.radial+seconds*(collapse?.20:.065))%1;const radial=r*v.gasSize*(collapse?1.7*(1-cycle)+.06:.3+cycle*1.35),angle=grain.angle+seconds*.24+cycle*1.7;
 const gx=x+Math.cos(angle)*radial,gy=y+Math.sin(angle)*radial*v.flatten*.68,fade=Math.sin(cycle*Math.PI);
 ctx.globalAlpha=strength*fade*(.25+grain.shade*.55);ctx.strokeStyle=collapse?'#d6ded2':'#9acbd5';ctx.lineWidth=.7+grain.shade;ctx.beginPath();ctx.moveTo(gx,gy);ctx.lineTo(gx+Math.cos(angle-.4)*(collapse?9:4),gy+Math.sin(angle-.4)*4*v.flatten);ctx.stroke();}
 ctx.restore();
}
function drawAccretion(x,y,px,py,r,t,v){
 if(v.disk+v.dust<.002)return;
 if(ready(artwork.gas)&&v.disk>.001){ctx.save();ctx.globalAlpha=v.disk*.17;ctx.translate(x,y);ctx.rotate(-.18);ctx.drawImage(artwork.gas,-r*1.95,-r*.39,r*3.9,r*.78);ctx.restore();}
 ctx.save();ctx.lineCap='round';
 for(const grain of grains){
 const angle=grain.angle+t*grain.speed*18,radial=r*(.65+grain.radial*1.25),settle=grain.radial>.35?FormationModel.smooth((v.planet-.05)/.95):0;
 const gx=x+Math.cos(angle)*radial,gy=y+Math.sin(angle)*radial*(.22+.20*(1-v.disk))+grain.lift*r*.15;
 const dx=gx+(px-gx)*settle,dy=gy+(py-gy)*settle;
 ctx.globalAlpha=v.dust*(.18+grain.shade*.5)*(1-settle);ctx.strokeStyle=grain.shade>.6?'#d8b891':'#86a8b4';ctx.lineWidth=.7+grain.shade*1.3;
 if(grain.shade>.76&&v.disk>.3){const size=(1.8+grain.shade*2.8)*(1-settle*.6);ctx.save();ctx.translate(dx,dy);ctx.rotate(angle);ctx.fillStyle=grain.shade>.9?'#a58a70':'#6f8491';ctx.beginPath();ctx.moveTo(-size,-size*.35);ctx.lineTo(-size*.15,-size*.75);ctx.lineTo(size*.8,-size*.2);ctx.lineTo(size*.5,size*.7);ctx.lineTo(-size*.6,size*.45);ctx.closePath();ctx.fill();ctx.restore();}
 ctx.beginPath();ctx.moveTo(dx,dy);ctx.lineTo(dx-Math.sin(angle)*(4+grain.shade*10),dy+Math.cos(angle)*(1+grain.shade*3));ctx.stroke();
 }ctx.restore();
}
function drawWorldEvent(x,y,r,now,v){
 if(!worldEffect||v.planet<.8||r<2)return;const elapsed=state.reduced?2:(now-worldEffect.start)/1000;if(elapsed>8){worldEffect=null;return;}
 const fade=state.reduced?.75:Math.min(1,elapsed*2,Math.max(0,(8-elapsed)/2));const type=worldEffect.type;
 ctx.save();ctx.globalAlpha=fade;
 if(type==='meteor'){const q=Math.min(1,elapsed/2),ax=x-r*2.3+q*r*2.6,ay=y-r*1.5+q*r*1.15;ctx.strokeStyle='#ffd9a5';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(ax-r*.35,ay-r*.16);ctx.lineTo(ax,ay);ctx.stroke();glow(ax,ay,r*.13,'#fff3bfcc','#f6a36400');if(q===1)glow(x+r*.3,y-r*.35,r*.3* Math.max(.1,1-(elapsed-2)/5),'#ffba6b88','#ff984400');}
 if(type==='volcano'){const vx=x-r*.28,vy=y-r*.40;
 // Shaded caldera and rough radial ridges sit within the planet's perspective.
 const rock=ctx.createRadialGradient(vx-r*.025,vy-r*.03,r*.015,vx,vy,r*.19);rock.addColorStop(0,'#665249');rock.addColorStop(.45,'#353d40');rock.addColorStop(1,'#283b3d00');ctx.fillStyle=rock;ctx.beginPath();ctx.ellipse(vx,vy+r*.03,r*.19,r*.12,-.3,0,Math.PI*2);ctx.fill();
 for(let ridge=0;ridge<15;ridge++){const a=ridge*2.399,extent=r*(.08+.06*(.5+.5*Math.sin(ridge*8)));ctx.strokeStyle=ridge%2?'#d1b6a326':'#0c1c2360';ctx.lineWidth=Math.max(.6,r*.006);ctx.beginPath();ctx.moveTo(vx+Math.cos(a)*r*.035,vy+Math.sin(a)*r*.02);ctx.quadraticCurveTo(vx+Math.cos(a+.12)*extent*.6,vy+Math.sin(a)*extent*.35,vx+Math.cos(a)*extent,vy+Math.sin(a)*extent*.65);ctx.stroke();}
 ctx.strokeStyle='#ff9a49';ctx.lineWidth=Math.max(1,r*.009);ctx.beginPath();ctx.moveTo(vx,vy);ctx.bezierCurveTo(vx+r*.025,vy+r*.04,vx-r*.02,vy+r*.08,vx+r*.07,vy+r*.10);ctx.stroke();ctx.fillStyle='#ffb96f';ctx.beginPath();ctx.ellipse(vx,vy-r*.012,r*.036,r*.017,-.3,0,Math.PI*2);ctx.fill();ctx.fillStyle='#6d2c22';ctx.beginPath();ctx.ellipse(vx,vy-r*.013,r*.022,r*.009,-.3,0,Math.PI*2);ctx.fill();glow(vx,vy,r*.28,'#ff9b3266','#fa5b2200');for(let i=0;i<44;i++){const q=(elapsed*.65+i*.071)%1,spread=Math.sin(i*12.3)*r*.34;const ex=vx+spread*q,ey=vy-r*(.9*q-.72*q*q);ctx.strokeStyle=i%3?'#ffb55c':'#ff683f';ctx.lineWidth=1.3;ctx.beginPath();ctx.moveTo(ex,ey);ctx.lineTo(ex-spread*.05,ey+r*.035);ctx.stroke();}for(let i=0;i<8;i++){const q=(elapsed*.17+i*.12)%1;glow(vx+Math.sin(i)*r*.13+q*r*.18,vy-q*r*.8,r*(.09+q*.20),'#98a3b34d','#66738100');}}
 ctx.beginPath();ctx.arc(x,y,r,0,Math.PI*2);ctx.clip();
 if(type==='rain'){ctx.strokeStyle='#9bdcffaa';ctx.lineWidth=1;for(let i=0;i<75;i++){const a=((i*.618)%1)*r*2-r,b=((i*.371+elapsed*.45)%1)*r*2-r;ctx.beginPath();ctx.moveTo(x+a,y+b);ctx.lineTo(x+a-r*.025,y+b+r*.09);ctx.stroke();}}
 if(type==='bloom'){for(let i=0;i<16;i++){const a=Math.sin(i*3.9)*r*.8,b=Math.cos(i*2.7)*r*.7;glow(x+a,y+b,r*(.05+.03*Math.sin(elapsed*2+i)),'#72e8bc66','#72e8bc00');}}
 if(type==='quiet'){ctx.strokeStyle='#b8dbe955';ctx.lineWidth=2;for(let i=0;i<3;i++){ctx.beginPath();ctx.ellipse(x,y,r*(.2+(elapsed*.08+i*.25)%1),r*.45,-.3,0,Math.PI*2);ctx.stroke();}}
 ctx.restore();
}
function draw(now){
 const drawStart=motionMetrics?performance.now():0;
 const interval=now-renderQuality.last;renderQuality.last=now;if(!state.reduced&&interval>78&&interval<500)renderQuality.slow++;else if(interval<55&&interval>12)renderQuality.slow=Math.max(0,renderQuality.slow-1);if(renderQuality.slow>=5&&renderQuality.scale>.6){renderQuality.scale=Math.max(.6,renderQuality.scale*.8);renderQuality.slow=0;applyResolution();}
 const ease=state.reduced?1:.16;for(const key of ['zoom','x','y'])camera[key]+=(targetCamera[key]-camera[key])*ease;
 const v=formation.sample(now),t=state.reduced?0:now*.00013,mobile=width<600;
 ctx.clearRect(0,0,width,height);paintNebula(t,v);
 const normalX=mobile?.38:.72,normalY=mobile?.38:.30;
 const cx=width*(normalX+(.5-normalX)*v.inspection)+camera.x,cy=height*(normalY+(.37+.07*v.focus-normalY)*v.inspection)+camera.y;
 const overviewRadius=Math.min(width*(mobile?.22:.17),height*.19),inspectRadius=Math.min(width*.29,height*.25);
 const base=overviewRadius+(inspectRadius-overviewRadius)*v.inspection,r=base*camera.zoom;
 const sx=cx-v.focus*r*1.55,sy=cy-v.focus*r*.15,px=cx+(1-v.focus)*r*1.25,py=cy+(1-v.focus)*r*.35;
 drawColdGas(sx,sy,r,t,v);
 const core=v.core*(1-v.focus*.85),coreRadius=r*(.2+core*.7);if(core>.002&&sx+coreRadius>0&&sx-coreRadius<width)glow(sx,sy,coreRadius,`rgba(255,207,143,${core*.45})`,`rgba(223,139,70,${core*.12})`);
 drawAccretion(sx,sy,px,py,r,t,v);
 const starRadius=r*v.starSize*(1-v.focus*.55);if(v.star>.002&&sx+starRadius*1.5>0&&sx-starRadius*1.5<width){ctx.save();ctx.globalAlpha=v.star*(1-v.focus*.65);drawEmber(sx,sy,starRadius,t,true);ctx.restore();}
 if(v.planet>.002)drawPlanet(px,py,r*v.planetSize*(.34+v.focus*.66),t,v,v.focus<.05);
 drawWorldEvent(px,py,r*v.planetSize*(.34+v.focus*.66),now,v);formationUI(now);if(has('planet')){$('#advance-time').disabled=formation.active(now);$('#clock-step').disabled=formation.active(now);}flushFormationEffects();
 if(motionMetrics){const stamp=performance.now();motionMetrics.renderScale=renderQuality.scale;motionMetrics.draws.push(stamp-drawStart);if(motionMetrics.last)motionMetrics.intervals.push(stamp-motionMetrics.last);motionMetrics.last=stamp;if(motionMetrics.draws.length>300)motionMetrics.draws.shift();if(motionMetrics.intervals.length>300)motionMetrics.intervals.shift();}
}

let last=0;function animate(time){const dt=Math.min(100,time-(worldLast||time));worldLast=time;if(worldRunning&&!document.hidden&&!$('dialog[open]')&&!formation.active(time)){worldElapsed+=dt;if(worldElapsed>=8000){worldElapsed=0;advanceWorld();}}if(!state.reduced&&!document.hidden&&time-last>16){draw(time);last=time;}requestAnimationFrame(animate);}save();render();requestAnimationFrame(animate);

})();
