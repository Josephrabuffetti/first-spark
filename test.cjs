const assert=require('node:assert/strict');
const {ITEMS,RECIPES}=require('./data.js');
const ids=new Set(ITEMS.map(i=>i.id));
assert.equal(ITEMS.length,60);assert.equal(ids.size,60);
const pairs=new Set();
for(const [a,b,c] of RECIPES){assert(ids.has(a)&&ids.has(b)&&ids.has(c),'Unknown ingredient');const pair=[a,b].sort().join('|');assert(!pairs.has(pair),'Ambiguous recipe');pairs.add(pair);}
const found=new Set(ITEMS.slice(0,4).map(i=>i.id));let changed=true;
while(changed){changed=false;for(const [a,b,c] of RECIPES)if(found.has(a)&&found.has(b)&&!found.has(c)){found.add(c);changed=true;}}
assert.equal(found.size,ITEMS.length,'Every discovery must be reachable');assert(found.has('biosphere'),'Chapter must be completable');
for(const item of ITEMS){assert(item.note.length>30);assert(['Established science','Open question','Imagined possibility'].includes(item.science));}
// Every v4 save stays valid: all original recipes and item order remain intact.
const legacyIds=ITEMS.slice(0,40).map(i=>i.id);assert.equal(legacyIds[39],'biosphere');
const legacyFound=new Set(legacyIds.slice(0,4));for(const[a,b,c]of RECIPES.slice(0,36)){assert(legacyFound.has(a)&&legacyFound.has(b));legacyFound.add(c);}assert.equal(legacyFound.size,40);
for(const id of ['aminoacids','proteins','nucleotides','rna','dna','atp','metabolism','fermentation'])assert(found.has(id));
assert.equal(RECIPES.length,56);
console.log('PASS: 60 discoveries, 56 unique recipes, all reachable, legacy progression preserved, life expansion reachable, notes present.');
