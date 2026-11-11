const fs=require('node:fs'),assert=require('node:assert/strict'),path=require('node:path');
const feed=require('../src/_data/visualFeed');const cards=require('../src/_data/visualCards');const tracks=require('../src/_data/latestTracks.json');
const approved=require('../src/_data/approvedImages.json');
const media=require('../config/media-manifest.json');
const approvedCount=new Set(Object.values(approved).flat().map(i=>i.url)).size;
assert.equal(feed.counts.artwork,approvedCount);
assert.equal(feed.items.length,Object.values(feed.counts).reduce((a,b)=>a+b,0));assert.equal(new Set(feed.items.map(i=>i.id)).size,feed.items.length);
assert.equal(Object.values(cards).flat().length,70);
for(const item of feed.items){
 assert(item.title&&item.image&&item.href,item.id);
 assert(!/\/review\/|Originals|MediaMaster|[A-Z]:\\/.test(JSON.stringify(item)),'Private review paths must not enter the feed');
 if(item.image.startsWith('/'))assert(media.entries.some(e=>e.path===item.image),item.image);
 if(item.href.startsWith('/')){const url=item.href.split('#')[0];assert(fs.existsSync(path.join('_site',url,url.endsWith('/')?'index.html':'')),item.href);}
}
for(const [section,items] of Object.entries(cards)){
 const html=fs.readFileSync(path.join('_site',section==='home'?'':section,'index.html'),'utf8');
 assert.equal((html.match(/class="visual-content-card"/g)||[]).length,14,section);
 for(const card of items)assert(html.includes('href="'+card.href+'"'),card.href);
}
const music=fs.readFileSync('_site/music/index.html','utf8');
for(const track of tracks.items){assert(/^https:\/\/f\d+\.bcbits\.com\/img\/a/.test(track.artwork_url));assert(music.includes(track.artwork_url),track.title);}
const art=fs.readFileSync('_site/art/index.html','utf8');assert.equal((art.match(/class="card-photo"/g)||[]).length,4);assert(!/onclick="window.location.href='\/art\//.test(art));
console.log('PASS: '+feed.items.length+' unique feed entries, 70 image links, six official album covers, native Art card links, no private review assets.');
