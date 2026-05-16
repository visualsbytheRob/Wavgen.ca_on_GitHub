/* ══════════════════════════════════════════════════════════
   SOA & Microservices — Visual Learning World
   Interactive JavaScript — extracted for Wavgen.ca integration
   ══════════════════════════════════════════════════════════ */

// &#8212;&#8212; Architecture Visualizer Tabs &#8212;&#8212;
function showArch(id) {
  document.querySelectorAll('#viz-tabs .tab-btn').forEach(function(b, i) {
    var ids = ['monolith','soa','microservices'];
    b.classList.toggle('active', ids[i] === id);
  });
  document.querySelectorAll('[id^="arch-"]').forEach(function(p) {
    p.classList.toggle('active', p.id === 'arch-' + id);
  });
}

// &#8212;&#8212; Resources Tabs &#8212;&#8212;
function showRes(id) {
  document.querySelectorAll('#res-tabs .tab-btn').forEach(function(b, i) {
    var ids = ['videos','interactive','read','books'];
    b.classList.toggle('active', ids[i] === id);
  });
  document.querySelectorAll('[id^="res-"]').forEach(function(p) {
    p.classList.toggle('active', p.id === 'res-' + id);
  });
}

// &#8212;&#8212; Scroll-based fade-in for cards &#8212;&#8212;
(function() {
  var observer = new IntersectionObserver(function(entries) {
    entries.forEach(function(e) {
      if (e.isIntersecting) {
        e.target.style.animation = 'fadeSlideUp 0.5s ease both';
        e.target.style.opacity = '1';
        observer.unobserve(e.target);
      }
    });
  }, { threshold: 0.08, rootMargin: '0px 0px -40px 0px' });

  document.querySelectorAll('.card, .pattern-card, .cheat-card, .roadmap-step, .timeline-content, .resource-item').forEach(function(el) {
    el.style.opacity = '0';
    observer.observe(el);
  });
})();

// &#8212;&#8212; Active nav link highlighting on scroll &#8212;&#8212;
(function() {
  var sections = document.querySelectorAll('section[id]');
  var links = document.querySelectorAll('.nav-link');
  window.addEventListener('scroll', function() {
    var scrollY = window.scrollY;
    sections.forEach(function(sec) {
      var top = sec.offsetTop - 90;
      var bottom = top + sec.offsetHeight;
      if (scrollY >= top && scrollY < bottom) {
        links.forEach(function(l) {
          l.style.color = l.getAttribute('href') === '#' + sec.id
            ? 'var(--accent-orange)'
            : '';
          l.style.background = l.getAttribute('href') === '#' + sec.id
            ? 'rgba(245,166,35,0.1)'
            : '';
        });
      }
    });
  }, { passive: true });
})();

// &#8212;&#8212; Knowledge Check Quiz &#8212;&#8212;
function kcAnswer(btn, isCorrect, qEl) {
  if (qEl.getAttribute('data-answered') === 'true') return;
  qEl.setAttribute('data-answered', 'true');

  var opts = qEl.querySelectorAll('.kc-opt');
  opts.forEach(function(o) {
    o.disabled = true;
    if (o.classList.contains('kc-correct-ans')) {
      o.style.background  = 'rgba(74,222,128,0.15)';
      o.style.borderColor = 'rgba(74,222,128,0.5)';
      o.style.color       = 'var(--accent-green)';
    }
  });

  var correctEl = document.getElementById('kc-correct');
  var wrongEl   = document.getElementById('kc-wrong');
  var remEl     = document.getElementById('kc-remaining');

  if (!isCorrect) {
    btn.style.background  = 'rgba(248,113,113,0.15)';
    btn.style.borderColor = 'rgba(248,113,113,0.5)';
    btn.style.color       = 'var(--accent-red)';
    qEl.querySelector('.kc-wrong-explanation').style.display = 'block';
    wrongEl.textContent = parseInt(wrongEl.textContent) + 1;
  } else {
    qEl.querySelector('.kc-explanation').style.display = 'block';
    correctEl.textContent = parseInt(correctEl.textContent) + 1;
  }
  remEl.textContent = Math.max(0, parseInt(remEl.textContent) - 1);
}

function kcReset() {
  document.querySelectorAll('.kc-q').forEach(function(q) {
    q.setAttribute('data-answered', 'false');
    q.querySelectorAll('.kc-opt').forEach(function(o) {
      o.disabled = false;
      o.style.background  = '';
      o.style.borderColor = '';
      o.style.color       = '';
    });
    q.querySelectorAll('.kc-explanation, .kc-wrong-explanation').forEach(function(e) {
      e.style.display = 'none';
    });
  });
  document.getElementById('kc-correct').textContent   = '0';
  document.getElementById('kc-wrong').textContent     = '0';
  document.getElementById('kc-remaining').textContent = '8';
}

