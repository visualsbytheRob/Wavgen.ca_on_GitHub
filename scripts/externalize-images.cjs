// Build-only URL rewrite: no uploads, credentials or changes to page content.
const fs=require('node:fs'),path=require('node:path');
const manifest=require('../config/media-manifest.json');
const root=path.resolve(__dirname,'../_site');
const shelfCutouts = new Set([
 path.join(root, 'assets', 'shelf', 'home.webp'),
 path.join(root, 'assets', 'shelf', 'music.webp'),
 path.join(root, 'assets', 'shelf', 'art.webp'),
 path.join(root, 'assets', 'shelf', 'about.webp'),
 path.join(root, 'assets', 'shelf', 'cloud-computing.webp'),
 path.join(root, 'assets', 'shelf', 'touchdesigner-banana.webp'),
 ...['home.webp', 'music.webp', 'banana.webp', 'cloud.webp', 'art.webp', 'about.webp',
     'coin.jpg', 'coin-totem.jpg', 'coin-portrait.jpg']
  .map(name => path.join(root, 'assets', 'film-shelf-v1', 'media', name)),
]);
const navigationObjects = new Set(['home', 'music', 'art', 'about']
 .map(name => path.join(root, 'assets', 'navigation', name + '.webp')));
const base=(process.env.MEDIA_BASE_URL||manifest.baseUrl).replace(/\/$/,'');
if(!/^https:\/\//.test(base)&&!/^http:\/\/(127\.0\.0\.1|localhost)(:\d+)?$/.test(base))throw Error('Media base must be HTTPS or localhost');
const replacements=manifest.entries.map(e=>[e.path,base+'/'+e.key]);
function walk(dir){return fs.readdirSync(dir,{withFileTypes:true}).flatMap(e=>e.isDirectory()?walk(path.join(dir,e.name)):[path.join(dir,e.name)]);}
let rewritten=0,removed=0;
for(const file of walk(root)){
 if(/\.(png|jpe?g|webp|gif|svg|avif|ico|bmp|tiff?)$/i.test(file)){
  // These foreground cutouts are authored and versioned with the shelf.
  if(!shelfCutouts.has(file) && !navigationObjects.has(file)){fs.unlinkSync(file);removed++;}
  continue;
 }
 if(!/\.(html|css|js|json|xml|webmanifest)$/i.test(file))continue;
 let s=fs.readFileSync(file,'utf8'),old=s;
 for(const [local,remote] of replacements){
  s=s.split('https://www.wavgen.ca'+local).join(remote).split('https://wavgen.ca'+local).join(remote);
  s=s.split(local).join(remote);
 }
 // Avoid stale same-origin scripts retaining the old image paths at cutover.
 if(file.endsWith('.html'))s=s.replace(/(<script\b[^>]*\bsrc=["'])(\/[^"'?]+\.js)(["'])/g,'$1$2?media=instagram-v1$3');
 if(s!==old){fs.writeFileSync(file,s);rewritten++;}
}
console.log(`External images: ${manifest.entries.length} paths, ${rewritten} text files rewritten, ${removed} stale output images removed; ${base}`);
