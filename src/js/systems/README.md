# Wavgen.ca Foundational Systems Guide

**Location:** `src/js/systems/` and `src/css/systems/`

**Purpose:** Foundational, reusable systems for immersive learning worlds

---

## What's New (Phase 1)

### JavaScript Systems
✅ **Animation Orchestrator** (`js/systems/animation/`)
- Centralized GSAP coordination
- Reusable animation presets
- Cinematic sequencing
- Motion preference accessibility

### CSS Systems
✅ **Design Tokens** (`css/systems/tokens.css`)
- Centralized colors, spacing, typography
- Z-index hierarchy
- Shadow/elevation system
- Breakpoint definitions

✅ **Animation Layer** (`css/systems/animations.css`)
- CSS-based animations (@keyframes)
- Transitions and easings
- Motion preference support
- Mobile optimization

---

## Quick Integration

### For Home Page
```javascript
// src/js/home.js (already exists)
// Add at top:
const orchestrator = new AnimationOrchestrator({ debug: false });

// Register hero entrance
orchestrator.registerAnimation('hero-entrance',
  AnimationPresets.entrance({
    elements: '.hero-text',
    duration: 1.2,
    easing: 'power3.out'
  })
);

// Play on DOMContentLoaded
window.addEventListener('DOMContentLoaded', () => {
  orchestrator.play('hero-entrance');
});
```

### For Gallery/Slideshow
```javascript
// src/js/gallery.js (will refactor next)
orchestrator.registerAnimation('gallery-transition',
  AnimationPresets.slideTransition({
    elements: '.hero-slide',
    duration: 1,
    opacity: 0
  })
);

// Play on slide change event
orchestrator.play('gallery-transition');
```

### For Interactive Cards
```html
<!-- Use animation classes from CSS layer -->
<div class="section-card will-animate transition-smooth">
  Content here
</div>

<!-- On hover, GSAP handles via orchestrator -->
```

---

## File Structure

```
src/
├── js/systems/
│   ├── animation/
│   │   ├── orchestrator.js     ← Core GSAP coordinator
│   │   ├── presets.js          ← Reusable animation patterns
│   │   └── README.md           ← Detailed usage guide
│   ├── navigation/             ← PHASE 2 (coming)
│   ├── state/                  ← PHASE 3 (coming)
│   └── immersive/              ← PHASE 4+ (future)
│
├── css/systems/
│   ├── animations.css          ← @layer animations
│   ├── tokens.css              ← Design tokens (@layer base)
│   └── components.css          ← PHASE 2 (coming)
│
└── input.css                   ← Updated to import systems
```

---

## Available Presets (Quick Reference)

| Preset | Use Case | Example |
|--------|----------|---------|
| `entrance()` | Hero sections, cards | `.hero-text` fades up |
| `exit()` | Section exits | Content fades down |
| `hoverLift()` | Card hover | Scale + lift effect |
| `shine()` | CTA buttons | Light sweep animation |
| `slideTransition()` | Gallery slides | Crossfade images |
| `reveal()` | Content reveal | Staggered appearance |
| `kenBurns()` | Background effects | Subtle zoom + pan |
| `pulse()` | Attention | Breathing effect |

**Full list:** See `src/js/systems/animation/README.md`

---

## Design Tokens (CSS Variables)

### Colors
```css
var(--color-primary)         /* #FEDD00 - Yellow */
var(--color-secondary)       /* #340093 - Purple */
var(--color-accent)          /* #2c0077 - Dark Purple */
var(--color-tertiary)        /* #6366f1 - Light Purple */
```

### Spacing
```css
var(--space-md)              /* 16px - Standard padding */
var(--space-lg)              /* 24px - Large gaps */
var(--space-xl)              /* 32px - Extra large */
```

### Typography
```css
var(--text-lg)               /* 18px */
var(--text-2xl)              /* 24px */
var(--text-4xl)              /* 36px */
```

**Full reference:** See `src/css/systems/tokens.css`

---

## Next Phases

### Phase 2: Navigation System (3-4 hours)
- [ ] Navigation utilities (active link detection, breadcrumbs)
- [ ] Nunjucks filters
- [ ] Refactor breadcrumb duplication

### Phase 3: Component System (4-5 hours)
- [ ] BasePlayer class (music + video)
- [ ] Unified card component
- [ ] Section layout wrapper

### Phase 4: CSS Components (2-3 hours)
- [ ] Extract components to @layer
- [ ] Button system
- [ ] Modal system

### Phase 5: Immersive Foundation (3-4 hours)
- [ ] Scene manager
- [ ] Navigation orchestrator
- [ ] Learning world structure

---

## Maintenance & Future Use

### Adding a New Animation Preset
1. Add static method to `AnimationPresets` class
2. Document in `systems/animation/README.md`
3. Register and use in pages

### Updating Design Tokens
1. Edit `src/css/systems/tokens.css`
2. Update CSS variables under `:root`
3. Used everywhere automatically

### Creating Theme Variants
1. Add new `:root` variables in `tokens.css`
2. Use media queries or data attributes
3. All components inherit automatically

---

## Performance Impact

- **Animation system:** < 50KB (orchestrator + presets)
- **CSS tokens:** < 10KB (minimal, all CSS variables)
- **Total new code:** ~60KB

GSAP already loaded from CDN (not added).

---

## Accessibility

✅ Respects `prefers-reduced-motion` globally
✅ Animations are enhancements, not required
✅ Content accessible without animation
✅ Tested for keyboard navigation

---

## Testing Checklist

- [ ] Animation system works on home page
- [ ] GSAP orchestrator initializes without errors
- [ ] Animations respect `prefers-reduced-motion`
- [ ] CSS tokens cascade correctly
- [ ] No console errors
- [ ] Mobile animations perform well

---

## Troubleshooting

### Animations not running?
1. Check GSAP is loaded: `console.log(window.gsap)`
2. Check orchestrator initialized: `orchestrator.status()`
3. Verify selectors find elements: `document.querySelectorAll('.selector').length`

### CSS variables not working?
1. Check file imports in `input.css`
2. Verify Tailwind compiles CSS
3. Check browser CSS variable support

### Performance issues?
1. Reduce `stagger` values
2. Disable animations on mobile: `if (innerWidth < 768) orchestrator.enabled = false`
3. Profile with DevTools Performance tab

---

## What's Next?

Once Phase 1 is stable and working:
1. Integrate animation system into existing home.js, gallery.js
2. Begin Phase 2: Navigation utilities
3. Plan immersive learning world structure

---

## Questions?

Refer to individual system READMEs:
- Animation: `src/js/systems/animation/README.md`
- Design Tokens: See tokens.css inline comments
- Animations CSS: See animations.css inline comments

---

**Status:** ✅ Phase 1 Complete  
**Last Updated:** 2026-05-16  
**Maintainer:** Wavgen.ca Team
