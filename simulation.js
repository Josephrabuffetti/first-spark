/* Deterministic, saved, compressed world history. No offline progression. */
(function(root){
'use strict';
const clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
const events={
 volcano:{title:'A volcano awakens',detail:'Lava renews the crust. Ash briefly cools the sky, while fresh minerals feed future habitats.',heat:12,nutrients:18},
 meteor:{title:'A visitor from space',detail:'A small meteor leaves a bright trail and a new mineral-rich crater.',heat:3,nutrients:10},
 rain:{title:'A season of rain',detail:'Storms sweep across the ocean. Weathering carries minerals toward the coasts.',heat:-7,nutrients:9},
 bloom:{title:'The shallows bloom',detail:'Microbial communities spread through sunlit water as new habitats become available.',heat:-2,nutrients:-5},
 quiet:{title:'A quieter age',detail:'The crust settles. Stable conditions give existing communities time to adapt.',heat:-3,nutrients:2}
};
function fresh(){return{year:0,seed:73129,heat:48,nutrients:25,oxygen:0,history:[],species:[]};}
function clean(s){const n=fresh();if(!s||typeof s!=='object')return n;for(const k of ['year','seed','heat','nutrients','oxygen'])if(Number.isFinite(s[k]))n[k]=Math.round(clamp(s[k],0,k==='year'?1e9:k==='seed'?4294967295:100));n.year=Math.floor(n.year/1000)*1000;n.seed=n.seed||73129;n.history=Array.isArray(s.history)?s.history.filter(e=>e&&Object.hasOwn(events,e.type)&&Number.isFinite(e.year)&&e.year<=n.year&&e.year>=0).slice(-20).map(e=>({type:e.type,year:Math.floor(e.year)})):[];n.species=Array.isArray(s.species)?[...new Set(s.species.filter(x=>typeof x==='string'&&Object.hasOwn(lineages,x)))]:[];return n;}
const lineages={pioneers:{name:'Vent pioneers',detail:'Heat-tolerant microbial populations around mineral-rich vents.'},mats:{name:'Coastal mat builders',detail:'Cooperating microbes form protective layers along the shallows.'},sun:{name:'Sunlight harvesters',detail:'Photosynthetic populations expand into brighter water.'},oxygen:{name:'Oxygen-tolerant swimmers',detail:'Microbial populations adapt to increasingly oxygenated habitats.'}};
function advance(input,ids){const s=clean(input),found=new Set(ids);if(!found.has('planet')||s.year>=1e9)return{s,event:null,evolved:[]};s.year+=1000;s.heat=clamp(s.heat+(48-s.heat)*.08,0,100);let event=null;
 if(s.year%3000===0){s.seed=(Math.imul(s.seed,1664525)+1013904223)>>>0;const pool=['meteor','quiet'];if(found.has('volcano'))pool.push('volcano','volcano');if(found.has('ocean'))pool.push('rain');if(found.has('microbes'))pool.push('bloom');event={type:pool[s.seed%pool.length],year:s.year};const e=events[event.type];s.heat=clamp(s.heat+e.heat,0,100);s.nutrients=clamp(s.nutrients+e.nutrients,0,100);s.history.push(event);s.history=s.history.slice(-20);}
 if(found.has('cyanobacteria'))s.oxygen=clamp(s.oxygen+3,0,100);
 const evolved=[];const add=id=>{if(!s.species.includes(id)){s.species.push(id);evolved.push(id);}};
 if(found.has('cell')&&found.has('vent')&&s.year>=3000)add('pioneers');
 if(found.has('microbes')&&found.has('ocean')&&s.year>=6000&&s.nutrients>=20)add('mats');
 if(found.has('photosynthesis')&&found.has('ocean')&&s.year>=9000)add('sun');
 if(found.has('biosphere')&&s.oxygen>=30&&s.year>=12000)add('oxygen');
 return{s,event,evolved};}
const api={fresh,clean,advance,events,lineages};if(typeof module!=='undefined')module.exports=api;else root.WorldHistory=api;
})(typeof window!=='undefined'?window:globalThis);
