/**
 * WAVGEN DATA APP EMBED - APP CATALOGUE ENHANCEMENT
 *
 * The app catalogue cards are rendered at build time from src/_data/apps.json
 * by src/_includes/components/app-showcase.njk. There is no app data in this
 * file: edit apps.json to add, change or remove an app.
 *
 * This script only adds a category filter on top of the server-rendered cards.
 * Without JavaScript every card is still visible.
 */
(function () {
  function init() {
    var container = document.getElementById('data-app-embed-container');
    if (!container) return;

    var select = container.querySelector('#app-category-select');
    var cards = container.querySelectorAll('.app-card');
    if (!select || cards.length === 0) return;

    select.hidden = false;
    select.addEventListener('change', function () {
      var value = select.value;
      cards.forEach(function (card) {
        var match = value === 'all' || card.getAttribute('data-category') === value;
        // Toggle the Tailwind class, not the [hidden] attribute: the card's
        // `flex` utility would otherwise override [hidden]'s display:none.
        card.classList.toggle('hidden', !match);
      });
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
