/*
  home.js
  Interactions and animations for the Home page.
  - Hero CTA shine pulse (GSAP if available, motion-safe)
  - Texture marquee momentum scrolling (motion-safe)
  - Section card peek tilt on hover (motion-safe)
  - "What's new" ticker population from server-side fallbacks
  - Command palette hint popover and open (Ctrl+K)
  - Hover-intent prefetch for internal links
  - Testimonials carousel rotation (motion-safe)
*/

(function () {
  const prefersReduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const hasGSAP = typeof window.gsap !== 'undefined';

  document.addEventListener('DOMContentLoaded', () => {
    heroCTA();
    marquee();
    cardTilt();
    whatsNew();
    cmdkHint();
    prefetchLinks();
    testimonials();
  });

  function heroCTA() {
    const cta = document.getElementById('hero-cta');
    if (!cta) return;

    // Add shine element
    const shine = document.createElement('span');
    shine.setAttribute('aria-hidden', 'true');
    shine.style.position = 'absolute';
    shine.style.top = '0';
    shine.style.left = '-150%';
    shine.style.height = '100%';
    shine.style.width = '50%';
    shine.style.transform = 'skewX(-20deg)';
    shine.style.background = 'linear-gradient(90deg, transparent, rgba(255,255,255,0.5), transparent)';
    shine.style.pointerEvents = 'none';
    shine.style.filter = 'blur(2px)';
    cta.style.position = 'relative';
    cta.appendChild(shine);

    if (prefersReduced) return;

    if (hasGSAP) {
      gsap.to(shine, {
        x: '350%',
        duration: 1.2,
        ease: 'power2.out',
        repeat: -1,
        repeatDelay: 2.5,
      });
      // Subtle pulse on CTA
      gsap.to(cta, { scale: 1.02, duration: 1.5, ease: 'sine.inOut', yoyo: true, repeat: -1 });
    } else {
      // Fallback CSS animation
      let dir = 1;
      setInterval(() => {
        const current = parseFloat(shine.style.left);
        if (current > 200) { shine.style.left = '-150%'; }
        shine.style.left = (parseFloat(shine.style.left) + 10 * dir) + '%';
      }, 120);
    }
  }

  function marquee() {
    const wrap = document.querySelector('.marquee-carousel');
    const track = document.querySelector('.marquee-carousel .marquee-track');
    if (!wrap || !track) return;

    // Duplicate children until we can scroll seamlessly
    const trackWidth = () => track.scrollWidth;
    const wrapWidth = () => wrap.clientWidth;
    while (trackWidth() < wrapWidth() * 2) {
      Array.from(track.children).forEach((n) => track.appendChild(n.cloneNode(true)));
    }

    let x = 0;
    let baseSpeed = 0.4; // px per frame
    let speed = baseSpeed;
    let rafId;
    let hovering = false;

    function step() {
      x -= speed;
      const total = trackWidth();
      if (-x >= total / 2) {
        x += total / 2; // wrap
      }
      track.style.transform = `translate3d(${x}px,0,0)`;
      rafId = requestAnimationFrame(step);
    }

    function start() {
      if (prefersReduced) return; // do not animate
      if (!rafId) rafId = requestAnimationFrame(step);
    }
    function stop() {
      if (rafId) cancelAnimationFrame(rafId);
      rafId = null;
    }

    wrap.addEventListener('mouseenter', () => { hovering = true; speed = 1; });
    wrap.addEventListener('mouseleave', () => { hovering = false; speed = baseSpeed; });
    start();
  }

  function cardTilt() {
    const cards = document.querySelectorAll('.section-card');
    if (!cards.length) return;
    const maxTilt = 6; // degrees

    function handleMove(e) {
      const card = e.currentTarget;
      if (prefersReduced) return;
      const rect = card.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const dx = (e.clientX - cx) / (rect.width / 2);
      const dy = (e.clientY - cy) / (rect.height / 2);
      const rx = (+dy * maxTilt).toFixed(2);
      const ry = (-dx * maxTilt).toFixed(2);
      card.style.transform = `rotateX(${rx}deg) rotateY(${ry}deg)`;
    }
    function reset(e) {
      const card = e.currentTarget;
      card.style.transform = 'rotateX(0) rotateY(0)';
    }

    cards.forEach((card) => {
      card.style.transformStyle = 'preserve-3d';
      card.style.transition = 'transform 300ms ease';
      card.addEventListener('mousemove', handleMove);
      card.addEventListener('mouseleave', reset);
      card.addEventListener('blur', reset, true);
    });
  }

  function whatsNew() {
    // DISABLED: Now using generative placeholder visuals from placeholder-visuals.js
    return;
    
    const container = document.querySelector('.whats-new-track');
    if (!container) return;

    // Collect fallback links from the sr-only block within the same section
    const srLinks = Array.from(document.querySelectorAll('section[aria-label="What\'s new"] .sr-only a'));
    let items = srLinks.map(a => ({ href: a.getAttribute('href'), text: a.textContent.trim() }));

    // If not enough items, create placeholders
    if (items.length === 0) {
      items = [
        { href: '/music/', text: 'Music: New release' },
        { href: '/video/', text: 'Video: New upload' },
        { href: '/data/', text: 'Data: New project' },
      ];
    }

    // Prepare category-specific styling and made-up names
    const presets = {
      Music: {
        badge: 'bg-wavgen-yellow',
        border: 'border-wavgen-yellow',
        cardBg: 'bg-wavgen-purple/50 hover:bg-wavgen-purple/60',
        names: ['Neon Echoes', 'Circuit Dreams', 'Analog Aurora', 'Voltage Bloom', 'Bassline Skyline']
      },
      Video: {
        badge: 'bg-wavgen-light-purple',
        border: 'border-wavgen-purple',
        cardBg: 'bg-black/40 hover:bg-black/50',
        names: ['Shader Symphony', 'Pixel Drift', 'Lightwave Suite', 'Frame Forge', 'Spectral Motion']
      },
      Data: {
        badge: 'bg-white',
        border: 'border-wavgen-purple',
        cardBg: 'bg-black/30 hover:bg-black/40',
        names: ['Insight Forge', 'Vector Vista', 'Tensor Trails', 'Quantum Query', 'Cloud Cartography']
      }
    };

    function classify(text) {
      if (/^Music:/i.test(text)) return 'Music';
      if (/^Video:/i.test(text)) return 'Video';
      if (/^Data:/i.test(text)) return 'Data';
      return 'Data';
    }

    // Convert items to enriched objects with made-up names per category
    let counters = { Music: 0, Video: 0, Data: 0 };
    items = items.map(it => {
      const cat = classify(it.text);
      const p = presets[cat];
      const idx = counters[cat]++ % p.names.length;
      const name = p.names[idx];
      return { href: it.href, category: cat, name };
    });

    // Render into track (repeat to fill) as taller rectangular cards
    const makeItem = (it) => {
      const p = presets[it.category];
      const a = document.createElement('a');
      a.className = [
        'whats-new-card',
        'inline-flex items-center gap-4',
        p.cardBg,
        'text-white no-underline',
        'border-2', p.border,
        'rounded-2xl shadow-lg',
        'px-6',
        'h-40', // 160px tall to better fill the 240px section minus header
        'min-w-[300px]',
        'transition-colors duration-200',
        'whitespace-nowrap'
      ].join(' ');
      a.href = it.href;
      // Larger icon badge
      const badge = document.createElement('span');
      badge.className = `inline-block w-4 h-4 rounded-full ${p.badge}`;
      const textWrap = document.createElement('span');
      textWrap.className = 'flex flex-col leading-tight';
      const cat = document.createElement('span');
      cat.className = 'text-sm opacity-80';
      cat.textContent = it.category;
      const label = document.createElement('span');
      label.className = 'text-lg font-semibold';
      label.textContent = it.name;
      textWrap.appendChild(cat);
      textWrap.appendChild(label);
      a.appendChild(badge);
      a.appendChild(textWrap);
      return a;
    };

    // Clear then fill until wide enough
    container.innerHTML = '';
    const parent = container.parentElement;
    while (container.scrollWidth < (parent.clientWidth * 2)) {
      items.forEach(it => container.appendChild(makeItem(it)));
    }

    // Simple drift animation (motion-safe). Use CSS scroll-like transform.
    if (!prefersReduced) {
      let x = 0;
      const speed = 0.25;
      function tick() {
        x -= speed;
        if (-x > container.scrollWidth / 2) x = 0;
        container.style.transform = `translate3d(${x}px,0,0)`;
        requestAnimationFrame(tick);
      }
      requestAnimationFrame(tick);
    }
  }

  function cmdkHint() {
    const btn = document.getElementById('cmdk-hint');
    const cmdk = document.getElementById('cmdk');
    if (!btn || !cmdk) return;

    let popover;
    function createPopover() {
      const div = document.createElement('div');
      div.role = 'dialog';
      div.ariaModal = 'false';
      div.className = 'absolute mt-2 right-0 z-[10002] bg-gray-800 text-white text-sm rounded-md shadow-lg ring-1 ring-black/20 p-3 max-w-xs';
      div.innerHTML = '<div class="font-semibold mb-1">Command Palette</div><div>Press <kbd>Ctrl</kbd>+<kbd>K</kbd> to open. Try searching for pages, tracks, or actions.</div><div class="mt-2"><button class="control-btn px-2 py-1 bg-wavgen-yellow text-black rounded" data-open>Open now</button></div>';
      document.body.appendChild(div);
      return div;
    }

    function position() {
      const rect = btn.getBoundingClientRect();
      const top = rect.bottom + window.scrollY;
      const left = rect.left + window.scrollX;
      popover.style.top = `${top}px`;
      popover.style.left = `${left}px`;
    }

    function openPopover() {
      if (popover) return;
      popover = createPopover();
      position();
      const openBtn = popover.querySelector('[data-open]');
      openBtn.addEventListener('click', openCmdk);
      // close on outside click or Escape
      setTimeout(() => {
        const onDoc = (e) => { if (!popover.contains(e.target) && e.target !== btn) closePopover(); };
        document.addEventListener('mousedown', onDoc, { once: true });
        document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closePopover(); }, { once: true });
      });
    }

    function closePopover() {
      if (!popover) return;
      popover.remove();
      popover = null;
    }

    function openCmdk() {
      cmdk.classList.remove('hidden');
      const input = document.getElementById('cmdk-input');
      if (input) input.focus();
      closePopover();
    }

    btn.addEventListener('click', () => { if (popover) closePopover(); else openPopover(); });
  }

  function prefetchLinks() {
    const origin = window.location.origin;
    const prefetched = new Set();

    function prefetch(href) {
      if (prefetched.has(href)) return;
      prefetched.add(href);
      const link = document.createElement('link');
      link.rel = 'prefetch';
      link.href = href;
      document.head.appendChild(link);
    }

    document.addEventListener('mouseover', (e) => {
      const a = e.target.closest('a[href]');
      if (!a) return;
      const href = a.href;
      if (!href.startsWith(origin)) return; // external
      if (a.hasAttribute('download')) return;
      prefetch(href);
    }, { passive: true });
  }

  function testimonials() {
    const container = document.getElementById('testimonials');
    if (!container) return;

    // Page-specific quotes map: ensure 2–3 quotes per page (21 pages total)
    // Keys are page hrefs; values are arrays of { text, author }
    const quotesByPage = {
      '/art/': [
        { text: 'Art is not what you see, but what you make others see.', author: 'Edgar Degas' },
        { text: 'Learn the rules like a pro, so you can break them like an artist.', author: 'Pablo Picasso' },
        { text: 'To create one’s world in any of the arts takes courage.', author: 'Georgia O’Keeffe' },
      ],
      '/art/drawing/': [
        { text: 'Drawing is the probity of art.', author: 'Jean-Auguste-Dominique Ingres' },
        { text: 'Where the spirit does not work with the hand, there is no art.', author: 'Leonardo da Vinci' },
        { text: 'It’s not what you look at that matters, it’s what you see.', author: 'Henry David Thoreau' },
      ],
      '/art/modelling/': [
        { text: 'Form follows function.', author: 'Louis Sullivan' },
        { text: 'Great things are done by a series of small things brought together.', author: 'Vincent van Gogh' },
        { text: 'Design is not just what it looks like and feels like. Design is how it works.', author: 'Steve Jobs' },
      ],
      '/art/painting/': [
        { text: 'I dream my painting and I paint my dream.', author: 'Vincent van Gogh' },
        { text: 'Color is a power which directly influences the soul.', author: 'Wassily Kandinsky' },
        { text: 'Color is my day-long obsession, joy and torment.', author: 'Claude Monet' },
      ],
      '/art/printing/': [
        { text: 'The details are not the details. They make the design.', author: 'Charles Eames' },
        { text: 'Less is more.', author: 'Ludwig Mies van der Rohe' },
        { text: 'Simplicity carried to an extreme becomes elegance.', author: 'Jon Franklin' },
      ],
      '/data/': [
        { text: 'The function of good software is to make the complex appear to be simple.', author: 'Grady Booch' },
        { text: 'Programs must be written for people to read, and only incidentally for machines to execute.', author: 'Harold Abelson' },
        { text: 'The best way to predict the future is to invent it.', author: 'Alan Kay' },
      ],
      '/data/cloud/': [
        { text: 'Everything fails, all the time.', author: 'Werner Vogels' },
        { text: 'The network is the computer.', author: 'John Gage' },
        { text: 'Simplicity is prerequisite for reliability.', author: 'Edsger W. Dijkstra' },
      ],
      '/data/coding/': [
        { text: 'Premature optimization is the root of all evil.', author: 'Donald Knuth' },
        { text: 'Everyone knows that debugging is twice as hard as writing the code in the first place.', author: 'Brian Kernighan' },
        { text: 'Talk is cheap. Show me the code.', author: 'Linus Torvalds' },
      ],
      '/data/genai/': [
        { text: 'AI is the new electricity.', author: 'Andrew Ng' },
        { text: 'The purpose of computing is insight, not numbers.', author: 'Richard Hamming' },
        { text: 'The measure of intelligence is the ability to change.', author: 'Albert Einstein' },
      ],
      '/data/webdev/': [
        { text: 'Simplicity is about subtracting the obvious and adding the meaningful.', author: 'John Maeda' },
        { text: 'Good design is as little design as possible.', author: 'Dieter Rams' },
        { text: 'Any sufficiently advanced technology is indistinguishable from magic.', author: 'Arthur C. Clarke' },
      ],
      '/music/': [
        { text: 'Music is the universal language of mankind.', author: 'Henry Wadsworth Longfellow' },
        { text: 'Without music, life would be a mistake.', author: 'Friedrich Nietzsche' },
        { text: 'Where words fail, music speaks.', author: 'Hans Christian Andersen' },
      ],
      '/music/electro/': [
        { text: 'Repetition is a form of change.', author: 'Brian Eno' },
        { text: 'The studio is a compositional tool.', author: 'Brian Eno' },
        { text: 'The future is already here — it’s just not evenly distributed.', author: 'William Gibson' },
      ],
      '/music/ambient/': [
        { text: 'Ambient music must be as ignorable as it is interesting.', author: 'Brian Eno' },
        { text: 'Silence is not the absence of something but the presence of everything.', author: 'John Cage' },
        { text: 'Music produces a kind of pleasure which human nature cannot do without.', author: 'Confucius' },
      ],
      '/music/melodic/': [
        { text: 'Melody is the essence of music.', author: 'Wolfgang Amadeus Mozart' },
        { text: 'Music is enough for a lifetime, but a lifetime is not enough for music.', author: 'Sergei Rachmaninoff' },
        { text: 'The most beautiful melodies are often simple.', author: 'Frédéric Chopin (attributed)' },
      ],
      '/music/breaks/': [
        { text: 'Rhythm and harmony find their way into the inward places of the soul.', author: 'Plato' },
        { text: 'It don’t mean a thing if it ain’t got that swing.', author: 'Duke Ellington' },
        { text: 'If it sounds right, it is right.', author: 'Duke Ellington' },
      ],
      '/video/': [
        { text: 'The medium is the message.', author: 'Marshall McLuhan' },
        { text: 'The art challenges the technology, and the technology inspires the art.', author: 'John Lasseter' },
        { text: 'Light is the first element of design.', author: 'Thomas E. Farin' },
      ],
      '/video/realtime/': [
        { text: 'Creators need an immediate connection to what they create.', author: 'Bret Victor' },
        { text: 'The computer is an instrument whose music is ideas.', author: 'Alan Kay' },
        { text: 'Immediacy is the signature of intuition.', author: 'Malcolm Gladwell (paraphrase)' },
      ],
      '/video/mapping/': [
        { text: 'Vision is the art of seeing what is invisible to others.', author: 'Jonathan Swift' },
        { text: 'Architecture is frozen music.', author: 'Friedrich Schelling' },
        { text: 'To photograph is to hold one’s breath.', author: 'Henri Cartier-Bresson' },
      ],
      '/video/mixing/': [
        { text: 'An essential aspect of creativity is not being afraid to fail.', author: 'Edwin Land' },
        { text: 'Constraints breed creativity.', author: 'Adam Morgan' },
        { text: 'Inspiration is for amateurs — the rest of us just show up and get to work.', author: 'Chuck Close' },
      ],
      '/video/editing/': [
        { text: 'Cinema is a mosaic made of time.', author: 'Andrei Tarkovsky' },
        { text: 'The first draft of anything is shit.', author: 'Ernest Hemingway' },
        { text: 'Make it simple, but significant.', author: 'Don Draper (fictional)' },
      ],
      
    };

    // Build a 40-quote rotation that guarantees coverage of every section/subpage once
    const pages = Object.keys(quotesByPage);
    const pickRandom = (arr) => arr[Math.floor(Math.random() * arr.length)];
    /** @type {{text:string, author:string, href:string}[]} */
    const guaranteed = pages.map((href) => ({ ...pickRandom(quotesByPage[href]), href }));
    const keyOf = (q) => `${q.href}|${q.text}|${q.author}`;
    const used = new Set(guaranteed.map(keyOf));
    // Remaining pool
    let pool = pages.flatMap((href) => quotesByPage[href].map((q) => ({ ...q, href })));
    // Remove already used
    pool = pool.filter((q) => !used.has(keyOf(q)));
    // Shuffle pool (Fisher–Yates)
    for (let i = pool.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [pool[i], pool[j]] = [pool[j], pool[i]];
    }
    // Compose final 40-list
    const targetCount = 40;
    const selected = guaranteed.slice();
    for (let i = 0; i < pool.length && selected.length < targetCount; i++) {
      selected.push(pool[i]);
    }
    // If still short (e.g., fewer than 40 total unique), refill by sampling with replacement
    while (selected.length < targetCount && pool.length) {
      selected.push(pickRandom(pool));
    }
    const quotes = selected;

    // Build slides
    container.innerHTML = '';

    // Gather a broad selection of internal pages from current DOM
    const internalLinksSet = new Set(
      Array.from(document.querySelectorAll('a[href^="/"]'))
        .map(a => a.getAttribute('href'))
        .filter(href => href && !href.startsWith('/#') && !href.startsWith('/assets') && !href.startsWith('/images'))
    );
    const internalLinks = Array.from(internalLinksSet);

    const titleCase = (s) => s.replace(/[-_]+/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
    const niceSection = (seg) => ({
      music: 'Music',
      video: 'Video',
      data: 'Data',
      art: 'Art',
    }[seg] || titleCase(seg));
    const niceSub = (seg) => ({
      webdev: 'Web Dev',
      genai: 'Gen AI',
      realtime: 'Realtime',
      modelling: 'Modelling',
      drawing: 'Drawing',
      painting: 'Painting',
      printing: 'Printing',
      electro: 'Electro',
      ambient: 'Ambient',
      melodic: 'Melodic',
      breaks: 'Breaks',
      mapping: 'Mapping',
      mixing: 'Mixing',
      editing: 'Editing',
      cloud: 'Cloud',
      coding: 'Coding',
    }[seg] || titleCase(seg));
    const labelFromHref = (href) => {
      try {
        if (!href) return 'Site';
        const parts = href.split('?')[0].split('#')[0].split('/').filter(Boolean);
        if (parts.length === 0) return 'Home';
        const first = parts[0];
        const second = parts[1];
        const secLabel = niceSection(first);
        if (second) return `${secLabel} ${niceSub(second)}`;
        return secLabel;
      } catch { return 'Site'; }
    };

    const chooseLinkForQuote = (text, defaultHref) => {
      if (defaultHref) return defaultHref;
      const t = (text || '').toLowerCase();
      const pick = (pred) => {
        const cands = internalLinks.filter(h => pred(h));
        if (cands.length) return cands[Math.floor(Math.random() * cands.length)];
        return null;
      };
      // Category-based matching by keywords
      if (/(music|melody|composer|song|rhythm|sound|audio|band|orchestra)/.test(t)) {
        const m = pick(h => h.includes('/music/'));
        if (m) return m;
      }
      if (/(video|film|frame|motion|light|photograph|camera|visual)/.test(t)) {
        const v = pick(h => h.includes('/video/') || h.includes('/art/'));
        if (v) return v;
      }
      if (/(design|art|paint|draw|color|visual|shape|form|canvas)/.test(t)) {
        const a = pick(h => h.includes('/art/'));
        if (a) return a;
      }
      if (/(code|software|program|compute|technology|future|engineer|cloud|data|ai|algorithm)/.test(t)) {
        const d = pick(h => h.includes('/data/'));
        if (d) return d;
      }
      if (/(learn|teach|about|life|work|vision|create|creative|imagination)/.test(t)) {
        const ab = pick(h => h.includes('/about/'));
        if (ab) return ab;
      }
      // Otherwise pick any internal page to broaden coverage
      if (internalLinks.length) return internalLinks[Math.floor(Math.random() * internalLinks.length)];
      return '/';
    };

    quotes.forEach((q, idx) => {
      const slide = document.createElement('div');
      slide.className = 'testimonial-slide text-xl text-gray-200 italic' + (idx === 0 ? '' : ' hidden');

      const quoteText = document.createElement('span');
      quoteText.textContent = `“${q.text}” — ${q.author} `;

      const sep = document.createElement('span');
      sep.className = 'opacity-60';
      sep.textContent = '• ';

      const link = document.createElement('a');
      const href = chooseLinkForQuote(q.text, q.href);
      link.href = href;
      link.className = 'underline text-wavgen-yellow hover:text-white not-italic';
      link.textContent = `Explore ${labelFromHref(href)}`;

      slide.appendChild(quoteText);
      slide.appendChild(sep);
      slide.appendChild(link);
      container.appendChild(slide);
    });

    const slides = Array.from(container.querySelectorAll('.testimonial-slide'));
    if (slides.length <= 1) return;

    let i = 0;
    function show(n) {
      slides.forEach((s, idx) => {
        const active = idx === n;
        s.classList.toggle('hidden', !active);
        if (!prefersReduced && hasGSAP) {
          if (active) gsap.fromTo(s, { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: 0.6, ease: 'power2.out' });
        }
      });
    }
    show(i);
    setInterval(() => { i = (i + 1) % slides.length; show(i); }, 5000);
  }
})();
