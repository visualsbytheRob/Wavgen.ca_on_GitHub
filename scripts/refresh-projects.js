#!/usr/bin/env node
// Discovers interactive project pages on the site and writes them to
// src/_data/featuredProjects.json, sorted by git creation date (newest first).
// Run manually: `npm run refresh:projects`. Also run by the monthly trigger.

const fs = require("node:fs/promises");
const path = require("node:path");
const { execSync } = require("node:child_process");

const ROOT = path.join(__dirname, "..");
const SRC = path.join(ROOT, "src");
const OUT = path.join(SRC, "_data", "featuredProjects.json");

// Curated metadata for the interactive projects on the site.
// Array order = display order when dateAdded values are equal (sort is stable).
// New projects added later get a more recent git creation date and float to top.
// To add a new project: append a new entry here.
const PROJECTS = [
  { slug: "music/waveform-playground", title: "Waveform Playground", tag: "Audio",
    description: "Real-time waveform visualization and synthesis — sine/saw/square oscillators, harmonic editing, FM controls." },
  { slug: "data/big-data", title: "Big Data Pipelines", tag: "Data",
    description: "Interactive data pipeline visualization with flow diagrams and concept exploration." },
  { slug: "art/particle-systems", title: "Particle Systems", tag: "Art",
    description: "Generative particle effects you can manipulate in real time on canvas." }
];

function getCreationDate(relPath) {
  try {
    const out = execSync(
      `git log --diff-filter=A --follow --format=%aI -- "${relPath}"`,
      { cwd: ROOT }
    ).toString().trim();
    // Multiple lines if file was renamed; the LAST is the oldest add (true creation)
    const lines = out.split("\n").filter(Boolean);
    return lines.length ? lines[lines.length - 1] : new Date().toISOString();
  } catch {
    return new Date().toISOString();
  }
}

async function main() {
  const items = [];
  for (const project of PROJECTS) {
    const file = path.join(SRC, project.slug, "index.njk");
    const relFile = path.relative(ROOT, file);
    try {
      await fs.access(file);
    } catch {
      console.warn(`[projects] missing file, skipping: ${relFile}`);
      continue;
    }
    items.push({
      url: `/${project.slug}/`,
      title: project.title,
      description: project.description,
      tag: project.tag,
      dateAdded: getCreationDate(relFile)
    });
  }
  items.sort((a, b) => b.dateAdded.localeCompare(a.dateAdded));

  const out = {
    fetched_at: new Date().toISOString(),
    items
  };
  await fs.writeFile(OUT, JSON.stringify(out, null, 2) + "\n");
  console.log(`[refresh-projects] wrote ${items.length} projects to ${path.relative(ROOT, OUT)}`);
}

main().catch(err => {
  console.error("[refresh-projects] FAILED:", err.message);
  process.exit(1);
});
