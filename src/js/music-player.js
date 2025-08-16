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
    genre: "melodic",
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
    this._suppressUrlUpdate = false; // Internal flag to avoid URL updates during initial state apply
    this.selectedYear = 'all'; // Year filter (derived from releaseDate)
    this.selectedTempo = 'all'; // Reserved for future tempo buckets
    this.selectedPreset = 'none'; // Curated playlist presets: focus, driving, deepwork
    this.compact = false; // Compact rendering mode for subpages
    this.forcedGenre = null; // When set, do not override genre from localStorage
    this._autoResetApplied = false; // Prevents infinite reset loops when auto-clearing stale filters
    
    // EDUCATIONAL: Initialization Pattern
    // Call init() at the end of constructor to set up the player
    // This separation allows for clean, organized startup sequence
    this.init();
  }

  // EDUCATIONAL: Initialization Method
  // This method orchestrates the player setup in a logical sequence
  // Breaking initialization into steps makes debugging and maintenance easier
  init() {
    // Read per-page config from container data attributes (if present)
    const containerEl = document.getElementById('music-player-container');
    if (containerEl) {
      const def = containerEl.getAttribute('data-default-genre');
      if (def) {
        this.currentGenre = def;
        this.forcedGenre = def;
      } else {
        // Back-compat: support pages using data-genre
        const legacy = containerEl.getAttribute('data-genre');
        if (legacy) {
          this.currentGenre = legacy;
          this.forcedGenre = legacy;
        }
      }
      this.compact = containerEl.getAttribute('data-compact') === 'true';
    }

    this.createPlayerHTML(); // Build the DOM structure for the player interface
    this.bindEvents(); // Attach event listeners for user interactions
    // Try to apply state from URL (e.g., ?genre=electro&track=5). If not present, fall back to defaults.
    const applied = this.applyURLState();
    if (!applied) {
      // Apply any saved local filters
      this.applyLocalFilters();
      this.renderFiltersUI();
      this.renderPlaylist(); // Generate the track list display
      this.loadTrack(0); // Load the first track as the default selection
    }
  }

  createPlayerHTML() {
    const playerContainer = document.getElementById('music-player-container');
    if (!playerContainer) return;

    const cardPadding = this.compact ? 'p-4' : 'p-6';
    const headerMb = this.compact ? 'mb-4' : 'mb-6';
    const playlistMaxH = this.compact ? 'max-h-48' : 'max-h-64';

    // Build genre options with current selection
    const genreOptions = [
      { value: 'all', label: 'All Genres' },
      { value: 'electro', label: 'Electro' },
      { value: 'ambient', label: 'Ambient' },
      { value: 'melodic', label: 'Melodic' },
      { value: 'breaks', label: 'Breaks' }
    ].map(o => `<option value="${o.value}" ${this.currentGenre===o.value? 'selected':''}>${o.label}</option>`).join('');

    playerContainer.innerHTML = `
      <div class="music-player bg-gradient-to-br from-wavgen-dark-purple to-gray-900 rounded-xl border-2 border-wavgen-yellow ${cardPadding} shadow-2xl">
        <!-- Player Header -->
        <div class="flex items-center justify-between ${headerMb}">
          <h3 class="text-2xl font-bold text-white">Music Player</h3>
          <div class="genre-filter" aria-describedby="playlist-help">
            <select id="genre-select" class="bg-gray-800 text-white border border-wavgen-yellow rounded px-3 py-1 text-sm" aria-label="Filter by genre">${genreOptions}</select>
          </div>
        </div>

        <!-- Quick Filters removed per design simplification -->

        <!-- Current Track Display -->
        <div class="current-track bg-gray-800 rounded-lg p-4 mb-6">
          <div class="flex items-center space-x-4">
            <div class="track-cover w-16 h-16 bg-gradient-to-br from-wavgen-purple to-wavgen-yellow rounded-lg flex items-center justify-center">
              <svg class="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1.555-.832L10 8.798V6a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.217zM15.657 6.343a1 1 0 011.414 0A9.972 9.972 0 0119 12a9.972 9.972 0 01-1.929 5.657 1 1 0 11-1.414-1.414A7.971 7.971 0 0017 12a7.971 7.971 0 00-1.343-4.243 1 1 0 010-1.414z" clip-rule="evenodd"></path>
              </svg>
            </div>
            <div class="flex-1">
              <h4 id="current-title" class="text-white font-semibold">Select a track</h4>
              <p id="current-artist" class="text-gray-400 text-sm">The Waveform Generation</p>
              <p id="current-genre" class="text-wavgen-yellow text-xs uppercase tracking-wide">Genre</p>
              <!-- Mini visualizer bars -->
              <div id="mini-visualizer" class="mt-2 h-3 flex items-end gap-1" aria-hidden="true">
                <span class="block w-1 bg-wavgen-yellow opacity-70" style="height:8px"></span>
                <span class="block w-1 bg-wavgen-yellow opacity-70" style="height:12px"></span>
                <span class="block w-1 bg-wavgen-yellow opacity-70" style="height:6px"></span>
                <span class="block w-1 bg-wavgen-yellow opacity-70" style="height:10px"></span>
                <span class="block w-1 bg-wavgen-yellow opacity-70" style="height:7px"></span>
              </div>
            </div>
            <div class="text-right">
              <span id="current-duration" class="text-wavgen-yellow font-medium">0:00</span>
              <p id="current-release-date" class="text-gray-400 text-xs mt-1">Release Date</p>
            </div>
          </div>
          <!-- Waveform accent bar -->
          <div id="waveform-accent" class="mt-3 h-1 bg-gradient-to-r from-wavgen-yellow via-yellow-300 to-wavgen-yellow rounded overflow-hidden">
            <div class="h-full w-1/4 bg-black/20" aria-hidden="true"></div>
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
        <div class="player-controls flex items-center justify-center flex-wrap gap-3 mb-2">
          <button id="prev-btn" class="control-btn bg-gray-700 hover:bg-gray-600 text-white p-3 rounded-full transition-colors">
            <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path d="M8.445 14.832A1 1 0 0110 14v-2.798l5.445 3.63A1 1 0 0117 14V6a1 1 0 00-1.555-.832L10 8.798V6a1 1 0 00-1.555-.832l-6 4a1 1 0 000 1.664l6 4z"></path>
            </svg>
          </button>
          
          <button id="load-embed-btn" class="control-btn bg-wavgen-yellow hover:bg-yellow-400 text-black px-6 py-3 rounded-full font-medium transition-colors">
            Load Player
          </button>
          
          <button id="copy-link-btn" class="control-btn bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-full transition-colors">
            Copy Link
          </button>
          
          <button id="next-btn" class="control-btn bg-gray-700 hover:bg-gray-600 text-white p-3 rounded-full transition-colors">
            <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path d="M4.555 5.168A1 1 0 003 6v8a1 1 0 001.555.832L10 11.202V14a1 1 0 001.555.832l6-4a1 1 0 000-1.664l-6-4A1 1 0 0010 6v2.798l-5.445-3.63z"></path>
            </svg>
          </button>
          
          <button id="toggle-help-btn" class="ml-2 text-xs text-gray-300 hover:text-white underline underline-offset-2" aria-controls="shortcut-help" aria-expanded="false">? Shortcuts</button>
        </div>
        <div id="shortcut-help" class="hidden mb-6 bg-gray-800/70 rounded-lg p-3 text-sm text-gray-200">
          <div class="flex flex-wrap gap-x-6 gap-y-2">
            <div><span class="font-semibold text-white">j / ↓</span> Next</div>
            <div><span class="font-semibold text-white">k / ↑</span> Previous</div>
            <div><span class="font-semibold text-white">Enter</span> Load Player</div>
            <div><span class="font-semibold text-white">g</span> Focus Genre</div>
            <div><span class="font-semibold text-white">1–4</span> Electro/Ambient/Melodic/Breaks</div>
            <div><span class="font-semibold text-white">/</span> Toggle Keyboard Map</div>
          </div>
        </div>

        <!-- Keyboard Map Overlay -->
        <div id="keyboard-map" class="hidden mb-6 bg-gray-900/80 rounded-lg p-4 text-sm text-gray-200 border border-gray-700" role="dialog" aria-labelledby="kbd-title" aria-modal="false">
          <div id="kbd-title" class="font-semibold text-white mb-2">Keyboard Map</div>
          <ul class="grid sm:grid-cols-2 gap-2 list-disc pl-5">
            <li>j / ↓: Next track</li>
            <li>k / ↑: Previous track</li>
            <li>Enter: Load Player</li>
            <li>g: Focus Genre</li>
            <li>1–4: Electro/Ambient/Melodic/Breaks</li>
          </ul>
        </div>

        <!-- Playlist -->
        <div class="playlist">
          <h4 class="text-white font-semibold mb-3">Playlist</h4>
          <div class="mb-2">
            <div class="text-xs text-gray-300" id="playlist-help">Use arrow keys and Enter.</div>
          </div>
          <div id="playlist-container" class="space-y-2 ${playlistMaxH} overflow-y-auto" role="listbox" aria-label="Track list" aria-describedby="playlist-help">
          <!-- Playlist items will be rendered here -->
        </div>
      </div>
      </div>
      
      <!-- Sticky Mini Player (appears when main player scrolled off-screen) -->
      <div id="mini-player" class="hidden fixed bottom-4 right-4 z-40 bg-gray-900/90 backdrop-blur border border-wavgen-yellow rounded-xl shadow-xl px-4 py-3 flex items-center gap-3">
        <button id="mini-prev" class="control-btn bg-gray-700 hover:bg-gray-600 text-white p-2 rounded-full" title="Previous (k)">
          <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M8.445 14.832A1 1 0 0010 14v-2.798l5.445 3.63A1 1 0 0017 14V6a1 1 0 00-1.555-.832L10 8.798V6a1 1 0 00-1.555-.832l-6 4a1 1 0 000 1.664l6 4z"></path></svg>
        </button>
        <div class="min-w-[160px] max-w-[260px] text-xs text-white truncate">
          <span id="mini-title" class="font-semibold">Track</span>
          <span class="text-gray-400">—</span>
          <span id="mini-artist" class="text-gray-300">Artist</span>
        </div>
        <button id="mini-load" class="control-btn bg-wavgen-yellow hover:bg-yellow-400 text-black px-3 py-1 rounded-full text-xs font-medium" title="Load Player (Enter)">Listen</button>
        <button id="mini-next" class="control-btn bg-gray-700 hover:bg-gray-600 text-white p-2 rounded-full" title="Next (j)">
          <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M4.555 5.168A1 1 0 003 6v8a1 1 0 001.555.832L10 11.202V14a1 1 0 001.555.832l6-4a1 1 0 000-1.664l-6-4A1 1 0 0010 6v2.798l-5.445-3.63z"></path></svg>
        </button>
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

    // Copy sharable link to clipboard (uses current URL state)
    document.getElementById('copy-link-btn').addEventListener('click', async () => {
      try {
        this.updateURL();
        await navigator.clipboard.writeText(window.location.href);
        const btn = document.getElementById('copy-link-btn');
        const original = btn.textContent;
        btn.textContent = 'Copied!';
        setTimeout(() => (btn.textContent = original), 1200);
      } catch (e) {
        // Fallback: open prompt
        window.prompt('Copy URL', window.location.href);
      }
    });

    // Genre filter
    document.getElementById('genre-select').addEventListener('change', (e) => {
      this.filterByGenre(e.target.value);
    });

    // Preset filters
    document.querySelectorAll('[data-preset]').forEach(btn => {
      btn.addEventListener('click', () => {
        this.selectedPreset = btn.getAttribute('data-preset');
        this.persistFilters();
        this.renderPlaylist();
      });
    });

    // Shortcuts help toggle
    const helpBtn = document.getElementById('toggle-help-btn');
    const helpPanel = document.getElementById('shortcut-help');
    if (helpBtn && helpPanel) {
      helpBtn.addEventListener('click', () => {
        const isHidden = helpPanel.classList.toggle('hidden');
        helpBtn.setAttribute('aria-expanded', String(!isHidden));
      });
    }

    // Keyboard shortcuts for quick navigation and filtering
    // j / ArrowDown: next track
    // k / ArrowUp: previous track
    // Enter: load embedded player
    // g: focus genre select
    // 1..4: set Electro/Ambient/Melodic/Breaks respectively
    // / : toggle keyboard map
    document.addEventListener('keydown', (evt) => {
      const tag = (evt.target && evt.target.tagName) ? evt.target.tagName.toLowerCase() : '';
      // Ignore when typing in inputs/textareas/selects
      if (tag === 'input' || tag === 'textarea' || tag === 'select' || evt.metaKey || evt.ctrlKey || evt.altKey) {
        return;
      }

      const key = evt.key;
      if (key === 'j' || key === 'ArrowDown') {
        evt.preventDefault();
        this.nextTrack();
      } else if (key === 'k' || key === 'ArrowUp') {
        evt.preventDefault();
        this.previousTrack();
      } else if (key === 'Enter') {
        this.loadEmbeddedPlayer();
      } else if (key.toLowerCase() === 'g') {
        const sel = document.getElementById('genre-select');
        if (sel) sel.focus();
      } else if (key === '/') {
        // Toggle keyboard map overlay
        const map = document.getElementById('keyboard-map');
        if (map) map.classList.toggle('hidden');
      } else if (/^[1-4]$/.test(key)) {
        const genres = ['electro', 'ambient', 'melodic', 'breaks'];
        const idx = parseInt(key, 10) - 1;
        const sel = document.getElementById('genre-select');
        if (genres[idx] && sel) {
          sel.value = genres[idx];
          this.filterByGenre(genres[idx]);
        }
      }
    });

    // Sticky mini-player visibility via IntersectionObserver
    const mainCard = document.querySelector('.music-player');
    const mini = document.getElementById('mini-player');
    if (mainCard && mini && 'IntersectionObserver' in window) {
      const observer = new IntersectionObserver((entries) => {
        const entry = entries[0];
        if (entry && entry.isIntersecting) {
          mini.classList.add('hidden');
        } else {
          // Only show if we have a current track
          if (this.currentTrack) mini.classList.remove('hidden');
        }
      }, { threshold: 0.05 });
      observer.observe(mainCard);

      // Mini-player controls
      document.getElementById('mini-prev').addEventListener('click', () => this.previousTrack());
      document.getElementById('mini-next').addEventListener('click', () => this.nextTrack());
      document.getElementById('mini-load').addEventListener('click', () => this.loadEmbeddedPlayer());
    }
  }

  persistFilters() {
    try {
      const obj = { genre: this.currentGenre, year: this.selectedYear, preset: this.selectedPreset };
      localStorage.setItem('wavgen_music_filters', JSON.stringify(obj));
    } catch (_) {}
  }

  applyLocalFilters() {
    try {
      const raw = localStorage.getItem('wavgen_music_filters');
      if (!raw) return;
      const obj = JSON.parse(raw);
      if (obj.genre && !this.forcedGenre) {
        this.currentGenre = obj.genre;
        const sel = document.getElementById('genre-select');
        if (sel) sel.value = obj.genre;
      }
      if (obj.year) this.selectedYear = obj.year;
      if (obj.preset) this.selectedPreset = obj.preset;
    } catch (_) {}
  }

  // Back-compat: Filters UI renderer
  // The earlier version exposed year/preset quick filters. That UI has been removed,
  // but initialization still calls renderFiltersUI(). Keep a safe no-op that also
  // syncs the genre select value so the UI reflects the current/forced genre.
  renderFiltersUI() {
    const sel = document.getElementById('genre-select');
    if (sel) sel.value = this.forcedGenre || this.currentGenre || 'all';
  }

  loadTrack(index) {
    const filteredTracks = this.getFilteredTracks();
    if (!(index >= 0 && index < filteredTracks.length)) return;

    this.currentIndex = index;
    this.currentTrack = filteredTracks[index];
    this.isPlaying = false;

    const t = this.currentTrack;
    // Update UI fields
    const titleEl = document.getElementById('current-title');
    const artistEl = document.getElementById('current-artist');
    const genreEl = document.getElementById('current-genre');
    const durEl = document.getElementById('current-duration');
    const dateEl = document.getElementById('current-release-date');
    if (titleEl) titleEl.textContent = t.title || 'Untitled';
    if (artistEl) artistEl.textContent = t.artist || '';
    if (genreEl) genreEl.textContent = (t.genre || '').toUpperCase();
    if (durEl) durEl.textContent = t.duration || '0:00';
    if (dateEl) dateEl.textContent = t.releaseDate ? new Date(t.releaseDate).toISOString().slice(0,10) : '';

    // Streaming links
    const links = document.getElementById('streaming-links');
    if (links) {
      const p = t.platforms || {};
      const btn = (label, href) => href ? `<a href="${href}" target="_blank" rel="noopener" class="text-xs px-3 py-1 rounded-full bg-gray-700 hover:bg-gray-600 text-white">${label}</a>` : '';
      links.innerHTML = [
        btn('SoundCloud', p.soundcloud),
        btn('Bandcamp', p.bandcamp),
        btn('Apple Music', p.appleMusic),
        btn('YouTube', p.youtube)
      ].join('');
    }

    // Description
    const desc = document.getElementById('track-description');
    if (desc) desc.textContent = t.description || '';

    // Hide embedded player until requested again
    const embedWrap = document.getElementById('embedded-player-container');
    const embed = document.getElementById('embedded-player');
    if (embedWrap) embedWrap.classList.add('hidden');
    if (embed) embed.innerHTML = '';

    // Mini player labels
    const miniTitle = document.getElementById('mini-title');
    const miniArtist = document.getElementById('mini-artist');
    if (miniTitle) miniTitle.textContent = t.title || '';
    if (miniArtist) miniArtist.textContent = t.artist || '';

    // Reflect state
    this.updatePlaylistHighlight();
    this.updateURL();
    this.syncVisualizer();
    this.updateLiveRegions();
  }

  // Parse URL parameters to set initial genre and track selection
  // Returns true if a state was applied; false if defaults should be used
  applyURLState() {
    try {
      const params = new URLSearchParams(window.location.search || '');
      const genre = params.get('genre');
      const trackParam = params.get('track');

      if (!genre && !trackParam) return false; // nothing to apply

      this._suppressUrlUpdate = true;
      if (genre && !this.forcedGenre) {
        this.currentGenre = genre;
        const sel = document.getElementById('genre-select');
        if (sel) sel.value = genre;
      }

      this.renderPlaylist();

      let targetIndex = 0;
      if (trackParam) {
        const id = parseInt(trackParam, 10);
        if (!isNaN(id)) {
          const filtered = this.getFilteredTracks();
          const idx = filtered.findIndex(t => t.id === id);
          if (idx >= 0) targetIndex = idx;
        }
      }

      this.loadTrack(targetIndex);
      this._suppressUrlUpdate = false;
      return true;
    } catch (e) {
      // Fail gracefully and use defaults
      this._suppressUrlUpdate = false;
      return false;
    }
  }

  // Update the URL (without reloading) to reflect current genre and track
  updateURL() {
    if (this._suppressUrlUpdate) return;
    try {
      const path = window.location.pathname || '/music/';
      const params = new URLSearchParams();
      if (this.currentGenre && this.currentGenre !== 'all') {
        params.set('genre', this.currentGenre);
      }
      if (this.currentTrack && this.currentTrack.id) {
        params.set('track', String(this.currentTrack.id));
      }
      const query = params.toString();
      const newUrl = query ? `${path}?${query}` : path;
      window.history.replaceState(null, '', newUrl);
    } catch (e) {
      // no-op on failure
    }
  }

  updatePlaylistHighlight() {
    const items = document.querySelectorAll('.playlist-item');
    items.forEach((item, index) => {
      if (index === this.currentIndex) {
        item.classList.add('ring-2', 'ring-wavgen-yellow');
        item.setAttribute('aria-selected', 'true');
        // Ensure Now Playing badge exists
        const titleEl = item.querySelector('h5');
        if (titleEl && !titleEl.querySelector('.now-playing-badge')) {
          const span = document.createElement('span');
          span.className = 'now-playing-badge ml-2 inline-block text-[10px] px-2 py-0.5 rounded-full bg-wavgen-yellow text-black align-middle';
          span.textContent = 'Now Playing';
          titleEl.appendChild(span);
        }
      } else {
        item.classList.remove('ring-2', 'ring-wavgen-yellow');
        item.setAttribute('aria-selected', 'false');
        const badge = item.querySelector('.now-playing-badge');
        if (badge) badge.remove();
      }
    });
  }

  // Compute the list of tracks based on current filters
  getFilteredTracks() {
    let list = Array.isArray(this.tracks) ? this.tracks.slice() : [];

    // Forced genre takes precedence
    const effectiveGenre = this.forcedGenre || this.currentGenre || 'all';
    if (effectiveGenre && effectiveGenre !== 'all') {
      list = list.filter(t => (t.genre || '').toLowerCase() === effectiveGenre.toLowerCase());
    }

    // Year filter
    if (this.selectedYear && this.selectedYear !== 'all') {
      list = list.filter(t => (t.releaseDate || '').slice(0, 4) === this.selectedYear);
    }

    // Preset filter (simple educational mapping)
    if (this.selectedPreset && this.selectedPreset !== 'none') {
      if (this.selectedPreset === 'focus' || this.selectedPreset === 'deepwork') {
        // Ambient and melodic are calmer
        list = list.filter(t => ['ambient', 'melodic'].includes((t.genre || '').toLowerCase()));
      } else if (this.selectedPreset === 'driving') {
        // Electro and breaks are higher energy
        list = list.filter(t => ['electro', 'breaks'].includes((t.genre || '').toLowerCase()));
      }
    }

    return list;
  }

  // Render playlist items into the DOM
  renderPlaylist() {
    const wrap = document.getElementById('playlist-container');
    if (!wrap) return;

    const items = this.getFilteredTracks();
    if (!items.length) {
      // Auto-reset stale filters (year/preset) that have no UI and may persist from old sessions
      if (!this._autoResetApplied && (this.selectedYear !== 'all' || (this.selectedPreset && this.selectedPreset !== 'none'))) {
        this.selectedYear = 'all';
        this.selectedPreset = 'none';
        this._autoResetApplied = true;
        this.persistFilters();
        this.renderPlaylist();
        return;
      }
      wrap.innerHTML = '<div class="text-gray-400 text-sm">No tracks match the current filters.</div>';
      this.currentTrack = null;
      this.currentIndex = 0;
      this.updateLiveRegions();
      return;
    }

    wrap.innerHTML = items.map((t, idx) => `
      <div class="playlist-item flex items-center justify-between bg-gray-800 hover:bg-gray-750 border border-gray-700 rounded-lg p-3 cursor-pointer" role="option" aria-selected="${idx===this.currentIndex}">
        <div class="flex items-center gap-3">
          <div>
            <h5 class="text-white font-medium">${t.title}</h5>
            <p class="text-gray-400 text-xs">${t.artist} • ${(t.genre||'').toUpperCase()} • ${t.duration || ''}</p>
            <div class="flex flex-wrap gap-1 mt-1">
              ${t.tags.map(tag => `<span class="text-wavgen-yellow text-xs">#${tag}</span>`).join(' ')}
            </div>
          </div>
        </div>
        <button class="text-xs px-2 py-1 rounded bg-gray-700 text-white hover:bg-gray-600" data-index="${idx}">Play</button>
      </div>
    `).join('');

    // Item click and play button
    wrap.querySelectorAll('.playlist-item').forEach((el, idx) => {
      el.addEventListener('click', (evt) => {
        // Ignore clicks originating from the Play button (handled separately)
        if ((evt.target && evt.target.closest('button'))) return;
        this.loadTrack(idx);
      });
      // Keyboard accessibility: Enter/Space to activate list item
      el.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          this.loadTrack(idx);
        }
      });
    });
    wrap.querySelectorAll('button[data-index]').forEach(btn => {
      btn.addEventListener('click', (evt) => {
        evt.stopPropagation();
        const idx = parseInt(btn.getAttribute('data-index'), 10) || 0;
        this.loadTrack(idx);
      });
    });

    // Lock genre select when forced
    const sel = document.getElementById('genre-select');
    if (sel && this.forcedGenre) {
      sel.value = this.forcedGenre;
      sel.setAttribute('disabled', 'true');
      sel.setAttribute('title', 'Genre is locked on this page');
    }

    // Update highlighting post-render
    this.updatePlaylistHighlight();
    this.updateLiveRegions();
  }

  // Change genre via select; respect forcedGenre
  filterByGenre(value) {
    if (this.forcedGenre) {
      // Reset UI to forced value and ignore request
      const sel = document.getElementById('genre-select');
      if (sel) sel.value = this.forcedGenre;
      return;
    }
    this.currentGenre = value || 'all';
    this.persistFilters();
    this.renderPlaylist();
    // Reset to first in filtered list
    this.loadTrack(0);
  }

  previousTrack() {
    const list = this.getFilteredTracks();
    if (!list.length) return;
    const nextIdx = (this.currentIndex - 1 + list.length) % list.length;
    this.loadTrack(nextIdx);
  }

  nextTrack() {
    const list = this.getFilteredTracks();
    if (!list.length) return;
    const nextIdx = (this.currentIndex + 1) % list.length;
    this.loadTrack(nextIdx);
  }

  loadEmbeddedPlayer() {
    const t = this.currentTrack;
    if (!t) return;
    const wrap = document.getElementById('embedded-player-container');
    const slot = document.getElementById('embedded-player');
    if (slot) slot.innerHTML = t.embedHtml || '';
    if (wrap) wrap.classList.remove('hidden');
    this.isPlaying = true;
    this.syncVisualizer();
  }

  syncVisualizer() {
    const vis = document.getElementById('mini-visualizer');
    const wave = document.getElementById('waveform-accent');
    if (!vis || !wave) return;
    if (this.isPlaying) {
      // Animate bars randomly
      const bars = Array.from(vis.children);
      bars.forEach((bar, i) => {
        bar.style.transition = 'height 200ms ease';
      });
      if (!this._visTimer) {
        this._visTimer = setInterval(() => {
          bars.forEach((bar) => {
            const h = 6 + Math.floor(Math.random() * 14);
            bar.style.height = `${h}px`;
          });
        }, 220);
      }
      // Accent shimmer
      if (!this._waveTimer) {
        const inner = wave.firstElementChild;
        this._waveTimer = setInterval(() => {
          if (inner) {
            inner.style.transform = `translateX(${Math.random()*100}%)`;
            inner.style.transition = 'transform 400ms ease';
          }
        }, 500);
      }
    } else {
      clearInterval(this._visTimer); this._visTimer = null;
      clearInterval(this._waveTimer); this._waveTimer = null;
    }
  }
}

// Initialize the music player when the DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
  if (document.getElementById('music-player-container')) {
    new WavgenMusicPlayer();
  }
});
