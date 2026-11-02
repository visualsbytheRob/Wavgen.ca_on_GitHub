const fs=require('fs'),path=require('path'),zlib=require('zlib');
const root=path.resolve('_site');
const files=fs.readdirSync(root,{recursive:true}).filter(p=>fs.statSync(path.join(root,p)).isFile()).sort();
const manifest=files.map(file=>{const b=fs.readFileSync(path.join(root,file));return {file:file.replaceAll('\\','/'),bytes:b.length,gzip:zlib.gzipSync(b,{level:9}).length};});
const pages=['index.html','data/index.html','data/webdev/index.html','data/big-data/index.html'].map(file=>{
 const html=fs.readFileSync(path.join(root,file),'utf8');
 const refs=[...html.matchAll(/<(?:script|link)\b[^>]*(?:src|href)=["'](\/[^"']+)["'][^>]*>/g)].map(m=>m[1]).filter(p=>/\.(js|css)$/.test(p));
 const assets=[...new Set(refs)].map(p=>manifest.find(f=>f.file===p.slice(1)));
 if(assets.some(a=>!a))throw Error('Missing asset: '+file);
 const own=manifest.find(f=>f.file===file);
 return {file,assetRequests:assets.length,duplicateIncludes:refs.length-assets.length,bytes:own.bytes+assets.reduce((s,a)=>s+a.bytes,0),gzip:own.gzip+assets.reduce((s,a)=>s+a.gzip,0)};
});
const result={method:'Uncompressed and gzip level 9 filesystem bytes; page HTML plus distinct directly linked local CSS/JS. Not a network timing or Core Web Vitals claim. External fonts, images and runtime requests excluded from page subtotal; included local files remain in deployment total.',files:manifest.length,bytes:manifest.reduce((s,a)=>s+a.bytes,0),gzip:manifest.reduce((s,a)=>s+a.gzip,0),pages,manifest};
fs.writeFileSync(process.argv[2]||'measurement.json',JSON.stringify(result,null,2));console.log(JSON.stringify({...result,manifest:undefined},null,2));
