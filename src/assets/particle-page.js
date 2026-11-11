(() => {
  const canvas = document.createElement('canvas');
  canvas.id = 'page-particles';
  canvas.setAttribute('aria-hidden', 'true');
  canvas.style.cssText = 'position:fixed;inset:0;width:100%;height:100%;pointer-events:none;z-index:40';
  document.body.append(canvas);
  const ctx = canvas.getContext('2d');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const toggle = document.getElementById('page-particles-toggle');
  let enabled = !reduced.matches, frame = 0, last = 0, width, height;
  const particles = [];
  function resize() {
    width = innerWidth; height = innerHeight;
    const scale = Math.min(devicePixelRatio || 1, 2);
    canvas.width = width * scale; canvas.height = height * scale;
    ctx.setTransform(scale, 0, 0, scale, 0, 0);
  }
  function burst(x, y, count = 20) {
    if (!enabled) return;
    for (let i = 0; i < count && particles.length < 160; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 25 + Math.random() * 90;
      particles.push({x, y, vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed,
        life: 30 + Math.random() * 30, size: 1 + Math.random() * 2.5,
        color: ['#ffffff', '#a5b4fc', '#c7d2fe'][i % 3]});
    }
  }
  function draw(time) {
    frame = 0;
    if (!enabled || document.hidden) return;
    const dt = Math.min((time - last) / 1000 || 0, .05); last = time;
    ctx.globalCompositeOperation = 'destination-out'; ctx.globalAlpha = 1; ctx.fillStyle = 'rgba(0,0,0,.12)'; ctx.fillRect(0,0,width,height); ctx.globalCompositeOperation = 'source-over';
    if (particles.length < 120) burst(Math.random() * width, Math.random() * height, 3);
    for (let i = particles.length - 1; i >= 0; i--) {
      const p = particles[i]; p.life -= dt;
      const angle = time * .00022, wx = width * .5 + Math.cos(angle) * width * .28, wy = height * .5 + Math.sin(angle * .73) * height * .2;
      const dx=wx-p.x,dy=wy-p.y,dist=Math.max(50,Math.hypot(dx,dy));
      p.vx+=dx/dist*600/dist*dt; p.vy+=dy/dist*600/dist*dt;
      p.x=(p.x+p.vx*dt+width)%width; p.y=(p.y+p.vy*dt+height)%height;
      if (p.life <= 0 || p.x < -50 || p.x > width + 50 || p.y < -50 || p.y > height + 50) { particles.splice(i, 1); continue; }
      ctx.globalAlpha = Math.min(p.life, 1) * .55; ctx.fillStyle = p.color;
      ctx.beginPath(); ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2); ctx.fill();
    }
    frame = requestAnimationFrame(draw);
  }
  function sync() {
    toggle.setAttribute('aria-pressed', String(enabled));
    toggle.textContent = enabled ? 'Pause page-wide particles' : 'Enable page-wide particles';
    cancelAnimationFrame(frame); frame = 0;
    ctx.clearRect(0, 0, width, height); last = 0;
    if (enabled && !document.hidden) frame = requestAnimationFrame(draw);
  }
  toggle.addEventListener('click', () => { enabled = !enabled; sync(); });
  reduced.addEventListener('change', () => { enabled = !reduced.matches; sync(); });
  document.addEventListener('visibilitychange', sync);
  window.addEventListener('resize', resize);
  window.addEventListener('pointerdown', e => burst(e.clientX, e.clientY));
  window.addEventListener('message', e => {
    const iframe = document.querySelector('iframe[src="/worlds/particle_systems_world.html"]');
    if (e.origin !== location.origin || !iframe || e.source !== iframe.contentWindow || e.data?.type !== 'wavgen-particle-burst') return;
    const {x, y} = e.data;
    if (!Number.isFinite(x) || !Number.isFinite(y) || x < 0 || x > 1 || y < 0 || y > 1) return;
    const rect = iframe.getBoundingClientRect();
    const px=rect.left+x*rect.width, py=rect.top+y*rect.height;
    if (e.data.escape && Number.isFinite(e.data.vx) && Number.isFinite(e.data.vy)) {
      if (enabled && py >= 0 && py <= height && particles.length < 160) particles.push({x:px,y:py,vx:Math.max(-180,Math.min(180,e.data.vx)),vy:Math.max(-180,Math.min(-20,e.data.vy)),life:60,size:2,color:'#c7d2fe'});
    } else burst(px, py, 45);
  });
  resize(); sync();
})();
