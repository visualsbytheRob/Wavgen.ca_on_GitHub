// Run after npm run build. PLAYWRIGHT_MODULE and CHROME_PATH support local installations.
const fs = require('fs');
const path = require('path');
const http = require('http');
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const root = path.resolve(process.env.AUDIT_ROOT || '_site');
const pages = fs.readdirSync(root, {recursive:true}).filter(p => p.endsWith('.html') && !p.startsWith('worlds'+path.sep));
const server = http.createServer((req,res) => {
  let p=path.join(root,decodeURIComponent(new URL(req.url,'http://localhost').pathname));
  if(fs.existsSync(p)&&fs.statSync(p).isDirectory())p=path.join(p,'index.html');
  if(!p.startsWith(root+path.sep)||!fs.existsSync(p)){res.writeHead(404).end();return;}
  res.setHeader('Content-Type',({'.html':'text/html','.css':'text/css','.js':'text/javascript'})[path.extname(p)]||'application/octet-stream');res.end(fs.readFileSync(p));
});
(async()=>{
 await new Promise(r=>server.listen(0,'127.0.0.1',r));
 const origin=`http://127.0.0.1:${server.address().port}`;
 const browser=await chromium.launch({headless:true,...(process.env.CHROME_PATH?{executablePath:process.env.CHROME_PATH}:{})});
 const results=[];
 try {
  const page=await browser.newPage({colorScheme:'dark',javaScriptEnabled:false,viewport:{width:1280,height:800}});
  await page.route('**/*',r=>r.request().url().startsWith(origin)&&!r.request().url().includes('/worlds/')?r.continue():r.abort());
  for(const file of pages){
   await page.goto(origin+'/'+file.replaceAll('\\','/'));
   const result=await page.evaluate(()=>{
    const parse=s=>(s.match(/[\d.]+/g)||[]).map(Number);
    const over=(a,b)=>a.slice(0,3).map((v,i)=>v*(a[3]??1)+b[i]*(1-(a[3]??1)));
    const lum=c=>c.map(v=>v/255).map(v=>v<=.04045?v/12.92:((v+.055)/1.055)**2.4).reduce((s,v,i)=>s+v*[.2126,.7152,.0722][i],0);
    const pairs=new Map();let nodes=0;let complex=0;
    function inspect(el,pseudo){
     const st=getComputedStyle(el,pseudo), rect=el.getBoundingClientRect();
     if(!rect.width||!rect.height||st.visibility==='hidden'||st.display==='none')return;
     let backgrounds=[[255,255,255]], layers=[], uncertain=false;
     for(let p=el;p;p=p.parentElement){const s=getComputedStyle(p);if(s.display==='none'||s.visibility==='hidden'||Number(s.opacity)===0)return;layers.unshift(s);}
     for(const s of layers){
      const color=parse(s.backgroundColor);
      if((color[3]??1)===1){backgrounds=[color.slice(0,3)];uncertain=false;}
      else backgrounds=backgrounds.map(bg=>over(color,bg));
      if(s.backgroundImage!=='none'){
       if(s.backgroundClip==='text'){uncertain=true;continue;}
       const stops=s.backgroundImage.match(/rgba?\([^)]+\)/g);
       if(!s.backgroundImage.includes('url(')&&stops?.length){backgrounds=backgrounds.flatMap(bg=>stops.map(stop=>over(parse(stop),bg)));}
       else uncertain=true;
      }
     }
     // Image backgrounds need visual review. Gradient stops are conservatively checked at the worst endpoint.
     if(uncertain){complex++;return;}
     const samples=backgrounds.map(bg=>{let fg=over(parse(st.color),bg);if(Number(st.opacity)<1)fg=over([...fg,Number(st.opacity)],bg);const l1=lum(fg),l2=lum(bg);return {bg,fg,ratio:(Math.max(l1,l2)+.05)/(Math.min(l1,l2)+.05)};});
     const {fg,bg,ratio}=samples.sort((a,b)=>a.ratio-b.ratio)[0];
     const large=parseFloat(st.fontSize)>=24||(parseFloat(st.fontSize)>=18.66&&parseInt(st.fontWeight)>=700);
     const key=JSON.stringify([fg,bg,large,pseudo||'text']);
     if(!pairs.has(key))pairs.set(key,{fg,bg,ratio:+ratio.toFixed(2),required:large?3:4.5,selector:el.tagName.toLowerCase()+(el.id?'#'+el.id:'')+'.'+String(el.className).trim().replaceAll(' ','.'),pseudo:pseudo||null});
    }
    const walker=document.createTreeWalker(document.body,NodeFilter.SHOW_TEXT);
    while(walker.nextNode()){const n=walker.currentNode;if(n.textContent.trim()&&!['SCRIPT','STYLE','NOSCRIPT'].includes(n.parentElement.tagName)){nodes++;inspect(n.parentElement);}}
    document.querySelectorAll('[placeholder]').forEach(el=>inspect(el,'::placeholder'));
    return {nodes,complex,pairs:[...pairs.values()],height:document.documentElement.scrollHeight};
   });
   results.push({page:'/'+file.replaceAll('\\','/'),...result});
  }
  const failures=results.flatMap(r=>r.pairs.filter(p=>p.ratio<p.required).map(p=>({page:r.page,...p})));
  if (process.env.CONTRAST_CHECK) { const expected=require('../tests/known-contrast.json'); require('assert/strict').deepEqual(failures,expected); }
  const report={scope:'All generated shell HTML, dark media, JavaScript off, solid and gradient-stop backgrounds (worst endpoint); iframe worlds and image backgrounds require separate visual review. Repeated entries deduplicated by computed foreground/background/size/pseudo pair per page.',pages:results.length,failures,results};
  fs.writeFileSync(process.argv[2]||'contrast-results.json',JSON.stringify(report,null,2));
  console.log(JSON.stringify({pages:results.length,failures:failures.length,uniqueFailures:[...new Map(failures.map(f=>[JSON.stringify([f.fg,f.bg,f.required,f.pseudo]),f])).values()]},null,2));
 } finally {await browser.close();server.close();}
})().catch(e=>{console.error(e);server.close();process.exitCode=1;});
