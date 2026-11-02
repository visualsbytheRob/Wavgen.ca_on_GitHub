/*
 * .eleventy.js
 * This is the main configuration file for Eleventy (11ty), the static site generator.
 * - Sets up asset passthroughs, watch targets, and custom filters for navigation.
 * - Configures input/output directories and template engines.
 * All major sections and lines are commented below for teaching clarity.
 */

const fs = require('fs');

module.exports = function(eleventyConfig) {
  eleventyConfig.addPassthroughCopy({ "src/icons": "icons", "src/manifest.webmanifest": "manifest.webmanifest" });
  // Copy static assets from source to output so they're available in the built site
  eleventyConfig.addPassthroughCopy("src/assets"); // Copy all files from src/assets
  eleventyConfig.addPassthroughCopy("src/images"); // Copy all images
  // Map src/js -> /js and src/css -> /css so template paths like /js/foo.js and /css/style.css resolve
  eleventyConfig.addPassthroughCopy({ "src/js": "js" }); // Copy all JavaScript files to /js
  eleventyConfig.addPassthroughCopy({ "src/css": "css" }); // Copy all CSS files to /css
  
  // Copy GSAP files from root js directory to js/gsap/ to avoid main.js conflict
  eleventyConfig.addPassthroughCopy({ "js/gsap": "js/gsap" }); // Copy only GSAP directory
  eleventyConfig.addPassthroughCopy({ "worlds": "worlds" }); // Serve world apps at /worlds/*.html
  
  // Tell Eleventy to watch these files for changes and trigger rebuilds
  eleventyConfig.addWatchTarget("src/css/"); // Watch the CSS directory
  eleventyConfig.addWatchTarget("src/input.css"); // Watch the main input.css
  
  // Helper function to create image collections from a directory
  // Used to generate page-specific image galleries throughout the site
  const fs = require('fs');
  const path = require('path');
  
  function createImageCollection(dirPath, urlPath) {
    return function() {
      const fullPath = path.join(__dirname, "src", "images", dirPath);
      if (!fs.existsSync(fullPath)) return [];
      return fs.readdirSync(fullPath)
        .filter(file => /\.(jpg|jpeg|png|gif|webp)$/i.test(file))
        .map(file => ({
          url: `/images/${dirPath}/${file}`,
          fileSlug: file.replace(/\.[^/.]+$/, "")
        }));
    };
  }

  // ===========================================
  // PAGE-SPECIFIC IMAGE COLLECTIONS
  // ===========================================
  // Each section/page gets its own image collection for galleries
  
  // Home page images (hero backgrounds, featured content)
  eleventyConfig.addCollection("homeImages", createImageCollection("home", "home"));

  // Take the first N items of an array (Nunjucks' built-in `slice` filter chunks into N equal arrays — not what we want)
  eleventyConfig.addFilter("head", (arr, n) => Array.isArray(arr) ? arr.slice(0, n) : []);

  // Site Log timeline: merges manual diary entries and automated news briefings, newest first
  eleventyConfig.addCollection("logTimeline", function(collectionApi) {
    return collectionApi.getAll()
      .filter(item => item.data.tags && (item.data.tags.includes("diary") || item.data.tags.includes("briefing")))
      .sort((a, b) => b.date - a.date);
  });

  // On this day: diary entries from past years matching today's month-day.
  // Rebuilds happen daily via the morning-digest push, so "today" stays fresh.
  // Annotates each item with `yearsAgo` so the template doesn't need date math.
  eleventyConfig.addCollection("onThisDay", function(collectionApi) {
    const today = new Date();
    const todayMD = `${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
    const todayYear = today.getFullYear();
    return collectionApi.getAll()
      .filter(item => item.data.tags && item.data.tags.includes("diary"))
      .filter(item => {
        const d = item.date;
        const itemMD = `${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
        return itemMD === todayMD && d.getFullYear() < todayYear;
      })
      .map(item => {
        item.data.yearsAgo = todayYear - item.date.getFullYear();
        return item;
      })
      .sort((a, b) => b.date - a.date);
  });

  // ===========================================
  // ATOM FEED HELPERS (used by src/feed.njk → /feed.xml)
  // ===========================================
  // The first two filters share their names with the official
  // @11ty/eleventy-plugin-rss filters, so the feed template reads like the
  // Eleventy docs and would keep working if that plugin were ever swapped in.

  // Atom dates must be RFC 3339, e.g. 2026-10-17T00:00:00Z. toISOString()
  // already is; trimming the ".000" milliseconds just keeps the output tidy.
  eleventyConfig.addFilter("dateToRfc3339", (date) =>
    new Date(date).toISOString().replace(/\.000Z$/, "Z"));

  // Feed-level <updated>: the newest item's date, so it only moves when an
  // entry does, not on every daily rebuild. Falls back to the build time when
  // the collection is empty, because <updated> is required even then.
  eleventyConfig.addFilter("getNewestCollectionItemDate", (items) => {
    const times = (items || []).map(item => item.date.getTime());
    return times.length ? new Date(Math.max(...times)) : new Date();
  });

  // XML 1.0 cannot carry most control characters at all (escaping doesn't
  // help), so one stray byte in an emailed diary reply would invalidate the
  // whole feed. Keeps only what XML allows: tab, LF, CR, U+0020–U+D7FF,
  // U+E000–U+FFFD and U+10000–U+10FFFF (lone surrogates are dropped).
  eleventyConfig.addFilter("stripInvalidXmlChars", (value) =>
    String(value ?? "").replace(/[^\t\n\r\u{20}-\u{D7FF}\u{E000}-\u{FFFD}\u{10000}-\u{10FFFF}]/gu, ""));

  // File name without folder or extension, e.g.
  // "./src/diary/entries/2025-08-24-entry.md" → "2025-08-24-entry".
  // Feed entry ids are built from this. page.fileSlug can't be used: it drops
  // the YYYY-MM-DD- prefix, so 2025-08-24-entry.md and 2025-08-25-entry.md
  // would both become "entry" and collide.
  eleventyConfig.addFilter("fileStem", (filePath) => path.parse(filePath).name);

  // Art section collections
  eleventyConfig.addCollection("paintingImages", createImageCollection("art/painting", "art/painting"));
  eleventyConfig.addCollection("drawingImages", createImageCollection("art/drawing", "art/drawing"));
  eleventyConfig.addCollection("modellingImages", createImageCollection("art/modelling", "art/modelling"));
  eleventyConfig.addCollection("printingImages", createImageCollection("art/printing", "art/printing"));
  
  // Music section collections
  eleventyConfig.addCollection("electroImages", createImageCollection("music/electro", "music/electro"));
  eleventyConfig.addCollection("ambientImages", createImageCollection("music/ambient", "music/ambient"));
  eleventyConfig.addCollection("melodicImages", createImageCollection("music/melodic", "music/melodic"));
  eleventyConfig.addCollection("breaksImages", createImageCollection("music/breaks", "music/breaks"));
  
  // Video section collections
  eleventyConfig.addCollection("realtimeImages", createImageCollection("video/realtime", "video/realtime"));
  eleventyConfig.addCollection("mappingImages", createImageCollection("video/mapping", "video/mapping"));
  eleventyConfig.addCollection("mixingImages", createImageCollection("video/mixing", "video/mixing"));
  eleventyConfig.addCollection("editingImages", createImageCollection("video/editing", "video/editing"));
  
  // Data section collections
  eleventyConfig.addCollection("webdevImages", createImageCollection("data/webdev", "data/webdev"));
  eleventyConfig.addCollection("cloudImages", createImageCollection("data/cloud", "data/cloud"));
  eleventyConfig.addCollection("genaiImages", createImageCollection("data/genai", "data/genai"));
  eleventyConfig.addCollection("codingImages", createImageCollection("data/coding", "data/coding"));

  // Combined collection of ALL images for homepage
  eleventyConfig.addCollection("allImages", (collectionApi) => {
    const allImages = [];
    const folders = [
      'home', 
      'art/painting', 'art/drawing', 'art/modelling', 'art/printing',
      'music/electro', 'music/ambient', 'music/melodic', 'music/breaks',
      'video/realtime', 'video/mapping', 'video/mixing', 'video/editing',
      'data/webdev', 'data/cloud', 'data/genai', 'data/coding'
    ];
    
    folders.forEach(folder => {
      const imgPath = `./src/images/${folder}`;
      if (fs.existsSync(imgPath)) {
        const files = fs.readdirSync(imgPath).filter(f => 
          /\.(jpg|jpeg|png|gif|webp|svg)$/i.test(f)
        );
        files.forEach(file => {
          allImages.push({
            url: `/images/${folder}/${file}`,
            fileSlug: file.replace(/\.[^/.]+$/, ''),
            folder: folder
          });
        });
      }
    });
    
    // Shuffle for variety
    return allImages.sort(() => Math.random() - 0.5);
  });

  // Add a split filter for string manipulation (used in OG image path detection)
  eleventyConfig.addFilter("split", function(str, separator) {
    if (!str) return [];
    return str.split(separator);
  });

  // Add a custom filter to check if a given URL matches the current page (for highlighting nav links)
  eleventyConfig.addFilter("isCurrentPage", function(url, page) {
    return url === page.url;
  });
  
  // Add a filter to check if a section is active (for section highlighting in nav)
  eleventyConfig.addFilter("isActiveSection", function(sectionUrl, pageUrl) {
    if (sectionUrl === "/" && pageUrl === "/") return true;
    if (sectionUrl !== "/" && pageUrl.startsWith(sectionUrl)) return true;
    return false;
  });

  // Return the Eleventy configuration object
  return {
    dir: { // Directory settings
      input: "src", // Source files live in src/
      output: "_site", // Built site output goes to _site/
      includes: "_includes", // Nunjucks includes live here
      layouts: "_layouts", // Layout templates live here
      data: "_data" // Global data files
    },
    templateFormats: ["html", "md", "njk"], // Supported template formats
    htmlTemplateEngine: "njk", // Use Nunjucks for HTML templates
    markdownTemplateEngine: "njk" // Use Nunjucks to render Markdown
  };
};
