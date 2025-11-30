# Wavgen.ca Site Improvements Log

**Last Updated:** November 30, 2025  
**Project:** The Waveform Generation - Personal Creative Portfolio  
**Developer:** Rob McDonald, Toronto, Canada

---

## Overview

This document chronicles the significant improvements made to Wavgen.ca since August 2024. The site has evolved from a basic portfolio into a fully-featured, immersive creative showcase with advanced animations, real content integration, and professional-grade interactive components.

---

## November 2025 - Major Feature Implementation

### Gallery Multi-Row Scrolling System
- **Homepage**: 5 independently scrolling rows of gallery cards
- **Subpages**: 3 independently scrolling rows
- **Alternating scroll directions**: Each row scrolls opposite to adjacent rows for visual interest
- **Variable speeds**: Rows animate at different durations (15s, 18s, 21s, 24s, 27s)
- **Hybrid content**: Mix of real images and generative canvas animations
- **Click-to-modal**: All gallery cards open in full-screen modal view
- **Card sizing**: 75×60px cards with wavgen-yellow borders

### Homepage Image Aggregation
- Homepage now pulls images from ALL section folders:
  - Home images
  - Art section (painting, drawing, modelling, printing)
  - Music section (electro, ambient, melodic, breaks)
  - Video section (realtime, mapping, mixing, editing)
  - Data section (webdev, cloud, genai, coding)
- Ken Burns effect slideshow cycles through aggregated images
- Eleventy collections combine images at build time

### Ken Burns Slideshow Effect
- Smooth zoom and pan animations on hero images
- 5-second intervals between image transitions
- CSS keyframe animation with scale and translate transforms
- Alternates between real images and generative animations

### Hero Section Refinements
- Removed redundant dark overlay divs for cleaner visuals
- Fixed duplicate hero section issues on music subpages (ambient, melodic, breaks)
- Consistent 2×2 grid layout across all pages
- Background slideshow layer with 30% opacity

### Auto-Scroll Prevention
- **Video Player**: Fixed auto-scroll to video player on page load
  - Added `skipScroll` parameter to `loadVideo()` function
  - Initial load no longer scrolls away from hero section
  - Deep links and localStorage restoration also respect scroll position
- **Code Playground**: Fixed Monaco Editor auto-focus scroll
  - Save scroll position before Monaco creation
  - Multiple restore attempts with delays (100ms, 300ms, 500ms)
  - Page stays at hero section on load

---

## October-November 2025 - Content Integration

### Real Music Player Integration
- 10 real SoundCloud tracks from The Waveform Generation
- Removed invalid SoundCloud embed URLs that caused error dialogs
- Platform links to Bandcamp, SoundCloud, Apple Music, YouTube
- Genre filtering (ambient, electro, melodic, breaks)
- Keyboard navigation (J/K for prev/next)

### Real Video Player Integration
- 5 actual YouTube videos from Rob's channel:
  1. Massive – The Waveform Generation
  2. Joy – The Waveform Generation
  3. Seven – The Waveform Generation
  4. ARP! – The Waveform Generation
  5. Me and ChatGPT
- HD quality optimization (vq=hd1080 parameter)
- Category filtering (realtime, mapping, mixing, editing)
- Deep linking support with URL parameters

### Streaming Platform Links
- **Music**: Bandcamp, SoundCloud, Apple Music
- **Video**: YouTube, Vimeo
- Consistent link styling across all players

---

## September-October 2025 - Visual Enhancements

### Hero Background Slideshow
- Created backgrounds folder with 7 optimized JPEG images (~100KB each)
- Dual slideshow system:
  1. Hero section background (full-screen): 40% opacity, 4-second intervals
  2. Hero card background (behind text): 100% opacity, 3-second intervals
- GSAP-powered smooth transitions
- Crystal clear images (removed blur effects)

### Generative Canvas Animations
- Multiple animation styles for placeholder visuals:
  - `auroraFlow` - Northern lights effect
  - `flowingWaves` - Organic wave patterns
  - `cosmicDust` - Particle field animations
  - `neonPulse` - Pulsing neon effects
- Canvas-based rendering for performance
- Unique seeds for variety across cards

### GSAP Marquee Animations
- Smooth infinite scrolling for:
  - Gallery rows (alternating directions)
  - Explore section cards
  - What's New section
  - Subpage navigation links
- Dynamic width calculations for seamless loops
- Performance-optimized with `will-change-transform`

---

## August-September 2024 - Foundation

### Initial Site Architecture
- Eleventy (11ty) static site generator
- Nunjucks templating with component-based design
- Tailwind CSS for styling
- Responsive grid layouts

### Section Structure
- **Music**: Electro, Ambient, Melodic, Breaks subpages
- **Video**: Realtime, Mapping, Mixing, Editing subpages
- **Art**: Painting, Drawing, Modelling, Printing subpages
- **Data**: Coding, GenAI, WebDev, Cloud subpages

### Image Collection System
- Eleventy collections for each section's images
- Automatic image discovery from folder structure
- Lazy loading for performance
- WebP format support

### Interactive Components
- Code Playground with Monaco Editor (VS Code experience)
- Music Player with playlist and controls
- Video Player with YouTube embed optimization
- Modal system for image galleries

---

## Technical Stack

| Technology | Purpose |
|------------|---------|
| Eleventy (11ty) | Static site generation |
| Nunjucks | Templating engine |
| Tailwind CSS | Utility-first styling |
| GSAP | Advanced animations |
| Monaco Editor | Code playground |
| Canvas API | Generative visuals |
| YouTube API | Video embeds |

---

## File Structure Highlights

```
src/
├── _includes/
│   └── components/
│       └── hero.njk          # Shared hero component
├── css/
│   └── style.css             # Custom styles + Ken Burns keyframes
├── js/
│   ├── placeholder-visuals.js # Generative animations + galleries
│   ├── video-player.js       # YouTube integration
│   ├── music-player.js       # SoundCloud integration
│   └── code-playground.js    # Monaco Editor component
├── images/
│   ├── home/                 # Homepage images
│   ├── art/                  # Art section images
│   ├── music/                # Music section images
│   ├── video/                # Video section images
│   └── data/                 # Data section images
└── index.njk                 # Homepage template
```

---

## Performance Optimizations

- **Image optimization**: WebP format, lazy loading, proper sizing
- **Animation performance**: GSAP with hardware acceleration, `will-change` hints
- **Code splitting**: Component-specific JavaScript files
- **Canvas efficiency**: RequestAnimationFrame, optimized render loops
- **Debouncing**: 500ms delay on code playground updates

---

## Accessibility Features

- ARIA labels on interactive elements
- Keyboard navigation for players and galleries
- Screen reader announcements via live regions
- Focus management for modals
- Semantic HTML structure

---

## Future Considerations

- [ ] Add more real images to section folders
- [ ] Implement image upload/management system
- [ ] Add analytics tracking
- [ ] Progressive Web App (PWA) support
- [ ] Dark/light theme toggle
- [ ] Search functionality with Cmd+K palette

---

## Credits

**Design & Development**: Rob McDonald  
**Music & Video Content**: The Waveform Generation  
**Animation Library**: GSAP (GreenSock)  
**Editor**: Monaco Editor (Microsoft)  
**Static Site Generator**: Eleventy  

---

*This document serves as both a changelog and technical reference for the Wavgen.ca project.*
