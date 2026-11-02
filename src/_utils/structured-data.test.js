/*
 * Tests for src/_utils/structured-data.js and src/_utils/apps.js.
 * Run with `npm test` (Node's built-in test runner, no dependencies).
 *
 * Fixtures are made up so the tests don't change when the real catalogue does;
 * the last test runs the real data files through the same checks as the build.
 */
"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("fs");
const path = require("path");

const sd = require("./structured-data");
const { toPublicApp } = require("./apps");

const CTX = "https://schema.org";
const site = {
  url: "https://example.test",
  title: "Example Site",
  description: "A site about examples.",
  author: "Ada Lovelace"
};
const manifest = { name: "Example.test", short_name: "Example" };
const SECRET_URL = "https://secret-app.tail000000.ts.net";
const apps = {
  items: [
    { id: "open-app", name: "Open App", description: "A public app.", category: "Tools", tech: ["Node"], access: "Public", visibility: "public", launchUrl: "https://open.example.test", demoUrl: "" },
    { id: "secret-app", name: "Secret App", description: "A private app.", category: "Tools", tech: [], access: "Tailnet only", visibility: "private", launchUrl: SECRET_URL, demoUrl: "" },
    { id: "typo-app", name: "Typo App", visibility: "Public", launchUrl: "https://typo.example.test" },
    { id: "unset-app", name: "Unset App", launchUrl: "https://unset.example.test" },
    { id: "demo-app", name: "Demo App", visibility: "public", launchUrl: "", demoUrl: "https://demo.example.test" }
  ]
};
const catalogue = { anchor: "app-catalogue", title: "App catalogue" };

// Emit blocks the way the templates do, so the checks read real HTML.
const page = (...blocks) =>
  `<!doctype html><html><head>${blocks.map(sd.jsonLdScriptTag).join("\n")}</head><body><p>Hi</p></body></html>`;
const errorsFor = (...blocks) => sd.validatePage(page(...blocks)).errors;

// A complete, valid build: home page, catalogue page, and a page without JSON-LD.
function results({ home = page(sd.siteGraph(site, manifest)), data = page(sd.appCatalogueList(apps.items, site, "/data/", catalogue)) } = {}) {
  return [
    { url: "/", inputPath: "./src/index.njk", outputPath: "_site/index.html", content: home },
    { url: "/data/", inputPath: "./src/data/index.njk", outputPath: "_site/data/index.html", content: data },
    { url: "/about/", inputPath: "./src/about.njk", outputPath: "_site/about/index.html", content: "<p>No structured data here.</p>" }
  ];
}

// An ItemList around hand-made SoftwareApplication nodes (for the leak tests).
const listOf = (...items) => ({
  "@context": CTX,
  "@type": "ItemList",
  numberOfItems: items.length,
  itemListElement: items.map((item, i) => ({ "@type": "ListItem", position: i + 1, item: { "@type": "SoftwareApplication", ...item } }))
});

// ---------------------------------------------------------------------------
// Builders
// ---------------------------------------------------------------------------

test("home graph: WebSite + Person come from site data and are linked by @id", () => {
  const graph = sd.siteGraph(site, manifest);
  assert.equal(graph["@context"], CTX);
  const [website, person] = graph["@graph"];
  assert.deepEqual(website, {
    "@type": "WebSite",
    "@id": "https://example.test/#website",
    name: "Example Site",
    url: "https://example.test/",
    alternateName: ["Example.test", "Example"],
    description: "A site about examples.",
    author: { "@id": "https://example.test/#person" }
  });
  assert.deepEqual(person, {
    "@type": "Person",
    "@id": "https://example.test/#person",
    name: "Ada Lovelace",
    url: "https://example.test/"
  });
  assert.deepEqual(errorsFor(graph), []);
});

test("home graph: alternateName skips blanks, repeats and the main name", () => {
  const alt = (m) => sd.siteGraph(site, m)["@graph"][0].alternateName;
  assert.equal(alt({ name: "example site", short_name: "Ex" }), "Ex"); // one left: a plain string
  assert.equal(alt({ name: " ", short_name: "" }), undefined);
  assert.equal(alt(undefined), undefined);
  assert.equal(alt({ name: "Ex", short_name: "ex" }), "Ex");
});

test("home graph: fails loudly when site.json lacks what it needs", () => {
  assert.throws(() => sd.siteGraph({ ...site, url: "" }), /"url" in src\/_data\/site\.json/);
  assert.throws(() => sd.siteGraph({ ...site, url: "/relative" }), /"url" in src\/_data\/site\.json/);
  assert.throws(() => sd.siteGraph({ ...site, title: undefined }), /"title" in src\/_data\/site\.json/);
  assert.throws(() => sd.siteGraph({ ...site, author: "  " }), /"author" in src\/_data\/site\.json/);
});

test("catalogue: lists only apps marked exactly \"public\", in apps.json order", () => {
  const list = sd.appCatalogueList(apps.items, site, "/data/", catalogue);
  assert.equal(list["@id"], "https://example.test/data/#app-catalogue");
  assert.equal(list.name, "App catalogue");
  assert.equal(list.numberOfItems, 2);
  assert.deepEqual(list.itemListElement.map((e) => [e.position, e.item.name]), [[1, "Open App"], [2, "Demo App"]]);
  // "private", "Public" (wrong case) and a missing visibility all stay out
  const json = JSON.stringify(list);
  for (const hidden of ["Secret App", "Typo App", "Unset App", SECRET_URL]) assert.ok(!json.includes(hidden), hidden);
  assert.deepEqual(errorsFor(list), []);
});

test("catalogue: each entry carries exactly the link its showcase card uses", () => {
  const list = sd.appCatalogueList(apps.items, site, "/data/", catalogue);
  const [open, demo] = list.itemListElement.map((e) => e.item);
  assert.deepEqual(open, {
    "@type": "SoftwareApplication",
    name: "Open App",
    description: "A public app.",
    url: "https://open.example.test",
    applicationCategory: "Tools"
  });
  assert.equal(open.url, toPublicApp(apps.items[0]).publicUrl);
  assert.equal(demo.url, "https://demo.example.test"); // no launchUrl: falls back to the demo
  assert.equal(demo.url, toPublicApp(apps.items[4]).publicUrl);
});

test("catalogue: emits nothing when no app is public", () => {
  assert.equal(sd.appCatalogueList([apps.items[1], apps.items[2]], site, "/data/", catalogue), null);
  assert.equal(sd.appCatalogueList(undefined, site, "/data/", catalogue), null);
  assert.equal(sd.jsonLdScriptTag(null), "");
});

test("showcase projection never hands a private launchUrl to a public page", () => {
  assert.equal(toPublicApp(apps.items[1]).publicUrl, ""); // private
  assert.equal(toPublicApp(apps.items[2]).publicUrl, ""); // "Public" is not "public"
  assert.equal(toPublicApp(apps.items[3]).publicUrl, ""); // no visibility
  assert.equal(toPublicApp(apps.items[0]).publicUrl, "https://open.example.test");
});

// ---------------------------------------------------------------------------
// Serialising and extracting
// ---------------------------------------------------------------------------

test("script tag: no value can close the element early, and it parses back unchanged", () => {
  const data = { "@context": CTX, "@type": "Person", name: "</script><script>alert(1)</script> & <!-- \u2028 \u2029" };
  const tag = sd.jsonLdScriptTag(data);
  assert.equal(tag.match(/<\/script/gi).length, 1); // only the real closing tag
  assert.ok(!tag.includes("<!--"));
  const { live, commentedOut } = sd.findJsonLd(`<head>${tag}</head>`);
  assert.equal(live.length, 1);
  assert.deepEqual(commentedOut, []);
  assert.deepEqual(JSON.parse(live[0]), data);
});

test("extraction: finds exactly the JSON-LD script elements the HTML parser builds", () => {
  const html = [
    "<script>var x = '<script type=\"application/ld+json\">';</script>", // text inside another script
    "<script type=\"module\">import x from './x.js'</script>",
    "<script type='application/ld+json'>{\"a\":1}</script>",
    "<SCRIPT data-x=\"1\" type=application/ld+json>{\"b\":2}</SCRIPT>",
    "<script type=\" Application/LD+JSON; charset=utf-8 \">{\"c\":3}</script>", // a MIME type, parameters and all
    "<script type=\"application/ld+jsonx\">{\"d\":4}</script>",
    "<script type=\"text/plain\" type=\"application/ld+json\">{\"e\":5}</script>", // first duplicate attribute wins
    "<textarea><script type=\"application/ld+json\">{\"f\":6}</script></textarea>" // textarea content is text
  ].join("\n");
  const { live, commentedOut } = sd.findJsonLd(html);
  assert.deepEqual(live.map((b) => JSON.parse(b)), [{ a: 1 }, { b: 2 }, { c: 3 }]);
  assert.deepEqual(commentedOut, []);
});

// ---------------------------------------------------------------------------
// Shape validation
// ---------------------------------------------------------------------------

test("shapes: each kind of malformed block is reported", () => {
  const person = (extra) => ({ "@context": CTX, "@type": "Person", name: "A", ...extra });
  const cases = [
    ["wrong @context", person({ "@context": "http://schema.org" }), /\$\.@context: must be "https:\/\/schema\.org"/],
    ["array at the top", [person()], /a JSON-LD block must be a JSON object/],
    ["no @type", { "@context": CTX, name: "A" }, /"@type" must be one of/],
    ["@type without a shape", { "@context": CTX, "@type": "Recipe", name: "Cake" }, /@type "Recipe" has no shape/],
    ["missing required name", { "@context": CTX, "@type": "SoftwareApplication", url: "https://a.test" }, /SoftwareApplication is missing required property "name"/],
    ["typo'd property", person({ nmae: "B" }), /unexpected property "nmae" on Person/],
    ["empty name", person({ name: "" }), /\$\.name: must be a non-empty string/],
    ["relative url", person({ url: "/about/" }), /\$\.url: must be an absolute http\(s\) URL/],
    ["relative @id", person({ "@id": "#me" }), /\$\.@id: must be an absolute http\(s\) URL/],
    ["empty @graph", { "@context": CTX, "@graph": [] }, /\$\.@graph: must be a non-empty array/],
    ["extra key beside @graph", { "@context": CTX, "@graph": [person()], name: "x" }, /may only contain "@context" and "@graph"/],
    ["empty list", { ...listOf(), itemListElement: [] }, /itemListElement: must be a non-empty array/],
    ["numberOfItems mismatch", { ...listOf({ name: "Open App" }), numberOfItems: 3 }, /numberOfItems: is 3 but itemListElement has 1 entries/],
    ["positions out of order", { "@context": CTX, "@type": "ItemList", itemListElement: [{ "@type": "ListItem", position: 2, item: { "@type": "SoftwareApplication", name: "X" } }] }, /\[0\]\.position: must be 1/],
    ["position not an integer", { "@context": CTX, "@type": "ItemList", itemListElement: [{ "@type": "ListItem", position: "1", item: { "@type": "SoftwareApplication", name: "X" } }] }, /position: must be an integer >= 1/],
    ["list entry is not a ListItem", { "@context": CTX, "@type": "ItemList", itemListElement: [{ "@type": "SoftwareApplication", name: "X" }] }, /itemListElement\[0\]: must be a ListItem, got SoftwareApplication/],
    ["ListItem holds a reference", { "@context": CTX, "@type": "ItemList", itemListElement: [{ "@type": "ListItem", position: 1, item: { "@id": "https://a.test/#x" } }] }, /must be an embedded node with "@type", not a reference/]
  ];
  for (const [name, block, expected] of cases) {
    const errors = errorsFor(block);
    assert.ok(errors.some((e) => expected.test(e)), `${name}: got ${JSON.stringify(errors)}`);
  }
});

test("shapes: @id references must land on a node of the right type on the same page", () => {
  const graph = sd.siteGraph(site, manifest);
  const dangling = structuredClone(graph);
  dangling["@graph"][0].author = { "@id": "https://example.test/#nobody" };
  assert.ok(errorsFor(dangling).some((e) => /no node on this page has that @id/.test(e)));

  const wrongType = structuredClone(graph);
  wrongType["@graph"][0].author = { "@id": "https://example.test/#website" };
  assert.ok(errorsFor(wrongType).some((e) => /which is a WebSite, not a Person/.test(e)));

  const duplicate = structuredClone(graph);
  duplicate["@graph"].push({ ...duplicate["@graph"][1] });
  assert.ok(errorsFor(duplicate).some((e) => /already used by another node on this page/.test(e)));
});

test("shapes: a block that isn't JSON is reported, not skipped", () => {
  const html = "<script type=\"application/ld+json\">{ \"@context\": \"https://schema.org\", </script>";
  assert.ok(sd.validatePage(html).errors.some((e) => /block 1 \$: is not valid JSON/.test(e)));
});

// ---------------------------------------------------------------------------
// Commented-out JSON-LD: nothing ever reads it, so it must fail, not pass
// ---------------------------------------------------------------------------

const personBlock = { "@context": CTX, "@type": "Person", name: "Ada Lovelace" };
const personTag = sd.jsonLdScriptTag(personBlock);
const doc = (head) => `<!doctype html><html><head><title>t</title>${head}</head><body><p>Hi</p></body></html>`;
const COMMENTED_OUT = /^commented-out block \d+: JSON-LD inside an HTML comment is never read/;

test("commented-out JSON-LD is rejected, and a live block still validates", () => {
  // the block, live: valid, and counted
  const live = sd.validatePage(doc(personTag));
  assert.deepEqual(live.errors, []);
  assert.deepEqual(live.nodes.map((n) => n.type), ["Person"]);

  // the same valid block inside a comment: rejected, and not counted as present
  const commented = sd.validatePage(doc(`<!-- ${personTag} -->`));
  assert.equal(commented.errors.length, 1, commented.errors.join("\n"));
  assert.match(commented.errors[0], COMMENTED_OUT);
  assert.deepEqual(commented.nodes, []);

  // both on one page: only the commented-out copy is reported; the live one still counts
  const both = sd.validatePage(doc(`${personTag}\n<!--\n${personTag}\n-->`));
  assert.equal(both.errors.length, 1, both.errors.join("\n"));
  assert.match(both.errors[0], COMMENTED_OUT);
  assert.deepEqual(both.nodes.map((n) => n.type), ["Person"]);
});

test("commented-out JSON-LD is caught in every comment form the HTML parser knows", () => {
  const cases = {
    "multi-line comment": `<!--\n  ${personTag}\n-->`,
    "IE conditional comment": `<!--[if lt IE 9]>${personTag}<![endif]-->`,
    "comment closed with --!>": `<!-- ${personTag} --!>`,
    "comment never closed (runs to the end of the page)": `<!-- ${personTag}`,
    "comment that looks nested": `<!-- <!-- ${personTag} -->`,
    "upper-case tag, single-quoted type": `<!-- <SCRIPT TYPE='Application/LD+JSON'>${JSON.stringify(personBlock)}</SCRIPT> -->`,
    "invalid JSON inside the comment": "<!-- <script type=\"application/ld+json\">{ not json</script> -->"
  };
  for (const [name, head] of Object.entries(cases)) {
    const { errors, nodes } = sd.validatePage(doc(head));
    assert.ok(errors.some((e) => COMMENTED_OUT.test(e)), `${name}: ${JSON.stringify(errors)}`);
    assert.deepEqual(nodes, [], `${name}: nothing commented out may count as present`);
  }
});

test("comment look-alikes don't hide a live block (no over-correction)", () => {
  // "<!-->" and "<!--->" are complete, empty comments: the block after them is live
  for (const opener of ["<!-->", "<!--->"]) {
    const { errors, nodes } = sd.validatePage(doc(`${opener}${personTag}`));
    assert.deepEqual(errors, [], opener);
    assert.deepEqual(nodes.map((n) => n.type), ["Person"], opener);
  }
  // "<!--" and "-->" inside inline scripts are script text, not a comment around the block
  const scripts = `<script>var open = "<!--";</script>${personTag}<script>var close = "-->";</script>`;
  const between = sd.validatePage(doc(scripts));
  assert.deepEqual(between.errors, []);
  assert.deepEqual(between.nodes.map((n) => n.type), ["Person"]);
  // a comment that only mentions JSON-LD in prose is fine
  assert.deepEqual(sd.validatePage(doc(`<!-- JSON-LD (application/ld+json) is emitted below -->${personTag}`)).errors, []);
});

// ---------------------------------------------------------------------------
// Build-level checks (what .eleventy.js runs on eleventy.after)
// ---------------------------------------------------------------------------

test("build: the expected site passes, and only HTML outputs are scanned", () => {
  const build = results();
  build.push({ url: "/feed.xml", inputPath: "./src/feed.njk", outputPath: "_site/feed.xml", content: "<script type=\"application/ld+json\">nope</script>" });
  const report = sd.validateBuild(build, { site, apps });
  assert.deepEqual(report.errors, []);
  assert.match(report.summary, /2 block\(s\) on 2 page\(s\)/);
  assert.match(report.summary, /2 of 5 catalogue apps are public/);
});

test("build: a private app in structured data fails, even when hand-written", () => {
  // as if the public filter were bypassed: every app made public at build time
  const everyApp = apps.items.map((a) => ({ ...a, visibility: "public" }));
  const leaked = page(sd.appCatalogueList(everyApp, site, "/data/", catalogue));
  const { errors } = sd.validateBuild(results({ data: leaked }), { site, apps });
  assert.ok(errors.some((e) => /"Secret App" is not marked "visibility": "public"/.test(e)), errors.join("\n"));
  assert.ok(errors.some((e) => /"Typo App" is not marked "visibility": "public"/.test(e)));
  assert.ok(errors.some((e) => /contains the launchUrl of private app "secret-app"/.test(e)));
});

test("build: the leak guard still fails the build when the shared public rule itself breaks", () => {
  // Swap in a broken src/_utils/apps.js (every app "public", launch links
  // exposed) and load a fresh structured-data module on top of it, so the
  // builders really follow the broken rule. The guard must not follow it too.
  const appsModule = require.cache[require.resolve("./apps")];
  const sdPath = require.resolve("./structured-data");
  const realExports = appsModule.exports;
  appsModule.exports = {
    isPublicApp: (app) => Boolean(app),
    toPublicApp: (app) => ({ ...realExports.toPublicApp(app), publicUrl: app.launchUrl || app.demoUrl || "" })
  };
  delete require.cache[sdPath];
  try {
    const brokenSd = require("./structured-data");
    const leaked = page(brokenSd.appCatalogueList(apps.items, site, "/data/", catalogue));
    assert.ok(leaked.includes("Secret App") && leaked.includes(SECRET_URL), "the broken rule should leak into the markup");
    const { errors } = brokenSd.validateBuild(results({ data: leaked }), { site, apps });
    assert.ok(errors.some((e) => /"Secret App" is not marked "visibility": "public"/.test(e)), errors.join("\n"));
    assert.ok(errors.some((e) => /contains the launchUrl of private app "secret-app"/.test(e)));
  } finally {
    appsModule.exports = realExports;
    delete require.cache[sdPath];
  }
});

test("build: catalogue entries must come from apps.json and keep the card's link", () => {
  const madeUp = page(listOf({ name: "Made Up App", url: "https://made-up.example.test" }));
  assert.ok(sd.validateBuild(results({ data: madeUp }), { site, apps }).errors
    .some((e) => /"Made Up App" is not in src\/_data\/apps\.json/.test(e)));

  const relinked = page(listOf({ name: "Open App", url: "https://elsewhere.example.test" }, { name: "Demo App", url: "https://demo.example.test" }));
  assert.ok(sd.validateBuild(results({ data: relinked }), { site, apps }).errors
    .some((e) => /url "https:\/\/elsewhere\.example\.test" for "Open App" does not match/.test(e)));
});

test("build: a private launch URL anywhere in any block fails", () => {
  const graph = sd.siteGraph({ ...site, description: `Try ${SECRET_URL}/login` }, manifest);
  const { errors } = sd.validateBuild(results({ home: page(graph) }), { site, apps });
  assert.ok(errors.some((e) => /^\/ \(\.\/src\/index\.njk\) block 1: contains the launchUrl of private app "secret-app"/.test(e)), errors.join("\n"));
});

test("build: blocks that stop rendering fail, except on incremental rebuilds", () => {
  const bare = results({ home: "<p>home</p>", data: "<p>data</p>" });
  const { errors } = sd.validateBuild(bare, { site, apps });
  assert.ok(errors.includes("/ (home page): expected exactly 1 WebSite node, found 0"));
  assert.ok(errors.includes("/ (home page): expected exactly 1 Person node, found 0"));
  assert.ok(errors.some((e) => /public app "open-app" \(Open App\) is missing from the ItemList JSON-LD/.test(e)));
  assert.ok(errors.some((e) => /public app "demo-app" \(Demo App\) is missing/.test(e)));
  assert.deepEqual(sd.validateBuild(bare, { site, apps, coverage: false }).errors, []);

  // a WebSite pointing anywhere but the canonical home URL
  const elsewhere = page(sd.siteGraph({ ...site, url: "https://elsewhere.test" }, manifest));
  assert.ok(sd.validateBuild(results({ home: elsewhere }), { site, apps }).errors
    .some((e) => /WebSite url must be the canonical home URL https:\/\/example\.test\//.test(e)));
});

test("build: commenting out the home page's block fails, and it no longer counts as present", () => {
  const home = page(sd.siteGraph(site, manifest))
    .replace(/<script type="application\/ld\+json">[\s\S]*?<\/script>/, (tag) => `<!-- ${tag} -->`);
  assert.match(home, /<!-- <script type="application\/ld\+json">/);
  const { errors } = sd.validateBuild(results({ home }), { site, apps });
  assert.ok(errors.some((e) => /^\/ \(\.\/src\/index\.njk\) commented-out block 1: JSON-LD inside an HTML comment/.test(e)), errors.join("\n"));
  assert.ok(errors.includes("/ (home page): expected exactly 1 WebSite node, found 0"), errors.join("\n"));
  assert.ok(errors.includes("/ (home page): expected exactly 1 Person node, found 0"));
});

test("the real data files produce valid structured data", () => {
  const root = path.join(__dirname, "..", "..");
  const read = (rel, fallback) => {
    const file = path.join(root, rel);
    return fs.existsSync(file) ? JSON.parse(fs.readFileSync(file, "utf8")) : fallback;
  };
  const realSite = read("src/_data/site.json");
  const realApps = read("src/_data/apps.json", { items: [] });
  const build = [
    { url: "/", inputPath: "./src/index.njk", outputPath: "_site/index.html", content: page(sd.siteGraph(realSite, read("src/manifest.webmanifest", {}))) },
    { url: "/data/", inputPath: "./src/data/index.njk", outputPath: "_site/data/index.html", content: page(sd.appCatalogueList(realApps.items, realSite, "/data/", catalogue)) }
  ];
  assert.deepEqual(sd.validateBuild(build, { site: realSite, apps: realApps }).errors, []);
});
