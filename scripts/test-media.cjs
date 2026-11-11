const { test } = require('node:test');
const assert = require('node:assert/strict');
const { parseBandcampRelease, mergeVideos } = require('./refresh-latest-feeds');
test('Bandcamp metadata works without the obsolete v2 embed string', async () => {
  const result = await parseBandcampRelease('<script data-tralbum="{&quot;current&quot;:{&quot;id&quot;:123,&quot;title&quot;:&quot;A &amp; B&quot;,&quot;release_date&quot;:&quot;2021-01-01&quot;},&quot;trackinfo&quot;:[]}"></script>', 'album', 'https://waveformgeneration.bandcamp.com/album/test');
  assert.equal(result.title, 'A & B');
  assert.match(result.embed_url, /album=123\//);
});
test('missing metadata fails closed', async () => {
  await assert.rejects(parseBandcampRelease('<html></html>', 'album', 'example'));
});
test('RSS refresh retains older catalogue videos and curated categories', () => {
  const result = mergeVideos([{video_id:'old',title:'Old'}, {video_id:'recent',category:'Music videos'}], [{video_id:'recent',title:'Updated'}, {video_id:'new',title:'New'}]);
  assert.equal(result.length,3);
  assert.equal(result[0].video_id,'old');
  assert.equal(result[1].title,'Updated');
  assert.equal(result[1].category,'Music videos');
});
