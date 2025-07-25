/*
 * main.js
 * This script manages the interactive behavior for the Wavgen.ca site, including:
 * - Mobile navigation drawer open/close logic
 * - Overlay handling for mobile navigation
 * - Debug logging for DOM and navigation events
 * All event listeners and functions are initialized after the DOM is loaded.
 * Comments below explain each meaningful line/block for teaching and clarity.
 */

document.addEventListener('DOMContentLoaded', function () {
    // Log to console when the DOM is fully loaded (helps with debugging script timing)
    console.log('[DEBUG] DOM fully loaded');
  
    // Get a reference to the mobile menu button (hamburger icon)
    const mobileMenuBtn = document.getElementById('mobile-menu-btn');
    // Get a reference to the mobile navigation drawer element
    const mobileNav = document.getElementById('mobile-nav');
    // Get a reference to the overlay that covers the page when mobile nav is open
    const mobileNavOverlay = document.getElementById('mobile-nav-overlay');
    // Get a reference to the close button for the mobile navigation drawer
    const closeMobileNav = document.getElementById('close-mobile-nav');
  
    // Log all navigation-related element references for debugging
    console.log('[DEBUG] Element refs:', {
      mobileMenuBtn,
      mobileNav,
      mobileNavOverlay,
      closeMobileNav
    });
  
    // Function to open the mobile navigation drawer
    // This function is called when the burger menu button is clicked
    function openMobileNav() {
      // Log when the openMobileNav function is called
      console.log('[DEBUG] openMobileNav() triggered');
      try {
        // Remove the class that hides the mobile nav drawer (slide-in effect)
        mobileNav.classList.remove('-translate-x-full');
        // Show the overlay behind the navigation drawer
        mobileNavOverlay.classList.remove('hidden');
        // Prevent background page from scrolling while nav is open
        document.body.style.overflow = 'hidden';
        // Also prevent scrolling on the root html element
        document.documentElement.style.overflow = 'hidden';
        // Log that the navigation drawer is now open
        console.log('[DEBUG] Navigation drawer opened');
      } catch (e) {
        // Log the error to the console with details
        console.error('[ERROR] Failed to open nav:', e);
      }
    }
  
    // Function to close the mobile navigation drawer
    // This function is called when the close button or overlay is clicked
    function closeMobileNavigation() {
      // Log when the closeMobileNavigation function is called
      console.log('[DEBUG] closeMobileNavigation() triggered');
      try {
        // Add the class that hides the mobile nav drawer (slide-out effect)
        mobileNav.classList.add('-translate-x-full');
        // Hide the overlay behind the navigation drawer
        mobileNavOverlay.classList.add('hidden');
        // Restore scrolling to the background page
        document.body.style.overflow = '';
        document.documentElement.style.overflow = '';
        // Log that the navigation drawer is now closed
        console.log('[DEBUG] Navigation drawer closed');
      } catch (e) {
        // Log the error to the console with details
        console.error('[ERROR] Failed to close nav:', e);
      }
    }
  
    // Click: Burger Menu Button
    if (mobileMenuBtn) {
      // Add an event listener to the burger menu button
      // When clicked, call the openMobileNav function
      mobileMenuBtn.addEventListener('click', function () {
        console.log('[DEBUG] Burger menu button clicked');
        openMobileNav();
      });
    } else {
      console.warn('[WARN] mobileMenuBtn not found');
    }
  
    // Click: Close Button (X)
    if (closeMobileNav) {
      closeMobileNav.addEventListener('click', function () {
        console.log('[DEBUG] Close button clicked');
        closeMobileNavigation();
      });
    } else {
      console.warn('[WARN] closeMobileNav not found');
    }
  
    // Click: Overlay
    if (mobileNavOverlay) {
      mobileNavOverlay.addEventListener('click', function () {
        console.log('[DEBUG] Overlay clicked');
        closeMobileNavigation();
      });
    } else {
      console.warn('[WARN] mobileNavOverlay not found');
    }
  
    // Escape key
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') {
        console.log('[DEBUG] ESC key pressed');
        closeMobileNavigation();
      }
    });
  
    // Nav link clicks
    document.querySelectorAll('#mobile-nav a').forEach(link => {
      link.addEventListener('click', function () {
        console.log('[DEBUG] Nav link clicked:', this.href);
        closeMobileNavigation();
      });
    });
  
    // Smooth scroll for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener('click', function (e) {
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
          e.preventDefault();
          console.log('[DEBUG] Anchor smooth scroll to:', this.getAttribute('href'));
          target.scrollIntoView({ behavior: 'smooth', block: 'start' });
          closeMobileNavigation();
        }
      });
    });
  
    // Header scroll behavior
    let lastScrollTop = 0;
    const header = document.querySelector('header');
    if (header) {
      window.addEventListener('scroll', function () {
        let scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        if (scrollTop > lastScrollTop && scrollTop > 100) {
          header.style.transform = 'translateY(-100%)';
          console.log('[DEBUG] Header hidden (scrolling down)');
        } else {
          header.style.transform = 'translateY(0)';
          console.log('[DEBUG] Header visible (scrolling up)');
        }
        lastScrollTop = scrollTop;
      });
    } else {
      console.warn('[WARN] Header element not found');
    }
  
    // IntersectionObserver for fade-in
    const observerOptions = {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
    };
  
    const observer = new IntersectionObserver(function (entries) {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          // Log a debug message when the element becomes visible
          console.log('[DEBUG] Element visible for fade-in:', entry.target);
          // Add the 'animate-fade-in' class to the visible element
          entry.target.classList.add('animate-fade-in');
        }
      });
    }, observerOptions);
  
    // For each element with the class 'section-card', attach the Intersection Observer
    // This enables animations or effects when the card enters the viewport (e.g., fade-in)
    document.querySelectorAll('.section-card').forEach(card => {
      // Start observing this card for intersection (visibility) changes
      observer.observe(card);
    });
  });