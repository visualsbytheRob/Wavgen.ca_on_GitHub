const snapshots=require('./contentSnapshots.json');
const artwork=require('./approvedImages.json');
const navigation=require('./navigation');
const pages=navigation.main.flatMap(p=>[p,...(p.children||[])]);
const result={};
for(const section of ['home','music','video','data','art']){
  const eligible=pages.filter(p=>p.url!=='/'&&(section==='home'?p.url.split('/').filter(Boolean).length===2:p.url.startsWith('/'+section+'/')&&p.url!=='/'+section+'/'));
  const candidates=[];
  for(let i=0;i<7;i++)for(const page of eligible){
    const key=page.url.replace(/^\/+|\/+$/g,'');const item=snapshots[key]?.[i];
    if(!item)continue;
    const pool=artwork[key]||artwork[key.split('/')[0]]||artwork.home;
    candidates.push({title:item.fileSlug,href:item.href,pageTitle:page.title,image:pool[(i+candidates.length)%pool.length].url,alt:pool[(i+candidates.length)%pool.length].fileSlug});
  }
  if(section==='home')candidates.sort((a,b)=>{
    const sectionOrder=['music','video','data','art'];
    return sectionOrder.indexOf(a.href.split('/')[1])-sectionOrder.indexOf(b.href.split('/')[1]);
  });
  const chosen=[];const seen=new Set();
  if(section==='home'){
    for(let round=0;chosen.length<14&&round<20;round++)for(const domain of ['music','video','data','art']){
      const candidate=candidates.filter(c=>c.href.startsWith('/'+domain+'/'))[round];
      if(candidate&&chosen.length<14&&!seen.has(candidate.href)){chosen.push(candidate);seen.add(candidate.href);}
    }
  }else for(const candidate of candidates){if(!seen.has(candidate.href)){chosen.push(candidate);seen.add(candidate.href);}if(chosen.length===14)break;}
  if(chosen.length!==14)throw Error(section+': expected 14 image cards, found '+chosen.length);
  result[section]=chosen;
}
module.exports=result;
