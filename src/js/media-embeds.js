/* Create players only on request. Keep one active player across the page. */
(() => {
  let active = null;
  function closePlayer() {
    if (!active) return;
    active.querySelector('iframe')?.remove();
    active.querySelector('.media-launch').hidden = false;
    active.querySelector('.media-close').hidden = true;
    active = null;
  }
  document.addEventListener('click', event => {
    const close = event.target.closest('.media-close');
    if (close) {
      const launch = close.closest('[data-media-player]').querySelector('.media-launch');
      closePlayer(); launch.focus(); return;
    }
    const button = event.target.closest('.media-launch');
    if (!button) return;
    const card = button.closest('[data-media-player]');
    const url = new URL(card.dataset.embedUrl);
    if (!['bandcamp.com', 'www.youtube-nocookie.com', 'www.youtube.com', 'w.soundcloud.com', 'embed.music.apple.com'].includes(url.hostname)) return;
    closePlayer();
    const frame = document.createElement('iframe');
    frame.src = url.href;
    frame.title = card.dataset.title;
    frame.allow = 'encrypted-media; fullscreen; picture-in-picture';
    frame.allowFullscreen = true;
    frame.referrerPolicy = 'strict-origin-when-cross-origin';
    frame.className = 'media-frame';
    card.querySelector('.media-stage').append(frame);
    button.hidden = true;
    card.querySelector('.media-close').hidden = false;
    active = card;
    frame.focus();
  });
  const search = document.querySelector('[data-video-search]');
  const category = document.querySelector('[data-video-category]');
  function filter() {
    const query = (search?.value || '').toLocaleLowerCase();
    let count = 0;
    document.querySelectorAll('[data-video-card]').forEach(card => {
      const show = card.dataset.title.toLocaleLowerCase().includes(query) &&
        (!category?.value || card.dataset.category === category.value);
      card.hidden = !show;
      if (!show && card === active) closePlayer();
      if (show) count++;
    });
    const status = document.querySelector('[data-video-count]');
    if (status) status.textContent = `${count} video${count === 1 ? '' : 's'}`;
  }
  search?.addEventListener('input', filter);
  category?.addEventListener('change', filter);
})();
