const root=document.querySelector('#visual-feed');
if(root){
 const $=selector=>root.querySelector(selector),reduced=matchMedia('(prefers-reduced-motion: reduce)');
 let items=[],filtered=[],index=0,offset=0,motion=!reduced.matches,visible=false,frame=0,last=0,elapsed=0,sceneState=null,loadSequence=0,started=false;
 const feature=$('.vf-feature'),fallback=$('#vf-fallback');
 function renderCards(){
   $('#vf-cards').replaceChildren(...filtered.slice(offset,offset+8).map(item=>{const link=document.createElement('a');link.href=item.href;const image=document.createElement('img');image.src=item.image;image.alt='';image.loading='lazy';image.decoding='async';const label=document.createElement('span');label.textContent=item.section;const title=document.createElement('h3');title.textContent=item.title;link.append(image,label,title);return link;}));
   $('#vf-back').disabled=offset===0;$('#vf-more').disabled=offset+8>=filtered.length;
   $('#vf-status').textContent=`${filtered.length} items · showing ${offset+1}–${Math.min(offset+8,filtered.length)}`;
 }
 function sizeScene(){if(!sceneState)return;const {renderer,camera}=sceneState;const width=feature.clientWidth,height=feature.clientHeight;renderer.setSize(width,height,false);camera.left=-width/height;camera.right=width/height;camera.top=1;camera.bottom=-1;camera.updateProjectionMatrix();drawScene(0);}
 function drawScene(progress){if(!sceneState)return;const {mesh,renderer,scene,camera,aspect}=sceneState;if(!mesh.material.map)return;const frameAspect=feature.clientWidth/feature.clientHeight;const contain=filtered[index]?.contain;let w,h;if(contain){w=Math.min(frameAspect*2,aspect*2);h=w/aspect;}else{w=Math.max(frameAspect*2,aspect*2);h=w/aspect;}const zoom=contain?.96+progress*.035:1.025+progress*.075;mesh.scale.set(w*zoom,h*zoom,1);mesh.position.set(contain?0:Math.sin(progress*Math.PI)*.04,contain?0:progress*.035,0);renderer.render(scene,camera);}
 async function texture(item){
   if(!sceneState)return;const sequence=++loadSequence;feature.dataset.webgl='false';
   // Keep cross-origin album and video artwork on the ordinary image path.
   if(!item.image.startsWith('/')&&new URL(item.image,location.href).origin!=='https://media.wavgen.ca')return;
   try{const texture=await sceneState.loader.loadAsync(item.image);if(sequence!==loadSequence){texture.dispose();return;}texture.colorSpace=sceneState.THREE.SRGBColorSpace;sceneState.mesh.material.map?.dispose();sceneState.mesh.material.map=texture;sceneState.mesh.material.needsUpdate=true;sceneState.aspect=texture.image.width/texture.image.height;drawScene(0);feature.dataset.webgl='true';}catch{feature.dataset.webgl='false';}
 }
 function show(next){if(!filtered.length)return;index=(next+filtered.length)%filtered.length;elapsed=0;const item=filtered[index];feature.href=item.href;feature.setAttribute('aria-label','Explore '+item.title);feature.dataset.contain=String(!!item.contain);fallback.src=item.image;fallback.alt=item.title;$('#vf-title').textContent=item.title;$('#vf-description').textContent=item.description;$('#vf-section').textContent=item.section;$('#vf-position').textContent=`${index+1} / ${filtered.length}`;void texture(item);}
 function tick(now){frame=0;if(!motion||!visible||document.hidden)return;elapsed+=last?Math.min(now-last,100):0;last=now;if(elapsed>=12000)show(index+1);drawScene(Math.min(elapsed/12000,1));frame=requestAnimationFrame(tick);}
 function sync(){root.dataset.motion=motion&&visible&&!document.hidden?'playing':'paused';$('#vf-motion').setAttribute('aria-pressed',String(motion));$('#vf-motion').textContent=motion?'Pause motion':'Resume motion';cancelAnimationFrame(frame);frame=0;last=0;if(motion&&visible&&!document.hidden)frame=requestAnimationFrame(tick);}
 async function setupScene(){
   if(sceneState||reduced.matches)return;
   try{const THREE=await import('/assets/vendor/three.module.js');const canvas=$('#vf-canvas');if(!canvas.getContext('webgl2'))return;const renderer=new THREE.WebGLRenderer({canvas,alpha:true,antialias:false});renderer.setPixelRatio(Math.min(devicePixelRatio||1,1.5));renderer.setClearColor(0x080712,1);const scene=new THREE.Scene(),camera=new THREE.OrthographicCamera(-1,1,1,-1,.1,10);camera.position.z=2;const mesh=new THREE.Mesh(new THREE.PlaneGeometry(1,1),new THREE.MeshBasicMaterial({color:0xffffff}));scene.add(mesh);sceneState={THREE,renderer,scene,camera,mesh,loader:new THREE.TextureLoader(),aspect:1};root.dataset.engine='threejs';new ResizeObserver(sizeScene).observe(feature);sizeScene();await texture(filtered[index]);}catch{root.dataset.engine='image';feature.dataset.webgl='false';}
 }
 async function start(){if(started)return;started=true;try{const response=await fetch('/assets/visual-feed.json?media=r2-v2');if(!response.ok)throw Error('Feed unavailable');const data=await response.json();items=data.items;filtered=items;root.dataset.itemCount=String(items.length);show(0);renderCards();await setupScene();sync();}catch{$('#vf-status').textContent='Explore the featured links below.';}}
 const observer=new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;if(visible)void start();sync();},{rootMargin:'150px',threshold:0});observer.observe(root);
 root.querySelectorAll('[data-vf-filter]').forEach(button=>button.addEventListener('click',()=>{if(!items.length)return;const type=button.dataset.vfFilter;filtered=type==='all'?items:items.filter(item=>item.type===type);offset=0;root.querySelectorAll('[data-vf-filter]').forEach(b=>b.setAttribute('aria-pressed',String(b===button)));show(0);renderCards();}));
 $('#vf-next').addEventListener('click',()=>show(index+1));$('#vf-prev').addEventListener('click',()=>show(index-1));$('#vf-motion').addEventListener('click',()=>{motion=!motion;if(motion&&!sceneState)void setupScene();sync();});
 $('#vf-more').addEventListener('click',()=>{offset=Math.min(offset+8,Math.floor((filtered.length-1)/8)*8);renderCards();});$('#vf-back').addEventListener('click',()=>{offset=Math.max(0,offset-8);renderCards();});
 feature.addEventListener('focus',()=>{motion=false;sync();});document.addEventListener('visibilitychange',sync);reduced.addEventListener('change',()=>{motion=!reduced.matches;sync();});sync();
}
