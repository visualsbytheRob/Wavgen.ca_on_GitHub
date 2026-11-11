// Build-only URL rewrite: no uploads, credentials or changes to page content.
const fs=require('node:fs'),path=require('node:path');
const manifest=require('../config/media-manifest.json');
const root=path.resolve(__dirname,'../_site');
const base=(process.env.MEDIA_BASE_URL||manifest.baseUrl).replace(/\/$/,'');
if(!/^https:\/\//.test(base)&&!/^http:\/\/(127\.0\.0\.1|localhost)(:\d+)?$/.test(base))throw Error('Media base must be HTTPS or localhost');
const replacements=manifest.entries.map(e=>[e.path,base+'/'+e.key]);
function walk(dir){return fs.readdirSync(dir,{withFileTypes:true}).flatMap(e=>e.isDirectory()?walk(path.join(dir,e.name)):[path.join(dir,e.name)]);}
let rewritten=0,removed=0;
for(const file of walk(root)){
 if(/\.(png|jpe?g|webp|gif|svg|avif|ico|bmp|tiff?)$/i.test(file)){fs.unlinkSync(file);removed++;continue;}
 if(!/\.(html|css|js|json|xml|webmanifest)$/i.test(file))continue;
 let s=fs.readFileSync(file,'utf8'),old=s;
 for(const [local,remote] of replacements){
  s=s.split('https://www.wavgen.ca'+local).join(remote).split('https://wavgen.ca'+local).join(remote);
  s=s.split(local).join(remote);
 }
 // Avoid stale same-origin scripts retaining the old image paths at cutover.
 if(file.endsWith('.html'))s=s.replace(/(<script\b[^>]*\bsrc=["'])(\/[^"'?]+\.js)(["'])/g,'$1$2?media=r2-v1$3');
 if(s!==old){fs.writeFileSync(file,s);rewritten++;}
}
console.log(`External images: ${manifest.entries.length} paths, ${rewritten} text files rewritten, ${removed} stale output images removed; ${base}`);
