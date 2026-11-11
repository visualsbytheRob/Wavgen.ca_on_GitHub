const fs=require('node:fs'),assert=require('node:assert/strict'),cp=require('node:child_process');
const approved=require('../src/_data/approvedImages.json'),media=require('../config/media-manifest.json');
const promote=require('../src/assets/gallery-variety.js');
const before=JSON.parse(cp.execFileSync('git',['show','5182681:src/_data/approvedImages.json'],{encoding:'utf8'}));
for(const [page,images] of Object.entries(before))assert.deepEqual(approved[page].filter(i=>i.source!=='instagram-import'),images,'Existing approvals unchanged: '+page);
const imported=Object.values(approved).flat().filter(i=>i.source==='instagram-import');
assert.equal(imported.length,240);
assert.equal(new Set(imported.map(i=>i.url)).size,240);
const pools=promote(approved);assert.equal(pools.home.length,349);assert.equal(pools.art.length,267);
for(const im of imported){
 assert(im.href.startsWith('https://www.instagram.com/'));
 for(const url of [im.url,im.thumbnail,im.poster])assert(media.entries.some(e=>e.path===url&&e.key.startsWith('site-images/')));
 for(const p of ['home','art'])assert(pools[p].some(i=>i.url===im.url&&i.href===im.href));
}
for(const file of ['index.html','art/index.html']){
 const html=fs.readFileSync('_site/'+file,'utf8');
 assert(!html.includes('instagram/video-covers/'));
 assert.equal((html.match(/class="hero-slide /g)||[]).length,file==='index.html'?349:267);
 for(const i of imported)assert(html.includes(i.href.replaceAll('&','&amp;')),'Instagram destination preserved');
}
assert.deepEqual(approved['video/touchdesigner-signal-flow'],before['video/touchdesigner-signal-flow']);
console.log('PASS: 240 Instagram stills; 349 home / 267 Art images; original approvals and TouchDesigner unchanged; Instagram destinations preserved; no Reel covers in galleries.');
