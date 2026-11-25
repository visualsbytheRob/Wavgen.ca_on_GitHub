import { makeRenderer, rotation } from './model.js';

const resource = path => new URL(path, import.meta.url).href;
async function read(path, kind) {
  const response = await fetch(resource(path));
  if (!response.ok) throw new Error(`Shelf asset ${path} could not load`);
  return response[kind]();
}
const assets = () => Promise.all([
  read('./shelf-data.json', 'json'), read('./model-review.json', 'json'),
  read('./shelf.html?v=3', 'text'), read('./shelf.css?v=3', 'text'),
]);
let pending;

class WavgenFilmShelf extends HTMLElement {
  async connectedCallback() {
    if (this.shadowRoot) return;
    const root = this.attachShadow({mode: 'open'});
    const slot = document.createElement('slot');
    root.append(slot);
    const restore = () => {
      root.getElementById('shelf')?.setAttribute('hidden', '');
      if (!slot.parentNode) root.prepend(slot);
      this.removeAttribute('data-enhanced');
      this.querySelector('video')?.play().catch(() => {});
    };
    const reveal = () => {
      if (!slot.parentNode) return;
      this.querySelectorAll('video').forEach(video => video.pause());
      slot.remove();
      root.getElementById('shelf').hidden = false;
      this.setAttribute('data-enhanced', '');
    };
    try {
      const [data, review, markup, css] = await (pending ??= assets());
      const style = document.createElement('style');
      style.textContent = css;
      root.prepend(style);
      const template = document.createElement('template');
      template.innerHTML = markup;
      template.content.querySelectorAll('.studies a').forEach(link => {
        link.href = resource(link.getAttribute('href'));
      });
      root.append(template.content);
      await mount(root, this, data, review, reveal, restore);
    } catch (error) {
      restore();
      console.warn('Wavgen film shelf is using the original carousel.', error);
    }
  }
}

async function mount(root, host, data, review, reveal, restore) {
  const el = id => root.getElementById(id);
  const film = el('film');
  const picture = el('film-picture');
  film.muted = true;
  // On iOS, present the decoded frame with the same compositor as the foreground.
  const ios = /iPad|iPhone|iPod/.test(navigator.userAgent) ||
    (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  const pictureContext = ios ? picture.getContext('2d', {alpha: false}) : null;
  const scene = el('scene');
  const stage = el('stage');
  const dock = el('dock');
  const layer = el('foreground');
  const raster = el('film-object');
  const flat = el('flat-object');
  const target = el('object');
  const playButton = el('playback');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const params = new URLSearchParams();

  const items = data.map(item => ({...item, href: new URL(item.href, location.href).href,
    ...Object.fromEntries(['icon', 'plain', 'film'].map(key => [key, resource(item[key])]))}));
  const coin = items.find(item => item.id === 'coin');
  if (host.dataset.coinHref) coin.href = new URL(host.dataset.coinHref, location.href).href;
  if (host.dataset.coinIcon) coin.icon = new URL(host.dataset.coinIcon, location.href).href;

  const reviewed = Object.fromEntries(Object.entries(review).map(([key, config]) => [
    key, {...config, asset: config.asset.startsWith('procedural:') ? config.asset : resource(config.asset)},
  ]));
  const clamp = x => Math.min(1, Math.max(0, x));
  const ease = x => { const t = clamp(x); return t * t * (3 - 2 * t); };
  const mix = (a, b, t) => a + (b - a) * t;
  const FPS = 24;
  let view;
  let index = 0;
  let version = 0;
  let model;
  let silhouette;
  let current;
  let grab;
  let returning;
  let suppressClick = false;
  let wantsPlay = true;
  let loss = false;
  let bounds;
  let drawnTime;
  let lastSnapshot;
  let parkView;
  let parkGeneration = 0;
  let parkFrame = 0;
  let parkTime = 0;
  const slots = items.map(item => {
    const link = document.createElement('a');
    link.className = 'slot';
    link.href = item.href;
    link.dataset.slot = item.id;
    link.setAttribute('aria-label', item.title);
    const figure = document.createElement('figure');
    const image = new Image();
    image.src = item.icon;
    image.alt = '';
    image.className = item.id === 'coin' ? 'coin' : '';
    figure.append(image);
    const label = document.createElement('span');
    label.className = 'label';
    label.textContent = item.label;
    link.append(figure, label);
    dock.append(link);
    image.addEventListener('load', () => { measure(); paint(); });
    const slot = {link, figure, image, yaw: 0, open: 0, seconds: 0, hover: false, focus: false};
    link.addEventListener('pointerenter', event => {
      if (event.pointerType !== 'mouse') return;
      slot.hover = true;
      schedulePark();
    });
    link.addEventListener('pointerleave', () => { slot.hover = false; schedulePark(); });
    link.addEventListener('focus', () => { slot.focus = link.matches(':focus-visible'); schedulePark(); });
    link.addEventListener('blur', () => { slot.focus = false; schedulePark(); });
    return slot;
  });
  let frameContext;

  function modelSize(slot, footprint) {
    const icon = slot.image.getBoundingClientRect();
    const scale = Math.min(icon.width / slot.image.naturalWidth, icon.height / slot.image.naturalHeight);
    if (!footprint || !Number.isFinite(scale)) return 0;
    return Math.min(slot.image.naturalWidth * scale / footprint.width, slot.image.naturalHeight * scale / footprint.height);
  }

  function drawParked(slot) {
    if (!parkView || !slot.model) return;
    const size = modelSize(slot, slot.footprint);
    if (!size) return;
    slot.canvas.style.width = size + 'px';
    const book = Boolean(slot.model.userData.park);
    slot.model.userData.park?.(slot.open, slot.seconds);
    parkView.draw(slot.model, rotation(slot.rest + slot.yaw, book ? .28 * slot.open : 0));
    slot.context.clearRect(0, 0, slot.canvas.width, slot.canvas.height);
    slot.context.drawImage(parkView.canvas, 0, 0);
    slot.link.setAttribute('data-parked-3d', '');
  }

  function schedulePark() {
    if (!parkFrame && parkView && !reduced.matches) {
      parkTime = 0;
      parkFrame = requestAnimationFrame(tickPark);
    }
  }

  function tickPark(time) {
    const dt = parkTime ? Math.min((time - parkTime) / 1000, .06) : 1 / 60;
    parkTime = time;
    parkFrame = 0;
    let again = false;
    for (const slot of slots) {
      if (!slot.model || slot.link.hasAttribute('data-moving')) continue;
      const active = slot.hover || slot.focus;
      const book = Boolean(slot.model.userData.park);
      if (!active && slot.yaw === 0 && slot.open === 0) continue;
      if (book) {
        slot.open = active ? Math.min(1, slot.open + dt * 2.1) : Math.max(0, slot.open - dt * 2.6);
        if (slot.open === 0) slot.seconds = 0;
        else if (slot.open > .68) slot.seconds += dt;
      } else if (active) {
        slot.yaw = (slot.yaw + dt * 2.9) % (Math.PI * 2);
      } else {
        const relative = Math.atan2(Math.sin(slot.yaw), Math.cos(slot.yaw));
        slot.yaw = Math.abs(relative) < .015 ? 0 : relative * Math.exp(-dt * 10);
      }
      drawParked(slot);
      again ||= active || slot.yaw !== 0 || slot.open !== 0;
    }
    if (again) parkFrame = requestAnimationFrame(tickPark);
  }

  function clearPark() {
    ++parkGeneration;
    cancelAnimationFrame(parkFrame);
    parkFrame = 0;
    for (const slot of slots) {
      slot.link.removeAttribute('data-parked-3d');
      slot.model = undefined;
      slot.yaw = slot.open = slot.seconds = 0;
    }
  }

  function setupPark() {
    clearPark();
    if (loss || reduced.matches || params.has('flat')) return;
    if (!parkView) {
      try {
        parkView = makeRenderer(240);
        parkView.canvas.addEventListener('webglcontextlost', () => { parkView = undefined; clearPark(); });
      } catch {
        return;
      }
    }
    const generation = parkGeneration;
    for (const [i, item] of items.entries()) {
      const config = reviewed[item.id];
      if (!config?.use) continue;
      const slot = slots[i];
      parkView.load(config.asset ?? item.model).then(loaded => {
        if (generation !== parkGeneration) return;
        slot.rest = config.yaw ?? 0;
        slot.footprint = parkView.footprint(loaded, rotation(slot.rest));
        slot.model = loaded;
        if (!slot.canvas) {
          slot.canvas = document.createElement('canvas');
          slot.canvas.width = slot.canvas.height = parkView.canvas.width;
          slot.canvas.setAttribute('aria-hidden', 'true');
          slot.figure.append(slot.canvas);
          slot.context = slot.canvas.getContext('2d');
          slot.image.addEventListener('load', () => drawParked(slot));
        }
        drawParked(slot);
        schedulePark();
      }).catch(() => { /* The original image remains available. */ });
    }
  }

  function setMoving(slot, moving) {
    if (slot.link.hasAttribute('data-moving') === moving) return;
    slot.link.toggleAttribute('data-moving', moving);
    if (moving || slot.model) {
      slot.yaw = slot.open = slot.seconds = 0;
      drawParked(slot);
      if (!moving) schedulePark();
    }
  }

  function buildRenderer() {
    if (view || loss || reduced.matches || params.has('flat')) return;
    try {
      view = makeRenderer();
      raster.width = view.canvas.width;
      raster.height = view.canvas.height;
      frameContext = raster.getContext('2d');
      view.canvas.hidden = true;
      view.canvas.setAttribute('aria-hidden', 'true');
      layer.insertBefore(view.canvas, target);
      view.canvas.addEventListener('webglcontextlost', event => {
        event.preventDefault();
        loss = true;
        clearPark();
        select(index, film.currentTime);
      });
    } catch {
      loss = true;
    }
  }

  function measure() {
    const area = scene.getBoundingClientRect();
    const filmRect = stage.getBoundingClientRect();
    const currentSlot = slots[index];
    const slot = currentSlot.figure.getBoundingClientRect();
    const homeSize = modelSize(currentSlot, silhouette) || Math.min(slot.width * .88, slot.height * 1.42);
    const home = {x: slot.left + slot.width / 2 - area.left, y: slot.top + slot.height / 2 - area.top,
      size: homeSize};
    const middle = {x: filmRect.left + filmRect.width / 2 - area.left,
      y: filmRect.top + filmRect.height * .52 - area.top, size: Math.min(filmRect.width * .29, filmRect.height * .56)};
    const laneInset = Math.min(slot.width * .15, 16);
    const laneLeft = slot.left - area.left + laneInset;
    const laneRight = slot.right - area.left - laneInset;
    bounds = { home, middle, edge: {
      x: Math.max(laneLeft, Math.min(laneRight, mix(middle.x, home.x, .76))),
      y: filmRect.bottom - area.top - 1,
      size: mix(middle.size, home.size, .69),
    }};
  }

  const at = (a, b, amount) => ({
    x: mix(a.x, b.x, amount), y: mix(a.y, b.y, amount), size: mix(a.size, b.size, amount),
  });

  function marks() {
    const duration = Number.isFinite(film.duration) ? film.duration : 10;
    return {
      lift: 1.25,
      exit: duration - 2.75,
      handoff: Math.round((duration - 1.55) * FPS) / FPS,
      dock: duration - .20,
    };
  }

  function turn(t, end) {
    const duration = end - .42;
    const elapsed = Math.min(duration, Math.max(0, t - .42));
    const ramp = .82;
    const speed = 2 * Math.PI / (duration - ramp);
    if (elapsed < ramp) return {spin: speed * elapsed ** 2 / (2 * ramp), velocity: speed * elapsed / ramp};
    if (elapsed > duration - ramp) {
      const remaining = duration - elapsed;
      return {spin: 2 * Math.PI - speed * remaining ** 2 / (2 * ramp), velocity: speed * remaining / ramp};
    }
    return {spin: speed * (elapsed - ramp / 2), velocity: speed};
  }

  function pose(t, marks) {
    const {home, middle, edge} = bounds;
    let placement;
    if (t < marks.lift) placement = at(home, middle, ease(t / marks.lift));
    else if (t < marks.exit) placement = middle;
    else if (t < marks.handoff) placement = at(middle, edge, ease((t - marks.exit) / (marks.handoff - marks.exit)));
    else placement = at(edge, home, ease((t - marks.handoff) / (marks.dock - marks.handoff)));
    // Keep the object visibly turning at the escape and ease to rest at the slot.
    const {spin, velocity} = turn(t, marks.dock);
    const rest = reviewed[current.id]?.yaw ?? 0;
    return {...placement, spin, velocity, orientation: rotation(rest + spin)};
  }

  function move(node, placement) {
    node.style.left = placement.x + 'px';
    node.style.top = placement.y + 'px';
    node.style.width = placement.size + 'px';
    if (node === flat) node.style.height = placement.size + 'px';
  }

  function showFlat(t) {
    const coin = current.id === 'coin';
    const opening = coin ? 30 / 24 : Math.min(1.25, film.duration / 4);
    const closing = coin ? 197 / 24 : film.duration - opening;
    const end = coin ? 9.84 : film.duration - .15;
    const moving = t > .08 && t < end && (t < opening || t >= closing);
    const baked = t >= opening && t < closing;
    flat.hidden = !moving;
    setMoving(slots[index], moving || baked);
    if (moving) {
      const {home} = bounds;
      const sceneRect = scene.getBoundingClientRect();
      const picture = film.getBoundingClientRect();
      const scale = Math.min(picture.width / film.videoWidth, picture.height / film.videoHeight);
      if (!Number.isFinite(scale)) return;
      const progress = t < opening ? ease((t - .08) / (opening - .08)) : 1 - ease((t - closing) / Math.max(.1, end - closing));
      const position = {
        x: picture.left - sceneRect.left + picture.width / 2,
        y: picture.top - sceneRect.top + picture.height / 2 - (coin ? 39 * scale : 0),
        size: (coin ? (t >= closing ? 285 : 228) : film.videoWidth * .14) * scale,
      };
      move(flat, at(home, position, progress));
    }
  }

  function paint(time = film.currentTime) {
    if (!current || !bounds || !Number.isFinite(film.duration)) return;
    const t = Math.max(0, time);
    const timeline = marks();
    if (!model) {
      showFlat(t);
      return;
    }
    const nearDock = t >= timeline.dock && !grab && !returning;
    const start = t < .035 && !grab;
    layer.hidden = start || nearDock;
    flat.hidden = true;
    setMoving(slots[index], !layer.hidden);
    if (layer.hidden) {
      lastSnapshot = {source: 'shelf', t};
      target.hidden = true;
      return;
    }
    const live = t >= timeline.handoff || Boolean(grab?.dragged) || Boolean(returning);
    const frame = Math.floor(t * FPS + 1e-6);
    const filmPose = pose(frame / FPS, timeline);
    const screenPose = live ? pose(t, timeline) : filmPose;
    if (grab?.dragged) {
      Object.assign(screenPose, grab.pose);
      screenPose.orientation = grab.orientation;
    }
    if (returning && !grab?.dragged) {
      const blend = ease((t - returning.time) / returning.duration);
      screenPose.orientation = returning.orientation.clone().slerp(screenPose.orientation, blend);
      if (blend >= 1) returning = undefined;
    }
    move(layer, screenPose);
    view.draw(model, screenPose.orientation);
    if (!live) {
      frameContext.clearRect(0, 0, raster.width, raster.height);
      frameContext.drawImage(view.canvas, 0, 0);
    }
    // The source changes in one DOM update. Both layers use the same camera and mesh.
    raster.hidden = live;
    view.canvas.hidden = !live;
    target.hidden = !live;
    layer.toggleAttribute('data-live', live);
    lastSnapshot = {source: live ? '3d' : 'film', t, frame, x: screenPose.x, y: screenPose.y,
      size: screenPose.size, spin: screenPose.spin, velocity: screenPose.velocity,
      quaternion: screenPose.orientation.toArray(), copies: Number(!raster.hidden) + Number(!view.canvas.hidden)};
  }

  function drawPicture() {
    if (!pictureContext || film.readyState < 2 || !film.videoWidth || !film.videoHeight) return;
    const width = Math.min(960, film.videoWidth);
    const height = Math.round(width * film.videoHeight / film.videoWidth);
    if (picture.width !== width || picture.height !== height) {
      picture.width = width;
      picture.height = height;
    }
    try {
      pictureContext.drawImage(film, 0, 0, width, height);
      picture.hidden = false;
    } catch {
      picture.hidden = true;
    }
  }

  function sync() {
    film.requestVideoFrameCallback(() => {
      drawPicture();
      // Only a presented video frame can advance the foreground.
      if (!film.seeking && !grab?.dragged && film.currentTime !== drawnTime) {
        drawnTime = film.currentTime;
        paint();
      }
      sync();
    });
  }

  function resume() {
    if (!wantsPlay || grab) return;
    const release = version;
    film.play().catch(error => {
      if (version !== release || error.name === 'AbortError') return;
      wantsPlay = false;
      updateButton();
    });
  }

  async function select(next, seek = 0) {
    const release = ++version;
    if (current) setMoving(slots[index], false);
    film.pause();
    index = (next + items.length) % items.length;
    current = items[index];
    const item = current;
    grab = returning = undefined;
    drawnTime = undefined;
    model = undefined;
    silhouette = undefined;
    layer.hidden = flat.hidden = true;
    [el('film-link'), target, el('caption')].forEach(link => { link.href = item.href; });
    target.setAttribute('aria-label', `Open ${item.title}`);
    el('caption').textContent = item.title;
    el('detail').textContent = item.detail;
    flat.src = item.icon;
    flat.classList.toggle('coin', item.id === 'coin');
    measure();
    if (reviewed[item.id]?.use) buildRenderer();
    if (view && !loss && !reduced.matches && !params.has('flat') && reviewed[item.id]?.use) {
      try {
        const loaded = await view.load(reviewed[item.id].asset ?? item.model);
        if (release !== version) return;
        silhouette = view.footprint(loaded, rotation(reviewed[item.id].yaw ?? 0));
        model = loaded;
        measure();
      } catch {
        if (release !== version) return;
      }
    }
    picture.hidden = true;
    film.src = model ? item.film : item.plain;
    const status = model ? '3D foreground available.' : 'Film and image shelf.';
    el('mode').textContent = status;
    film.addEventListener('loadedmetadata', () => {
      if (release !== version) return;
      reveal();
      measure();
      if (seek > 0) film.currentTime = Math.min(seek, film.duration - .001);
      paint();
      resume();
    }, {once: true});
    updateButton();
  }

  function updateButton() {
    playButton.textContent = wantsPlay ? 'Pause film' : 'Play film';
  }

  function finishGrab(event) {
    if (!grab || grab.pointer !== event.pointerId) return;
    const active = grab;
    grab = undefined;
    if (target.hasPointerCapture(event.pointerId)) target.releasePointerCapture(event.pointerId);
    if (active.dragged) {
      suppressClick = true;
      const t = film.currentTime;
      returning = {orientation: active.orientation, time: t, duration: Math.max(.03, Math.min(.66, marks().dock - t))};
      paint();
    }
    resume();
  }

  target.addEventListener('pointerdown', event => {
    if (!event.isPrimary || event.button !== 0 || !model || target.hidden) return;
    const placement = pose(film.currentTime, marks());
    suppressClick = false;
    const orientation = lastSnapshot?.quaternion && returning
      ? placement.orientation.clone().fromArray(lastSnapshot.quaternion)
      : placement.orientation;
    grab = {pointer: event.pointerId, x: event.clientX, y: event.clientY, pose: placement, base: orientation,
      orientation, dragged: false};
    target.setPointerCapture(event.pointerId);
    film.pause();
  });
  target.addEventListener('pointermove', event => {
    if (!grab || grab.pointer !== event.pointerId) return;
    const dx = event.clientX - grab.x;
    const dy = event.clientY - grab.y;
    if (!grab.dragged && Math.hypot(dx, dy) < 7) return;
    grab.dragged = true;
    grab.orientation = rotation(dx * .026, dy * .021).multiply(grab.base);
    paint();
  });
  target.addEventListener('pointerup', event => finishGrab(event));
  target.addEventListener('pointercancel', finishGrab);
  target.addEventListener('lostpointercapture', finishGrab);
  target.addEventListener('click', event => {
    if (!suppressClick || event.detail === 0) return;
    event.preventDefault();
    event.stopPropagation();
    suppressClick = false;
  });
  target.addEventListener('dragstart', event => event.preventDefault());
  el('previous').addEventListener('click', () => select(index - 1));
  el('next').addEventListener('click', () => select(index + 1));
  el('replay').addEventListener('click', () => { wantsPlay = true; select(index); });
  playButton.addEventListener('click', () => {
    wantsPlay = !wantsPlay;
    if (wantsPlay) resume();
    else film.pause();
    updateButton();
  });
  film.addEventListener('ended', () => {
    if (wantsPlay && !grab) select(index + 1);
  });
  film.addEventListener('loadeddata', drawPicture);
  film.addEventListener('seeked', () => {
    drawPicture();
    paint();
  });
  film.addEventListener('pause', () => paint());
  film.addEventListener('error', restore);
  reduced.addEventListener('change', () => {
    setupPark();
    select(index, film.currentTime);
  });
  new ResizeObserver(() => {
    measure();
    paint();
    slots.forEach(drawParked);
  }).observe(scene);
  if ('requestVideoFrameCallback' in film) sync();
  else film.addEventListener('timeupdate', () => {
    drawPicture();
    paint();
  });


  await select(items.findIndex(item => item.id === 'coin'));
  setupPark();
}

if (!customElements.get('wavgen-film-shelf')) customElements.define('wavgen-film-shelf', WavgenFilmShelf);
