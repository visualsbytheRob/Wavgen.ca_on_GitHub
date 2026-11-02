document.addEventListener('DOMContentLoaded', () => {
  const dialog = document.getElementById('cmdk');
  const input = document.getElementById('cmdk-input');
  const results = document.getElementById('cmdk-results');
  if (!dialog || !input || !results) return;
  let opener;
  const links = [...new Map([...document.querySelectorAll('nav a[href^="/"]')]
    .filter(a => a.textContent.trim())
    .map(a => [a.getAttribute('href'), { href: a.getAttribute('href'), name: a.textContent.trim() }])).values()];
  function render() {
    results.replaceChildren();
    const query = input.value.trim().toLowerCase();
    const matches = links.filter(a => a.name.toLowerCase().includes(query)).slice(0, 20);
    for (const item of matches) {
      const a = document.createElement('a');
      a.href = item.href; a.textContent = item.name;
      a.className = 'block px-3 py-2 rounded hover:bg-black/10 focus:bg-black/10';
      results.append(a);
    }
    if (!matches.length) results.textContent = 'No matching pages.';
  }
  function open() { opener = document.activeElement; dialog.classList.remove('hidden'); render(); input.focus(); }
  function close() { dialog.classList.add('hidden'); opener?.focus(); }
  input.addEventListener('input', render);
  document.getElementById('cmdk-backdrop').addEventListener('click', close);
  document.addEventListener('keydown', event => {
    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') { event.preventDefault(); dialog.classList.contains('hidden') ? open() : close(); return; }
    if (dialog.classList.contains('hidden')) return;
    if (event.key === 'Escape') { event.preventDefault(); close(); }
    if (event.key === 'Tab') {
      const items = [input, ...results.querySelectorAll('a')];
      const first = items[0], last = items.at(-1);
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    }
  });
  // The existing homepage hint also opens the dialog by removing this class.
  new MutationObserver(() => {
    if (!dialog.classList.contains('hidden')) { if (!dialog.contains(document.activeElement)) opener = document.activeElement; render(); input.focus(); }
  }).observe(dialog, { attributes: true, attributeFilter: ['class'] });
});
