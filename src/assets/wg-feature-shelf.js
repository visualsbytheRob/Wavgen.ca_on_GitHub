(() => {
  const ease = (t) => {
    const clamped = Math.max(0, Math.min(1, t));
    return clamped * clamped * (3 - 2 * clamped);
  };
  const blend = (a, b, amount) => a + (b - a) * amount;

  function setup(frame) {
    if (frame.dataset.shelfReady) return;
    frame.dataset.shelfReady = 'true';
    const video = frame.querySelector('video');
    const pictureLink = frame.querySelector('.wg-coin-film-link');
    const controls = frame.querySelector('[data-wg-shelf-controls]');
    const caption = frame.parentElement.querySelector('[data-wg-shelf-caption]');
    const detail = frame.parentElement.querySelector('[data-wg-shelf-detail]');
    const slides = [...frame.querySelectorAll('[data-wg-shelf-slide]')].map((slide) => slide.dataset);
    const slots = new Map([...frame.querySelectorAll('[data-wg-shelf-slot]')].map((slot) => [slot.dataset.wgShelfSlot, {
      slot,
      link: slot.querySelector('a'),
    }]));
    let active = 0;

    function park(index) {
      const item = slots.get(slides[index].key);
      if (!item) return;
      item.slot.classList.remove('is-playing');
      item.link.hidden = false;
      item.link.removeAttribute('style');
    }

    function position() {
      const slide = slides[active];
      const item = slots.get(slide.key);
      if (!item) return;
      const { slot, link } = item;
      const coin = slide.motion === 'coin';
      const t = video.currentTime;
      const openingEnd = coin ? 30 / 24 : Math.min(1.25, video.duration / 4);
      const closingStart = coin ? 197 / 24 : video.duration - openingEnd;
      const dockAt = coin ? 9.84 : video.duration - .15;
      const closing = t >= closingStart;
      link.hidden = t >= openingEnd && !closing;
      if (link.hidden) return;
      if (!video.videoWidth || !Number.isFinite(openingEnd)) return;

      const dock = slot.getBoundingClientRect();
      const film = video.getBoundingClientRect();
      const scale = Math.min(film.width / video.videoWidth, film.height / video.videoHeight);
      const progress = closing ? 1 - ease((t - closingStart) / Math.max(.1, dockAt - closingStart)) : ease((t - .08) / Math.max(.1, openingEnd - .08));
      const filmX = film.left - dock.left + film.width / 2 - (coin && closing ? 3 * scale : 0);
      const filmY = film.top - dock.top + film.height / 2 - (coin ? 39 * scale : 0);
      const filmShotWidth = coin ? (closing ? 285 : 228) : video.videoWidth * .14;
      slot.classList.toggle('is-playing', progress > 0);
      link.style.left = blend(dock.width / 2, filmX, progress) + 'px';
      link.style.top = blend(0, filmY, progress) + 'px';
      link.style.width = blend(dock.width, filmShotWidth * scale, progress) + 'px';
    }

    function sync() {
      if (!frame.isConnected) return;
      position();
      if ('requestVideoFrameCallback' in video) video.requestVideoFrameCallback(sync);
      else requestAnimationFrame(sync);
    }

    function openSlide(index, play) {
      park(active);
      active = (index + slides.length) % slides.length;
      const slide = slides[active];
      pictureLink.href = slide.productUrl;
      caption.href = slide.productUrl;
      caption.textContent = slide.caption;
      detail.textContent = slide.detail;
      pictureLink.setAttribute('aria-label', 'View ' + slide.title);
      video.autoplay = false;
      video.muted = true;
      video.src = slide.film;
      if (play) video.play().catch(() => {});
      position();
    }

    video.loop = slides.length === 1;
    video.muted = true;
    video.addEventListener('ended', () => openSlide(active + 1, true));
    video.addEventListener('loadedmetadata', position);
    video.addEventListener('seeked', position);
    if (slides.length > 1) {
      controls.hidden = false;
      controls.querySelector('[data-wg-shelf-previous]').addEventListener('click', () => openSlide(active - 1, !video.paused));
      controls.querySelector('[data-wg-shelf-next]').addEventListener('click', () => openSlide(active + 1, !video.paused));
    }
    new ResizeObserver(position).observe(frame);
    position();
    sync();
  }

  const start = () => document.querySelectorAll('[data-wg-shelf]').forEach(setup);
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start, { once: true });
  else start();
  document.addEventListener('shopify:section:load', start);
})();
