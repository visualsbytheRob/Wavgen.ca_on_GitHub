const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

// A clean checkout uses the file's latest commit, never checkout/build time.
// Local uncommitted edits use mtime so preview builds also advertise edits.
// Publication dates and Atom IDs remain independent of modification dates.
function createUpdatedResolver(cwd = process.cwd()) {
  const cache = new Map();
  const git = args => execFileSync('git', args, { cwd, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] }).trim();
  if (git(['rev-parse', '--is-shallow-repository']) === 'true') {
    throw new Error('Atom update dates require full Git history (checkout fetch-depth: 0).');
  }
  return function updated(item) {
    const file = path.resolve(cwd, item.inputPath);
    const stat = fs.statSync(file);
    const key = JSON.stringify([file, stat.mtimeMs, stat.size, item.date, item.data?.updated]);
    if (cache.has(key)) return cache.get(key);
    const publication = new Date(item.date).getTime();
    if (!Number.isFinite(publication)) throw new Error('Invalid publication date: ' + item.inputPath);
    const times = [publication];
    if (item.data?.updated !== undefined) {
      const explicit = new Date(item.data.updated).getTime();
      if (!Number.isFinite(explicit)) throw new Error('Invalid updated date: ' + item.inputPath);
      times.push(explicit);
    }
    const relative = path.relative(cwd, file);
    const committed = git(['log', '-1', '--format=%cI', '--', relative]);
    if (committed) times.push(new Date(committed).getTime());
    if (!committed || git(['status', '--porcelain', '--', relative])) times.push(stat.mtimeMs);
    const date = new Date(Math.max(...times));
    cache.set(key, date);
    return date;
  };
}

module.exports = { createUpdatedResolver };
