/**
 * Placeholder Visuals Generator
 * Creates procedurally generated placeholder images using Canvas
 * Vibrant, dynamic imagery with modal support
 */

(function() {
  'use strict';

  // Extended color palettes - vibrant, monochrome, and mixed
  const PALETTES = {
    neon: ['#FF1493', '#00D4FF', '#FFD700', '#39FF14', '#FF00FF'],
    sunset: ['#FF6B35', '#FF8C42', '#FFD166', '#F4845F', '#F25C54'],
    ocean: ['#00B4D8', '#0077B6', '#023E8A', '#48CAE4', '#90E0EF'],
    forest: ['#2D6A4F', '#40916C', '#52B788', '#74C69D', '#95D5B2'],
    fire: ['#D00000', '#DC2F02', '#E85D04', '#F48C06', '#FAA307'],
    galaxy: ['#7400B8', '#6930C3', '#5E60CE', '#5390D9', '#4EA8DE'],
    candy: ['#F72585', '#B5179E', '#7209B7', '#560BAD', '#480CA8'],
    mono: ['#FFFFFF', '#E0E0E0', '#BDBDBD', '#9E9E9E', '#757575'],
    noir: ['#1A1A2E', '#16213E', '#0F3460', '#E94560', '#FFFFFF'],
    cyber: ['#00FF41', '#008F11', '#00FF41', '#003B00', '#39FF14'],
    vaporwave: ['#FF6AD5', '#C774E8', '#AD8CFF', '#8795E8', '#94D0FF'],
    thermal: ['#000033', '#000066', '#660066', '#CC0066', '#FF3300']
  };

  const PALETTE_NAMES = Object.keys(PALETTES);

  // Get a random palette
  function getRandomPalette(seed) {
    const idx = Math.floor(seededRandom(seed) * PALETTE_NAMES.length);
    return PALETTES[PALETTE_NAMES[idx]];
  }

  // Generate a seeded random number for consistency
  function seededRandom(seed) {
    const x = Math.sin(seed) * 10000;
    return x - Math.floor(x);
  }

  // All available visual styles
  const STYLES = [
    'waves', 'particles', 'grid', 'circles', 'plasma', 'aurora',
    'triangles', 'hexagons', 'spirals', 'lightning', 'fractal',
    'stripes', 'dots', 'diamonds', 'noise', 'gradient', 'rays',
    'bubbles', 'maze', 'crosshatch'
  ];

  // Create a canvas-based placeholder image with vibrant colors
  function createPlaceholderCanvas(width, height, seed = 0, style = null) {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');

    // Pick a random palette and style if not specified
    const palette = getRandomPalette(seed);
    const chosenStyle = style || STYLES[Math.floor(seededRandom(seed + 50) * STYLES.length)];

    // Dynamic gradient background
    const gradient = ctx.createLinearGradient(0, 0, width, height);
    const isMono = palette === PALETTES.mono || palette === PALETTES.noir;
    gradient.addColorStop(0, isMono ? '#0a0a0a' : '#0a0015');
    gradient.addColorStop(0.3, palette[0] + '30');
    gradient.addColorStop(0.7, palette[1] + '20');
    gradient.addColorStop(1, isMono ? '#0a0a0a' : '#0a0015');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);

    // Draw based on style
    const drawFn = {
      waves: drawWaves, particles: drawParticles, grid: drawGrid,
      circles: drawCircles, plasma: drawPlasma, aurora: drawAurora,
      triangles: drawTriangles, hexagons: drawHexagons, spirals: drawSpirals,
      lightning: drawLightning, fractal: drawFractal, stripes: drawStripes,
      dots: drawDots, diamonds: drawDiamonds, noise: drawNoise,
      gradient: drawGradientBlobs, rays: drawRays, bubbles: drawBubbles,
      maze: drawMaze, crosshatch: drawCrosshatch
    }[chosenStyle] || drawWaves;

    drawFn(ctx, width, height, seed, palette);
    return canvas;
  }

  // Wave pattern - vibrant flowing lines
  function drawWaves(ctx, w, h, seed, palette) {
    for (let i = 0; i < 10; i++) {
      ctx.beginPath();
      const yOffset = h * 0.15 + (i * h * 0.08);
      const amplitude = 25 + seededRandom(seed + i) * 40;
      const frequency = 0.008 + seededRandom(seed + i + 100) * 0.015;
      const phase = seededRandom(seed + i + 200) * Math.PI * 2;
      
      ctx.strokeStyle = palette[i % palette.length];
      ctx.lineWidth = 3 + seededRandom(seed + i) * 3;
      ctx.globalAlpha = 0.7;
      ctx.shadowColor = palette[i % palette.length];
      ctx.shadowBlur = 15;
      
      for (let x = 0; x <= w; x += 2) {
        const y = yOffset + Math.sin(x * frequency + phase) * amplitude + Math.cos(x * frequency * 0.5) * amplitude * 0.5;
        if (x === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();
    }
    ctx.globalAlpha = 1;
    ctx.shadowBlur = 0;
  }

  // Particle field - glowing orbs
  function drawParticles(ctx, w, h, seed, palette) {
    const particleCount = 60;
    
    for (let i = 0; i < particleCount; i++) {
      const x = seededRandom(seed + i) * w;
      const y = seededRandom(seed + i + 100) * h;
      const radius = 4 + seededRandom(seed + i + 200) * 15;
      const color = palette[i % palette.length];
      
      // Glowing effect
      const glow = ctx.createRadialGradient(x, y, 0, x, y, radius * 2);
      glow.addColorStop(0, color);
      glow.addColorStop(0.4, color + '80');
      glow.addColorStop(1, color + '00');
      
      ctx.beginPath();
      ctx.arc(x, y, radius * 2, 0, Math.PI * 2);
      ctx.fillStyle = glow;
      ctx.fill();
    }
    
    // Draw connecting lines
    ctx.lineWidth = 1;
    ctx.globalAlpha = 0.4;
    for (let i = 0; i < 25; i++) {
      const x1 = seededRandom(seed + i * 2) * w;
      const y1 = seededRandom(seed + i * 2 + 50) * h;
      const x2 = seededRandom(seed + i * 2 + 100) * w;
      const y2 = seededRandom(seed + i * 2 + 150) * h;
      ctx.strokeStyle = palette[i % palette.length];
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.stroke();
    }
    ctx.globalAlpha = 1;
  }

  // Grid pattern - neon grid
  function drawGrid(ctx, w, h, seed, palette) {
    const cellSize = 35;
    
    // Glowing grid lines
    for (let x = 0; x <= w; x += cellSize) {
      ctx.strokeStyle = palette[0] + '60';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, h);
      ctx.stroke();
    }

    for (let y = 0; y <= h; y += cellSize) {
      ctx.strokeStyle = palette[1] + '60';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(w, y);
      ctx.stroke();
    }

    // Highlight cells with glowing squares
    for (let i = 0; i < 15; i++) {
      const cx = Math.floor(seededRandom(seed + i) * (w / cellSize)) * cellSize;
      const cy = Math.floor(seededRandom(seed + i + 50) * (h / cellSize)) * cellSize;
      const color = palette[i % palette.length];
      
      ctx.shadowColor = color;
      ctx.shadowBlur = 20;
      ctx.fillStyle = color + '80';
      ctx.fillRect(cx + 2, cy + 2, cellSize - 4, cellSize - 4);
    }
    ctx.shadowBlur = 0;
  }

  // Concentric circles - pulsing rings
  function drawCircles(ctx, w, h, seed, palette) {
    const centerX = w / 2 + (seededRandom(seed) - 0.5) * w * 0.2;
    const centerY = h / 2 + (seededRandom(seed + 1) - 0.5) * h * 0.2;
    
    for (let i = 0; i < 15; i++) {
      const radius = 15 + i * 25;
      const color = palette[i % palette.length];
      
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
      ctx.strokeStyle = color;
      ctx.lineWidth = 3;
      ctx.shadowColor = color;
      ctx.shadowBlur = 15;
      ctx.globalAlpha = 0.6 - (i * 0.03);
      ctx.stroke();
    }
    ctx.globalAlpha = 1;
    ctx.shadowBlur = 0;
  }

  // Plasma effect - psychedelic blobs
  function drawPlasma(ctx, w, h, seed, palette) {
    for (let i = 0; i < 8; i++) {
      const x = seededRandom(seed + i * 10) * w;
      const y = seededRandom(seed + i * 10 + 5) * h;
      const radius = 50 + seededRandom(seed + i * 10 + 15) * 150;
      const color = palette[i % palette.length];
      
      const glow = ctx.createRadialGradient(x, y, 0, x, y, radius);
      glow.addColorStop(0, color + 'CC');
      glow.addColorStop(0.3, color + '66');
      glow.addColorStop(0.7, color + '22');
      glow.addColorStop(1, color + '00');
      
      ctx.fillStyle = glow;
      ctx.fillRect(0, 0, w, h);
    }
  }

  // Aurora effect - flowing bands
  function drawAurora(ctx, w, h, seed, palette) {
    for (let band = 0; band < 5; band++) {
      ctx.beginPath();
      const baseY = h * 0.2 + band * h * 0.15;
      const color = palette[band % palette.length];
      
      ctx.moveTo(0, baseY);
      for (let x = 0; x <= w; x += 5) {
        const y = baseY + Math.sin(x * 0.02 + seed + band) * 30 + Math.sin(x * 0.01 + seed * 2) * 20;
        ctx.lineTo(x, y);
      }
      ctx.lineTo(w, h);
      ctx.lineTo(0, h);
      ctx.closePath();
      
      const grad = ctx.createLinearGradient(0, baseY - 50, 0, baseY + 100);
      grad.addColorStop(0, color + '00');
      grad.addColorStop(0.3, color + '60');
      grad.addColorStop(0.5, color + '40');
      grad.addColorStop(1, color + '00');
      
      ctx.fillStyle = grad;
      ctx.fill();
    }
  }

  // Triangles - geometric pattern
  function drawTriangles(ctx, w, h, seed, palette) {
    const size = 60;
    for (let y = -size; y < h + size; y += size * 0.866) {
      for (let x = -size; x < w + size; x += size) {
        const offset = (Math.floor(y / (size * 0.866)) % 2) * (size / 2);
        const color = palette[Math.floor(seededRandom(seed + x + y) * palette.length)];
        ctx.beginPath();
        ctx.moveTo(x + offset, y);
        ctx.lineTo(x + offset + size / 2, y + size * 0.866);
        ctx.lineTo(x + offset - size / 2, y + size * 0.866);
        ctx.closePath();
        ctx.fillStyle = color + '60';
        ctx.strokeStyle = color;
        ctx.lineWidth = 1;
        ctx.fill();
        ctx.stroke();
      }
    }
  }

  // Hexagons - honeycomb pattern
  function drawHexagons(ctx, w, h, seed, palette) {
    const size = 40;
    for (let row = 0; row < h / size + 2; row++) {
      for (let col = 0; col < w / size + 2; col++) {
        const x = col * size * 1.5;
        const y = row * size * 1.732 + (col % 2) * size * 0.866;
        const color = palette[Math.floor(seededRandom(seed + col * 7 + row * 13) * palette.length)];
        
        ctx.beginPath();
        for (let i = 0; i < 6; i++) {
          const angle = (Math.PI / 3) * i;
          const px = x + size * Math.cos(angle);
          const py = y + size * Math.sin(angle);
          if (i === 0) ctx.moveTo(px, py);
          else ctx.lineTo(px, py);
        }
        ctx.closePath();
        ctx.fillStyle = color + '50';
        ctx.strokeStyle = color;
        ctx.lineWidth = 2;
        ctx.fill();
        ctx.stroke();
      }
    }
  }

  // Spirals - hypnotic spinning
  function drawSpirals(ctx, w, h, seed, palette) {
    const cx = w / 2, cy = h / 2;
    for (let s = 0; s < 3; s++) {
      const color = palette[s % palette.length];
      ctx.strokeStyle = color;
      ctx.lineWidth = 3;
      ctx.shadowColor = color;
      ctx.shadowBlur = 10;
      ctx.beginPath();
      for (let a = 0; a < Math.PI * 8; a += 0.05) {
        const r = a * 15 + s * 20;
        const x = cx + Math.cos(a + seed + s) * r;
        const y = cy + Math.sin(a + seed + s) * r;
        if (a === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.globalAlpha = 0.6;
      ctx.stroke();
    }
    ctx.globalAlpha = 1;
    ctx.shadowBlur = 0;
  }

  // Lightning - electric bolts
  function drawLightning(ctx, w, h, seed, palette) {
    for (let bolt = 0; bolt < 5; bolt++) {
      const color = palette[bolt % palette.length];
      ctx.strokeStyle = color;
      ctx.lineWidth = 3;
      ctx.shadowColor = color;
      ctx.shadowBlur = 20;
      ctx.beginPath();
      
      let x = seededRandom(seed + bolt * 100) * w;
      let y = 0;
      ctx.moveTo(x, y);
      
      while (y < h) {
        x += (seededRandom(seed + y + bolt) - 0.5) * 80;
        y += 20 + seededRandom(seed + y * 2) * 30;
        ctx.lineTo(x, y);
      }
      ctx.globalAlpha = 0.8;
      ctx.stroke();
    }
    ctx.globalAlpha = 1;
    ctx.shadowBlur = 0;
  }

  // Fractal - recursive patterns
  function drawFractal(ctx, w, h, seed, palette) {
    function branch(x, y, len, angle, depth) {
      if (depth <= 0 || len < 5) return;
      const color = palette[depth % palette.length];
      const endX = x + Math.cos(angle) * len;
      const endY = y + Math.sin(angle) * len;
      ctx.strokeStyle = color;
      ctx.lineWidth = depth;
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(endX, endY);
      ctx.stroke();
      branch(endX, endY, len * 0.7, angle - 0.5 + seededRandom(seed + depth) * 0.3, depth - 1);
      branch(endX, endY, len * 0.7, angle + 0.5 + seededRandom(seed + depth + 50) * 0.3, depth - 1);
    }
    ctx.globalAlpha = 0.7;
    branch(w / 2, h, 80, -Math.PI / 2, 8);
    ctx.globalAlpha = 1;
  }

  // Stripes - bold lines
  function drawStripes(ctx, w, h, seed, palette) {
    const angle = seededRandom(seed) * Math.PI;
    const stripeWidth = 20 + seededRandom(seed + 10) * 30;
    ctx.save();
    ctx.translate(w / 2, h / 2);
    ctx.rotate(angle);
    for (let i = -w; i < w * 2; i += stripeWidth * 2) {
      ctx.fillStyle = palette[Math.floor(seededRandom(seed + i) * palette.length)] + 'AA';
      ctx.fillRect(i, -h, stripeWidth, h * 3);
    }
    ctx.restore();
  }

  // Dots - polka dot pattern
  function drawDots(ctx, w, h, seed, palette) {
    const spacing = 40;
    for (let y = 0; y < h; y += spacing) {
      for (let x = 0; x < w; x += spacing) {
        const color = palette[Math.floor(seededRandom(seed + x * y) * palette.length)];
        const radius = 8 + seededRandom(seed + x + y) * 12;
        const glow = ctx.createRadialGradient(x, y, 0, x, y, radius);
        glow.addColorStop(0, color);
        glow.addColorStop(1, color + '00');
        ctx.fillStyle = glow;
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }

  // Diamonds - rotated squares
  function drawDiamonds(ctx, w, h, seed, palette) {
    const size = 50;
    for (let y = -size; y < h + size; y += size) {
      for (let x = -size; x < w + size; x += size) {
        const color = palette[Math.floor(seededRandom(seed + x - y) * palette.length)];
        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(Math.PI / 4);
        ctx.fillStyle = color + '60';
        ctx.strokeStyle = color;
        ctx.lineWidth = 2;
        ctx.fillRect(-size / 3, -size / 3, size / 1.5, size / 1.5);
        ctx.strokeRect(-size / 3, -size / 3, size / 1.5, size / 1.5);
        ctx.restore();
      }
    }
  }

  // Noise - static/grain
  function drawNoise(ctx, w, h, seed, palette) {
    const imageData = ctx.getImageData(0, 0, w, h);
    const data = imageData.data;
    for (let i = 0; i < data.length; i += 4) {
      const noise = seededRandom(seed + i / 4) * 100;
      data[i] = Math.min(255, data[i] + noise);
      data[i + 1] = Math.min(255, data[i + 1] + noise * 0.8);
      data[i + 2] = Math.min(255, data[i + 2] + noise);
    }
    ctx.putImageData(imageData, 0, 0);
    // Add color overlay spots
    for (let i = 0; i < 10; i++) {
      const color = palette[i % palette.length];
      const x = seededRandom(seed + i * 5) * w;
      const y = seededRandom(seed + i * 5 + 1) * h;
      const r = 30 + seededRandom(seed + i * 5 + 2) * 60;
      const glow = ctx.createRadialGradient(x, y, 0, x, y, r);
      glow.addColorStop(0, color + '80');
      glow.addColorStop(1, color + '00');
      ctx.fillStyle = glow;
      ctx.fillRect(0, 0, w, h);
    }
  }

  // Gradient blobs
  function drawGradientBlobs(ctx, w, h, seed, palette) {
    for (let i = 0; i < 6; i++) {
      const x = seededRandom(seed + i * 10) * w;
      const y = seededRandom(seed + i * 10 + 5) * h;
      const r = 80 + seededRandom(seed + i * 10 + 15) * 150;
      const color1 = palette[i % palette.length];
      const color2 = palette[(i + 1) % palette.length];
      const glow = ctx.createRadialGradient(x, y, 0, x, y, r);
      glow.addColorStop(0, color1 + 'CC');
      glow.addColorStop(0.5, color2 + '66');
      glow.addColorStop(1, color1 + '00');
      ctx.fillStyle = glow;
      ctx.fillRect(0, 0, w, h);
    }
  }

  // Rays - sunburst
  function drawRays(ctx, w, h, seed, palette) {
    const cx = w / 2, cy = h / 2;
    const rays = 20;
    for (let i = 0; i < rays; i++) {
      const angle = (i / rays) * Math.PI * 2;
      const color = palette[i % palette.length];
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(cx + Math.cos(angle - 0.1) * w, cy + Math.sin(angle - 0.1) * h);
      ctx.lineTo(cx + Math.cos(angle + 0.1) * w, cy + Math.sin(angle + 0.1) * h);
      ctx.closePath();
      ctx.fillStyle = color + '60';
      ctx.fill();
    }
  }

  // Bubbles - floating spheres
  function drawBubbles(ctx, w, h, seed, palette) {
    for (let i = 0; i < 25; i++) {
      const x = seededRandom(seed + i) * w;
      const y = seededRandom(seed + i + 100) * h;
      const r = 15 + seededRandom(seed + i + 200) * 50;
      const color = palette[i % palette.length];
      const grad = ctx.createRadialGradient(x - r * 0.3, y - r * 0.3, 0, x, y, r);
      grad.addColorStop(0, '#FFFFFF80');
      grad.addColorStop(0.3, color + '60');
      grad.addColorStop(1, color + '20');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = color + '80';
      ctx.lineWidth = 2;
      ctx.stroke();
    }
  }

  // Maze - labyrinth pattern
  function drawMaze(ctx, w, h, seed, palette) {
    const cellSize = 30;
    ctx.strokeStyle = palette[0];
    ctx.lineWidth = 3;
    ctx.shadowColor = palette[0];
    ctx.shadowBlur = 5;
    for (let y = 0; y < h; y += cellSize) {
      for (let x = 0; x < w; x += cellSize) {
        if (seededRandom(seed + x * y) > 0.5) {
          ctx.beginPath();
          ctx.moveTo(x, y);
          ctx.lineTo(x + cellSize, y + cellSize);
          ctx.stroke();
        } else {
          ctx.beginPath();
          ctx.moveTo(x + cellSize, y);
          ctx.lineTo(x, y + cellSize);
          ctx.stroke();
        }
      }
    }
    ctx.shadowBlur = 0;
  }

  // Crosshatch - sketchy lines
  function drawCrosshatch(ctx, w, h, seed, palette) {
    ctx.lineWidth = 1;
    ctx.globalAlpha = 0.5;
    for (let i = 0; i < w + h; i += 15) {
      ctx.strokeStyle = palette[Math.floor(seededRandom(seed + i) * palette.length)];
      ctx.beginPath();
      ctx.moveTo(i, 0);
      ctx.lineTo(0, i);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(w - i, 0);
      ctx.lineTo(w, i);
      ctx.stroke();
    }
    ctx.globalAlpha = 1;
  }

  // Convert canvas to image element
  function canvasToImage(canvas, className = '') {
    const img = document.createElement('img');
    img.src = canvas.toDataURL('image/png');
    img.className = className;
    img.alt = 'Placeholder visual';
    return img;
  }

  // Animated placeholder using requestAnimationFrame
  function createAnimatedPlaceholder(container, width, height) {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    canvas.className = 'w-full h-full object-cover';
    container.appendChild(canvas);
    
    const ctx = canvas.getContext('2d');
    let frame = 0;

    function animate() {
      // Clear
      const gradient = ctx.createLinearGradient(0, 0, width, height);
      gradient.addColorStop(0, COLORS.darkPurple);
      gradient.addColorStop(0.5, COLORS.purple);
      gradient.addColorStop(1, COLORS.darkPurple);
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, width, height);

      // Animated waves
      ctx.strokeStyle = COLORS.yellow;
      ctx.lineWidth = 2;
      ctx.globalAlpha = 0.5;
      
      for (let i = 0; i < 5; i++) {
        ctx.beginPath();
        const yOffset = height * 0.3 + (i * height * 0.12);
        for (let x = 0; x <= width; x += 3) {
          const y = yOffset + Math.sin((x * 0.02) + (frame * 0.03) + (i * 0.5)) * 25;
          if (x === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();
      }

      // Floating particles
      ctx.globalAlpha = 0.6;
      for (let i = 0; i < 20; i++) {
        const baseX = (i * 47) % width;
        const baseY = (i * 31) % height;
        const x = baseX + Math.sin(frame * 0.02 + i) * 20;
        const y = baseY + Math.cos(frame * 0.015 + i * 0.5) * 15;
        const radius = 3 + Math.sin(frame * 0.05 + i) * 2;
        
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.fillStyle = i % 3 === 0 ? COLORS.yellow : (i % 3 === 1 ? COLORS.cyan : COLORS.pink);
        ctx.fill();
      }

      ctx.globalAlpha = 1;
      frame++;
      requestAnimationFrame(animate);
    }

    animate();
    return canvas;
  }

  // Theme-specific color palettes
  const THEME_PALETTES = {
    music: ['#FF1493', '#8B5CF6', '#00D4FF', '#FF6B35', '#FFD700'],
    video: ['#00D4FF', '#FF00FF', '#39FF14', '#FF6B35', '#8B5CF6'],
    art: ['#FF6AD5', '#FFD700', '#FF7F50', '#32CD32', '#00FFFF'],
    data: ['#00FF41', '#00D4FF', '#8B5CF6', '#FFD700', '#FF1493'],
    default: ['#FF1493', '#00D4FF', '#FFD700', '#39FF14', '#FF00FF']
  };

  // Get current page theme
  function getPageTheme() {
    const section = document.querySelector('[data-gallery-theme]');
    return section ? section.dataset.galleryTheme : 'default';
  }

  // Initialize placeholders where needed
  function initPlaceholders() {
    // Check if we need placeholders (no real images in hero slideshow)
    const heroSlideshow = document.querySelector('.hero-slideshow');
    const realImages = heroSlideshow ? heroSlideshow.querySelectorAll('img[src^="/images"]') : [];
    const hasRealImages = realImages.length > 0;

    // Get page theme for styled placeholders
    const theme = getPageTheme();
    
    if (!hasRealImages) {
      // Generate placeholder images for all sections
      generateBackgroundPlaceholders(theme);
      generateSlideshowPlaceholders(theme);
      generateCarouselPlaceholders(theme);
      
      // Check if this is home page or subpage
      const isHomePage = window.location.pathname === '/' || window.location.pathname === '/index.html';
      if (isHomePage) {
        generateWhatsNewPlaceholders();
      } else {
        generateSubpageLinks(theme);
      }
    }
  }

  // Generate subpage explore links with generative backgrounds
  function generateSubpageLinks(theme) {
    const track = document.querySelector('.subpage-links-track');
    if (!track || track.querySelectorAll('.placeholder-generated').length > 0) return;

    // Determine links based on current path
    const path = window.location.pathname;
    let links = [];
    
    if (path.includes('/music/')) {
      links = [
        { title: 'Electro', href: '/music/electro/' },
        { title: 'Ambient', href: '/music/ambient/' },
        { title: 'Melodic', href: '/music/melodic/' },
        { title: 'Breaks', href: '/music/breaks/' }
      ];
    } else if (path.includes('/video/')) {
      links = [
        { title: 'Realtime', href: '/video/realtime/' },
        { title: 'Mapping', href: '/video/mapping/' },
        { title: 'Mixing', href: '/video/mixing/' },
        { title: 'Editing', href: '/video/editing/' }
      ];
    } else if (path.includes('/art/')) {
      links = [
        { title: 'Painting', href: '/art/painting/' },
        { title: 'Drawing', href: '/art/drawing/' },
        { title: 'Modelling', href: '/art/modelling/' },
        { title: 'Printing', href: '/art/printing/' }
      ];
    } else if (path.includes('/data/')) {
      links = [
        { title: 'GenAI', href: '/data/genai/' },
        { title: 'WebDev', href: '/data/webdev/' },
        { title: 'Cloud', href: '/data/cloud/' },
        { title: 'Coding', href: '/data/coding/' }
      ];
    }

    // Create link cards with generative backgrounds
    const createCard = (item, i, offset = 0) => {
      const card = document.createElement('a');
      card.href = item.href;
      card.className = 'subpage-link placeholder-generated flex-shrink-0 relative overflow-hidden rounded-xl border-2 border-wavgen-yellow shadow-lg cursor-pointer transition-transform duration-300 hover:scale-105 no-underline';
      card.style.cssText = 'height: calc(100% - 8px); aspect-ratio: 1.2;';
      
      const canvas = createPlaceholderCanvas(150, 120, i * 53 + 2000 + offset);
      canvas.className = 'absolute inset-0 w-full h-full';
      canvas.style.objectFit = 'cover';
      
      const overlay = document.createElement('div');
      overlay.className = 'absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent flex flex-col justify-end p-2';
      overlay.innerHTML = `<span class="text-sm text-white font-bold">${item.title}</span>`;
      
      card.appendChild(canvas);
      card.appendChild(overlay);
      return card;
    };

    // Add cards twice for seamless loop
    links.forEach((item, i) => track.appendChild(createCard(item, i, 0)));
    links.forEach((item, i) => track.appendChild(createCard(item, i, 1000)));

    // Start marquee animation
    startSubpageLinksMarquee(track);
  }

  // Animate subpage links marquee
  function startSubpageLinksMarquee(track) {
    if (!track || !window.gsap) return;
    
    const cards = track.querySelectorAll('.subpage-link');
    if (cards.length === 0) return;

    const cardWidth = cards[0].offsetWidth + 8;
    const totalWidth = cardWidth * (cards.length / 2);

    gsap.to(track, {
      x: -totalWidth,
      duration: 20,
      ease: 'none',
      repeat: -1,
      modifiers: {
        x: gsap.utils.unitize(x => parseFloat(x) % totalWidth)
      }
    });
  }

  // Generate background slideshow placeholders (reduced for speed)
  function generateBackgroundPlaceholders() {
    // Hero section background - 5 varied background images
    const heroBg = document.querySelector('.hero-section-bg-slideshow');
    if (heroBg && heroBg.querySelectorAll('.placeholder-generated').length === 0) {
      for (let i = 0; i < 5; i++) {
        const canvas = createPlaceholderCanvas(960, 540, i * 200 + 999); // Reduced resolution
        const img = canvasToImage(canvas, 'hero-section-bg-slide placeholder-generated absolute inset-0 w-full h-full object-cover transition-opacity duration-1000');
        img.style.opacity = i === 0 ? '0.4' : '0';
        heroBg.appendChild(img);
      }
      startPlaceholderSlideshow(heroBg, '0.4', 4000);
    }

    // Hello card background - 4 subtle backgrounds
    const helloBg = document.querySelector('.hero-bg-slideshow');
    if (helloBg && helloBg.querySelectorAll('.placeholder-generated').length === 0) {
      for (let i = 0; i < 4; i++) {
        const canvas = createPlaceholderCanvas(400, 300, i * 150 + 300); // Reduced resolution
        const img = canvasToImage(canvas, 'hero-bg-slide placeholder-generated absolute inset-0 w-full h-full object-cover transition-opacity duration-1000');
        img.style.opacity = i === 0 ? '0.2' : '0';
        helloBg.appendChild(img);
      }
      let current = 0;
      const slides = helloBg.querySelectorAll('.placeholder-generated');
      setInterval(() => {
        slides[current].style.opacity = '0';
        current = (current + 1) % slides.length;
        slides[current].style.opacity = '0.2';
      }, 5000);
    }
  }

  // Store all generated images for modal navigation
  let allGeneratedImages = [];

  // Open modal with image
  function openModal(imageSrc, index) {
    const modal = document.getElementById('myModal');
    const modalImg = document.getElementById('img01');
    if (modal && modalImg) {
      modal.classList.remove('hidden');
      modalImg.src = imageSrc;
      modalImg.dataset.currentIndex = index;
      document.body.style.overflow = 'hidden';
      
      // Setup navigation for generated images
      setupModalNavigation();
    }
  }

  // Setup modal navigation for prev/next buttons
  function setupModalNavigation() {
    const modal = document.getElementById('myModal');
    const modalImg = document.getElementById('img01');
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');
    const closeBtn = modal?.querySelector('.close');
    
    if (!modal || !modalImg) return;

    // Navigate to previous image
    const goPrev = () => {
      let idx = parseInt(modalImg.dataset.currentIndex) || 0;
      idx = (idx - 1 + allGeneratedImages.length) % allGeneratedImages.length;
      modalImg.src = allGeneratedImages[idx];
      modalImg.dataset.currentIndex = idx;
    };

    // Navigate to next image
    const goNext = () => {
      let idx = parseInt(modalImg.dataset.currentIndex) || 0;
      idx = (idx + 1) % allGeneratedImages.length;
      modalImg.src = allGeneratedImages[idx];
      modalImg.dataset.currentIndex = idx;
    };

    // Close modal
    const closeModal = () => {
      modal.classList.add('hidden');
      document.body.style.overflow = '';
    };

    // Remove old listeners and add new ones
    if (prevBtn) {
      prevBtn.onclick = goPrev;
    }
    if (nextBtn) {
      nextBtn.onclick = goNext;
    }
    if (closeBtn) {
      closeBtn.onclick = closeModal;
    }
    
    // Keyboard navigation
    const handleKeydown = (e) => {
      if (!modal.classList.contains('hidden')) {
        if (e.key === 'ArrowLeft') goPrev();
        if (e.key === 'ArrowRight') goNext();
        if (e.key === 'Escape') closeModal();
      }
    };
    document.removeEventListener('keydown', handleKeydown);
    document.addEventListener('keydown', handleKeydown);

    // Click backdrop to close
    modal.onclick = (e) => {
      if (e.target === modal) closeModal();
    };
  }

  // Add click handler to make element open modal
  function makeClickableForModal(element, imageSrc, index) {
    element.style.cursor = 'pointer';
    element.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      openModal(imageSrc, index);
    });
  }

  // Generate slideshow placeholders - 8 vibrant cycling images (reduced for speed)
  function generateSlideshowPlaceholders() {
    const slideshow = document.querySelector('.hero-slideshow');
    if (!slideshow || slideshow.querySelectorAll('.placeholder-generated').length > 0) return;

    const placeholder = slideshow.querySelector('p');
    if (placeholder) placeholder.remove();

    // Generate 8 unique images with random styles
    for (let i = 0; i < 8; i++) {
      const canvas = createPlaceholderCanvas(600, 400, i * 137 + 777); // Reduced resolution
      const img = canvasToImage(canvas, 'hero-slide gallery-img placeholder-generated absolute inset-0 w-full h-full object-contain transition-opacity duration-1000');
      img.style.opacity = i === 0 ? '1' : '0';
      img.dataset.index = i;
      
      // Store for modal and add click handler
      const imgSrc = canvas.toDataURL('image/png');
      allGeneratedImages.push(imgSrc);
      makeClickableForModal(img, imgSrc, allGeneratedImages.length - 1);
      
      slideshow.appendChild(img);
    }

    // Start slideshow animation
    startPlaceholderSlideshow(slideshow);
  }

  // Animate the placeholder slideshow
  function startPlaceholderSlideshow(container, maxOpacity = '1', interval = 2500) {
    const slides = container.querySelectorAll('.placeholder-generated');
    if (slides.length < 2) return;

    const isBackground = container.classList.contains('hero-section-bg-slideshow');
    const targetOpacity = isBackground ? '0.4' : maxOpacity;

    let current = 0;
    setInterval(() => {
      slides[current].style.opacity = '0';
      current = (current + 1) % slides.length;
      slides[current].style.opacity = targetOpacity;
    }, interval);
  }

  // Generate carousel placeholders - 10 cards matching What's New size (reduced for speed)
  function generateCarouselPlaceholders() {
    const carousel = document.querySelector('.marquee-carousel .marquee-track');
    if (!carousel || carousel.querySelectorAll('.placeholder-generated').length > 0) return;

    const placeholder = carousel.closest('.marquee-carousel')?.querySelector('p');
    if (placeholder) placeholder.remove();

    // Generate cards twice for seamless loop
    const createCard = (i, offset = 0) => {
      const card = document.createElement('div');
      card.className = 'gallery-img placeholder-generated flex-shrink-0 relative overflow-hidden rounded-xl border-2 border-wavgen-yellow shadow-lg cursor-pointer transition-transform duration-300 hover:scale-105 mx-2';
      card.style.cssText = 'height: calc(100% - 8px); aspect-ratio: 1.2;';
      
      const canvas = createPlaceholderCanvas(150, 120, i * 73 + 500 + offset);
      canvas.className = 'absolute inset-0 w-full h-full';
      canvas.style.objectFit = 'cover';
      
      // Store for modal and add click handler
      const imgSrc = canvas.toDataURL('image/png');
      if (offset === 0) {
        allGeneratedImages.push(imgSrc);
      }
      makeClickableForModal(card, imgSrc, allGeneratedImages.length - 1);
      
      card.appendChild(canvas);
      return card;
    };

    // Add cards twice for seamless loop
    for (let i = 0; i < 8; i++) carousel.appendChild(createCard(i, 0));
    for (let i = 0; i < 8; i++) carousel.appendChild(createCard(i, 1000));

    // Start carousel marquee animation
    startCarouselMarquee(carousel);
  }

  // Animate carousel marquee
  function startCarouselMarquee(track) {
    if (!track || !window.gsap) return;
    
    const cards = track.querySelectorAll('.gallery-img');
    if (cards.length === 0) return;

    // Calculate total width of first set of cards
    const cardWidth = cards[0].offsetWidth + 16; // including margin
    const totalWidth = cardWidth * (cards.length / 2);

    // GSAP infinite scroll (opposite direction from What's New)
    gsap.to(track, {
      x: -totalWidth,
      duration: 25,
      ease: 'none',
      repeat: -1,
      modifiers: {
        x: gsap.utils.unitize(x => parseFloat(x) % totalWidth)
      }
    });
  }

  // Generate What's New card placeholders - links to actual pages
  function generateWhatsNewPlaceholders() {
    const track = document.querySelector('.whats-new-track');
    if (!track || track.querySelectorAll('.placeholder-generated').length > 0) return;

    // Items with actual page links
    const items = [
      { category: 'Music', title: 'Electro', href: '/music/electro/' },
      { category: 'Video', title: 'Realtime', href: '/video/realtime/' },
      { category: 'Art', title: 'Painting', href: '/art/painting/' },
      { category: 'Data', title: 'GenAI', href: '/data/genai/' },
      { category: 'Music', title: 'Ambient', href: '/music/ambient/' },
      { category: 'Video', title: 'Mapping', href: '/video/mapping/' },
      { category: 'Art', title: 'Drawing', href: '/art/drawing/' },
      { category: 'Data', title: 'Cloud', href: '/data/cloud/' }
    ];

    // Create cards twice for seamless looping
    const createCard = (item, i, offset = 0) => {
      const card = document.createElement('a');
      card.href = item.href;
      card.className = 'whats-new-card placeholder-generated flex-shrink-0 relative overflow-hidden rounded-xl border-2 border-wavgen-yellow shadow-lg cursor-pointer transition-transform duration-300 hover:scale-105 no-underline';
      card.style.cssText = 'height: calc(100% - 8px); aspect-ratio: 1.2;';
      
      // Create canvas background with random style (smaller resolution)
      const canvas = createPlaceholderCanvas(150, 120, i * 53 + 1000 + offset);
      canvas.className = 'absolute inset-0 w-full h-full';
      canvas.style.objectFit = 'cover';
      
      // Overlay with text
      const overlay = document.createElement('div');
      overlay.className = 'absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent flex flex-col justify-end p-2';
      overlay.innerHTML = `
        <span class="text-[10px] text-wavgen-yellow font-medium uppercase tracking-wide">${item.category}</span>
        <span class="text-xs text-white font-bold">${item.title}</span>
      `;
      
      card.appendChild(canvas);
      card.appendChild(overlay);
      return card;
    };

    // Add cards twice for seamless loop
    items.forEach((item, i) => track.appendChild(createCard(item, i, 0)));
    items.forEach((item, i) => track.appendChild(createCard(item, i, 1000)));

    // Start marquee animation
    startWhatsNewMarquee(track);
  }

  // Animate What's New marquee
  function startWhatsNewMarquee(track) {
    if (!track || !window.gsap) return;
    
    const cards = track.querySelectorAll('.whats-new-card');
    if (cards.length === 0) return;

    // Calculate total width of first set of cards
    const cardWidth = cards[0].offsetWidth + 16; // including margin
    const totalWidth = cardWidth * (cards.length / 2);

    // GSAP infinite scroll
    gsap.to(track, {
      x: -totalWidth,
      duration: 30,
      ease: 'none',
      repeat: -1,
      modifiers: {
        x: gsap.utils.unitize(x => parseFloat(x) % totalWidth)
      }
    });
  }

  // Auto-init when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initPlaceholders);
  } else {
    initPlaceholders();
  }

  // Also init after a short delay to ensure all elements are rendered
  setTimeout(initPlaceholders, 500);

  // Export for external use
  window.PlaceholderVisuals = {
    createPlaceholderCanvas,
    createAnimatedPlaceholder,
    initPlaceholders
  };
})();
