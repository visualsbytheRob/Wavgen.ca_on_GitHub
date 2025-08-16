// Mobile Navigation Functionality
document.addEventListener('DOMContentLoaded', function() {
    const mobileMenuBtn = document.getElementById('mobile-menu-btn');
    const mobileNav = document.getElementById('mobile-nav');
    const mobileNavOverlay = document.getElementById('mobile-nav-overlay');
    const closeMobileNav = document.getElementById('close-mobile-nav');

    // Open mobile navigation
    function openMobileNav() {
        mobileNav.classList.remove('-translate-x-full');
        mobileNavOverlay.classList.remove('hidden');
        document.body.style.overflow = 'hidden';
    }

    // Close mobile navigation
    function closeMobileNavigation() {
        mobileNav.classList.add('-translate-x-full');
        mobileNavOverlay.classList.add('hidden');
        document.body.style.overflow = 'auto';
    }

    // Event listeners
    if (mobileMenuBtn) {
        mobileMenuBtn.addEventListener('click', openMobileNav);
    }

    if (closeMobileNav) {
        closeMobileNav.addEventListener('click', closeMobileNavigation);
    }

    if (mobileNavOverlay) {
        mobileNavOverlay.addEventListener('click', closeMobileNavigation);
    }

    // Close mobile nav when pressing Escape key
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            closeMobileNavigation();
        }
    });

    // Smooth scrolling for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
                // Close mobile nav if open
                closeMobileNavigation();
            }
        });
    });

    // Add scroll effect to header
    let lastScrollTop = 0;
    const header = document.querySelector('header');
    
    window.addEventListener('scroll', function() {
        let scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        
        if (scrollTop > lastScrollTop && scrollTop > 100) {
            // Scrolling down
            header.style.transform = 'translateY(-100%)';
        } else {
            // Scrolling up
            header.style.transform = 'translateY(0)';
        }
        
        lastScrollTop = scrollTop;
    });

    // Add fade-in animation on scroll
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate-fade-in');
            }
        });
    }, observerOptions);

    // Observe elements for animation (fallback if GSAP not present)
    document.querySelectorAll('.section-card').forEach(card => {
        observer.observe(card);
    });

    // If GSAP is available, apply a nicer stagger reveal to section cards on the Home page
    try {
        const reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        const g = window.gsap || gsap;
        if (!reduceMotion && g && typeof g.from === 'function') {
            const cards = document.querySelectorAll('.section-card');
            if (cards.length) {
                g.from(cards, {
                    opacity: 0,
                    y: 16,
                    duration: 0.5,
                    stagger: 0.08,
                    ease: 'power2.out'
                });
            }
        }
    } catch (_) { /* no-op */ }

    // =============================
    // Video Page GSAP Reveals
    // =============================
    (function initVideoPageReveals() {
        const videoHero = document.getElementById('video-hero');
        const videoTech = document.getElementById('video-tech');
        const hasVideoPage = !!(videoHero || videoTech);
        if (!hasVideoPage) return;

        // Try GSAP-driven reveals if available
        let g = null;
        try { g = window.gsap || gsap; } catch (_) { g = null; }
        const reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

        // Hero: reveal title, sub, and description with slight stagger
        if (!reduceMotion && videoHero && g && typeof g.from === 'function') {
            const title = videoHero.querySelector('.video-hero-title');
            const sub = videoHero.querySelector('.video-hero-sub');
            const desc = videoHero.querySelector('.video-hero-desc');
            if (title) g.from(title, { opacity: 0, y: 18, duration: 0.6, ease: 'power2.out' });
            if (sub) g.from(sub, { opacity: 0, y: 16, duration: 0.6, ease: 'power2.out', delay: 0.05 });
            if (desc) g.from(desc, { opacity: 0, y: 14, duration: 0.6, ease: 'power2.out', delay: 0.1 });
        }

        // Tech cards: reveal when the grid scrolls into view
        const videoCards = document.querySelectorAll('#video-tech .video-card');
        if (videoTech && videoCards.length) {
            if (!reduceMotion && g && typeof g.from === 'function' && 'IntersectionObserver' in window) {
                const io = new IntersectionObserver((entries) => {
                    const e = entries[0];
                    if (e && e.isIntersecting) {
                        g.from(videoCards, {
                            opacity: 0,
                            y: 16,
                            duration: 0.5,
                            stagger: 0.08,
                            ease: 'power2.out'
                        });
                        io.disconnect();
                    }
                }, { threshold: 0.15, rootMargin: '0px 0px -10% 0px' });
                io.observe(videoTech);
            } else if (!g) {
                // Fallback: simple fade-in via existing IntersectionObserver
                videoCards.forEach(card => observer.observe(card));
            } else if (reduceMotion) {
                // Respect reduced motion: do not animate; ensure visible
                videoCards.forEach(card => {
                    card.style.opacity = '';
                    card.style.transform = '';
                });
            }
        }
    })();

    // =============================
    // Theme Toggle (with persistence)
    // =============================
    function setTheme(mode) {
        try {
            if (mode === 'dark') {
                document.documentElement.classList.add('dark');
                localStorage.setItem('theme', 'dark');
            } else {
                document.documentElement.classList.remove('dark');
                localStorage.setItem('theme', 'light');
            }
        } catch (e) { /* no-op */ }
    }

    function toggleTheme() {
        const isDark = document.documentElement.classList.contains('dark');
        setTheme(isDark ? 'light' : 'dark');
    }

    const themeToggleMobile = document.getElementById('theme-toggle');
    const themeToggleDesktop = document.getElementById('theme-toggle-desktop');
    if (themeToggleMobile) themeToggleMobile.addEventListener('click', toggleTheme);
    if (themeToggleDesktop) themeToggleDesktop.addEventListener('click', toggleTheme);

    // =============================
    // Command Palette (Ctrl+K)
    // =============================
    const cmdk = document.getElementById('cmdk');
    const cmdkBackdrop = document.getElementById('cmdk-backdrop');
    const cmdkInput = document.getElementById('cmdk-input');
    const cmdkResults = document.getElementById('cmdk-results');
    const cmdkOpen = document.getElementById('cmdk-open');

    // Build an index by scanning navigation links
    function buildIndex() {
        const items = [];
        const selector = 'header nav a, #mobile-nav a';
        document.querySelectorAll(selector).forEach(a => {
            const title = a.textContent.trim();
            const url = a.getAttribute('href');
            if (!url || url.startsWith('#')) return;
            if (!items.find(i => i.url === url)) {
                items.push({ title, url });
            }
        });
        // Add common actions
        items.push({ title: 'Toggle Theme', action: 'toggleTheme' });
        return items;
    }

    let index = buildIndex();

    function openCmdk() {
        if (!cmdk) return;
        cmdk.classList.remove('hidden');
        if (cmdkInput) {
            cmdkInput.value = '';
            renderResults(index);
            setTimeout(() => cmdkInput.focus(), 0);
        }
        document.body.style.overflow = 'hidden';
    }

    function closeCmdk() {
        if (!cmdk) return;
        cmdk.classList.add('hidden');
        document.body.style.overflow = '';
    }

    function renderResults(items) {
        if (!cmdkResults) return;
        cmdkResults.innerHTML = '';
        if (!items.length) {
            const empty = document.createElement('div');
            empty.className = 'px-3 py-2 text-gray-500';
            empty.textContent = 'No results';
            cmdkResults.appendChild(empty);
            return;
        }
        items.forEach((item, idx) => {
            const btn = document.createElement('button');
            btn.className = 'w-full text-left px-3 py-2 rounded hover:bg-black/5 dark:hover:bg-white/10 transition';
            btn.dataset.index = String(idx);
            btn.textContent = item.title + (item.url ? `  — ${item.url}` : '');
            btn.addEventListener('click', () => selectItem(item));
            cmdkResults.appendChild(btn);
        });
        activeIndex = 0;
        highlightActive();
    }

    function selectItem(item) {
        if (item.action === 'toggleTheme') {
            toggleTheme();
            return;
        }
        if (item.url) {
            window.location.href = item.url;
        }
    }

    function filter(q) {
        const qq = q.trim().toLowerCase();
        if (!qq) return index;
        return index.filter(i => (i.title || '').toLowerCase().includes(qq) || (i.url || '').toLowerCase().includes(qq));
    }

    let activeIndex = 0;
    function highlightActive() {
        const children = Array.from(cmdkResults.querySelectorAll('button'));
        children.forEach((el, i) => {
            el.classList.toggle('ring-2', i === activeIndex);
            el.classList.toggle('ring-wavgen-yellow', i === activeIndex);
        });
    }

    function moveActive(delta) {
        const children = Array.from(cmdkResults.querySelectorAll('button'));
        if (!children.length) return;
        activeIndex = (activeIndex + delta + children.length) % children.length;
        highlightActive();
        const el = children[activeIndex];
        el.scrollIntoView({ block: 'nearest' });
    }

    if (cmdkInput) {
        cmdkInput.addEventListener('input', () => {
            renderResults(filter(cmdkInput.value));
        });
        cmdkInput.addEventListener('keydown', (e) => {
            if (e.key === 'ArrowDown') { e.preventDefault(); moveActive(1); }
            else if (e.key === 'ArrowUp') { e.preventDefault(); moveActive(-1); }
            else if (e.key === 'Enter') {
                const items = filter(cmdkInput.value);
                if (items[activeIndex]) selectItem(items[activeIndex]);
            } else if (e.key === 'Escape') { closeCmdk(); }
        });
    }

    if (cmdkBackdrop) cmdkBackdrop.addEventListener('click', closeCmdk);
    if (cmdkOpen) cmdkOpen.addEventListener('click', openCmdk);

    // Global keybinding Ctrl/Cmd+K
    document.addEventListener('keydown', (e) => {
        const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
        if ((isMac && e.metaKey && e.key.toLowerCase() === 'k') || (!isMac && e.ctrlKey && e.key.toLowerCase() === 'k')) {
            e.preventDefault();
            openCmdk();
        }
        if (e.key === 'Escape') {
            closeCmdk();
        }
    });

    // =============================
    // Texture Marquee Auto-Scroll
    // =============================
    (function initMarquee() {
        const carousel = document.querySelector('.marquee-carousel');
        const track = document.querySelector('.marquee-carousel .marquee-track');
        if (!carousel || !track) return;

        let isPaused = false;
        let x = 0; // current translateX
        const speed = 40; // px per second

        // Duplicate children to ensure seamless loop
        const children = Array.from(track.children);
        const containerWidth = carousel.clientWidth;

        // Measure width of original set
        let originalWidth = children.reduce((acc, el) => acc + el.getBoundingClientRect().width + parseFloat(getComputedStyle(el).marginLeft) + parseFloat(getComputedStyle(el).marginRight), 0);

        // Clone until we have at least 2x container width
        while (track.scrollWidth < containerWidth * 2 && children.length) {
            children.forEach(ch => track.appendChild(ch.cloneNode(true)));
        }

        // Recompute after cloning
        originalWidth = children.reduce((acc, el) => acc + el.getBoundingClientRect().width + parseFloat(getComputedStyle(el).marginLeft) + parseFloat(getComputedStyle(el).marginRight), 0);

        let lastTs = performance.now();
        function tick(ts) {
            const dt = (ts - lastTs) / 1000; // seconds
            lastTs = ts;
            if (!isPaused) {
                x -= speed * dt;
                // If we've scrolled past one original set, reset by that width
                if (Math.abs(x) >= originalWidth) {
                    x += originalWidth;
                }
                track.style.transform = `translateX(${x}px)`;
            }
            requestAnimationFrame(tick);
        }
        requestAnimationFrame(tick);

        // Pause on hover/focus
        carousel.addEventListener('mouseenter', () => { isPaused = true; });
        carousel.addEventListener('mouseleave', () => { isPaused = false; });
        carousel.addEventListener('focusin', () => { isPaused = true; });
        carousel.addEventListener('focusout', () => { isPaused = false; });
    })();
});
