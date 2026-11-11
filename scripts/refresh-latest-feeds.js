#!/usr/bin/env node
// Refreshes the homepage "Latest tracks" (Bandcamp) and "Latest videos" (YouTube) feeds.
// Writes src/_data/latest-tracks.json and src/_data/latest-videos.json.
// Run manually: `npm run refresh:feeds`. Also run by the monthly scheduled trigger.

const fs = require("node:fs/promises");
const path = require("node:path");

const BANDCAMP_BASE = "https://waveformgeneration.bandcamp.com";
const YOUTUBE_CHANNEL_ID = "UCLK1PORnw7wtArjjhfnA2RQ";
const UA = "Mozilla/5.0 (compatible; WavgenFeedRefresher/1.0)";
const decode = value => String(value || '').replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#39;|&apos;/g, "'").replace(/&lt;/g, '<').replace(/&gt;/g, '>');

async function parseBandcampRelease(html, type, pageUrl) {
  const { parse } = await import('parse5');
  let tralbum, artwork;
  function visit(node) {
    const attr = node.attrs?.find(a => a.name === 'data-tralbum');
    if (attr) tralbum = JSON.parse(attr.value);
    if (node.tagName === 'meta' && node.attrs?.some(a => a.name === 'property' && a.value === 'og:image')) {
      const image = node.attrs.find(a => a.name === 'content')?.value;
      if (/^https:\/\/f\d+\.bcbits\.com\/img\/a\d+_/.test(image || '')) artwork = image;
    }
    for (const child of node.childNodes || []) visit(child);
  }
  visit(parse(html));
  const current = tralbum?.current;
  if (!current?.id || !current.title) throw new Error(`No release metadata at ${pageUrl}`);
  return {
    title: current.title, type, id: String(current.id), page_url: pageUrl,
    ...(artwork ? {artwork_url: artwork, artwork_source: pageUrl} : {}),
    embed_url: `https://bandcamp.com/EmbeddedPlayer/${type}=${current.id}/size=large/bgcol=181125/linkcol=f7dc6f/tracklist=true/artwork=small/transparent=true/`,
    release_year: new Date(tralbum.album_release_date || current.release_date).getUTCFullYear(),
    tracks: (tralbum.trackinfo || []).map(t => ({ title: t.title, duration: t.duration, url: t.title_link ? new URL(t.title_link, BANDCAMP_BASE).href : pageUrl }))
  };
}

function mergeVideos(previous, fresh) {
  const merged = new Map(previous.map(v => [v.video_id, v]));
  for (const v of fresh) merged.set(v.video_id, { ...merged.get(v.video_id), ...v });
  return [...merged.values()];
}

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
  });

  const items = [];
  for (const { type, slug } of ordered) {
    const pageUrl = `${BANDCAMP_BASE}/${type}/${slug}`;
    const html = await getText(pageUrl);
    items.push(await parseBandcampRelease(html, type, pageUrl));
  }
  if (!items.length) throw new Error('Bandcamp returned no releases; refusing to overwrite the catalogue');
  return items;
}

async function refreshVideos() {
  const xml = await getText(`https://www.youtube.com/feeds/videos.xml?channel_id=${YOUTUBE_CHANNEL_ID}`);
  const entries = [...xml.matchAll(/<entry>([\s\S]*?)<\/entry>/g)];
  return entries.map(([, body]) => {
    const id = body.match(/<yt:videoId>([^<]+)<\/yt:videoId>/)?.[1];
    const title = body.match(/<title>([^<]+)<\/title>/)?.[1];
    const published = body.match(/<published>([^<]+)<\/published>/)?.[1];
    return {
      title: decode(title),
      video_id: id,
      published,
      page_url: `https://www.youtube.com/watch?v=${id}`,
      embed_url: `https://www.youtube-nocookie.com/embed/${id}`,
      thumbnail: `https://i.ytimg.com/vi/${id}/hqdefault.jpg`
    };
  }).filter(v => v.video_id);
}

async function main() {
  const dataDir = path.join(__dirname, "..", "src", "_data");
  const fetched_at = new Date().toISOString();

  const [freshTracks, freshVideos] = await Promise.all([refreshTracks(), refreshVideos()]);
  const previousTracks = JSON.parse(await fs.readFile(path.join(dataDir, 'latestTracks.json'), 'utf8'));
  const previousVideos = JSON.parse(await fs.readFile(path.join(dataDir, 'latestVideos.json'), 'utf8'));
  const tracks = freshTracks.map(t => ({ ...previousTracks.items.find(old => old.page_url === t.page_url), ...t }));
  // RSS is a recent window, not a full catalogue. Preserve older verified entries.
  const videos = mergeVideos(previousVideos.items, freshVideos).map(v => ({ ...v, category: v.category || 'New uploads' }));

  await fs.writeFile(
    path.join(dataDir, "latestTracks.json"),
    JSON.stringify({ fetched_at, source: `${BANDCAMP_BASE}/music`, items: tracks }, null, 2) + "\n"
  );
  await fs.writeFile(
    path.join(dataDir, "latestVideos.json"),
    JSON.stringify({ ...previousVideos, fetched_at, source: `https://www.youtube.com/channel/${YOUTUBE_CHANNEL_ID}`, items: videos }, null, 2) + "\n"
  );

  console.log(`[refresh-feeds] wrote ${tracks.length} tracks, ${videos.length} videos at ${fetched_at}`);
}

module.exports = { parseBandcampRelease, mergeVideos };
if (require.main === module) main().catch(err => {
  console.error("[refresh-feeds] FAILED:", err.message);
  process.exit(1);
});
