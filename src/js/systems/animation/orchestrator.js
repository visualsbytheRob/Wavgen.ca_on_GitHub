/**
 * ANIMATION ORCHESTRATOR
 * 
 * Centralized GSAP animation coordinator for Wavgen.ca
 * Provides cinematic timing, sequencing, and motion presets
 * 
 * PURPOSE:
 * - Consolidate scattered GSAP animations into one system
 * - Enable synchronized multi-layer effects (cinematic)
 * - Respect prefers-reduced-motion globally
 * - Provide reusable animation patterns
 * - Support TouchDesigner-inspired modular design
 * 
 * TEACHING NOTES:
 * This is a facade pattern: wraps GSAP to provide a clean, teachable API
 * while centralizing complex animation logic. Keeps individual pages simple.
 * 
 * USAGE:
 *   const orchestrator = new AnimationOrchestrator();
 *   orchestrator.registerAnimation('hero-entrance', heroPreset);
 *   orchestrator.play('hero-entrance');
 *   orchestrator.playSequence(['entrance', 'transition', 'exit']);
 */

class AnimationOrchestrator {
  constructor(options = {}) {
    // Check if GSAP is available
    if (typeof gsap === 'undefined') {
      console.warn('[AnimationOrchestrator] GSAP not loaded. Animations will be disabled.');
      this.enabled = false;
      return;
    }

    this.enabled = !this._prefersReducedMotion();
    this.gsap = gsap;
    this.animations = new Map(); // Store registered animations
    this.timelines = new Map(); // Store active timelines for cleanup
    this.queue = []; // Animation queue for sequencing

    if (options.debug) {
      console.log('[AnimationOrchestrator] Initialized. Motion reduced:', !this.enabled);
    }

    this.debug = options.debug || false;
  }

  /**
   * Register a reusable animation pattern
   * @param {string} name - Animation identifier
   * @param {object} config - Animation configuration (elements, duration, easing, etc.)
   */
  registerAnimation(name, config) {
    if (this.debug) console.log(`[Orchestrator] Registering animation: ${name}`);
    this.animations.set(name, config);
  }

  /**
   * Play a registered animation
   * @param {string} name - Animation name
   * @param {object} overrides - Override settings (e.g., { duration: 2 })
   * @returns {Timeline} GSAP timeline for chaining
   */
  play(name, overrides = {}) {
    if (!this.enabled) return null; // Respect prefers-reduced-motion
    
    const config = this.animations.get(name);
    if (!config) {
      console.warn(`[Orchestrator] Animation not found: ${name}`);
      return null;
    }

    const finalConfig = { ...config, ...overrides };
    const timeline = this._createTimeline(finalConfig);

    if (this.debug) console.log(`[Orchestrator] Playing: ${name}`);

    // Store timeline for cleanup
    this.timelines.set(name, timeline);

    return timeline;
  }

  /**
   * Play animations in sequence
   * @param {array} names - Array of animation names to play in order
   * @returns {Timeline} Master timeline
   */
  playSequence(names) {
    if (!this.enabled) return null;

    const masterTimeline = this.gsap.timeline();

    names.forEach((name, index) => {
      const config = this.animations.get(name);
      if (!config) {
        console.warn(`[Orchestrator] Animation in sequence not found: ${name}`);
        return;
      }

      const timeline = this._createTimeline(config);
      masterTimeline.add(timeline, index === 0 ? 0 : `>-${config.stagger || 0.1}`);
    });

    if (this.debug) console.log(`[Orchestrator] Playing sequence: ${names.join(' → ')}`);

    return masterTimeline;
  }

  /**
   * Internal: Create a timeline from configuration
   * @private
   */
  _createTimeline(config) {
    const {
      elements,
      duration = 0.8,
      delay = 0,
      easing = 'power2.out',
      stagger = 0.1,
      opacity = true,
      y = 0,
      x = 0,
      scale = 1,
      rotation = 0,
      custom = {}
    } = config;

    const timeline = this.gsap.timeline({ delay });

    // Ensure elements is a NodeList or array
    const els = typeof elements === 'string' ? document.querySelectorAll(elements) : elements;

    if (!els || els.length === 0) {
      console.warn('[Orchestrator] No elements found for animation');
      return timeline;
    }

    // Build animation object
    const animProps = { ...custom };
    if (opacity !== undefined) animProps.opacity = opacity;
    if (y !== 0) animProps.y = y;
    if (x !== 0) animProps.x = x;
    if (scale !== 1) animProps.scale = scale;
    if (rotation !== 0) animProps.rotation = rotation;

    // Apply animation with stagger for multiple elements
    timeline.to(els, {
      ...animProps,
      duration,
      ease: easing,
      stagger: els.length > 1 ? stagger : 0
    });

    return timeline;
  }

  /**
   * Pause all active timelines
   */
  pauseAll() {
    this.timelines.forEach(timeline => timeline.pause());
    if (this.debug) console.log('[Orchestrator] Paused all animations');
  }

  /**
   * Resume all active timelines
   */
  resumeAll() {
    this.timelines.forEach(timeline => timeline.play());
    if (this.debug) console.log('[Orchestrator] Resumed all animations');
  }

  /**
   * Clear all registered animations and timelines
   */
  clear() {
    this.timelines.forEach(timeline => timeline.kill());
    this.animations.clear();
    this.timelines.clear();
    if (this.debug) console.log('[Orchestrator] Cleared all animations');
  }

  /**
   * Check if user prefers reduced motion
   * @private
   */
  _prefersReducedMotion() {
    if (typeof window === 'undefined') return false;
    return window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }

  /**
   * Health check: log current state
   */
  status() {
    console.log({
      enabled: this.enabled,
      registered: this.animations.size,
      active: this.timelines.size,
      prefersReducedMotion: this._prefersReducedMotion()
    });
  }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = AnimationOrchestrator;
}
