/**
 * Placeholder Visuals Generator
 * Creates procedurally generated placeholder images using Canvas
 * Vibrant, dynamic imagery with modal support
 */

(function() {
  'use strict';

  // Extended color palettes - 30+ palettes for maximum variety
  const PALETTES = {
    // Vibrant neons
    neon: ['#FF1493', '#00D4FF', '#FFD700', '#39FF14', '#FF00FF'],
    neonPink: ['#FF1493', '#FF69B4', '#FF6AD5', '#FF85C0', '#FFB6C1'],
    neonBlue: ['#00D4FF', '#00BFFF', '#1E90FF', '#4169E1', '#6495ED'],
    neonGreen: ['#39FF14', '#00FF41', '#32CD32', '#00FA9A', '#7FFF00'],
    
    // Natural tones
    sunset: ['#FF6B35', '#FF8C42', '#FFD166', '#F4845F', '#F25C54'],
    sunrise: ['#FF6B6B', '#FFA07A', '#FFDAB9', '#FFE4B5', '#FFCBA4'],
    ocean: ['#00B4D8', '#0077B6', '#023E8A', '#48CAE4', '#90E0EF'],
    deepSea: ['#003049', '#004E64', '#006E8A', '#0088B0', '#00A3D6'],
    forest: ['#2D6A4F', '#40916C', '#52B788', '#74C69D', '#95D5B2'],
    jungle: ['#006400', '#228B22', '#32CD32', '#90EE90', '#98FB98'],
    fire: ['#D00000', '#DC2F02', '#E85D04', '#F48C06', '#FAA307'],
    volcano: ['#8B0000', '#B22222', '#CD5C5C', '#FF4500', '#FF6347'],
    
    // Cosmic & fantasy
    galaxy: ['#7400B8', '#6930C3', '#5E60CE', '#5390D9', '#4EA8DE'],
    nebula: ['#9D4EDD', '#C77DFF', '#E0AAFF', '#F0E6FF', '#FFD6FF'],
    aurora: ['#5FFBF1', '#36D1DC', '#5B86E5', '#8B5CF6', '#D946EF'],
    cosmos: ['#0D0D2B', '#1A1A4B', '#2D2D6B', '#3F3F8B', '#5252AB'],
    candy: ['#F72585', '#B5179E', '#7209B7', '#560BAD', '#480CA8'],
    unicorn: ['#FF9FF3', '#FEC8D8', '#F1C0E8', '#CFBAF0', '#A3C4F3'],
    
    // Monochrome & stylized
    mono: ['#FFFFFF', '#E0E0E0', '#BDBDBD', '#9E9E9E', '#757575'],
    monoWarm: ['#F5F5DC', '#EEE8AA', '#D4AF37', '#B8860B', '#8B4513'],
    monoCool: ['#E0FFFF', '#B0E0E6', '#87CEEB', '#6495ED', '#4682B4'],
    noir: ['#1A1A2E', '#16213E', '#0F3460', '#E94560', '#FFFFFF'],
    darkMode: ['#121212', '#1E1E1E', '#2D2D2D', '#3D3D3D', '#BB86FC'],
    
    // Tech & cyber
    cyber: ['#00FF41', '#008F11', '#00FF41', '#003B00', '#39FF14'],
    matrix: ['#003B00', '#006600', '#00FF00', '#66FF66', '#00FF41'],
    synthwave: ['#FF00FF', '#FF1493', '#00FFFF', '#FF6EC7', '#7B68EE'],
    vaporwave: ['#FF6AD5', '#C774E8', '#AD8CFF', '#8795E8', '#94D0FF'],
    retrowave: ['#FF2281', '#FF6600', '#FAFF00', '#14FFEC', '#0D7377'],
    
    // Warm & cool gradients
    thermal: ['#000033', '#000066', '#660066', '#CC0066', '#FF3300'],
    arctic: ['#A5F3FC', '#67E8F9', '#22D3EE', '#06B6D4', '#0891B2'],
    autumn: ['#8B4513', '#D2691E', '#CD853F', '#DEB887', '#F4A460'],
    spring: ['#98FB98', '#90EE90', '#00FA9A', '#00FF7F', '#7CFC00'],
    
    // Artistic
    pastel: ['#FFB3BA', '#FFDFBA', '#FFFFBA', '#BAFFC9', '#BAE1FF'],
    earth: ['#5D4037', '#6D4C41', '#795548', '#8D6E63', '#A1887F'],
    jewel: ['#006A4E', '#2E8B57', '#9932CC', '#8B008B', '#FF1493'],
    metallic: ['#C0C0C0', '#A9A9A9', '#808080', '#696969', '#FFD700'],
    holographic: ['#FF69B4', '#DA70D6', '#BA55D3', '#9370DB', '#8A2BE2']
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

  // All available visual styles - expanded to 35+ unique patterns
  const STYLES = [
    // Original styles
    'waves', 'particles', 'grid', 'circles', 'plasma', 'aurora',
    'triangles', 'hexagons', 'spirals', 'lightning', 'fractal',
    'stripes', 'dots', 'diamonds', 'noise', 'gradient', 'rays',
    'bubbles', 'maze', 'crosshatch',
    // New advanced styles
    'waveform', 'constellation', 'terrain', 'ripples', 'voronoi',
    'flowField', 'glitch', 'scanlines', 'crystalline', 'organic',
    'circuitBoard', 'kaleidoscope', 'interference', 'metaballs', 'ribbons'
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
      maze: drawMaze, crosshatch: drawCrosshatch,
      // New advanced styles
      waveform: drawWaveform, constellation: drawConstellation, terrain: drawTerrain,
      ripples: drawRipples, voronoi: drawVoronoi, flowField: drawFlowField,
      glitch: drawGlitch, scanlines: drawScanlines, crystalline: drawCrystalline,
      organic: drawOrganic, circuitBoard: drawCircuitBoard, kaleidoscope: drawKaleidoscope,
      interference: drawInterference, metaballs: drawMetaballs, ribbons: drawRibbons
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

  // ============================================
  // NEW ADVANCED DRAWING STYLES
  // ============================================

  // Waveform - audio visualizer style
  function drawWaveform(ctx, w, h, seed, palette) {
    const bars = 64;
    const barWidth = w / bars;
    ctx.globalAlpha = 0.8;
    
    for (let i = 0; i < bars; i++) {
      const height1 = (seededRandom(seed + i) * 0.6 + 0.2) * h;
      const height2 = (seededRandom(seed + i + 100) * 0.4 + 0.1) * h;
      const color = palette[i % palette.length];
      
      // Main bar
      const grad = ctx.createLinearGradient(0, h/2 - height1/2, 0, h/2 + height1/2);
      grad.addColorStop(0, color + '00');
      grad.addColorStop(0.5, color);
      grad.addColorStop(1, color + '00');
      ctx.fillStyle = grad;
      ctx.fillRect(i * barWidth, h/2 - height1/2, barWidth - 2, height1);
      
      // Reflection
      ctx.fillStyle = color + '40';
      ctx.fillRect(i * barWidth, h/2 + height1/2, barWidth - 2, height2);
    }
    ctx.globalAlpha = 1;
  }

  // Constellation - star field with connections
  function drawConstellation(ctx, w, h, seed, palette) {
    const stars = [];
    const count = 50;
    
    // Generate stars
    for (let i = 0; i < count; i++) {
      stars.push({
        x: seededRandom(seed + i) * w,
        y: seededRandom(seed + i + 100) * h,
        r: 1 + seededRandom(seed + i + 200) * 4,
        color: palette[i % palette.length]
      });
    }
    
    // Draw connections
    ctx.globalAlpha = 0.3;
    ctx.lineWidth = 1;
    for (let i = 0; i < stars.length; i++) {
      for (let j = i + 1; j < stars.length; j++) {
        const dist = Math.hypot(stars[i].x - stars[j].x, stars[i].y - stars[j].y);
        if (dist < 100) {
          ctx.strokeStyle = stars[i].color;
          ctx.beginPath();
          ctx.moveTo(stars[i].x, stars[i].y);
          ctx.lineTo(stars[j].x, stars[j].y);
          ctx.stroke();
        }
      }
    }
    
    // Draw stars with glow
    ctx.globalAlpha = 1;
    stars.forEach(star => {
      const glow = ctx.createRadialGradient(star.x, star.y, 0, star.x, star.y, star.r * 3);
      glow.addColorStop(0, star.color);
      glow.addColorStop(0.5, star.color + '60');
      glow.addColorStop(1, star.color + '00');
      ctx.fillStyle = glow;
      ctx.beginPath();
      ctx.arc(star.x, star.y, star.r * 3, 0, Math.PI * 2);
      ctx.fill();
    });
  }

  // Terrain - topographic/elevation map style
  function drawTerrain(ctx, w, h, seed, palette) {
    const levels = 12;
    for (let level = 0; level < levels; level++) {
      ctx.beginPath();
      const baseY = h * 0.1 + (level * h * 0.07);
      const color = palette[level % palette.length];
      
      ctx.moveTo(0, h);
      ctx.lineTo(0, baseY);
      
      for (let x = 0; x <= w; x += 8) {
        const noise = Math.sin(x * 0.02 + seed + level * 0.5) * 20 +
                      Math.sin(x * 0.05 + seed * 2) * 10 +
                      Math.sin(x * 0.01 + level) * 30;
        ctx.lineTo(x, baseY + noise);
      }
      
      ctx.lineTo(w, h);
      ctx.closePath();
      ctx.fillStyle = color + '40';
      ctx.strokeStyle = color;
      ctx.lineWidth = 2;
      ctx.fill();
      ctx.stroke();
    }
  }

  // Ripples - concentric water ripple effect
  function drawRipples(ctx, w, h, seed, palette) {
    const centers = 3;
    for (let c = 0; c < centers; c++) {
      const cx = seededRandom(seed + c * 10) * w;
      const cy = seededRandom(seed + c * 10 + 5) * h;
      const color = palette[c % palette.length];
      
      for (let r = 0; r < 15; r++) {
        const radius = 20 + r * 30;
        ctx.beginPath();
        ctx.arc(cx, cy, radius, 0, Math.PI * 2);
        ctx.strokeStyle = color;
        ctx.lineWidth = 3 - r * 0.15;
        ctx.globalAlpha = 0.6 - r * 0.04;
        ctx.stroke();
      }
    }
    ctx.globalAlpha = 1;
  }

  // Voronoi - cell-like pattern
  function drawVoronoi(ctx, w, h, seed, palette) {
    const points = [];
    const count = 25;
    
    for (let i = 0; i < count; i++) {
      points.push({
        x: seededRandom(seed + i) * w,
        y: seededRandom(seed + i + 50) * h,
        color: palette[i % palette.length]
      });
    }
    
    // Simple voronoi approximation
    for (let y = 0; y < h; y += 4) {
      for (let x = 0; x < w; x += 4) {
        let minDist = Infinity;
        let closest = points[0];
        
        for (const p of points) {
          const dist = Math.hypot(x - p.x, y - p.y);
          if (dist < minDist) {
            minDist = dist;
            closest = p;
          }
        }
        
        ctx.fillStyle = closest.color + '60';
        ctx.fillRect(x, y, 4, 4);
      }
    }
    
    // Draw cell borders and centers
    points.forEach(p => {
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, 4, 0, Math.PI * 2);
      ctx.fill();
    });
  }

  // Flow field - directional particle trails
  function drawFlowField(ctx, w, h, seed, palette) {
    ctx.lineWidth = 2;
    ctx.globalAlpha = 0.6;
    
    for (let i = 0; i < 200; i++) {
      let x = seededRandom(seed + i) * w;
      let y = seededRandom(seed + i + 500) * h;
      const color = palette[i % palette.length];
      
      ctx.strokeStyle = color;
      ctx.beginPath();
      ctx.moveTo(x, y);
      
      for (let step = 0; step < 20; step++) {
        const angle = Math.sin(x * 0.01 + seed) * Math.cos(y * 0.01 + seed) * Math.PI * 2;
        x += Math.cos(angle) * 5;
        y += Math.sin(angle) * 5;
        ctx.lineTo(x, y);
      }
      ctx.stroke();
    }
    ctx.globalAlpha = 1;
  }

  // Glitch - digital distortion effect
  function drawGlitch(ctx, w, h, seed, palette) {
    // Horizontal glitch bars
    for (let i = 0; i < 20; i++) {
      const y = seededRandom(seed + i) * h;
      const barHeight = 2 + seededRandom(seed + i + 50) * 15;
      const offset = (seededRandom(seed + i + 100) - 0.5) * 50;
      const color = palette[i % palette.length];
      
      ctx.fillStyle = color + 'AA';
      ctx.fillRect(offset, y, w, barHeight);
    }
    
    // RGB shift blocks
    for (let i = 0; i < 10; i++) {
      const x = seededRandom(seed + i * 3) * w;
      const y = seededRandom(seed + i * 3 + 1) * h;
      const bw = 20 + seededRandom(seed + i * 3 + 2) * 100;
      const bh = 5 + seededRandom(seed + i * 3 + 3) * 30;
      
      ctx.globalAlpha = 0.7;
      ctx.fillStyle = '#FF000080';
      ctx.fillRect(x - 3, y, bw, bh);
      ctx.fillStyle = '#00FF0080';
      ctx.fillRect(x, y, bw, bh);
      ctx.fillStyle = '#0000FF80';
      ctx.fillRect(x + 3, y, bw, bh);
    }
    ctx.globalAlpha = 1;
  }

  // Scanlines - retro monitor effect
  function drawScanlines(ctx, w, h, seed, palette) {
    // Horizontal gradient bands
    for (let i = 0; i < 5; i++) {
      const y = seededRandom(seed + i) * h;
      const bandHeight = 50 + seededRandom(seed + i + 10) * 100;
      const color = palette[i % palette.length];
      
      const grad = ctx.createLinearGradient(0, y, 0, y + bandHeight);
      grad.addColorStop(0, color + '00');
      grad.addColorStop(0.5, color + '40');
      grad.addColorStop(1, color + '00');
      ctx.fillStyle = grad;
      ctx.fillRect(0, y, w, bandHeight);
    }
    
    // Scanlines
    ctx.globalAlpha = 0.3;
    ctx.fillStyle = '#000000';
    for (let y = 0; y < h; y += 4) {
      ctx.fillRect(0, y, w, 2);
    }
    ctx.globalAlpha = 1;
  }

  // Crystalline - geometric crystal formations
  function drawCrystalline(ctx, w, h, seed, palette) {
    for (let i = 0; i < 15; i++) {
      const cx = seededRandom(seed + i) * w;
      const cy = seededRandom(seed + i + 50) * h;
      const size = 30 + seededRandom(seed + i + 100) * 80;
      const sides = 4 + Math.floor(seededRandom(seed + i + 150) * 4);
      const color = palette[i % palette.length];
      
      ctx.beginPath();
      for (let j = 0; j <= sides; j++) {
        const angle = (j / sides) * Math.PI * 2 - Math.PI / 2;
        const r = size * (0.5 + seededRandom(seed + i + j) * 0.5);
        const x = cx + Math.cos(angle) * r;
        const y = cy + Math.sin(angle) * r;
        if (j === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.closePath();
      
      const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, size);
      grad.addColorStop(0, color + 'CC');
      grad.addColorStop(0.5, color + '66');
      grad.addColorStop(1, color + '22');
      ctx.fillStyle = grad;
      ctx.fill();
      ctx.strokeStyle = color;
      ctx.lineWidth = 2;
      ctx.stroke();
    }
  }

  // Organic - blob/amoeba shapes
  function drawOrganic(ctx, w, h, seed, palette) {
    for (let i = 0; i < 8; i++) {
      const cx = seededRandom(seed + i * 10) * w;
      const cy = seededRandom(seed + i * 10 + 5) * h;
      const baseRadius = 40 + seededRandom(seed + i * 10 + 15) * 80;
      const color = palette[i % palette.length];
      
      ctx.beginPath();
      for (let angle = 0; angle <= Math.PI * 2; angle += 0.1) {
        const noise = Math.sin(angle * 3 + seed + i) * 20 + Math.sin(angle * 5 + seed * 2) * 10;
        const r = baseRadius + noise;
        const x = cx + Math.cos(angle) * r;
        const y = cy + Math.sin(angle) * r;
        if (angle === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.closePath();
      
      const grad = ctx.createRadialGradient(cx - baseRadius * 0.3, cy - baseRadius * 0.3, 0, cx, cy, baseRadius * 1.5);
      grad.addColorStop(0, color + 'CC');
      grad.addColorStop(0.5, color + '88');
      grad.addColorStop(1, color + '22');
      ctx.fillStyle = grad;
      ctx.fill();
    }
  }

  // Circuit board - tech/PCB pattern
  function drawCircuitBoard(ctx, w, h, seed, palette) {
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    
    // Main traces
    for (let i = 0; i < 30; i++) {
      let x = seededRandom(seed + i) * w;
      let y = seededRandom(seed + i + 100) * h;
      const color = palette[i % palette.length];
      
      ctx.strokeStyle = color;
      ctx.shadowColor = color;
      ctx.shadowBlur = 5;
      ctx.beginPath();
      ctx.moveTo(x, y);
      
      for (let seg = 0; seg < 5; seg++) {
        const dir = Math.floor(seededRandom(seed + i + seg * 10) * 4);
        const len = 20 + seededRandom(seed + i + seg * 10 + 5) * 60;
        if (dir === 0) x += len;
        else if (dir === 1) x -= len;
        else if (dir === 2) y += len;
        else y -= len;
        ctx.lineTo(x, y);
      }
      ctx.stroke();
      
      // Node at end
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.arc(x, y, 4, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.shadowBlur = 0;
  }

  // Kaleidoscope - symmetrical pattern
  function drawKaleidoscope(ctx, w, h, seed, palette) {
    const segments = 8;
    const cx = w / 2;
    const cy = h / 2;
    
    ctx.save();
    ctx.translate(cx, cy);
    
    for (let seg = 0; seg < segments; seg++) {
      ctx.save();
      ctx.rotate((seg / segments) * Math.PI * 2);
      
      // Draw pattern in each segment
      for (let i = 0; i < 10; i++) {
        const x = seededRandom(seed + i) * w / 3;
        const y = seededRandom(seed + i + 50) * h / 3;
        const r = 10 + seededRandom(seed + i + 100) * 30;
        const color = palette[i % palette.length];
        
        ctx.fillStyle = color + '80';
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.fill();
      }
      
      ctx.restore();
    }
    ctx.restore();
  }

  // Interference - wave interference pattern
  function drawInterference(ctx, w, h, seed, palette) {
    const imageData = ctx.getImageData(0, 0, w, h);
    const data = imageData.data;
    
    const cx1 = w * 0.3, cy1 = h * 0.3;
    const cx2 = w * 0.7, cy2 = h * 0.7;
    
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        const d1 = Math.hypot(x - cx1, y - cy1);
        const d2 = Math.hypot(x - cx2, y - cy2);
        const wave = Math.sin(d1 * 0.1 + seed) + Math.sin(d2 * 0.1 + seed * 2);
        const intensity = (wave + 2) / 4;
        
        const colorIdx = Math.floor(intensity * palette.length) % palette.length;
        const color = palette[colorIdx];
        const rgb = hexToRgb(color);
        
        const idx = (y * w + x) * 4;
        data[idx] = Math.min(255, data[idx] + rgb.r * intensity);
        data[idx + 1] = Math.min(255, data[idx + 1] + rgb.g * intensity);
        data[idx + 2] = Math.min(255, data[idx + 2] + rgb.b * intensity);
      }
    }
    ctx.putImageData(imageData, 0, 0);
  }

  // Metaballs - blobby merging shapes
  function drawMetaballs(ctx, w, h, seed, palette) {
    const balls = [];
    for (let i = 0; i < 6; i++) {
      balls.push({
        x: seededRandom(seed + i) * w,
        y: seededRandom(seed + i + 50) * h,
        r: 40 + seededRandom(seed + i + 100) * 60,
        color: palette[i % palette.length]
      });
    }
    
    // Draw each ball with radial gradient
    balls.forEach(ball => {
      const grad = ctx.createRadialGradient(ball.x, ball.y, 0, ball.x, ball.y, ball.r * 2);
      grad.addColorStop(0, ball.color + 'FF');
      grad.addColorStop(0.3, ball.color + 'AA');
      grad.addColorStop(0.6, ball.color + '44');
      grad.addColorStop(1, ball.color + '00');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, w, h);
    });
  }

  // Ribbons - flowing ribbon trails
  function drawRibbons(ctx, w, h, seed, palette) {
    for (let ribbon = 0; ribbon < 5; ribbon++) {
      const color = palette[ribbon % palette.length];
      ctx.strokeStyle = color;
      ctx.fillStyle = color + '40';
      ctx.lineWidth = 3;
      
      ctx.beginPath();
      const startY = seededRandom(seed + ribbon * 100) * h;
      const points = [];
      
      for (let x = 0; x <= w; x += 10) {
        const y = startY + 
          Math.sin(x * 0.02 + seed + ribbon) * 50 +
          Math.sin(x * 0.01 + seed * 2 + ribbon) * 30;
        points.push({x, y});
        if (x === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      
      // Draw ribbon width
      for (let i = points.length - 1; i >= 0; i--) {
        const p = points[i];
        ctx.lineTo(p.x, p.y + 20 + Math.sin(p.x * 0.05 + seed) * 10);
      }
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
    }
  }

  // Helper: convert hex to RGB
  function hexToRgb(hex) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : {r: 255, g: 255, b: 255};
  }

  // Convert canvas to image element
  function canvasToImage(canvas, className = '') {
    const img = document.createElement('img');
    img.src = canvas.toDataURL('image/png');
    img.className = className;
    img.alt = 'Placeholder visual';
    return img;
  }

  // ============================================
  // ANIMATED PLACEHOLDER SYSTEM
  // ============================================
  
  // Animation style options
  const ANIMATION_STYLES = [
    'flowingWaves', 'pulsingOrbs', 'rotatingSpiral', 'particleField',
    'plasmaFlow', 'audioReactive', 'neonGrid', 'auroraFlow',
    'geometricMorph', 'liquidMetal', 'electricStorm', 'cosmicDust'
  ];
  
  // Subtle/slow animation styles for cards and smaller elements
  const SUBTLE_STYLES = [
    'subtleBreathing', 'gentleFlow', 'softPulse', 'driftingMist',
    'calmWaves', 'floatingDots', 'glowShift', 'colorDrift'
  ];

  // Create animated canvas with specified style
  function createAnimatedPlaceholder(container, width, height, style = null, seed = 0) {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    canvas.className = 'w-full h-full object-cover animated-visual';
    container.appendChild(canvas);
    
    const ctx = canvas.getContext('2d');
    const palette = getRandomPalette(seed);
    const chosenStyle = style || ANIMATION_STYLES[Math.floor(seededRandom(seed) * ANIMATION_STYLES.length)];
    let frame = 0;
    let animationId = null;

    // Animation functions - includes both dramatic and subtle styles
    const animations = {
      // Dramatic styles
      flowingWaves: () => animateFlowingWaves(ctx, width, height, frame, palette),
      pulsingOrbs: () => animatePulsingOrbs(ctx, width, height, frame, palette, seed),
      rotatingSpiral: () => animateRotatingSpiral(ctx, width, height, frame, palette),
      particleField: () => animateParticleField(ctx, width, height, frame, palette, seed),
      plasmaFlow: () => animatePlasmaFlow(ctx, width, height, frame, palette),
      audioReactive: () => animateAudioReactive(ctx, width, height, frame, palette, seed),
      neonGrid: () => animateNeonGrid(ctx, width, height, frame, palette),
      auroraFlow: () => animateAuroraFlow(ctx, width, height, frame, palette),
      geometricMorph: () => animateGeometricMorph(ctx, width, height, frame, palette, seed),
      liquidMetal: () => animateLiquidMetal(ctx, width, height, frame, palette, seed),
      electricStorm: () => animateElectricStorm(ctx, width, height, frame, palette, seed),
      cosmicDust: () => animateCosmicDust(ctx, width, height, frame, palette, seed),
      // Subtle/slow styles for cards
      subtleBreathing: () => animateSubtleBreathing(ctx, width, height, frame, palette, seed),
      gentleFlow: () => animateGentleFlow(ctx, width, height, frame, palette, seed),
      softPulse: () => animateSoftPulse(ctx, width, height, frame, palette, seed),
      driftingMist: () => animateDriftingMist(ctx, width, height, frame, palette, seed),
      calmWaves: () => animateCalmWaves(ctx, width, height, frame, palette),
      floatingDots: () => animateFloatingDots(ctx, width, height, frame, palette, seed),
      glowShift: () => animateGlowShift(ctx, width, height, frame, palette, seed),
      colorDrift: () => animateColorDrift(ctx, width, height, frame, palette, seed)
    };

    function animate() {
      // Dark background
      const gradient = ctx.createLinearGradient(0, 0, width, height);
      gradient.addColorStop(0, '#0a0015');
      gradient.addColorStop(0.5, palette[0] + '15');
      gradient.addColorStop(1, '#0a0015');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, width, height);

      // Run chosen animation
      (animations[chosenStyle] || animations.flowingWaves)();

      frame++;
      animationId = requestAnimationFrame(animate);
    }

    // Start animation
    animate();
    
    // Store cleanup function
    canvas.stopAnimation = () => {
      if (animationId) cancelAnimationFrame(animationId);
    };

    return canvas;
  }

  // Flowing waves animation
  function animateFlowingWaves(ctx, w, h, frame, palette) {
    ctx.globalAlpha = 0.7;
    for (let i = 0; i < 8; i++) {
      ctx.beginPath();
      const yOffset = h * 0.15 + (i * h * 0.1);
      const color = palette[i % palette.length];
      ctx.strokeStyle = color;
      ctx.lineWidth = 3;
      ctx.shadowColor = color;
      ctx.shadowBlur = 15;
      
      for (let x = 0; x <= w; x += 3) {
        const y = yOffset + 
          Math.sin((x * 0.015) + (frame * 0.03) + (i * 0.5)) * 30 +
          Math.sin((x * 0.008) + (frame * 0.02) + (i * 0.3)) * 20;
        if (x === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();
    }
    ctx.globalAlpha = 1;
    ctx.shadowBlur = 0;
  }

  // Pulsing orbs animation
  function animatePulsingOrbs(ctx, w, h, frame, palette, seed) {
    const orbCount = 12;
    for (let i = 0; i < orbCount; i++) {
      const baseX = seededRandom(seed + i) * w;
      const baseY = seededRandom(seed + i + 100) * h;
      const x = baseX + Math.sin(frame * 0.02 + i) * 30;
      const y = baseY + Math.cos(frame * 0.015 + i * 0.7) * 25;
      const baseRadius = 20 + seededRandom(seed + i + 200) * 40;
      const radius = baseRadius + Math.sin(frame * 0.05 + i * 0.5) * 15;
      const color = palette[i % palette.length];
      
      const glow = ctx.createRadialGradient(x, y, 0, x, y, radius);
      glow.addColorStop(0, color);
      glow.addColorStop(0.4, color + '80');
      glow.addColorStop(0.7, color + '30');
      glow.addColorStop(1, color + '00');
      
      ctx.fillStyle = glow;
      ctx.beginPath();
      ctx.arc(x, y, radius, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // Rotating spiral animation
  function animateRotatingSpiral(ctx, w, h, frame, palette) {
    const cx = w / 2;
    const cy = h / 2;
    
    for (let s = 0; s < 4; s++) {
      const color = palette[s % palette.length];
      ctx.strokeStyle = color;
      ctx.lineWidth = 3;
      ctx.shadowColor = color;
      ctx.shadowBlur = 10;
      ctx.globalAlpha = 0.7;
      
      ctx.beginPath();
      for (let a = 0; a < Math.PI * 6; a += 0.05) {
        const r = a * 12;
        const x = cx + Math.cos(a + frame * 0.02 + s * 1.5) * r;
        const y = cy + Math.sin(a + frame * 0.02 + s * 1.5) * r;
        if (a === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();
    }
    ctx.globalAlpha = 1;
    ctx.shadowBlur = 0;
  }

  // Particle field animation
  function animateParticleField(ctx, w, h, frame, palette, seed) {
    const particleCount = 80;
    ctx.globalAlpha = 0.8;
    
    for (let i = 0; i < particleCount; i++) {
      const baseX = seededRandom(seed + i) * w;
      const baseY = seededRandom(seed + i + 50) * h;
      const speed = 0.5 + seededRandom(seed + i + 100) * 1.5;
      
      // Move particles upward, loop back
      let y = (baseY - frame * speed) % h;
      if (y < 0) y += h;
      const x = baseX + Math.sin(frame * 0.01 + i) * 20;
      
      const radius = 2 + seededRandom(seed + i + 150) * 4;
      const color = palette[i % palette.length];
      
      ctx.fillStyle = color;
      ctx.shadowColor = color;
      ctx.shadowBlur = 8;
      ctx.beginPath();
      ctx.arc(x, y, radius, 0, Math.PI * 2);
      ctx.fill();
      
      // Trail
      ctx.globalAlpha = 0.3;
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x, y + 20);
      ctx.strokeStyle = color;
      ctx.lineWidth = 1;
      ctx.stroke();
      ctx.globalAlpha = 0.8;
    }
    ctx.globalAlpha = 1;
    ctx.shadowBlur = 0;
  }

  // Plasma flow animation
  function animatePlasmaFlow(ctx, w, h, frame, palette) {
    for (let i = 0; i < 6; i++) {
      const t = frame * 0.01;
      const x = w/2 + Math.sin(t + i * 1.2) * w * 0.3;
      const y = h/2 + Math.cos(t * 0.8 + i * 0.9) * h * 0.3;
      const r = 80 + Math.sin(t + i) * 30;
      const color = palette[i % palette.length];
      
      const glow = ctx.createRadialGradient(x, y, 0, x, y, r);
      glow.addColorStop(0, color + 'CC');
      glow.addColorStop(0.3, color + '66');
      glow.addColorStop(0.7, color + '22');
      glow.addColorStop(1, color + '00');
      
      ctx.fillStyle = glow;
      ctx.fillRect(0, 0, w, h);
    }
  }

  // Audio reactive bars animation
  function animateAudioReactive(ctx, w, h, frame, palette, seed) {
    const bars = 32;
    const barWidth = w / bars;
    ctx.globalAlpha = 0.9;
    
    for (let i = 0; i < bars; i++) {
      // Simulate audio with multiple sine waves
      const freq1 = Math.sin(frame * 0.05 + i * 0.3 + seed);
      const freq2 = Math.sin(frame * 0.08 + i * 0.5 + seed * 2);
      const freq3 = Math.sin(frame * 0.03 + i * 0.2);
      const amplitude = (freq1 + freq2 + freq3 + 3) / 6;
      
      const barHeight = amplitude * h * 0.7;
      const color = palette[i % palette.length];
      
      // Main bar
      const grad = ctx.createLinearGradient(0, h - barHeight, 0, h);
      grad.addColorStop(0, color);
      grad.addColorStop(1, color + '40');
      ctx.fillStyle = grad;
      ctx.fillRect(i * barWidth + 2, h - barHeight, barWidth - 4, barHeight);
      
      // Glow effect
      ctx.shadowColor = color;
      ctx.shadowBlur = 10;
      ctx.fillRect(i * barWidth + 2, h - barHeight, barWidth - 4, 4);
      ctx.shadowBlur = 0;
    }
    ctx.globalAlpha = 1;
  }

  // Neon grid animation
  function animateNeonGrid(ctx, w, h, frame, palette) {
    const cellSize = 40;
    const offset = (frame * 0.5) % cellSize;
    
    ctx.globalAlpha = 0.5;
    ctx.lineWidth = 1;
    
    // Horizontal lines moving down
    for (let y = -cellSize + offset; y <= h + cellSize; y += cellSize) {
      ctx.strokeStyle = palette[0] + '80';
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(w, y);
      ctx.stroke();
    }
    
    // Vertical lines with perspective feel
    for (let x = 0; x <= w; x += cellSize) {
      ctx.strokeStyle = palette[1] + '80';
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, h);
      ctx.stroke();
    }
    
    // Glowing nodes at intersections
    ctx.globalAlpha = 0.8;
    for (let y = -cellSize + offset; y <= h + cellSize; y += cellSize) {
      for (let x = 0; x <= w; x += cellSize) {
        const pulse = Math.sin(frame * 0.1 + x * 0.1 + y * 0.1) * 0.5 + 0.5;
        const color = palette[Math.floor((x + y) / cellSize) % palette.length];
        const radius = 3 + pulse * 4;
        
        ctx.fillStyle = color;
        ctx.shadowColor = color;
        ctx.shadowBlur = 10;
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    ctx.globalAlpha = 1;
    ctx.shadowBlur = 0;
  }

  // Aurora flow animation
  function animateAuroraFlow(ctx, w, h, frame, palette) {
    for (let band = 0; band < 5; band++) {
      ctx.beginPath();
      const baseY = h * 0.2 + band * h * 0.12;
      const color = palette[band % palette.length];
      
      ctx.moveTo(0, baseY);
      for (let x = 0; x <= w; x += 5) {
        const y = baseY + 
          Math.sin(x * 0.015 + frame * 0.02 + band) * 40 + 
          Math.sin(x * 0.008 + frame * 0.015) * 25;
        ctx.lineTo(x, y);
      }
      ctx.lineTo(w, h);
      ctx.lineTo(0, h);
      ctx.closePath();
      
      const grad = ctx.createLinearGradient(0, baseY - 50, 0, baseY + 150);
      grad.addColorStop(0, color + '00');
      grad.addColorStop(0.3, color + '60');
      grad.addColorStop(0.5, color + '40');
      grad.addColorStop(1, color + '00');
      
      ctx.fillStyle = grad;
      ctx.fill();
    }
  }

  // Geometric morph animation
  function animateGeometricMorph(ctx, w, h, frame, palette, seed) {
    const shapes = 8;
    const cx = w / 2;
    const cy = h / 2;
    
    for (let i = 0; i < shapes; i++) {
      const angle = (i / shapes) * Math.PI * 2 + frame * 0.01;
      const dist = 80 + Math.sin(frame * 0.03 + i) * 40;
      const x = cx + Math.cos(angle) * dist;
      const y = cy + Math.sin(angle) * dist;
      const size = 30 + Math.sin(frame * 0.05 + i * 0.5) * 15;
      const sides = 3 + Math.floor((Math.sin(frame * 0.02 + i) + 1) * 2);
      const color = palette[i % palette.length];
      
      ctx.beginPath();
      for (let j = 0; j <= sides; j++) {
        const a = (j / sides) * Math.PI * 2 + frame * 0.02;
        const px = x + Math.cos(a) * size;
        const py = y + Math.sin(a) * size;
        if (j === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.closePath();
      
      ctx.fillStyle = color + '60';
      ctx.strokeStyle = color;
      ctx.lineWidth = 2;
      ctx.shadowColor = color;
      ctx.shadowBlur = 15;
      ctx.fill();
      ctx.stroke();
    }
    ctx.shadowBlur = 0;
  }

  // Liquid metal animation
  function animateLiquidMetal(ctx, w, h, frame, palette, seed) {
    const blobs = 5;
    for (let i = 0; i < blobs; i++) {
      const baseX = seededRandom(seed + i) * w;
      const baseY = seededRandom(seed + i + 50) * h;
      const x = baseX + Math.sin(frame * 0.02 + i * 1.5) * 50;
      const y = baseY + Math.cos(frame * 0.018 + i * 1.2) * 40;
      const baseR = 60 + seededRandom(seed + i + 100) * 40;
      const color = palette[i % palette.length];
      
      // Draw blob with varying radius
      ctx.beginPath();
      for (let a = 0; a <= Math.PI * 2; a += 0.1) {
        const wobble = Math.sin(a * 3 + frame * 0.05 + i) * 15 + Math.sin(a * 5 + frame * 0.03) * 8;
        const r = baseR + wobble;
        const px = x + Math.cos(a) * r;
        const py = y + Math.sin(a) * r;
        if (a === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.closePath();
      
      const grad = ctx.createRadialGradient(x - baseR * 0.3, y - baseR * 0.3, 0, x, y, baseR * 1.5);
      grad.addColorStop(0, '#FFFFFF80');
      grad.addColorStop(0.3, color + 'CC');
      grad.addColorStop(0.7, color + '88');
      grad.addColorStop(1, color + '22');
      ctx.fillStyle = grad;
      ctx.fill();
    }
  }

  // Electric storm animation
  function animateElectricStorm(ctx, w, h, frame, palette, seed) {
    // Only draw lightning occasionally for dramatic effect
    if (frame % 8 < 3) {
      for (let bolt = 0; bolt < 3; bolt++) {
        const color = palette[bolt % palette.length];
        ctx.strokeStyle = color;
        ctx.lineWidth = 2 + Math.random() * 2;
        ctx.shadowColor = color;
        ctx.shadowBlur = 20;
        ctx.globalAlpha = 0.8;
        
        ctx.beginPath();
        let x = seededRandom(seed + bolt + frame * 0.1) * w;
        let y = 0;
        ctx.moveTo(x, y);
        
        while (y < h) {
          x += (Math.random() - 0.5) * 60;
          y += 15 + Math.random() * 25;
          ctx.lineTo(x, y);
          
          // Branch
          if (Math.random() > 0.7) {
            const branchX = x + (Math.random() - 0.5) * 80;
            const branchY = y + 30 + Math.random() * 40;
            ctx.lineTo(branchX, branchY);
            ctx.moveTo(x, y);
          }
        }
        ctx.stroke();
      }
    }
    
    // Background glow
    ctx.globalAlpha = 0.3 + Math.sin(frame * 0.2) * 0.1;
    const glowColor = palette[0];
    const glow = ctx.createRadialGradient(w/2, h/2, 0, w/2, h/2, Math.max(w, h));
    glow.addColorStop(0, glowColor + '40');
    glow.addColorStop(1, glowColor + '00');
    ctx.fillStyle = glow;
    ctx.fillRect(0, 0, w, h);
    
    ctx.globalAlpha = 1;
    ctx.shadowBlur = 0;
  }

  // Cosmic dust animation
  function animateCosmicDust(ctx, w, h, frame, palette, seed) {
    const particles = 150;
    ctx.globalAlpha = 0.7;
    
    for (let i = 0; i < particles; i++) {
      const baseX = seededRandom(seed + i) * w;
      const baseY = seededRandom(seed + i + 50) * h;
      const z = seededRandom(seed + i + 100); // depth
      const speed = 0.2 + z * 0.8;
      
      // Rotate around center
      const cx = w / 2;
      const cy = h / 2;
      const angle = Math.atan2(baseY - cy, baseX - cx) + frame * 0.003 * speed;
      const dist = Math.hypot(baseX - cx, baseY - cy);
      
      const x = cx + Math.cos(angle) * dist;
      const y = cy + Math.sin(angle) * dist;
      const radius = 1 + z * 3;
      const color = palette[i % palette.length];
      
      ctx.fillStyle = color;
      ctx.globalAlpha = 0.3 + z * 0.5;
      ctx.beginPath();
      ctx.arc(x, y, radius, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
  }

  // ============================================
  // SUBTLE/SLOW ANIMATION STYLES
  // ============================================

  // Subtle breathing - gentle size pulsing of shapes
  function animateSubtleBreathing(ctx, w, h, frame, palette, seed) {
    const count = 5;
    const slowFrame = frame * 0.3; // Slow down animation
    
    for (let i = 0; i < count; i++) {
      const cx = seededRandom(seed + i) * w;
      const cy = seededRandom(seed + i + 50) * h;
      const baseR = 30 + seededRandom(seed + i + 100) * 50;
      const breathe = Math.sin(slowFrame * 0.02 + i * 0.5) * 0.3 + 1;
      const r = baseR * breathe;
      const color = palette[i % palette.length];
      
      const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, r);
      grad.addColorStop(0, color + 'AA');
      grad.addColorStop(0.5, color + '44');
      grad.addColorStop(1, color + '00');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // Gentle flow - slow horizontal movement
  function animateGentleFlow(ctx, w, h, frame, palette, seed) {
    const slowFrame = frame * 0.2;
    ctx.globalAlpha = 0.6;
    
    for (let i = 0; i < 4; i++) {
      const baseY = h * 0.2 + i * h * 0.2;
      const color = palette[i % palette.length];
      
      ctx.beginPath();
      ctx.moveTo(0, baseY);
      for (let x = 0; x <= w; x += 10) {
        const y = baseY + Math.sin(x * 0.01 + slowFrame * 0.01 + i) * 20;
        ctx.lineTo(x, y);
      }
      ctx.lineTo(w, h);
      ctx.lineTo(0, h);
      ctx.closePath();
      
      const grad = ctx.createLinearGradient(0, baseY - 30, 0, baseY + 80);
      grad.addColorStop(0, color + '00');
      grad.addColorStop(0.3, color + '40');
      grad.addColorStop(1, color + '00');
      ctx.fillStyle = grad;
      ctx.fill();
    }
    ctx.globalAlpha = 1;
  }

  // Soft pulse - gentle opacity pulsing
  function animateSoftPulse(ctx, w, h, frame, palette, seed) {
    const slowFrame = frame * 0.25;
    const count = 4;
    
    for (let i = 0; i < count; i++) {
      const cx = seededRandom(seed + i) * w;
      const cy = seededRandom(seed + i + 50) * h;
      const r = 50 + seededRandom(seed + i + 100) * 80;
      const pulse = (Math.sin(slowFrame * 0.02 + i * 0.8) + 1) / 2;
      const color = palette[i % palette.length];
      
      ctx.globalAlpha = 0.3 + pulse * 0.4;
      const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, r);
      grad.addColorStop(0, color);
      grad.addColorStop(0.6, color + '66');
      grad.addColorStop(1, color + '00');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
  }

  // Drifting mist - slow floating clouds
  function animateDriftingMist(ctx, w, h, frame, palette, seed) {
    const slowFrame = frame * 0.15;
    const clouds = 6;
    
    for (let i = 0; i < clouds; i++) {
      const baseX = seededRandom(seed + i) * w;
      const baseY = seededRandom(seed + i + 50) * h;
      const x = baseX + Math.sin(slowFrame * 0.008 + i) * 30;
      const y = baseY + Math.cos(slowFrame * 0.006 + i * 0.5) * 20;
      const r = 60 + seededRandom(seed + i + 100) * 60;
      const color = palette[i % palette.length];
      
      const grad = ctx.createRadialGradient(x, y, 0, x, y, r);
      grad.addColorStop(0, color + '50');
      grad.addColorStop(0.5, color + '25');
      grad.addColorStop(1, color + '00');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, w, h);
    }
  }

  // Calm waves - very slow wave motion
  function animateCalmWaves(ctx, w, h, frame, palette) {
    const slowFrame = frame * 0.2;
    ctx.globalAlpha = 0.5;
    
    for (let i = 0; i < 5; i++) {
      ctx.beginPath();
      const yBase = h * 0.2 + i * h * 0.15;
      const color = palette[i % palette.length];
      ctx.strokeStyle = color;
      ctx.lineWidth = 2;
      
      for (let x = 0; x <= w; x += 5) {
        const y = yBase + Math.sin(x * 0.008 + slowFrame * 0.008 + i * 0.3) * 15;
        if (x === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();
    }
    ctx.globalAlpha = 1;
  }

  // Floating dots - slow drifting particles
  function animateFloatingDots(ctx, w, h, frame, palette, seed) {
    const slowFrame = frame * 0.2;
    const dots = 20;
    ctx.globalAlpha = 0.7;
    
    for (let i = 0; i < dots; i++) {
      const baseX = seededRandom(seed + i) * w;
      const baseY = seededRandom(seed + i + 50) * h;
      const x = baseX + Math.sin(slowFrame * 0.01 + i * 0.5) * 15;
      const y = baseY + Math.cos(slowFrame * 0.008 + i * 0.3) * 12;
      const r = 3 + seededRandom(seed + i + 100) * 6;
      const color = palette[i % palette.length];
      
      const grad = ctx.createRadialGradient(x, y, 0, x, y, r * 2);
      grad.addColorStop(0, color);
      grad.addColorStop(0.5, color + '60');
      grad.addColorStop(1, color + '00');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(x, y, r * 2, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
  }

  // Glow shift - colors that slowly shift position
  function animateGlowShift(ctx, w, h, frame, palette, seed) {
    const slowFrame = frame * 0.15;
    const glows = 3;
    
    for (let i = 0; i < glows; i++) {
      const angle = slowFrame * 0.005 + (i / glows) * Math.PI * 2;
      const dist = Math.min(w, h) * 0.25;
      const cx = w / 2 + Math.cos(angle) * dist;
      const cy = h / 2 + Math.sin(angle) * dist;
      const r = 80 + seededRandom(seed + i) * 40;
      const color = palette[i % palette.length];
      
      const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, r);
      grad.addColorStop(0, color + '80');
      grad.addColorStop(0.4, color + '40');
      grad.addColorStop(1, color + '00');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, w, h);
    }
  }

  // Color drift - slow color gradient transitions
  function animateColorDrift(ctx, w, h, frame, palette, seed) {
    const slowFrame = frame * 0.1;
    const shift = (Math.sin(slowFrame * 0.01) + 1) / 2;
    const idx1 = Math.floor(seededRandom(seed) * palette.length);
    const idx2 = (idx1 + 1 + Math.floor(shift * 2)) % palette.length;
    const idx3 = (idx2 + 1) % palette.length;
    
    const grad = ctx.createLinearGradient(
      Math.sin(slowFrame * 0.005) * w * 0.3 + w * 0.3,
      Math.cos(slowFrame * 0.004) * h * 0.3 + h * 0.3,
      w - Math.sin(slowFrame * 0.005) * w * 0.3,
      h - Math.cos(slowFrame * 0.004) * h * 0.3
    );
    grad.addColorStop(0, palette[idx1] + '60');
    grad.addColorStop(0.5, palette[idx2] + '40');
    grad.addColorStop(1, palette[idx3] + '60');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);
    
    // Add subtle texture
    ctx.globalAlpha = 0.3;
    for (let i = 0; i < 8; i++) {
      const x = seededRandom(seed + i) * w;
      const y = seededRandom(seed + i + 50) * h;
      const r = 30 + seededRandom(seed + i + 100) * 50;
      const glow = ctx.createRadialGradient(x, y, 0, x, y, r);
      glow.addColorStop(0, '#FFFFFF30');
      glow.addColorStop(1, '#FFFFFF00');
      ctx.fillStyle = glow;
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
  }

  // Create animated background for hero sections
  function createAnimatedHeroBackground(container, style = null) {
    if (!container) return null;
    
    const rect = container.getBoundingClientRect();
    const width = rect.width || 800;
    const height = rect.height || 600;
    
    return createAnimatedPlaceholder(container, width, height, style, Date.now());
  }
  
  // Create subtle animated card - for smaller elements like cards
  function createSubtleAnimatedCard(container, width, height, seed = 0) {
    const style = SUBTLE_STYLES[Math.floor(seededRandom(seed) * SUBTLE_STYLES.length)];
    return createAnimatedPlaceholder(container, width, height, style, seed);
  }

  // Theme-specific color palettes - enhanced with multiple options per theme
  const THEME_PALETTES = {
    music: [
      ['#FF1493', '#8B5CF6', '#00D4FF', '#FF6B35', '#FFD700'],
      ['#FF00FF', '#FF1493', '#00FFFF', '#FF6EC7', '#7B68EE'],
      ['#9D4EDD', '#C77DFF', '#E0AAFF', '#F0E6FF', '#FFD6FF'],
      ['#FF2281', '#FF6600', '#FAFF00', '#14FFEC', '#0D7377']
    ],
    video: [
      ['#00D4FF', '#FF00FF', '#39FF14', '#FF6B35', '#8B5CF6'],
      ['#5FFBF1', '#36D1DC', '#5B86E5', '#8B5CF6', '#D946EF'],
      ['#003B00', '#006600', '#00FF00', '#66FF66', '#00FF41'],
      ['#FF6AD5', '#C774E8', '#AD8CFF', '#8795E8', '#94D0FF']
    ],
    art: [
      ['#FF6AD5', '#FFD700', '#FF7F50', '#32CD32', '#00FFFF'],
      ['#FFB3BA', '#FFDFBA', '#FFFFBA', '#BAFFC9', '#BAE1FF'],
      ['#FF9FF3', '#FEC8D8', '#F1C0E8', '#CFBAF0', '#A3C4F3'],
      ['#006A4E', '#2E8B57', '#9932CC', '#8B008B', '#FF1493']
    ],
    data: [
      ['#00FF41', '#00D4FF', '#8B5CF6', '#FFD700', '#FF1493'],
      ['#003B00', '#006600', '#00FF00', '#66FF66', '#00FF41'],
      ['#121212', '#1E1E1E', '#2D2D2D', '#3D3D3D', '#BB86FC'],
      ['#A5F3FC', '#67E8F9', '#22D3EE', '#06B6D4', '#0891B2']
    ],
    default: [
      ['#FF1493', '#00D4FF', '#FFD700', '#39FF14', '#FF00FF'],
      ['#7400B8', '#6930C3', '#5E60CE', '#5390D9', '#4EA8DE'],
      ['#D00000', '#DC2F02', '#E85D04', '#F48C06', '#FAA307'],
      ['#00B4D8', '#0077B6', '#023E8A', '#48CAE4', '#90E0EF']
    ]
  };
  
  // Get theme palette (randomly select from theme options)
  function getThemePalette(theme, seed) {
    const options = THEME_PALETTES[theme] || THEME_PALETTES.default;
    const idx = Math.floor(seededRandom(seed) * options.length);
    return options[idx];
  }

  // Get current page theme
  function getPageTheme() {
    const section = document.querySelector('[data-gallery-theme]');
    return section ? section.dataset.galleryTheme : 'default';
  }

  // Initialize placeholders where needed
  function initPlaceholders() {
    // Check for real images in hero slideshow
    const heroSlideshow = document.querySelector('.hero-slideshow');
    const realImages = heroSlideshow ? heroSlideshow.querySelectorAll('img[src^="/images"]') : [];
    const hasRealImages = realImages.length > 0;

    // Get page theme for styled placeholders
    const theme = getPageTheme();
    
    // Check if this is home page or subpage
    const isHomePage = window.location.pathname === '/' || window.location.pathname === '/index.html';
    
    if (hasRealImages) {
      // HYBRID MODE: Has real images
      // Ken Burns slideshow between real image and generative animation
      generateKenBurnsSlideshow(heroSlideshow, Array.from(realImages), theme);
      // Gallery with mix of real images and generative animations
      generateHybridGallery(Array.from(realImages), theme);
    } else {
      // NO IMAGES: Generate ALL animated placeholder visuals
      if (allAnimatedElements.length === 0) {
        registerAllAnimationStyles();
      }
      generateBackgroundPlaceholders(theme);
      generateSlideshowPlaceholders(theme);
      generateCarouselPlaceholders(theme);
    }
    
    // ALWAYS generate navigation sections
    if (isHomePage) {
      generateWhatsNewPlaceholders();
    } else {
      generateSubpageLinks(theme);
    }
  }
  
  // KEN BURNS SLIDESHOW: Fade between real image and generative animation
  function generateKenBurnsSlideshow(container, realImages, theme) {
    if (!container || container.querySelector('.ken-burns-wrapper')) return;
    
    // Create wrapper for Ken Burns effect
    const wrapper = document.createElement('div');
    wrapper.className = 'ken-burns-wrapper absolute inset-0 overflow-hidden';
    container.appendChild(wrapper);
    
    const slides = [];
    
    // Add real images as slides with Ken Burns animation
    realImages.forEach((img, i) => {
      const slide = document.createElement('div');
      slide.className = 'ken-burns-slide absolute inset-0';
      slide.style.cssText = `opacity: ${i === 0 ? '1' : '0'}; transition: opacity 2s ease-in-out;`;
      
      const clonedImg = img.cloneNode(true);
      clonedImg.className = 'w-full h-full object-cover';
      clonedImg.style.cssText = 'animation: kenBurns 20s ease-in-out infinite;';
      slide.appendChild(clonedImg);
      
      wrapper.appendChild(slide);
      slides.push({ element: slide, type: 'image' });
    });
    
    // Add generative animation slide
    const animSlide = document.createElement('div');
    animSlide.className = 'ken-burns-slide absolute inset-0';
    animSlide.style.cssText = 'opacity: 0; transition: opacity 2s ease-in-out;';
    const animStyle = ['auroraFlow', 'flowingWaves', 'plasmaFlow'][Math.floor(Math.random() * 3)];
    createAnimatedPlaceholder(animSlide, 800, 600, animStyle, Date.now());
    wrapper.appendChild(animSlide);
    slides.push({ element: animSlide, type: 'animation' });
    
    // Hide original images
    realImages.forEach(img => img.style.display = 'none');
    
    // Alternate between images and animation
    if (slides.length > 1) {
      let current = 0;
      setInterval(() => {
        slides[current].element.style.opacity = '0';
        current = (current + 1) % slides.length;
        slides[current].element.style.opacity = '1';
      }, 5000);
    }
  }
  
  // HYBRID GALLERY: Multiple scrolling rows with different directions
  function generateHybridGallery(realImages, theme) {
    const container = document.querySelector('.gallery-rows');
    if (!container || container.querySelector('.gallery-row')) return;
    
    const numRows = parseInt(container.dataset.rows) || 3;
    const cardsPerRow = 12; // Enough to scroll
    const rowHeight = Math.floor(100 / numRows);
    
    // Create a card
    const createCard = (rowIndex, cardIndex) => {
      const card = document.createElement('div');
      card.className = 'gallery-card flex-shrink-0 relative overflow-hidden rounded-lg border-2 border-wavgen-purple hover:border-wavgen-yellow shadow-lg cursor-pointer transition-all duration-300 hover:scale-105';
      card.style.cssText = 'width: 75px; height: 60px;';
      
      const globalIndex = rowIndex * cardsPerRow + cardIndex;
      const seed = globalIndex * 73 + 500;
      
      // Mix: some animated, some real images
      if (cardIndex % 3 === 0 && realImages.length > 0) {
        // Real image card
        const imgIndex = Math.floor(cardIndex / 3) % realImages.length;
        const img = document.createElement('img');
        img.src = realImages[imgIndex].src;
        img.className = 'absolute inset-0 w-full h-full object-cover';
        card.appendChild(img);
        card.dataset.imageSrc = realImages[imgIndex].src;
        card.addEventListener('click', () => {
          const modal = document.getElementById('myModal');
          const modalImg = document.getElementById('img01');
          if (modal && modalImg) {
            modalImg.src = card.dataset.imageSrc;
            modal.classList.remove('hidden');
          }
        });
      } else {
        // Animated generative card
        const canvasWrapper = document.createElement('div');
        canvasWrapper.className = 'absolute inset-0';
        const subtleStyle = SUBTLE_STYLES[globalIndex % SUBTLE_STYLES.length];
        createAnimatedPlaceholder(canvasWrapper, 75, 60, subtleStyle, seed);
        card.appendChild(canvasWrapper);
        card.addEventListener('click', () => {
          const index = allAnimatedElements.findIndex(el => el.seed === seed);
          if (index >= 0) openAnimatedModal(index);
        });
        // Register for modal
        if (!allAnimatedElements.find(el => el.seed === seed)) {
          allAnimatedElements.push({ style: subtleStyle, seed });
        }
      }
      
      return card;
    };
    
    // Create rows with alternating scroll directions
    for (let r = 0; r < numRows; r++) {
      const row = document.createElement('div');
      row.className = 'gallery-row relative overflow-hidden';
      row.style.cssText = `height: ${rowHeight}%; min-height: 50px;`;
      
      const track = document.createElement('div');
      track.className = 'gallery-row-track flex items-center gap-1 h-full';
      track.style.width = 'max-content';
      
      // Add cards twice for seamless loop
      for (let c = 0; c < cardsPerRow; c++) track.appendChild(createCard(r, c));
      for (let c = 0; c < cardsPerRow; c++) track.appendChild(createCard(r, c + 100));
      
      row.appendChild(track);
      container.appendChild(row);
      
      // Start marquee with alternating direction
      startRowMarquee(track, r % 2 === 0 ? 1 : -1, 15 + r * 3);
    }
  }
  
  // Animate a single row marquee
  function startRowMarquee(track, direction, duration) {
    if (!track || !window.gsap) return;
    
    setTimeout(() => {
      const cards = track.querySelectorAll('.gallery-card');
      if (cards.length === 0) return;
      
      const cardWidth = 76; // 75px + 1px gap
      const totalWidth = cardWidth * (cards.length / 2);
      
      if (direction > 0) {
        // Scroll left
        gsap.to(track, {
          x: -totalWidth,
          duration: duration,
          ease: 'none',
          repeat: -1,
          modifiers: {
            x: gsap.utils.unitize(x => parseFloat(x) % totalWidth)
          }
        });
      } else {
        // Scroll right (start offset, scroll back)
        gsap.set(track, { x: -totalWidth });
        gsap.to(track, {
          x: 0,
          duration: duration,
          ease: 'none',
          repeat: -1,
          modifiers: {
            x: gsap.utils.unitize(x => {
              const val = parseFloat(x);
              return val >= 0 ? val - totalWidth : val;
            })
          }
        });
      }
    }, 100);
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

    // Create animated link cards
    const createAnimatedCard = (item, i, offset = 0) => {
      const card = document.createElement('a');
      card.href = item.href;
      card.className = 'subpage-link placeholder-generated flex-shrink-0 relative overflow-hidden rounded-xl border-2 border-wavgen-purple hover:border-wavgen-yellow shadow-lg cursor-pointer transition-all duration-300 hover:scale-105 no-underline';
      card.style.cssText = 'height: calc(100% - 8px); aspect-ratio: 1.2;';
      
      // Create animated canvas background container
      const canvasContainer = document.createElement('div');
      canvasContainer.className = 'absolute inset-0';
      
      // Use subtle animation style
      const subtleStyle = SUBTLE_STYLES[i % SUBTLE_STYLES.length];
      createAnimatedPlaceholder(canvasContainer, 150, 120, subtleStyle, i * 53 + 2000 + offset);
      
      const overlay = document.createElement('div');
      overlay.className = 'absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent flex flex-col justify-end p-2 z-10';
      overlay.innerHTML = `<span class="text-sm text-white font-bold">${item.title}</span>`;
      
      card.appendChild(canvasContainer);
      card.appendChild(overlay);
      return card;
    };

    // Add animated cards twice for seamless loop
    links.forEach((item, i) => track.appendChild(createAnimatedCard(item, i, 0)));
    links.forEach((item, i) => track.appendChild(createAnimatedCard(item, i, 1000)));

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

  // Generate background slideshow placeholders - ALL ANIMATED with style transitions
  function generateBackgroundPlaceholders() {
    // Hero section background - animated canvas with style transitions
    const heroBg = document.querySelector('.hero-section-bg-slideshow');
    if (heroBg && heroBg.querySelectorAll('.placeholder-generated').length === 0) {
      const animContainer = document.createElement('div');
      animContainer.className = 'placeholder-generated absolute inset-0';
      animContainer.style.opacity = '0.35';
      heroBg.appendChild(animContainer);
      
      // Background animation styles - subtle and atmospheric
      const bgStyles = ['auroraFlow', 'plasmaFlow', 'cosmicDust', 'driftingMist', 'colorDrift'];
      const style = bgStyles[Math.floor(Math.random() * bgStyles.length)];
      createAnimatedPlaceholder(animContainer, 960, 540, style, Date.now());
      
      // Transition through styles every 30 seconds
      startStyleTransitions(animContainer, 960, 540, bgStyles, 30000);
    }

    // Hello card background - animated with style transitions
    const helloBg = document.querySelector('.hero-bg-slideshow');
    if (helloBg && helloBg.querySelectorAll('.placeholder-generated').length === 0) {
      const animContainer = document.createElement('div');
      animContainer.className = 'placeholder-generated absolute inset-0';
      animContainer.style.opacity = '0.25';
      helloBg.appendChild(animContainer);
      
      // Card background styles - very subtle
      const cardStyles = ['subtleBreathing', 'softPulse', 'glowShift', 'colorDrift'];
      const style = cardStyles[Math.floor(Math.random() * cardStyles.length)];
      createAnimatedPlaceholder(animContainer, 400, 300, style, Date.now() + 100);
      
      // Transition through styles every 25 seconds
      startStyleTransitions(animContainer, 400, 300, cardStyles, 25000);
    }
  }
  
  // Generate animated hero visual for the main slideshow area
  function generateAnimatedHeroVisual() {
    const slideshow = document.querySelector('.hero-slideshow');
    if (!slideshow) return;
    
    // Check if already has animated visual
    if (slideshow.querySelector('.animated-visual')) return;
    
    // Create a prominent animated visual
    const animContainer = document.createElement('div');
    animContainer.className = 'animated-hero-container absolute inset-0 z-0';
    slideshow.insertBefore(animContainer, slideshow.firstChild);
    
    // Use dramatic animation styles for hero
    const heroAnimStyles = ['audioReactive', 'electricStorm', 'geometricMorph', 'neonGrid', 'liquidMetal'];
    const style = heroAnimStyles[Math.floor(Math.random() * heroAnimStyles.length)];
    createAnimatedPlaceholder(animContainer, 600, 400, style, Date.now() + 200);
  }

  // Store all animated elements for modal navigation
  let allAnimatedElements = [];
  let currentModalAnimation = null;

  // Open modal with animated canvas
  function openAnimatedModal(styleIndex) {
    const modal = document.getElementById('myModal');
    const modalContent = modal?.querySelector('.modal-content');
    const modalImg = document.getElementById('img01');
    
    if (!modal) return;
    
    // Hide the static image element
    if (modalImg) modalImg.style.display = 'none';
    
    // Remove any existing animated canvas in modal
    const existingCanvas = modal.querySelector('.modal-animated-canvas');
    if (existingCanvas) {
      if (existingCanvas.stopAnimation) existingCanvas.stopAnimation();
      existingCanvas.remove();
    }
    
    // Create container for animated canvas in modal
    let canvasContainer = modal.querySelector('.modal-canvas-container');
    if (!canvasContainer) {
      canvasContainer = document.createElement('div');
      canvasContainer.className = 'modal-canvas-container absolute inset-0 flex items-center justify-center';
      canvasContainer.style.cssText = 'z-index: 10;';
      modal.appendChild(canvasContainer);
    }
    canvasContainer.innerHTML = '';
    
    // Create large animated canvas for modal
    const animWrapper = document.createElement('div');
    animWrapper.className = 'modal-animated-canvas relative';
    animWrapper.style.cssText = 'width: 90vw; height: 80vh; max-width: 1200px; border-radius: 12px; overflow: hidden; border: 2px solid #FFD700;';
    canvasContainer.appendChild(animWrapper);
    
    // Get the animation style from stored elements
    const animData = allAnimatedElements[styleIndex];
    if (animData) {
      currentModalAnimation = createAnimatedPlaceholder(
        animWrapper, 
        1200, 
        800, 
        animData.style, 
        animData.seed
      );
    }
    
    modal.classList.remove('hidden');
    modal.dataset.currentIndex = styleIndex;
    document.body.style.overflow = 'hidden';
    
    setupAnimatedModalNavigation();
  }

  // Setup modal navigation for animated content
  function setupAnimatedModalNavigation() {
    const modal = document.getElementById('myModal');
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');
    const closeBtn = modal?.querySelector('.close');
    
    if (!modal) return;

    // Navigate to previous animation
    const goPrev = () => {
      let idx = parseInt(modal.dataset.currentIndex) || 0;
      idx = (idx - 1 + allAnimatedElements.length) % allAnimatedElements.length;
      
      // Stop current and start new
      const existingCanvas = modal.querySelector('.modal-animated-canvas canvas');
      if (existingCanvas && existingCanvas.stopAnimation) {
        existingCanvas.stopAnimation();
      }
      
      openAnimatedModal(idx);
    };

    // Navigate to next animation
    const goNext = () => {
      let idx = parseInt(modal.dataset.currentIndex) || 0;
      idx = (idx + 1) % allAnimatedElements.length;
      
      // Stop current and start new
      const existingCanvas = modal.querySelector('.modal-animated-canvas canvas');
      if (existingCanvas && existingCanvas.stopAnimation) {
        existingCanvas.stopAnimation();
      }
      
      openAnimatedModal(idx);
    };

    // Close modal
    const closeModal = () => {
      // Stop animation when closing
      const existingCanvas = modal.querySelector('.modal-animated-canvas canvas');
      if (existingCanvas && existingCanvas.stopAnimation) {
        existingCanvas.stopAnimation();
      }
      
      // Clean up
      const canvasContainer = modal.querySelector('.modal-canvas-container');
      if (canvasContainer) canvasContainer.innerHTML = '';
      
      // Show img element again for non-animated use
      const modalImg = document.getElementById('img01');
      if (modalImg) modalImg.style.display = '';
      
      modal.classList.add('hidden');
      document.body.style.overflow = '';
    };

    // Set up button handlers
    if (prevBtn) prevBtn.onclick = goPrev;
    if (nextBtn) nextBtn.onclick = goNext;
    if (closeBtn) closeBtn.onclick = closeModal;
    
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
      if (e.target === modal || e.target.classList.contains('modal-canvas-container')) {
        closeModal();
      }
    };
  }

  // Register an animated element for modal navigation
  function registerAnimatedElement(element, style, seed) {
    const index = allAnimatedElements.length;
    allAnimatedElements.push({ element, style, seed });
    
    // Make clickable
    element.style.cursor = 'pointer';
    element.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      openAnimatedModal(index);
    });
    
    return index;
  }
  
  // Pre-populate with all animation styles for navigation
  function registerAllAnimationStyles() {
    const baseSeed = Date.now();
    
    // Add all dramatic styles
    ANIMATION_STYLES.forEach((style, i) => {
      allAnimatedElements.push({ style, seed: baseSeed + i * 111 });
    });
    
    // Add all subtle styles  
    SUBTLE_STYLES.forEach((style, i) => {
      allAnimatedElements.push({ style, seed: baseSeed + 5000 + i * 111 });
    });
  }

  // Generate slideshow placeholders - ALL ANIMATED with slow transitions and clickable
  function generateSlideshowPlaceholders() {
    const slideshow = document.querySelector('.hero-slideshow');
    if (!slideshow || slideshow.querySelectorAll('.placeholder-generated').length > 0) return;

    const placeholder = slideshow.querySelector('p');
    if (placeholder) placeholder.remove();

    // Create a single animated canvas for the main slideshow
    const animContainer = document.createElement('div');
    animContainer.className = 'placeholder-generated absolute inset-0';
    slideshow.appendChild(animContainer);
    
    // Use a dramatic but slower animation style
    const heroStyles = ['flowingWaves', 'auroraFlow', 'plasmaFlow', 'cosmicDust', 'liquidMetal'];
    const seed = Date.now();
    const style = heroStyles[Math.floor(Math.random() * heroStyles.length)];
    createAnimatedPlaceholder(animContainer, 600, 400, style, seed);
    
    // Register for modal - make clickable
    registerAnimatedElement(animContainer, style, seed);
    
    // Also register all hero styles so user can navigate through them
    heroStyles.forEach((s, i) => {
      if (s !== style) {
        allAnimatedElements.push({ style: s, seed: seed + i * 100 });
      }
    });
    
    // Add style cycling - transition to new style every 20 seconds
    startStyleTransitions(animContainer, 600, 400, heroStyles, 20000);
  }
  
  // Transition between animation styles over time
  function startStyleTransitions(container, width, height, styles, interval) {
    let currentIndex = 0;
    
    setInterval(() => {
      // Fade out current
      const currentCanvas = container.querySelector('canvas');
      if (currentCanvas) {
        currentCanvas.style.transition = 'opacity 2s ease-in-out';
        currentCanvas.style.opacity = '0';
        
        // Remove after fade
        setTimeout(() => {
          if (currentCanvas.stopAnimation) currentCanvas.stopAnimation();
          currentCanvas.remove();
        }, 2000);
      }
      
      // Create new with next style
      currentIndex = (currentIndex + 1) % styles.length;
      const newCanvas = document.createElement('div');
      newCanvas.style.opacity = '0';
      newCanvas.style.transition = 'opacity 2s ease-in-out';
      container.appendChild(newCanvas);
      
      createAnimatedPlaceholder(newCanvas, width, height, styles[currentIndex], Date.now() + currentIndex * 100);
      
      // Fade in
      requestAnimationFrame(() => {
        newCanvas.style.opacity = '1';
      });
    }, interval);
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

  // Generate gallery placeholders - ALL ANIMATED scrolling rows for pages without images
  function generateCarouselPlaceholders() {
    const container = document.querySelector('.gallery-rows');
    if (!container || container.querySelector('.gallery-row')) return;

    const numRows = parseInt(container.dataset.rows) || 3;
    const cardsPerRow = 12;
    const rowHeight = Math.floor(100 / numRows);
    
    // Create animated card
    const createCard = (rowIndex, cardIndex) => {
      const card = document.createElement('div');
      card.className = 'gallery-card placeholder-generated flex-shrink-0 relative overflow-hidden rounded-lg border-2 border-wavgen-purple hover:border-wavgen-yellow shadow-lg cursor-pointer transition-all duration-300 hover:scale-105';
      card.style.cssText = 'width: 75px; height: 60px;';
      
      const globalIndex = rowIndex * cardsPerRow + cardIndex;
      const seed = globalIndex * 73 + 500;
      
      const canvasWrapper = document.createElement('div');
      canvasWrapper.className = 'absolute inset-0';
      const subtleStyle = SUBTLE_STYLES[globalIndex % SUBTLE_STYLES.length];
      createAnimatedPlaceholder(canvasWrapper, 75, 60, subtleStyle, seed);
      card.appendChild(canvasWrapper);
      
      // Register for modal
      registerAnimatedElement(card, subtleStyle, seed);
      
      return card;
    };

    // Create rows with alternating scroll directions
    for (let r = 0; r < numRows; r++) {
      const row = document.createElement('div');
      row.className = 'gallery-row relative overflow-hidden';
      row.style.cssText = `height: ${rowHeight}%; min-height: 50px;`;
      
      const track = document.createElement('div');
      track.className = 'gallery-row-track flex items-center gap-1 h-full';
      track.style.width = 'max-content';
      
      // Add cards twice for seamless loop
      for (let c = 0; c < cardsPerRow; c++) track.appendChild(createCard(r, c));
      for (let c = 0; c < cardsPerRow; c++) track.appendChild(createCard(r, c + 100));
      
      row.appendChild(track);
      container.appendChild(row);
      
      // Start marquee with alternating direction
      startRowMarquee(track, r % 2 === 0 ? 1 : -1, 15 + r * 3);
    }
  }

  // Generate What's New card placeholders - ALL ANIMATED links to actual pages
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

    // Create animated cards twice for seamless looping
    const createAnimatedCard = (item, i, offset = 0) => {
      const card = document.createElement('a');
      card.href = item.href;
      card.className = 'whats-new-card placeholder-generated flex-shrink-0 relative overflow-hidden rounded-xl border-2 border-wavgen-purple hover:border-wavgen-yellow shadow-lg cursor-pointer transition-all duration-300 hover:scale-105 no-underline';
      card.style.cssText = 'height: calc(100% - 8px); aspect-ratio: 1.2;';
      
      // Create animated canvas background container
      const canvasContainer = document.createElement('div');
      canvasContainer.className = 'absolute inset-0';
      
      // Use subtle animation style for cards
      const subtleStyle = SUBTLE_STYLES[i % SUBTLE_STYLES.length];
      createAnimatedPlaceholder(canvasContainer, 150, 120, subtleStyle, i * 53 + 1000 + offset);
      
      // Overlay with text
      const overlay = document.createElement('div');
      overlay.className = 'absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent flex flex-col justify-end p-2 z-10';
      overlay.innerHTML = `
        <span class="text-[10px] text-wavgen-yellow font-medium uppercase tracking-wide">${item.category}</span>
        <span class="text-xs text-white font-bold">${item.title}</span>
      `;
      
      card.appendChild(canvasContainer);
      card.appendChild(overlay);
      return card;
    };

    // Add animated cards twice for seamless loop
    items.forEach((item, i) => track.appendChild(createAnimatedCard(item, i, 0)));
    items.forEach((item, i) => track.appendChild(createAnimatedCard(item, i, 1000)));

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
    createSubtleAnimatedCard,
    createAnimatedHeroBackground,
    generateAnimatedHeroVisual,
    startStyleTransitions,
    openAnimatedModal,
    registerAnimatedElement,
    initPlaceholders,
    ANIMATION_STYLES,
    SUBTLE_STYLES,
    PALETTES,
    allAnimatedElements
  };
})();
