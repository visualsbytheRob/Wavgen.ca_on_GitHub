const fs=require('fs'),path=require('path'),http=require('http'),assert=require('assert/strict');
const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright');
const root=path.resolve('_site');
const server=http.createServer((req,res)=>{let p=path.join(root,decodeURIComponent(new URL(req.url,'http://localhost').pathname));if(fs.existsSync(p)&&fs.statSync(p).isDirectory())p=path.join(p,'index.html');if(!p.startsWith(root+path.sep)||!fs.existsSync(p)){res.writeHead(404).end();return;}res.setHeader('Content-Type',({'.html':'text/html','.js':'text/javascript','.css':'text/css'})[path.extname(p)]||'application/octet-stream');res.end(fs.readFileSync(p));});
(async()=>{
 await new Promise(r=>server.listen(0,'127.0.0.1',r));const origin=`http://127.0.0.1:${server.address().port}`;
 const browser=await chromium.launch({headless:true,...(process.env.CHROME_PATH?{executablePath:process.env.CHROME_PATH}:{})});
 try{
  const page=await browser.newPage({viewport:{width:390,height:844}});
  await page.route('**/*',r=>r.request().url().startsWith(origin)?r.continue():r.abort());
  await page.goto(origin+'/');
  await page.locator('a[href="#main"]').focus();await page.keyboard.press('Enter');assert.equal(await page.evaluate(()=>document.activeElement.id),'main');
  await page.locator('#mobile-menu-btn').click();assert.equal(await page.locator('#mobile-menu-btn').getAttribute('aria-expanded'),'true');
  assert.equal(await page.locator('#mobile-nav').evaluate(n=>n.inert),false);
  await page.keyboard.press('Escape');assert.equal(await page.evaluate(()=>document.activeElement.id),'mobile-menu-btn');assert.equal(await page.locator('#mobile-nav').evaluate(n=>n.inert),true);
  await page.keyboard.press('Control+k');assert.equal(await page.evaluate(()=>document.activeElement.id),'cmdk-input');
  await page.locator('#cmdk-input').fill('data');assert.ok(await page.locator('#cmdk-results a').count()>0);
  await page.keyboard.press('Shift+Tab');assert.equal(await page.evaluate(()=>document.activeElement.parentElement.id),'cmdk-results');
  await page.keyboard.press('Tab');assert.equal(await page.evaluate(()=>document.activeElement.id),'cmdk-input');await page.keyboard.press('Escape');assert.equal(await page.evaluate(()=>document.activeElement.id),'mobile-menu-btn');
  await page.setViewportSize({width:1280,height:800});
  await page.goto(origin+'/art/painting/');
  await page.locator('.hero-slideshow').focus();await page.keyboard.press('Enter');assert.equal(await page.evaluate(()=>document.activeElement.id),'myModal');
  await page.keyboard.press('Tab');assert.equal(await page.evaluate(()=>document.activeElement.getAttribute('aria-label')),'Close gallery');
  await page.keyboard.press('Shift+Tab');assert.equal(await page.evaluate(()=>document.activeElement.id),'nextBtn');
  await page.keyboard.press('Escape');assert.ok(await page.locator('.hero-slideshow').evaluate(el=>el===document.activeElement));
  await page.setViewportSize({width:390,height:844});
  await page.goto(origin+'/data/big-data/');
  assert.equal(await page.locator('main').count(),1);
  assert.ok(await page.locator('main #foundations').count());
  assert.ok(await page.locator('main .quiz-wrap').count());
  assert.equal(await page.locator('p.section-title').count(),0);
  assert.equal(await page.locator('h4').count(),0);
  const nonnative=page.locator('[onclick]:not(button):not(a):not(input):not(select)');
  assert.equal(await nonnative.count(),34);
  for(const el of await nonnative.all()){assert.equal(await el.getAttribute('role'),'button');assert.equal(await el.getAttribute('tabindex'),'0');assert.ok((await el.textContent()).trim()||await el.getAttribute('aria-label'));}
  const acc=page.locator('.acc-header').first();await acc.focus();const was=await acc.getAttribute('aria-expanded');await page.keyboard.press('Enter');assert.notEqual(await acc.getAttribute('aria-expanded'),was);await page.keyboard.press('Space');assert.equal(await acc.getAttribute('aria-expanded'),was);
  const pipe=page.locator('.pipe-toggle').first();await pipe.focus();const pressed=await pipe.getAttribute('aria-pressed');await page.keyboard.press('Space');assert.notEqual(await pipe.getAttribute('aria-pressed'),pressed);
  const galaxy=page.locator('g[onclick]').first();await galaxy.focus();await page.keyboard.press('Enter');assert.ok((await page.locator('#galaxyTip').textContent()).includes('Kafka'));
  await page.locator('.q-opt').first().focus();await page.keyboard.press('Enter');assert.equal(await page.locator('.q-explain.show').count(),1);
  let worlds=0;
  await page.addInitScript(() => { window.requestAnimationFrame=()=>0; window.setInterval=()=>0; });
  page.setDefaultTimeout(10000);
  for(const file of fs.readdirSync(path.join(root,'worlds')).filter(f=>f.endsWith('.html'))){
   console.log('Keyboard',file);
   await page.goto(origin+'/worlds/'+file,{waitUntil:'domcontentloaded'});
   assert.equal(await page.locator('main').count(),1,file+' main landmark');
   const skip=page.locator('.wg-skip-link');assert.equal(await skip.count(),1,file+' skip link');
   const target=(await skip.getAttribute('href')).slice(1);await skip.focus();await page.keyboard.press('Enter');assert.equal(await page.evaluate(()=>document.activeElement.id),target,file+' skip focus');
   const missing=await page.locator('[onclick]:not(a[href]):not(button):not(input):not(select):not(textarea):not(summary):not([onkeydown])').evaluateAll(els=>els.filter(e=>e.tabIndex<0||!e.getAttribute('role')).length);assert.equal(missing,0,file+' keyboard controls');
   worlds++;
  }
  await page.route(origin+'/keyboard-fixture', r=>r.fulfill({contentType:'text/html',body:`<div id="legacy" onclick="window.activations++">Legacy</div><div id="new-control" onclick="window.activations++">New</div><script>window.activations=0;window.globalKeys=0;document.getElementById('legacy').addEventListener('keydown',e=>{if(e.key==='Enter'){e.preventDefault();e.currentTarget.click();}});document.addEventListener('keydown',()=>window.globalKeys++);</script><script defer src="/assets/accessibility.js"></script>`}));
  await page.goto(origin+'/keyboard-fixture');
  await page.locator('#legacy').focus();await page.keyboard.press('Enter');assert.equal(await page.evaluate(()=>window.activations),1,'existing key handler must not activate twice');
  await page.locator('#new-control').focus();const keys=await page.evaluate(()=>window.globalKeys);await page.keyboard.press('Space');assert.equal(await page.evaluate(()=>window.activations),2);assert.equal(await page.evaluate(()=>window.globalKeys),keys,'control activation must not trigger world shortcuts');
  console.log(JSON.stringify({passed:true,worlds,bigDataKeyboardControls:34,checks:['skip focus','mobile nav state and focus restore','palette open/search/trap/restore','gallery keyboard open/trap/restore','main coverage','heading outline','accordion Enter/Space','pipeline Space','SVG Enter','quiz native keyboard','world landmarks and focus']},null,2));
 }finally{await browser.close();server.close();}
})().catch(e=>{console.error(e);server.close();process.exitCode=1;});
