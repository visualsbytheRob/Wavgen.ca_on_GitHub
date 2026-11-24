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
    const shotLink = frame.querySelector('.wg-coin-film-frame__coin');
    const shot = shotLink.querySelector('img');
    const controls = frame.querySelector('[data-wg-shelf-controls]');
    const caption = frame.parentElement.querySelector('[data-wg-shelf-caption]');
    const detail = frame.parentElement.querySelector('[data-wg-shelf-detail]');
    const slides = [...frame.querySelectorAll('[data-wg-shelf-slide]')].map((slide) => slide.dataset);
    let active = 0;

    function position() {
      const slide = slides[active];
      if (!slide.shot) {
        shotLink.hidden = true;
        return;
      }
      const coin = slide.motion === 'coin';
      const t = video.currentTime;
      const openingEnd = coin ? 30 / 24 : Math.min(1.25, video.duration / 4);
      const closingStart = coin ? 197 / 24 : video.duration - openingEnd;
      const dockAt = coin ? 9.84 : video.duration - .15;
      const closing = t >= closingStart;
      shotLink.hidden = t >= openingEnd && !closing;
      if (shotLink.hidden) return;
      if (!video.videoWidth || !Number.isFinite(openingEnd)) return;

      const box = frame.getBoundingClientRect();
      const film = video.getBoundingClientRect();
      const scale = Math.min(film.width / video.videoWidth, film.height / video.videoHeight);
      const progress = closing ? 1 - ease((t - closingStart) / Math.max(.1, dockAt - closingStart)) : ease((t - .08) / Math.max(.1, openingEnd - .08));
      const dockX = box.width * .82;
      const dockY = box.height;
      const dockSize = Math.min(168, Math.max(76, window.innerWidth * .15));
      const filmX = film.left - box.left + film.width / 2 - (coin && closing ? 3 * scale : 0);
      const filmY = film.top - box.top + film.height / 2 - (coin ? 39 * scale : 0);
      shotLink.style.left = blend(dockX, filmX, progress) + 'px';
      shotLink.style.top = blend(dockY, filmY, progress) + 'px';
      shotLink.style.bottom = 'auto';
      const filmShotWidth = coin ? (closing ? 285 : 228) : video.videoWidth * .14;
      shotLink.style.width = blend(dockSize, filmShotWidth * scale, progress) + 'px';
      shotLink.style.transform = 'translate(-50%, -50%)';
    }

    function sync() {
      if (!frame.isConnected) return;
      position();
      if ('requestVideoFrameCallback' in video) video.requestVideoFrameCallback(sync);
      else requestAnimationFrame(sync);
    }

    function openSlide(index, play) {
      active = (index + slides.length) % slides.length;
      const slide = slides[active];
      pictureLink.href = shotLink.href = slide.productUrl;
      caption.href = slide.productUrl;
      caption.textContent = slide.caption;
      detail.textContent = slide.detail;
      pictureLink.setAttribute('aria-label', 'View ' + slide.title);
      shotLink.setAttribute('aria-label', 'View ' + slide.title);
      if (slide.shot) shot.src = slide.shot;
      shotLink.classList.toggle('is-coin', slide.motion === 'coin');
      shotLink.removeAttribute('style');
      shotLink.hidden = !slide.shot;
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
