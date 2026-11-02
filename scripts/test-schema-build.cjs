// Exercise the real Eleventy pipeline, not just the validator's helper API.
const fs = require('fs');
const path = require('path');
const assert = require('assert/strict');
const { spawnSync } = require('child_process');
const scratch = path.resolve('.cache/schema-build-regression');
fs.mkdirSync(scratch, { recursive: true });
for (const commented of [false, true]) {
  const name = commented ? 'commented' : 'live';
  const config = path.join(scratch, name + '.cjs');
  fs.writeFileSync(config, `module.exports = function(config) {
    const settings = require(${JSON.stringify(path.resolve('.eleventy.js'))})(config);
    ${commented ? `config.addTransform('comment-jsonld-regression', function(html) {
      return typeof html === 'string' ? html.replace(/<script type="application\\/ld\\+json">[\\s\\S]*?<\\/script>/g, tag => '<!-- ' + tag + ' -->') : html;
    });` : ''}
    return settings;
  };`);
  const run = spawnSync(process.execPath, [require.resolve('@11ty/eleventy/cmd.js'), '--config=' + path.relative(process.cwd(), config).split(path.sep).join('/'), '--output=' + path.relative(process.cwd(), path.join(scratch, name)).split(path.sep).join('/')], { encoding: 'utf8' });
  const output = run.stdout + run.stderr;
  fs.writeFileSync(path.join(scratch, name + '.log'), output);
  assert.equal(run.error, undefined);
  if (commented) {
    assert.notEqual(run.status, 0, 'commented JSON-LD must fail the real build');
    assert.match(output, /commented-out block/);
  } else {
    assert.equal(run.status, 0, output);
    assert.match(fs.readFileSync(path.join(scratch, name, 'index.html'), 'utf8'), /<script type="application\/ld\+json">/);
  }
  console.log(`${name} JSON-LD: expected build result confirmed`);
}
