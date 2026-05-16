/* ══════════════════════════════════════════════════════════
   Quantum Computing — Visual Learning World
   Interactive JavaScript — extracted for Wavgen.ca integration
   ══════════════════════════════════════════════════════════ */

// ===== QUIZ LOGIC =====
const QUIZ_ANSWERS = { 1:'b', 2:'c', 3:'c', 4:'b', 5:'c', 6:'d', 7:'c', 8:'b' };
let quizState = {};

function answer(qNum, choice) {
  if (quizState[qNum]) return;
  quizState[qNum] = choice;
  const correct = QUIZ_ANSWERS[qNum];
  document.getElementById('qq'+qNum).querySelectorAll('.quiz-opt').forEach(btn => {
    btn.disabled = true;
    const c = btn.getAttribute('onclick').match(/'([a-d])'\)/)[1];
    if (c === correct) btn.classList.add('correct');
    else if (c === choice && choice !== correct) btn.classList.add('wrong');
  });
  document.getElementById('exp'+qNum).classList.add('visible');
  document.getElementById('qq'+qNum).classList.add('answered');
  const answered = Object.keys(quizState).length;
  const correctCount = Object.keys(quizState).filter(k => quizState[k] === QUIZ_ANSWERS[k]).length;
  document.getElementById('quiz-correct').textContent = correctCount;
  document.getElementById('quiz-answered').textContent = answered;
}

function resetQuiz() {
  quizState = {};
  document.querySelectorAll('.quiz-q').forEach(q => q.classList.remove('answered'));
  document.querySelectorAll('.quiz-opt').forEach(b => { b.disabled = false; b.classList.remove('correct','wrong'); });
  document.querySelectorAll('.quiz-exp').forEach(e => e.classList.remove('visible'));
  document.getElementById('quiz-correct').textContent = '0';
  document.getElementById('quiz-answered').textContent = '0';
}

// ===== STARFIELD =====
(function() {
  const sf = document.getElementById('starfield');
  for (let i = 0; i < 130; i++) {
    const s = document.createElement('div');
    s.className = 'star';
    const sz = (Math.random() * 2.5 + 0.5).toFixed(1);
    const dur = (Math.random() * 4 + 2).toFixed(1) + 's';
    const mo = (Math.random() * 0.2 + 0.05).toFixed(2);
    s.style.cssText = `width:${sz}px;height:${sz}px;top:${Math.random()*100}%;left:${Math.random()*100}%;--dur:${dur};--min-op:${mo};animation-delay:${(Math.random()*6).toFixed(1)}s`;
    sf.appendChild(s);
  }
})();

// ===== QUBIT DEMO =====
let qubitState = 'zero';

function setProbs(p0) {
  const p1 = 1 - p0;
  document.getElementById('probBar0').style.width = (p0 * 100) + '%';
  document.getElementById('probBar1').style.width = (p1 * 100) + '%';
  document.getElementById('prob0pct').textContent = Math.round(p0 * 100) + '%';
  document.getElementById('prob1pct').textContent = Math.round(p1 * 100) + '%';
}

function setBloch(x2, y2, animate) {
  const vec = document.getElementById('demoVec');
  const tip = document.getElementById('demoVecTip');
  if (!animate) {
    vec.setAttribute('x2', x2); vec.setAttribute('y2', y2);
    tip.setAttribute('cx', x2); tip.setAttribute('cy', y2);
    return;
  }
  const ox = parseFloat(vec.getAttribute('x2'));
  const oy = parseFloat(vec.getAttribute('y2'));
  const start = performance.now();
  (function step(now) {
    const t = Math.min((now - start) / 500, 1);
    const e = t < .5 ? 4*t*t*t : 1-Math.pow(-2*t+2,3)/2;
    const cx = ox + (x2-ox)*e, cy = oy + (y2-oy)*e;
    vec.setAttribute('x2', cx); vec.setAttribute('y2', cy);
    tip.setAttribute('cx', cx); tip.setAttribute('cy', cy);
    if (t < 1) requestAnimationFrame(step);
  })(start);
}

function setResult(icon, title, msg, color) {
  document.getElementById('resultDisplay').innerHTML =
    `<span class="result-icon">${icon}</span><div><div class="result-value" style="color:${color}">${title}</div><div class="result-text">${msg}</div></div>`;
}

function applySuperposition() {
  qubitState = 'superposition';
  setProbs(0.5);
  document.getElementById('stateFormula').textContent = '(|0⟩ + |1⟩) / √2';
  setBloch(62, 0, true);
  setResult('🌀', 'Superposition applied!', 'The H gate rotated the qubit to the equator of the Bloch sphere. It\'s now 50% |0⟩ and 50% |1⟩ simultaneously.', 'var(--cyan)');
}

function measure() {
  if (qubitState === 'zero') {
    setResult('💡', 'Measured: |0⟩', 'The qubit was already in state |0⟩ — no collapse needed. Apply the H gate first to create superposition.', 'var(--electric)');
    return;
  }
  if (qubitState === 'one') {
    setResult('💡', 'Measured: |1⟩', 'The qubit was already in state |1⟩ — no collapse needed.', 'var(--purple)');
    return;
  }
  const r = Math.random() < 0.5 ? 0 : 1;
  qubitState = r === 0 ? 'zero' : 'one';
  if (r === 0) {
    setProbs(1); document.getElementById('stateFormula').textContent = '|0⟩';
    setBloch(0, -62, true);
    setResult('⬆️', 'Collapsed to |0⟩!', 'The wavefunction collapsed. The qubit randomly chose <strong>0</strong>. The superposition is gone — it will always be |0⟩ until you reset.', 'var(--cyan)');
  } else {
    setProbs(0); document.getElementById('stateFormula').textContent = '|1⟩';
    setBloch(0, 62, true);
    setResult('⬇️', 'Collapsed to |1⟩!', 'The wavefunction collapsed. The qubit randomly chose <strong>1</strong>. The superposition is gone — it will always be |1⟩ until you reset.', 'var(--purple)');
  }
}

function resetQubit() {
  qubitState = 'zero';
  setProbs(1);
  document.getElementById('stateFormula').textContent = '|0⟩';
  setBloch(0, -62, true);
  setResult('🔄', 'Reset to |0⟩', 'Qubit reset to ground state. Press the H Gate button to create superposition again.', 'var(--text-muted)');
}

// ===== TABS =====
function switchTab(name, btn) {
  document.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
  document.getElementById('tab-' + name).classList.add('active');
  btn.classList.add('active');
}

// ===== LAB TABS =====
function switchLab(name, btn) {
  document.querySelectorAll('.lab-panel').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.lab-tab').forEach(b => b.classList.remove('active'));
  document.getElementById('lab-' + name).classList.add('active');
  btn.classList.add('active');
}

// ===== SCROLL ANIMATIONS =====
const obs = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      e.target.style.opacity = '1';
      e.target.style.transform = 'translateY(0)';
    }
  });
}, { threshold: 0.08 });

document.querySelectorAll('.concept-card, .resource-card, .cheat-card, .path-content').forEach(el => {
  el.style.opacity = '0';
  el.style.transform = 'translateY(28px)';
  el.style.transition = 'opacity 0.55s ease, transform 0.55s ease';
  obs.observe(el);
});

// ===== EXPERT QUIZ LOGIC =====
const EXPERT_ANSWERS = { 1:'b', 2:'b', 3:'c', 4:'b', 5:'c', 6:'b', 7:'c', 8:'c' };
let expertState = {};

function expertAnswer(qNum, choice) {
  if (expertState[qNum]) return;
  expertState[qNum] = choice;
  const correct = EXPERT_ANSWERS[qNum];
  document.getElementById('eqq'+qNum).querySelectorAll('.quiz-opt').forEach(btn => {
    btn.disabled = true;
    const c = btn.getAttribute('onclick').match(/'([a-d])'\)/)[1];
    if (c === correct) btn.classList.add('correct');
    else if (c === choice && choice !== correct) btn.classList.add('wrong');
  });
  document.getElementById('eexp'+qNum).classList.add('visible');
  document.getElementById('eqq'+qNum).classList.add('answered');
  const answered = Object.keys(expertState).length;
  const correctCount = Object.keys(expertState).filter(k => expertState[k] === EXPERT_ANSWERS[k]).length;
  document.getElementById('eq-correct').textContent = correctCount;
  document.getElementById('eq-answered').textContent = answered;
}

function resetExpertQuiz() {
  expertState = {};
  document.querySelectorAll('#expert-quiz .quiz-q').forEach(q => q.classList.remove('answered'));
  document.querySelectorAll('#expert-quiz .quiz-opt').forEach(b => { b.disabled = false; b.classList.remove('correct','wrong'); });
  document.querySelectorAll('#expert-quiz .quiz-exp').forEach(e => e.classList.remove('visible'));
  document.getElementById('eq-correct').textContent = '0';
  document.getElementById('eq-answered').textContent = '0';
}

