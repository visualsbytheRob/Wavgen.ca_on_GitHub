// Add the site's learning resources without changing the preserved scan export.
(() => {
  const section = document.getElementById('learn-foundations');
  const grid = document.querySelector('.td-scan-primary #grid');
  if (!section || !grid) return;
  const cards = [...section.querySelectorAll('article')];
  for (const card of cards) {
    card.classList.add('card', 'foundations-card');
    card.classList.remove('mb-6');
    card.dataset.cats = 'learning';
    card.dataset.text = ('Learn foundations training workshops ' + card.textContent).toLowerCase();
    const badge = document.createElement('p');
    badge.className = 'foundations-label';
    badge.textContent = 'Learn / Foundations';
    card.prepend(badge);
  }
  grid.prepend(...cards);
  section.remove();
  const anchor = document.createElement('span');
  anchor.id = 'learn-foundations';
  cards[0].prepend(anchor);
  // Existing search and category controls now include the two learning cards.
  document.getElementById('q').dispatchEvent(new Event('input', {bubbles:true}));
})();
