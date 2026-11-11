/*
 * .eleventy.js
 * This is the main configuration file for Eleventy (11ty), the static site generator.
 * - Sets up asset passthroughs, watch targets, and custom filters for navigation.
 * - Builds the sitemap's page list and checks it never lists private or noindex pages.
 * - Configures input/output directories and template engines.
 * All major sections and lines are commented below for teaching clarity.
 */

const fs = require('fs');
const { toPublicApp } = require('./src/_utils/apps'); // public/private rule for the app catalogue
const structuredData = require('./src/_utils/structured-data'); // schema.org JSON-LD: builders + build-time validation
const contentSnapshots = require('./src/_data/contentSnapshots.json');
const promoteGalleryImages = require('./src/assets/gallery-variety.js');
function mixContentImages(key, art) {
  if (['home','music','video','art','data'].includes(key)) return art;
  const cards = contentSnapshots[key] || [], result = [];
  for (let i=0; i<Math.max(cards.length,art.length); i++) {
    if(cards[i]) result.push(cards[i]);
    if(art[i]) result.push(art[i]);
  }
  return result;
}

module.exports = function(eleventyConfig) {
  eleventyConfig.addFilter('siteAbsoluteUrl', value => /^https?:\/\//.test(String(value)) ? value : 'https://wavgen.ca' + value);
  eleventyConfig.addPassthroughCopy({'node_modules/three/build/three.module.js':'assets/vendor/three.module.js','node_modules/three/build/three.core.js':'assets/vendor/three.core.js','node_modules/three/LICENSE':'assets/vendor/three-LICENSE.txt'});
  eleventyConfig.addTransform('card-images', require('./src/_utils/card-images.cjs'));
  eleventyConfig.addFilter('snapshotKey', url => String(url).replace(/^\/+|\/+$/g, '') || 'home');
  eleventyConfig.addFilter("approvedForPage", (url, images) => {
    const key = String(url || "/").replace(/^\/+|\/+$/g, "") || "home";
    const promoted = promoteGalleryImages(images);
    return mixContentImages(key, promoted[key] || promoted[key.split("/")[0]] || []);
  });
  eleventyConfig.addFilter("pageHeading", value => String(value || "").split("\u2014")[0].replace(/ World$/, "").trim());
  // Publish only runtime assets. Developer READMEs are still rendered by Eleventy;
  // changing those public routes is a separate editorial decision.
  eleventyConfig.addPassthroughCopy({ "src/manifest.webmanifest": "manifest.webmanifest" });
  eleventyConfig.addPassthroughCopy("src/assets");
  // Images are served by R2; audio/video migration is a separate task.
  eleventyConfig.addPassthroughCopy("src/images/**/*.{mp4,webm}");
  eleventyConfig.addPassthroughCopy("src/css/style.css");
  eleventyConfig.addPassthroughCopy("src/css/media.css");
  eleventyConfig.addPassthroughCopy("src/js/media-embeds.js");
  eleventyConfig.addPassthroughCopy("src/css/systems/worlds.css");
  for (const name of ["main", "home", "gallery", "placeholder-visuals", "code-playground", "data-app-embed", "command-palette"]) {
    eleventyConfig.addPassthroughCopy(`src/js/${name}.js`);
  }
  eleventyConfig.addPassthroughCopy("src/js/worlds/big-data.js");
  for (const name of ["gsap", "ScrollTrigger", "Flip", "TextPlugin"]) {
    eleventyConfig.addPassthroughCopy({ [`js/gsap/${name}.min.js`]: `js/gsap/${name}.min.js` });
  }
  eleventyConfig.addPassthroughCopy({ "worlds": "worlds" });

  // Tell Eleventy to watch these files for changes and trigger rebuilds
  eleventyConfig.addWatchTarget("src/css/"); // Watch the CSS directory
  eleventyConfig.addWatchTarget("src/input.css"); // Watch the main input.css
  
  const approvedImages = promoteGalleryImages(require("./src/_data/approvedImages.json"));
  eleventyConfig.addPassthroughCopy("src/js/approved-images.js");

  // Helper function to create image collections from a directory
  // Used to generate page-specific image galleries throughout the site
  const fs = require('fs');
  const path = require('path');
  
  function createImageCollection(dirPath, urlPath) {
    return function() {
      if (approvedImages[dirPath]) return mixContentImages(dirPath, approvedImages[dirPath]);
      const prefix = `/images/${dirPath}/`;
      return require('./config/media-manifest.json').entries
        .filter(e => e.path.startsWith(prefix) && !e.path.slice(prefix.length).includes('/') && /\.(jpg|jpeg|png|gif|webp)$/i.test(e.path))
        .map(e => ({url:e.path,fileSlug:path.parse(e.path).name}));
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

  // Modification dates come from full Git history, with local edit support.
  const updated = require('./src/_utils/feed-dates').createUpdatedResolver(__dirname);
  eleventyConfig.addFilter("entryUpdated", updated);
  eleventyConfig.addFilter("getNewestCollectionItemDate", (items) => {
    const times = (items || []).map(item => updated(item).getTime());
    return times.length ? new Date(Math.max(...times)) : new Date(0);
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
    return ["home", "music", "art", "video", "data"].flatMap(key => approvedImages[key] || []);

  });

  // App catalogue (src/_data/apps.json): project each entry down to what the
  // PUBLIC showcase may show. A private app's launchUrl (e.g. a tailnet host)
  // is dropped so it never reaches public HTML; only the unlinked private
  // launchpad page reads launchUrl for every app. publicUrl is the one link a
  // public card may carry: the launch URL of a public app, else its demo URL.
  // The rule lives in src/_utils/apps.js so the structured data below uses it too.
  eleventyConfig.addFilter("publicApps", function(items) {
    if (!Array.isArray(items)) return [];
    return items.map(toPublicApp);
  });

  // Distinct, non-empty values of `key` across an array (keeps first-seen order)
  eleventyConfig.addFilter("uniqueBy", function(items, key) {
    if (!Array.isArray(items)) return [];
    return [...new Set(items.map(i => i && i[key]).filter(Boolean))];
  });

  // Serendipity counts, computed from the app catalogue so they never go stale.
  // Lines in src/_data/serendipity.json use {N:key} (count as a word) and
  // {names:key} (matching app names). A line whose count is below 2 is dropped,
  // since its wording assumes a plural.
  const estateGroups = {
    apps:    () => true,
    desktop: app => (app.tech || []).includes("Desktop"),
    r2:      app => (app.tech || []).includes("Cloudflare R2"),
    tailnet: app => (app.access || "").startsWith("Tailnet only")
  };
  const numberWords = ["zero","one","two","three","four","five","six","seven","eight","nine","ten",
    "eleven","twelve","thirteen","fourteen","fifteen","sixteen","seventeen","eighteen","nineteen","twenty"];
  const listNames = names => names.length < 2 ? names.join("")
    : names.slice(0, -1).join(", ") + " and " + names[names.length - 1];
  eleventyConfig.addFilter("estateFacts", function(lines, items) {
    if (!Array.isArray(lines)) return [];
    const apps = Array.isArray(items) ? items : [];
    return lines.map(line => {
      let ok = true;
      const out = String(line).replace(/\{(N|names):(\w+)\}/g, (token, kind, key, offset) => {
        const test = estateGroups[key];
        if (!test) { ok = false; return token; }
        const matched = apps.filter(test);
        if (matched.length < 2) ok = false;
        if (kind === "names") return listNames(matched.map(a => a.name));
        const word = numberWords[matched.length] || String(matched.length);
        return offset === 0 ? word.charAt(0).toUpperCase() + word.slice(1) : word;
      });
      return ok ? out : "";
    }).filter(Boolean);
  });

  // Pick one item from a list by calendar day (UTC), so it rotates daily.
  // Deterministic: the same day always yields the same item. Defaults to the
  // build date; the daily scheduled deploy is what makes the live page rotate.
  eleventyConfig.addFilter("dailyPick", function(items, date) {
    if (!Array.isArray(items) || items.length === 0) return "";
    const d = date ? new Date(date) : new Date();
    const day = Math.floor(d.getTime() / 86400000);
    return items[((day % items.length) + items.length) % items.length];
  });

  // ===========================================
  // STRUCTURED DATA (schema.org JSON-LD)
  // ===========================================
  // Built at build time from the data files by src/_utils/structured-data.js;
  // never type JSON-LD into a template.
  //   home page: WebSite + Person   <- src/_data/site.json        (src/_layouts/base.njk)
  //   /data/:    ItemList of public SoftwareApplications
  //                                 <- src/_data/apps.json        (components/app-showcase.njk)

  // Read a JSON file fresh on every call (no require cache), so watch-mode
  // rebuilds see edits. Returns `fallback` when the file doesn't exist.
  function readJsonFile(relativePath, fallback) {
    const fullPath = path.join(__dirname, relativePath);
    if (!fs.existsSync(fullPath)) return fallback;
    return JSON.parse(fs.readFileSync(fullPath, "utf8"));
  }

  // The web app manifest already names the site ("Wavgen.ca" / "Wavgen"); those
  // names become WebSite.alternateName instead of being typed out again.
  eleventyConfig.addGlobalData("webManifest", () => readJsonFile("src/manifest.webmanifest", {}));

  eleventyConfig.addFilter("siteJsonLd", function(site, manifest) {
    return structuredData.siteGraph(site, manifest);
  });
  eleventyConfig.addFilter("appCatalogueJsonLd", function(items, site, pageUrl, catalogue) {
    return structuredData.appCatalogueList(items, site, pageUrl, catalogue);
  });
  // Wraps data in <script type="application/ld+json">, escaped so no value can
  // close the tag early. Returns "" for null. Use it with `| safe`.
  eleventyConfig.addFilter("jsonLdScript", function(data) {
    return structuredData.jsonLdScriptTag(data);
  });

  // Validate the JSON-LD Eleventy actually wrote. Every live block on every
  // page must match a known shape, a block inside an HTML comment fails, no
  // non-public app or private launch URL may appear, and the home page and the
  // catalogue must carry their live blocks. Any problem fails the build (exit
  // code 1), so the deploy never publishes it.
  eleventyConfig.on("eleventy.after", function({ results, outputMode, incremental }) {
    if (outputMode !== "fs") return;
    const report = structuredData.validateBuild(results, {
      site: readJsonFile("src/_data/site.json", {}),
      apps: readJsonFile("src/_data/apps.json", { items: [] }),
      catalogueVisible: readJsonFile("src/_data/features.json", {}).appCatalogue !== false,
      // Incremental rebuilds re-render only the changed pages, so the
      // site-wide "is every block present" checks would misfire there.
      coverage: !incremental && Array.isArray(results) && results.length > 0
    });
    if (report.errors.length > 0) {
      const count = report.errors.length;
      throw new Error(`JSON-LD validation failed (${count} problem${count === 1 ? "" : "s"}):\n  - ` +
        report.errors.join("\n  - "));
    }
    console.log(`[11ty/json-ld] ${report.summary}`);
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
