document.addEventListener('DOMContentLoaded', () => {
  for (const slideshow of document.querySelectorAll('.hero-slideshow')) {
    const slides = [...slideshow.querySelectorAll('.hero-slide')];
    if (!slides.length) continue;
    const launch = document.createElement('button');
    launch.type = 'button';
    launch.className = 'slideshow-open';
    launch.textContent = 'Open slideshow ⛶';
    slideshow.parentElement.style.position = 'relative';
    slideshow.after(launch);
    const dialog = document.createElement('dialog');
    dialog.className = 'slideshow-viewer';
    dialog.setAttribute('aria-label', 'Image slideshow');
    dialog.innerHTML = '<div class="slideshow-toolbar"><button type="button" data-action="previous" aria-label="Previous slide">←</button><span class="slideshow-count" aria-live="polite"></span><button type="button" data-action="next" aria-label="Next slide">→</button><button type="button" data-action="play">Play slideshow</button><button type="button" data-action="close" aria-label="Close slideshow">Close ×</button></div><a class="slideshow-image-link"><img alt=""></a><div class="slideshow-description"><p></p><a class="slideshow-destination">Open this section →</a></div>';
    document.body.append(dialog);
    let index = 0, timer;
    const picture = dialog.querySelector('img');
    const imageLink = dialog.querySelector('.slideshow-image-link');
    const destination = dialog.querySelector('.slideshow-destination');
    const play = dialog.querySelector('[data-action="play"]');
    function show() {
      const slide = slides[index];
      picture.src = slide.src;
      picture.alt = slide.alt;
      imageLink.href = destination.href = slide.dataset.pageHref || location.pathname;
      imageLink.setAttribute('aria-label', 'Open ' + slide.alt);
      dialog.querySelector('.slideshow-description p').textContent = slide.alt;
      dialog.querySelector('.slideshow-count').textContent = `${index + 1} / ${slides.length}`;
    }
    function stop() { clearInterval(timer); timer = null; play.textContent = 'Play slideshow'; }
    function step(amount) { index = (index + amount + slides.length) % slides.length; show(); }
    launch.addEventListener('click', () => {
      index = slides.reduce((best, slide, i) => Number(getComputedStyle(slide).opacity) > Number(getComputedStyle(slides[best]).opacity) ? i : best, 0);
      show(); dialog.showModal();
    });
    const mobileLaunch = launch.cloneNode(true);
    mobileLaunch.className = 'slideshow-open-mobile';
    const intro = slideshow.closest('section')?.querySelector('h1')?.parentElement;
    if (intro) {intro.append(mobileLaunch);mobileLaunch.addEventListener('click', () => launch.click());}
    dialog.querySelector('[data-action="previous"]').addEventListener('click', () => {stop();step(-1);});
    dialog.querySelector('[data-action="next"]').addEventListener('click', () => {stop();step(1);});
    play.addEventListener('click', () => {
      if (timer) return stop();
      timer = setInterval(() => step(1), 8000);
      play.textContent = 'Pause slideshow';
    });
    dialog.querySelector('[data-action="close"]').addEventListener('click', () => dialog.close());
    dialog.addEventListener('close', () => {stop();(getComputedStyle(launch.parentElement).display === 'none' ? mobileLaunch : launch).focus();});
    dialog.addEventListener('keydown', event => {
      if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {event.preventDefault();stop();step(event.key === 'ArrowLeft' ? -1 : 1);}
    });
    // Internal section links can stay on this page: dismiss the viewer first.
    for (const link of [imageLink,destination]) link.addEventListener('click', () => dialog.close());
    document.addEventListener('visibilitychange', () => {if(document.hidden)stop();});
  }
});
