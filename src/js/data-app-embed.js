/**
 * WAVGEN DATA APP EMBED - REAL APP INTEGRATION
 * 
 * Interactive showcase for Rob McDonald's actual data & tech projects.
 * Ready for integration with live apps when they become available.
 */

// Real app data - TODO: Replace with your actual live apps when available
const REAL_APPS = [
  {
    id: 1,
    title: "[Your Live App Title]",
    description: "Description of your actual application or project",
    category: "genai", // genai, webdev, cloud, coding
    tech: ["React", "Node.js", "AI API"], // Your actual tech stack
    demoType: "interactive",
    status: "coming_soon", // coming_soon, live, demo
    liveUrl: "", // Add when your app is live
    githubUrl: "", // Your GitHub repo if public
    codeSnippet: `// Your actual code example
const yourFunction = () => {
  // Add your real code here
  console.log("Hello from your app!");
};`,
    features: ["Feature 1", "Feature 2", "Feature 3"],
    screenshots: ["/images/apps/your-app-1.jpg", "/images/apps/your-app-2.jpg"]
  },
  {
    id: 2,
    title: "[Another Project Title]",
    description: "Description of another project you're working on",
    category: "webdev",
    tech: ["Vue.js", "Express", "MongoDB"],
    demoType: "visualization",
    status: "coming_soon",
    liveUrl: "",
    githubUrl: "",
    codeSnippet: `// Another code example
const anotherFunction = async (data) => {
  const result = await processData(data);
  return result;
};`,
    features: ["Real-time updates", "Responsive design", "API integration"],
    screenshots: ["/images/apps/another-app-1.jpg"]
  }
  // Add more of your actual projects here
];

class WavgenDataAppEmbed {
  constructor() {
    this.apps = REAL_APPS;
    this.currentApp = null;
    this.currentCategory = 'all';
    this.activeTab = 'preview';
    
    this.init();
  }

  init() {
    this.createEmbedHTML();
    this.bindEvents();
    this.renderAppGrid();
    this.loadApp(0);
  }

  createEmbedHTML() {
    const embedContainer = document.getElementById('data-app-embed-container');
    if (!embedContainer) return;

    embedContainer.innerHTML = `
      <div class="data-app-embed bg-gradient-to-br from-wavgen-dark-purple to-gray-900 rounded-xl border-2 border-wavgen-yellow p-6 shadow-2xl">
        <!-- Header -->
        <div class="flex items-center justify-between mb-6">
          <h3 class="text-2xl font-bold text-white">Interactive Tech Projects</h3>
          <div class="category-filter">
            <select id="app-category-select" class="bg-gray-800 text-white border border-wavgen-yellow rounded px-3 py-1 text-sm">
              <option value="all">All Categories</option>
              <option value="genai">Gen AI</option>
              <option value="webdev">Web Dev</option>
              <option value="cloud">Cloud</option>
              <option value="coding">Coding</option>
            </select>
          </div>
        </div>

        <!-- Main App Display -->
        <div class="app-display bg-gray-800 rounded-lg p-6 mb-6">
          <!-- App Info -->
          <div class="app-info mb-4">
            <div class="flex items-start justify-between mb-3">
              <div class="flex-1">
                <h4 id="current-app-title" class="text-white font-semibold text-xl mb-2">Select a project to explore</h4>
                <p id="current-app-description" class="text-gray-400 mb-3">Choose from the projects below</p>
              </div>
              <div class="text-right">
                <span id="current-app-status" class="px-3 py-1 rounded-full text-xs font-medium bg-yellow-500 text-black">Coming Soon</span>
              </div>
            </div>
            
            <!-- Tech Stack -->
            <div id="current-app-tech" class="flex flex-wrap gap-2 mb-4">
              <!-- Tech tags will be rendered here -->
            </div>
            
            <!-- Project Links -->
            <div id="project-links" class="flex flex-wrap gap-2 mb-4">
              <!-- Live demo and GitHub links will be rendered here -->
            </div>
          </div>

          <!-- Tab Navigation -->
          <div class="tab-navigation flex space-x-1 mb-4 bg-gray-700 rounded-lg p-1">
            <button id="preview-tab" class="tab-btn flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors bg-wavgen-yellow text-black">
              Preview
            </button>
            <button id="code-tab" class="tab-btn flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors text-gray-300 hover:text-white">
              Code
            </button>
            <button id="features-tab" class="tab-btn flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors text-gray-300 hover:text-white">
              Features
            </button>
            <button id="demo-tab" class="tab-btn flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors text-gray-300 hover:text-white">
              Live Demo
            </button>
          </div>

          <!-- Tab Content -->
          <div class="tab-content">
            <!-- Preview Tab -->
            <div id="preview-content" class="tab-pane">
              <div class="app-preview bg-black rounded-lg overflow-hidden relative" style="height: 300px;">
                <div id="preview-placeholder" class="absolute inset-0 bg-gradient-to-br from-blue-900/50 to-purple-900/50 flex items-center justify-center">
                  <div class="text-center text-white">
                    <svg class="w-16 h-16 mx-auto mb-4 text-wavgen-yellow" fill="currentColor" viewBox="0 0 20 20">
                      <path fill-rule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zm0 4a1 1 0 011-1h12a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1V8z" clip-rule="evenodd"></path>
                    </svg>
                    <h5 class="text-lg font-semibold mb-2">Project Preview</h5>
                    <p class="text-gray-300">Visual preview of the project</p>
                  </div>
                </div>
              </div>
            </div>

            <!-- Code Tab -->
            <div id="code-content" class="tab-pane hidden">
              <div class="code-display bg-gray-900 rounded-lg p-4 overflow-x-auto">
                <pre id="code-snippet" class="text-green-400 text-sm"><code>// Select a project to view code examples</code></pre>
              </div>
            </div>

            <!-- Features Tab -->
            <div id="features-content" class="tab-pane hidden">
              <div class="features-display bg-gray-900 rounded-lg p-4">
                <h5 class="text-white font-semibold mb-3">Key Features</h5>
                <ul id="features-list" class="space-y-2">
                  <!-- Features will be rendered here -->
                </ul>
              </div>
            </div>

            <!-- Demo Tab -->
            <div id="demo-content" class="tab-pane hidden">
              <div class="demo-frame bg-black rounded-lg overflow-hidden" style="height: 300px;">
                <div id="demo-placeholder" class="h-full flex items-center justify-center">
                  <div class="text-center text-white">
                    <svg class="w-16 h-16 mx-auto mb-4 text-wavgen-yellow" fill="currentColor" viewBox="0 0 20 20">
                      <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clip-rule="evenodd"></path>
                    </svg>
                    <h5 class="text-lg font-semibold mb-2">Live Demo</h5>
                    <p class="text-gray-300 mb-4" id="demo-status-text">Demo will be available when project is live</p>
                    <button id="launch-demo-btn" class="bg-wavgen-yellow text-black px-4 py-2 rounded-lg font-medium hover:bg-yellow-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed" disabled>
                      Launch Demo
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- App Grid -->
        <div class="app-grid">
          <h4 class="text-white font-semibold mb-3">Available Projects</h4>
          <div id="app-grid-container" class="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            <!-- App cards will be rendered here -->
          </div>
        </div>
      </div>
    `;
  }

  bindEvents() {
    // Tab switching
    document.getElementById('preview-tab').addEventListener('click', () => {
      this.switchTab('preview');
    });

    document.getElementById('code-tab').addEventListener('click', () => {
      this.switchTab('code');
    });

    document.getElementById('features-tab').addEventListener('click', () => {
      this.switchTab('features');
    });

    document.getElementById('demo-tab').addEventListener('click', () => {
      this.switchTab('demo');
    });

    // Category filter
    document.getElementById('app-category-select').addEventListener('change', (e) => {
      this.filterByCategory(e.target.value);
    });

    // Launch demo button
    document.getElementById('launch-demo-btn').addEventListener('click', () => {
      this.launchDemo();
    });
  }

  loadApp(index) {
    const filteredApps = this.getFilteredApps();
    if (index >= 0 && index < filteredApps.length) {
      this.currentApp = filteredApps[index];
      
      // Update app info
      document.getElementById('current-app-title').textContent = this.currentApp.title;
      document.getElementById('current-app-description').textContent = this.currentApp.description;
      
      // Update status
      const statusElement = document.getElementById('current-app-status');
      const statusConfig = {
        'live': { class: 'bg-green-500 text-white', text: 'Live' },
        'demo': { class: 'bg-blue-500 text-white', text: 'Demo' },
        'coming_soon': { class: 'bg-yellow-500 text-black', text: 'Coming Soon' }
      };
      const config = statusConfig[this.currentApp.status] || statusConfig.coming_soon;
      statusElement.className = `px-3 py-1 rounded-full text-xs font-medium ${config.class}`;
      statusElement.textContent = config.text;
      
      // Update tech tags
      const techContainer = document.getElementById('current-app-tech');
      techContainer.innerHTML = this.currentApp.tech.map(tech => 
        `<span class="bg-wavgen-purple text-white px-3 py-1 rounded-full text-sm">${tech}</span>`
      ).join('');
      
      // Update project links
      this.updateProjectLinks();
      
      // Update code snippet
      document.getElementById('code-snippet').innerHTML = `<code>${this.escapeHtml(this.currentApp.codeSnippet)}</code>`;
      
      // Update features
      this.updateFeatures();
      
      // Update demo status
      this.updateDemoStatus();
      
      this.updateAppGridHighlight(index);
      this.updatePreview();
    }
  }

  updateProjectLinks() {
    const container = document.getElementById('project-links');
    const links = [];
    
    if (this.currentApp.liveUrl) {
      links.push(`
        <a href="${this.currentApp.liveUrl}" target="_blank" class="platform-btn bg-green-600 hover:bg-green-500 text-white px-3 py-1 rounded text-xs font-medium transition-colors">
          🚀 Live Demo
        </a>
      `);
    }
    
    if (this.currentApp.githubUrl) {
      links.push(`
        <a href="${this.currentApp.githubUrl}" target="_blank" class="platform-btn bg-gray-800 hover:bg-gray-700 text-white px-3 py-1 rounded text-xs font-medium transition-colors">
          💻 GitHub
        </a>
      `);
    }
    
    container.innerHTML = links.join('');
  }

  updateFeatures() {
    const container = document.getElementById('features-list');
    container.innerHTML = this.currentApp.features.map(feature => 
      `<li class="flex items-center text-gray-300">
        <svg class="w-4 h-4 text-wavgen-yellow mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"></path>
        </svg>
        ${feature}
      </li>`
    ).join('');
  }

  updateDemoStatus() {
    const button = document.getElementById('launch-demo-btn');
    const statusText = document.getElementById('demo-status-text');
    
    if (this.currentApp.status === 'live' && this.currentApp.liveUrl) {
      button.disabled = false;
      button.textContent = 'Launch Demo';
      statusText.textContent = 'Interactive application demo';
    } else {
      button.disabled = true;
      button.textContent = 'Coming Soon';
      statusText.textContent = 'Demo will be available when project is live';
    }
  }

  switchTab(tabName) {
    // Update tab buttons
    document.querySelectorAll('.tab-btn').forEach(btn => {
      btn.classList.remove('bg-wavgen-yellow', 'text-black');
      btn.classList.add('text-gray-300');
    });
    
    document.getElementById(`${tabName}-tab`).classList.add('bg-wavgen-yellow', 'text-black');
    document.getElementById(`${tabName}-tab`).classList.remove('text-gray-300');
    
    // Update tab content
    document.querySelectorAll('.tab-pane').forEach(pane => {
      pane.classList.add('hidden');
    });
    
    document.getElementById(`${tabName}-content`).classList.remove('hidden');
    
    this.activeTab = tabName;
  }

  updatePreview() {
    if (!this.currentApp) return;
    
    const placeholder = document.getElementById('preview-placeholder');
    const previewContent = this.generatePreviewContent(this.currentApp);
    placeholder.innerHTML = previewContent;
  }

  generatePreviewContent(app) {
    const baseClasses = "absolute inset-0 bg-gradient-to-br from-blue-900/50 to-purple-900/50 flex items-center justify-center";
    
    return `
      <div class="${baseClasses}">
        <div class="text-center text-white max-w-xs">
          <div class="bg-gray-800 rounded-lg p-4 mb-4">
            <div class="flex items-center justify-between mb-2">
              <div class="w-3 h-3 bg-red-500 rounded-full"></div>
              <div class="w-3 h-3 bg-yellow-500 rounded-full"></div>
              <div class="w-3 h-3 bg-green-500 rounded-full"></div>
            </div>
            <div class="space-y-2">
              <div class="bg-wavgen-yellow h-2 rounded w-3/4"></div>
              <div class="bg-gray-600 h-2 rounded w-1/2"></div>
              <div class="bg-gray-600 h-2 rounded w-2/3"></div>
            </div>
          </div>
          <p class="text-sm text-gray-300">${app.title}</p>
          <p class="text-xs text-gray-400 mt-1">${app.status === 'live' ? 'Live Application' : 'In Development'}</p>
        </div>
      </div>
    `;
  }

  launchDemo() {
    if (this.currentApp && this.currentApp.liveUrl && this.currentApp.status === 'live') {
      window.open(this.currentApp.liveUrl, '_blank');
    } else {
      alert('Demo not yet available - project is still in development');
    }
  }

  filterByCategory(category) {
    this.currentCategory = category;
    this.renderAppGrid();
  }

  getFilteredApps() {
    if (this.currentCategory === 'all') {
      return this.apps;
    }
    return this.apps.filter(app => app.category === this.currentCategory);
  }

  renderAppGrid() {
    const container = document.getElementById('app-grid-container');
    const filteredApps = this.getFilteredApps();
    
    container.innerHTML = filteredApps.map((app, index) => `
      <div class="app-card bg-gray-700 hover:bg-gray-600 rounded-lg p-4 cursor-pointer transition-colors ${
        this.currentApp && this.currentApp.id === app.id ? 'ring-2 ring-wavgen-yellow' : ''
      }" data-index="${index}">
        <div class="text-center">
          <div class="app-icon w-12 h-12 bg-gradient-to-br from-wavgen-purple to-wavgen-yellow rounded-lg flex items-center justify-center mx-auto mb-3 relative">
            <svg class="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zm0 4a1 1 0 011-1h12a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1V8z" clip-rule="evenodd"></path>
            </svg>
            ${app.status === 'live' ? '<div class="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full"></div>' : ''}
          </div>
          <h5 class="text-white font-medium text-sm mb-2">${app.title}</h5>
          <p class="text-gray-400 text-xs mb-2 line-clamp-2">${app.description}</p>
          <div class="flex items-center justify-between">
            <span class="text-wavgen-yellow text-xs uppercase tracking-wide">${app.category}</span>
            <span class="text-xs px-2 py-1 rounded ${
              app.status === 'live' ? 'bg-green-500 text-white' : 
              app.status === 'demo' ? 'bg-blue-500 text-white' : 
              'bg-yellow-500 text-black'
            }">${app.status === 'live' ? 'Live' : app.status === 'demo' ? 'Demo' : 'Soon'}</span>
          </div>
        </div>
      </div>
    `).join('');

    // Add click events to app cards
    container.querySelectorAll('.app-card').forEach((card, index) => {
      card.addEventListener('click', () => {
        this.loadApp(index);
      });
    });
  }

  updateAppGridHighlight(currentIndex) {
    const cards = document.querySelectorAll('.app-card');
    cards.forEach((card, index) => {
      if (index === currentIndex) {
        card.classList.add('ring-2', 'ring-wavgen-yellow');
      } else {
        card.classList.remove('ring-2', 'ring-wavgen-yellow');
      }
    });
  }

  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
}

// Initialize the data app embed when the DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
  if (document.getElementById('data-app-embed-container')) {
    new WavgenDataAppEmbed();
  }
});
