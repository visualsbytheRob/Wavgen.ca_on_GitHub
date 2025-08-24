/*
 * scripts/save-entry-server.js
 * Local-only API to save diary Markdown into src/diary/entries/ while developing.
 * Runs alongside Eleventy dev server via `npm run dev`.
 */
const express = require('express');
const fs = require('fs');
const fsp = fs.promises;
const path = require('path');

const app = express();
const PORT = process.env.DIARY_API_PORT || 4321;

app.use(express.json({ limit: '1mb' }));

// Minimal CORS for local dev (Eleventy dev server runs on a different port)
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.sendStatus(200);
  next();
});

function todayStr() {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

function slugify(str) {
  return String(str || '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .slice(0, 80) || 'entry';
}

function buildMarkdown(title, date, body) {
  const t = (title || '').trim() || 'Untitled';
  const d = (date || '').trim() || todayStr();
  const b = (body || '').trim() || '- Point one\n- Point two\n\nNotes:\n- Context or links.';
  return `---\n` + `title: ${t}\n` + `date: ${d}\n` + `---\n\n` + b + `\n`;
}

app.post('/api/diary/save', async (req, res) => {
  try {
    const { title, date, body } = req.body || {};
    const d = (date || todayStr()).slice(0, 10);
    const name = `${d}-${slugify(title)}`;
    const filename = `${name}.md`;
    const destDir = path.join(__dirname, '..', 'src', 'diary', 'entries');
    const destPath = path.join(destDir, filename);

    await fsp.mkdir(destDir, { recursive: true });

    let finalPath = destPath;
    let i = 1;
    while (fs.existsSync(finalPath)) {
      finalPath = path.join(destDir, `${name}-${i}.md`);
      i += 1;
    }

    const md = buildMarkdown(title, date, body);
    await fsp.writeFile(finalPath, md, 'utf8');

    const rel = path.relative(path.join(__dirname, '..'), finalPath).replace(/\\/g, '/');
    return res.status(200).json({ ok: true, path: rel, filename: path.basename(finalPath) });
  } catch (e) {
    console.error('Save failed:', e);
    return res.status(500).json({ ok: false, error: String(e && e.message || e) });
  }
});

app.listen(PORT, () => {
  console.log(`📝 Diary Save API listening at http://localhost:${PORT}`);
});
