/**
 * WAVGEN MUSIC PLAYER - REAL SOUNDCLOUD STREAMING INTEGRATION
 * 
 * EDUCATIONAL TEACHING BLOCK:
 * This file demonstrates advanced JavaScript class-based architecture for a multimedia web application.
 * Key learning concepts covered:
 * - ES6 Class structure and constructor patterns
 * - Real-time DOM manipulation and event handling
 * - Third-party API integration (SoundCloud iframe embeds)
 * - Data structure management and filtering
 * - Responsive UI state management
 * - Professional code organization and documentation
 * 
 * STREAMING PLATFORM INTEGRATION:
 * - SoundCloud: https://soundcloud.com/robmcd (primary streaming with iframe embeds)
 * - Bandcamp: https://waveformgeneration.bandcamp.com/ (backup platform link)
 * - Apple Music: https://music.apple.com/us/artist/the-waveform-generation/1322780552 (backup platform link)
 * - YouTube: https://www.youtube.com/channel/UCLK1PORnw7wtArjjhfnA2RQ (backup platform link)
 * 
 * REAL CONTENT INTEGRATION:
 * All 10 tracks use official SoundCloud iframe embed codes copied directly from
 * SoundCloud's share/embed dialog, ensuring authentic streaming experience.
 */

// EDUCATIONAL: Data Structure Import and Management
// This demonstrates how to organize and import real content data in a web application
// In production, this data could come from a CMS, API, or external JSON file
// Here we define it directly for educational clarity and immediate functionality
const REAL_TRACKS = [
  // EDUCATIONAL: Track Data Model Structure
  // Each track object demonstrates a comprehensive data model for multimedia content
  // This pattern can be applied to any content management system or API design
  {
    id: 1, // Unique identifier for database/array operations
    title: "Reel One", // Display title for UI components
    artist: "The Waveform Generation", // Artist name for metadata and display
    genre: "electro", // Genre classification for filtering functionality
    duration: "4:32", // Human-readable duration for UI display
    
    // EDUCATIONAL: Multi-platform URL management
    // Demonstrates how to store multiple streaming platform links
    // Allows users to choose their preferred platform while providing fallbacks
    platforms: {
      bandcamp: "https://waveformgeneration.bandcamp.com/", // Primary sales platform
      soundcloud: "https://soundcloud.com/robmcd/reel-one", // Social streaming platform
      appleMusic: "https://music.apple.com/us/artist/the-waveform-generation/1322780552", // Commercial streaming
      youtube: "https://www.youtube.com/channel/UCLK1PORnw7wtArjjhfnA2RQ" // Video platform backup
    },
    
    // EDUCATIONAL: Official SoundCloud Embed Integration
    // This embedHtml contains the exact iframe code from SoundCloud's share/embed dialog
    // Using official embed codes ensures compatibility and maintains platform features
    // Template literals (backticks) allow multi-line HTML strings without concatenation
    embedHtml: `<iframe width="100%" height="300" scrolling="no" frameborder="no" allow="autoplay" src="https://w.soundcloud.com/player/?url=https%3A//api.soundcloud.com/tracks/2109464157&color=%23ff5500&auto_play=false&hide_related=false&show_comments=true&show_user=true&show_reposts=false&show_teaser=true&visual=true"></iframe>`,
    
    cover: "/images/covers/reel-one-cover.jpg", // Album artwork path for visual display
    description: "Futuristic electro with machine funk and robotic rhythms", // Marketing description
    releaseDate: "2024-01-01", // ISO date format for sorting and display
    tags: ["Electro", "Machine Funk", "Robotic"] // Array of searchable/filterable tags
  },
  {
    id: 2,
    title: "See Through Colours",
    artist: "The Waveform Generation",
    genre: "breaks",
    duration: "5:15",
    platforms: {
      bandcamp: "https://waveformgeneration.bandcamp.com/",
      soundcloud: "https://soundcloud.com/robmcd/seethroughcolours",
      appleMusic: "https://music.apple.com/us/artist/the-waveform-generation/1322780552",
      youtube: "https://www.youtube.com/channel/UCLK1PORnw7wtArjjhfnA2RQ"
    },
    embedHtml: `<iframe width="100%" height="300" scrolling="no" frameborder="no" allow="autoplay" src="https://w.soundcloud.com/player/?url=https%3A//api.soundcloud.com/tracks/2109432474&color=%23ff5500&auto_play=false&hide_related=false&show_comments=true&show_user=true&show_reposts=false&show_teaser=true&visual=true"></iframe>`,
    cover: "/images/covers/see-through-colours-cover.jpg",
    description: "Breakbeat rhythms with chopped-up drum patterns and colorful synths",
    releaseDate: "2024-02-01",
    tags: ["Breaks", "Breakbeat", "Colorful"]
  },
  {
    id: 3,
    title: "DigEmotion",
    artist: "The Waveform Generation",
    genre: "breaks",
    duration: "4:48",
    platforms: {
      bandcamp: "https://waveformgeneration.bandcamp.com/",
      soundcloud: "https://soundcloud.com/robmcd/digemotion",
      appleMusic: "https://music.apple.com/us/artist/the-waveform-generation/1322780552",
      youtube: "https://www.youtube.com/channel/UCLK1PORnw7wtArjjhfnA2RQ"
    },
    embedHtml: `<iframe width="100%" height="300" scrolling="no" frameborder="no" allow="autoplay" src="https://w.soundcloud.com/player/?url=https%3A//api.soundcloud.com/tracks/2108593692&color=%23ff5500&auto_play=false&hide_related=false&show_comments=true&show_user=true&show_reposts=false&show_teaser=true&visual=true"></iframe>`,
    cover: "/images/covers/digemotion-cover.jpg",
    description: "Digital emotion expressed through breakbeat patterns and synthetic textures",
    releaseDate: "2024-03-01",
    tags: ["Breaks", "Digital", "Emotional"]
  },
  {
    id: 4,
    title: "Peach",
    artist: "The Waveform Generation",
    genre: "ambient",
    duration: "6:22",
    platforms: {
      bandcamp: "https://waveformgeneration.bandcamp.com/",
      soundcloud: "https://soundcloud.com/robmcd/peach",
      appleMusic: "https://music.apple.com/us/artist/the-waveform-generation/1322780552",
      youtube: "https://www.youtube.com/channel/UCLK1PORnw7wtArjjhfnA2RQ"
    },
    embedHtml: `<iframe width="100%" height="300" scrolling="no" frameborder="no" allow="autoplay" src="https://w.soundcloud.com/player/?url=https%3A//api.soundcloud.com/tracks/2107665942&color=%23ff5500&auto_play=false&hide_related=false&show_comments=true&show_user=true&show_reposts=false&show_teaser=true&visual=true"></iframe>`,
    cover: "/images/covers/peach-cover.jpg",
    description: "Soft ambient soundscape with warm, peachy tones and atmospheric textures",
    releaseDate: "2024-04-01",
    tags: ["Ambient", "Atmospheric", "Warm"]
  },
  {
    id: 5,
    title: "Circuit Breaker",
    artist: "The Waveform Generation",
    genre: "electro",
    duration: "4:15",
    platforms: {
      bandcamp: "https://waveformgeneration.bandcamp.com/",
      soundcloud: "https://soundcloud.com/robmcd/circuit-breaker",
      appleMusic: "https://music.apple.com/us/artist/the-waveform-generation/1322780552",
      youtube: "https://www.youtube.com/channel/UCLK1PORnw7wtArjjhfnA2RQ"
    },
    embedHtml: `<iframe width="100%" height="300" scrolling="no" frameborder="no" allow="autoplay" src="https://w.soundcloud.com/player/?url=https%3A//api.soundcloud.com/tracks/2106736455&color=%23ff5500&auto_play=false&hide_related=false&show_comments=true&show_user=true&show_reposts=false&show_teaser=true&visual=true"></iframe>`,
    cover: "/images/covers/circuit-breaker-cover.jpg",
    description: "High-energy electro with circuit-bending sounds and glitchy rhythms",
    releaseDate: "2024-05-01",
    tags: ["Electro", "Glitch", "Circuit-bending"]
  },
  {
    id: 6,
    title: "Achieve Satisfaction",
    artist: "The Waveform Generation",
    genre: "electro",
    duration: "5:03",
    platforms: {
      bandcamp: "https://waveformgeneration.bandcamp.com/",
      soundcloud: "https://soundcloud.com/robmcd/achieve-satisfaction",
      appleMusic: "https://music.apple.com/us/artist/the-waveform-generation/1322780552",
      youtube: "https://www.youtube.com/channel/UCLK1PORnw7wtArjjhfnA2RQ"
    },
    embedHtml: `<iframe width="100%" height="300" scrolling="no" frameborder="no" allow="autoplay" src="https://w.soundcloud.com/player/?url=https%3A//api.soundcloud.com/tracks/473621037&color=%23ff5500&auto_play=false&hide_related=false&show_comments=true&show_user=true&show_reposts=false&show_teaser=true&visual=true"></iframe>`,
    cover: "/images/covers/achieve-satisfaction-cover.jpg",
    description: "Driving electro track about reaching goals and finding fulfillment",
    releaseDate: "2024-06-01",
    tags: ["Electro", "Motivational", "Driving"]
  },
  {
    id: 7,
    title: "Study Break",
    artist: "The Waveform Generation",
    genre: "breaks",
    duration: "4:41",
    platforms: {
      bandcamp: "https://waveformgeneration.bandcamp.com/",
      soundcloud: "https://soundcloud.com/robmcd/study-break",
      appleMusic: "https://music.apple.com/us/artist/the-waveform-generation/1322780552",
      youtube: "https://www.youtube.com/channel/UCLK1PORnw7wtArjjhfnA2RQ"
    },
    embedHtml: `<iframe width="100%" height="300" scrolling="no" frameborder="no" allow="autoplay" src="https://w.soundcloud.com/player/?url=https%3A//api.soundcloud.com/tracks/183684144&color=%23ff5500&auto_play=false&hide_related=false&show_comments=true&show_user=true&show_reposts=false&show_teaser=true&visual=true"></iframe>`,
    cover: "/images/covers/study-break-cover.jpg",
    description: "Laid-back breakbeat perfect for taking a break from intense focus",
    releaseDate: "2024-07-01",
    tags: ["Breaks", "Chill", "Study"]
  },
  {
    id: 8,
    title: "Joy",
    artist: "The Waveform Generation",
    genre: "ambient",
    duration: "7:18",
    platforms: {
      bandcamp: "https://waveformgeneration.bandcamp.com/",
      soundcloud: "https://soundcloud.com/robmcd/joy",
      appleMusic: "https://music.apple.com/us/artist/the-waveform-generation/1322780552",
      youtube: "https://www.youtube.com/channel/UCLK1PORnw7wtArjjhfnA2RQ"
    },
    embedHtml: `<iframe width="100%" height="300" scrolling="no" frameborder="no" allow="autoplay" src="https://w.soundcloud.com/player/?url=https%3A//api.soundcloud.com/tracks/180305190&color=%23ff5500&auto_play=false&hide_related=false&show_comments=true&show_user=true&show_reposts=false&show_teaser=true&visual=true"></iframe>`,
    cover: "/images/covers/joy-cover.jpg",
    description: "Pure ambient bliss capturing moments of happiness and contentment",
    releaseDate: "2024-08-01",
    tags: ["Ambient", "Joyful", "Uplifting"]
  },
  {
    id: 9,
    title: "Canadian Kid",
    artist: "The Waveform Generation",
    genre: "electro",
    duration: "4:27",
    platforms: {
      bandcamp: "https://waveformgeneration.bandcamp.com/",
      soundcloud: "https://soundcloud.com/robmcd/canadian-kid",
      appleMusic: "https://music.apple.com/us/artist/the-waveform-generation/1322780552",
      youtube: "https://www.youtube.com/channel/UCLK1PORnw7wtArjjhfnA2RQ"
    },
    embedHtml: `<iframe width="100%" height="300" scrolling="no" frameborder="no" allow="autoplay" src="https://w.soundcloud.com/player/?url=https%3A//api.soundcloud.com/tracks/180297860&color=%23ff5500&auto_play=false&hide_related=false&show_comments=true&show_user=true&show_reposts=false&show_teaser=true&visual=true"></iframe>`,
    cover: "/images/covers/canadian-kid-cover.jpg",
    description: "Electro tribute to Canadian electronic music culture and winter vibes",
    releaseDate: "2024-09-01",
    tags: ["Electro", "Canadian", "Nostalgic"]
  },
  {
    id: 10,
    title: "Massive",
    artist: "The Waveform Generation",
    genre: "breaks",
    duration: "5:52",
    platforms: {
      bandcamp: "https://waveformgeneration.bandcamp.com/",
      soundcloud: "https://soundcloud.com/robmcd/massive",
      appleMusic: "https://music.apple.com/us/artist/the-waveform-generation/1322780552",
      youtube: "https://www.youtube.com/channel/UCLK1PORnw7wtArjjhfnA2RQ"
    },
    embedHtml: `<iframe width="100%" height="300" scrolling="no" frameborder="no" allow="autoplay" src="https://w.soundcloud.com/player/?url=https%3A//api.soundcloud.com/tracks/178139694&color=%23ff5500&auto_play=false&hide_related=false&show_comments=true&show_user=true&show_reposts=false&show_teaser=true&visual=true"></iframe>`,
    cover: "/images/covers/massive-cover.jpg",
    description: "Massive breakbeat anthem with heavy bass and intricate drum programming",
    releaseDate: "2024-10-01",
    tags: ["Breaks", "Massive", "Heavy Bass"]
  }
];

// EDUCATIONAL: ES6 Class Definition for Music Player
// This demonstrates modern JavaScript class syntax and object-oriented programming
// Classes provide a clean way to organize related functionality and maintain state
class WavgenMusicPlayer {
  // EDUCATIONAL: Constructor Method
  // The constructor runs automatically when a new instance is created with 'new WavgenMusicPlayer()'
  // It initializes all the properties (state variables) that the player will need
  constructor() {
    this.tracks = REAL_TRACKS; // Store reference to our track data array
    this.currentTrack = null; // Will hold the currently selected track object
    this.currentIndex = 0; // Array index of the current track (starts at first track)
    this.isPlaying = false; // Boolean flag to track playback state
    this.currentGenre = 'all'; // Filter state for genre-based track filtering
    this.currentEmbedPlayer = null; // Will store reference to active SoundCloud embed
    
    // EDUCATIONAL: Initialization Pattern
    // Call init() at the end of constructor to set up the player
    // This separation allows for clean, organized startup sequence
    this.init();
  }

  // EDUCATIONAL: Initialization Method
  // This method orchestrates the player setup in a logical sequence
  // Breaking initialization into steps makes debugging and maintenance easier
  init() {
    this.createPlayerHTML(); // Build the DOM structure for the player interface
    this.bindEvents(); // Attach event listeners for user interactions
    this.renderPlaylist(); // Generate the track list display
    this.loadTrack(0); // Load the first track as the default selection
  }

  createPlayerHTML() {
    const playerContainer = document.getElementById('music-player-container');
    if (!playerContainer) return;

    playerContainer.innerHTML = `
      <div class="music-player bg-gradient-to-br from-wavgen-dark-purple to-gray-900 rounded-xl border-2 border-wavgen-yellow p-6 shadow-2xl">
        <!-- Player Header -->
        <div class="flex items-center justify-between mb-6">
          <h3 class="text-2xl font-bold text-white">Music Player</h3>
          <div class="genre-filter">
            <select id="genre-select" class="bg-gray-800 text-white border border-wavgen-yellow rounded px-3 py-1 text-sm">
              <option value="all">All Genres</option>
              <option value="electro">Electro</option>
              <option value="ambient">Ambient</option>
              <option value="melodic">Melodic</option>
              <option value="breaks">Breaks</option>
            </select>
          </div>
        </div>

        <!-- Current Track Display -->
        <div class="current-track bg-gray-800 rounded-lg p-4 mb-6">
          <div class="flex items-center space-x-4">
            <div class="track-cover w-16 h-16 bg-gradient-to-br from-wavgen-purple to-wavgen-yellow rounded-lg flex items-center justify-center">
              <svg class="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.217zM15.657 6.343a1 1 0 011.414 0A9.972 9.972 0 0119 12a9.972 9.972 0 01-1.929 5.657 1 1 0 11-1.414-1.414A7.971 7.971 0 0017 12a7.971 7.971 0 00-1.343-4.243 1 1 0 010-1.414z" clip-rule="evenodd"></path>
              </svg>
            </div>
            <div class="flex-1">
              <h4 id="current-title" class="text-white font-semibold">Select a track</h4>
              <p id="current-artist" class="text-gray-400 text-sm">The Waveform Generation</p>
              <p id="current-genre" class="text-wavgen-yellow text-xs uppercase tracking-wide">Genre</p>
            </div>
            <div class="text-right">
              <span id="current-duration" class="text-wavgen-yellow font-medium">0:00</span>
              <p id="current-release-date" class="text-gray-400 text-xs mt-1">Release Date</p>
            </div>
          </div>
          
          <!-- Streaming Platform Links -->
          <div id="streaming-links" class="mt-4 flex flex-wrap gap-2">
            <!-- Platform links will be rendered here -->
          </div>
          
          <!-- Track Description -->
          <div id="track-description" class="mt-3 text-gray-300 text-sm">
            <!-- Track description will be rendered here -->
          </div>
        </div>

        <!-- Embedded Player Container -->
        <div id="embedded-player-container" class="mb-6 hidden">
          <div class="bg-gray-800 rounded-lg p-4">
            <h4 class="text-white font-semibold mb-3">Listen Now</h4>
            <div id="embedded-player" class="w-full">
              <!-- SoundCloud/Bandcamp embed will be loaded here -->
            </div>
          </div>
        </div>

        <!-- Player Controls -->
        <div class="player-controls flex items-center justify-center space-x-4 mb-6">
          <button id="prev-btn" class="control-btn bg-gray-700 hover:bg-gray-600 text-white p-3 rounded-full transition-colors">
            <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path d="M8.445 14.832A1 1 0 0010 14v-2.798l5.445 3.63A1 1 0 0017 14V6a1 1 0 00-1.555-.832L10 8.798V6a1 1 0 00-1.555-.832l-6 4a1 1 0 000 1.664l6 4z"></path>
            </svg>
          </button>
          
          <button id="load-embed-btn" class="control-btn bg-wavgen-yellow hover:bg-yellow-400 text-black px-6 py-3 rounded-full font-medium transition-colors">
            Load Player
          </button>
          
          <button id="next-btn" class="control-btn bg-gray-700 hover:bg-gray-600 text-white p-3 rounded-full transition-colors">
            <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path d="M4.555 5.168A1 1 0 003 6v8a1 1 0 001.555.832L10 11.202V14a1 1 0 001.555.832l6-4a1 1 0 000-1.664l-6-4A1 1 0 0010 6v2.798l-5.445-3.63z"></path>
            </svg>
          </button>
        </div>

        <!-- Playlist -->
        <div class="playlist">
          <h4 class="text-white font-semibold mb-3">Playlist</h4>
          <div id="playlist-container" class="space-y-2 max-h-64 overflow-y-auto">
            <!-- Playlist items will be rendered here -->
          </div>
        </div>
      </div>
    `;
  }

  bindEvents() {
    // Previous/Next buttons
    document.getElementById('prev-btn').addEventListener('click', () => {
      this.previousTrack();
    });

    document.getElementById('next-btn').addEventListener('click', () => {
      this.nextTrack();
    });

    // Load embedded player
    document.getElementById('load-embed-btn').addEventListener('click', () => {
      this.loadEmbeddedPlayer();
    });

    // Genre filter
    document.getElementById('genre-select').addEventListener('change', (e) => {
      this.filterByGenre(e.target.value);
    });
  }

  loadTrack(index) {
    const filteredTracks = this.getFilteredTracks();
    if (index >= 0 && index < filteredTracks.length) {
      this.currentTrack = filteredTracks[index];
      this.currentIndex = index;
      
      // Update UI
      document.getElementById('current-title').textContent = this.currentTrack.title;
      document.getElementById('current-artist').textContent = this.currentTrack.artist;
      document.getElementById('current-genre').textContent = this.currentTrack.genre.toUpperCase();
      document.getElementById('current-duration').textContent = this.currentTrack.duration;
      document.getElementById('current-release-date').textContent = this.currentTrack.releaseDate || 'Release Date';
      
      // Update streaming platform links
      this.updateStreamingLinks();
      
      // Update track description
      document.getElementById('track-description').textContent = this.currentTrack.description || '';
      
      // Hide embedded player until loaded
      document.getElementById('embedded-player-container').classList.add('hidden');
      
      this.updatePlaylistHighlight();
    }
  }

  updateStreamingLinks() {
    const container = document.getElementById('streaming-links');
    const platforms = this.currentTrack.platforms;
    
    const platformButtons = [];
    
    if (platforms.bandcamp) {
      platformButtons.push(`
        <a href="${platforms.bandcamp}" target="_blank" class="platform-btn bg-blue-600 hover:bg-blue-500 text-white px-3 py-1 rounded text-xs font-medium transition-colors">
          🎵 Bandcamp
        </a>
      `);
    }
    
    if (platforms.soundcloud) {
      platformButtons.push(`
        <a href="${platforms.soundcloud}" target="_blank" class="platform-btn bg-orange-500 hover:bg-orange-400 text-white px-3 py-1 rounded text-xs font-medium transition-colors">
          🔊 SoundCloud
        </a>
      `);
    }
    
    if (platforms.appleMusic) {
      platformButtons.push(`
        <a href="${platforms.appleMusic}" target="_blank" class="platform-btn bg-gray-900 hover:bg-gray-800 text-white px-3 py-1 rounded text-xs font-medium transition-colors">
          🍎 Apple Music
        </a>
      `);
    }
    
    if (platforms.youtube) {
      platformButtons.push(`
        <a href="${platforms.youtube}" target="_blank" class="platform-btn bg-red-600 hover:bg-red-500 text-white px-3 py-1 rounded text-xs font-medium transition-colors">
          📺 YouTube
        </a>
      `);
    }
    
    container.innerHTML = platformButtons.join('');
  }

  // EDUCATIONAL: SoundCloud Iframe Embed Integration Method
  // This method demonstrates how to integrate third-party streaming services
  // Key concepts: DOM manipulation, error handling, iframe security, user experience
  loadEmbeddedPlayer() {
    // EDUCATIONAL: DOM Element Selection
    // Get references to the container elements where we'll inject the player
    // Using getElementById is efficient for unique elements
    const container = document.getElementById('embedded-player'); // Inner container for iframe
    const playerContainer = document.getElementById('embedded-player-container'); // Outer container for visibility control
    
    // EDUCATIONAL: Error Handling and Graceful Degradation
    // Always check if required data exists before attempting to use it
    // This prevents JavaScript errors and provides better user experience
    if (!this.currentTrack || !this.currentTrack.embedHtml) {
      // EDUCATIONAL: Fallback UI Pattern
      // When primary functionality isn't available, show helpful alternatives
      // This maintains user engagement and provides alternative paths to content
      container.innerHTML = `
        <div class="bg-gray-800 rounded-lg p-6 text-center">
          <div class="text-wavgen-yellow mb-3">
            <svg class="w-12 h-12 mx-auto" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd"></path>
            </svg>
          </div>
          <h4 class="text-white font-semibold mb-2">Embed Not Available</h4>
          <p class="text-gray-300 mb-4">Use the platform links above to listen on your preferred streaming service:</p>
          <div class="space-y-2">
            <p class="text-sm text-gray-400">🎵 Bandcamp • 🔊 SoundCloud • 🍎 Apple Music • 📺 YouTube</p>
          </div>
        </div>
      `;
      // EDUCATIONAL: CSS Class Manipulation for UI State Management
      // Remove 'hidden' class to make the player container visible
      // This is a common pattern for showing/hiding UI elements
      playerContainer.classList.remove('hidden');
      return; // Exit early when no embed is available
    }
    
    // EDUCATIONAL: Official Third-Party Embed Integration
    // This demonstrates the proper way to integrate official embed codes
    // Using innerHTML with official iframe HTML ensures:
    // - Full platform functionality (play controls, comments, sharing)
    // - Proper security attributes and permissions
    // - Consistent visual design from the platform
    // - Automatic updates when the platform updates their player
    container.innerHTML = this.currentTrack.embedHtml;
    
    // EDUCATIONAL: UI State Management
    // Show the player container now that we have content to display
    // This creates a smooth user experience with content appearing when ready
    playerContainer.classList.remove('hidden');
  }

  previousTrack() {
    const filteredTracks = this.getFilteredTracks();
    let newIndex = this.currentIndex - 1;
    if (newIndex < 0) newIndex = filteredTracks.length - 1;
    this.loadTrack(newIndex);
  }

  nextTrack() {
    const filteredTracks = this.getFilteredTracks();
    let newIndex = this.currentIndex + 1;
    if (newIndex >= filteredTracks.length) newIndex = 0;
    this.loadTrack(newIndex);
  }

  filterByGenre(genre) {
    this.currentGenre = genre;
    this.renderPlaylist();
  }

  getFilteredTracks() {
    if (this.currentGenre === 'all') {
      return this.tracks;
    }
    return this.tracks.filter(track => track.genre === this.currentGenre);
  }

  renderPlaylist() {
    const container = document.getElementById('playlist-container');
    const filteredTracks = this.getFilteredTracks();
    
    container.innerHTML = filteredTracks.map((track, index) => `
      <div class="playlist-item bg-gray-700 hover:bg-gray-600 rounded-lg p-3 cursor-pointer transition-colors ${
        this.currentTrack && this.currentTrack.id === track.id ? 'ring-2 ring-wavgen-yellow' : ''
      }" data-index="${index}">
        <div class="flex items-center justify-between">
          <div class="flex-1">
            <h5 class="text-white font-medium">${track.title}</h5>
            <p class="text-gray-400 text-sm">${track.genre.toUpperCase()} • ${track.duration}</p>
            <div class="flex flex-wrap gap-1 mt-1">
              ${track.tags.map(tag => `<span class="text-wavgen-yellow text-xs">#${tag}</span>`).join(' ')}
            </div>
          </div>
        </div>
      </div>
    `).join('');

    // Add click events to playlist items
    container.querySelectorAll('.playlist-item').forEach((item, index) => {
      item.addEventListener('click', () => {
        this.loadTrack(index);
      });
    });
  }

  updatePlaylistHighlight() {
    const items = document.querySelectorAll('.playlist-item');
    items.forEach((item, index) => {
      if (index === this.currentIndex) {
        item.classList.add('ring-2', 'ring-wavgen-yellow');
      } else {
        item.classList.remove('ring-2', 'ring-wavgen-yellow');
      }
    });
  }
}

// Initialize the music player when the DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
  if (document.getElementById('music-player-container')) {
    new WavgenMusicPlayer();
  }
});
