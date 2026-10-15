const assert=require('node:assert/strict'),W=require('./simulation.js'),{ITEMS}=require('./data.js');
const ids=ITEMS.map(i=>i.id);assert.deepEqual(W.advance(W.fresh(),[]).s,W.fresh());
let a=W.fresh(),b=W.fresh(),types=new Set();for(let i=0;i<300;i++){const x=W.advance(a,ids),y=W.advance(b,ids);assert.deepEqual(x,y);a=x.s;b=y.s;if(x.event)types.add(x.event.type);assert(a.heat>=0&&a.heat<=100);assert(a.nutrients>=0&&a.nutrients<=100);assert(a.oxygen>=0&&a.oxygen<=100);assert(a.history.length<=20);}
assert.equal(a.year,300000);assert.equal(a.species.length,4);assert.equal(types.size,5);
assert.equal(W.advance(W.fresh(),['planet','photosynthesis']).s.oxygen,0);assert.equal(W.advance(W.fresh(),['planet','cyanobacteria']).s.oxygen,3);
let barren=W.fresh();for(let i=0;i<100;i++)barren=W.advance(barren,['planet']).s;assert(barren.history.every(e=>['meteor','quiet'].includes(e.type)));assert.equal(barren.species.length,0);
assert.deepEqual(W.clean(JSON.parse(JSON.stringify(a))),W.clean(a));assert.deepEqual(W.clean({species:['__proto__','bogus'],history:[{type:'constructor',year:0}]}).species,[]);assert.equal(W.clean({history:[{type:'constructor',year:0}]}).history.length,0);assert.equal(W.clean({year:Infinity}).year,0);assert.equal(W.advance({...a,year:1e9},ids).s.year,1e9);
console.log('PASS: deterministic events, conditions, lineage prerequisites, bounded history/values, legacy saves, hostile import fields, year cap.');
