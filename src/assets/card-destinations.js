/* Use approved artwork for card backgrounds; preserve every existing control/link. */
document.addEventListener('DOMContentLoaded', () => {
  const artwork = Object.fromEntries(Object.entries(window.wavgenApprovedImages || {}).map(([key,items]) => [key,items.filter(item => !item.contentSnapshot)]));
  const selectors = 'main .grid>div.rounded-lg,main .grid>div.rounded-xl,main .grid>article,.subpage-link,.cheat-card,.term-card,.video-card,.paper-card,.arch-card,.app-card,.card,.section-card,.resource-card,.media-card,.visual-content-card,.whats-new-card,.gallery-card,#vf-cards>a,main a.rounded-lg,main a.rounded-xl,main a.rounded-2xl';
  let sequence = 0;
  function enhance(root) {
    const cards = [...(root.matches?.(selectors) ? [root] : []), ...root.querySelectorAll(selectors)];
    for (const card of cards) {
      if (card.dataset.imageCardReady) continue;
      card.dataset.imageCardReady = 'true';
      const primary = card.matches('a[href]') ? card : card.querySelector('.cardlink a[href],.media-info a[href],a[href]');
      const destination = primary?.getAttribute('href') || location.pathname;
      let key = location.pathname.replace(/^\/+|\/+$/g, '') || 'home';
      if (destination.startsWith('/')) key = destination.split('#')[0].replace(/^\/+|\/+$/g, '') || 'home';
      const pool = artwork[key]?.length ? artwork[key] : artwork[key.split('/')[0]]?.length ? artwork[key.split('/')[0]] : artwork.home || [];
      const image = card.querySelector('img')?.getAttribute('src') || pool[sequence++ % pool.length]?.url;
      if (image) {
        card.style.setProperty('--card-art', `url(${JSON.stringify(image)})`);
        card.classList.add('image-backed-card');
      }
      if (primary && primary !== card) {
        card.classList.add('destination-card');
        primary.classList.add('card-primary-destination');
        // A real stretched anchor provides keyboard, new-tab, and status-bar behavior.
        for (const control of card.querySelectorAll('a,button,input,select,textarea,summary,iframe')) {
          if (control !== primary) control.classList.add('card-independent-control');
        }
      }
    }
  }
  enhance(document);
  new MutationObserver(records => {
    for (const record of records) for (const node of record.addedNodes) {
      if (node.nodeType === 1) enhance(node);
    }
  }).observe(document.querySelector('main') || document.body, {childList:true,subtree:true});
});
