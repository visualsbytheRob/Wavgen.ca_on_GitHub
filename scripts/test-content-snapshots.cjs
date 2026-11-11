const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict'),vm=require('node:vm');
const map=require('../src/_data/contentSnapshots.json');
const media=require('../config/media-manifest.json');
const base=process.env.MEDIA_BASE_URL||media.baseUrl;
const context={window:{}};
vm.runInNewContext(fs.readFileSync('src/assets/content-snapshots.js','utf8').split('\n')[0],context);
assert.equal(JSON.stringify(context.window.wavgenContentSnapshots),JSON.stringify(map),'Browser and build manifests agree');
assert.equal(Object.keys(map).length,28);
let count=0;
for(const [key,images] of Object.entries(map)){
  assert.equal(images.length,7,key);
  assert.equal(new Set(images.map(i=>i.url)).size,7,key);
  const built=fs.readFileSync(path.join('_site',key==='home'?'':key,'index.html'),'utf8');
  for(const image of images){
    const entry=media.entries.find(e=>e.path===image.url);
    assert(entry && entry.bytes>1000,image.url);
    const surface=['home','music','video','art','data'].includes(key)?fs.readFileSync('_site/assets/visual-feed.json','utf8'):built;
    assert(surface.includes(base+'/'+entry.key),key+' includes '+image.url);
    const [url,anchor]=image.href.split('#');
    const target=path.join('_site',url,url.endsWith('/')?'index.html':'');
    assert(fs.existsSync(target),image.href);
    if(anchor&&url.startsWith('/worlds/'))assert(fs.readFileSync(target,'utf8').includes('id="'+anchor+'"'),image.href);
    count++;
  }
}
const parent=fs.readFileSync('_site/video/touchdesigner-signal-flow/index.html','utf8');
assert(parent.includes('td-hero-links'));assert(parent.includes('td-scan-primary'));
assert.equal((parent.match(/<details>/g)||[]).length,3);
console.log(`PASS: ${count} images across 28 pages; seven each; build/browser parity; image files and destinations; TouchDesigner hierarchy.`);
