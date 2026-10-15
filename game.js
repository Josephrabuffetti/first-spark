(() => {
'use strict';
const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];
const byId=Object.fromEntries(ITEMS.map(x=>[x.id,x]));
const key='first-spark-v1', starters=ITEMS.slice(0,4).map(x=>x.id);
const colors={Cosmos:'#e9c58b',World:'#9abff2',Life:'#a5e2be'};
const defaultState=()=>({version:1,discovered:[...starters],name:'Pale Blue',sound:false,reduced:matchMedia('(prefers-reduced-motion: reduce)').matches,completed:false});
let state=defaultState(), storageAvailable=true;
function validate(s){if(!s||s.version!==1||!Array.isArray(s.discovered)||s.discovered.some(x=>!byId[x])||!starters.every(x=>s.discovered.includes(x)))throw Error('This is not a valid First Spark save.');const found=new Set(starters);let changed=true;while(changed){changed=false;for(const [a,b,c] of RECIPES)if(s.discovered.includes(c)&&found.has(a)&&found.has(b)&&!found.has(c)){found.add(c);changed=true;}}if(s.discovered.some(x=>!found.has(x)))throw Error('This save contains discoveries without their ingredients.');return {version:1,discovered:[...new Set(s.discovered)],name:typeof s.name==='string'?s.name.slice(0,30).trim()||'Pale Blue':'Pale Blue',sound:!!s.sound,reduced:!!s.reduced,completed:!!s.completed&&s.discovered.includes('biosphere')};}
try{const saved=localStorage.getItem(key);if(saved)state=validate(JSON.parse(saved));}catch(e){storageAvailable=false;}
let selected=[null,null],filter='All',fresh=null,view='universe',hintTarget=null,hintLevel=0,audioContext;
let merging=false, dragging=null, suppressClick=false;
let observing=false;
let exploring=false, inspected='planet', camera={zoom:1,x:0,y:0}, targetCamera={zoom:1,x:0,y:0};
let worldChange=null, scenePulse=null, cameraDrag=null;
const worldFeatures=['planet','heat','volcano','atmosphere','ocean','minerals','vent','light','organics','cell','microbes','photosynthesis','cyanobacteria','biosphere'];
const clamp=(n,a,b)=>Math.max(a,Math.min(b,n));

const has=id=>state.discovered.includes(id);
function save(){try{localStorage.setItem(key,JSON.stringify(state));storageAvailable=true;}catch(e){storageAvailable=false;}$('#save-status').textContent=storageAvailable?'Saved on this browser':'Saving unavailable — export progress';}
function say(message,success=false){$('#feedback').textContent=message;$('#feedback').classList.toggle('success',success);}
function renderCollection(){const query=$('#search').value.trim().toLowerCase();const items=state.discovered.map(id=>byId[id]).filter(i=>(filter==='All'||i.category===filter)&&i.name.toLowerCase().includes(query));$('#ingredients').replaceChildren();for(const item of items){const b=document.createElement('button');b.className='ingredient'+(item.id===fresh?' fresh':'');b.draggable=false;b.dataset.ingredient=item.id;b.style.setProperty('--item-color',colors[item.category]);b.innerHTML=`<span class="glyph">${item.glyph}</span><span class="item-name">${item.name}</span>${item.id===fresh?'<span class="tag">NEW</span>':''}`;b.setAttribute('aria-label',`Add ${item.name} to cradle`);b.addEventListener('click',()=>{if(!suppressClick&&!merging)choose(item.id);});b.addEventListener('pointerdown',e=>beginDrag(e,item.id,null));b.addEventListener('dragstart',e=>{e.dataTransfer.setData('text/plain',item.id);e.dataTransfer.effectAllowed='copy';});$('#ingredients').append(b);}if(!items.length){const p=document.createElement('p');p.className='empty';p.textContent='No discoveries here yet. Try another filter or keep experimenting.';$('#ingredients').append(p);}$('#count').textContent=`${state.discovered.length} / ${ITEMS.length}`;}
function choose(id,index){if(merging||!has(id))return;if(index===undefined)index=selected[0]===null?0:selected[1]===null?1:0;selected[index]=id;renderSlots();}
function renderSlots(){selected.forEach((id,i)=>{const b=$(`#slot-${i}`);b.classList.toggle('filled',!!id);b.innerHTML=id?`<span style="color:${colors[byId[id].category]}">${byId[id].glyph}</span><small>${byId[id].name}</small>`:`<span>+</span><small>${i?'Second':'First'} ingredient</small>`;b.setAttribute('aria-label',id?`${byId[id].name}, click to remove`:`Choose ${i?'second':'first'} ingredient`);});$('#combine').disabled=merging||selected.some(x=>!x);$('.mixing').classList.toggle('ready',selected.every(Boolean));$('.mixing').classList.toggle('occupied',selected.some(Boolean));}
function recipeFor(a,b){return RECIPES.find(r=>(r[0]===a&&r[1]===b)||(r[0]===b&&r[1]===a));}
function playTone(){if(!state.sound)return;try{audioContext??=new(window.AudioContext||window.webkitAudioContext)();audioContext.resume();[392,523.25,659.25].forEach((freq,i)=>{const o=audioContext.createOscillator(),g=audioContext.createGain(),t=audioContext.currentTime+i*.09;o.type='sine';o.frequency.value=freq;g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(.04,t+.025);g.gain.exponentialRampToValueAtTime(.001,t+.6);o.connect(g);g.connect(audioContext.destination);o.start(t);o.stop(t+.65);});}catch(e){}}
async function combine(){if(merging||selected.some(x=>!x))return;merging=true;renderSlots();$('.mixing').classList.add('merging');await new Promise(resolve=>setTimeout(resolve,state.reduced?0:540));$('.mixing').classList.remove('merging');merging=false;renderSlots();const r=recipeFor(...selected);if(!r){failedMerge();say('Nothing new this time. Try a different pairing — curiosity costs nothing.');return;}if(has(r[2])){selected=[r[2],null];renderSlots();revealDiscovery(r[2],false);say(`Rediscovered ${byId[r[2]].name}. Keep experimenting!`);return;}const beforeTexture=has('planet')?makePlanetTexture():null;
worldChange={texture:beforeTexture,start:performance.now(),id:r[2]};
scenePulse={start:performance.now(),color:colors[byId[r[2]].category]};
state.discovered.push(r[2]);fresh=r[2];hintTarget=null;hintLevel=0;selected=[r[2],null];if(r[2]==='planet'||r[2]==='ocean'||r[2]==='biosphere')view='planet';save();render();revealDiscovery(r[2],true);say(`Discovered ${byId[r[2]].name}! ${byId[r[0]].name} + ${byId[r[1]].name}`,true);playTone();if(!state.reduced){$('.universe').classList.remove('flash');void $('.universe').offsetWidth;$('.universe').classList.add('flash');}if(r[2]==='biosphere'&&!state.completed){state.completed=true;save();$('#completion-detail').textContent=`${state.name} is alive. You have found ${state.discovered.length} of ${ITEMS.length} discoveries.`;$('#completion').showModal();}}
function renderSceneText(){
 const art=has('planet')?(has('ocean')?['An ocean of possibility','Your world is becoming a home']:['A world made of stardust','Zoom in. This beginning belongs to you.']):has('star')?['Your first star','A new light in the endless dark']:has('cloud')?['A stellar nursery','Gravity is gathering the ingredients of light']:has('bang')?['The first light','A beginning unfolds in the cosmic dust']:['A universe, waiting to happen','An ember of possibility in the cosmic dark'];
 $('#art-title').textContent=art[0];$('#art-subtitle').textContent=art[1];
let stage=has('biosphere')?4:has('cell')?3:has('planet')?2:has('star')?1:0;const titles=['Everything starts<br>with a little nothing.','A light in<br>the endless dark.','A world waiting<br>to become something.','The smallest life.<br>The biggest beginning.','A little world.<br>Brimming with possibility.'];const descriptions=['An empty canvas. A few possibilities.<br>What will you bring into existence?','From a cloud of possibility, a star.<br>Everything that follows begins here.','Give it oceans. Give it chemistry.<br>Give the extraordinary a place to begin.','A boundary. A little chemistry. A beginning.<br>Help your first life find its place.','You made a home for life.<br>Imagine what it could become.'];$('#scene-title').innerHTML=titles[stage];$('#scene-description').innerHTML=descriptions[stage];$('#chapter-label').textContent=['CHAPTER 01 · THE BEGINNING','CHAPTER 01 · FIRST LIGHT','CHAPTER 01 · A NEW WORLD','CHAPTER 01 · LIFE AWAKENS','CHAPTER 01 · A LIVING OCEAN'][stage];$('#scene-caption').textContent=has('biosphere')?'An entire beginning, made by you.':has('microbes')?'Tiny colonies. An ocean of possibility.':has('ocean')?'Water has found a home.':has('planet')?'Stardust, becoming somewhere.':has('star')?'Your first star is shining.':has('bang')?'There is something where there was nothing.':'The quiet before everything.';$('#planet-view').disabled=!has('planet');$('#planet-view').textContent='Planet'+(!has('planet')?' ◇':'');$('#planet-view').classList.toggle('active',view==='planet');$('#cosmic-view').classList.toggle('active',view==='universe');$('#world-label').hidden=!(view==='planet'&&has('planet'));$('#world-name').textContent=state.name;const milestones=['bang','star','planet','biosphere'];$$('[data-step]').forEach((el,i)=>el.classList.toggle('done',has(milestones[i])));$('#bench-guide').innerHTML=has('bang')?(has('biosphere')?'Your ocean is alive. Explore any discoveries you missed.':'Follow your curiosity. Every discovery opens another door.'):'Try combining <strong>Energy</strong> and <strong>Possibility</strong>.';}
function render(){document.body.classList.toggle('reduced-motion',state.reduced);renderCollection();renderSlots();renderSceneText();renderExplorer();draw(performance.now());}
function confirmAction(message){return new Promise(resolve=>{const d=document.createElement('dialog'),p=document.createElement('p'),yes=document.createElement('button'),no=document.createElement('button');p.textContent=message;yes.textContent='Confirm';yes.className='primary';no.textContent='Cancel';no.style.marginLeft='12px';d.append(p,yes,no);document.body.append(d);const finish=value=>{d.close();d.remove();resolve(value);};yes.onclick=()=>finish(true);no.onclick=()=>finish(false);d.oncancel=e=>{e.preventDefault();finish(false);};d.showModal();no.focus();});} function showJournal(){const list=$('#journal-list');list.replaceChildren();for(const id of [...state.discovered].reverse()){const item=byId[id],r=RECIPES.find(r=>r[2]===id),entry=document.createElement('article');entry.className='journal-entry';entry.innerHTML=`<h3><span style="color:${colors[item.category]}">${item.glyph}</span> ${item.name} <span class="science-tag">${item.science}</span></h3><span class="recipe">${r?`${byId[r[0]].name} + ${byId[r[1]].name}`:'Starting ingredient'}</span><p>${item.note}</p>`;list.append(entry);}$('#journal').showModal();}
$('#combine').onclick=combine;$('#clear').onclick=()=>{if(merging)return;selected=[null,null];renderSlots();say('A clean slate. What will you try?');};$('#search').oninput=renderCollection;
$$('[data-filter]').forEach(b=>b.onclick=()=>{filter=b.dataset.filter;$$('[data-filter]').forEach(x=>x.classList.toggle('active',x===b));renderCollection();});
for(let i=0;i<2;i++){const slot=$(`#slot-${i}`);slot.addEventListener('pointerdown',e=>{if(selected[i])beginDrag(e,selected[i],i);});slot.onclick=()=>{if(merging||suppressClick)return;if(selected[i]){selected[i]=null;renderSlots();}else{$('#search').focus();say('Choose an ingredient from your collection.');}};slot.ondragover=e=>{e.preventDefault();slot.classList.add('dragover');};slot.ondragleave=()=>slot.classList.remove('dragover');slot.ondrop=e=>{e.preventDefault();slot.classList.remove('dragover');choose(e.dataTransfer.getData('text/plain'),i);};}
$('#hint').onclick=()=>{if(merging)return;const next=RECIPES.find(r=>!has(r[2])&&has(r[0])&&has(r[1]));if(!next){say('You discovered everything in Chapter One. Your universe is complete!',true);return;}if(hintTarget!==next[2]){hintTarget=next[2];hintLevel=0;}hintLevel++;if(hintLevel===1)say(`A nudge: ${byId[next[0]].name} could help you discover ${byId[next[2]].name}. Tap again for the pairing.`);else{say(`Try ${byId[next[0]].name} + ${byId[next[1]].name}. The cradle is ready.`);selected=next.slice(0,2);renderSlots();}};
$('#cosmic-view').onclick=()=>{setExploring(false);view='universe';renderSceneText();draw(performance.now());};$('#planet-view').onclick=()=>{if(has('planet')){view='planet';renderSceneText();draw(performance.now());}};
$('#journal-open').onclick=showJournal;$('#how-open').onclick=()=>$('#how').showModal();function openSettings(){$('#name-input').value=state.name;$('#sound').checked=state.sound;$('#motion').checked=state.reduced;$('#settings-feedback').textContent='';$('#settings').showModal();}$('#settings-open').onclick=()=>{if(!merging)openSettings();};$('#rename-world').onclick=openSettings;
$$('[data-close]').forEach(b=>b.onclick=()=>b.closest('dialog').close());$$('dialog').forEach(d=>d.addEventListener('click',e=>{if(e.target===d){const r=d.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)d.close();}}));
$('#save-name').onclick=()=>{state.name=$('#name-input').value.trim().slice(0,30)||'Pale Blue';save();renderSceneText();renderExplorer();$('#settings-feedback').textContent='Your world has a name: '+state.name;};$('#sound').onchange=e=>{state.sound=e.target.checked;save();if(state.sound)playTone();};$('#motion').onchange=e=>{state.reduced=e.target.checked;document.body.classList.toggle('reduced-motion',state.reduced);save();draw(performance.now());};
$('#reset').onclick=async()=>{if(!await confirmAction('Start over? Your current discoveries will be erased. You can export progress first.'))return;setExploring(false);worldChange=null;scenePulse=null;state=defaultState();selected=[null,null];fresh=null;filter='All';view='universe';hintTarget=null;hintLevel=0;$('#search').value='';$$('[data-filter]').forEach(b=>b.classList.toggle('active',b.dataset.filter==='All'));save();render();$('#settings').close();say('A new beginning. Try Energy + Possibility.');};
$('#export-save').onclick=()=>{const blob=new Blob([JSON.stringify(state,null,2)],{type:'application/json'}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download='first-spark-progress.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);$('#settings-feedback').textContent='Progress exported.';};$('#import-save').onchange=async e=>{const file=e.target.files[0];if(!file)return;try{if(file.size>100000)throw Error('This file is too large to be a progress save.');const next=validate(JSON.parse(await file.text()));if(!await confirmAction('Replace your current progress with this save?'))return;setExploring(false);worldChange=null;scenePulse=null;state=next;selected=[null,null];fresh=null;hintTarget=null;hintLevel=0;view=has('planet')?'planet':'universe';save();render();$('#name-input').value=state.name;$('#sound').checked=state.sound;$('#motion').checked=state.reduced;$('#settings-feedback').textContent='Progress restored.';}catch(err){$('#settings-feedback').textContent='Could not import: '+err.message;}finally{e.target.value='';}};
document.addEventListener('keydown',e=>{if(e.key==='/'&&!$('dialog[open]')&&!['INPUT','TEXTAREA'].includes(document.activeElement.tagName)){e.preventDefault();$('#search').focus();}});
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
 if(exploring){clearTimeout(revealTimer);$('#discovery-reveal').classList.remove('show');}cameraDrag=null;renderSceneText();renderExplorer();draw(performance.now());
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
 observing=true;$('.universe').classList.add('observing');$('#observe-scene').setAttribute('aria-pressed','true');resetCamera();
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
function revealDiscovery(id,isNew){
 const item=byId[id],el=$('#discovery-reveal');clearTimeout(revealTimer);el.classList.remove('show');el.style.setProperty('--reveal-color',colors[item.category]);el.innerHTML=`<span class="reveal-symbol">${item.glyph}</span><div><span class="eyebrow">${isNew?'NEW DISCOVERY':'FOUND AGAIN'}</span><strong>${item.name}</strong><small>${item.category} · ${state.discovered.length} / ${ITEMS.length} discoveries</small></div>`;void el.offsetWidth;el.classList.add('show');revealTimer=setTimeout(()=>el.classList.remove('show'),3600);
 const box=$('.mixing').getBoundingClientRect(),scene=$('.universe').getBoundingClientRect();
 if(!state.reduced)for(let i=0;i<22;i++){const p=document.createElement('i'),angle=i*Math.PI*2/22;p.className='spark';p.style.cssText=`left:${box.left-scene.left+box.width/2}px;top:${box.top-scene.top+box.height/2}px;--dx:${Math.cos(angle)*(65+Math.random()*100)}px;--dy:${Math.sin(angle)*(40+Math.random()*85)}px;--spark-color:${colors[item.category]};animation-delay:${Math.random()*80}ms`;$('#merge-particles').append(p);setTimeout(()=>p.remove(),1200);}
}
document.addEventListener('keydown',e=>{if(e.key==='Escape')cancelDrag();});
// Locally hosted artwork: see ASSET_CREDITS.md for creators and licenses.
const canvas=$('#cosmos'),ctx=canvas.getContext('2d');let width=1,height=1;
const artwork={};let artRevision=0;
for(const [name,file] of Object.entries({nebula:'nebula.webp',earth:'earth.jpg',rocky:'rocky.jpg',clouds:'clouds.jpg',sun:'sun.jpg'})){
 const img=new Image();artwork[name]=img;
 img.onload=()=>{artRevision++;planetTextureKey='';draw(performance.now());};
 img.onerror=()=>{artwork[name]=null;draw(performance.now());};img.src='assets/'+file;
}
const ready=img=>img&&img.complete&&img.naturalWidth>0;
let seed=2718;const random=()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296;};
const stars=Array.from({length:95},()=>({x:random(),y:random(),r:random()*.8+.2,a:random(),phase:random()*6.28}));
function resize(){const rect=canvas.getBoundingClientRect();width=rect.width;height=rect.height;const ratio=Math.min(devicePixelRatio||1,2);canvas.width=Math.round(width*ratio);canvas.height=Math.round(height*ratio);ctx.setTransform(ratio,0,0,ratio,0,0);updateCamera();draw(performance.now());}new ResizeObserver(resize).observe(canvas);
function glow(x,y,r,inner,color){const g=ctx.createRadialGradient(x,y,0,x,y,r);g.addColorStop(0,inner);g.addColorStop(.3,color);g.addColorStop(1,'transparent');ctx.fillStyle=g;ctx.fillRect(x-r,y-r,r*2,r*2);}
function circle(x,y,r,color){ctx.beginPath();ctx.arc(x,y,Math.max(0,r),0,Math.PI*2);ctx.fillStyle=color;ctx.fill();}
function paintNebula(t){
 ctx.fillStyle='#070e1c';ctx.fillRect(0,0,width,height);
 if(ready(artwork.nebula)){
  const scale=Math.max(width/artwork.nebula.width,height*.8/artwork.nebula.height)*1.08;
  ctx.save();ctx.globalAlpha=has('bang')?.48:.3;
  ctx.drawImage(artwork.nebula,width*.52-artwork.nebula.width*scale*.5+Math.sin(t*.08)*8,-height*.16,artwork.nebula.width*scale,artwork.nebula.height*scale);ctx.restore();
 }
 const shade=ctx.createLinearGradient(0,0,0,height);shade.addColorStop(0,'#09132622');shade.addColorStop(.48,'#09142638');shade.addColorStop(.68,'#080f1de8');shade.addColorStop(1,'#080f1d');ctx.fillStyle=shade;ctx.fillRect(0,0,width,height);
 const left=ctx.createLinearGradient(0,0,width,0);left.addColorStop(0,'#080f1dba');left.addColorStop(.55,'#080f1d22');left.addColorStop(1,'#080f1d00');ctx.fillStyle=left;ctx.fillRect(0,0,width,height);
 for(const s of stars)circle(s.x*width,s.y*height,s.r,`rgba(205,227,248,${s.a*(.25+Math.sin(t*2+s.phase)*.08)})`);
}
let planetTexture=null,planetTextureKey='';
function makePlanetTexture(){
 const textureKey=[has('ocean'),has('microbes'),has('biosphere'),artRevision].join(':');if(planetTextureKey===textureKey&&planetTexture)return planetTexture;
 const c=document.createElement('canvas');c.width=1024;c.height=512;const g=c.getContext('2d');
 const source=has('ocean')?artwork.earth:artwork.rocky;
 if(ready(source)){g.drawImage(source,0,0,c.width,c.height);
  if(has('ocean')&&!has('microbes')){const im=g.getImageData(0,0,c.width,c.height);for(let k=0;k<im.data.length;k+=4){const r=im.data[k],green=im.data[k+1],b=im.data[k+2];if(green>b*1.12&&r>b*.85){im.data[k]=Math.min(255,r*1.2+20);im.data[k+1]=green*.8;im.data[k+2]=b*.8;}}g.putImageData(im,0,0);}
 }else{g.fillStyle=has('ocean')?'#18506c':'#936753';g.fillRect(0,0,c.width,c.height);}
 planetTextureKey=textureKey;planetTexture=c;return c;
}
const pixels=new WeakMap(),projections=new Map(),sphereFrames=new Map();
function imagePixels(image){if(pixels.has(image))return pixels.get(image);const c=document.createElement('canvas');c.width=1024;c.height=512;const g=c.getContext('2d');g.drawImage(image,0,0,1024,512);const data=g.getImageData(0,0,1024,512).data;pixels.set(image,data);return data;}
function projection(size){
 if(projections.has(size))return projections.get(size);const out=[];
 for(let y=0;y<size;y++)for(let x=0;x<size;x++){const nx=(x+.5)*2/size-1,ny=(y+.5)*2/size-1,d=nx*nx+ny*ny;if(d>=1)continue;const nz=Math.sqrt(1-d),light=Math.max(.035,nx*-.48+ny*-.35+nz*.8);
 out.push({k:(y*size+x)*4,u:(Math.atan2(nx,nz)/(Math.PI*2)+.5)*1024,v:clamp(Math.floor((Math.asin(ny)/Math.PI+.5)*512),0,511),light:.12+light*.92,edge:Math.min(1,nz*14),shine:Math.pow(Math.max(0,nx*-.38+ny*-.38+nz*.84),45)});}
 projections.set(size,out);return out;
}
function sphere(image,t,size,clouds=false,emissive=false){
 const key=[size,clouds,emissive].join(':'),cached=sphereFrames.get(key),now=performance.now();
 if(cached&&cached.image===image&&cached.revision===artRevision&&now-cached.time<65)return cached.canvas;
 const frame=cached?.canvas||document.createElement('canvas');frame.width=size;frame.height=size;const g=frame.getContext('2d'),im=g.createImageData(size,size),map=imagePixels(image),cloud=clouds&&ready(artwork.clouds)?imagePixels(artwork.clouds):null;
 const offset=Math.floor(t*16)%1024;
 for(const p of projection(size)){const u=(Math.floor(p.u)+offset+1024)%1024,source=(p.v*1024+u)*4;let alpha=0,cloudSource=0;
  if(cloud){cloudSource=(p.v*1024+(u+Math.floor(t*4)+1024)%1024)*4;alpha=Math.max(0,(cloud[cloudSource]-75)/180)*.65;}
  const light=emissive?.8+p.light*.2:p.light;
  for(let ch=0;ch<3;ch++){let value=map[source+ch];if(cloud)value=value*(1-alpha)+235*alpha;if(!emissive&&clouds&&map[source+2]>map[source]*1.15)value+=p.shine*65;im.data[p.k+ch]=Math.min(255,value*light);}
  im.data[p.k+3]=255*p.edge;
 }g.putImageData(im,0,0);sphereFrames.set(key,{canvas:frame,image,time:now,revision:artRevision});return frame;
}
function drawPlanet(x,y,r,t,mini=false){
 const texture=makePlanetTexture(),transition=worldChange&&!state.reduced?clamp((performance.now()-worldChange.start)/1800,0,1):1,size=mini?96:observing?480:320;
 glow(x,y,r*1.25,has('atmosphere')?'#84d9ff22':'#bd91631a','#2174a31a');
 ctx.save();ctx.beginPath();ctx.arc(x,y,r,0,Math.PI*2);ctx.clip();
 if(transition<1&&worldChange.texture){ctx.drawImage(sphere(worldChange.texture,t,size,false),x-r,y-r,r*2,r*2);ctx.globalAlpha=transition;}
 ctx.drawImage(sphere(texture,t,size,has('atmosphere')),x-r,y-r,r*2,r*2);ctx.restore();
 // Thin atmospheric scattering instead of decorative orbit rings or floating dots.
 if(has('atmosphere')){ctx.save();ctx.shadowBlur=mini?3:14;ctx.shadowColor='#7bc8ff';ctx.strokeStyle='#9bdaff70';ctx.lineWidth=mini?.7:1.5;ctx.beginPath();ctx.arc(x,y,r,Math.PI*.8,Math.PI*1.88);ctx.stroke();ctx.restore();}
}
function drawEmber(x,y,r,t,stellar=false){
 glow(x,y,r*3.2,stellar?'#ffb55888':'#efad6644','#b3573820');
 if(ready(artwork.sun))ctx.drawImage(sphere(artwork.sun,t,stellar?320:160,false,true),x-r,y-r,r*2,r*2);
 else circle(x,y,r,'#e9bb77');
 ctx.save();ctx.globalCompositeOperation='screen';
 const streak=ctx.createLinearGradient(x-r*3,y,x+r*3,y);streak.addColorStop(0,'transparent');streak.addColorStop(.5,stellar?'#ffe9bfaa':'#ffe7bd66');streak.addColorStop(1,'transparent');ctx.fillStyle=streak;ctx.fillRect(x-r*3,y-1,r*6,2);ctx.restore();
}
let nursery=null;
function drawNursery(x,y,r,t){
 if(ready(artwork.nebula)){
  const cloud=nursery||document.createElement('canvas');if(!nursery){cloud.width=420;cloud.height=420;const c=cloud.getContext('2d');c.drawImage(artwork.nebula,0,0,420,420);c.globalCompositeOperation='destination-in';const mask=c.createRadialGradient(210,210,20,210,210,210);mask.addColorStop(0,'#fff');mask.addColorStop(.65,'#ffffffaa');mask.addColorStop(1,'#ffffff00');c.fillStyle=mask;c.fillRect(0,0,420,420);nursery=cloud;}
  ctx.save();ctx.globalCompositeOperation='screen';ctx.globalAlpha=.72;ctx.translate(x,y);ctx.rotate(Math.sin(t*.1)*.08);ctx.drawImage(cloud,-r*1.7,-r*1.7,r*3.4,r*3.4);ctx.restore();
 }
 drawEmber(x,y,has('protostar')?r*.42:r*.16,t,has('protostar'));
}
function drawWorldPulse(x,y,r,now){if(!scenePulse||state.reduced)return;const p=(now-scenePulse.start)/1800;if(p>1){scenePulse=null;return;}glow(x,y,r*(1+p),scenePulse.color+Math.round((1-p)*35).toString(16).padStart(2,'0'),scenePulse.color+'00');}
function draw(now){
 const ease=state.reduced?1:.16;for(const key of ['zoom','x','y'])camera[key]+=(targetCamera[key]-camera[key])*ease;
 const t=state.reduced?0:now*.00013,mobile=width<600;
 ctx.clearRect(0,0,width,height);paintNebula(t);
 const cx=(observing?width*.5:mobile?width*.38:width*.72)+camera.x,cy=(observing?height*.37:height*(mobile?.38:.30))+camera.y;
 const base=observing?Math.min(width*.29,height*.25):Math.min(width*(mobile?.22:.17),height*.19),r=base*camera.zoom;
 if(view==='planet'&&has('planet'))drawPlanet(cx,cy,r,t);
 else if(has('star')){drawEmber(cx,cy,r*.65,t,true);if(has('planet'))drawPlanet(cx-r*1.3,cy+r*.45,r*.2,t,true);}
 else if(has('bang'))drawNursery(cx,cy,r,t);
 else drawEmber(cx,cy,r*.42*(1+Math.sin(t*2)*.025),t);
 drawWorldPulse(cx,cy,r,now);
}
let last=0;function animate(time){if(!state.reduced&&!document.hidden&&time-last>32){draw(time);last=time;}requestAnimationFrame(animate);}save();render();requestAnimationFrame(animate);

})();
