/**
 * WAVGEN VIDEO PLAYER - REAL YOUTUBE STREAMING INTEGRATION
 * 
 * EDUCATIONAL TEACHING BLOCK:
 * This file demonstrates advanced JavaScript video player architecture with third-party integrations.
 * Key learning concepts covered:
 * - ES6 Class-based component architecture
 * - YouTube iframe API integration with quality optimization
 * - Real-time DOM manipulation and event handling
 * - Responsive video player design patterns
 * - Multi-platform content management
 * - Professional error handling and user experience design
 * 
 * VIDEO PLATFORM INTEGRATION:
 * - YouTube: https://www.youtube.com/channel/UCLK1PORnw7wtArjjhfnA2RQ (primary platform with optimized embeds)
 * - Vimeo: https://vimeo.com/therob (backup platform for alternative hosting)
 * 
 * QUALITY OPTIMIZATION:
 * All YouTube embeds include quality parameters (vq=hd1080&hd=1) to ensure
 * the highest available resolution playback for professional presentation.
 */

// EDUCATIONAL: Video Content Data Management
// This demonstrates how to structure and manage video content data for a multimedia application
// Each video object contains all necessary metadata for display, streaming, and user interaction
const REAL_VIDEOS = [
  // EDUCATIONAL: Video Data Model Structure
  // Each video object demonstrates comprehensive metadata management for video content
  // This pattern scales well for content management systems and video platforms
  {
    id: 1, // Unique identifier for database operations and array management
    title: "Massive – The Waveform Generation", // Display title for UI components
    description: "Official music video for the breakbeat anthem 'Massive' featuring heavy bass and intricate drum programming", // SEO and user-friendly description
    category: "realtime", // Classification for filtering and organization
    duration: "5:52", // Human-readable duration for UI display
    
    // EDUCATIONAL: Multi-Platform URL Management
    // Store both direct video URLs and platform links for user choice
    // This provides flexibility and fallback options for content access
    platforms: {
      youtube: "https://www.youtube.com/watch?v=FrNw6Z3c55U", // Direct YouTube video link
      vimeo: "https://vimeo.com/therob" // Alternative platform for backup access
    },
    
    // EDUCATIONAL: YouTube Embed URL with Quality Optimization
    // This embed URL includes specific parameters for enhanced viewing experience:
    // - vq=hd1080: Request 1080p quality when available
    // - hd=1: Enable HD playback preference
    // - rel=0: Remove related videos at end for cleaner experience
    // - modestbranding=1: Reduce YouTube branding for professional presentation
    embedUrl: "https://www.youtube.com/embed/FrNw6Z3c55U?vq=hd1080&hd=1&rel=0&modestbranding=1",
    poster: "/images/videos/massive-thumb.jpg",
    tags: ["Breaks", "Music Video", "Heavy Bass"],
    releaseDate: "2024",
    projectType: "Music Video",
    tools: ["After Effects", "Ableton Live", "TouchDesigner"]
  },
  {
    id: 2,
    title: "Joy – The Waveform Generation",
    description: "Ambient visual journey accompanying the track 'Joy' - pure bliss captured in sound and vision",
    category: "realtime",
    duration: "7:18",
    platforms: {
      youtube: "https://www.youtube.com/watch?v=zkfQY9ct3yE",
      vimeo: "https://vimeo.com/therob"
    },
    embedUrl: "https://www.youtube.com/embed/zkfQY9ct3yE?vq=hd1080&hd=1&rel=0&modestbranding=1",
    poster: "/images/videos/joy-thumb.jpg",
    tags: ["Ambient", "Visual", "Peaceful"],
    releaseDate: "2024",
    projectType: "Ambient Visual",
    tools: ["TouchDesigner", "After Effects", "Cinema 4D"]
  },
  {
    id: 3,
    title: "Seven – The Waveform Generation",
    description: "Electronic music video featuring dynamic visuals and rhythmic patterns",
    category: "realtime",
    duration: "4:30",
    platforms: {
      youtube: "https://www.youtube.com/watch?v=B-y5r7hWYcM",
      vimeo: "https://vimeo.com/therob"
    },
    embedUrl: "https://www.youtube.com/embed/B-y5r7hWYcM?vq=hd1080&hd=1&rel=0&modestbranding=1",
    poster: "/images/videos/seven-thumb.jpg",
    tags: ["Electronic", "Music Video", "Rhythmic"],
    releaseDate: "2024",
    projectType: "Music Video",
    tools: ["TouchDesigner", "After Effects", "Ableton Live"]
  },
  {
    id: 4,
    title: "ARP! – The Waveform Generation",
    description: "Energetic electronic track with arpeggiator-driven melodies and visual accompaniment",
    category: "realtime",
    duration: "3:45",
    platforms: {
      youtube: "https://www.youtube.com/watch?v=mc3GRkgBps8",
      vimeo: "https://vimeo.com/therob"
    },
    embedUrl: "https://www.youtube.com/embed/mc3GRkgBps8?vq=hd1080&hd=1&rel=0&modestbranding=1",
    poster: "/images/videos/arp-thumb.jpg",
    tags: ["Electronic", "Arpeggiator", "Energetic"],
    releaseDate: "2024",
    projectType: "Music Video",
    tools: ["TouchDesigner", "Ableton Live", "After Effects"]
  },
  {
    id: 5,
    title: "Me and ChatGPT",
    description: "Exploring the creative collaboration between human and AI in music and visual art production",
    category: "editing",
    duration: "6:20",
    platforms: {
      youtube: "https://www.youtube.com/watch?v=LgrsVCnAjMc",
      vimeo: "https://vimeo.com/therob"
    },
    embedUrl: "https://www.youtube.com/embed/LgrsVCnAjMc?vq=hd1080&hd=1&rel=0&modestbranding=1",
    poster: "/images/videos/chatgpt-thumb.jpg",
    tags: ["AI", "Creative Process", "Collaboration"],
    releaseDate: "2024",
    projectType: "Documentary",
    tools: ["ChatGPT", "TouchDesigner", "Video Editing"]
  }
];

class WavgenVideoPlayer {
  constructor() {
    this.videos = REAL_VIDEOS;
    this.currentVideo = null;
    this.currentIndex = 0;
    this.currentCategory = 'all';
    
    this.init();
  }

  init() {
    // Read default category from page container if provided
    const containerEl = document.getElementById('video-player-container');
    const defaultCategory = containerEl && containerEl.dataset ? containerEl.dataset.defaultCategory : null;
    if (defaultCategory) {
      this.currentCategory = defaultCategory;
    }

    this.createPlayerHTML();

    // Ensure the category dropdown reflects the current category
    const categorySelect = document.getElementById('category-select');
    if (categorySelect) {
      categorySelect.value = this.currentCategory;
    }

    this.bindEvents();
    this.renderPlaylist();

    // Load the first video of the current (possibly filtered) set,
    // or gracefully fall back to 'all' if none exist for that category
    const filtered = this.getFilteredVideos();
    if (filtered.length > 0) {
      this.loadVideo(0);
    } else {
      this.currentCategory = 'all';
      if (categorySelect) categorySelect.value = 'all';
      this.renderPlaylist();
      if (this.videos.length > 0) {
        this.loadVideo(0);
      }
    }
  }

  createPlayerHTML() {
    const playerContainer = document.getElementById('video-player-container');
    if (!playerContainer) return;

    playerContainer.innerHTML = `
      <div class="video-player bg-gradient-to-br from-wavgen-dark-purple to-gray-900 rounded-xl border-2 border-wavgen-yellow p-6 shadow-2xl">
        <!-- Player Header -->
        <div class="flex items-center justify-between mb-6">
          <h3 class="text-2xl font-bold text-white">Video Showcase</h3>
          <div class="category-filter">
            <select id="category-select" aria-label="Filter videos by category" class="bg-gray-800 text-white border border-wavgen-yellow rounded px-3 py-1 text-sm">
              <option value="all">All Categories</option>
              <option value="realtime">Real-time</option>
              <option value="mapping">Mapping</option>
              <option value="mixing">Mixing</option>
              <option value="editing">Editing</option>
            </select>
          </div>
        </div>

        <!-- Video Player Container -->
        <div class="video-container bg-black rounded-lg overflow-hidden mb-6 relative">
          <div id="video-embed-container" class="w-full aspect-video">
            <div id="video-placeholder" class="absolute inset-0 bg-gradient-to-br from-purple-900/80 to-gray-900/80 flex items-center justify-center">
              <div class="text-center text-white">
                <svg class="w-20 h-20 mx-auto mb-4 text-wavgen-yellow" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clip-rule="evenodd"></path>
                </svg>
                <h4 class="text-xl font-semibold mb-2">Select a video to watch</h4>
                <p class="text-gray-300">Choose from the playlist below</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Current Video Info -->
        <div class="current-video-info bg-gray-800 rounded-lg p-4 mb-6">
          <div class="flex items-start justify-between">
            <div class="flex-1">
              <h4 id="current-video-title" class="text-white font-semibold text-lg mb-2">Select a video</h4>
              <p id="current-video-description" class="text-gray-400 text-sm mb-3">Choose from the playlist below</p>
              
              <!-- Video Platform Links -->
              <div id="video-platform-links" class="flex flex-wrap gap-2 mb-3">
                <!-- Platform links will be rendered here -->
              </div>
              
              <!-- Video Tags -->
              <div id="current-video-tags" class="flex flex-wrap gap-2 mb-3">
                <!-- Tags will be rendered here -->
              </div>
              
              <!-- Project Details -->
              <div id="project-details" class="text-sm text-gray-400">
                <!-- Project type and tools will be rendered here -->
              </div>
            </div>
            <div class="text-right ml-4">
              <span id="current-video-duration" class="text-wavgen-yellow font-medium">0:00</span>
              <p id="current-video-category" class="text-gray-400 text-xs uppercase tracking-wide mt-1">Category</p>
              <p id="current-release-date" class="text-gray-400 text-xs mt-1">Release Date</p>
            </div>
          </div>
        </div>

        <!-- Player Controls -->
        <div class="player-controls flex items-center justify-center space-x-4 mb-6">
          <button id="prev-video-btn" class="control-btn bg-gray-700 hover:bg-gray-600 text-white p-3 rounded-full transition-colors" aria-label="Previous video">
            <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path d="M8.445 14.832A1 1 0 0010 14v-2.798l5.445 3.63A1 1 0 0017 14V6a1 1 0 00-1.555-.832L10 8.798V6a1 1 0 00-1.555-.832l-6 4a1 1 0 000 1.664l6 4z"></path>
            </svg>
          </button>
          
          <button id="load-video-btn" class="control-btn bg-wavgen-yellow hover:bg-yellow-400 text-black px-6 py-3 rounded-full font-medium transition-colors" aria-label="Load selected video">
            Load Video
          </button>
          
          <button id="next-video-btn" class="control-btn bg-gray-700 hover:bg-gray-600 text-white p-3 rounded-full transition-colors" aria-label="Next video">
            <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path d="M4.555 5.168A1 1 0 003 6v8a1 1 0 001.555.832L10 11.202V14a1 1 0 001.555.832l6-4a1 1 0 000-1.664l-6-4A1 1 0 0010 6v2.798l-5.445-3.63z"></path>
            </svg>
          </button>
          
          <button id="fullscreen-btn" class="control-btn bg-gray-700 hover:bg-gray-600 text-white p-3 rounded-full transition-colors ml-4" aria-label="Toggle fullscreen">
            <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M3 4a1 1 0 011-1h4a1 1 0 010 2H6.414l2.293 2.293a1 1 0 11-1.414 1.414L5 6.414V8a1 1 0 01-2 0V4zm9 1a1 1 0 010-2h4a1 1 0 011 1v4a1 1 0 01-2 0V6.414l-2.293 2.293a1 1 0 11-1.414-1.414L13.586 5H12zm-9 7a1 1 0 012 0v1.586l2.293-2.293a1 1 0 111.414 1.414L6.414 15H8a1 1 0 010 2H4a1 1 0 01-1-1v-4zm13-1a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 010-2h1.586l-2.293-2.293a1 1 0 111.414-1.414L15 13.586V12a1 1 0 011-1z" clip-rule="evenodd"></path>
            </svg>
          </button>
        </div>

        <!-- Video Playlist -->
        <div class="video-playlist">
          <h4 class="text-white font-semibold mb-3">Video Playlist</h4>
          <div id="video-playlist-container" class="grid md:grid-cols-2 gap-4 max-h-96 overflow-y-auto">
            <!-- Playlist items will be rendered here -->
          </div>
        </div>
      </div>
    `;
  }

  bindEvents() {
    // Previous/Next buttons
    document.getElementById('prev-video-btn').addEventListener('click', () => {
      this.previousVideo();
    });

    document.getElementById('next-video-btn').addEventListener('click', () => {
      this.nextVideo();
    });

    // Load video button
    document.getElementById('load-video-btn').addEventListener('click', () => {
      this.loadEmbeddedVideo();
    });

    // Fullscreen button
    document.getElementById('fullscreen-btn').addEventListener('click', () => {
      this.toggleFullscreen();
    });

    // Category filter
    document.getElementById('category-select').addEventListener('change', (e) => {
      this.filterByCategory(e.target.value);
      // Auto-load the first item of the new filtered list (if any)
      const filtered = this.getFilteredVideos();
      if (filtered.length > 0) {
        this.loadVideo(0);
      } else {
        // If selected category has no items, fall back to 'all'
        this.currentCategory = 'all';
        e.target.value = 'all';
        this.renderPlaylist();
        if (this.videos.length > 0) this.loadVideo(0);
      }
    });
  }

  loadVideo(index) {
    const filteredVideos = this.getFilteredVideos();
    if (index >= 0 && index < filteredVideos.length) {
      this.currentVideo = filteredVideos[index];
      this.currentIndex = index;
      
      // Update UI
      document.getElementById('current-video-title').textContent = this.currentVideo.title;
      document.getElementById('current-video-description').textContent = this.currentVideo.description;
      document.getElementById('current-video-duration').textContent = this.currentVideo.duration;
      document.getElementById('current-video-category').textContent = this.currentVideo.category.toUpperCase();
      document.getElementById('current-release-date').textContent = this.currentVideo.releaseDate || 'Release Date';
      
      // Update platform links
      this.updatePlatformLinks();
      
      // Update tags
      const tagsContainer = document.getElementById('current-video-tags');
      tagsContainer.innerHTML = this.currentVideo.tags.map(tag => 
        `<span class="bg-wavgen-purple text-white px-2 py-1 rounded text-xs">${tag}</span>`
      ).join('');
      
      // Update project details
      const detailsContainer = document.getElementById('project-details');
      detailsContainer.innerHTML = `
        <p><strong>Project Type:</strong> ${this.currentVideo.projectType}</p>
        <p><strong>Tools Used:</strong> ${this.currentVideo.tools.join(', ')}</p>
      `;
      
      // Reset video container
      document.getElementById('video-placeholder').style.display = 'flex';
      
      this.updatePlaylistHighlight();
    }
  }

  updatePlatformLinks() {
    const container = document.getElementById('video-platform-links');
    const platforms = this.currentVideo.platforms;
    
    const platformButtons = [];
    
    if (platforms.youtube) {
      platformButtons.push(`
        <a href="${platforms.youtube}" target="_blank" class="platform-btn bg-red-600 hover:bg-red-500 text-white px-3 py-1 rounded text-xs font-medium transition-colors">
          📺 YouTube
        </a>
      `);
    }
    
    if (platforms.vimeo) {
      platformButtons.push(`
        <a href="${platforms.vimeo}" target="_blank" class="platform-btn bg-blue-500 hover:bg-blue-400 text-white px-3 py-1 rounded text-xs font-medium transition-colors">
          🎬 Vimeo
        </a>
      `);
    }
    
    container.innerHTML = platformButtons.join('');
  }

  loadEmbeddedVideo() {
    if (!this.currentVideo || !this.currentVideo.embedUrl) {
      alert('Embedded video not available. Use the platform links above to watch.');
      return;
    }
    
    const container = document.getElementById('video-embed-container');
    const placeholder = document.getElementById('video-placeholder');
    
    // Create iframe for YouTube/Vimeo embed
    container.innerHTML = `
      <iframe 
        width="100%" 
        height="100%" 
        src="${this.currentVideo.embedUrl}"
        title="${this.currentVideo.title}"
        loading="lazy"
        frameborder="0" 
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
        allowfullscreen>
      </iframe>
    `;
    
    placeholder.style.display = 'none';
  }

  toggleFullscreen() {
    const container = document.getElementById('video-embed-container');
    if (container.requestFullscreen) {
      container.requestFullscreen();
    } else if (container.webkitRequestFullscreen) {
      container.webkitRequestFullscreen();
    } else if (container.msRequestFullscreen) {
      container.msRequestFullscreen();
    }
  }

  previousVideo() {
    const filteredVideos = this.getFilteredVideos();
    let newIndex = this.currentIndex - 1;
    if (newIndex < 0) newIndex = filteredVideos.length - 1;
    this.loadVideo(newIndex);
  }

  nextVideo() {
    const filteredVideos = this.getFilteredVideos();
    let newIndex = this.currentIndex + 1;
    if (newIndex >= filteredVideos.length) newIndex = 0;
    this.loadVideo(newIndex);
  }

  filterByCategory(category) {
    this.currentCategory = category;
    this.renderPlaylist();
  }

  getFilteredVideos() {
    if (this.currentCategory === 'all') {
      return this.videos;
    }
    return this.videos.filter(video => video.category === this.currentCategory);
  }

  renderPlaylist() {
    const container = document.getElementById('video-playlist-container');
    const filteredVideos = this.getFilteredVideos();
    
    // Accessibility: identify the playlist as a listbox
    if (container) {
      container.setAttribute('role', 'listbox');
    }

    container.innerHTML = filteredVideos.map((video, index) => `
      <div class="video-playlist-item bg-gray-700 hover:bg-gray-600 rounded-lg p-4 cursor-pointer transition-colors ${
        this.currentVideo && this.currentVideo.id === video.id ? 'ring-2 ring-wavgen-yellow' : ''
      }" data-index="${index}" role="option" tabindex="0" aria-selected="${
        this.currentVideo && this.currentVideo.id === video.id ? 'true' : 'false'
      }">
        <div class="flex items-center space-x-3">
          <div class="video-thumbnail w-20 h-12 bg-gradient-to-br from-wavgen-purple to-wavgen-yellow rounded flex items-center justify-center flex-shrink-0">
            <svg class="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clip-rule="evenodd"></path>
            </svg>
          </div>
          <div class="flex-1 min-w-0">
            <h5 class="text-white font-medium truncate">${video.title}</h5>
            <p class="text-gray-400 text-sm truncate">${video.description}</p>
            <div class="flex items-center justify-between mt-1">
              <span class="text-wavgen-yellow text-xs uppercase">${video.category}</span>
              <span class="text-gray-400 text-xs">${video.duration}</span>
            </div>
            <div class="flex flex-wrap gap-1 mt-1">
              ${video.tags.slice(0, 2).map(tag => `<span class="text-wavgen-yellow text-xs">#${tag}</span>`).join(' ')}
            </div>
          </div>
        </div>
      </div>
    `).join('');

    // Add click events to playlist items
    container.querySelectorAll('.video-playlist-item').forEach((item, index) => {
      item.addEventListener('click', () => {
        this.loadVideo(index);
      });
      // Keyboard accessibility: Enter/Space to activate list item
      item.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          this.loadVideo(index);
        }
      });
    });
  }

  updatePlaylistHighlight() {
    const items = document.querySelectorAll('.video-playlist-item');
    items.forEach((item, index) => {
      if (index === this.currentIndex) {
        item.classList.add('ring-2', 'ring-wavgen-yellow');
        item.setAttribute('aria-selected', 'true');
      } else {
        item.classList.remove('ring-2', 'ring-wavgen-yellow');
        item.setAttribute('aria-selected', 'false');
      }
    });
  }
}

// Initialize the video player when the DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
  if (document.getElementById('video-player-container')) {
    new WavgenVideoPlayer();
  }
});
