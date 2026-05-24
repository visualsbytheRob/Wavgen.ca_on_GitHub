#!/usr/bin/env node
// Detects NEW Bandcamp releases or YouTube videos and writes a celebration
// diary entry for each. Tracks already-celebrated items by URL in
// .celebrated-ships.json so the same release never produces two entries.
// Silent if nothing new appeared.
//
// Reads src/_data/latestTracks.json and src/_data/latestVideos.json
// (refreshed by the monthly trigger or manual button — this script doesn't
// fetch feeds itself, just acts on whatever data is currently in the repo).
//
// Run by .github/workflows/celebrate-ships.yml on a daily cron.

const fs = require("node:fs/promises");
const path = require("node:path");

const ROOT = path.join(__dirname, "..");
const TRACKS_FILE = path.join(ROOT, "src", "_data", "latestTracks.json");
const VIDEOS_FILE = path.join(ROOT, "src", "_data", "latestVideos.json");
const STATE_FILE = path.join(ROOT, ".celebrated-ships.json");
const ENTRIES_DIR = path.join(ROOT, "src", "diary", "entries");

async function loadJson(file, fallback) {
  try { return JSON.parse(await fs.readFile(file, "utf8")); }
  catch { return fallback; }
}

function slugify(s) {
  return s.toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 50);
}

function yamlEscape(s) { return s.replace(/"/g, '\\"'); }

function trackEntryBody(track) {
  return `<div class="bg-black/30 border border-white/10 rounded-lg overflow-hidden">
  <iframe loading="lazy" style="border:0; width:100%; height:540px;" src="${track.embed_url}" seamless title="${track.title} on Bandcamp"></iframe>
</div>

New release on Bandcamp — [${track.title}](${track.page_url}).`;
}

function videoEntryBody(video) {
  return `<div class="bg-black/30 border border-white/10 rounded-lg overflow-hidden">
  <div class="relative" style="padding-bottom:56.25%;">
    <iframe loading="lazy" class="absolute inset-0 w-full h-full" src="${video.embed_url}" title="${video.title}" frameborder="0" allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
  </div>
</div>

New video on YouTube — [${video.title}](${video.page_url}).`;
}

async function main() {
  const state = await loadJson(STATE_FILE, { celebrated_urls: [] });
  const seen = new Set(state.celebrated_urls);

  const tracks = (await loadJson(TRACKS_FILE, { items: [] })).items || [];
  const videos = (await loadJson(VIDEOS_FILE, { items: [] })).items || [];

  await fs.mkdir(ENTRIES_DIR, { recursive: true });
  const today = new Date().toISOString().slice(0, 10);
  const created = [];

  for (const track of tracks) {
    if (seen.has(track.page_url)) continue;
    const slug = `shipped-${slugify(track.title)}`;
    const file = path.join(ENTRIES_DIR, `${today}-${slug}.md`);
    try { await fs.access(file); continue; } catch {}  // skip if file already exists
    const title = `Shipped: ${track.title}`;
    const md = `---\ntitle: "${yamlEscape(title)}"\ndate: ${today}\n---\n\n${trackEntryBody(track)}\n`;
    await fs.writeFile(file, md);
    seen.add(track.page_url);
    created.push(file);
    console.log(`[celebrate-ships] new track entry: ${path.basename(file)}`);
  }

  for (const video of videos) {
    if (seen.has(video.page_url)) continue;
    const slug = `shipped-${slugify(video.title)}`;
    const file = path.join(ENTRIES_DIR, `${today}-${slug}.md`);
    try { await fs.access(file); continue; } catch {}
    const title = `Shipped: ${video.title}`;
    const md = `---\ntitle: "${yamlEscape(title)}"\ndate: ${today}\n---\n\n${videoEntryBody(video)}\n`;
    await fs.writeFile(file, md);
    seen.add(video.page_url);
    created.push(file);
    console.log(`[celebrate-ships] new video entry: ${path.basename(file)}`);
  }

  await fs.writeFile(STATE_FILE, JSON.stringify({
    celebrated_urls: [...seen].sort()
  }, null, 2) + "\n");

  console.log(`[celebrate-ships] ${created.length} new ${created.length === 1 ? "entry" : "entries"}; state tracks ${seen.size} URLs total`);
}

main().catch(err => {
  console.error("[celebrate-ships] FAILED:", err.message);
  process.exit(1);
});
