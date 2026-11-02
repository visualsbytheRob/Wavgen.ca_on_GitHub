#!/usr/bin/env node
// Build-time check for the diary's Atom feed (src/feed.njk → _site/feed.xml).
// Runs as the last step of `npm run build`, so a broken feed fails the build,
// and with it the GitHub Pages deploy, instead of reaching subscribers.
//
// Two layers:
//   1. Well-formed XML. saxes is a strict XML 1.0 parser: an unescaped "&"
//      or "<", a control character, an unknown entity or a mismatched tag
//      all fail here, exactly as they would in a feed reader.
//   2. Valid Atom 1.0. The RFC 4287 rules this feed has to meet: a <feed>
//      root in the Atom namespace, required and non-repeatable elements,
//      absolute ids that are unique per entry, RFC 3339 dates, an author,
//      and escaped (child-free) text/HTML content.
//
// Usage:
//   npm run validate:feed                    checks _site + site.feed.path
//   node scripts/validate-feed.js some.xml   checks any other file

const fs = require("node:fs");
const path = require("node:path");
const { SaxesParser } = require("saxes");

const ROOT = path.join(__dirname, "..");
const ATOM_NS = "http://www.w3.org/2005/Atom";
const XHTML_NS = "http://www.w3.org/1999/xhtml";
// RFC 3339 date-time with the uppercase "T" and "Z" Atom requires.
const RFC3339 = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})(\.\d+)?(Z|[+-](\d{2}):(\d{2}))$/;
// An absolute IRI begins with a scheme such as "tag:" or "https:".
const ABSOLUTE_IRI = /^[A-Za-z][A-Za-z0-9+.-]*:\S+$/;
const MAX_XML_ERRORS = 10;

function defaultFeedFile() {
  const site = JSON.parse(fs.readFileSync(path.join(ROOT, "src", "_data", "site.json"), "utf8"));
  return path.join(ROOT, "_site", site.feed.path);
}

// Date.parse alone is too lenient (it rolls Feb 30 over to Mar 2), so the
// fields are range-checked, including the real length of the month.
function isRfc3339(value) {
  const m = RFC3339.exec(value);
  if (!m) return false;
  const [year, month, day, hour, minute, second] = m.slice(1, 7).map(Number);
  const daysInMonth = new Date(Date.UTC(year, month, 0)).getUTCDate();
  const offsetOk = m[9] === undefined || (Number(m[9]) <= 23 && Number(m[10]) <= 59);
  return month >= 1 && month <= 12 && day >= 1 && day <= daysInMonth &&
    hour <= 23 && minute <= 59 && second <= 60 && offsetOk;  // 60 = leap second
}

// Parses into a small element tree ({ name, ns, attrs, children, text, line })
// and collects well-formedness errors instead of throwing on the first one.
function parseXml(xml, fileName) {
  const errors = [];
  const stack = [];
  let root = null;
  const parser = new SaxesParser({ xmlns: true, position: true, fileName });
  parser.on("error", err => errors.push(err.message));
  parser.on("opentag", tag => {
    const el = { name: tag.local, ns: tag.uri, attrs: {}, children: [], text: "", line: parser.line };
    for (const attr of Object.values(tag.attributes)) el.attrs[attr.name] = attr.value;
    if (stack.length) stack[stack.length - 1].children.push(el);
    else if (!root) root = el;
    stack.push(el);
  });
  const addText = text => { if (stack.length) stack[stack.length - 1].text += text; };
  parser.on("text", addText);
  parser.on("cdata", addText);
  parser.on("closetag", () => stack.pop());
  parser.write(xml).close();
  return { root, errors };
}

// Returns a list of RFC 4287 problems (empty when the feed is valid).
function checkAtom(feed) {
  if (!feed || feed.ns !== ATOM_NS || feed.name !== "feed") {
    return [`the root element must be <feed xmlns="${ATOM_NS}">`];
  }
  const problems = [];
  const atom = (el, name) => el.children.filter(c => c.ns === ATOM_NS && c.name === name);
  const textOf = el => el.text.trim();

  function checkCounts(el, label, required, atMostOne) {
    for (const name of required) {
      const n = atom(el, name).length;
      if (n !== 1) problems.push(`${label}: needs exactly one <${name}>, found ${n}`);
    }
    for (const name of atMostOne) {
      const n = atom(el, name).length;
      if (n > 1) problems.push(`${label}: allows at most one <${name}>, found ${n}`);
    }
  }

  function checkIds(el, label) {
    for (const id of atom(el, "id")) {
      if (!ABSOLUTE_IRI.test(textOf(id))) problems.push(`${label}: <id> must be an absolute IRI, got "${textOf(id)}"`);
    }
  }

  function checkDates(el, label) {
    for (const name of ["updated", "published"]) {
      for (const date of atom(el, name)) {
        if (!isRfc3339(textOf(date))) problems.push(`${label}: <${name}> must be an RFC 3339 date-time, got "${textOf(date)}"`);
      }
    }
  }

  // type="text"/"html" hold escaped text, so a child element means markup
  // leaked through unescaped; type="xhtml" must wrap one xhtml <div>.
  function checkTextConstructs(el, label, names) {
    for (const name of names) {
      for (const node of atom(el, name)) {
        const type = node.attrs.type || "text";
        if (type === "text" || type === "html") {
          if (node.children.length) {
            problems.push(`${label}: <${name} type="${type}"> must contain escaped text, but holds a <${node.children[0].name}> element (unescaped markup?)`);
          }
        } else if (type === "xhtml") {
          const [div, ...rest] = node.children;
          if (!div || rest.length || div.ns !== XHTML_NS || div.name !== "div") {
            problems.push(`${label}: <${name} type="xhtml"> must contain exactly one XHTML <div>`);
          }
        } else if (name !== "content") {  // only <content> may use a MIME type
          problems.push(`${label}: <${name}> type must be text, html or xhtml, got "${type}"`);
        }
      }
    }
  }

  function checkLinks(el, label) {
    const alternates = new Set();
    for (const link of atom(el, "link")) {
      if (!link.attrs.href) problems.push(`${label}: <link> on line ${link.line} has no href`);
      if ((link.attrs.rel || "alternate") !== "alternate") continue;
      const key = `${link.attrs.type || ""}|${link.attrs.hreflang || ""}`;
      if (alternates.has(key)) problems.push(`${label}: has two rel="alternate" links with the same type and hreflang`);
      alternates.add(key);
    }
  }

  function checkAuthors(el, label) {
    for (const author of atom(el, "author")) {
      const names = atom(author, "name");
      if (names.length !== 1 || !textOf(names[0])) problems.push(`${label}: <author> needs exactly one non-empty <name>`);
    }
  }

  // <feed>
  checkCounts(feed, "feed", ["id", "title", "updated"], ["generator", "icon", "logo", "rights", "subtitle"]);
  checkIds(feed, "feed");
  checkDates(feed, "feed");
  checkTextConstructs(feed, "feed", ["title", "subtitle", "rights"]);
  checkLinks(feed, "feed");
  checkAuthors(feed, "feed");
  if (!atom(feed, "link").some(link => link.attrs.rel === "self")) {
    problems.push(`feed: needs a <link rel="self"> giving the feed's own URL`);
  }

  // <entry>
  const feedHasAuthor = atom(feed, "author").length > 0;
  const seenIds = new Map();
  atom(feed, "entry").forEach((entry, i) => {
    const label = `entry ${i + 1} (line ${entry.line})`;
    checkCounts(entry, label, ["id", "title", "updated"], ["content", "published", "rights", "source", "summary"]);
    checkIds(entry, label);
    checkDates(entry, label);
    checkTextConstructs(entry, label, ["title", "summary", "rights", "content"]);
    checkLinks(entry, label);
    checkAuthors(entry, label);
    for (const id of atom(entry, "id")) {
      const value = textOf(id);
      if (seenIds.has(value)) problems.push(`${label}: duplicate <id> "${value}" (also used by entry ${seenIds.get(value)})`);
      else seenIds.set(value, i + 1);
    }
    const hasAlternate = atom(entry, "link").some(link => (link.attrs.rel || "alternate") === "alternate");
    if (!atom(entry, "content").length && !hasAlternate) {
      problems.push(`${label}: needs a <content> or a rel="alternate" <link>`);
    }
    if (!feedHasAuthor && !atom(entry, "author").length) {
      problems.push(`${label}: needs an <author>, because the feed has none`);
    }
  });

  return problems;
}

function main() {
  const file = process.argv[2] ? path.resolve(process.argv[2]) : defaultFeedFile();
  const shown = path.relative(process.cwd(), file) || file;
  const fail = problems => {
    console.error(`[validate-feed] FAILED: ${shown}`);
    for (const problem of problems) console.error(`  - ${problem}`);
    process.exit(1);
  };

  if (!fs.existsSync(file)) {
    fail(["file not found. Was src/feed.njk removed, or site.feed.path changed without a rebuild?"]);
  }

  const { root, errors } = parseXml(fs.readFileSync(file, "utf8"), shown);
  if (errors.length) {
    const extra = errors.length > MAX_XML_ERRORS ? [`…and ${errors.length - MAX_XML_ERRORS} more`] : [];
    fail(["not well-formed XML:", ...errors.slice(0, MAX_XML_ERRORS), ...extra]);
  }

  const problems = checkAtom(root);
  if (problems.length) fail(["not valid Atom 1.0 (RFC 4287):", ...problems]);

  const entries = root.children.filter(c => c.ns === ATOM_NS && c.name === "entry").length;
  const updated = root.children.find(c => c.ns === ATOM_NS && c.name === "updated").text.trim();
  console.log(`[validate-feed] OK: ${shown} is well-formed, valid Atom 1.0 (${entries} ${entries === 1 ? "entry" : "entries"}, updated ${updated})`);
}

main();
