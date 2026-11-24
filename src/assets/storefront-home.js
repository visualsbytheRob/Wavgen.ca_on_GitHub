/* Wavgen theme layer: slideshow + reveal. Respects prefers-reduced-motion and the Theme Editor. */
(function () {
  if (window.__wgInit) return; window.__wgInit = true;
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  document.documentElement.classList.add('wg-js');

  function initShow(root) {
    if (root.__wg) return; root.__wg = true;
    var slides = Array.prototype.slice.call(root.querySelectorAll('[data-wg-slide]'));
    if (!slides.length) return;
    var i = Math.max(0, slides.findIndex(function (s) { return s.classList.contains('is-active'); }));
    var count = root.querySelector('[data-wg-count]');
    var pauseBtn = root.querySelector('[data-wg-pause]');
    var ms = parseInt(root.getAttribute('data-interval'), 10) || 7000;
    var paused = reduce, timer = null;
    function show(n) {
      slides[i].classList.remove('is-active');
      i = (n + slides.length) % slides.length;
      var img = slides[i].querySelector('img[loading="lazy"]'); if (img) img.loading = 'eager';
      slides[i].classList.add('is-active');
      if (count) count.textContent = (i + 1) + ' / ' + slides.length;
    }
    function tick() { clearTimeout(timer); if (!paused && slides.length > 1) timer = setTimeout(function () { show(i + 1); tick(); }, ms); }
    function setPaused(p) {
      paused = p; if (p) root.setAttribute('data-wg-paused', ''); else root.removeAttribute('data-wg-paused');
      if (pauseBtn) { pauseBtn.textContent = p ? 'Play' : 'Pause'; pauseBtn.setAttribute('aria-pressed', p ? 'true' : 'false'); }
      tick();
    }
    var prev = root.querySelector('[data-wg-prev]'), next = root.querySelector('[data-wg-next]');
    if (prev) prev.addEventListener('click', function (e) { e.preventDefault(); show(i - 1); tick(); });
    if (next) next.addEventListener('click', function (e) { e.preventDefault(); show(i + 1); tick(); });
    if (pauseBtn) pauseBtn.addEventListener('click', function (e) { e.preventDefault(); setPaused(!paused); });
    root.addEventListener('mouseenter', function () { clearTimeout(timer); });
    root.addEventListener('mouseleave', tick);
    document.addEventListener('visibilitychange', function () { if (document.hidden) clearTimeout(timer); else tick(); });
    root.__wgShow = function (el) { var n = slides.indexOf(el); if (n > -1) { show(n); setPaused(true); } };
    setPaused(paused);
  }

  function initReveal(scope) {
    var els = (scope || document).querySelectorAll('.wg-reveal:not(.is-in)');
    if (!('IntersectionObserver' in window) || reduce) { els.forEach(function (e) { e.classList.add('is-in'); }); return; }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add('is-in'); io.unobserve(en.target); } });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.05 });
    els.forEach(function (e) { io.observe(e); });
  }

  function boot(scope) {
    (scope || document).querySelectorAll('[data-wg-slideshow]').forEach(initShow);
    initReveal(scope);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', function () { boot(); }); else boot();

})();
