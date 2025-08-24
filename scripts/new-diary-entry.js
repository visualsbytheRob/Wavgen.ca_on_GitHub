#!/usr/bin/env node
/*
  new-diary-entry.js
  Creates a new diary Markdown file in src/diary/entries/ with today's date and a slug from the provided title.

  Usage:
    npm run new:diary "My Entry Title"
*/

const fs = require('fs');
const path = require('path');

function slugify(str) {
  return String(str)
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .substring(0, 80);
}

function today() {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

function main() {
  const title = process.argv.slice(2).join(' ').trim();
  if (!title) {
    console.error('Error: Please provide a title.\nExample: npm run new:diary "Explore GSAP timelines"');
    process.exit(1);
  }

  const date = today();
  const slug = slugify(title) || 'entry';
  const filename = `${date}-${slug}.md`;
  const dir = path.join(process.cwd(), 'src', 'diary', 'entries');
  const filePath = path.join(dir, filename);

  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  if (fs.existsSync(filePath)) {
    console.error(`Error: File already exists: ${filePath}`);
    process.exit(1);
  }

  const content = `---\n` +
`title: ${title}\n` +
`date: ${date}\n` +
`---\n\n` +
`- Point one\n` +
`- Point two\n\n` +
`Notes:\n` +
`- Context or links.\n`;

  fs.writeFileSync(filePath, content, 'utf8');
  console.log(`Created: ${path.relative(process.cwd(), filePath)}`);
}

main();
