document.addEventListener('DOMContentLoaded', function () {
    console.log('[DEBUG] DOM fully loaded');
  
    const mobileMenuBtn = document.getElementById('mobile-menu-btn');
    const mobileNav = document.getElementById('mobile-nav');
    const mobileNavOverlay = document.getElementById('mobile-nav-overlay');
    const closeMobileNav = document.getElementById('close-mobile-nav');
  
    console.log('[DEBUG] Element refs:', {
      mobileMenuBtn,
      mobileNav,
      mobileNavOverlay,
      closeMobileNav
    });
  
    function openMobileNav() {
      console.log('[DEBUG] openMobileNav() triggered');
      try {
        mobileNav.classList.remove('-translate-x-full');
        mobileNavOverlay.classList.remove('hidden');
        document.body.style.overflow = 'hidden';
        document.documentElement.style.overflow = 'hidden';
        console.log('[DEBUG] Navigation drawer opened');
      } catch (e) {
        console.error('[ERROR] Failed to open nav:', e);
      }
    }
  
    function closeMobileNavigation() {
      console.log('[DEBUG] closeMobileNavigation() triggered');
      try {
        mobileNav.classList.add('-translate-x-full');
        mobileNavOverlay.classList.add('hidden');
        document.body.style.overflow = '';
        document.documentElement.style.overflow = '';
        console.log('[DEBUG] Navigation drawer closed');
      } catch (e) {
        console.error('[ERROR] Failed to close nav:', e);
      }
    }
  
    // Click: Burger Menu Button
    if (mobileMenuBtn) {
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
          console.log('[DEBUG] Element visible for fade-in:', entry.target);
          entry.target.classList.add('animate-fade-in');
        }
      });
    }, observerOptions);
  
    document.querySelectorAll('.section-card').forEach(card => {
      observer.observe(card);
    });
  });
  