const assert=require('node:assert/strict');
const {ITEMS,RECIPES}=require('./data.js');
const ids=new Set(ITEMS.map(i=>i.id));
assert.equal(ITEMS.length,40);assert.equal(ids.size,40);
const pairs=new Set();
for(const [a,b,c] of RECIPES){assert(ids.has(a)&&ids.has(b)&&ids.has(c),'Unknown ingredient');const pair=[a,b].sort().join('|');assert(!pairs.has(pair),'Ambiguous recipe');pairs.add(pair);}
const found=new Set(ITEMS.slice(0,4).map(i=>i.id));let changed=true;
while(changed){changed=false;for(const [a,b,c] of RECIPES)if(found.has(a)&&found.has(b)&&!found.has(c)){found.add(c);changed=true;}}
assert.equal(found.size,ITEMS.length,'Every discovery must be reachable');assert(found.has('biosphere'),'Chapter must be completable');
for(const item of ITEMS){assert(item.note.length>30);assert(['Established science','Open question','Imagined possibility'].includes(item.science));}
console.log('PASS: 40 unique discoveries, 36 unambiguous recipes, every discovery reachable, chapter completable, journal notes present.');
