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
  { slug: "video/generative-universe", title: "Generative Universe", tag: "Video",
    description: "Procedural universe generator with interactive exploration controls." },
  { slug: "art/shader-systems", title: "Shader Systems", tag: "Art",
    description: "GLSL shader editor and visualizer — edit code, see results live." },
  { slug: "data/big-data", title: "Big Data Pipelines", tag: "Data",
    description: "Interactive data pipeline visualization with flow diagrams and concept exploration." },
  { slug: "music/modular-patch-lab", title: "Modular Patch Lab", tag: "Audio",
    description: "Interactive modular synthesis environment — patch VCOs, VCFs, and LFOs with cable routing." },
  { slug: "art/particle-systems", title: "Particle Systems", tag: "Art",
    description: "Generative particle effects you can manipulate in real time on canvas." },
  { slug: "video/audiovisual-ecosystems", title: "Audiovisual Ecosystems", tag: "Video",
    description: "Audio-reactive visual ecosystems that respond to sound input." },
  { slug: "music/dj-performance-lab", title: "DJ & Performance Lab", tag: "Audio",
    description: "DJ mixer simulation with turntables, crossfading, and live performance controls." },
  { slug: "art/generative-art", title: "Generative Art", tag: "Art",
    description: "Live algorithmic art generation — code-driven canvas compositions." },
  { slug: "music/reverb-lab", title: "Reverb Lab", tag: "Audio",
    description: "Manipulate reverb parameters with real-time audio processing across multiple algorithms." },
  { slug: "video/realtime-visuals", title: "Realtime Visuals", tag: "Video",
    description: "Real-time visual effects renderer with parameter knobs." },
  { slug: "music/delay-echo-lab", title: "Delay & Echo Lab", tag: "Audio",
    description: "Interactive delay and echo processor with feedback loops and time-based controls." },
  { slug: "art/creative-coding-canvas", title: "Creative Coding Canvas", tag: "Art",
    description: "Canvas-based creative coding playground for sketches and experiments." },
  { slug: "music/sampling-lab", title: "Sampling Lab", tag: "Audio",
    description: "Audio sampling interface with pitch shifting, manipulation, and playback controls." },
  { slug: "music/psychoacoustics-lab", title: "Psychoacoustics Lab", tag: "Audio",
    description: "Explore audio perception with experiments in frequency response and binaural effects." },
  { slug: "music/algorithmic-composition", title: "Algorithmic Composition", tag: "Audio",
    description: "Generative music system — rule-based composition that plays itself out." }
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
