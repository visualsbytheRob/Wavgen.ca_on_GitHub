// Prepare faithful excerpts of existing page content for browser screenshots.
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
(async()=>{
 const {parse}=await import('parse5');
 const pages=require('../src/_data/navigation').main.flatMap(p=>[p,...(p.children||[])]);
 pages.push({title:'Community Tools Scan',url:'/video/touchdesigner-signal-flow/community-tools-scan/'});
 const output=path.resolve('../media-review/content-capture'); fs.mkdirSync(output,{recursive:true});
 const attr=(n,k)=>(n.attrs||[]).find(a=>a.name===k)?.value;
 const text=n=>n.nodeName==='#text'?n.value:['script','style','nav','button','svg'].includes(n.tagName)?'':(n.childNodes||[]).map(text).join(' ');
 const clean=s=>s.replace(/\s+/g,' ').trim();
 const all=(n,p,a=[])=>{if(p(n))a.push(n);for(const c of n.childNodes||[])all(c,p,a);return a;};
 const original=fs.readFileSync('reference/touchdesigner-community-tools-scan.html','utf8');
 const entries=vm.runInNewContext('('+original.match(/var ENTRIES\s*=\s*(\[[\s\S]*?\n\]);/)[1]+')',{}, {timeout:100});
 const records=[];
 for(const page of pages){
  const key=page.url.replace(/^\/+|\/+$/g,'')||'home';
  const doc=parse(fs.readFileSync(path.join('_site',page.url,'index.html'),'utf8'));
  let candidates=[];
  if(page.url.includes('touchdesigner-signal-flow')){
   candidates=[5,6,8,10,11,12,24].map(num=>{const e=entries.find(x=>x.n===num);return {title:e.creator,subtitle:e.tool,body:e.what,href:page.url+'#tool-'+num,heading:e.creator};});
  }else{
   function collect(root,url){
    for(const h of all(root,n=>(['h2','h3'].includes(n.tagName)||/(^| )section-title( |$)/.test(attr(n,'class')||'')))){
     const title=clean(text(h));if(!title||title.startsWith('Explore ')||['Explore','Gallery','The Waveform Generation'].includes(title))continue;
     const parent=h.parentNode;let body=clean(text(parent)).replace(title,'').trim();
     if(body.length<30){let a=parent;for(let i=0;i<2&&body.length<30&&a.parentNode;i++){a=a.parentNode;body=clean(text(a)).replace(title,'').trim();}}
     if(body.length<30)continue;
     let anchor=attr(h,'id');let a=h;while(!anchor&&a.parentNode){a=a.parentNode;anchor=attr(a,'id');}
     candidates.push({title,body,heading:title,href:url+(anchor?'#'+anchor:''),sourceUrl:url});
    }
   }
   const main=all(doc,n=>n.tagName==='main')[0]||doc;collect(main,page.url);
   for(const iframe of all(main,n=>n.tagName==='iframe')){
    const src=attr(iframe,'src');if(!src?.startsWith('/worlds/'))continue;
    const file=path.join('_site',src,src.endsWith('/')?'index.html':'');if(fs.existsSync(file))collect(parse(fs.readFileSync(file,'utf8')),src);
   }
   candidates=candidates.filter((x,i,a)=>a.findIndex(y=>y.title===x.title)===i);
   if(candidates.length<7){
    for(const p of all(main,n=>n.tagName==='p')){const body=clean(text(p));if(body.length>80&&!candidates.some(c=>c.body===body))candidates.push({title:page.title,body,heading:page.title,href:page.url,sourceUrl:page.url});if(candidates.length>=7)break;}
   }
   if(candidates.length<7)throw new Error(page.url+': only '+candidates.length+' content excerpts');
   candidates=Array.from({length:7},(_,i)=>candidates[Math.floor(i*candidates.length/7)]);
  }
  candidates.forEach((c,i)=>records.push({...c,page:page.title,pageUrl:page.url,key,index:i+1,id:records.length,image:'/images/content-snapshots/'+key.replaceAll('/','-')+'-'+(i+1)+'.jpg'}));
 }
 fs.writeFileSync(path.join(output,'records.json'),JSON.stringify(records,null,2));
 fs.writeFileSync(path.join(output,'index.html'),`<!doctype html><html><head><meta charset="utf-8"><style>*{box-sizing:border-box}body{margin:0;background:#0f172a;color:white;font-family:Arial,sans-serif}.card{width:1000px;height:660px;padding:48px;border:3px solid #340093;border-top:12px solid #fedd00;background:linear-gradient(125deg,#1e293b,#170d38);display:flex;flex-direction:column}.kicker{color:#fedd00;text-transform:uppercase;font-size:18px;letter-spacing:2px}h1{font-size:38px;line-height:1.15;margin:24px 0 18px}h2{font-size:22px;color:#fedd00;margin:0 0 20px}p{font-size:24px;line-height:1.55;margin:0;color:#e2e8f0}.footer{margin-top:auto;display:flex;justify-content:space-between;border-top:1px solid #6366f1;padding-top:18px;color:#fedd00;font-size:18px}</style></head><body><article class="card"><div class="kicker" id="page"></div><h1 id="title"></h1><h2 id="subtitle"></h2><p id="body"></p><footer class="footer"><span>THE WAVEFORM GENERATION</span><span id="count"></span></footer></article><script>fetch('records.json').then(r=>r.json()).then(records=>{const r=records[Number(new URLSearchParams(location.search).get('id'))||0];for(const k of ['page','title','subtitle'])document.getElementById(k).textContent=r[k]||'';const t=r.body;document.getElementById('body').textContent=t.length>550?t.slice(0,550).replace(/\\s+\\S*$/,'')+'…':t;document.getElementById('count').textContent=r.index+' / 7 · Explore the full section';document.title=r.page+' — '+r.title;document.body.dataset.ready=String(r.id);});</script></body></html>`);
 console.log(records.length+' screenshots prepared across '+pages.length+' pages.');
})();
