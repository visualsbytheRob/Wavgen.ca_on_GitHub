/* Progressive keyboard support for controls which retain their authored styling. */
document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('[onclick]').forEach(el => {
    if (el.matches('a[href],button,input,select,textarea,summary') || el.hasAttribute('onkeydown')) return;
    if (!el.hasAttribute('role')) el.setAttribute('role', 'button');
    if (!el.hasAttribute('tabindex')) el.tabIndex = 0;
    el.dataset.wgKeyboard = 'true';
    el.addEventListener('keydown', event => {
      if (event.defaultPrevented || event.target !== el || event.repeat || !['Enter', ' '].includes(event.key)) return;
      event.preventDefault();
      event.stopPropagation();
      // SVG graphics elements do not consistently expose HTMLElement.click().
      el.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true, view: window }));
    });
  });
  document.querySelectorAll('.wg-skip-link').forEach(link => link.addEventListener('click', () => {
    const target = document.getElementById(link.hash.slice(1));
    if (target) target.focus({ preventScroll: true });
  }));
});
