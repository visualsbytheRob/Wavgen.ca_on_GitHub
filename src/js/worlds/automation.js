/* ══════════════════════════════════════════════════════════
   Automation — Visual Learning World
   Interactive JavaScript — extracted for Wavgen.ca integration
   ══════════════════════════════════════════════════════════ */

(function() {
  var answers = [2, 1, 2, 1, 2, 2, 1, 2];
  var score = 0, answered = 0;
  function updateScore() {
    document.getElementById('kcScore').textContent = score + ' / ' + answered;
  }
  window.kcAnswer = function(qIdx, optIdx) {
    var qEl = document.getElementById('kc-q-' + qIdx);
    var opts = qEl.querySelectorAll('.kc-opt');
    if (opts[0].disabled) return;
    opts.forEach(function(o, i) {
      o.disabled = true;
      if (i === answers[qIdx]) {
        o.classList.add(optIdx === i ? 'correct' : 'revealed');
      } else if (i === optIdx) {
        o.classList.add('wrong');
      }
    });
    qEl.querySelector('.kc-explanation').classList.add('visible');
    answered++;
    if (optIdx === answers[qIdx]) score++;
    updateScore();
  };
  window.kcReset = function() {
    score = 0; answered = 0; updateScore();
    for (var i = 0; i < 8; i++) {
      var qEl = document.getElementById('kc-q-' + i);
      qEl.querySelectorAll('.kc-opt').forEach(function(o) {
        o.disabled = false;
        o.className = 'kc-opt';
      });
      qEl.querySelector('.kc-explanation').classList.remove('visible');
    }
  };
})();

// ===== NAV SCROLL EFFECT =====
window.addEventListener('scroll', () => {
  const nav = document.querySelector('nav');
  nav.style.boxShadow = window.scrollY > 20 ? '0 2px 20px rgba(0,0,0,0.6)' : 'none';
});

// ===== WORKFLOW ANIMATION =====
const wfSteps = [0,1,2,3];
let wfActive = 0;
let wfTimer = null;

function animateWorkflow() {
  wfSteps.forEach(i => {
    document.getElementById('wf'+i).classList.remove('active');
    const arr = document.getElementById('wfa'+i);
    if(arr) arr.classList.remove('live');
  });
  document.getElementById('wf'+wfActive).classList.add('active');
  const arrEl = document.getElementById('wfa'+wfActive);
  if(arrEl) arrEl.classList.add('live');
  wfActive = (wfActive + 1) % wfSteps.length;
}

function startWorkflow() {
  if(wfTimer) clearInterval(wfTimer);
  wfTimer = setInterval(animateWorkflow, 1200);
}

function stopWorkflow() {
  if(wfTimer) { clearInterval(wfTimer); wfTimer = null; }
}

animateWorkflow();
startWorkflow();

// ===== PIPELINE BUILDER =====
const pipeline = [];
const nodeColors = {
  trigger: 'var(--orange)', transform: 'var(--blue)',
  decision: 'var(--purple)', action: 'var(--green)', notify: '#FFD700'
};

function selectChip(el, name, type) {
  el.classList.toggle('selected');
  const idx = pipeline.findIndex(p => p.name === name);
  if(idx >= 0) { pipeline.splice(idx, 1); }
  else { pipeline.push({name, type}); }
  renderPipeline();
}

function renderPipeline() {
  const canvas = document.getElementById('pbCanvas');
  if(!canvas) return;
  canvas.innerHTML = '';
  pipeline.forEach((item, i) => {
    const node = document.createElement('div');
    node.className = 'pb-node';
    node.style.cssText = 'display:inline-flex;align-items:center;justify-content:center;min-width:90px;padding:8px 14px;border-radius:8px;font-size:0.78rem;font-weight:600;border:1px solid ' + (nodeColors[item.type]||'var(--orange)') + ';color:' + (nodeColors[item.type]||'var(--orange)') + ';background:rgba(0,0,0,0.3);margin:4px;';
    node.textContent = item.name;
    canvas.appendChild(node);
    if(i < pipeline.length - 1) {
      const arrow = document.createElement('span');
      arrow.style.cssText = 'color:var(--orange);font-size:1.2rem;margin:0 2px;';
      arrow.textContent = '→';
      canvas.appendChild(arrow);
    }
  });
  const hint = document.getElementById('pbHint');
  if(hint) hint.textContent = pipeline.length + ' component' + (pipeline.length !== 1 ? 's' : '') + ' in pipeline. Click "Run Pipeline" to simulate.';
}

function clearPipeline() {
  pipeline.length = 0;
  document.querySelectorAll('.pb-chip').forEach(c => c.classList.remove('selected'));
  renderPipeline();
  const hint = document.getElementById('pbHint');
  if(hint) hint.textContent = '';
}

function runPipeline() {
  if(pipeline.length === 0) {
    const hint = document.getElementById('pbHint');
    if(hint) hint.textContent = '⚠️ Add at least one component to run the pipeline.';
    return;
  }
  const msgs = [
    '🚀 Pipeline executing...',
    '✅ Trigger fired successfully!',
    '⚙️ Processing through ' + pipeline.length + ' steps...',
    '✅ Pipeline completed! ' + pipeline.length + ' steps ran in 0.' + Math.floor(Math.random()*900+100) + 's'
  ];
  let i = 0;
  const hint = document.getElementById('pbHint');
  if(hint) {
    hint.style.color = 'var(--orange)';
    const interval = setInterval(() => {
      hint.textContent = msgs[i++];
      if(i >= msgs.length) { clearInterval(interval); hint.style.color = 'var(--green)'; }
    }, 600);
  }
  const canvas = document.getElementById('pbCanvas');
  if(canvas) {
    const nodes = canvas.querySelectorAll('.pb-node');
    nodes.forEach((node, idx) => {
      setTimeout(() => {
        node.style.boxShadow = '0 0 12px ' + (nodeColors[pipeline[idx]?.type] || 'var(--orange)');
        setTimeout(() => node.style.boxShadow = '', 800);
      }, idx * 400);
    });
  }
}

// ===== SCROLL ANIMATIONS =====
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if(entry.isIntersecting) {
      entry.target.style.opacity = '1';
      entry.target.style.transform = 'translateY(0)';
    }
  });
}, { threshold: 0.1 });

document.querySelectorAll('.concept-card, .tool-card, .rm-step, .cheat-card, .res-card, .fw-card, .kt-card, .kc-question').forEach(el => {
  el.style.opacity = '0';
  el.style.transform = 'translateY(20px)';
  el.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
  observer.observe(el);
});

