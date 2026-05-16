/**
 * ANIMATION PRESETS
 * 
 * Reusable animation patterns for Wavgen.ca
 * All animations are cinematic, respect prefers-reduced-motion, and follow design system
 * 
 * DESIGN PHILOSOPHY:
 * - Entrance: Elements fade in from outside viewport
 * - Exit: Elements fade out toward outside viewport
 * - Hover: Subtle transforms (scale, color shift)
 * - Transition: Between sections (fade, slide)
 * - Reveal: Progressive content reveal (stagger)
 * - Pulse: Continuous, subtle motion (attention)
 * 
 * USAGE:
 *   const presets = new AnimationPresets();
 *   orchestrator.registerAnimation('hero-in', presets.entrance({
 *     duration: 1.2,
 *     easing: 'power3.out'
 *   }));
 */

class AnimationPresets {
  /**
   * Fade in from below (hero sections, cards)
   * CINEMATIC: Fade + subtle upward motion
   */
  static entrance(config = {}) {
    return {
      elements: config.elements || '.animate-fade-in',
      duration: config.duration || 0.8,
      delay: config.delay || 0,
      easing: config.easing || 'power2.out',
      opacity: 0,
      y: config.y || 20,
      stagger: config.stagger || 0.1
    };
  }

  /**
   * Fade out toward below (section exits)
   * CINEMATIC: Fade + downward motion
   */
  static exit(config = {}) {
    return {
      elements: config.elements || '.fade-out',
      duration: config.duration || 0.6,
      delay: config.delay || 0,
      easing: config.easing || 'power2.in',
      opacity: 0,
      y: config.y || 20,
      stagger: config.stagger || 0.05
    };
  }

  /**
   * Hover state: Scale + subtle lift
   * INTERACTIVE: Smooth scale + shadow shift
   */
  static hoverLift(config = {}) {
    return {
      elements: config.elements || '.section-card',
      duration: config.duration || 0.3,
      easing: config.easing || 'power2.out',
      scale: config.scale || 1.03,
      y: config.y || -5
    };
  }

  /**
   * Shine effect: Horizontal sweep with gradient
   * CINEMATIC: Used in CTA buttons, hero highlights
   */
  static shine(config = {}) {
    return {
      elements: config.elements || '.shine',
      duration: config.duration || 1.5,
      delay: config.delay || 0,
      easing: config.easing || 'sine.inOut',
      x: '350%',
      opacity: { 0: 0, 0.5: 1, 1: 0 },
      repeat: config.repeat || -1,
      repeatDelay: config.repeatDelay || 2
    };
  }

  /**
   * Slideshow transition: Crossfade between images
   * GALLERY: Used in hero galleries, image carousels
   */
  static slideTransition(config = {}) {
    return {
      elements: config.elements || '.hero-slide',
      duration: config.duration || 1,
      delay: config.delay || 0,
      easing: config.easing || 'power1.inOut',
      opacity: config.opacity !== undefined ? config.opacity : [1, 0],
      stagger: 0 // No stagger for crossfades
    };
  }

  /**
   * Marquee scroll: Continuous horizontal motion
   * KINETIC: Smooth, infinite scroll
   */
  static marquee(config = {}) {
    return {
      elements: config.elements || '.marquee',
      duration: config.duration || 30,
      delay: 0,
      easing: config.easing || 'none',
      x: config.x || -100,
      repeat: -1,
      modifiers: {
        x: gsap.utils.unitize(x => parseFloat(x) % 500)
      }
    };
  }

  /**
   * Pulse: Subtle breathing effect for attention
   * ATTENTION: Gentle scale pulse
   */
  static pulse(config = {}) {
    return {
      elements: config.elements || '.pulse',
      duration: config.duration || 2,
      delay: config.delay || 0,
      easing: config.easing || 'sine.inOut',
      scale: [1, 1.05, 1],
      repeat: -1
    };
  }

  /**
   * Stagger reveal: Progressive content appearance
   * REVEAL: Each element appears in sequence
   */
  static reveal(config = {}) {
    return {
      elements: config.elements || '.reveal-item',
      duration: config.duration || 0.6,
      delay: config.delay || 0,
      easing: config.easing || 'power2.out',
      opacity: 0,
      y: config.y || 10,
      stagger: config.stagger || 0.15,
      scale: config.scale || 1
    };
  }

  /**
   * Ken Burns effect: Subtle zoom + pan
   * CINEMATIC BACKGROUND: Used in hero backgrounds, image galleries
   */
  static kenBurns(config = {}) {
    return {
      elements: config.elements || '.hero-bg-slide',
      duration: config.duration || 20,
      delay: config.delay || 0,
      easing: config.easing || 'sine.inOut',
      scale: config.scale || 1.1,
      x: config.x || 0,
      y: config.y || 0
    };
  }

  /**
   * Color shift: Smooth color transition
   * ACCENT: Used for hover states, theme changes
   */
  static colorShift(config = {}) {
    return {
      elements: config.elements || '.color-shift',
      duration: config.duration || 0.4,
      easing: config.easing || 'power2.out',
      backgroundColor: config.toColor || '#FEDD00',
      color: config.textColor || '#0f172a'
    };
  }

  /**
   * Fade sequence: Multiple elements fade in with delay
   * TEACHING: Great for content reveals
   */
  static fadeSequence(config = {}) {
    return {
      elements: config.elements || '.fade-in-seq',
      duration: config.duration || 0.8,
      delay: config.delay || 0,
      easing: config.easing || 'power2.out',
      opacity: 0,
      stagger: config.stagger || 0.2
    };
  }

  /**
   * Rotation: Smooth spin animation
   * PLAYFUL: Used for loading states, interactive elements
   */
  static rotate(config = {}) {
    return {
      elements: config.elements || '.rotate',
      duration: config.duration || 2,
      easing: config.easing || 'none',
      rotation: config.rotation || 360,
      repeat: -1,
      transformOrigin: config.origin || '50% 50%'
    };
  }

  /**
   * Bounce: Elastic entrance with overshoot
   * PLAYFUL: Energetic, Apple-like motion
   */
  static bounce(config = {}) {
    return {
      elements: config.elements || '.bounce',
      duration: config.duration || 0.8,
      easing: config.easing || 'back.out',
      opacity: 0,
      scale: 0.8,
      y: config.y || 30
    };
  }

  /**
   * Glass morphism: Blur + opacity fade
   * MODERN: Glassmorphic UI states
   */
  static glassMorphic(config = {}) {
    return {
      elements: config.elements || '.glass',
      duration: config.duration || 0.6,
      easing: config.easing || 'power2.out',
      opacity: config.opacity || 0.9,
      backdropFilter: 'blur(10px)',
      custom: {
        'box-shadow': '0 8px 32px 0 rgba(255, 221, 0, 0.1)'
      }
    };
  }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = AnimationPresets;
}
