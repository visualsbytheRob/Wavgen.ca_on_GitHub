#!/usr/bin/env node
// Composes the Sunday weekly digest: compresses the past 7 days of diary
// entries + news briefings + your (human) git commits into one email body.
// Pipes the body to scripts/send-email.js. Silent if the week was empty.
//
// Run by .github/workflows/sunday-digest.yml on Sunday mornings.

const fs = require("node:fs/promises");
const path = require("node:path");
const { execSync } = require("node:child_process");

const ROOT = path.join(__dirname, "..");
const ENTRIES_DIR = path.join(ROOT, "src", "diary", "entries");
const NEWS_DIR = path.join(ROOT, "src", "diary", "news");

function isoDate(d) { return d.toISOString().slice(0, 10); }

async function recentMarkdownFiles(dir, cutoff) {
  let files;
  try { files = await fs.readdir(dir); } catch { return []; }
  const results = [];
  for (const f of files) {
    if (!f.endsWith(".md")) continue;
    const dateMatch = f.match(/^(\d{4}-\d{2}-\d{2})/);
    if (!dateMatch) continue;
    const fileDate = new Date(dateMatch[1]);
    if (fileDate < cutoff) continue;
    const full = path.join(dir, f);
    const content = await fs.readFile(full, "utf8");
    const titleMatch = content.match(/^title:\s*["']?(.+?)["']?\s*$/m);
    const body = content.replace(/^---[\s\S]*?---\n?/, "").trim();
    results.push({
      file: f,
      date: dateMatch[1],
      title: titleMatch ? titleMatch[1] : f.replace(/\.md$/, ""),
      body
    });
  }
  return results.sort((a, b) => b.date.localeCompare(a.date));
}

function humanCommitsSince(sinceIso) {
  try {
    const out = execSync(
      `git log --since="${sinceIso}" --pretty=format:"%h|%ai|%an|%s"`,
      { cwd: ROOT }
    ).toString().trim();
    if (!out) return [];
    return out.split("\n")
      .map(line => {
        const [hash, date, author, ...rest] = line.split("|");
        return { hash, date: date.slice(0, 10), author, subject: rest.join("|") };
      })
      .filter(c => !/github-actions/i.test(c.author));
  } catch {
    return [];
  }
}

async function main() {
  const now = new Date();
  const cutoff = new Date(now.getTime() - 7 * 86400000);
  const cutoffIso = isoDate(cutoff);

  const entries = await recentMarkdownFiles(ENTRIES_DIR, cutoff);
  const briefings = await recentMarkdownFiles(NEWS_DIR, cutoff);
  const commits = humanCommitsSince(cutoffIso);

  const total = entries.length + briefings.length + commits.length;
  if (total === 0) {
    console.log("[weekly-digest] empty week — no email");
    return;
  }

  const parts = [];
  parts.push(`Your past week on wavgen.ca — ${cutoffIso} to ${isoDate(now)}`);
  parts.push("");

  if (entries.length) {
    parts.push("═══ DIARY ENTRIES ═══");
    parts.push("");
    for (const e of entries) {
      parts.push(`${e.date}: ${e.title}`);
      parts.push(e.body);
      parts.push("");
    }
  }

  if (commits.length) {
    parts.push("═══ COMMITS (yours) ═══");
    parts.push("");
    for (const c of commits) {
      parts.push(`${c.date}  ${c.hash}  ${c.subject}`);
    }
    parts.push("");
  }

  if (briefings.length) {
    parts.push("═══ NEWS BRIEFINGS THIS WEEK ═══");
    parts.push("");
    for (const b of briefings) {
      parts.push(`${b.date}:`);
      // First few bullet lines per briefing — keep digest compact
      const bullets = b.body.split("\n").filter(l => l.startsWith("- ")).slice(0, 6);
      parts.push(bullets.join("\n"));
      parts.push("");
    }
  }

  parts.push("— Full archive on https://wavgen.ca/diary/");
  const body = parts.join("\n");

  // Write to stdout for the workflow to pipe into send-email.js
  process.stdout.write(body);
  console.error(`[weekly-digest] composed ${total} items: ${entries.length} entries, ${briefings.length} briefings, ${commits.length} commits`);
}

main().catch(err => {
  console.error("[weekly-digest] FAILED:", err.message);
  process.exit(1);
});
