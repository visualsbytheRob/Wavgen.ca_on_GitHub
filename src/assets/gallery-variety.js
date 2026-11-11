/* Promote approved artwork from child pages without changing its destination. */
(function(root){
 function promote(input){
  const result={...input};
  for(const section of ['home','music','video','art','data']){
   const keys=Object.keys(input).filter(k=>section==='home'||k===section||k.startsWith(section+'/'));
   keys.sort((a,b)=>b.split('/').length-a.split('/').length);
   const seen=new Set(),pool=[];
   // Round-robin pages prevents a large child gallery from dominating its parent.
   for(let i=0;i<Math.max(0,...keys.map(k=>input[k].length));i++)for(const key of keys){
    const item=input[key][i];if(!item||seen.has(item.url))continue;
    seen.add(item.url);pool.push({...item,href:item.href||item.assignedPage||(key==='home'?'/':'/'+key+'/')});
   }
   result[section]=pool;
  }
  return result;
 }
 if(typeof module==='object'&&module.exports){module.exports=promote;return;}
 function shuffle(items){const a=[...items];for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;}
 root.wavgenApprovedImages=promote(root.wavgenApprovedImages||{});
 for(const key of Object.keys(root.wavgenApprovedImages))root.wavgenApprovedImages[key]=shuffle(root.wavgenApprovedImages[key]);
 document.addEventListener('DOMContentLoaded',()=>{
  for(const selector of ['.hero-slide','.hero-section-bg-slide','.hero-bg-slide']){
   const groups=new Map();for(const img of document.querySelectorAll(selector)){const parent=img.parentElement;if(!groups.has(parent))groups.set(parent,[]);groups.get(parent).push(img);}
   for(const [parent,images] of groups)shuffle(images).forEach((img,i)=>{parent.appendChild(img);img.style.opacity=i===0?(selector==='.hero-slide'?'1':'0.3'):'0';});
  }
 });
})(typeof window==='undefined'?null:window);
