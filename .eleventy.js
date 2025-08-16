/*
 * .eleventy.js
 * This is the main configuration file for Eleventy (11ty), the static site generator.
 * - Sets up asset passthroughs, watch targets, and custom filters for navigation.
 * - Configures input/output directories and template engines.
 * All major sections and lines are commented below for teaching clarity.
 */

module.exports = function(eleventyConfig) {
  // Copy static assets from source to output so they're available in the built site
  eleventyConfig.addPassthroughCopy("src/assets"); // Copy all files from src/assets
  eleventyConfig.addPassthroughCopy("src/images"); // Copy all images
  eleventyConfig.addPassthroughCopy("images"); // Also copy images from project root if present
  // Map src/js -> /js and src/css -> /css so template paths like /js/foo.js and /css/style.css resolve
  eleventyConfig.addPassthroughCopy({ "src/js": "js" }); // Copy all JavaScript files to /js
  eleventyConfig.addPassthroughCopy({ "src/css": "css" }); // Copy all CSS files to /css
  
  // Copy GSAP files from root js directory to js/gsap/ to avoid main.js conflict
  eleventyConfig.addPassthroughCopy({ "js/gsap": "js/gsap" }); // Copy only GSAP directory
  
  // Tell Eleventy to watch these files for changes and trigger rebuilds
  eleventyConfig.addWatchTarget("src/css/"); // Watch the CSS directory
  eleventyConfig.addWatchTarget("src/input.css"); // Watch the main input.css
  
  // Add a custom collection for all texture images in src/images/images/textures
  const fs = require('fs');
  const path = require('path');
  eleventyConfig.addCollection("textures", function() {
    const texturesDir = path.join(__dirname, "src", "images", "images", "textures");
    if (!fs.existsSync(texturesDir)) return [];
    return fs.readdirSync(texturesDir)
      .filter(file => /\.(jpg|jpeg|png|gif|webp)$/i.test(file))
      .map(file => ({
        url: `/images/images/textures/${file}`,
        fileSlug: file.replace(/\.[^/.]+$/, "")
      }));
  });

  // Add a custom collection for all background images in src/images/images/backgrounds
  // This collection powers the hero section background slideshow feature
  // Similar to textures collection above, but specifically for high-resolution background images
  eleventyConfig.addCollection("backgrounds", function() {
    // Build the absolute path to the backgrounds directory
    // Using path.join() ensures cross-platform compatibility (Windows/Mac/Linux)
    const backgroundsDir = path.join(__dirname, "src", "images", "images", "backgrounds");
    
    // Safety check: if directory doesn't exist, return empty array to prevent errors
    // This allows the site to build even if backgrounds folder is missing
    if (!fs.existsSync(backgroundsDir)) return [];
    
    // Read all files in the backgrounds directory and process them
    return fs.readdirSync(backgroundsDir)
      // Filter to only include image files (jpg, jpeg, png, gif, webp)
      // Case-insensitive regex ensures files like .JPG or .PNG are included
      .filter(file => /\.(jpg|jpeg|png|gif|webp)$/i.test(file))
      // Transform each filename into an object with URL and slug
      .map(file => ({
        // Create the public URL path that will be used in templates
        // This matches the passthrough copy structure defined above
        url: `/images/images/backgrounds/${file}`,
        // Create a clean slug by removing the file extension
        // Useful for CSS classes, IDs, or alt text generation
        fileSlug: file.replace(/\.[^/.]+$/, "")
      }));
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
