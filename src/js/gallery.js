/**
 * GSAP-Powered Gallery System for Wavgen.ca
 * 
 * This file implements a comprehensive gallery system with three main components:
 * 1. Hero Slideshow - Cycles through 1.gif and texture images with GSAP fade transitions
 * 2. Infinite Marquee Carousel - Auto-scrolling horizontal display of texture images
 * 3. Unified Modal Gallery - Fullscreen viewing with navigation for all images
 * 
 * Dependencies:
 * - gsap.min.js (core GSAP library)
 * - Eleventy collections.textures (texture image collection)
 * 
 * Features:
 * - Smooth GSAP animations throughout
 * - Responsive design with proper image proportions
 * - Keyboard and mouse controls
 * - Infinite scrolling with seamless loops
 * - Mobile-optimized interactions
 */

document.addEventListener('DOMContentLoaded', function () {
  console.log('[GALLERY] DOM loaded, initializing gallery system...');

  // Enhanced GSAP availability check with detailed logging
  if (!window.gsap) {
    console.error('[GALLERY] GSAP not found! Gallery animations will not work.');
    console.error('[GALLERY] Check that /js/gsap/gsap.min.js is loading correctly.');
    console.error('[GALLERY] Current window.gsap:', window.gsap);
    return;
  }
  console.log('[GALLERY] GSAP detected successfully, version:', gsap.version);
  console.log('[GALLERY] Available GSAP plugins:', {
    ScrollTrigger: !!gsap.ScrollTrigger,
    TextPlugin: !!gsap.TextPlugin,
    Flip: !!gsap.Flip
  });

  /**
   * HERO SLIDESHOW COMPONENT
   * 
   * Creates an auto-cycling slideshow that fades between 1.gif and texture images.
   * Uses GSAP for smooth opacity transitions with power2.inOut easing.
   * 
   * Features:
   * - 3-second intervals between slides
   * - Hover to pause functionality
   * - Click to open modal at current slide
   * - Seamless looping through all images
   */
  const heroSlideshow = document.querySelector('.hero-slideshow');
  if (heroSlideshow && window.gsap) {
    // Get all slide images (1.gif + texture collection)
    const slides = Array.from(heroSlideshow.querySelectorAll('.hero-slide'));
    let currentSlide = 0; // Track which slide is currently visible
    let slideshowInterval; // Store interval ID for pause/resume functionality
    
    /**
     * Show specific slide using GSAP fade transition
     * @param {number} index - Index of slide to show
     */
    function showSlide(index) {
      slides.forEach((slide, i) => {
        // GSAP fade animation: visible slide opacity=1, others opacity=0
        gsap.to(slide, {
          opacity: i === index ? 1 : 0,
          duration: 1, // 1 second fade duration
          ease: 'power2.inOut' // Smooth easing for natural feel
        });
      });
    }
    
    /**
     * Advance to next slide in sequence
     * Uses modulo operator for seamless looping
     */
    function nextSlide() {
      currentSlide = (currentSlide + 1) % slides.length;
      showSlide(currentSlide);
    }
    
    /**
     * Start automatic slideshow with 3-second intervals
     */
    function startSlideshow() {
      slideshowInterval = setInterval(nextSlide, 3000); // 3 seconds between slides
    }
    
    /**
     * Stop automatic slideshow (used for hover pause)
     */
    function stopSlideshow() {
      if (slideshowInterval) clearInterval(slideshowInterval);
    }
    
    // Initialize slideshow
    startSlideshow();
    
    // Pause slideshow on hover for better user control
    heroSlideshow.addEventListener('mouseenter', stopSlideshow);
    heroSlideshow.addEventListener('mouseleave', startSlideshow);
    
    /**
     * Click handler: Open modal showing currently visible slide
     * Integrates with modal system defined later in this file
     */
    heroSlideshow.addEventListener('click', function(e) {
      e.stopPropagation(); // Prevent event bubbling
      // Call global modal function with current slide index
      if (window.showHeroSlideModal) {
        window.showHeroSlideModal(currentSlide);
      }
    });
  }

  /**
   * HERO BACKGROUND SLIDESHOW COMPONENT
   * 
   * Creates a localized background slideshow that runs behind the hero text content.
   * This is part of a dual slideshow system that creates layered visual depth:
   * 1. This slideshow covers only the hero card area (left column)
   * 2. The hero section slideshow (below) covers the entire hero section
   * 
   * Educational Notes:
   * - Demonstrates advanced GSAP animation techniques
   * - Shows how to create independent but coordinated slideshow systems
   * - Illustrates DOM manipulation and event handling patterns
   * - Example of performance-conscious animation with proper cleanup
   * 
   * Features:
   * - Independent timing from main slideshow (3-second intervals)
   * - 100% opacity for full visual impact behind text
   * - Includes both 1.gif and background collection images
   * - Hover pause functionality for better user experience
   * - GSAP power2.inOut easing for professional feel
   */
  // DOM Element Selection and Safety Checks
  // Look for the hero background slideshow container in the DOM
  const heroBgSlideshow = document.querySelector('.hero-bg-slideshow');
  
  // Defensive programming: only initialize if both the container exists AND GSAP is loaded
  // This prevents errors if the slideshow isn't present on a page or GSAP fails to load
  if (heroBgSlideshow && window.gsap) {
    // Collect all slide images within the slideshow container
    // Array.from() converts NodeList to Array for better array methods
    // Includes both 1.gif and all images from collections.backgrounds
    const bgSlides = Array.from(heroBgSlideshow.querySelectorAll('.hero-bg-slide'));
    
    // State management variables for slideshow control
    let currentBgSlide = 0; // Track which background slide is currently visible (0-based index)
    let bgSlideshowInterval; // Store interval ID for pause/resume functionality
    
    /**
     * SHOW SPECIFIC BACKGROUND SLIDE FUNCTION
     * 
     * Core animation function that handles the GSAP fade transitions between slides.
     * Educational concepts demonstrated:
     * - GSAP animation API usage
     * - Array iteration with forEach
     * - Conditional opacity based on active slide
     * - Professional easing curves for smooth animations
     * 
     * @param {number} index - Index of background slide to show (0-based)
     */
    function showBgSlide(index) {
      // Iterate through all slide images and set their opacity
      bgSlides.forEach((slide, i) => {
        // GSAP animation: fade each slide to appropriate opacity
        // Active slide (i === index) gets 100% opacity, others get 0%
        gsap.to(slide, {
          opacity: i === index ? 1.0 : 0, // Ternary operator for conditional opacity
          duration: 1, // 1 second fade duration for smooth transitions
          ease: 'power2.inOut' // Professional easing curve (slow start, fast middle, slow end)
        });
      });
    }
    
    /**
     * ADVANCE TO NEXT SLIDE FUNCTION
     * 
     * Handles the logic for moving to the next slide in sequence.
     * Educational concepts demonstrated:
     * - Modulo operator (%) for circular array navigation
     * - State management with currentBgSlide variable
     * - Function composition (calls showBgSlide)
     */
    function nextBgSlide() {
      // Increment slide index and wrap around using modulo operator
      // Example: if currentBgSlide = 6 and bgSlides.length = 7, then (6 + 1) % 7 = 0
      currentBgSlide = (currentBgSlide + 1) % bgSlides.length;
      
      // Trigger the visual transition to the new slide
      showBgSlide(currentBgSlide);
    }
    
    /**
     * START AUTOMATIC SLIDESHOW FUNCTION
     * 
     * Initializes the automatic slideshow with JavaScript setInterval.
     * Educational concepts demonstrated:
     * - setInterval for recurring function execution
     * - Storing interval ID for later cleanup
     * - 3-second timing different from main slideshow (4-second) for visual variety
     */
    function startBgSlideshow() {
      // setInterval returns an ID that can be used to stop the interval later
      bgSlideshowInterval = setInterval(nextBgSlide, 3000); // 3000ms = 3 seconds
    }
    
    /**
     * STOP AUTOMATIC SLIDESHOW FUNCTION
     * 
     * Stops the automatic slideshow, typically used for hover pause functionality.
     * Educational concepts demonstrated:
     * - clearInterval for stopping recurring execution
     * - Defensive programming with existence check
     * - Proper cleanup to prevent memory leaks
     */
    function stopBgSlideshow() {
      // Only clear interval if one exists (defensive programming)
      if (bgSlideshowInterval) {
        clearInterval(bgSlideshowInterval);
        // Note: We don't set bgSlideshowInterval to null here because
        // startBgSlideshow() will overwrite it anyway
      }
    }
    
    // SLIDESHOW INITIALIZATION
    // Start the automatic slideshow immediately when the page loads
    startBgSlideshow();
    
    // HOVER PAUSE FUNCTIONALITY (OPTIONAL ENHANCEMENT)
    // Add user interaction: pause slideshow when hovering over hero text
    // This improves user experience by allowing them to read without distraction
    const heroContent = document.querySelector('.hero-text');
    if (heroContent) {
      // Event listeners for mouse enter/leave on the hero text element
      // mouseenter: user hovers over text → pause slideshow
      // mouseleave: user moves away from text → resume slideshow
      heroContent.addEventListener('mouseenter', stopBgSlideshow);
      heroContent.addEventListener('mouseleave', startBgSlideshow);
    }
  }

  /**
   * HERO SECTION BACKGROUND SLIDESHOW COMPONENT
   * 
   * Creates a full-section background slideshow covering the entire hero area.
   * This is the first part of the dual slideshow system that creates dramatic visual impact.
   * 
   * Educational Architecture Notes:
   * This component demonstrates advanced web development concepts:
   * - Dual slideshow coordination (section + card backgrounds)
   * - Performance-optimized GSAP animations
   * - Responsive full-screen image handling
   * - Independent timing systems for visual variety
   * - Clean separation of concerns in JavaScript modules
   * 
   * Key Differences from Hero Card Slideshow:
   * - Covers entire hero section (not just text area)
   * - Uses 40% opacity for dramatic but readable effect
   * - 4-second intervals (vs 3-second for card slideshow)
   * - Only uses high-resolution background images (no 1.gif)
   * - No hover pause functionality (runs continuously)
   * 
   * Features:
   * - Full viewport coverage with responsive image scaling
   * - Optimized opacity for text readability
   * - Staggered timing creates layered visual depth
   * - Professional GSAP animations with power2.inOut easing
   * - Defensive programming with existence checks
   */
  
  // DOM ELEMENT SELECTION FOR FULL-SECTION SLIDESHOW
  // Target the hero section background slideshow container
  const heroSectionBgSlideshow = document.querySelector('.hero-section-bg-slideshow');
  
  // INITIALIZATION WITH SAFETY CHECKS
  // Only proceed if both the DOM element exists and GSAP library is loaded
  // This prevents JavaScript errors on pages without the slideshow or if GSAP fails
  if (heroSectionBgSlideshow && window.gsap) {
    
    // COLLECT ALL SECTION BACKGROUND IMAGES
    // Query for all images with the 'hero-section-bg-slide' class
    // These come from the collections.backgrounds Eleventy collection
    const sectionBgSlides = Array.from(heroSectionBgSlideshow.querySelectorAll('.hero-section-bg-slide'));
    
    // STATE MANAGEMENT VARIABLES
    let currentSectionBgSlide = 0; // Track active slide index (0-based)
    let sectionBgSlideshowInterval; // Store setInterval ID for cleanup
    
    /**
     * SECTION BACKGROUND SLIDE DISPLAY FUNCTION
     * 
     * Handles GSAP animations for the full-section background slideshow.
     * 
     * Educational Concepts Demonstrated:
     * - GSAP Timeline-free animations for simple fade effects
     * - Conditional opacity assignment using ternary operators
     * - Professional easing curves for smooth visual transitions
     * - forEach iteration for batch DOM manipulation
     * 
     * Performance Notes:
     * - Uses GSAP's optimized animation engine for smooth 60fps transitions
     * - 40% opacity balances visual impact with text readability
     * - 1-second duration provides smooth but not sluggish transitions
     * 
     * @param {number} index - Zero-based index of slide to show
     */
    function showSectionBgSlide(index) {
      // Iterate through all section background slides
      sectionBgSlides.forEach((slide, i) => {
        // Animate each slide to appropriate opacity using GSAP
        gsap.to(slide, {
          // Conditional opacity: active slide gets 40%, others get 0%
          // 40% provides dramatic visual impact while maintaining text readability
          opacity: i === index ? 0.4 : 0,
          duration: 1, // 1-second smooth transition
          ease: 'power2.inOut' // Professional easing: slow start, fast middle, slow end
        });
      });
    }
    
    /**
     * ADVANCE TO NEXT SECTION SLIDE FUNCTION
     * 
     * Handles progression logic for the section background slideshow.
     * 
     * Educational Concepts:
     * - Modulo arithmetic for circular array navigation
     * - State management with global variables
     * - Function composition and separation of concerns
     */
    function nextSectionBgSlide() {
      // Calculate next slide index with wraparound using modulo operator
      // This ensures seamless looping: when we reach the last slide, we go back to first
      currentSectionBgSlide = (currentSectionBgSlide + 1) % sectionBgSlides.length;
      
      // Trigger the visual transition to the newly calculated slide
      showSectionBgSlide(currentSectionBgSlide);
    }
    
    /**
     * START SECTION SLIDESHOW FUNCTION
     * 
     * Initializes the automatic slideshow with 4-second intervals.
     * 
     * Educational Concepts:
     * - setInterval for recurring function execution
     * - Timing coordination between multiple slideshow systems
     * - Interval ID storage for proper cleanup
     * 
     * Design Decision: 4-second timing
     * - Slightly slower than hero card slideshow (3 seconds)
     * - Creates visual variety and prevents synchronization
     * - Allows users time to appreciate each background image
     */
    function startSectionBgSlideshow() {
      // Store interval ID for potential cleanup later
      // 4000ms = 4 seconds between slide transitions
      sectionBgSlideshowInterval = setInterval(nextSectionBgSlide, 4000);
    }
    
    /**
     * STOP SECTION SLIDESHOW FUNCTION
     * 
     * Stops the automatic slideshow (currently unused but available for future features).
     * 
     * Educational Concepts:
     * - Proper interval cleanup to prevent memory leaks
     * - Defensive programming with existence checks
     * - API design for potential future hover pause functionality
     */
    function stopSectionBgSlideshow() {
      // Only clear if interval exists (defensive programming)
      if (sectionBgSlideshowInterval) {
        clearInterval(sectionBgSlideshowInterval);
      }
    }
    
    // AUTOMATIC INITIALIZATION
    // Start the section background slideshow immediately when page loads
    // No user interaction required - provides immediate visual impact
    startSectionBgSlideshow();
    
    // Note: No hover pause functionality for section slideshow
    // This maintains consistent dramatic background effect
    // Hero card slideshow handles user interaction pause instead
  }

  /**
   * INFINITE MARQUEE CAROUSEL COMPONENT
   * 
   * Creates a continuously scrolling horizontal carousel of texture images.
   * Uses GSAP for smooth linear animation with seamless infinite looping.
   * 
   * Features:
   * - Automatic image duplication for seamless loops
   * - Responsive animation restart on window resize
   * - 60px/second scroll speed with 8-second minimum duration
   * - Hover effects and click-to-modal integration
   */
  const marquee = document.querySelector('.marquee-carousel');
  let marqueeSlides = []; // Store reference to all marquee images
  let anim, resizeTimeout; // GSAP animation and resize debounce timer

  /**
   * Duplicate images if track width is insufficient for seamless looping
   * Ensures track is at least 2x container width for smooth infinite scroll
   * @param {HTMLElement} track - The marquee track container
   * @param {number} minWidth - Minimum required track width
   */
  function duplicateImagesIfNeeded(track, minWidth) {
    let imgs = Array.from(track.querySelectorAll('img'));
    let trackWidth = track.scrollWidth;
    
    // Only duplicate if current track width is less than required minimum
    if (trackWidth < minWidth && imgs.length > 0) {
      let cloneCount = Math.ceil(minWidth / trackWidth); 
      
      // Create clones of all images to fill required width
      for (let i = 0; i < cloneCount; i++) {
        imgs.forEach(img => {
          let clone = img.cloneNode(true);
          clone.setAttribute('data-clone', 'true'); // Mark as clone for modal exclusion
          track.appendChild(clone);
        });
      }
    }
  }

  /**
   * Remove all cloned images from track
   * Used before recalculating layout to prevent duplicate clones
   * @param {HTMLElement} track - The marquee track container
   */
  function clearClones(track) {
    track.querySelectorAll('[data-clone="true"]').forEach(clone => clone.remove());
  }

  /**
   * Start the marquee animation
   * 
   * This function initializes the GSAP animation, ensuring seamless infinite scrolling.
   * It also handles responsive design by restarting the animation on window resize.
   */
  function startMarquee() {
    if (!window.gsap || !marquee) return;
    const track = marquee.querySelector('.marquee-track');
    if (!track) return;
    
    // Clear any existing clones to prevent duplicates
    clearClones(track);
    // Ensure enough images to fill at least 2x container for smooth loop
    duplicateImagesIfNeeded(track, marquee.offsetWidth * 2);
    // Update slides array with all images (including any new clones)
    marqueeSlides = Array.from(track.querySelectorAll('img'));
    
    // Kill any existing animation to prevent conflicts
    if (anim) anim.kill();
    
    // Reset track position to start
    gsap.set(track, { x: 0 });
    
    // Calculate dimensions for animation
    const totalWidth = track.scrollWidth; // Total width of all images
    const visibleWidth = marquee.offsetWidth; // Visible container width
    const distance = totalWidth; // Distance to animate
    
    /**
     * GSAP Infinite Loop Animation
     * 
     * Creates seamless infinite scrolling by:
     * 1. Starting track at right edge (x: visibleWidth)
     * 2. Animating to left edge (x: -distance)
     * 3. Immediately resetting and repeating
     * 
     * Speed: 60px/second with 8-second minimum duration
     */
    function loop() {
      // Position track at right edge to start animation
      gsap.set(track, { x: visibleWidth });
      
      // Animate track from right to left
      anim = gsap.to(track, {
        x: -distance, // Move to left edge
        duration: Math.max(8, distance / 60), // 60px/sec speed, min 8s
        ease: 'linear', // Constant speed for smooth scrolling
        onComplete: loop // Restart animation when complete
      });
    }
    
    // Start the infinite loop
    loop();
  }

  /**
   * Restart marquee animation with debouncing
   * Used for responsive design and image loading events
   */
  function restartMarquee() {
    // Debounce restart to prevent excessive calls during resize
    if (resizeTimeout) clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(startMarquee, 200); // 200ms delay
  }

  // Initialize marquee if container exists
  if (marquee) {
    const track = marquee.querySelector('.marquee-track');
    
    // Restart marquee on window resize for responsive design
    window.addEventListener('resize', restartMarquee);
    
    // Restart marquee when images load (handles slow network connections)
    if (track) {
      Array.from(track.querySelectorAll('img')).forEach(img => {
        img.addEventListener('load', restartMarquee);
      });
    }
    
    // Start initial marquee animation
    startMarquee();
  }

  /**
   * UNIFIED MODAL GALLERY SYSTEM
   * 
   * Provides fullscreen viewing for all gallery images with navigation.
   * Combines hero slideshow and marquee carousel images into one gallery.
   * 
   * Features:
   * - GSAP fade/scale animations for smooth transitions
   * - Keyboard controls (Escape to close, arrow keys for navigation)
   * - Mouse controls (click outside to close, navigation buttons)
   * - Proper image indexing across multiple image sources
   * - Excludes cloned marquee images from navigation
   */
  
  // Get modal DOM elements
  const modal = document.getElementById('myModal');
  const modalImg = document.getElementById('img01');
  const captionText = document.getElementById('caption');
  const span = document.getElementsByClassName('close')[0];
  const prevBtn = document.getElementById('prevBtn');
  const nextBtn = document.getElementById('nextBtn');

  // Collect all gallery images from both slideshow and marquee
  // Note: Excludes cloned marquee images to prevent duplicate navigation
  const heroImages = Array.from(document.querySelectorAll('.hero-slide.gallery-img'));
  const marqueeImages = Array.from(document.querySelectorAll('.marquee-track img')).filter(img => !img.hasAttribute('data-clone'));
  const imgs = [...heroImages, ...marqueeImages]; // Combined image array
  let currentIndex = 0; // Track current image in modal

  /**
   * Display modal with specified image index
   * Includes GSAP fade-in animation for smooth appearance
   * @param {number} index - Index of image to display
   */
  function showModal(index) {
    if (!imgs.length) return;
    
    // Ensure index wraps correctly (handles negative indices)
    currentIndex = (index + imgs.length) % imgs.length;
    
    // Show modal and update content
    modal.style.display = 'block';
    modalImg.src = imgs[currentIndex].src;
    captionText.innerHTML = imgs[currentIndex].alt;
    
    // GSAP entrance animation: fade in with subtle scale effect
    if (window.gsap) {
      gsap.fromTo(modalImg, 
        { opacity: 0, scale: 0.95 }, // Start: invisible and slightly smaller
        { opacity: 1, scale: 1, duration: 0.5 } // End: visible and normal size
      );
    }
  }

  /**
   * Global function for hero slideshow modal integration
   * Called from slideshow click handler to show current slide in modal
   * @param {number} slideIndex - Index of slideshow image to display
   */
  window.showHeroSlideModal = function(slideIndex) {
    showModal(slideIndex);
  };
  
  /**
   * MARQUEE IMAGE CLICK HANDLERS
   * 
   * Add click handlers only to marquee images (hero slideshow has its own handler)
   * Maps marquee image clicks to correct modal index accounting for hero images
   */
  const marqueeImgs = Array.from(document.querySelectorAll('.marquee-track img')).filter(img => !img.hasAttribute('data-clone'));
  marqueeImgs.forEach((img, idx) => {
    img.addEventListener('click', function (e) {
      e.stopPropagation(); // Prevent event bubbling
      // Calculate correct modal index: hero images come first, then marquee images
      showModal(heroImages.length + idx);
    });
  });

  /**
   * MODAL NAVIGATION: NEXT BUTTON
   * 
   * Navigate to next image with GSAP fade transition
   * Wraps to beginning when reaching end of gallery
   */
  if (nextBtn) {
    nextBtn.addEventListener('click', () => {
      if (!imgs.length) return;
      
      // Calculate next index with wrapping
      currentIndex = (currentIndex + 1) % imgs.length;
      
      // GSAP transition: fade out current, then show next
      if (window.gsap) {
        gsap.to(modalImg, { 
          opacity: 0, 
          scale: 0.95, 
          duration: 0.3, 
          onComplete: () => showModal(currentIndex) // Show next image after fade out
        });
      } else {
        showModal(currentIndex); // Fallback without animation
      }
    });
  }

  /**
   * MODAL NAVIGATION: PREVIOUS BUTTON
   * 
   * Navigate to previous image with GSAP fade transition
   * Wraps to end when reaching beginning of gallery
   */
  if (prevBtn) {
    prevBtn.addEventListener('click', () => {
      if (!imgs.length) return;
      
      // Calculate previous index with wrapping (handles negative indices)
      currentIndex = (currentIndex - 1 + imgs.length) % imgs.length;
      
      // GSAP transition: fade out current, then show previous
      if (window.gsap) {
        gsap.to(modalImg, { 
          opacity: 0, 
          scale: 0.95, 
          duration: 0.3, 
          onComplete: () => showModal(currentIndex) // Show previous image after fade out
        });
      } else {
        showModal(currentIndex); // Fallback without animation
      }
    });
  }

  /**
   * MODAL CLOSE BUTTON
   * 
   * Close modal when user clicks the X button
   */
  if (span) {
    span.onclick = function () {
      modal.style.display = 'none';
    };
  }
  /**
   * KEYBOARD CONTROLS: ESCAPE KEY
   * 
   * Close modal when user presses Escape key
   * Provides accessible keyboard navigation
   */
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && modal.style.display === 'block') {
      modal.style.display = 'none';
    }
  });
  
  /**
   * CLICK OUTSIDE TO CLOSE
   * 
   * Close modal when user clicks outside the image area
   * Improves user experience with intuitive close behavior
   */
  if (modal) {
    modal.addEventListener('click', function (e) {
      if (e.target === modal) { // Only close if clicking the modal background, not the image
        modal.style.display = 'none';
      }
    });
  }

  // End of gallery system initialization
});
