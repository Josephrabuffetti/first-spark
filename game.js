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
const has=id=>state.discovered.includes(id);
function save(){try{localStorage.setItem(key,JSON.stringify(state));storageAvailable=true;}catch(e){storageAvailable=false;}$('#save-status').textContent=storageAvailable?'Saved on this browser':'Saving unavailable — export progress';}
function say(message,success=false){$('#feedback').textContent=message;$('#feedback').classList.toggle('success',success);}
function renderCollection(){const query=$('#search').value.trim().toLowerCase();const items=state.discovered.map(id=>byId[id]).filter(i=>(filter==='All'||i.category===filter)&&i.name.toLowerCase().includes(query));$('#ingredients').replaceChildren();for(const item of items){const b=document.createElement('button');b.className='ingredient'+(item.id===fresh?' fresh':'');b.draggable=false;b.dataset.ingredient=item.id;b.style.setProperty('--item-color',colors[item.category]);b.innerHTML=`<span class="glyph">${item.glyph}</span><span class="item-name">${item.name}</span>${item.id===fresh?'<span class="tag">NEW</span>':''}`;b.setAttribute('aria-label',`Add ${item.name} to cradle`);b.addEventListener('click',()=>{if(!suppressClick&&!merging)choose(item.id);});b.addEventListener('pointerdown',e=>beginDrag(e,item.id,null));b.addEventListener('dragstart',e=>{e.dataTransfer.setData('text/plain',item.id);e.dataTransfer.effectAllowed='copy';});$('#ingredients').append(b);}if(!items.length){const p=document.createElement('p');p.className='empty';p.textContent='No discoveries here yet. Try another filter or keep experimenting.';$('#ingredients').append(p);}$('#count').textContent=`${state.discovered.length} / ${ITEMS.length}`;}
function choose(id,index){if(merging||!has(id))return;if(index===undefined)index=selected[0]===null?0:selected[1]===null?1:0;selected[index]=id;renderSlots();}
function renderSlots(){selected.forEach((id,i)=>{const b=$(`#slot-${i}`);b.classList.toggle('filled',!!id);b.innerHTML=id?`<span style="color:${colors[byId[id].category]}">${byId[id].glyph}</span><small>${byId[id].name}</small>`:`<span>＋</span><small>${i?'Second':'First'} ingredient</small>`;b.setAttribute('aria-label',id?`${byId[id].name}, click to remove`:`Choose ${i?'second':'first'} ingredient`);});$('#combine').disabled=merging||selected.some(x=>!x);$('.mixing').classList.toggle('ready',selected.every(Boolean));$('.mixing').classList.toggle('occupied',selected.some(Boolean));}
function recipeFor(a,b){return RECIPES.find(r=>(r[0]===a&&r[1]===b)||(r[0]===b&&r[1]===a));}
function playTone(){if(!state.sound)return;try{audioContext??=new(window.AudioContext||window.webkitAudioContext)();audioContext.resume();[392,523.25,659.25].forEach((freq,i)=>{const o=audioContext.createOscillator(),g=audioContext.createGain(),t=audioContext.currentTime+i*.09;o.type='sine';o.frequency.value=freq;g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(.04,t+.025);g.gain.exponentialRampToValueAtTime(.001,t+.6);o.connect(g);g.connect(audioContext.destination);o.start(t);o.stop(t+.65);});}catch(e){}}
async function combine(){if(merging||selected.some(x=>!x))return;merging=true;renderSlots();$('.mixing').classList.add('merging');await new Promise(resolve=>setTimeout(resolve,state.reduced?0:540));$('.mixing').classList.remove('merging');merging=false;renderSlots();const r=recipeFor(...selected);if(!r){failedMerge();say('Nothing new this time. Try a different pairing — curiosity costs nothing.');return;}if(has(r[2])){selected=[r[2],null];renderSlots();revealDiscovery(r[2],false);say(`Rediscovered ${byId[r[2]].name}. Keep experimenting!`);return;}state.discovered.push(r[2]);fresh=r[2];hintTarget=null;hintLevel=0;selected=[r[2],null];if(r[2]==='planet'||r[2]==='ocean'||r[2]==='biosphere')view='planet';save();render();revealDiscovery(r[2],true);say(`Discovered ${byId[r[2]].name}! ${byId[r[0]].name} + ${byId[r[1]].name}`,true);playTone();if(!state.reduced){$('.universe').classList.remove('flash');void $('.universe').offsetWidth;$('.universe').classList.add('flash');}if(r[2]==='biosphere'&&!state.completed){state.completed=true;save();$('#completion-detail').textContent=`${state.name} is alive. You have found ${state.discovered.length} of ${ITEMS.length} discoveries.`;$('#completion').showModal();}}
function renderSceneText(){let stage=has('biosphere')?4:has('cell')?3:has('planet')?2:has('star')?1:0;const titles=['Everything starts<br>with a little nothing.','A light in<br>the endless dark.','A world waiting<br>to become something.','The smallest life.<br>The biggest beginning.','A little world.<br>Brimming with possibility.'];const descriptions=['An empty canvas. A few possibilities.<br>What will you bring into existence?','From a cloud of possibility, a star.<br>Everything that follows begins here.','Give it oceans. Give it chemistry.<br>Give the extraordinary a place to begin.','A boundary. A little chemistry. A beginning.<br>Help your first life find its place.','You made a home for life.<br>Imagine what it could become.'];$('#scene-title').innerHTML=titles[stage];$('#scene-description').innerHTML=descriptions[stage];$('#chapter-label').textContent=['CHAPTER 01 · THE BEGINNING','CHAPTER 01 · FIRST LIGHT','CHAPTER 01 · A NEW WORLD','CHAPTER 01 · LIFE AWAKENS','CHAPTER 01 · A LIVING OCEAN'][stage];$('#scene-caption').textContent=has('biosphere')?'An entire beginning, made by you.':has('microbes')?'Tiny colonies. An ocean of possibility.':has('ocean')?'Water has found a home.':has('planet')?'Stardust, becoming somewhere.':has('star')?'Your first star is shining.':has('bang')?'There is something where there was nothing.':'The quiet before everything.';$('#planet-view').disabled=!has('planet');$('#planet-view').textContent='Planet'+(!has('planet')?' ◇':'');$('#planet-view').classList.toggle('active',view==='planet');$('#cosmic-view').classList.toggle('active',view==='universe');$('#world-label').hidden=!(view==='planet'&&has('planet'));$('#world-name').textContent=state.name;const milestones=['bang','star','planet','biosphere'];$$('[data-step]').forEach((el,i)=>el.classList.toggle('done',has(milestones[i])));$('#bench-guide').innerHTML=has('bang')?(has('biosphere')?'Your ocean is alive. Explore any discoveries you missed.':'Follow your curiosity. Every discovery opens another door.'):'Try combining <strong>Energy</strong> and <strong>Possibility</strong>.';}
function render(){document.body.classList.toggle('reduced-motion',state.reduced);renderCollection();renderSlots();renderSceneText();draw(performance.now());}
function confirmAction(message){return new Promise(resolve=>{const d=document.createElement('dialog'),p=document.createElement('p'),yes=document.createElement('button'),no=document.createElement('button');p.textContent=message;yes.textContent='Confirm';yes.className='primary';no.textContent='Cancel';no.style.marginLeft='12px';d.append(p,yes,no);document.body.append(d);const finish=value=>{d.close();d.remove();resolve(value);};yes.onclick=()=>finish(true);no.onclick=()=>finish(false);d.oncancel=e=>{e.preventDefault();finish(false);};d.showModal();no.focus();});} function showJournal(){const list=$('#journal-list');list.replaceChildren();for(const id of [...state.discovered].reverse()){const item=byId[id],r=RECIPES.find(r=>r[2]===id),entry=document.createElement('article');entry.className='journal-entry';entry.innerHTML=`<h3><span style="color:${colors[item.category]}">${item.glyph}</span> ${item.name} <span class="science-tag">${item.science}</span></h3><span class="recipe">${r?`${byId[r[0]].name} + ${byId[r[1]].name}`:'Starting ingredient'}</span><p>${item.note}</p>`;list.append(entry);}$('#journal').showModal();}
$('#combine').onclick=combine;$('#clear').onclick=()=>{if(merging)return;selected=[null,null];renderSlots();say('A clean slate. What will you try?');};$('#search').oninput=renderCollection;
$$('[data-filter]').forEach(b=>b.onclick=()=>{filter=b.dataset.filter;$$('[data-filter]').forEach(x=>x.classList.toggle('active',x===b));renderCollection();});
for(let i=0;i<2;i++){const slot=$(`#slot-${i}`);slot.addEventListener('pointerdown',e=>{if(selected[i])beginDrag(e,selected[i],i);});slot.onclick=()=>{if(merging||suppressClick)return;if(selected[i]){selected[i]=null;renderSlots();}else{$('#search').focus();say('Choose an ingredient from your collection.');}};slot.ondragover=e=>{e.preventDefault();slot.classList.add('dragover');};slot.ondragleave=()=>slot.classList.remove('dragover');slot.ondrop=e=>{e.preventDefault();slot.classList.remove('dragover');choose(e.dataTransfer.getData('text/plain'),i);};}
$('#hint').onclick=()=>{if(merging)return;const next=RECIPES.find(r=>!has(r[2])&&has(r[0])&&has(r[1]));if(!next){say('You discovered everything in Chapter One. Your universe is complete!',true);return;}if(hintTarget!==next[2]){hintTarget=next[2];hintLevel=0;}hintLevel++;if(hintLevel===1)say(`A nudge: ${byId[next[0]].name} could help you discover ${byId[next[2]].name}. Tap again for the pairing.`);else{say(`Try ${byId[next[0]].name} + ${byId[next[1]].name}. The cradle is ready.`);selected=next.slice(0,2);renderSlots();}};
$('#cosmic-view').onclick=()=>{view='universe';renderSceneText();draw(performance.now());};$('#planet-view').onclick=()=>{if(has('planet')){view='planet';renderSceneText();draw(performance.now());}};
$('#journal-open').onclick=showJournal;$('#how-open').onclick=()=>$('#how').showModal();function openSettings(){$('#name-input').value=state.name;$('#sound').checked=state.sound;$('#motion').checked=state.reduced;$('#settings-feedback').textContent='';$('#settings').showModal();}$('#settings-open').onclick=()=>{if(!merging)openSettings();};$('#rename-world').onclick=openSettings;
$$('[data-close]').forEach(b=>b.onclick=()=>b.closest('dialog').close());$$('dialog').forEach(d=>d.addEventListener('click',e=>{if(e.target===d){const r=d.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)d.close();}}));
$('#save-name').onclick=()=>{state.name=$('#name-input').value.trim().slice(0,30)||'Pale Blue';save();renderSceneText();$('#settings-feedback').textContent='Your world has a name: '+state.name;};$('#sound').onchange=e=>{state.sound=e.target.checked;save();if(state.sound)playTone();};$('#motion').onchange=e=>{state.reduced=e.target.checked;document.body.classList.toggle('reduced-motion',state.reduced);save();draw(performance.now());};
$('#reset').onclick=async()=>{if(!await confirmAction('Start over? Your current discoveries will be erased. You can export progress first.'))return;state=defaultState();selected=[null,null];fresh=null;filter='All';view='universe';hintTarget=null;hintLevel=0;$('#search').value='';$$('[data-filter]').forEach(b=>b.classList.toggle('active',b.dataset.filter==='All'));save();render();$('#settings').close();say('A new beginning. Try Energy + Possibility.');};
$('#export-save').onclick=()=>{const blob=new Blob([JSON.stringify(state,null,2)],{type:'application/json'}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download='first-spark-progress.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);$('#settings-feedback').textContent='Progress exported.';};$('#import-save').onchange=async e=>{const file=e.target.files[0];if(!file)return;try{if(file.size>100000)throw Error('This file is too large to be a progress save.');const next=validate(JSON.parse(await file.text()));if(!await confirmAction('Replace your current progress with this save?'))return;state=next;selected=[null,null];fresh=null;hintTarget=null;hintLevel=0;view=has('planet')?'planet':'universe';save();render();$('#name-input').value=state.name;$('#sound').checked=state.sound;$('#motion').checked=state.reduced;$('#settings-feedback').textContent='Progress restored.';}catch(err){$('#settings-feedback').textContent='Could not import: '+err.message;}finally{e.target.value='';}};
document.addEventListener('keydown',e=>{if(e.key==='/'&&!$('dialog[open]')&&!['INPUT','TEXTAREA'].includes(document.activeElement.tagName)){e.preventDefault();$('#search').focus();}});
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
function paintNebula(t){
 ctx.save();ctx.globalCompositeOperation='screen';
 glow(width*.72,height*.28,width*.44,'#58489027','#253f6c15');
 glow(width*.36,height*.46,width*.38,'#237d7830','#134b5c10');
 for(let i=0;i<7;i++){ctx.beginPath();ctx.ellipse(width*.65,height*.32,80+i*28,25+i*13,-.45+t*.03,0,Math.PI*2);ctx.strokeStyle=`rgba(159,169,230,${.022+i*.003})`;ctx.lineWidth=1;ctx.stroke();}
 ctx.restore();
}

// Procedural illustration: deterministic stars, orbital dust, and a living globe.
const canvas=$('#cosmos'),ctx=canvas.getContext('2d');let width=1,height=1;
let seed=2718;const random=()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296;};const stars=Array.from({length:260},()=>({x:random(),y:random(),r:random()*1.2+.2,a:random(),phase:random()*6.28}));const land=Array.from({length:24},()=>({x:random()*1.7-.85,y:random()*1.7-.85,r:random()*.2+.06,phase:random()*6.28}));
function resize(){const rect=canvas.getBoundingClientRect();width=rect.width;height=rect.height;const ratio=Math.min(devicePixelRatio||1,2);canvas.width=Math.round(width*ratio);canvas.height=Math.round(height*ratio);ctx.setTransform(ratio,0,0,ratio,0,0);draw(performance.now());}new ResizeObserver(resize).observe(canvas);
function glow(x,y,r,inner,color){const g=ctx.createRadialGradient(x,y,0,x,y,r);g.addColorStop(0,inner);g.addColorStop(.3,color);g.addColorStop(1,'transparent');ctx.fillStyle=g;ctx.fillRect(x-r,y-r,r*2,r*2);}
function circle(x,y,r,color){ctx.beginPath();ctx.arc(x,y,r,0,Math.PI*2);ctx.fillStyle=color;ctx.fill();}
function draw(now){const t=state.reduced?0:now*.00013,cx=width*.66,cy=height*.34;ctx.clearRect(0,0,width,height);paintNebula(t); for(const s of stars){const a=(has('bang')?.55:.25)+Math.sin(t*4+s.phase)*.13;circle(s.x*width,s.y*height,s.r,`rgba(201,214,241,${a*s.a})`);}if(view==='planet'&&has('planet')){drawPlanet(cx,cy,Math.min(width*.2,142),t);return;}if(!has('bang')){glow(cx,cy,115,'#e3cfa633','#9d71951a');ctx.strokeStyle='#b5a7c34d';ctx.lineWidth=1;for(let i=0;i<3;i++){ctx.beginPath();ctx.ellipse(cx,cy,30+i*13,12+i*12,t+i*.8,0,Math.PI*2);ctx.stroke();}circle(cx,cy,3,'#f5e0b4');return;}if(!has('star')){glow(cx,cy,has('cloud')?160:120,'#ffe0ac66','#ad88d122');for(let i=0;i<90;i++){const a=i*2.399+t,r=20+((i*13)%130);circle(cx+Math.cos(a)*r,cy+Math.sin(a)*r*.55,1+(i%3)*.5,i%2?'#d1c4ea88':'#e6bc8588');}if(has('protostar'))glow(cx,cy,65,'#fff0bbee','#e4a65b77');else circle(cx,cy,6,'#fce3b8');return;}const radius=Math.min(width*.075,53);glow(cx,cy,radius*4,'#ffdb91dd','#eaa55633');const sg=ctx.createRadialGradient(cx-radius*.3,cy-radius*.3,0,cx,cy,radius);sg.addColorStop(0,'#fff6cb');sg.addColorStop(.6,'#ffda89');sg.addColorStop(1,'#de8b4c');circle(cx,cy,radius,sg);if(has('disk')||has('planet')){ctx.save();ctx.translate(cx,cy);ctx.rotate(-.2);ctx.strokeStyle='#b3b9d526';for(let i=1;i<4;i++){ctx.beginPath();ctx.ellipse(0,0,radius*2+i*45,25+i*28,0,0,Math.PI*2);ctx.stroke();}ctx.restore();}if(has('planet')){const a=t*.5+.5,px=cx+Math.cos(a)*Math.min(width*.3,215),py=cy+Math.sin(a)*90;drawPlanet(px,py,22,t,true);}if(has('supernova')){glow(width*.82,height*.25,45,'#dcbef54d','#8e77e81a');circle(width*.82,height*.25,2,'#d8c1ee');}}
let planetTexture=null,planetTextureKey='';
function makePlanetTexture(){
 const textureKey=[has('ocean'),has('microbes'),has('biosphere')].join(':');if(planetTextureKey===textureKey&&planetTexture)return planetTexture;
 const c=document.createElement('canvas');c.width=512;c.height=256;const g=c.getContext('2d'),im=g.createImageData(c.width,c.height);
 for(let y=0;y<c.height;y++)for(let x=0;x<c.width;x++){
  const u=x/c.width*Math.PI*2,v=y/c.height*Math.PI;
  const n=Math.sin(u*3+Math.cos(v*5))*Math.cos(v*4)+.44*Math.sin(u*7-v*9)+.22*Math.cos(u*17+v*13)+.08*Math.sin(u*43-v*31);
  const ocean=has('ocean'),land=n>.38,ice=Math.abs(y/c.height-.5)>.46;
  let col=ocean?(land?(has('microbes')?[65,120,94]:[133,123,96]):[17,65,101]):[128,91,69];
  if(ice&&ocean)col=[175,198,197];
  const detail=.82+(n+1.8)*.12;const k=(y*c.width+x)*4;
  for(let i=0;i<3;i++)im.data[k+i]=Math.min(255,col[i]*detail);im.data[k+3]=255;
 }g.putImageData(im,0,0);planetTextureKey=textureKey;return planetTexture=c;
}
function drawPlanet(x,y,r,t,mini=false){
 const texture=makePlanetTexture();
 glow(x,y,r*1.6,has('atmosphere')?'#88c9f440':'#b77a3f20','#3783bd14');
 ctx.save();ctx.beginPath();ctx.arc(x,y,r,0,Math.PI*2);ctx.clip();circle(x,y,r,'#152c46');
 // Latitude strips curve the texture into a globe rather than a flat disc.
 for(let sy=-r;sy<r;sy+=2){const normalized=sy/r,w=Math.sqrt(1-normalized*normalized)*r;const ty=(Math.asin(normalized)/Math.PI+.5)*256;const offset=((t*9)%512+512)%512;ctx.drawImage(texture,offset,ty,512-offset,2,x-w, y+sy,w*2*(1-offset/512),2.5);if(offset>0)ctx.drawImage(texture,0,ty,offset,2,x-w+w*2*(1-offset/512),y+sy,w*2*offset/512,2.5);}
 if(has('atmosphere')){ctx.strokeStyle='#dcecff38';ctx.lineWidth=r*.035;for(let i=0;i<8;i++){ctx.beginPath();ctx.ellipse(x+Math.sin(i*3+t)*r*.2,y-r*.73+i*r*.2,r*.78,r*.055,-.15,0,Math.PI*1.1);ctx.stroke();}}
 if(has('microbes'))for(let i=0;i<65;i++){const a=i*2.399,rr=Math.sqrt(i/65)*r*.88;circle(x+Math.cos(a)*rr,y+Math.sin(a)*rr,mini?.35:.8,has('biosphere')?'#bbffceaa':'#8ae3c366');}
 const shade=ctx.createRadialGradient(x-r*.45,y-r*.42,0,x+r*.23,y+r*.12,r*1.3);shade.addColorStop(0,'#c9e4ff33');shade.addColorStop(.48,'#03081800');shade.addColorStop(.8,'#02071699');shade.addColorStop(1,'#01040af5');ctx.fillStyle=shade;ctx.fillRect(x-r,y-r,r*2,r*2);ctx.restore();
 ctx.strokeStyle=has('atmosphere')?'#9ddcf2aa':'#bc917866';ctx.lineWidth=1.5;ctx.beginPath();ctx.arc(x,y,r,0,Math.PI*2);ctx.stroke();
 if(!mini){ctx.strokeStyle='#a6cde31c';ctx.lineWidth=1;ctx.beginPath();ctx.ellipse(x,y,r*1.38,r*.4,-.27,0,Math.PI*2);ctx.stroke();}
}

let last=0;function animate(time){if(!state.reduced&&!document.hidden&&time-last>32){draw(time);last=time;}requestAnimationFrame(animate);}save();render();requestAnimationFrame(animate);
})();

