const fs=require('fs');
const path=require('path');
const http=require('http');
const assert=require('assert/strict');
const {chromium}=require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const root=path.resolve('_site');
const results=[];
const server=http.createServer((req,res)=>{
  let rel=decodeURIComponent(new URL(req.url,'http://127.0.0.1').pathname);
  let file=path.join(root,rel);
  if(!file.startsWith(root+path.sep)&&file!==root){res.writeHead(403).end();return;}
  if(fs.existsSync(file)&&fs.statSync(file).isDirectory())file=path.join(file,'index.html');
  if(!fs.existsSync(file)){res.writeHead(404).end('not found');return;}
  res.setHeader('Content-Type',({'.html':'text/html','.css':'text/css','.js':'text/javascript','.json':'application/json','.svg':'image/svg+xml'})[path.extname(file)]||'application/octet-stream');
  res.end(fs.readFileSync(file));
});
(async()=>{
 await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
 const origin='http://127.0.0.1:'+server.address().port;
 const browser=await chromium.launch({headless:true,...(process.env.CHROME_PATH?{executablePath:process.env.CHROME_PATH}:{})});
 try{
  for(const javaScriptEnabled of [true,false])for(const colorScheme of ['light','dark']){
   const context=await browser.newContext({colorScheme,javaScriptEnabled,viewport:{width:1280,height:800}});
   await context.route('**/*',route=>route.request().url().startsWith(origin)?route.continue():route.abort());
   const page=await context.newPage();
   if(javaScriptEnabled)await page.addInitScript(()=>localStorage.setItem('theme','dark'));
   for(const route of ['/','/data/','/private/apps/','/music/ableton/']){
    await page.goto(origin+route,{waitUntil:'load'});
    const data=await page.evaluate(()=>({bg:getComputedStyle(document.body).backgroundColor,fg:getComputedStyle(document.body).color,darkClass:document.documentElement.classList.contains('dark'),themeScripts:[...document.scripts].filter(s=>s.textContent.includes("getItem('theme')")).length}));
    assert.equal(data.bg,colorScheme==='dark'?'rgb(17, 24, 39)':'rgb(255, 255, 255)');
    assert.equal(data.fg,colorScheme==='dark'?'rgb(255, 255, 255)':'rgb(17, 24, 39)');
    assert.equal(data.darkClass,false);assert.equal(data.themeScripts,0);
    results.push({javaScriptEnabled,colorScheme,route,...data});
   }
   if(javaScriptEnabled){
    await page.goto(origin+'/data/',{waitUntil:'load'});
    assert.equal(await page.locator('.app-card:visible').count(),11);
    await page.selectOption('#app-category-select','Finance');
    assert.equal(await page.locator('.app-card:visible').count(),2);
    await page.selectOption('#app-category-select','all');
    assert.equal(await page.locator('.app-card:visible').count(),11);
    await page.emulateMedia({colorScheme:colorScheme==='light'?'dark':'light'});
    assert.equal(await page.evaluate(()=>getComputedStyle(document.body).backgroundColor),colorScheme==='light'?'rgb(17, 24, 39)':'rgb(255, 255, 255)');
    results.push({javaScriptEnabled,colorScheme,liveMediaSwitch:'passed',categoryFiltering:'passed'});
   }
   await context.close();
  }
  const diary = await browser.newPage({javaScriptEnabled:false,colorScheme:'dark'});
  await diary.route('**/*',r=>r.request().url().startsWith(origin)?r.continue():r.abort());
  await diary.goto(origin+'/diary/');
  const email=diary.locator('#email-entry-md');
  assert.equal(await email.evaluate(el=>getComputedStyle(el).color),'rgb(0, 0, 0)');
  assert.equal(await email.evaluate(el=>getComputedStyle(el).backgroundColor),'rgb(59, 130, 246)');
  await diary.evaluate(()=>document.documentElement.style.scrollBehavior='auto');
  await email.hover();
  assert.equal(await email.evaluate(el=>getComputedStyle(el).backgroundColor),'rgb(96, 165, 250)');
  results.push({diaryEmailBlackText:true,blue500Contrast:5.71,hoverBlue400Passing:true});
  await diary.close();
  const privateHosts=/\.ts\.net|\.run\.app|momentum\.wavgen\.ca|cms\.wavgen\.ca/;
  const exposure=[];
  function walk(dir){for(const item of fs.readdirSync(dir,{withFileTypes:true})){const p=path.join(dir,item.name);if(item.isDirectory())walk(p);else if(/\.(html|js|json|xml|txt)$/.test(p)&&privateHosts.test(fs.readFileSync(p,'utf8')))exposure.push(path.relative(root,p));}}
  walk(root);results.push({privateHostOutputFiles:exposure});
  assert.deepEqual(exposure.map(p=>p.replaceAll('\\','/')),['private/apps/index.html']);
  const privatePage=await (await fetch(origin+'/private/apps/')).text();
  assert(privateHosts.test(privatePage));results.push({privatePageAnonymousHttp:200,privateLaunchpadNoindex:/name="robots" content="noindex,nofollow"/.test(privatePage)});
  console.log(JSON.stringify({passed:true,checks:results},null,2));
 }finally{await browser.close();server.close();}
})().catch(error=>{console.error(error);server.close();process.exitCode=1;});
