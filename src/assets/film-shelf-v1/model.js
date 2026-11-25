import * as THREE from './vendor/three.module.js';
import { GLTFLoader } from './vendor/loaders/GLTFLoader.js';

const axisY = new THREE.Vector3(0, 1, 0);
const axisX = new THREE.Vector3(1, 0, 0);
export const rotation = (yaw, pitch = 0) => new THREE.Quaternion()
  .setFromAxisAngle(axisY, yaw)
  .multiply(new THREE.Quaternion().setFromAxisAngle(axisX, pitch));

function paperTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 384;
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = '#e8d6ac';
  ctx.fillRect(0, 0, 256, 384);
  ctx.strokeStyle = '#77645a';
  ctx.lineWidth = 1.4;
  for (let i = 0; i < 24; i++) {
    const y = 57 + i * 11;
    ctx.beginPath();
    ctx.moveTo(31, y);
    ctx.lineTo(176 + (i * 37 % 40), y);
    ctx.stroke();
  }
  ctx.strokeStyle = '#994b49';
  ctx.strokeRect(28, 29, 94, 12);
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

function makeFolio() {
  const root = new THREE.Group();
  const book = new THREE.Group();
  root.add(book);
  const w = .74, h = 1.04;
  const leather = new THREE.MeshStandardMaterial({color: 0x58263e, roughness: .66});
  const stitch = new THREE.MeshStandardMaterial({color: 0x986879, roughness: .78});
  const brass = new THREE.MeshStandardMaterial({color: 0xc39446, metalness: .55, roughness: .29});
  const paper = new THREE.MeshStandardMaterial({color: 0xe1cb9c, roughness: .92});
  const print = new THREE.MeshStandardMaterial({map: paperTexture(), roughness: .9, side: THREE.DoubleSide});
  const box = (parent, size, center, material) => {
    const mesh = new THREE.Mesh(new THREE.BoxGeometry(...size), material);
    mesh.position.set(...center);
    parent.add(mesh);
  };
  box(book, [w, h, .025], [0, 0, -.073], leather);
  box(book, [.032, h, .16], [-w / 2, 0, 0], leather);
  box(book, [w - .058, h - .065, .096], [.006, 0, -.008], paper);
  const endpaper = new THREE.Mesh(new THREE.PlaneGeometry(w - .066, h - .073), print);
  endpaper.position.set(.003, 0, .042);
  book.add(endpaper);
  const cover = new THREE.Group();
  cover.position.set(-w / 2, 0, .073);
  book.add(cover);
  box(cover, [w, h, .028], [w / 2, 0, 0], leather);
  for (const x of [.036, w - .036]) box(cover, [.006, h - .075, .002], [x, 0, .015], stitch);
  for (const y of [-h / 2 + .037, h / 2 - .037]) box(cover, [w - .075, .006, .002], [w / 2, y, .015], stitch);
  box(cover, [.15, .066, .025], [w - .067, 0, .019], leather);
  box(cover, [.046, .037, .02], [w - .10, 0, .041], brass);
  const leaves = Array.from({length: 5}, (_, i) => {
    const hinge = new THREE.Group();
    hinge.position.set(-w / 2 + .027, 0, .056 - i * .003);
    const page = new THREE.Mesh(new THREE.PlaneGeometry(w - .065, h - .073, 12, 1), print);
    page.position.x = (w - .065) / 2;
    hinge.add(page);
    book.add(hinge);
    return hinge;
  });
  root.userData.park = (openness, seconds) => {
    const sweep = (1 - Math.cos(seconds * 2.2)) / 2;
    cover.rotation.y = -2.85 * openness;
    leaves.forEach((leaf, i) => {
      const phase = THREE.MathUtils.smoothstep(sweep, i * .13, i * .13 + .28);
      leaf.rotation.y = -openness * (2.65 * phase + .035 * (leaves.length - i));
    });
    book.position.x = w * .40 * openness;
    book.scale.setScalar(1 - .21 * openness);
  };
  return root;
}

async function makeCoin() {
  const loader = new THREE.TextureLoader();
  const faces = await Promise.all(['coin-totem.jpg', 'coin-portrait.jpg'].map(name => loader.loadAsync(new URL('./media/' + name, import.meta.url).href)));
  const coin = new THREE.Group();
  const rim = new THREE.Mesh(new THREE.CylinderGeometry(.5, .5, .035, 96, 1, true),
    new THREE.MeshStandardMaterial({color: 0xa3926a, metalness: .5, roughness: .38}));
  rim.rotation.x = Math.PI / 2;
  coin.add(rim);
  faces.forEach((texture, index) => {
    texture.colorSpace = THREE.SRGBColorSpace;
    const face = new THREE.Mesh(new THREE.CircleGeometry(.5, 96), new THREE.MeshBasicMaterial({map: texture}));
    face.position.z = index === 0 ? .018 : -.018;
    face.rotation.y = index === 0 ? 0 : Math.PI;
    coin.add(face);
  });
  return coin;
}

export function makeRenderer(size = 320) {
  const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, preserveDrawingBuffer: true });
  renderer.setSize(size, size, false);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.setClearColor(0x000000, 0);
  const scene = new THREE.Scene();
  const camera = new THREE.OrthographicCamera(-.59, .59, .59, -.59, .01, 12);
  camera.position.set(0, 0, 4);
  camera.lookAt(0, 0, 0);
  scene.add(new THREE.HemisphereLight(0xfff5e8, 0x6d6489, 2.05));
  const key = new THREE.DirectionalLight(0xffe7ca, 2.15);
  key.position.set(-2, 3, 4);
  scene.add(key);
  const rim = new THREE.DirectionalLight(0xa7beff, 1.1);
  rim.position.set(2, 1, -3);
  scene.add(rim);
  const pivot = new THREE.Group();
  scene.add(pivot);
  const loader = new GLTFLoader();
  const assets = new Map();
  function draw(model, orientation) {
    if (pivot.children[0] !== model) {
      pivot.clear();
      pivot.add(model);
    }
    pivot.quaternion.copy(orientation);
    renderer.render(scene, camera);
  }

  return {
    canvas: renderer.domElement,
    async load(url) {
      if (!assets.has(url)) {
        const asset = url === 'procedural:coin' ? makeCoin()
          : url === 'procedural:folio' ? Promise.resolve(makeFolio())
          : loader.loadAsync(url).then(gltf => gltf.scene);
        assets.set(url, asset.then(model => {
          const bounds = new THREE.Box3().setFromObject(model);
          if (bounds.isEmpty()) throw new Error('The model does not contain visible geometry');
          const diameter = bounds.getSize(new THREE.Vector3()).length();
          const normalized = new THREE.Group();
          model.position.sub(bounds.getCenter(new THREE.Vector3()));
          normalized.scale.setScalar(1 / diameter);
          normalized.add(model);
          normalized.userData.park = model.userData.park;
          return normalized;
        }));
      }
      return assets.get(url);
    },
    draw,
    footprint(model, orientation) {
      draw(model, orientation);
      const canvas = document.createElement('canvas');
      canvas.width = canvas.height = size;
      const context = canvas.getContext('2d');
      context.drawImage(renderer.domElement, 0, 0);
      const pixels = context.getImageData(0, 0, size, size).data;
      let left = size, right = 0, top = size, bottom = 0;
      for (let y = 0; y < size; y++) {
        for (let x = 0; x < size; x++) {
          if (pixels[(y * size + x) * 4 + 3] < 28) continue;
          left = Math.min(left, x);
          right = Math.max(right, x);
          top = Math.min(top, y);
          bottom = Math.max(bottom, y);
        }
      }
      if (right <= left || bottom <= top) throw new Error('The model did not produce a visible silhouette');
      return {width: (right - left + 1) / size, height: (bottom - top + 1) / size};
    },
  };
}
