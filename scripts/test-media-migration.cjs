const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const m=require('../config/media-manifest.json'),promote=require('../src/assets/gallery-variety.js'),art=require('../src/_data/approvedImages.json');
const base=(process.env.MEDIA_BASE_URL||m.baseUrl).replace(/\/$/,'');
function walk(dir){return fs.readdirSync(dir,{withFileTypes:true}).flatMap(e=>e.isDirectory()?walk(path.join(dir,e.name)):[path.join(dir,e.name)]);}
const files=walk('_site');assert(!files.some(f=>/\.(png|jpe?g|webp|gif|svg|avif|ico)$/i.test(f)),'No image library in Pages output');
assert.equal(new Set(m.entries.map(e=>e.path)).size,m.entries.length);
for(const file of files.filter(f=>/\.(html|js|json|xml|css|webmanifest)$/.test(f))){
 const s=fs.readFileSync(file,'utf8');
 for(const e of m.entries)assert(!s.includes(e.path),'Unmigrated image URL '+file+': '+e.path);
 assert(!s.includes('https://wavgen.cahttps://'),'No malformed absolute media URL');
}
for(const page of ['index.html','music/index.html','video/touchdesigner-signal-flow/index.html'])assert(fs.readFileSync('_site/'+page,'utf8').includes(base+'/'),'R2 images on '+page);
const pools=promote(art),all=new Set(Object.values(art).flat().map(i=>i.url));assert.equal(pools.home.length,all.size);
for(const key of ['home','music','video','art','data']){
 assert.equal(pools[key].length,new Set(pools[key].map(i=>i.url)).size,'No repeated image in '+key);
 for(const i of pools[key])assert(i.href && all.has(i.url),'Approved and linked only');
}
console.log('PASS: no images in Pages; all known image URLs externalized; parent pools deduplicated, approved and linked.');
console.log('Gallery counts:',Object.fromEntries(['home','music','video','art','data'].map(k=>[k,pools[k].length])));
