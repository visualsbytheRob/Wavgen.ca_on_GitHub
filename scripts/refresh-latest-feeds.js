#!/usr/bin/env node
// Refreshes the homepage "Latest tracks" (Bandcamp) and "Latest videos" (YouTube) feeds.
// Writes src/_data/latest-tracks.json and src/_data/latest-videos.json.
// Run manually: `npm run refresh:feeds`. Also run by the monthly scheduled trigger.

const fs = require("node:fs/promises");
const path = require("node:path");

const BANDCAMP_BASE = "https://waveformgeneration.bandcamp.com";
const YOUTUBE_CHANNEL_ID = "UCLK1PORnw7wtArjjhfnA2RQ";
const UA = "Mozilla/5.0 (compatible; WavgenFeedRefresher/1.0)";
const COUNT = 3;

async function getText(url) {
  const res = await fetch(url, { headers: { "User-Agent": UA } });
  if (!res.ok) throw new Error(`${url} → HTTP ${res.status}`);
  return res.text();
}

async function refreshTracks() {
  const indexHtml = await getText(`${BANDCAMP_BASE}/music`);
  const slugs = [...indexHtml.matchAll(/href="\/(album|track)\/([a-z0-9-]+)"/g)]
    .map(m => ({ type: m[1], slug: m[2] }));
  const seen = new Set();
  const ordered = slugs.filter(s => {
    const key = `${s.type}/${s.slug}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  }).slice(0, COUNT);

  const items = [];
  for (const { type, slug } of ordered) {
    const pageUrl = `${BANDCAMP_BASE}/${type}/${slug}`;
    const html = await getText(pageUrl);
    const embedMatch = html.match(/EmbeddedPlayer\/v=2\/(album|track)=(\d+)/);
    if (!embedMatch) {
      console.warn(`[tracks] no embed id for ${pageUrl} — skipping`);
      continue;
    }
    const titleMatch = html.match(/<meta name="title" content="([^"]+)"/)
      || html.match(/<title>([^<]+)<\/title>/);
    const rawTitle = titleMatch ? titleMatch[1] : slug;
    const title = rawTitle.split(" | ")[0].replace(/, by .+$/, "").trim();
    items.push({
      title,
      type: embedMatch[1],
      id: embedMatch[2],
      page_url: pageUrl,
      embed_url: `https://bandcamp.com/EmbeddedPlayer/v=2/${embedMatch[1]}=${embedMatch[2]}/size=large/bgcol=181818/linkcol=facd1c/tracklist=false/transparent=true/`
    });
  }
  return items;
}

async function refreshVideos() {
  const xml = await getText(`https://www.youtube.com/feeds/videos.xml?channel_id=${YOUTUBE_CHANNEL_ID}`);
  const entries = [...xml.matchAll(/<entry>([\s\S]*?)<\/entry>/g)].slice(0, COUNT);
  return entries.map(([, body]) => {
    const id = body.match(/<yt:videoId>([^<]+)<\/yt:videoId>/)?.[1];
    const title = body.match(/<title>([^<]+)<\/title>/)?.[1];
    const published = body.match(/<published>([^<]+)<\/published>/)?.[1];
    return {
      title,
      video_id: id,
      published,
      page_url: `https://www.youtube.com/watch?v=${id}`,
      embed_url: `https://www.youtube.com/embed/${id}?rel=0&modestbranding=1`
    };
  }).filter(v => v.video_id);
}

async function main() {
  const dataDir = path.join(__dirname, "..", "src", "_data");
  const fetched_at = new Date().toISOString();

  const [tracks, videos] = await Promise.all([refreshTracks(), refreshVideos()]);

  await fs.writeFile(
    path.join(dataDir, "latestTracks.json"),
    JSON.stringify({ fetched_at, source: `${BANDCAMP_BASE}/music`, items: tracks }, null, 2) + "\n"
  );
  await fs.writeFile(
    path.join(dataDir, "latestVideos.json"),
    JSON.stringify({ fetched_at, source: `https://www.youtube.com/channel/${YOUTUBE_CHANNEL_ID}`, items: videos }, null, 2) + "\n"
  );

  console.log(`[refresh-feeds] wrote ${tracks.length} tracks, ${videos.length} videos at ${fetched_at}`);
}

main().catch(err => {
  console.error("[refresh-feeds] FAILED:", err.message);
  process.exit(1);
});
