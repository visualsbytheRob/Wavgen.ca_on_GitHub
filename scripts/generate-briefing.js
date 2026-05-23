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
const NEWS_DATA_DIR = path.join(ROOT, "src", "_data", "news");
const ITEMS_PER_SECTION = 4;
const DEDUP_LOOKBACK_DAYS = 7;
const UA = "Mozilla/5.0 (compatible; WavgenBriefingBot/1.0)";

// Hostname → display name for the source field on news cards.
// Falls back to the hostname (without leading www.) if not listed.
const PRETTY_SOURCE = {
  "daily.bandcamp.com": "Bandcamp Daily",
  "factmag.com": "FACT Magazine",
  "ra.co": "Resident Advisor",
  "pitchfork.com": "Pitchfork",
  "nofilmschool.com": "No Film School",
  "petapixel.com": "PetaPixel",
  "cinema5d.com": "cinema5D",
  "news.ycombinator.com": "Hacker News",
  "techcrunch.com": "TechCrunch",
  "theverge.com": "The Verge",
  "thisiscolossal.com": "Colossal",
  "hyperallergic.com": "Hyperallergic",
  "itsnicethat.com": "It's Nice That",
  "feeds.bbci.co.uk": "BBC News",
  "bbc.com": "BBC News",
  "goodnewsnetwork.org": "Good News Network",
  "blogto.com": "blogTO"
};

function prettySource(host) {
  return PRETTY_SOURCE[host] || host.replace(/^www\./, "");
}

function isoDate(pubDate) {
  const t = Date.parse(pubDate);
  if (!t) return new Date().toISOString().slice(0, 10);
  return new Date(t).toISOString().slice(0, 10);
}

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
  return s
    .replace(/&#x([0-9a-f]+);/gi, (_, h) => String.fromCodePoint(parseInt(h, 16)))
    .replace(/&#(\d+);/g, (_, d) => String.fromCodePoint(parseInt(d, 10)))
    .replace(/&lt;/g, "<").replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"').replace(/&apos;/g, "'")
    .replace(/&nbsp;/g, " ").replace(/&amp;/g, "&")
    .replace(/&[a-z0-9]+;/gi, "");
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
        source: prettySource(new URL(sourceUrl).hostname.replace(/^www\./, ""))
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

  // Check if today's briefing already exists. If yes, we'll still refresh the
  // news JSONs (so news cards stay current) but skip rewriting the markdown.
  let briefingExists = false;
  try {
    await fs.access(outFile);
    briefingExists = true;
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

  if (!briefingExists) {
    await fs.mkdir(NEWS_DIR, { recursive: true });
    await fs.writeFile(outFile, md);
    console.log(`[briefing] wrote ${path.relative(ROOT, outFile)} (${totalItems} items)`);
  } else {
    console.log(`[briefing] ${today}.md already exists — refreshing news JSONs only`);
  }

  // Also write the 6 JSON files that drive the news cards on home/music/video/data pages.
  // Schema matches what the existing news-feed.njk component expects:
  // { lastUpdated, note, items: [{ title, url, source, date, summary, section?, subtopic?, subtopicUrl? }] }
  await fs.mkdir(NEWS_DATA_DIR, { recursive: true });
  const note = "Auto-refreshed by RSS aggregator (free-tier backup).";

  function toCardItem(item) {
    return {
      title: item.title,
      url: item.link,
      source: item.source,
      date: isoDate(item.pubDate),
      summary: truncate(item.description, 200)
    };
  }

  // music/video/data/art per-section JSONs
  const sectionKeys = { Music: "music", Video: "video", Data: "data", Art: "art" };
  for (const [sectionLabel, fileKey] of Object.entries(sectionKeys)) {
    const items = (sections[sectionLabel] || []).map(toCardItem);
    await fs.writeFile(
      path.join(NEWS_DATA_DIR, `${fileKey}.json`),
      JSON.stringify({ lastUpdated: today, note, items }, null, 2) + "\n"
    );
  }

  // aggregated.json — top 2 of each section, sorted by date desc
  const aggregatedItems = [];
  for (const [sectionLabel, fileKey] of Object.entries(sectionKeys)) {
    for (const item of (sections[sectionLabel] || []).slice(0, 2)) {
      aggregatedItems.push({ ...toCardItem(item), section: fileKey });
    }
  }
  aggregatedItems.sort((a, b) => b.date.localeCompare(a.date));
  await fs.writeFile(
    path.join(NEWS_DATA_DIR, "aggregated.json"),
    JSON.stringify({ lastUpdated: today, note, items: aggregatedItems }, null, 2) + "\n"
  );

  // world.json — wider context (World/Toronto/Good news), one item each
  const worldItems = [];
  for (const [section, items] of Object.entries(wider)) {
    if (!items.length) continue;
    worldItems.push({ section, ...toCardItem(items[0]) });
  }
  await fs.writeFile(
    path.join(NEWS_DATA_DIR, "world.json"),
    JSON.stringify({ lastUpdated: today, note, items: worldItems }, null, 2) + "\n"
  );

  console.log(`[briefing] also wrote 6 news JSON files (music, video, data, art, aggregated, world)`);
}

main().catch(err => {
  console.error("[briefing] FAILED:", err.message);
  process.exit(1);
});
