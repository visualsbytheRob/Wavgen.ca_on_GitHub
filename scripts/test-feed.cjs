const fs = require('fs');
const path = require('path');
const assert = require('assert/strict');
const { spawnSync } = require('child_process');
const scratch = path.resolve('.cache/feed-regression');
fs.mkdirSync(scratch, { recursive: true });
const feedFile = path.resolve('_site/feed.xml');
const run = args => spawnSync(process.execPath, args, { encoding: 'utf8' });
const validate = file => run(['scripts/validate-feed.js', file]);
const baseline = fs.readFileSync(feedFile, 'utf8');
const entries = xml => xml.match(/<entry>[\s\S]*?<\/entry>/g) || [];
assert.equal(entries(baseline).length, 20, 'all 20 approved diary entries remain');
assert.equal(validate(feedFile).status, 0);
const variants = {
  ampersand: baseline.replace('<title>', '<title>bad & '),
  rawHTML: baseline.replace('<content type="html">', '<content type="html"><b>bad</b>'),
  control: baseline.replace('<title>', '<title>\x01'),
  duplicate: baseline.replace('</feed>', entries(baseline)[0] + '</feed>'),
  invalidDate: baseline.replace(/<updated>.*?<\/updated>/, '<updated>2026-02-30T00:00:00Z</updated>'),
  missingID: baseline.replace(/<id>.*?<\/id>/, ''),
  namespace: baseline.replace('http://www.w3.org/2005/Atom', 'urn:wrong'),
  relativeID: baseline.replace(/<id>.*?<\/id>/, '<id>relative</id>'),
  author: baseline.replace(/<author>[\s\S]*?<\/author>/, ''),
  selfLink: baseline.replace(/<link rel="self"[^>]*\/>/, '')
};
for (const [name, xml] of Object.entries(variants)) {
  const file = path.join(scratch, name + '.xml'); fs.writeFileSync(file, xml);
  assert.equal(validate(file).status, 1, name + ' must fail validation');
}

// Exercise an actual source edit through Eleventy while keeping published/ID fixed.
const fixture = path.resolve('src/diary/entries/2018-01-01-feed-regression-fixture.md');
assert.ok(!fs.existsSync(fixture), 'do not overwrite an existing source');
function build() {
  const result = run([require.resolve('@11ty/eleventy/cmd.js')]);
  assert.equal(result.status, 0, result.stdout + result.stderr);
  assert.equal(validate(feedFile).status, 0);
  return fs.readFileSync(feedFile, 'utf8');
}
const tag = (xml, name) => xml.match(new RegExp('<' + name + '>(.*?)</' + name + '>'))[1];
try {
  fs.writeFileSync(fixture, '---\ntitle: Feed regression fixture\ndate: 2018-01-01\n---\nOriginal fixture body.\n');
  fs.utimesSync(fixture, new Date('2030-01-01'), new Date('2030-01-01'));
  const before = build(); const oldEntry = entries(before).find(e => e.includes('Feed regression fixture'));
  fs.appendFileSync(fixture, 'Edited fixture body.\n');
  fs.utimesSync(fixture, new Date('2031-01-01'), new Date('2031-01-01'));
  const after = build(); const newEntry = entries(after).find(e => e.includes('Feed regression fixture'));
  assert.equal(tag(oldEntry, 'id'), tag(newEntry, 'id'));
  assert.equal(tag(oldEntry, 'published'), tag(newEntry, 'published'));
  assert.ok(new Date(tag(newEntry, 'updated')) > new Date(tag(oldEntry, 'updated')));
  assert.ok(new Date(tag(after, 'updated')) > new Date(tag(before, 'updated')));
  assert.equal(tag(build(), 'updated'), tag(after, 'updated'), 'unchanged rebuild stays stable');
} finally {
  fs.unlinkSync(fixture);
  const restored = build();
  assert.equal(entries(restored).length, 20);
  assert.equal(tag(restored, 'updated'), tag(baseline, 'updated'));
}
console.log('Feed: 20 entries retained; 10 malformed variants rejected; source edit advances entry/feed updated while preserving ID/published; unchanged rebuild stable.');
