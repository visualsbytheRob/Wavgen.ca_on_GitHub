const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const os = require('os');
const path = require('path');
const { execFileSync } = require('child_process');
const { createUpdatedResolver } = require('./feed-dates');

test('edits advance updated while clean rebuilds ignore checkout mtime and preserve publication', () => {
  const cwd = fs.mkdtempSync(path.join(os.tmpdir(), 'wavgen-feed-dates-'));
  const git = (args, date) => execFileSync('git', args, { cwd, stdio: 'pipe', env: { ...process.env, ...(date ? { GIT_AUTHOR_DATE: date, GIT_COMMITTER_DATE: date } : {}) } });
  try {
    git(['init']); git(['config', 'user.name', 'Feed regression']); git(['config', 'user.email', 'fixture@example.invalid']);
    const file = path.join(cwd, 'entry.md'); fs.writeFileSync(file, 'original'); git(['add', 'entry.md']); git(['commit', '-m', 'original'], '2020-01-01T00:00:00Z');
    const item = { inputPath: './entry.md', date: new Date('2019-01-01T00:00:00Z'), data: {} };
    const updated = createUpdatedResolver(cwd);
    assert.equal(updated(item).toISOString(), '2020-01-01T00:00:00.000Z');
    fs.utimesSync(file, new Date('2025-01-01'), new Date('2025-01-01'));
    assert.equal(updated(item).toISOString(), '2020-01-01T00:00:00.000Z', 'a fresh checkout must not manufacture updates');
    fs.writeFileSync(file, 'edited'); fs.utimesSync(file, new Date('2022-01-01'), new Date('2022-01-01'));
    assert.equal(updated(item).toISOString(), '2022-01-01T00:00:00.000Z');
    git(['add', 'entry.md']); git(['commit', '-m', 'edited'], '2021-01-01T00:00:00Z');
    assert.equal(createUpdatedResolver(cwd)(item).toISOString(), '2021-01-01T00:00:00.000Z');
    assert.equal(item.date.toISOString(), '2019-01-01T00:00:00.000Z');
    assert.throws(() => updated({ ...item, data: { updated: 'invalid' } }), /Invalid updated date/);
  } finally { fs.rmSync(cwd, { recursive: true, force: true }); }
});
