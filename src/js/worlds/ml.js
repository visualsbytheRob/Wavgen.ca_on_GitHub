/* ══════════════════════════════════════════════════════════
   Machine Learning & Predictive AI — Visual Learning World
   Interactive JavaScript — extracted for Wavgen.ca integration
   ══════════════════════════════════════════════════════════ */

/* ── Intersection Observer for fade-in ── */
const observer = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      e.target.style.opacity = '1';
      e.target.style.transform = 'translateY(0)';
    }
  });
}, { threshold: 0.08 });

document.querySelectorAll('.fade-in').forEach(el => {
  el.style.opacity = '0';
  el.style.transform = 'translateY(24px)';
  el.style.transition = 'opacity 0.55s ease, transform 0.55s ease';
  observer.observe(el);
});

/* ── Nav active link highlight on scroll ── */
const sections = document.querySelectorAll('section[id], footer');
const navLinks = document.querySelectorAll('.nav-links a');
window.addEventListener('scroll', () => {
  let current = '';
  sections.forEach(s => {
    if (window.scrollY >= s.offsetTop - 90) current = s.id;
  });
  navLinks.forEach(a => {
    a.style.color = a.getAttribute('href') === '#' + current ? 'var(--green-light)' : '';
    a.style.borderBottomColor = a.getAttribute('href') === '#' + current ? 'var(--green-light)' : 'transparent';
  });
}, { passive: true });

/* ── Resource Tabs ── */
document.querySelectorAll('.res-tab').forEach(tab => {
  tab.addEventListener('click', () => {
    document.querySelectorAll('.res-tab').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.res-panel').forEach(p => p.style.display = 'none');
    tab.classList.add('active');
    const panel = document.getElementById('res-panel-' + tab.dataset.tab);
    if (panel) panel.style.display = 'block';
  });
});

/* ── Cheat Sheet clipboard copy ── */
document.querySelectorAll('.cheat-card').forEach(card => {
  // Add copy flash span
  const flash = document.createElement('span');
  flash.className = 'copy-flash';
  flash.textContent = '✓ copied';
  card.appendChild(flash);

  card.addEventListener('click', () => {
    const text = card.dataset.copy;
    if (!text) return;
    navigator.clipboard.writeText(text).catch(() => {
      // Fallback
      const ta = document.createElement('textarea');
      ta.value = text;
      ta.style.position = 'fixed'; ta.style.opacity = '0';
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
    });
    card.classList.add('copied');
    setTimeout(() => card.classList.remove('copied'), 1500);
  });
});

/* ─────────────────────────────────────────────────────────
   INTERACTIVE DEMO — KNN Decision Boundary
   ───────────────────────────────────────────────────────── */
(function() {
  const canvas = document.getElementById('demo-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const toggleBtn = document.getElementById('demo-class-toggle');
  const trainBtn = document.getElementById('demo-train-btn');
  const clearBtn = document.getElementById('demo-clear-btn');
  const statusEl = document.getElementById('demo-status');

  let currentClass = 'A'; // 'A' or 'B'
  let points = []; // {x, y, cls}
  let boundaryImageData = null;
  let isTraining = false;

  const CLR_A = '#52b788';
  const CLR_B = '#f4a261';
  const CLR_A_REGION = 'rgba(82,183,136,0.13)';
  const CLR_B_REGION = 'rgba(244,162,97,0.13)';

  function getCanvasPos(e) {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    return {
      x: (clientX - rect.left) * scaleX,
      y: (clientY - rect.top) * scaleY
    };
  }

  function drawBackground() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    // Grid
    ctx.strokeStyle = 'rgba(82,183,136,0.06)';
    ctx.lineWidth = 1;
    for (let x = 0; x < canvas.width; x += 40) {
      ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, canvas.height); ctx.stroke();
    }
    for (let y = 0; y < canvas.height; y += 40) {
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(canvas.width, y); ctx.stroke();
    }
  }

  function drawBoundary() {
    if (boundaryImageData) ctx.putImageData(boundaryImageData, 0, 0);
  }

  function drawPoints() {
    points.forEach(p => {
      ctx.beginPath();
      ctx.arc(p.x, p.y, 7, 0, Math.PI * 2);
      ctx.fillStyle = p.cls === 'A' ? CLR_A : CLR_B;
      ctx.fill();
      ctx.strokeStyle = 'rgba(255,255,255,0.6)';
      ctx.lineWidth = 1.5;
      ctx.stroke();
    });
  }

  function redraw() {
    drawBackground();
    drawBoundary();
    drawPoints();
  }

  function knnPredict(px, py, k) {
    const dists = points.map(p => ({
      dist: (p.x - px) ** 2 + (p.y - py) ** 2,
      cls: p.cls
    })).sort((a, b) => a.dist - b.dist).slice(0, k);
    const countA = dists.filter(d => d.cls === 'A').length;
    return countA > k / 2 ? 'A' : 'B';
  }

  async function trainModel() {
    const cntA = points.filter(p => p.cls === 'A').length;
    const cntB = points.filter(p => p.cls === 'B').length;
    if (cntA < 2 || cntB < 2) {
      statusEl.textContent = '⚠️ Need ≥2 points per class';
      return;
    }
    if (isTraining) return;
    isTraining = true;
    trainBtn.disabled = true;
    statusEl.textContent = '⚡ Training...';

    const k = Math.min(5, Math.min(cntA, cntB));
    const step = 6; // pixel step for boundary grid
    const imgData = ctx.createImageData(canvas.width, canvas.height);

    // Fill transparent first
    for (let i = 0; i < imgData.data.length; i += 4) {
      imgData.data[i + 3] = 0;
    }

    // Compute in chunks for animation
    const totalRows = Math.ceil(canvas.height / step);
    let row = 0;

    function processChunk() {
      const chunkRows = 8;
      for (let r = 0; r < chunkRows && row < totalRows; r++, row++) {
        const py = row * step;
        for (let col = 0; col < Math.ceil(canvas.width / step); col++) {
          const px = col * step;
          const cls = knnPredict(px, py, k);
          const color = cls === 'A' ? [82, 183, 136, 33] : [244, 162, 97, 33];
          // Fill step×step block
          for (let dy = 0; dy < step && py + dy < canvas.height; dy++) {
            for (let dx = 0; dx < step && px + dx < canvas.width; dx++) {
              const idx = ((py + dy) * canvas.width + (px + dx)) * 4;
              imgData.data[idx] = color[0];
              imgData.data[idx + 1] = color[1];
              imgData.data[idx + 2] = color[2];
              imgData.data[idx + 3] = color[3];
            }
          }
        }
      }
      boundaryImageData = imgData;
      redraw();
      if (row < totalRows) {
        requestAnimationFrame(processChunk);
      } else {
        isTraining = false;
        trainBtn.disabled = false;
        statusEl.textContent = `✅ k=${k} boundary drawn`;
      }
    }
    requestAnimationFrame(processChunk);
  }

  // Event listeners
  canvas.addEventListener('click', e => {
    if (isTraining) return;
    const pos = getCanvasPos(e);
    points.push({ x: pos.x, y: pos.y, cls: currentClass });
    const cntA = points.filter(p => p.cls === 'A').length;
    const cntB = points.filter(p => p.cls === 'B').length;
    statusEl.textContent = `${cntA} Class A · ${cntB} Class B`;
    redraw();
  });

  canvas.addEventListener('touchstart', e => {
    e.preventDefault();
    canvas.dispatchEvent(new MouseEvent('click', { clientX: e.touches[0].clientX, clientY: e.touches[0].clientY }));
  }, { passive: false });

  toggleBtn.addEventListener('click', () => {
    currentClass = currentClass === 'A' ? 'B' : 'A';
    if (currentClass === 'A') {
      toggleBtn.style.background = 'rgba(82,183,136,0.2)';
      toggleBtn.style.borderColor = '#52b788';
      toggleBtn.style.color = '#52b788';
      toggleBtn.textContent = '🟢 Placing: Class A';
    } else {
      toggleBtn.style.background = 'rgba(244,162,97,0.2)';
      toggleBtn.style.borderColor = '#f4a261';
      toggleBtn.style.color = '#f4a261';
      toggleBtn.textContent = '🟠 Placing: Class B';
    }
  });

  trainBtn.addEventListener('click', trainModel);

  clearBtn.addEventListener('click', () => {
    points = [];
    boundaryImageData = null;
    statusEl.textContent = 'Click canvas to add points';
    redraw();
  });

  // Initial draw
  redraw();
})();

/* ── Taxonomy tree interactive hover ── */
document.querySelectorAll('.tax-node').forEach(node => {
  node.addEventListener('mouseenter', () => {
    node.style.filter = 'brightness(1.3)';
  });
  node.addEventListener('mouseleave', () => {
    node.style.filter = '';
  });
});

/* ── Hero particle animation (canvas) ── */
(function() {
  const hc = document.getElementById('hero-canvas');
  if (!hc) return;
  const hctx = hc.getContext('2d');
  let W = hc.offsetWidth, H = hc.offsetHeight;
  hc.width = W; hc.height = H;

  const particles = Array.from({length: 55}, () => ({
    x: Math.random() * W,
    y: Math.random() * H,
    vx: (Math.random() - 0.5) * 0.35,
    vy: (Math.random() - 0.5) * 0.35,
    r: Math.random() * 2.2 + 0.8,
    alpha: Math.random() * 0.5 + 0.2
  }));

  function animHero() {
    hctx.clearRect(0, 0, W, H);
    particles.forEach(p => {
      p.x += p.vx; p.y += p.vy;
      if (p.x < 0) p.x = W; if (p.x > W) p.x = 0;
      if (p.y < 0) p.y = H; if (p.y > H) p.y = 0;
      hctx.beginPath();
      hctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      hctx.fillStyle = `rgba(82,183,136,${p.alpha})`;
      hctx.fill();
    });
    // Draw connections
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 90) {
          hctx.beginPath();
          hctx.moveTo(particles[i].x, particles[i].y);
          hctx.lineTo(particles[j].x, particles[j].y);
          hctx.strokeStyle = `rgba(82,183,136,${0.12 * (1 - dist / 90)})`;
          hctx.lineWidth = 0.8;
          hctx.stroke();
        }
      }
    }
    requestAnimationFrame(animHero);
  }
  animHero();

  window.addEventListener('resize', () => {
    W = hc.offsetWidth; H = hc.offsetHeight;
    hc.width = W; hc.height = H;
  });
})();

// Original practice quiz (8 questions on ML fundamentals)
(function() {
  var correct = 0;
  var total = 8;
  document.querySelectorAll('.ml-quiz-q:not([data-quiz="expert"])').forEach(function(q) {
    var opts = q.querySelectorAll('.ml-quiz-opt');
    var expl = q.querySelector('.ml-quiz-expl');
    opts.forEach(function(btn) {
      btn.addEventListener('click', function() {
        if (q.dataset.answered === '1') return;
        q.dataset.answered = '1';
        var isCorrect = btn.dataset.correct === 'true';
        if (isCorrect) { correct++; btn.classList.add('correct'); }
        else {
          btn.classList.add('wrong');
          opts.forEach(function(b) { if (b.dataset.correct === 'true') b.classList.add('correct'); });
        }
        opts.forEach(function(b) { b.disabled = true; });
        if (expl) expl.classList.add('show');
        document.getElementById('ml-quiz-score').textContent = correct + ' / ' + total;
      });
    });
  });
})();

// Expert knowledge check (8 questions on landmark research)
(function() {
  var correct = 0;
  var total = 8;
  document.querySelectorAll('.ml-quiz-q[data-quiz="expert"]').forEach(function(q) {
    var opts = q.querySelectorAll('.ml-quiz-opt');
    var expl = q.querySelector('.ml-quiz-expl');
    opts.forEach(function(btn) {
      btn.addEventListener('click', function() {
        if (q.dataset.answered === '1') return;
        q.dataset.answered = '1';
        var isCorrect = btn.dataset.correct === 'true';
        if (isCorrect) { correct++; btn.classList.add('correct'); }
        else {
          btn.classList.add('wrong');
          opts.forEach(function(b) { if (b.dataset.correct === 'true') b.classList.add('correct'); });
        }
        opts.forEach(function(b) { b.disabled = true; });
        if (expl) expl.classList.add('show');
        var scoreEl = document.getElementById('ml-expert-score');
        if (scoreEl) scoreEl.textContent = correct + ' / ' + total;
      });
    });
  });
})();

