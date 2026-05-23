#!/usr/bin/env node
// Free-tier backup for the Claude news loop. Aggregates RSS feeds, dedupes
// against the last 7 days of briefings, writes a markdown briefing to
// src/diary/news/YYYY-MM-DD.md. No editorial layer — just headlines + summaries
// from each source's RSS description field.
//
// Skips silently if today's briefing already exists (e.g., Claude wrote it).
//
// Run manually: `npm run briefing:generate`. Also run by
// .github/workflows/news-briefing.yml on Mon/Wed/Fri.

const fs = require("node:fs/promises");
const path = require("node:path");

const ROOT = path.join(__dirname, "..");
const NEWS_DIR = path.join(ROOT, "src", "diary", "news");
const ITEMS_PER_SECTION = 4;
const DEDUP_LOOKBACK_DAYS = 7;
const UA = "Mozilla/5.0 (compatible; WavgenBriefingBot/1.0)";

const FEEDS = {
  Music: [
    "https://pitchfork.com/rss/news/",
    "https://daily.bandcamp.com/feed",
    "https://www.factmag.com/feed/",
    "https://ra.co/news/feed"
  ],
  Video: [
    "https://nofilmschool.com/feed",
    "https://petapixel.com/feed/",
    "https://www.cinema5d.com/feed/"
  ],
  Data: [
    "https://news.ycombinator.com/rss",
    "https://techcrunch.com/feed/",
    "https://www.theverge.com/rss/index.xml"
  ],
  Art: [
    "https://www.thisiscolossal.com/feed/",
    "https://hyperallergic.com/feed/",
    "https://www.itsnicethat.com/feed.rss"
  ]
};

const WIDER_CONTEXT = {
  World: ["http://feeds.bbci.co.uk/news/world/rss.xml"],
  Toronto: ["https://www.blogto.com/rss"],
  "Good news": ["https://www.goodnewsnetwork.org/category/news/feed/"]
};

async function fetchFeed(url) {
  try {
    const res = await fetch(url, {
      headers: { "User-Agent": UA, "Accept": "application/rss+xml, application/xml, text/xml, */*" },
      signal: AbortSignal.timeout(15000)
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.text();
  } catch (err) {
    console.warn(`[briefing] skip ${url}: ${err.message}`);
    return null;
  }
}

function unescapeXml(s) {
  return s.replace(/&lt;/g, "<").replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"').replace(/&#039;/g, "'").replace(/&#39;/g, "'")
    .replace(/&apos;/g, "'").replace(/&amp;/g, "&")
    .replace(/&nbsp;/g, " ").replace(/&[a-z0-9]+;/gi, "");
}

function stripTags(s) {
  return unescapeXml(s.replace(/<[^>]+>/g, "")).replace(/\s+/g, " ").trim();
}

function pickCdataOrText(block, tag) {
  const re = new RegExp(`<${tag}[^>]*>([\\s\\S]*?)</${tag}>`, "i");
  const m = block.match(re);
  if (!m) return "";
  const inner = m[1].trim();
  const cdata = inner.match(/<!\[CDATA\[([\s\S]*?)\]\]>/);
  return cdata ? cdata[1].trim() : inner;
}

function parseRss(xml, sourceUrl) {
  // Handles both RSS 2.0 (<item>) and Atom (<entry>)
  const items = [];
  const itemRe = /<item[\s>][\s\S]*?<\/item>|<entry[\s>][\s\S]*?<\/entry>/g;
  for (const m of xml.matchAll(itemRe)) {
    const block = m[0];
    const title = stripTags(pickCdataOrText(block, "title"));
    // Atom uses <link href="..."/>, RSS uses <link>...</link>
    let link = pickCdataOrText(block, "link");
    if (!link || link.startsWith("<")) {
      const hrefMatch = block.match(/<link[^>]*href="([^"]+)"/);
      if (hrefMatch) link = hrefMatch[1];
    }
    const description = stripTags(
      pickCdataOrText(block, "description") || pickCdataOrText(block, "summary") || pickCdataOrText(block, "content")
    );
    const pubDate = pickCdataOrText(block, "pubDate") || pickCdataOrText(block, "published") || pickCdataOrText(block, "updated");
    if (title && link) {
      items.push({
        title, link, description, pubDate,
        source: new URL(sourceUrl).hostname.replace(/^www\./, "")
      });
    }
  }
  return items;
}

async function getRecentLinks() {
  const cutoff = new Date(Date.now() - DEDUP_LOOKBACK_DAYS * 86400000);
  const links = new Set();
  let files = [];
  try { files = await fs.readdir(NEWS_DIR); } catch { return links; }
  for (const f of files) {
    if (!f.endsWith(".md")) continue;
    const dm = f.match(/^(\d{4}-\d{2}-\d{2})/);
    if (!dm) continue;
    if (new Date(dm[1]) < cutoff) continue;
    const content = await fs.readFile(path.join(NEWS_DIR, f), "utf8");
    for (const lm of content.matchAll(/\((https?:\/\/[^\s)]+)\)/g)) {
      links.add(lm[1]);
    }
  }
  return links;
}

async function aggregate(feeds, perSection, seen) {
  const out = {};
  for (const [section, urls] of Object.entries(feeds)) {
    const all = [];
    for (const url of urls) {
      const xml = await fetchFeed(url);
      if (xml) all.push(...parseRss(xml, url));
    }
    all.sort((a, b) => (Date.parse(b.pubDate) || 0) - (Date.parse(a.pubDate) || 0));
    const fresh = [];
    const sectionSeen = new Set();
    for (const item of all) {
      if (seen.has(item.link) || sectionSeen.has(item.link)) continue;
      sectionSeen.add(item.link);
      seen.add(item.link);
      fresh.push(item);
      if (fresh.length >= perSection) break;
    }
    out[section] = fresh;
  }
  return out;
}

function truncate(s, n) {
  if (!s) return "";
  return s.length > n ? s.slice(0, n).trimEnd() + "…" : s;
}

function renderItems(items) {
  if (!items.length) return "- _No fresh items today._\n";
  return items.map(i => {
    const summary = truncate(i.description, 180);
    const summaryPart = summary ? ` ${summary}` : "";
    return `- **[${i.title}](${i.link})** — *${i.source}.*${summaryPart}`;
  }).join("\n") + "\n";
}

async function main() {
  const today = new Date().toISOString().slice(0, 10);
  const outFile = path.join(NEWS_DIR, `${today}.md`);

  try {
    await fs.access(outFile);
    console.log(`[briefing] ${today}.md already exists — skipping (Claude or earlier run wrote it)`);
    return;
  } catch {}

  const seen = await getRecentLinks();
  const sections = await aggregate(FEEDS, ITEMS_PER_SECTION, seen);
  const wider = await aggregate(WIDER_CONTEXT, 1, seen);

  const totalItems = Object.values(sections).reduce((n, arr) => n + arr.length, 0)
    + Object.values(wider).reduce((n, arr) => n + arr.length, 0);
  if (totalItems === 0) {
    console.log("[briefing] no fresh items across any feed — skipping commit");
    return;
  }

  let md = `---\ntitle: "Wavgen briefing — ${today}"\ndate: ${today}\nsource: rss-aggregator\n---\n\n`;
  md += `Automated digest from public RSS feeds. Generated as a free-tier backup when the Claude editorial loop isn't running.\n\n`;
  md += `## Wider context\n`;
  for (const [section, items] of Object.entries(wider)) {
    if (!items.length) continue;
    const i = items[0];
    const summary = truncate(i.description, 140);
    md += `- **${section}** — *[${i.title}](${i.link})* (${i.source}). ${summary}\n`;
  }
  md += "\n";

  for (const [section, items] of Object.entries(sections)) {
    md += `## ${section}\n${renderItems(items)}\n`;
  }

  await fs.mkdir(NEWS_DIR, { recursive: true });
  await fs.writeFile(outFile, md);
  console.log(`[briefing] wrote ${path.relative(ROOT, outFile)} (${totalItems} items)`);
}

main().catch(err => {
  console.error("[briefing] FAILED:", err.message);
  process.exit(1);
});
