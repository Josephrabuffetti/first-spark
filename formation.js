/* Continuous scene state; no DOM, clocks, image loading, or save mutation. */
(function(root){
'use strict';
const clamp=n=>Math.max(0,Math.min(1,n));
const smooth=n=>{n=clamp(n);return n*n*(3-2*n);};
const base={inspection:0,background:.2,gas:.05,gasSize:1.3,flatten:1,core:.07,star:0,starSize:.05,disk:0,dust:0,planet:0,planetSize:.03,focus:0,atmosphere:0,ocean:0,life:0};
const profiles={
 seed:{},bang:{background:.32,gas:.34,gasSize:1.85,core:.36},
 expansion:{background:.42,gas:.33,gasSize:1.85,core:.08,dust:.10},
 cooling:{background:.49,gas:.43,gasSize:1.65,core:.035,dust:.13},
 hydrogen:{background:.54,gas:.60,gasSize:1.5,core:.04,dust:.14},
 cloud:{background:.66,gas:.93,gasSize:1.35,core:.09,dust:.12},
 protostar:{background:.7,gas:.83,gasSize:.9,flatten:.85,core:1.05,star:.24,starSize:.24,dust:.08},
 star:{background:.72,gas:.15,gasSize:.7,flatten:.75,core:1,star:1,starSize:.60,dust:.04},
 dust:{background:.72,gas:.21,gasSize:1.1,flatten:.5,core:1,star:1,starSize:.58,dust:.65,disk:.25},
 disk:{background:.72,gas:.23,gasSize:1.3,flatten:.25,core:1,star:1,starSize:.56,dust:.9,disk:1},
 rock:{background:.72,gas:.20,gasSize:1.25,flatten:.25,core:1,star:1,starSize:.56,dust:.85,disk:1,planet:.10,planetSize:.075},
 planet:{background:.72,gas:.08,gasSize:1.1,flatten:.3,core:1,star:1,starSize:.56,dust:.25,disk:.38,planet:1,planetSize:.88}
};
function profile(ids,view='universe',observing=false){
 const found=new Set(ids);let phase='seed';
 for(const id of ['bang','expansion','cooling','hydrogen','cloud','protostar','star','dust','disk','rock','planet'])if(found.has(id))phase=id;
 // Rock can be made before a disk; never regress a previously shining star.
 if(!found.has('star')&&['dust','disk','rock','planet'].includes(phase))phase=found.has('protostar')?'protostar':found.has('cloud')?'cloud':phase;
 const value={...base,...profiles[phase]};value.inspection=observing?1:0;
 if(phase==='rock'&&!found.has('disk'))value.disk=.25;
 value.focus=found.has('planet')&&view==='planet'?1:0;
 value.atmosphere=found.has('atmosphere')?1:0;value.ocean=found.has('ocean')?1:0;
 value.life=found.has('biosphere')?1:found.has('biofilm')?.85:found.has('microbes')?.7:found.has('cell')?.3:0;
 return{phase,values:value};
}
class Controller{
 constructor(initial,now=0){this.reset(initial,now);}
 reset(next,now=0){this.from={...next.values};this.target={...next.values};this.phase=next.phase;this.start=now;this.duration=0;}
 progress(now){return this.duration?clamp((now-this.start)/this.duration):1;}
 sample(now){const p=this.progress(now),out={};for(const k of Object.keys(base)){
 let q=smooth(p);
 if(this.phase==='star'&&this.from.star<.8){if(k==='star')q=smooth((p-.32)/.68);if(k==='gasSize')q=smooth(p/.65);if(k==='gas')q=smooth((p-.38)/.62);}
 if(this.phase==='planet'&&this.from.planet<.8){if(k==='planet')q=smooth((p-.18)/.82);if(k==='planetSize')q=smooth((p-.1)/.9);}
 out[k]=this.from[k]+(this.target[k]-this.from[k])*q;
 }return out;}
 retarget(next,now,duration=2800){
 if(Object.keys(base).every(k=>Math.abs(next.values[k]-this.target[k])<1e-8)&&next.phase===this.phase)return false;
 this.from=this.sample(now);this.target={...next.values};this.phase=next.phase;this.start=now;this.duration=duration;return true;
 }
 finish(now){this.from={...this.target};this.start=now;this.duration=0;}
 active(now){return this.progress(now)<1;}
}
const api={Controller,profile,smooth,keys:Object.keys(base)};
if(typeof module!=='undefined')module.exports=api;else root.FormationModel=api;
})(typeof window!=='undefined'?window:globalThis);
