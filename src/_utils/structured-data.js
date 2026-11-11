/*
 * src/_utils/structured-data.js
 * schema.org structured data (JSON-LD) for wavgen.ca.
 *
 * Nothing here is typed by hand: every value comes from the site's data files
 * at build time, and the build fails if what was emitted has the wrong shape.
 *
 *   Block                               Built from                             Emitted by
 *   WebSite + Person (one @graph)       src/_data/site.json, plus the site     src/_layouts/base.njk
 *                                       names in src/manifest.webmanifest      (home page only)
 *   ItemList of SoftwareApplication     src/_data/apps.json, ONLY apps with    src/_includes/components/
 *                                       "visibility": "public"                 app-showcase.njk (/data/)
 *
 * Validation (wired up in .eleventy.js on eleventy.after): validateBuild() reads
 * the HTML Eleventy actually wrote, using parse5 (the WHATWG HTML parser), so it
 * sees exactly the <script type="application/ld+json"> elements a browser or
 * search engine sees. Every live block must parse and match SHAPES below, and a
 * block inside an HTML comment fails: it looks like structured data but nothing
 * reads it. On top of the shapes it checks that no non-public app (or private
 * launch URL) reaches structured data, and that the home page and the public
 * catalogue really carry their (live) blocks.
 *
 * To emit a new @type: add a builder here, a filter in .eleventy.js, AND a
 * shape in SHAPES. An unknown @type fails the build, so nothing ships unchecked.
 */
"use strict";

const { parse, parseFragment } = require("parse5");
const { isPublicApp, toPublicApp } = require("./apps");

const SCHEMA_CONTEXT = "https://schema.org";

// ---------------------------------------------------------------------------
// Small helpers
// ---------------------------------------------------------------------------

const isPlainObject = (v) => v !== null && typeof v === "object" && !Array.isArray(v);
const isNonEmptyString = (v) => typeof v === "string" && v.trim() !== "";

function isHttpUrl(v) {
  if (typeof v !== "string" || v === "" || v.trim() !== v) return false;
  try {
    const u = new URL(v);
    return (u.protocol === "https:" || u.protocol === "http:") && u.hostname !== "";
  } catch (e) {
    return false;
  }
}

// Absolute URL of a page: site.url + page.url, like the canonical link in
// base.njk, so structured data and <link rel="canonical"> agree. (A trailing
// slash on site.url is dropped first, so it can't produce "//".)
function absolutePageUrl(site, pagePath) {
  const base = site && typeof site.url === "string" ? site.url.replace(/\/+$/, "") : "";
  if (!isHttpUrl(base)) {
    throw new Error(`structured data: "url" in src/_data/site.json must be an absolute http(s) URL, got ${JSON.stringify(site && site.url)}`);
  }
  if (typeof pagePath !== "string" || !pagePath.startsWith("/")) {
    throw new Error(`structured data: expected a page path starting with "/", got ${JSON.stringify(pagePath)}`);
  }
  return base + pagePath;
}

function requireSiteText(site, key) {
  const value = site ? site[key] : undefined;
  if (!isNonEmptyString(value)) {
    throw new Error(`structured data: "${key}" in src/_data/site.json must be a non-empty string`);
  }
  return value;
}

// Every string value inside a parsed JSON-LD block, at any depth.
function* stringsIn(value) {
  if (typeof value === "string") {
    yield value;
  } else if (Array.isArray(value)) {
    for (const entry of value) yield* stringsIn(entry);
  } else if (isPlainObject(value)) {
    for (const entry of Object.values(value)) yield* stringsIn(entry);
  }
}

// ---------------------------------------------------------------------------
// Builders (called from templates through the filters in .eleventy.js)
// ---------------------------------------------------------------------------

// Stable node identifiers. The WebSite references the Person by @id instead of
// repeating it, so both live in one @graph on the home page.
function siteIds(site) {
  const home = absolutePageUrl(site, "/");
  return { home, website: `${home}#website`, person: `${home}#person` };
}

// The web app manifest already names the site ("Wavgen.ca", "Wavgen"). Those
// become WebSite.alternateName, which helps search engines pick a site name,
// without typing them a second time. Blanks, repeats and the main name drop out.
function alternateSiteNames(name, manifest) {
  const seen = new Set([name.trim().toLowerCase()]);
  const names = [];
  for (const candidate of [manifest && manifest.name, manifest && manifest.short_name]) {
    if (!isNonEmptyString(candidate)) continue;
    const key = candidate.trim().toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    names.push(candidate.trim());
  }
  return names;
}

// Home page graph: WebSite + Person, from src/_data/site.json.
//   site.title       -> WebSite.name
//   site.description -> WebSite.description
//   site.author      -> Person.name (the WebSite's author)
//   site.url         -> WebSite.url, Person.url and both @ids
function siteGraph(site, manifest) {
  const ids = siteIds(site);
  const name = requireSiteText(site, "title");

  const website = { "@type": "WebSite", "@id": ids.website, name, url: ids.home };
  const alternateNames = alternateSiteNames(name, manifest);
  if (alternateNames.length > 0) {
    website.alternateName = alternateNames.length === 1 ? alternateNames[0] : alternateNames;
  }
  if (isNonEmptyString(site.description)) website.description = site.description;
  website.author = { "@id": ids.person };

  const person = {
    "@type": "Person",
    "@id": ids.person,
    name: requireSiteText(site, "author"),
    url: ids.home
  };

  return { "@context": SCHEMA_CONTEXT, "@graph": [website, person] };
}

// One catalogue entry as a SoftwareApplication. Only fields apps.json actually
// has are mapped. Nothing is inferred (no price, rating or operating system),
// and the link is the same publicUrl the showcase card uses.
function softwareApplication(publicApp) {
  const node = { "@type": "SoftwareApplication", name: publicApp.name };
  if (publicApp.description) node.description = publicApp.description;
  if (publicApp.publicUrl) node.url = publicApp.publicUrl;
  if (publicApp.category) node.applicationCategory = publicApp.category;
  return node;
}

// The public app catalogue as an ItemList: one ListItem per app whose
// visibility is exactly "public", in apps.json order. Private apps are never
// listed, not even without their links. Returns null when no app is public,
// so the template emits nothing.
//   items      apps.items from src/_data/apps.json
//   pagePath   page.url of the page that shows the catalogue (for the list's @id)
//   catalogue  { title, anchor }, shared with the visible heading and section id
function appCatalogueList(items, site, pagePath, catalogue) {
  const apps = (Array.isArray(items) ? items : []).filter(isPublicApp).map(toPublicApp);
  if (apps.length === 0) return null;

  const list = { "@context": SCHEMA_CONTEXT, "@type": "ItemList" };
  if (catalogue && isNonEmptyString(catalogue.anchor)) {
    list["@id"] = `${absolutePageUrl(site, pagePath)}#${catalogue.anchor}`;
  }
  if (catalogue && isNonEmptyString(catalogue.title)) list.name = catalogue.title;
  list.numberOfItems = apps.length;
  list.itemListElement = apps.map((app, index) => ({
    "@type": "ListItem",
    position: index + 1,
    item: softwareApplication(app)
  }));
  return list;
}

// ---------------------------------------------------------------------------
// Serialising and finding JSON-LD in HTML
// ---------------------------------------------------------------------------

// A complete <script type="application/ld+json"> element, or "" for no data.
// JSON.stringify alone is not safe inside <script>: a "</script>" in any string
// value would end the element early. Escaping <, > and & (and the two Unicode
// line separators) as \uXXXX keeps the JSON identical once parsed.
function jsonLdScriptTag(data) {
  if (data === null || data === undefined || data === "") return "";
  const json = JSON.stringify(data, null, 2)
    .replace(/</g, "\\u003c")
    .replace(/>/g, "\\u003e")
    .replace(/&/g, "\\u0026")
    .replace(/\u2028/g, "\\u2028")
    .replace(/\u2029/g, "\\u2029");
  return `<script type="application/ld+json">\n${json}\n</script>`;
}

// The JSON-LD in a page, as the HTML parser sees it. A regex over raw HTML
// can't tell what sits inside a comment; parse5 follows the HTML parsing spec,
// so "live" means exactly the script elements a browser or crawler builds.
//   live          text of every <script type="application/ld+json"> element
//   commentedOut  text of every JSON-LD script inside an HTML comment, including
//                 conditional and never-closed comments. Nothing reads these,
//                 so validatePage fails them instead of skipping them.
function findJsonLd(html) {
  const found = { live: [], commentedOut: [] };
  if (typeof html === "string") collectJsonLd(parse(html), found.live, found.commentedOut);
  return found;
}

// Walk a parse5 tree. A comment's text is parsed as HTML in turn, so a JSON-LD
// script anywhere inside it (even in a comment that looks nested) is found and
// filed under commentedOut.
function collectJsonLd(node, live, commentedOut) {
  if (node.nodeName === "#comment") {
    collectJsonLd(parseFragment(node.data), commentedOut, commentedOut);
    return;
  }
  if (isJsonLdScript(node)) live.push(textOf(node));
  for (const child of node.childNodes || []) collectJsonLd(child, live, commentedOut);
}

// type="application/ld+json", compared like a MIME type: case-insensitive, with
// surrounding spaces and any ";parameters" ignored.
function isJsonLdScript(node) {
  if (node.nodeName !== "script" || !Array.isArray(node.attrs)) return false;
  const type = node.attrs.find((attr) => attr.name === "type");
  return Boolean(type) && type.value.split(";")[0].trim().toLowerCase() === "application/ld+json";
}

function textOf(node) {
  return (node.childNodes || []).filter((c) => c.nodeName === "#text").map((c) => c.value).join("");
}

// A short one-line excerpt of a block, to help find it in the page.
function excerpt(raw, max = 60) {
  const flat = String(raw).replace(/\s+/g, " ").trim();
  return flat.length > max ? `${flat.slice(0, max)}...` : flat;
}

// ---------------------------------------------------------------------------
// Shapes: the only JSON-LD this site may emit
// ---------------------------------------------------------------------------
// Each @type lists the properties it may carry (anything else fails, which
// catches typos and hand-added fields) and the ones it must carry. A property
// spec is either a value check (returns an error message or null) or node(...)
// for a property whose value is another node.

const text = (v) => (isNonEmptyString(v) ? null : "must be a non-empty string");
const url = (v) => (isHttpUrl(v) ? null : "must be an absolute http(s) URL");
const textOrList = (v) => {
  const ok = Array.isArray(v) ? v.length > 0 && v.every(isNonEmptyString) : isNonEmptyString(v);
  return ok ? null : "must be a non-empty string or a non-empty list of them";
};
const position = (v) => (Number.isInteger(v) && v >= 1 ? null : "must be an integer >= 1");
const count = (v) => (Number.isInteger(v) && v >= 0 ? null : "must be an integer >= 0");

// node("Person")                     one Person, embedded or referenced as {"@id": ...}
// node("ListItem", { list: true })   a non-empty array of them
// node(null, { embed: true })        any @type that has a shape, embedded (not a reference)
function node(type, { list = false, embed = false } = {}) {
  return { node: true, type, list, embed };
}

const SHAPES = {
  WebSite: {
    required: ["name", "url"],
    properties: { name: text, url, alternateName: textOrList, description: text, author: node("Person") }
  },
  Person: {
    required: ["name"],
    properties: { name: text, url }
  },
  ItemList: {
    required: ["itemListElement"],
    properties: {
      name: text,
      numberOfItems: count,
      itemListElement: node("ListItem", { list: true, embed: true })
    },
    // Positions run 1..n in list order, and numberOfItems (when given) matches.
    check(value, at, report) {
      if (!Array.isArray(value.itemListElement)) return;
      value.itemListElement.forEach((entry, i) => {
        if (isPlainObject(entry) && Number.isInteger(entry.position) && entry.position !== i + 1) {
          report(`${at}.itemListElement[${i}].position`, `must be ${i + 1} (positions count 1..n in list order), got ${entry.position}`);
        }
      });
      if ("numberOfItems" in value && value.numberOfItems !== value.itemListElement.length) {
        report(`${at}.numberOfItems`, `is ${JSON.stringify(value.numberOfItems)} but itemListElement has ${value.itemListElement.length} entries`);
      }
    }
  },
  ListItem: {
    required: ["position", "item"],
    properties: { position, item: node(null, { embed: true }) }
  },
  SoftwareApplication: {
    required: ["name"],
    properties: { name: text, description: text, url, applicationCategory: text }
  }
};

// ---------------------------------------------------------------------------
// Validation
// ---------------------------------------------------------------------------

function report(ctx, path, message) {
  ctx.errors.push(`block ${ctx.block} ${path}: ${message}`);
}

function validateNode(value, path, ctx, { expected = null, topLevel = false, ancestors = [] } = {}) {
  if (!isPlainObject(value)) return report(ctx, path, "must be a JSON object");
  const type = value["@type"];
  if (typeof type !== "string" || !SHAPES[type]) {
    return report(ctx, path, typeof type === "string"
      ? `@type "${type}" has no shape; add a builder and a shape in src/_utils/structured-data.js before emitting it`
      : `"@type" must be one of: ${Object.keys(SHAPES).join(", ")}`);
  }
  if (expected && type !== expected) report(ctx, path, `must be a ${expected}, got ${type}`);

  const shape = SHAPES[type];
  ctx.nodes.push({ type, value, block: ctx.block, path, inList: ancestors.includes("ItemList") });

  if ("@id" in value) {
    const id = value["@id"];
    if (!isHttpUrl(id)) report(ctx, `${path}.@id`, "must be an absolute http(s) URL");
    else if (ctx.ids.has(id)) report(ctx, `${path}.@id`, `"${id}" is already used by another node on this page`);
    else ctx.ids.set(id, type);
  }

  for (const key of Object.keys(value)) {
    if (key === "@type" || key === "@id" || (topLevel && key === "@context")) continue;
    const spec = shape.properties[key];
    if (!spec) {
      report(ctx, path, `unexpected property "${key}" on ${type} (allowed: ${Object.keys(shape.properties).join(", ")})`);
      continue;
    }
    validateProperty(value[key], spec, `${path}.${key}`, ctx, [...ancestors, type]);
  }
  for (const key of shape.required) {
    if (!(key in value)) report(ctx, path, `${type} is missing required property "${key}"`);
  }
  if (shape.check) shape.check(value, path, (at, message) => report(ctx, at, message));
}

function validateProperty(value, spec, path, ctx, ancestors) {
  if (typeof spec === "function") {
    const problem = spec(value);
    if (problem) report(ctx, path, problem);
    return;
  }
  if (spec.list) {
    if (!Array.isArray(value) || value.length === 0) return report(ctx, path, "must be a non-empty array");
    value.forEach((entry, i) => validateNodeValue(entry, spec, `${path}[${i}]`, ctx, ancestors));
    return;
  }
  if (Array.isArray(value)) return report(ctx, path, "must be a single node, not an array");
  validateNodeValue(value, spec, path, ctx, ancestors);
}

// A node-valued property holds either an embedded node (validated against its
// own shape) or a reference {"@id": ...} to a node defined elsewhere on the page.
function validateNodeValue(value, spec, path, ctx, ancestors) {
  const isReference = isPlainObject(value) && !("@type" in value) && "@id" in value;
  if (!isReference) return validateNode(value, path, ctx, { expected: spec.type, ancestors });
  if (spec.embed) return report(ctx, path, `must be an embedded node with "@type", not a reference`);
  const extra = Object.keys(value).filter((k) => k !== "@id");
  if (extra.length > 0) report(ctx, path, `a reference may only contain "@id" (found ${extra.join(", ")})`);
  if (!isHttpUrl(value["@id"])) return report(ctx, `${path}.@id`, "must be an absolute http(s) URL");
  ctx.references.push({ id: value["@id"], type: spec.type, block: ctx.block, path });
}

function validateBlock(value, ctx) {
  if (!isPlainObject(value)) return report(ctx, "$", "a JSON-LD block must be a JSON object");
  if (value["@context"] !== SCHEMA_CONTEXT) {
    report(ctx, "$.@context", `must be "${SCHEMA_CONTEXT}", got ${JSON.stringify(value["@context"])}`);
  }
  if (!("@graph" in value)) return validateNode(value, "$", ctx, { topLevel: true });

  const extra = Object.keys(value).filter((k) => k !== "@context" && k !== "@graph");
  if (extra.length > 0) report(ctx, "$", `a block with "@graph" may only contain "@context" and "@graph" (found ${extra.join(", ")})`);
  if (!Array.isArray(value["@graph"]) || value["@graph"].length === 0) {
    return report(ctx, "$.@graph", "must be a non-empty array");
  }
  value["@graph"].forEach((entry, i) => validateNode(entry, `$.@graph[${i}]`, ctx));
}

// Validate every JSON-LD block in one HTML page. Returns { errors, nodes, blocks }:
// the typed nodes and parsed blocks feed the site-wide checks in validateBuild.
// Only live blocks are validated and counted. A commented-out block is an error
// of its own: it looks valid in the source, but nothing ever reads it, and it
// must not stand in for a block that should be live.
function validatePage(html) {
  const ctx = { errors: [], nodes: [], blocks: [], ids: new Map(), references: [], block: 0 };
  const { live, commentedOut } = findJsonLd(html);

  commentedOut.forEach((raw, index) => {
    ctx.errors.push(`commented-out block ${index + 1}: JSON-LD inside an HTML comment is never read as ` +
      `structured data, so it fails validation; delete it, or uncomment it so it is checked (starts: ${excerpt(raw)})`);
  });

  live.forEach((raw, index) => {
    ctx.block = index + 1;
    let value;
    try {
      value = JSON.parse(raw);
    } catch (e) {
      return report(ctx, "$", `is not valid JSON (${e.message})`);
    }
    ctx.blocks.push({ block: ctx.block, value });
    validateBlock(value, ctx);
  });

  // Every {"@id": ...} reference must land on a node of the right @type on this page.
  for (const ref of ctx.references) {
    const definedAs = ctx.ids.get(ref.id);
    if (!definedAs) {
      ctx.errors.push(`block ${ref.block} ${ref.path}: points at "${ref.id}", but no node on this page has that @id`);
    } else if (ref.type && definedAs !== ref.type) {
      ctx.errors.push(`block ${ref.block} ${ref.path}: points at "${ref.id}", which is a ${definedAs}, not a ${ref.type}`);
    }
  }
  return { errors: ctx.errors, nodes: ctx.nodes, blocks: ctx.blocks };
}

// The checks below re-read "visibility" straight from apps.json instead of
// calling isPublicApp(). The builders and the showcase cards share that rule,
// so if it ever broke they would leak together, and a guard that called it
// would agree with them. Same rule, deliberately written a second time here.
const markedPublic = (app) => Boolean(app) && app.visibility === "public";

// Catalogue rules, on every page: a SoftwareApplication must be an apps.json
// entry marked public and carry the same link as its showcase card, and no
// private launch URL may appear anywhere in structured data, whatever the block.
function checkCatalogueEntries(pages, appItems) {
  const errors = [];
  // URLs a public page may legitimately show: a public app's links, and any demo
  const shownPublicly = appItems
    .flatMap((a) => (markedPublic(a) ? [a.launchUrl, a.demoUrl] : [a && a.demoUrl]))
    .filter(isNonEmptyString);
  const privateLaunchUrls = appItems
    .filter((a) => a && !markedPublic(a) && isNonEmptyString(a.launchUrl))
    .map((a) => ({ id: a.id, url: a.launchUrl.trim() }))
    .filter((p) => !shownPublicly.some((u) => u.includes(p.url)));

  for (const page of pages) {
    for (const entry of page.nodes) {
      if (entry.type !== "SoftwareApplication" || !isNonEmptyString(entry.value.name)) continue;
      const where = `${page.label} block ${entry.block} ${entry.path}`;
      const named = appItems.filter((a) => a && a.name === entry.value.name);
      const publicNamed = named.filter(markedPublic);
      if (named.length === 0) {
        errors.push(`${where}: SoftwareApplication "${entry.value.name}" is not in src/_data/apps.json; catalogue structured data must be generated from it`);
      } else if (publicNamed.length === 0) {
        errors.push(`${where}: "${entry.value.name}" is not marked "visibility": "public" in src/_data/apps.json, so it must not appear in structured data`);
      } else if (!publicNamed.some((a) => (entry.value.url || "") === toPublicApp(a).publicUrl)) {
        errors.push(`${where}: url ${JSON.stringify(entry.value.url)} for "${entry.value.name}" does not match its public link in src/_data/apps.json`);
      }
    }
    for (const { block, value } of page.blocks) {
      for (const str of stringsIn(value)) {
        for (const secret of privateLaunchUrls) {
          if (str.includes(secret.url)) {
            errors.push(`${page.label} block ${block}: contains the launchUrl of private app "${secret.id}"; private launch links belong only on /private/apps/`);
          }
        }
      }
    }
  }
  return errors;
}

// The blocks this site promises, so one can't silently stop rendering: the home
// page carries exactly one WebSite (at the canonical home URL) and one Person,
// and every public app is listed in an emitted ItemList.
function checkCoverage(pages, site, appItems) {
  const errors = [];
  const home = pages.find((p) => p.url === "/");
  const homeNodes = home ? home.nodes : [];
  const websites = homeNodes.filter((n) => n.type === "WebSite");
  const people = homeNodes.filter((n) => n.type === "Person");

  if (websites.length !== 1) {
    errors.push(`/ (home page): expected exactly 1 WebSite node, found ${websites.length}`);
  } else {
    let homeUrl = null;
    try {
      homeUrl = absolutePageUrl(site, "/");
    } catch (e) {
      errors.push(e.message);
    }
    if (homeUrl && websites[0].value.url !== homeUrl) {
      errors.push(`/ (home page): WebSite url must be the canonical home URL ${homeUrl}, got ${JSON.stringify(websites[0].value.url)}`);
    }
  }
  if (people.length !== 1) errors.push(`/ (home page): expected exactly 1 Person node, found ${people.length}`);

  const listed = new Set(
    pages.flatMap((p) => p.nodes)
      .filter((n) => n.type === "SoftwareApplication" && n.inList)
      .map((n) => n.value.name)
  );
  for (const app of appItems.filter(markedPublic)) {
    if (!listed.has(app.name)) {
      errors.push(`public app "${app.id}" (${app.name}) is missing from the ItemList JSON-LD; src/_includes/components/app-showcase.njk emits it`);
    }
  }
  return errors;
}

function summarize(pages, appItems) {
  const counts = {};
  let blocks = 0;
  let pagesWithBlocks = 0;
  for (const page of pages) {
    blocks += page.blocks.length;
    if (page.blocks.length > 0) pagesWithBlocks += 1;
    for (const n of page.nodes) counts[n.type] = (counts[n.type] || 0) + 1;
  }
  const types = Object.entries(counts).map(([type, n]) => `${type} ${n}`).join(", ") || "none";
  const publicApps = appItems.filter(markedPublic).length;
  return `JSON-LD valid: ${blocks} block(s) on ${pagesWithBlocks} page(s) [${types}]; ` +
    `${publicApps} of ${appItems.length} catalogue apps are public`;
}

// Validate the JSON-LD on every HTML page Eleventy wrote, then the site-wide
// rules. `results` is eleventy.after's list of { inputPath, outputPath, url, content }.
//   site      parsed src/_data/site.json
//   apps      parsed src/_data/apps.json ({ items: [] } when there is none)
//   coverage  false on incremental rebuilds, whose results hold only changed pages
// Returns { errors, summary }; any error should fail the build.
function validateBuild(results, { site, apps, coverage = true, catalogueVisible = true } = {}) {
  const errors = [];
  const pages = [];
  for (const result of Array.isArray(results) ? results : []) {
    if (!result || typeof result.outputPath !== "string" || !result.outputPath.endsWith(".html")) continue;
    const page = validatePage(result.content);
    const label = `${result.url} (${result.inputPath})`;
    for (const e of page.errors) errors.push(`${label} ${e}`);
    if (page.blocks.length > 0 || page.errors.length > 0) pages.push({ url: result.url, label, ...page });
  }

  const appItems = apps && Array.isArray(apps.items) ? apps.items : [];
  errors.push(...checkCatalogueEntries(pages, appItems));
  if (coverage) errors.push(...checkCoverage(pages, site, catalogueVisible ? appItems : []));
  return { errors: [...new Set(errors)], summary: summarize(pages, appItems) };
}

module.exports = {
  SCHEMA_CONTEXT,
  SHAPES,
  siteGraph,
  appCatalogueList,
  jsonLdScriptTag,
  findJsonLd,
  validatePage,
  validateBuild
};
