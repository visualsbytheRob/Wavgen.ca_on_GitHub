const artwork=require('../_data/approvedImages.json');
module.exports=async function addCardImages(html,outputPath){
  if(typeof outputPath !== 'string'||!outputPath.endsWith('.html')||!html.includes('section-card'))return html;
  const {parse,serialize,parseFragment}=await import('parse5');const doc=parse(html);let index=0;
  const attr=(n,k)=>(n.attrs||[]).find(a=>a.name===k)?.value;
  const containsImage=n=>n.tagName==='img'||(n.childNodes||[]).some(containsImage);
  function visit(node){
    if((attr(node,'class')||'').split(/\s+/).includes('section-card')){
      const onclick=attr(node,'onclick')||'';
      const url=attr(node,'href')||onclick.match(/(?:window\.)?location\.href\s*=\s*['"]([^'"]+)/)?.[1];
      if(url?.startsWith('/')&&node.tagName==='div'){
        node.tagName=node.nodeName='a';node.attrs=node.attrs.filter(a=>a.name!=='onclick');node.attrs.push({name:'href',value:url});
      }
      if(!containsImage(node)){
        const key=(url||'').split('#')[0].replace(/^\/+|\/+$/g,'')||'home';
        const pool=artwork[key]||artwork[key.split('/')[0]]||artwork.home;
        if(pool?.length){const image=pool[index++%pool.length];const img=parseFragment(`<img class="card-photo" src="${image.url}" alt="" width="640" height="400" loading="lazy" decoding="async">`).childNodes[0];img.parentNode=node;node.childNodes.unshift(img);}
      }
    }
    for(const child of node.childNodes||[])visit(child);
  }
  visit(doc);return serialize(doc);
};
