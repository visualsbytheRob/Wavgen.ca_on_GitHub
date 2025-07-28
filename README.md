# Wavgen.ca — Creative Technology Portfolio & Teaching Reference

[![Website](https://img.shields.io/badge/Visit-wavgen.ca-blueviolet?style=for-the-badge)](https://wavgen.ca)
[![GitHub Profile](https://img.shields.io/badge/visualsbytheRob-GitHub-black?style=for-the-badge&logo=github)](https://github.com/visualsbytheRob)

---

## 🚀 About This Project

**Wavgen.ca** is a modern, meticulously crafted portfolio and creative technology playground by [Rob McDonald](https://github.com/visualsbytheRob) — a digital pioneer, artist, and developer based in Toronto. This site is more than a showcase: it is a living reference for web development, creative coding, and the intersection of music, art, data, and technology.

- **Fully open-source, Eleventy-powered static site** — fast, accessible, and easy to extend.
- **Comprehensive, beginner-friendly code comments** — every meaningful line and block is explained for learning and onboarding.
- **Professional, creative, and playful design** — purple/yellow theme, satirical "10x Developer Stack™", and unique sections.
- **Responsive, accessible navigation** — desktop dropdowns, mobile hamburger menu, and smooth user experience.
- **Showcases work in Music, Video, Data & Tech, and Art** — each with 4 balanced, thoughtfully designed subsections.
- **Advanced integrations** — ready for AI, cloud, and real-time generative art.

---

## 🏆 Project Highlights

- **Teaching Reference:**
  - Every file is commented to a teaching standard ([see summary](CODEBASE_COMMENTING_SUMMARY.md)).
  - Great for beginners, educators, and anyone learning modern web dev.
- **Creative Portfolio:**
  - Music genres, video art, generative visuals, data science, and more.
  - Satirical and serious content blend for a unique digital presence.
- **Modern Web Stack:**
  - Eleventy (11ty), Nunjucks, Tailwind CSS, Node.js/Express, GitHub Pages.
- **Accessible & Responsive:**
  - Works beautifully on all devices. Keyboard and screen reader friendly.
- **Open to Contributions:**
  - Clear structure, detailed comments, and a welcoming approach for all skill levels.

---

## 🧩 Site Structure & Navigation

- **Main Sections:**
  - **Music:** Electro, Ambient, Melodic, Breaks, Experimental
  - **Video:** Realtime, Mapping, Mixing, Editing
  - **Data & Tech:** Web Dev, Coding, Gen AI, Cloud
  - **Art:** Painting, Drawing, Modelling, Printing
- **Special Features:**
  - "10x Developer Stack™" (Web Dev) — a tongue-in-cheek nod to tech culture
  - "Transcendent Mastery" (Painting) — playful claims of artistic reincarnation
  - "Litho Legacy Evolution" (Printing) — celebrating Canadian lithographic heritage
- **Navigation:**
  - Desktop: 4 main sections with dropdowns
  - Mobile: Compact, scrollable hamburger menu

---

## 🎵🎬 Real Multimedia Streaming Integration

The site features fully functional music and video players with real content streaming:

### 🎵 SoundCloud Music Player
- **10 real tracks** from The Waveform Generation with official SoundCloud iframe embeds
- **Direct streaming** on the site using exact embed codes from SoundCloud's share/embed dialog
- **Genre filtering** (Electro, Ambient, Melodic, Breaks) with responsive playlist UI
- **Multi-platform links** to Bandcamp, Apple Music, and YouTube as backup options
- **Professional error handling** with graceful degradation and helpful user messaging

### 🎬 YouTube Video Player
- **5 real videos** from Rob McDonald's YouTube channel with quality optimization
- **HD-prioritized playback** using YouTube embed parameters (vq=hd1080&hd=1)
- **Clean presentation** with reduced YouTube branding (modestbranding=1)
- **Category filtering** and responsive video playlist interface
- **Fullscreen support** and professional video player controls

### 📚 Educational Code Documentation
- **Comprehensive commenting** on every meaningful line for teaching purposes
- **ES6 class architecture** demonstrating modern JavaScript patterns
- **Third-party API integration** patterns for SoundCloud and YouTube
- **DOM manipulation** and event handling best practices
- **Error handling** and user experience design principles
- **Real-world streaming** integration without placeholder content

---

## 🛠️ Tech Stack

- **Eleventy (11ty)** — static site generator
- **Nunjucks** — templating engine
- **Tailwind CSS** — utility-first styling
- **Node.js** — for development server and build tools
- **Express.js** — local preview and static serving
- **GSAP (GreenSock)** — professional animation library for gallery system
- **Custom JS** — for navigation, animation, and interactivity
- **GitHub Actions** — for CI/CD and deployment

---

## 🎨 GSAP-Powered Gallery System

The site features a sophisticated, fully-commented gallery system built with GSAP animations:

### 🖼️ Hero Slideshow
- **Auto-cycling slideshow** of featured images with smooth GSAP fade transitions
- **Hover-to-pause** functionality for user control
- **Click-to-modal** integration for fullscreen viewing
- **Aspect ratio preservation** using CSS `object-contain` and `aspect-ratio: 4/3`
- **3-second intervals** with power2.inOut easing for professional feel

### 🌟 Hero Background Slideshow
- **Full-section background slideshow** covering the entire hero area with dramatic visual impact
- **Dual slideshow system** — independent hero section background + hero card background
- **High-resolution image cycling** from dedicated backgrounds collection (7 optimized JPEG images)
- **Smart opacity management** — 40% for section background, 100% for card background
- **Enhanced text readability** with strengthened overlay (bg-black/40, shadow-xl, border)
- **Performance optimized** for GitHub Pages with ~100KB images and efficient loading
- **Crystal clear presentation** with blur effects removed for sharp, vibrant visuals
- **Staggered timing** — 4-second intervals for section, 3-second for card to create visual variety

### 🎠 Infinite Marquee Carousel
- **Seamless infinite scroll** using GSAP linear animation at 60px/second
- **Dynamic image duplication** ensures smooth looping regardless of image count
- **Responsive design** adapts to container width with proper image sizing
- **Click-to-modal** integration for any carousel image
- **Visual hierarchy** with yellow container border and purple image borders

### 🔍 Unified Modal Gallery
- **Fullscreen viewing** for all gallery images (slideshow + marquee)
- **GSAP fade/scale animations** for smooth modal transitions
- **Navigation controls** with next/previous buttons and keyboard support
- **Multiple close methods** — close button, Escape key, click outside
- **Optimized sizing** — modal images limited to 50vh height, 60vw width for better navigation
- **Smart indexing** excludes cloned marquee images from navigation

### 🎯 Key Features
- **Comprehensive commenting** — every animation and interaction documented
- **Responsive design** — works seamlessly across all device sizes
- **Performance optimized** — efficient GSAP animations with proper cleanup
- **Accessibility focused** — keyboard controls and screen reader friendly
- **Cross-page consistency** — replicated across index and all art section pages

### 📁 Gallery Files
- **`/js/gallery.js`** — Main gallery system with detailed comments (includes hero background slideshow)
- **`/js/gsap/`** — GSAP core library and plugins
- **`/src/images/images/textures/`** — Source images for carousel
- **`/src/images/images/backgrounds/`** — High-resolution background images for hero slideshow
- **Template integration** — Hero slideshow, background slideshow, and marquee markup in page templates
- **Eleventy collections** — `collections.backgrounds` and `collections.textures` for dynamic image loading

---

## 📚 Code Commenting & Teaching Philosophy

This repo is a model for code clarity:
- **Every meaningful line is commented** in its native style (see [CODEBASE_COMMENTING_SUMMARY.md](CODEBASE_COMMENTING_SUMMARY.md)).
- **Teaching blocks** at the top of each file explain structure and intent.
- **Repeated sections** are commented once in detail, with notes for analogous code.
- **GSAP gallery system** — extensively documented with animation explanations, event handling, and integration notes.
- **No code execution impact** — comments are safe for production.

---

## 🌐 Explore & Connect

- **Visit the live site:** [wavgen.ca](https://wavgen.ca)
- **Read the codebase commenting summary:** [CODEBASE_COMMENTING_SUMMARY.md](CODEBASE_COMMENTING_SUMMARY.md)
- **Browse my GitHub:** [github.com/visualsbytheRob](https://github.com/visualsbytheRob)

---

## ⭐ Explore My Curated Starred Repositories

Looking for inspiration, advanced code, or the best in open-source creative technology? Check out my extensively curated and thoughtfully starred repositories:

[![Explore My Starred Repos](https://img.shields.io/badge/See%20My%20Stars%20%E2%98%85-visualsbytheRob?style=for-the-badge&logo=github)](https://github.com/visualsbytheRob?tab=stars)

> My GitHub Stars are a handpicked collection of groundbreaking, innovative, and useful projects spanning creative coding, generative art, AI/ML, data science, web development, and more. Dive in to discover tools, libraries, and ideas that have shaped my work and can inspire yours.

---

## 🧠 About the Author

Rob McDonald is a creative technologist, musician, and artist based in Toronto, Canada. With a background spanning lithography, generative art, quantum/cloud computing, and decades of web innovation, Rob brings a unique blend of technical mastery and creative vision. This project is both a portfolio and a public learning lab.

---

> *“Here’s to the adventure of exploring the possibilities together.”*

---

**Star, fork, or follow to join the journey!**
Rob McDonald 2025
