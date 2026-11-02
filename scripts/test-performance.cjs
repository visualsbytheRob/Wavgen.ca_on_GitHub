const fs=require('fs'),path=require('path'),http=require('http'),assert=require('assert/strict');
const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright');
const root=path.resolve(process.argv[2]||'_site');
const server=http.createServer((req,res)=>{let p=path.join(root,decodeURIComponent(new URL(req.url,'http://localhost').pathname));if(fs.existsSync(p)&&fs.statSync(p).isDirectory())p=path.join(p,'index.html');if(!p.startsWith(root+path.sep)||!fs.existsSync(p)){res.writeHead(404).end();return;}res.setHeader('Content-Type',({'.html':'text/html','.js':'text/javascript','.css':'text/css'})[path.extname(p)]||'application/octet-stream');res.end(fs.readFileSync(p));});
(async()=>{
 await new Promise(r=>server.listen(0,'127.0.0.1',r));const origin=`http://127.0.0.1:${server.address().port}`;
 const browser=await chromium.launch({headless:true,...(process.env.CHROME_PATH?{executablePath:process.env.CHROME_PATH}:{})});
 try{
  const results=[];
  for(const route of ['/','/data/','/data/webdev/','/data/big-data/']){
   const page=await browser.newPage();const errors=[],missing=[];
   page.on('pageerror',e=>errors.push(e.message));page.on('response',r=>{if(r.url().startsWith(origin)&&r.status()===404)missing.push(r.url().replace(origin,''));});
   await page.route('**/*',r=>r.request().url().startsWith(origin)?r.continue():r.abort());
   await page.goto(origin+route);await page.waitForTimeout(500);
   const data=await page.evaluate(()=>({flip:!!window.Flip,text:!!window.TextPlugin,gsap:!!window.gsap,scroll:!!window.ScrollTrigger,playground:document.querySelectorAll('script[src="/js/code-playground.js"]').length,classLoaded:typeof CodePlayground==='function'}));
   results.push({route,errors,missing,...data});
   if(!process.env.BASELINE){assert.deepEqual(errors,[]);assert.deepEqual(missing,[]);assert.ok(data.gsap&&data.scroll);assert.equal(data.flip,route==='/data/webdev/');assert.equal(data.text,route==='/data/webdev/');if(route==='/data/webdev/'){assert.equal(data.playground,1);assert.ok(data.classLoaded);}}
   await page.close();
  }
  for(const route of ['images/README/index.html','js/systems/README/index.html','js/systems/animation/README/index.html'])assert.ok(fs.existsSync(path.join(root,route)),route);
  const files=fs.readdirSync(root,{recursive:true}).filter(f=>f.endsWith('.html'));
  let checked=0;const missingAssets=[];
  for(const f of files){const html=fs.readFileSync(path.join(root,f),'utf8');for(const m of html.matchAll(/(?:src|href)=["'](\/[^"'#?]+\.(?:js|css))["']/g)){checked++;if(!fs.existsSync(path.join(root,m[1])))missingAssets.push([f,m[1]]);}}
  assert.deepEqual(missingAssets,[]);
  console.log(JSON.stringify({results,htmlPages:files.length,localAssetReferences:checked,readmePagesPreserved:3},null,2));
 }finally{await browser.close();server.close();}
})().catch(e=>{console.error(e);server.close();process.exitCode=1;});
