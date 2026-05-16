# Animation Orchestration System

**Location:** `src/js/systems/animation/`

**Purpose:** Centralized, cinematic animation system for Wavgen.ca using GSAP. Enables synchronized multi-layer effects while respecting user motion preferences.

---

## Architecture

### Files
- **`orchestrator.js`** — Core GSAP coordinator and timeline manager
- **`presets.js`** — Reusable animation patterns (entrance, exit, hover, etc.)
- **`README.md`** — This file

### Design Philosophy
✅ **Cinematic** — Coordinated, multi-layer animations  
✅ **Modular** — Reusable presets across all pages  
✅ **Accessible** — Respects `prefers-reduced-motion`  
✅ **Maintainable** — Centralized logic, no duplication  
✅ **Educational** — Teaching comments throughout  

---

## Quick Start

### 1. Initialize Orchestrator
```javascript
// In main.js or page-specific JS
const orchestrator = new AnimationOrchestrator({ debug: false });
```

### 2. Register Animations Using Presets
```javascript
// Register entrance animation for hero
orchestrator.registerAnimation('hero-entrance', 
  AnimationPresets.entrance({
    elements: '.hero-text',
    duration: 1.2,
    easing: 'power3.out'
  })
);

// Register hover effect for cards
orchestrator.registerAnimation('card-hover',
  AnimationPresets.hoverLift({
    elements: '.section-card',
    duration: 0.3,
    scale: 1.05
  })
);
```

### 3. Play Animations
```javascript
// Play single animation
orchestrator.play('hero-entrance');

// Play sequence
orchestrator.playSequence(['hero-entrance', 'card-reveal', 'shine-pulse']);

// Play with overrides
orchestrator.play('hero-entrance', { duration: 2 });
```

---

## Available Presets

### Entrance/Exit
- **`entrance(config)`** — Fade + upward motion (hero sections, cards)
- **`exit(config)`** — Fade + downward motion (section exits)
- **`reveal(config)`** — Staggered sequential reveal
- **`bounce(config)`** — Elastic entrance with overshoot

### Interactive
- **`hoverLift(config)`** — Scale + lift on hover (cards)
- **`colorShift(config)`** — Smooth color transition (interactive states)
- **`pulse(config)`** — Breathing effect (attention)

### Cinematic
- **`slideTransition(config)`** — Crossfade between images
- **`kenBurns(config)`** — Subtle zoom + pan (hero backgrounds)
- **`shine(config)`** — Horizontal sweep (CTA buttons)
- **`marquee(config)`** — Continuous scroll

### Playful
- **`rotate(config)`** — Smooth spin animation
- **`glassMorphic(config)`** — Blur + opacity fade

---

## Configuration Options

All presets accept a `config` object:

```javascript
{
  elements: '.target',           // CSS selector or NodeList
  duration: 0.8,                 // Animation duration (seconds)
  delay: 0,                      // Delay before start
  easing: 'power2.out',          // GSAP easing function
  stagger: 0.1,                  // Delay between elements (if multiple)
  opacity: 0,                    // Final opacity (varies by preset)
  y: 20,                         // Y-axis movement (pixels)
  x: 0,                          // X-axis movement (pixels)
  scale: 1,                      // Scale factor
  rotation: 0,                   // Rotation (degrees)
  custom: {}                     // Additional GSAP properties
}
```

---

## Usage Patterns

### Pattern 1: Hero Page Entrance
```javascript
// home.js
function initHeroAnimation() {
  const orchestrator = new AnimationOrchestrator();
  
  // Hero text entrance
  orchestrator.registerAnimation('hero-text',
    AnimationPresets.entrance({
      elements: '.hero-text',
      duration: 1,
      easing: 'power3.out'
    })
  );
  
  // CTA button shine
  orchestrator.registerAnimation('hero-shine',
    AnimationPresets.shine({
      elements: '#hero-cta .shine',
      duration: 1.5,
      repeat: 3
    })
  );
  
  // Play sequence when page loads
  window.addEventListener('DOMContentLoaded', () => {
    orchestrator.playSequence(['hero-text', 'hero-shine']);
  });
}
```

### Pattern 2: Gallery Slideshow
```javascript
// gallery.js
function initGalleryTransitions() {
  const orchestrator = new AnimationOrchestrator();
  
  // Register crossfade preset
  orchestrator.registerAnimation('slide-out',
    AnimationPresets.slideTransition({
      elements: '.hero-slide',
      duration: 1,
      opacity: 0
    })
  );
  
  // Play on slide change
  document.addEventListener('slide-change', (e) => {
    orchestrator.play('slide-out');
  });
}
```

### Pattern 3: Card Hover Effects
```javascript
// Hover listeners trigger preset animations
document.querySelectorAll('.section-card').forEach(card => {
  card.addEventListener('mouseenter', () => {
    orchestrator.play('card-hover');
  });
});
```

---

## Motion Preferences

### Automatic Respect
The orchestrator **automatically respects** `prefers-reduced-motion`:

```javascript
// If user has set prefers-reduced-motion: reduce
// All animations disable except opacity/essential transforms
if (orchestrator.enabled === false) {
  // Still layout/appear, just no motion
}
```

### Testing Motion Preferences
```javascript
// Disable animations for testing
orchestrator.enabled = false;

// Re-enable
orchestrator.enabled = true;

// Check status
orchestrator.status();
```

---

## Integration with Existing Code

### Refactoring home.js
```javascript
// BEFORE: Scattered GSAP calls
gsap.to('.shine', { x: '350%', duration: 1.5, repeat: -1 });

// AFTER: Using orchestrator
orchestrator.registerAnimation('shine', AnimationPresets.shine());
orchestrator.play('shine');
```

### Refactoring gallery.js
```javascript
// BEFORE: Complex timeline logic
const tl = gsap.timeline();
tl.to('.hero-slide', { opacity: 0, duration: 1 }, 0);

// AFTER: Using preset
orchestrator.registerAnimation('gallery-transition',
  AnimationPresets.slideTransition()
);
orchestrator.play('gallery-transition');
```

---

## Best Practices

### ✅ Do
- Use presets first; create custom animations only when needed
- Register animations once, play multiple times
- Group related animations into sequences
- Use `orchestrator.debug = true` during development
- Test with `prefers-reduced-motion` enabled

### ❌ Don't
- Call `gsap.to()` directly (use orchestrator instead)
- Create new AnimationOrchestrator for each animation
- Ignore motion preferences
- Use animations for critical content (use CSS fallbacks)

---

## Advanced: Custom Animations

### Create a Custom Animation
```javascript
// Create custom preset
class CustomPresets extends AnimationPresets {
  static wavingMotion(config = {}) {
    return {
      elements: config.elements,
      duration: config.duration || 1,
      rotation: [0, 5, -5, 0],
      transformOrigin: '0% 50%',
      repeat: -1
    };
  }
}

// Use it
orchestrator.registerAnimation('wave',
  CustomPresets.wavingMotion({ elements: '.logo' })
);
```

---

## Troubleshooting

### Animations Not Running
```javascript
// Check if GSAP loaded
orchestrator.status();
// If enabled: false, GSAP not loaded or motion preferences disable it

// Check registered animations
orchestrator.animations // Should show registered names
```

### Elements Not Animating
```javascript
// Verify selector finds elements
document.querySelectorAll('.your-selector').length // Should be > 0

// Debug animation
orchestrator.debug = true;
orchestrator.play('your-animation');
// Check console for logs
```

### Performance Issues
```javascript
// Reduce stagger for many elements
AnimationPresets.reveal({ stagger: 0.05 })

// Disable animations on mobile
if (window.innerWidth < 768) {
  orchestrator.enabled = false;
}

// Use will-change sparingly
// Only on animating elements, not all
```

---

## Future Extensions

### Planned Additions
- [ ] ScrollTrigger integration (scroll-based animations)
- [ ] Parallax factory (background scrolling effects)
- [ ] Animation blending (transition between presets)
- [ ] Analytics tracking (animation performance)
- [ ] Gesture support (swipe, pinch animations)

### Learning Worlds Integration
Once immersive learning worlds are implemented, use:
```javascript
orchestrator.playSequence([
  'world-entrance',
  'module-reveal',
  'interaction-highlights'
]);
```

---

## Performance Metrics

Animation system adds **< 50KB** to bundle (orchestrator + presets).

GSAP already loaded from CDN, so no additional network request.

---

## Summary

The Animation Orchestration System centralizes GSAP usage, enabling:
- ✅ Cinematic, coordinated effects
- ✅ Code reusability across pages
- ✅ Motion preference accessibility
- ✅ Maintainable, teachable architecture
- ✅ Foundation for immersive learning worlds

Start with presets. Create custom animations only when needed.
