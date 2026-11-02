// Compare every original rendered element, ignoring only added skip links and boxless landmarks.
// Usage: node scripts/layoutdiff.js BASELINE_BUILD [CURRENT_BUILD]
const fs=require('fs'),path=require('path'),http=require('http'),assert=require('assert/strict');
const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright');
const roots=[path.resolve(process.argv[2]||(fs.existsSync('_site-baseline')?'_site-baseline':'.cache/a11y-baseline/_site')),path.resolve(process.argv[3]||'_site')];
const server=http.createServer((req,res)=>{const u=new URL(req.url,'http://localhost');const index=Number(u.pathname[1]);const root=roots[index];let p=path.join(root,u.pathname.slice(2));if(fs.existsSync(p)&&fs.statSync(p).isDirectory())p=path.join(p,'index.html');if(!p.startsWith(root+path.sep)||!fs.existsSync(p)){res.writeHead(404).end();return;}res.setHeader('Content-Type',({'.html':'text/html','.js':'text/javascript','.css':'text/css'})[path.extname(p)]||'application/octet-stream');res.end(fs.readFileSync(p));});
(async()=>{
 await new Promise(r=>server.listen(0,'127.0.0.1',r));const origin=`http://127.0.0.1:${server.address().port}`;
 const browser=await chromium.launch({headless:true,...(process.env.CHROME_PATH?{executablePath:process.env.CHROME_PATH}:{})});
 const routes=[...fs.readdirSync(path.join(roots[0],'worlds')).filter(f=>f.endsWith('.html')).map(f=>'worlds/'+f),'index.html','data/index.html','data/big-data/index.html','diary/index.html','music/ableton/index.html'];
 const diffs=[];let elements=0;
 try{
 for(const width of [390,1280])for(const route of routes){
  console.log('Comparing',width,route);
  const snapshots=[];
  for(let i=0;i<2;i++){
   const page=await browser.newPage({javaScriptEnabled:false,viewport:{width,height:800},colorScheme:'light'});
   await page.route('**/*',r=>{const url=r.request().url();if(!url.startsWith(origin))return r.abort();const u=new URL(url);if(!/^\/[01]\//.test(u.pathname))return r.continue({url:origin+'/'+i+u.pathname});return r.continue();});
   await page.goto(`${origin}/${i}/${route}`);
   await page.evaluate(addApprovedFeed => {
    // Compose the original approved feed footer into the baseline only.
    // Existing elements are still compared; unexpected feed markup/layout fails.
    if(addApprovedFeed){const footer=document.querySelector('footer.bg-wavgen-dark-purple .border-t');if(footer){
      const p=document.createElement('p');p.className='mt-4 text-sm';
      p.innerHTML='<a href="/feed.xml" type="application/atom+xml" class="inline-flex items-center gap-2 text-gray-300 hover:text-wavgen-yellow transition-colors"><svg class="w-4 h-4 flex-shrink-0" viewBox="0 0 16 16" aria-hidden="true"><circle cx="3" cy="13" r="1.5" fill="currentColor" /><path d="M3 8a5 5 0 0 1 5 5M3 3a10 10 0 0 1 10 10" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" /></svg> Diary feed </a>';footer.append(p);
    }}
    const style=document.createElement('style');style.textContent='*,*::before,*::after{animation:none!important;transition:none!important;caret-color:transparent!important}';document.head.append(style);
    document.querySelectorAll('svg').forEach(svg => { svg.pauseAnimations?.(); svg.setCurrentTime?.(0); });
    // Eleventy preserves nondeterministic read order for entries with equal dates.
    // Normalize only equal-date timeline groups, retaining every original node.
    const articles=[...document.querySelectorAll('#log article')];
    const groups=new Map();
    for(const article of articles){const date=article.firstElementChild?.firstElementChild?.textContent; if(!groups.has(date))groups.set(date,[]);groups.get(date).push(article);}
    for(const group of groups.values()){if(group.length<2)continue;const slots=group.map(el=>{const marker=document.createComment('timeline slot');el.replaceWith(marker);return marker;});group.sort((a,b)=>a.textContent.localeCompare(b.textContent));slots.forEach((slot,n)=>slot.replaceWith(group[n]));}
   }, i===0 && process.env.LAYOUT_APPROVED_FEED==='1');
   snapshots.push(await page.evaluate(()=>[...document.body.querySelectorAll('*')].filter(el=>!el.matches('script,style,link,.wg-skip-link,.wg-a11y-main')).map(el=>{
    const s=getComputedStyle(el),r=el.getBoundingClientRect();
    const data={id:el.id,classes:el.getAttribute('class'),rect:[r.x,r.y,r.width,r.height].map(n=>Math.round(n*100)/100)};
    for(const k of ['display','position','color','backgroundColor','backgroundImage','fontFamily','fontSize','fontWeight','lineHeight','letterSpacing','padding','margin','border','borderRadius','opacity','transform','boxShadow'])data[k]=s[k];
    for(const pseudo of ['::before','::after']){const p=getComputedStyle(el,pseudo);data[pseudo]=[p.content,p.display,p.color,p.fontSize,p.backgroundColor];}
    return data;
   })));
   await page.close();
  }
  elements+=snapshots[0].length;
  if(snapshots[0].length!==snapshots[1].length)diffs.push({route,width,counts:snapshots.map(s=>s.length)});
  else for(let n=0;n<snapshots[0].length;n++){
   const a=snapshots[0][n],b=snapshots[1][n];
   // Existing main gains an ID only when it did not have one.
   if(!a.id&&['wg-main','wg-content'].includes(b.id))a.id=b.id;
   if(JSON.stringify(a)!==JSON.stringify(b))diffs.push({route,width,element:n,before:a,after:b});
  }
 }
 fs.writeFileSync('layoutdiff-results.json',JSON.stringify({routes:routes.length,widths:[390,1280],elements,differences:diffs},null,2));
 console.log(JSON.stringify({routes:routes.length,elements,differences:diffs.length,examples:diffs.slice(0,3)},null,2));
 assert.equal(diffs.length,0,'Visual/layout differences require resolution');
 }finally{await browser.close();server.close();}
})().catch(e=>{console.error(e);server.close();process.exitCode=1;});
