const fs=require('node:fs');const assert=require('node:assert/strict');const vm=require('node:vm');
(async()=>{
 const {parse}=await import('parse5');
 const original=fs.readFileSync('reference/touchdesigner-community-tools-scan.html','utf8');
 const built=fs.readFileSync('_site/video/touchdesigner-signal-flow/community-tools-scan/index.html','utf8');
 const sourceScript=original.match(/<script>([\s\S]*?)<\/script>/)[1];
 const portScript=fs.readFileSync('src/assets/community-tools-scan.js','utf8');
 assert.equal(portScript,'(()=>{\n'+sourceScript+'\n})();\n','Original catalogue data and behaviours must be byte-for-byte unchanged');
 const literal=sourceScript.match(/var ENTRIES\s*=\s*(\[[\s\S]*?\n\]);/)[1];
 const entries=vm.runInNewContext('('+literal+')',{}, {timeout:100});assert.equal(entries.length,26);
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
 assert.equal(norm(text(portBody)),norm(text(sourceBody)),'All static copy, badges and table fields must survive');
 function links(n,a=[]){if(n.tagName==='a')a.push(attr(n,'href'));for(const c of n.childNodes||[])links(c,a);return a;}
 assert.deepEqual(links(portBody),links(sourceBody),'All static links must survive in the same order');
 const sourceMcp=find(doc,n=>attr(n,'id')==='mcp'),portMcp=find(out,n=>attr(n,'id')==='mcp');assert.equal(norm(text(sourceMcp)),norm(text(portMcp)));
 assert(!find(portBody,n=>n.tagName==='iframe'),'Port must be native HTML');
 assert(fs.readFileSync('_site/video/touchdesigner-signal-flow/index.html','utf8').includes('href="/video/touchdesigner-signal-flow/community-tools-scan/"'));
 console.log('PASS: 26 complete entries; exact script/data parity; all remaining static copy, badges, links and MCP table preserved; native page and parent link.');
})().catch(e=>{console.error(e);process.exitCode=1});
