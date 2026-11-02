/*
 * .eleventy.js
 * This is the main configuration file for Eleventy (11ty), the static site generator.
 * - Sets up asset passthroughs, watch targets, and custom filters for navigation.
 * - Builds the sitemap's page list and checks it never lists private or noindex pages.
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

  // ===========================================
  // SITEMAP (src/sitemap.njk -> /sitemap.xml)
  // ===========================================
  // The sitemap lists public pages only. A page is listed when every test in
  // isSitemapPage passes. To keep a page out, give it `noindex: true` (also adds
  // the robots meta) or `sitemap: false` (sitemap only) in its front matter.
  // Pages with eleventyExcludeFromCollections are never in collections.all, so
  // they are never listed either (e.g. /diary/, /404.html).
  // Private = first path segment is "private": /private/..., /private.html, /private.
  const isPrivatePath = url => /^\/private(?:[\/.]|$)/i.test(url);
  function isSitemapPage(item) {
    const url = item.url;
    const data = item.data || {};
    if (typeof url !== "string") return false;                      // permalink: false (diary entries, briefings)
    if (!url.endsWith("/") && !url.endsWith(".html")) return false; // not an HTML page (xml, txt, json...)
    if (isPrivatePath(url)) return false;                           // never advertise anything under /private/
    if (data.noindex) return false;                                 // same test base.njk uses for its robots meta
    if (data.sitemap === false) return false;                       // explicit opt-out
    if (!data.layout) return false;                                 // bare fragment, e.g. src/images/README.md -> /images/README/
    return true;
  }

  // Absolute URLs of the pages to list, sorted so the file only changes when pages do.
  // Usage: {% for loc in collections.all | sitemapUrls(site.url) %}
  eleventyConfig.addFilter("sitemapUrls", function(items, siteUrl) {
    if (!/^https?:\/\//.test(siteUrl || "")) {
      throw new Error(`sitemapUrls needs an absolute site URL (site.url in src/_data/site.json), got: ${siteUrl}`);
    }
    return (Array.isArray(items) ? items : [])
      .filter(isSitemapPage)
      .map(item => new URL(item.url, siteUrl).href)
      .sort();
  });

  // Build-time check of the sitemap's hard rule: it must never list a /private/
  // URL or a page whose rendered HTML carries a robots noindex meta. It reads the
  // rendered output rather than front matter, so it also catches a noindex meta
  // typed straight into a template. Throwing here makes `npm run build` exit 1,
  // so a leak stops the deploy and the last good deploy stays live.
  const NOINDEX_META = /<meta\b(?=[^>]*\bname\s*=\s*["']?(?:robots|googlebot)["'\s\/>])(?=[^>]*\bcontent\s*=\s*["']?[^"'>]*\b(?:noindex|none)\b)[^>]*>/i;
  eleventyConfig.on("eleventy.after", function({ results }) {
    const sitemap = (results || []).find(r => r.url === "/sitemap.xml");
    if (!sitemap) return; // e.g. an incremental rebuild that didn't re-render it
    const unescapeXml = s => s.replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&amp;/g, "&");
    const listed = new Set(
      [...String(sitemap.content).matchAll(/<loc>\s*([^<]*?)\s*<\/loc>/g)].map(m => new URL(unescapeXml(m[1])).pathname)
    );
    const problems = [...listed].filter(isPrivatePath).map(p => `${p} (under /private/)`);
    for (const r of results) {
      if (typeof r.url !== "string" || isPrivatePath(r.url)) continue;
      if (listed.has(new URL(r.url, "https://example.invalid").pathname) && NOINDEX_META.test(String(r.content))) {
        problems.push(`${r.url} (noindex, from ${r.inputPath})`);
      }
    }
    if (problems.length > 0) {
      throw new Error(`sitemap.xml must list public pages only, but it lists: ${problems.join(", ")}. ` +
        "Give the page `noindex: true` or `sitemap: false` in its front matter, or move it out of /private/.");
    }
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
