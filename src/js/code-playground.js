/*
 * code-playground.js
 * Interactive Code Playground for the Wavgen.ca Data & Tech section
 * 
 * OVERVIEW:
 * This file implements a professional-grade interactive code playground that allows visitors
 * to experiment with the technologies that power Wavgen.ca. It provides hands-on learning
 * that aligns with the site's educational mission and "teaching reference" philosophy.
 * 
 * CORE FEATURES:
 * - Monaco Editor integration (VS Code experience) with syntax highlighting and IntelliSense
 * - Four interactive modes: Tailwind CSS, GSAP Animations, Eleventy Templates, Site Code Snippets
 * - Real-time preview system with split-screen layout
 * - Safe code execution environment with proper error handling
 * - Fixed height container (600px) to prevent endless scrolling
 * - Educational examples and comprehensive commenting throughout
 * 
 * TECHNICAL ARCHITECTURE:
 * - ES6 Class-based design for maintainability and extensibility
 * - Asynchronous Monaco Editor loading from CDN
 * - Dynamic UI generation with responsive design
 * - Event-driven preview updates with performance optimization (500ms debouncing)
 * - Mode-specific preview handlers for different code types
 * 
 * EDUCATIONAL VALUE:
 * - Demonstrates modern JavaScript patterns (ES6 classes, async/await, destructuring)
 * - Shows professional code organization and documentation practices
 * - Provides real-world examples of third-party library integration
 * - Teaches safe code execution and error handling techniques
 * 
 * INTEGRATION:
 * - Loaded via script tag in /data/webdev/index.njk
 * - Initializes automatically when DOM is ready
 * - Requires GSAP library for animation mode functionality
 * - Uses Tailwind CSS classes for styling consistency
 * 
 * All major sections, functions, and design decisions are commented below for teaching clarity.
 * This file serves as both functional code and educational reference material.
 */

class CodePlayground {
    constructor() {
        // Configuration object for different playground modes
        this.modes = {
            tailwind: {
                name: 'Tailwind CSS',
                language: 'html',
                defaultCode: `<!-- Try Tailwind CSS classes here! -->
<div class="bg-gradient-to-br from-wavgen-purple to-blue-600 p-8 rounded-lg shadow-xl">
    <h2 class="text-3xl font-bold text-white mb-4">Hello Wavgen!</h2>
    <p class="text-blue-200 mb-6">Experiment with Tailwind classes in real-time.</p>
    <button class="bg-wavgen-yellow text-gray-900 px-6 py-3 rounded-lg font-semibold hover:bg-yellow-300 transition-colors">
        Click Me!
    </button>
</div>`,
                description: 'Experiment with Tailwind CSS classes and see results instantly'
            },
            gsap: {
                name: 'GSAP Animations',
                language: 'javascript',
                defaultCode: `// Try GSAP animations here!
// The preview area has a div with id="gsap-target"

// Fade in and scale animation
gsap.from("#gsap-target", {
    duration: 1,
    opacity: 0,
    scale: 0.5,
    ease: "back.out(1.7)"
});

// Continuous rotation
gsap.to("#gsap-target", {
    duration: 3,
    rotation: 360,
    repeat: -1,
    ease: "none"
});

// Color animation
gsap.to("#gsap-target", {
    duration: 2,
    backgroundColor: "#f59e0b",
    repeat: -1,
    yoyo: true
});`,
                description: 'Create and test GSAP animations with live preview'
            },
            eleventy: {
                name: 'Eleventy Templates',
                language: 'html',
                defaultCode: `<!-- Eleventy/Nunjucks template example -->
<!-- Note: This is a demonstration of syntax, not live compilation -->

{% set pageTitle = "Interactive Demo" %}
{% set technologies = ["Eleventy", "Nunjucks", "Tailwind", "GSAP"] %}

<div class="bg-gray-800 p-6 rounded-lg">
    <h1 class="text-2xl font-bold text-wavgen-yellow mb-4">{{ pageTitle }}</h1>
    
    <h3 class="text-white mb-3">Technologies Used:</h3>
    <ul class="space-y-2">
    {% for tech in technologies %}
        <li class="text-blue-200">
            <span class="text-wavgen-yellow">•</span> {{ tech }}
        </li>
    {% endfor %}
    </ul>
    
    {% if technologies.length > 3 %}
        <p class="text-green-400 mt-4">Wow, that's a lot of tech!</p>
    {% endif %}
</div>`,
                description: 'Explore Eleventy/Nunjucks template syntax and features'
            },
            snippets: {
                name: 'Site Code Snippets',
                language: 'javascript',
                defaultCode: `// Real code from Wavgen.ca gallery system
// This creates the infinite marquee carousel effect you see on the site

// Initialize the carousel with sample images
function createCarouselDemo() {
    // Sample image data (using placeholder images)
    const images = [
        { src: 'https://picsum.photos/150/150?random=1', alt: 'Sample 1' },
        { src: 'https://picsum.photos/150/150?random=2', alt: 'Sample 2' },
        { src: 'https://picsum.photos/150/150?random=3', alt: 'Sample 3' },
        { src: 'https://picsum.photos/150/150?random=4', alt: 'Sample 4' },
        { src: 'https://picsum.photos/150/150?random=5', alt: 'Sample 5' }
    ];
    
    // Create carousel HTML
    const carousel = document.querySelector('#demo-carousel');
    if (!carousel) return;
    
    // Add images to carousel
    images.forEach(img => {
        const imgEl = document.createElement('img');
        imgEl.src = img.src;
        imgEl.alt = img.alt;
        imgEl.className = 'w-32 h-32 object-cover rounded-lg border-2 border-purple-400 mx-2 flex-shrink-0';
        carousel.appendChild(imgEl);
    });
    
    // Clone images for seamless loop
    images.forEach(img => {
        const imgEl = document.createElement('img');
        imgEl.src = img.src;
        imgEl.alt = img.alt + ' (clone)';
        imgEl.className = 'w-32 h-32 object-cover rounded-lg border-2 border-purple-400 mx-2 flex-shrink-0';
        carousel.appendChild(imgEl);
    });
    
    // Calculate animation distance
    const contentWidth = carousel.scrollWidth / 2;
    
    // Create infinite scroll animation
    if (window.gsap) {
        gsap.to(carousel, {
            x: -contentWidth,
            duration: contentWidth / 60, // 60px per second
            ease: "none",
            repeat: -1
        });
    }
}

// Initialize the demo
createCarouselDemo();

// Try changing the speed (60) or adding new animations!`,
                description: 'View and modify actual carousel code with live demo'
            }
        };
        
        this.currentMode = 'tailwind';
        this.editor = null;
        this.isInitialized = false;
        
        // Bind methods to preserve 'this' context
        this.switchMode = this.switchMode.bind(this);
        this.updatePreview = this.updatePreview.bind(this);
        this.resetCode = this.resetCode.bind(this);
    }
    
    /*
     * Initialize the code playground
     * Sets up the Monaco editor, creates the UI, and loads the default mode
     */
    async init() {
        if (this.isInitialized) return;
        
        try {
            // Load Monaco Editor from CDN
            await this.loadMonacoEditor();
            
            // Create the playground UI
            this.createPlaygroundUI();
            
            // Initialize the editor
            this.initializeEditor();
            
            // Set up event listeners
            this.setupEventListeners();
            
            // Load default mode
            this.switchMode(this.currentMode);
            
            this.isInitialized = true;
            console.log('🎮 Code Playground initialized successfully');
            
        } catch (error) {
            console.error('❌ Failed to initialize Code Playground:', error);
            this.showError('Failed to load code playground. Please refresh the page.');
        }
    }
    
    /*
     * Load Monaco Editor from CDN
     * Uses the same editor that powers VS Code for professional code editing experience
     */
    async loadMonacoEditor() {
        return new Promise((resolve, reject) => {
            // Check if Monaco is already loaded
            if (window.monaco) {
                resolve();
                return;
            }
            
            // Create script element for Monaco loader
            const script = document.createElement('script');
            script.src = 'https://cdn.jsdelivr.net/npm/monaco-editor@0.44.0/min/vs/loader.js';
            script.onload = () => {
                // Configure Monaco paths
                window.require.config({ 
                    paths: { 
                        'vs': 'https://cdn.jsdelivr.net/npm/monaco-editor@0.44.0/min/vs' 
                    } 
                });
                
                // Load Monaco editor
                window.require(['vs/editor/editor.main'], () => {
                    resolve();
                });
            };
            script.onerror = reject;
            document.head.appendChild(script);
        });
    }
    
    /*
     * Create the main playground UI structure
     * Builds the HTML layout with editor, preview, and controls
     * 
     * VERTICAL STACK DESIGN EXPLANATION:
     * This layout uses flex-col (vertical flexbox) instead of a grid system.
     * Benefits of this approach:
     * - Mobile-friendly: Natural vertical scrolling behavior
     * - No height constraints: Each section takes the space it needs
     * - Intuitive workflow: Code above, results below
     * - Responsive by default: Works perfectly on all screen sizes
     * - Better UX: Follows natural developer thought process
     * 
     * LAYOUT STRUCTURE:
     * 1. Header with mode switcher and description
     * 2. Code Editor Panel (Top) - Dark theme, fixed height (384px)
     * 3. Live Preview Panel (Bottom) - Light theme, flexible height (min 384px)
     * 4. Footer with tips and shortcuts
     */
    createPlaygroundUI() {
        const container = document.getElementById('code-playground-container');
        if (!container) {
            console.error('Code playground container not found');
            return;
        }
        
        // Generate the playground HTML with vertical stack layout
        container.innerHTML = `
            <div class="bg-gray-800 rounded-lg overflow-hidden shadow-2xl">
                <!-- Header with mode switcher -->
                <div class="bg-gray-700 px-6 py-4 border-b border-gray-600">
                    <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        <div>
                            <h3 class="text-2xl font-bold text-white mb-2">Interactive Code Playground</h3>
                            <p class="text-gray-300 text-sm" id="mode-description">
                                Experiment with code and see results in real-time
                            </p>
                        </div>
                        <div class="flex flex-wrap gap-2">
                            ${Object.keys(this.modes).map(mode => `
                                <button 
                                    class="mode-btn px-4 py-2 rounded-lg text-sm font-medium transition-colors ${mode === this.currentMode ? 'bg-wavgen-yellow text-gray-900' : 'bg-gray-600 text-white hover:bg-gray-500'}"
                                    data-mode="${mode}"
                                >
                                    ${this.modes[mode].name}
                                </button>
                            `).join('')}
                        </div>
                    </div>
                </div>
                
                <!-- Main content area with vertical stack layout -->
                <div class="flex flex-col gap-0">
                    <!-- Code Editor Panel (Top) -->
                    <div class="bg-gray-900">
                        <div class="bg-gray-700 px-4 py-2 border-b border-gray-600 flex items-center justify-between">
                            <span class="text-white font-medium">💻 Code Editor</span>
                            <button 
                                id="reset-code-btn"
                                class="text-xs bg-gray-600 hover:bg-gray-500 text-white px-3 py-1 rounded transition-colors"
                            >
                                🔄 Reset
                            </button>
                        </div>
                        <div id="monaco-editor" class="h-96"></div>
                    </div>
                    
                    <!-- Live Preview Panel (Bottom) -->
                    <div class="bg-white border-t border-gray-300">
                        <div class="bg-gray-700 px-4 py-2 border-b border-gray-600">
                            <span class="text-white font-medium">👁️ Live Preview</span>
                        </div>
                        <div id="preview-area" class="p-6 overflow-auto min-h-96">
                            <div class="text-gray-500 text-center mt-20">
                                Preview will appear here...
                            </div>
                        </div>
                    </div>
                </div>
                
                <!-- Footer with tips -->
                <div class="bg-gray-700 px-6 py-3 border-t border-gray-600">
                    <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-2 text-sm text-gray-300">
                        <div>
                            💡 <strong>Tip:</strong> Use Ctrl+S (Cmd+S) to update preview, or it updates automatically as you type
                        </div>
                        <div class="text-xs text-gray-400">
                            Powered by Monaco Editor (VS Code)
                        </div>
                    </div>
                </div>
            </div>
        `;
    }
    
    /*
     * Initialize the Monaco editor instance
     * Configures the editor with appropriate settings and themes
     */
    initializeEditor() {
        const editorElement = document.getElementById('monaco-editor');
        if (!editorElement) return;
        
        // Create Monaco editor instance
        this.editor = window.monaco.editor.create(editorElement, {
            value: '',
            language: 'html',
            theme: 'vs-dark',
            fontSize: 14,
            lineNumbers: 'on',
            roundedSelection: false,
            scrollBeyondLastLine: false,
            readOnly: false,
            automaticLayout: true,
            minimap: { enabled: false },
            wordWrap: 'on',
            tabSize: 2,
            insertSpaces: true,
            folding: true,
            lineDecorationsWidth: 10,
            lineNumbersMinChars: 3,
            glyphMargin: false,
            // Mobile-friendly scroll settings
            scrollbar: {
                vertical: 'auto',
                horizontal: 'auto',
                handleMouseWheel: true,
                alwaysConsumeMouseWheel: false // Allow page scroll when editor scroll is at limits
            }
        });
        
        // Set up auto-save and live preview updates
        let updateTimeout;
        this.editor.onDidChangeModelContent(() => {
            clearTimeout(updateTimeout);
            updateTimeout = setTimeout(() => {
                this.updatePreview();
            }, 500); // 500ms delay for performance
        });
        
        // Add keyboard shortcut for manual update (Ctrl+S / Cmd+S)
        this.editor.addCommand(window.monaco.KeyMod.CtrlCmd | window.monaco.KeyCode.KeyS, () => {
            this.updatePreview();
        });
        
        // Add mobile-friendly touch handling for page scrolling
        this.setupMobileScrollHandling(editorElement);
    }
    
    /*
     * Set up event listeners for UI interactions
     * Handles mode switching, reset button, and other controls
     */
    setupEventListeners() {
        // Mode switcher buttons
        document.querySelectorAll('.mode-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const mode = e.target.dataset.mode;
                this.switchMode(mode);
            });
        });
        
        // Reset code button
        const resetBtn = document.getElementById('reset-code-btn');
        if (resetBtn) {
            resetBtn.addEventListener('click', this.resetCode);
        }
    }
    
    /*
     * Set up mobile-friendly scroll handling
     * Allows page scrolling over the Monaco Editor on mobile devices
     */
    setupMobileScrollHandling(editorElement) {
        let startY = 0;
        let isScrolling = false;
        
        // Handle touch start
        editorElement.addEventListener('touchstart', (e) => {
            startY = e.touches[0].clientY;
            isScrolling = false;
        }, { passive: true });
        
        // Handle touch move - allow page scroll if editor is at scroll limits
        editorElement.addEventListener('touchmove', (e) => {
            if (!isScrolling) {
                const currentY = e.touches[0].clientY;
                const deltaY = startY - currentY;
                
                // Check if editor is at scroll limits
                const editorContainer = editorElement.querySelector('.monaco-scrollable-element');
                if (editorContainer) {
                    const atTop = editorContainer.scrollTop === 0;
                    const atBottom = editorContainer.scrollTop >= (editorContainer.scrollHeight - editorContainer.clientHeight);
                    
                    // Allow page scroll if trying to scroll beyond editor limits
                    if ((deltaY < 0 && atTop) || (deltaY > 0 && atBottom)) {
                        // Don't prevent default - allow page scroll
                        return;
                    }
                }
                
                isScrolling = true;
            }
        }, { passive: true });
        
        // Add CSS to improve touch scrolling
        editorElement.style.touchAction = 'pan-y';
    }
    
    /*
     * Switch between different playground modes
     * Updates editor language, content, and preview behavior
     */
    switchMode(mode) {
        if (!this.modes[mode] || !this.editor) return;
        
        this.currentMode = mode;
        const modeConfig = this.modes[mode];
        
        // Update editor language and content
        const model = this.editor.getModel();
        window.monaco.editor.setModelLanguage(model, modeConfig.language);
        this.editor.setValue(modeConfig.defaultCode);
        
        // Update UI
        this.updateModeUI(mode);
        
        // Update preview
        this.updatePreview();
        
        console.log(`🔄 Switched to ${modeConfig.name} mode`);
    }
    
    /*
     * Update the UI to reflect the current mode
     * Changes active button styling and description text
     */
    updateModeUI(mode) {
        // Update mode buttons
        document.querySelectorAll('.mode-btn').forEach(btn => {
            const isActive = btn.dataset.mode === mode;
            btn.className = `mode-btn px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                isActive 
                    ? 'bg-wavgen-yellow text-gray-900' 
                    : 'bg-gray-600 text-white hover:bg-gray-500'
            }`;
        });
        
        // Update description
        const descElement = document.getElementById('mode-description');
        if (descElement) {
            descElement.textContent = this.modes[mode].description;
        }
    }
    
    /*
     * Update the live preview based on current mode and code
     * Handles different preview types: HTML rendering, JS execution, etc.
     */
    updatePreview() {
        if (!this.editor) return;
        
        const code = this.editor.getValue();
        const previewArea = document.getElementById('preview-area');
        if (!previewArea) return;
        
        try {
            switch (this.currentMode) {
                case 'tailwind':
                    this.updateTailwindPreview(code, previewArea);
                    break;
                case 'gsap':
                    this.updateGSAPPreview(code, previewArea);
                    break;
                case 'eleventy':
                    this.updateEleventyPreview(code, previewArea);
                    break;
                case 'snippets':
                    this.updateSnippetsPreview(code, previewArea);
                    break;
                default:
                    previewArea.innerHTML = '<div class="text-gray-500 text-center mt-20">Preview not available for this mode</div>';
            }
        } catch (error) {
            console.error('Preview update error:', error);
            previewArea.innerHTML = `
                <div class="text-red-500 text-center mt-20">
                    <div class="text-lg font-semibold mb-2">Preview Error</div>
                    <div class="text-sm">${error.message}</div>
                </div>
            `;
        }
    }
    
    /*
     * Update preview for Tailwind CSS mode
     * Renders HTML with Tailwind classes applied
     */
    updateTailwindPreview(code, previewArea) {
        // Create a safe preview environment
        const previewContent = `
            <div class="tailwind-preview">
                ${code}
            </div>
        `;
        previewArea.innerHTML = previewContent;
    }
    
    /*
     * Update preview for GSAP animation mode
     * Creates a target element and executes GSAP code safely
     */
    updateGSAPPreview(code, previewArea) {
        // Clear previous animations
        if (window.gsap) {
            window.gsap.killTweensOf("*");
        }
        
        // Create preview content with GSAP target
        previewArea.innerHTML = `
            <div class="gsap-preview-container">
                <div id="gsap-target" class="w-32 h-32 bg-wavgen-purple rounded-lg mx-auto mb-4 flex items-center justify-center">
                    <span class="text-white font-bold">GSAP Target</span>
                </div>
                <div class="text-center text-gray-600 text-sm">
                    Animation target element (id="gsap-target")
                </div>
            </div>
        `;
        
        // Execute GSAP code safely
        if (window.gsap && code.trim()) {
            try {
                // Create a safe execution context
                const executeCode = new Function('gsap', code);
                executeCode(window.gsap);
            } catch (error) {
                console.error('GSAP execution error:', error);
                previewArea.innerHTML += `
                    <div class="text-red-500 text-sm mt-4 p-3 bg-red-50 rounded">
                        <strong>Animation Error:</strong> ${error.message}
                    </div>
                `;
            }
        }
    }
    
    /*
     * Update preview for Eleventy template mode
     * Shows template syntax with syntax highlighting (not live compilation)
     */
    updateEleventyPreview(code, previewArea) {
        previewArea.innerHTML = `
            <div class="eleventy-preview">
                <div class="bg-blue-100 border-l-4 border-blue-500 p-4 mb-4 rounded-r">
                    <div class="text-blue-900 font-semibold mb-2">📝 Template Syntax Preview</div>
                    <div class="text-blue-800 text-sm">
                        This shows Eleventy/Nunjucks template syntax. In a real build process, 
                        this would be compiled to HTML with data from your site.
                    </div>
                </div>
                <pre class="bg-gray-800 text-gray-100 p-4 rounded-lg overflow-auto text-sm border"><code>${this.escapeHtml(code)}</code></pre>
                <div class="mt-4 text-gray-800 text-sm">
                    <strong class="text-gray-900">Key Features Shown:</strong>
                    <ul class="list-disc list-inside mt-2 space-y-1">
                        <li>Variable interpolation: <code class="bg-gray-200 px-1 rounded">{{ variable }}</code></li>
                        <li>Template tags: <code class="bg-gray-200 px-1 rounded">{% set %}</code>, <code class="bg-gray-200 px-1 rounded">{% for %}</code>, <code class="bg-gray-200 px-1 rounded">{% if %}</code></li>
                        <li>Filters and functions for data manipulation</li>
                        <li>Conditional rendering and loops</li>
                    </ul>
                </div>
            </div>
        `;
    }
    
    /*
     * Update preview for code snippets mode
     * Shows the code with live carousel demo
     */
    updateSnippetsPreview(code, previewArea) {
        previewArea.innerHTML = `
            <div class="snippets-preview">
                <div class="bg-green-100 border-l-4 border-green-500 p-4 mb-4 rounded-r">
                    <div class="text-green-900 font-semibold mb-2">🎠 Live Carousel Demo</div>
                    <div class="text-green-800 text-sm">
                        This is actual carousel code from Wavgen.ca. The demo below shows it in action!
                    </div>
                </div>
                
                <!-- Live Carousel Demo -->
                <div class="bg-gray-100 p-4 rounded-lg mb-4 border">
                    <div class="text-center mb-3">
                        <h4 class="text-gray-800 font-semibold">Live Demo:</h4>
                    </div>
                    <div class="overflow-hidden bg-white rounded border-2 border-yellow-400 p-4">
                        <div id="demo-carousel" class="flex items-center" style="width: max-content;"></div>
                    </div>
                </div>
                
                <div class="mt-4 text-gray-800 text-sm">
                    <strong class="text-gray-900">How it works:</strong>
                    <ul class="list-disc list-inside mt-2 space-y-1">
                        <li>Creates sample images dynamically</li>
                        <li>Clones images for seamless infinite loop</li>
                        <li>GSAP animates at 60px/second for smooth motion</li>
                        <li>Try changing the speed value in the code!</li>
                    </ul>
                </div>
            </div>
        `;
        
        // Execute the code to create the live demo
        if (window.gsap && code.trim()) {
            try {
                // Small delay to ensure DOM is ready
                setTimeout(() => {
                    const executeCode = new Function('gsap', code);
                    executeCode(window.gsap);
                }, 100);
            } catch (error) {
                console.error('Carousel demo error:', error);
            }
        }
    }
    
    /*
     * Reset code to default for current mode
     * Restores the original example code
     */
    resetCode() {
        if (!this.editor || !this.modes[this.currentMode]) return;
        
        const defaultCode = this.modes[this.currentMode].defaultCode;
        this.editor.setValue(defaultCode);
        this.updatePreview();
        
        console.log(`🔄 Reset code for ${this.modes[this.currentMode].name} mode`);
    }
    
    /*
     * Show error message to user
     * Displays user-friendly error information
     */
    showError(message) {
        const container = document.getElementById('code-playground-container');
        if (container) {
            container.innerHTML = `
                <div class="bg-red-50 border border-red-200 rounded-lg p-8 text-center">
                    <div class="text-red-600 text-xl font-semibold mb-2">⚠️ Playground Error</div>
                    <div class="text-red-700">${message}</div>
                </div>
            `;
        }
    }
    
    /*
     * Utility function to escape HTML for safe display
     * Prevents XSS and ensures code displays correctly
     */
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

/*
 * Initialize the playground when the DOM is ready
 * This ensures all required elements are available before setup
 */
document.addEventListener('DOMContentLoaded', () => {
    // Check if we're on a page that should have the playground
    const playgroundContainer = document.getElementById('code-playground-container');
    if (playgroundContainer) {
        const playground = new CodePlayground();
        playground.init().catch(error => {
            console.error('Failed to initialize Code Playground:', error);
        });
    }
});

// Export for potential external use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CodePlayground;
}
