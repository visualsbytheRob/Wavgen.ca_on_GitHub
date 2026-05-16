/* ══════════════════════════════════════════════════════════
   Generative AI — Visual Learning World
   Interactive JavaScript — extracted for Wavgen.ca integration
   ══════════════════════════════════════════════════════════ */

// ── Particle Canvas ──────────────────────────────────────
(function() {
  const canvas = document.getElementById('particle-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let W, H, particles = [];
  const COLORS = ['#a855f7','#c026d3','#ec4899','#f472b6','#22d3ee'];

  function resize() { W = canvas.width = window.innerWidth; H = canvas.height = window.innerHeight; }

  function Particle() {
    this.reset = function() {
      this.x = Math.random() * W; this.y = Math.random() * H;
      this.vx = (Math.random()-.5)*.4; this.vy = (Math.random()-.5)*.4;
      this.r = Math.random()*2+.5;
      this.color = COLORS[Math.floor(Math.random()*COLORS.length)];
      this.life = Math.random()*200+100; this.age = 0;
    };
    this.reset(); this.age = Math.random()*this.life;
  }

  function init() { particles=[]; for(let i=0;i<90;i++) particles.push(new Particle()); }

  function draw() {
    ctx.clearRect(0,0,W,H);
    for(let i=0;i<particles.length;i++) {
      for(let j=i+1;j<particles.length;j++) {
        const dx=particles[i].x-particles[j].x, dy=particles[i].y-particles[j].y;
        const dist=Math.sqrt(dx*dx+dy*dy);
        if(dist<120) {
          ctx.beginPath();
          ctx.strokeStyle=`rgba(168,85,247,${0.12*(1-dist/120)})`;
          ctx.lineWidth=0.6;
          ctx.moveTo(particles[i].x,particles[i].y);
          ctx.lineTo(particles[j].x,particles[j].y);
          ctx.stroke();
        }
      }
    }
    for(const p of particles) {
      p.age++; if(p.age>p.life) p.reset();
      const alpha=Math.min(1,Math.min(p.age,p.life-p.age)/30);
      ctx.beginPath(); ctx.arc(p.x,p.y,p.r,0,Math.PI*2);
      ctx.fillStyle=p.color+Math.round(alpha*255).toString(16).padStart(2,'0');
      ctx.fill();
      ctx.beginPath(); ctx.arc(p.x,p.y,p.r*3,0,Math.PI*2);
      ctx.fillStyle=p.color+'18'; ctx.fill();
      p.x+=p.vx; p.y+=p.vy;
      if(p.x<0)p.x=W; if(p.x>W)p.x=0;
      if(p.y<0)p.y=H; if(p.y>H)p.y=0;
    }
    requestAnimationFrame(draw);
  }
  resize(); init(); draw();
  window.addEventListener('resize',resize);
})();

// ── Typewriter ────────────────────────────────────────────
(function() {
  const el = document.getElementById('hero-typewriter');
  if (!el) return;
  const phrases = [
    'Generative AI can write code, essays, poetry, and entire books.',
    'Diffusion models paint stunning images from words in seconds.',
    'Transformers predict the next token, one step at a time.',
    'RLHF aligns powerful models to human preferences and values.',
    'RAG gives LLMs access to your private data without retraining.',
    'Multimodal models see, hear, read, and reason — all at once.',
  ];
  let pi=0, ci=0, deleting=false, pause=0;
  function tick() {
    if(pause>0){pause--;setTimeout(tick,30);return;}
    const phrase=phrases[pi];
    if(!deleting){
      el.innerHTML=phrase.slice(0,ci+1)+'<span class="prompt-cursor"></span>';
      ci++;
      if(ci>=phrase.length){deleting=true;pause=70;}
    } else {
      el.innerHTML=phrase.slice(0,ci-1)+'<span class="prompt-cursor"></span>';
      ci--;
      if(ci<=0){deleting=false;pi=(pi+1)%phrases.length;pause=10;}
    }
    setTimeout(tick,deleting?18:44);
  }
  tick();
})();

// ── Attention Heatmap ─────────────────────────────────────
(function() {
  const el = document.getElementById('attn-heatmap');
  if(!el) return;
  const weights=[
    [0.80,0.30,0.10,0.05,0.60,0.20],
    [0.20,0.90,0.40,0.10,0.20,0.70],
    [0.10,0.30,0.85,0.60,0.15,0.40],
    [0.05,0.10,0.50,0.90,0.05,0.30],
    [0.60,0.20,0.15,0.05,0.80,0.40],
    [0.20,0.70,0.40,0.30,0.40,0.95],
  ];
  const cols=['#7c3aed','#9333ea','#c026d3','#ec4899','#f472b6','#22d3ee'];
  weights.forEach((row,ri)=>{
    row.forEach((w,ci)=>{
      const cell=document.createElement('div');
      const alpha=Math.round(w*255).toString(16).padStart(2,'0');
      cell.style.cssText=`aspect-ratio:1;border-radius:3px;background:${cols[ci]}${alpha};border:1px solid rgba(255,255,255,0.05);`;
      cell.title=`${(w*100).toFixed(0)}% attention`;
      el.appendChild(cell);
    });
  });
})();

// ── Landscape Tabs ────────────────────────────────────────
(function() {
  const models = {
    text:[
      {emoji:'🤖',name:'GPT-4o',maker:'OpenAI',tag:'SOTA',color:'#10a37f'},
      {emoji:'💜',name:'Claude 3.5',maker:'Anthropic',tag:'Reasoning',color:'#7c3aed'},
      {emoji:'💎',name:'Gemini 1.5',maker:'Google',tag:'1M ctx',color:'#4285f4'},
      {emoji:'🦙',name:'Llama 3.1',maker:'Meta',tag:'Open',color:'#0668e1'},
      {emoji:'🌟',name:'Mistral',maker:'Mistral AI',tag:'Efficient',color:'#f97316'},
      {emoji:'🔮',name:'Grok 2',maker:'xAI',tag:'Reasoning',color:'#a855f7'},
    ],
    image:[
      {emoji:'🎨',name:'DALL·E 3',maker:'OpenAI',tag:'Prompt-faithful',color:'#10a37f'},
      {emoji:'🌊',name:'Midjourney v6',maker:'Midjourney',tag:'Artistic',color:'#4f46e5'},
      {emoji:'⚡',name:'Stable Diffusion',maker:'Stability AI',tag:'Open',color:'#7c3aed'},
      {emoji:'🌀',name:'FLUX.1',maker:'Black Forest Labs',tag:'SOTA',color:'#ec4899'},
      {emoji:'🦄',name:'Ideogram 2',maker:'Ideogram',tag:'Typography',color:'#f59e0b'},
      {emoji:'🖼️',name:'Firefly 3',maker:'Adobe',tag:'Commercial',color:'#e34850'},
    ],
    audio:[
      {emoji:'🎵',name:'Suno v4',maker:'Suno',tag:'Music gen',color:'#ec4899'},
      {emoji:'🎤',name:'ElevenLabs',maker:'ElevenLabs',tag:'TTS/Voice',color:'#6366f1'},
      {emoji:'🎸',name:'Udio',maker:'Udio',tag:'Music gen',color:'#8b5cf6'},
      {emoji:'🗣️',name:'Whisper',maker:'OpenAI',tag:'STT',color:'#10a37f'},
      {emoji:'🎧',name:'MusicGen',maker:'Meta',tag:'Open',color:'#0668e1'},
    ],
    video:[
      {emoji:'🎬',name:'Sora',maker:'OpenAI',tag:'1080p',color:'#10a37f'},
      {emoji:'✈️',name:'Runway Gen-3',maker:'Runway',tag:'Pro',color:'#f43f5e'},
      {emoji:'🐼',name:'Kling 1.5',maker:'Kuaishou',tag:'720p',color:'#f97316'},
      {emoji:'🎥',name:'Luma Dream',maker:'Luma AI',tag:'Realistic',color:'#8b5cf6'},
      {emoji:'🌊',name:'Pika 2.0',maker:'Pika Labs',tag:'Fast',color:'#6366f1'},
    ],
    code:[
      {emoji:'🤖',name:'GitHub Copilot',maker:'Microsoft',tag:'IDE',color:'#24292e'},
      {emoji:'🖱️',name:'Cursor',maker:'Cursor',tag:'AI IDE',color:'#6366f1'},
      {emoji:'💎',name:'Gemini Code',maker:'Google',tag:'SOTA code',color:'#4285f4'},
      {emoji:'💜',name:'Claude Code',maker:'Anthropic',tag:'Agentic',color:'#7c3aed'},
      {emoji:'⚡',name:'Codeium',maker:'Codeium',tag:'Free',color:'#10b981'},
      {emoji:'🔮',name:'Replit AI',maker:'Replit',tag:'Full-stack',color:'#f97316'},
    ],
  };
  const grid=document.getElementById('landscape-grid');
  const tabs=document.querySelectorAll('.ltab');
  function renderCat(cat) {
    if(!grid)return; grid.innerHTML='';
    (models[cat]||[]).forEach(m=>{
      const card=document.createElement('div'); card.className='lcard';
      card.style.setProperty('--lcolor',m.color);
      card.innerHTML=`<div class="lcard-emoji">${m.emoji}</div><div class="lcard-name">${m.name}</div><div class="lcard-maker">${m.maker}</div><span class="lcard-tag">${m.tag}</span>`;
      grid.appendChild(card);
    });
  }
  tabs.forEach(tab=>{ tab.addEventListener('click',()=>{ tabs.forEach(t=>t.classList.remove('active')); tab.classList.add('active'); renderCat(tab.dataset.cat); }); });
  renderCat('text');
})();

// ── Resources Tabs ────────────────────────────────────────
(function() {
  const resources = {
    video:[
      {title:'Neural Networks: Zero to Hero',creator:'Andrej Karpathy',url:'https://youtube.com/@AndrejKarpathy',desc:'Build GPT from scratch in PyTorch. The best series for understanding LLMs deeply.',level:'intermediate'},
      {title:'But what is a neural network?',creator:'3Blue1Brown',url:'https://youtube.com/@3blue1brown',desc:'Beautiful visual explanations of neural networks, backprop, and attention.',level:'beginner'},
      {title:'Lex Fridman Podcast',creator:'Lex Fridman',url:'https://lexfridman.com/podcast',desc:'Deep technical interviews with LeCun, Altman, Sutskever, and every major AI figure.',level:'beginner'},
      {title:'Yannic Kilcher',creator:'Yannic Kilcher',url:'https://youtube.com/@YannicKilcher',desc:'Rigorous walkthroughs of the latest AI research papers. Fast, insightful, no fluff.',level:'advanced'},
    ],
    interactive:[
      {title:'Hugging Face Spaces',creator:'Hugging Face',url:'https://huggingface.co/spaces',desc:'Run thousands of AI models live in your browser. Best AI playground on the internet.',level:'beginner'},
      {title:'Transformer Explainer',creator:'Georgia Tech',url:'https://poloclub.github.io/transformer-explainer',desc:'Live GPT-2 — see attention heads and token probabilities in real time.',level:'intermediate'},
      {title:'TensorFlow Playground',creator:'Google',url:'https://playground.tensorflow.org',desc:'Train a small neural network in your browser and watch decision boundaries form.',level:'beginner'},
      {title:'LLM Visualization',creator:'Brendan Bycroft',url:'https://bbycroft.net/llm',desc:'3D walkthrough of every matrix operation inside GPT-2. Essential for intuition.',level:'intermediate'},
    ],
    courses:[
      {title:'fast.ai Practical Deep Learning',creator:'Jeremy Howard',url:'https://course.fast.ai',desc:'Top-down, code-first approach. Ship models before knowing all the math. Free.',level:'beginner'},
      {title:'DeepLearning.AI Specialization',creator:'Andrew Ng',url:'https://deeplearning.ai',desc:'The gold-standard curriculum. 5-course specialization covering all of deep learning.',level:'beginner'},
      {title:'Hugging Face NLP Course',creator:'Hugging Face',url:'https://huggingface.co/learn/nlp-course',desc:'Complete NLP course using the Transformers library. Free, practical, always updated.',level:'intermediate'},
      {title:'CS224N: NLP with Deep Learning',creator:'Stanford',url:'https://web.stanford.edu/class/cs224n',desc:'Stanford NLP course — full lectures, slides, and assignments available free online.',level:'advanced'},
    ],
    books:[
      {title:'Deep Learning (Goodfellow)',creator:'Goodfellow, Bengio, Courville',url:'https://www.deeplearningbook.org',desc:'The definitive DL textbook. Free online. Rigorous mathematical treatment of all fundamentals.',level:'advanced'},
      {title:'Hands-On ML with Scikit-Learn',creator:'Aurélien Géron',url:'https://oreilly.com',desc:'The best practical ML book. Scikit-learn through Keras with real projects.',level:'intermediate'},
      {title:'Build a Large Language Model',creator:'Sebastian Raschka',url:'https://sebastianraschka.com/books',desc:'Build GPT from scratch: pre-training, fine-tuning, RLHF — all in code.',level:'advanced'},
      {title:'The Alignment Problem',creator:'Brian Christian',url:'https://brianchristian.org',desc:'Accessible deep dive into AI safety and what it means to make AI do what we want.',level:'beginner'},
    ],
    podcasts:[
      {title:'Lex Fridman Podcast',creator:'Lex Fridman',url:'https://lexfridman.com/podcast',desc:'3–4 hour deep dives with the world\'s leading AI researchers and entrepreneurs.',level:'beginner'},
      {title:'The TWIML AI Podcast',creator:'Sam Charrington',url:'https://twimlai.com',desc:'Weekly interviews with ML researchers and practitioners on the cutting edge.',level:'intermediate'},
      {title:'Latent Space',creator:'swyx & Alessio',url:'https://latent.space',desc:'The technical podcast for AI engineers — models, infra, tools, and the builder ecosystem.',level:'intermediate'},
      {title:'Machine Learning Street Talk',creator:'Tim Scarfe et al.',url:'https://podcasts.apple.com/us/podcast/machine-learning-street-talk/id1510472996',desc:'Rigorous ML paper discussions. No hype, deep technical content.',level:'advanced'},
    ],
  };
  const grid=document.getElementById('res-grid');
  const rtabs=document.querySelectorAll('.rtab');
  function renderRes(cat) {
    if(!grid)return; grid.innerHTML='';
    (resources[cat]||[]).forEach(r=>{
      const card=document.createElement('a'); card.className='rcard';
      card.href=r.url; card.target='_blank'; card.rel='noopener noreferrer';
      card.innerHTML=`<div class="rcard-type">${cat.toUpperCase()}</div><div class="rcard-title">${r.title}</div><div class="rcard-creator">by ${r.creator}</div><div class="rcard-desc">${r.desc}</div><span class="rcard-level level-${r.level}">${r.level}</span>`;
      grid.appendChild(card);
    });
  }
  rtabs.forEach(tab=>{ tab.addEventListener('click',()=>{ rtabs.forEach(t=>t.classList.remove('active')); tab.classList.add('active'); renderRes(tab.dataset.rt); }); });
  renderRes('video');
})();

// ── Scroll-reveal ─────────────────────────────────────────
(function() {
  const observer=new IntersectionObserver((entries)=>{
    entries.forEach(entry=>{ if(entry.isIntersecting){ entry.target.style.opacity='1'; entry.target.style.transform='translateY(0)'; observer.unobserve(entry.target); } });
  },{threshold:0.1});
  document.querySelectorAll('.card,.arch-card,.cheat-card,.lcard,.istep,.roadmap-item,.pe-card,.technique-card').forEach(el=>{
    el.style.opacity='0'; el.style.transform='translateY(22px)';
    el.style.transition='opacity 0.5s ease, transform 0.5s ease';
    observer.observe(el);
  });
})();

// ── Nav active state ──────────────────────────────────────
(function() {
  const sections=document.querySelectorAll('section[id]');
  const navLinks=document.querySelectorAll('.nav-links a');
  const observer=new IntersectionObserver((entries)=>{
    entries.forEach(entry=>{
      if(entry.isIntersecting){
        navLinks.forEach(link=>{ link.style.color=link.getAttribute('href')==='#'+entry.target.id?'var(--text)':''; });
      }
    });
  },{rootMargin:'-40% 0px -40% 0px'});
  sections.forEach(s=>observer.observe(s));
})();

(function() {
  var expertCorrect = 0;
  var expertTotal = 8;
  var eqc = document.getElementById('expert-quiz-container');
  if (eqc) {
    eqc.querySelectorAll('.quiz-q').forEach(function(q) {
      var opts = q.querySelectorAll('.quiz-opt');
      var expl = q.querySelector('.quiz-expl');
      opts.forEach(function(btn) {
        btn.addEventListener('click', function() {
          if (q.dataset.answered) return;
          q.dataset.answered = '1';
          var isCorrect = btn.dataset.correct === 'true';
          if (isCorrect) { expertCorrect++; btn.classList.add('correct'); }
          else {
            btn.classList.add('wrong');
            opts.forEach(function(b) { if (b.dataset.correct === 'true') b.classList.add('correct'); });
          }
          opts.forEach(function(b) { b.disabled = true; });
          if (expl) expl.classList.add('show');
          document.getElementById('expert-quiz-score').textContent = expertCorrect + ' / ' + expertTotal;
        });
      });
    });
    var resetBtn = document.getElementById('expert-quiz-reset');
    if (resetBtn) {
      resetBtn.addEventListener('click', function() {
        expertCorrect = 0;
        document.getElementById('expert-quiz-score').textContent = '0 / ' + expertTotal;
        eqc.querySelectorAll('.quiz-q').forEach(function(q) {
          delete q.dataset.answered;
          q.querySelectorAll('.quiz-opt').forEach(function(b) {
            b.classList.remove('correct','wrong');
            b.disabled = false;
          });
          var expl = q.querySelector('.quiz-expl');
          if (expl) expl.classList.remove('show');
        });
      });
    }
  }
})();

(function() {
  var correct = 0;
  var total = 8;
  document.querySelectorAll('.quiz-q').forEach(function(q) {
    var opts = q.querySelectorAll('.quiz-opt');
    var expl = q.querySelector('.quiz-expl');
    opts.forEach(function(btn) {
      btn.addEventListener('click', function() {
        if (q.dataset.answered) return;
        q.dataset.answered = '1';
        var isCorrect = btn.dataset.correct === 'true';
        if (isCorrect) { correct++; btn.classList.add('correct'); }
        else {
          btn.classList.add('wrong');
          opts.forEach(function(b) { if (b.dataset.correct === 'true') b.classList.add('correct'); });
        }
        opts.forEach(function(b) { b.disabled = true; });
        if (expl) expl.classList.add('show');
        document.getElementById('quiz-score').textContent = correct + ' / ' + total;
      });
    });
  });
})();

