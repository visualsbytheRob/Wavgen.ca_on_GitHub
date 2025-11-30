---
title: Gallery Multi-Row System & Site Enhancements
date: 2025-11-30
---

- Gallery: 5 scrolling rows on homepage, 3 on subpages with alternating directions
- Variable animation speeds per row (15s–27s), hybrid real images + generative canvas
- All gallery cards clickable with modal view, 75×60px with wavgen-yellow borders
- Homepage now aggregates images from ALL section folders (art, music, video, data)
- Ken Burns effect slideshow cycles through combined images
- Fixed video player auto-scroll on load (added skipScroll parameter)
- Fixed code playground Monaco Editor stealing focus on page load
- Removed duplicate hero sections from music subpages (ambient, melodic, breaks)
- Removed unnecessary dark overlay divs, consistent 2×2 grid layout

Technical:
- GSAP startRowMarquee() for individual row animations
- Scroll position save/restore pattern for Monaco initialization
