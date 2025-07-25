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
