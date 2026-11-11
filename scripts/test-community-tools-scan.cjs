const fs=require('node:fs');const assert=require('node:assert/strict');const vm=require('node:vm');
(async()=>{
 const {parse}=await import('parse5');
 const original=fs.readFileSync('reference/touchdesigner-community-tools-scan.html','utf8');
 const built=fs.readFileSync('_site/video/touchdesigner-signal-flow/community-tools-scan/index.html','utf8');
 const sourceScript=original.match(/<script>([\s\S]*?)<\/script>/)[1];
 const portScript=fs.readFileSync('src/assets/community-tools-scan.js','utf8');

 const literal=portScript.match(/var ENTRIES\s*=\s*(\[[\s\S]*?\n\]);/)[1];
 const entries=vm.runInNewContext('('+literal+')',{}, {timeout:100});assert.equal(entries.length,25);
 const oldEntries=vm.runInNewContext('('+sourceScript.match(/var ENTRIES\s*=\s*(\[[\s\S]*?\n\]);/)[1]+')');
 const expected=JSON.parse(JSON.stringify(oldEntries)).filter(e=>e.creator!=='Okamirufu').map((e,i)=>{
   const oldN=e.n;e.n=i+1;e.anchor='tool-'+oldN;
   for(const k of Object.keys(e))if(typeof e[k]==='string')e[k]=e[k].replaceAll('TDFam','TDXFam').replaceAll('TDMap','TDXMap');
   if(e.creator.startsWith('SARV')){
     e.tool=e.tool.replace(' · PTE — Path Tracing Engine','');
     e.what=e.what.replace(' PTE, a real-time path tracing renderer built on Vulkan RayQuery (POPs only, beta);','');
   }
   if(e.creator==='Darien Brito')e.lic=e.lic.replace('TDMorph is MIT','TDXMorph is MIT');
   return e;
 });
 assert.deepEqual(JSON.parse(JSON.stringify(entries)),expected,'Only approved catalogue edits; every other field and link preserved');
 assert.deepEqual(Array.from(entries,e=>e.n),Array.from({length:25},(_,i)=>i+1));
 assert.equal(entries.find(e=>e.creator==='Derivative (official)').anchor,'tool-24');
 assert(!/Okamirufu|TDFam|\bTDMap\b/.test(portScript));
 assert(!/\bTDMorph\b/.test(portScript.replace('formerly TDMorph','')));
 assert(!/\bPTE\b/.test(JSON.stringify(entries[0])));
 for(const e of entries)for(const key of ['n','creator','tool','cats','what','bg','dist','price','priceV','lic','licV','inst','url','urlLabel'])assert(key in e,`${e.n}: ${key}`);
 function find(n,p){if(p(n))return n;for(const c of n.childNodes||[]){const x=find(c,p);if(x)return x;}}
 const attr=(n,k)=>(n.attrs||[]).find(a=>a.name===k)?.value;
 function text(n){if(n.nodeName==='#text')return n.value;if(['script','style'].includes(n.tagName))return '';return(n.childNodes||[]).map(text).join(' ');}
 const norm=s=>s.replace(/\s+/g,' ').trim();const doc=parse(original),out=parse(built);
 // Rob approved removing the editorial corrections callout from both live pages.
 const correction=find(doc,n=>n.tagName==='div' && attr(n,'class')==='callout' && text(n).includes('Two corrections from the scan:'));
 assert(correction,'Reference retains the original corrections note');
 correction.parentNode.childNodes=correction.parentNode.childNodes.filter(n=>n!==correction);
 assert(!built.includes('Two corrections from the scan:'),'Corrections note must not appear on the live scan');
 const sourceBody=find(doc,n=>n.tagName==='body');const portBody=find(out,n=>attr(n,'class')==='community-tools-scan');
 const expectedStatic=norm(text(sourceBody)).replaceAll('TDFam','TDXFam').replace('26 Catalogue entries','25 Catalogue entries').replace('10 + 16','10 + 15').replace('26 entries','25 entries').replace(', Okamirufu','').replace('T3D grew into TDXFam',"RayTK was the first custom operator family, inspiring Josef Pelz's T3D and the custom families that followed. T3D grew into TDXFam");
 assert.equal(norm(text(portBody)),expectedStatic,'Only approved static copy edits');
 for(const file of ['_site/video/touchdesigner-signal-flow/index.html','_site/video/touchdesigner-signal-flow/community-tools-scan/index.html']){
   const html=fs.readFileSync(file,'utf8');
   assert(!/Okamirufu|TDFam|26 catalogue entries|26 entries/.test(html));
   assert(html.includes('<b>25</b><span>Catalogue entries</span>'));
   for(const stat of ['<b>5+</b>','<b>86</b>','<b>1,361</b>'])assert(html.includes(stat));
   assert(html.includes('id="catalogue"'));
 }
 function links(n,a=[]){if(n.tagName==='a')a.push(attr(n,'href'));for(const c of n.childNodes||[])links(c,a);return a;}
 assert.deepEqual(links(portBody),links(sourceBody),'All static links must survive in the same order');
 const sourceMcp=find(doc,n=>attr(n,'id')==='mcp'),portMcp=find(out,n=>attr(n,'id')==='mcp');assert.equal(norm(text(sourceMcp)).replaceAll('TDFam','TDXFam'),norm(text(portMcp)));
 assert(!find(portBody,n=>n.tagName==='iframe'),'Port must be native HTML');
 assert(fs.readFileSync('_site/video/touchdesigner-signal-flow/index.html','utf8').includes('href="/video/touchdesigner-signal-flow/community-tools-scan/"'));
 console.log('PASS: 25 complete entries; approved feedback only; stable anchors, links, badges, MCP table and count surfaces preserved.');
})().catch(e=>{console.error(e);process.exitCode=1});
