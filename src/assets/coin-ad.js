(() => {
  const visitKey = 'wavgen:coin-ad:dismissed';
  const bannerKey = 'wavgen:coin-ad:banner-dismissed';
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  let dismissedInDocument = false;

  function wasDismissed() {
    try {
      return dismissedInDocument || sessionStorage.getItem(visitKey) === '1';
    } catch {
      return dismissedInDocument;
    }
  }

  function rememberDismissal() {
    dismissedInDocument = true;
    try {
      sessionStorage.setItem(visitKey, '1');
    } catch {
      // The dismissal still applies in the current document.
    }
  }

  function animateIn(element, offset, ease = 'power2.out') {
    if (!element || reducedMotion.matches || !window.gsap) return;
    window.gsap.from(element, {
      opacity: 0,
      y: offset,
      duration: 0.45,
      ease,
      clearProps: 'opacity,transform',
    });
  }

  function bindPlayback(player) {
    const video = player.querySelector('video');
    const playback = player.querySelector('[data-coin-ad-playback]');
    if (!video || !playback || playback.dataset.bound) return;
    playback.dataset.bound = 'true';

    function update() {
      const label = video.paused ? 'Play film' : 'Pause film';
      playback.setAttribute('aria-label', label);
      const visibleLabel = playback.querySelector('[data-coin-ad-playback-label]');
      if (visibleLabel) visibleLabel.textContent = label;
      playback.dataset.playing = String(!video.paused);
    }

    video.addEventListener('play', update);
    video.addEventListener('pause', update);
    playback.addEventListener('click', () => {
      if (video.paused) video.play().catch(update);
      else video.pause();
    });
    update();
  }

  function initialize(root) {
    if (root.dataset.coinAdInitialized) return;
    root.dataset.coinAdInitialized = 'true';

    const banner = root.querySelector('[data-coin-ad-banner]');
    const popup = root.querySelector('[data-coin-ad-popup]');
    const video = popup?.querySelector('video');
    if (!banner || !popup || !video) return;

    try {
      banner.hidden = sessionStorage.getItem(bannerKey) === '1';
    } catch {
      // The banner is still dismissible if session storage is unavailable.
    }
    const bannerVideo = banner.querySelector('video');
    if (banner.hidden) bannerVideo?.pause();
    else animateIn(banner, 8);
    banner.querySelector('[data-coin-ad-hide-banner]')?.addEventListener('click', () => {
      banner.hidden = true;
      bannerVideo?.pause();
      try {
        sessionStorage.setItem(bannerKey, '1');
      } catch {
        // The banner remains hidden in this document.
      }
    });

    function dismiss() {
      const moveFocus = popup.contains(document.activeElement);
      rememberDismissal();
      window.gsap?.killTweensOf(popup);
      popup.hidden = true;
      video.pause();
      if (moveFocus && !banner.hidden) banner.querySelector('a')?.focus({ preventScroll: true });
    }

    for (const button of popup.querySelectorAll('[data-coin-ad-dismiss]')) {
      button.addEventListener('click', dismiss);
    }
    popup.addEventListener('keydown', (event) => {
      if (event.key === 'Escape') dismiss();
    });

    if (wasDismissed()) return;
    const delay = Number(popup.dataset.delay) || 0;
    window.setTimeout(() => {
      if (wasDismissed() || !popup.isConnected) return;
      popup.hidden = false;
      video.muted = true;
      video.play().catch(() => {});
      animateIn(popup, 18, 'back.out(1.5)');
    }, delay);
  }

  function initializeAll() {
    document.querySelectorAll('[data-coin-film-player]').forEach(bindPlayback);
    document.querySelectorAll('[data-coin-ad]').forEach(initialize);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeAll, { once: true });
  } else {
    initializeAll();
  }
  document.addEventListener('shopify:section:load', initializeAll);
})();
