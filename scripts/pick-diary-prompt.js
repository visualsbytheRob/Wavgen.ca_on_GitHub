#!/usr/bin/env node
// Picks today's diary prompt from the static rotation in
// src/_data/diaryQuestions.json and writes it to
// src/_data/dailyPrompt.json so the /diary/ page can display it.
//
// Deterministic by day-of-year: same question for everyone on the same day,
// rotates through the full set, repeats every ~50 days (one per question).
//
// Run manually: `npm run diary:pick`. Also run by .github/workflows/diary-prompt.yml.

const fs = require("node:fs/promises");
const path = require("node:path");

const ROOT = path.join(__dirname, "..");
const QUESTIONS_FILE = path.join(ROOT, "src", "_data", "diaryQuestions.json");
const OUT_FILE = path.join(ROOT, "src", "_data", "dailyPrompt.json");

function dayOfYear(d) {
  const start = new Date(d.getFullYear(), 0, 0);
  const diff = d - start;
  return Math.floor(diff / 86400000);
}

async function main() {
  const { questions } = JSON.parse(await fs.readFile(QUESTIONS_FILE, "utf8"));
  if (!Array.isArray(questions) || questions.length === 0) {
    throw new Error("diaryQuestions.json has no questions");
  }
  const now = new Date();
  const idx = dayOfYear(now) % questions.length;
  const question = questions[idx];
  const date = now.toISOString().slice(0, 10);

  const payload = {
    date,
    question,
    source: "static-rotation",
    rotation_index: idx,
    rotation_size: questions.length
  };

  await fs.writeFile(OUT_FILE, JSON.stringify(payload, null, 2) + "\n");
  console.log(`[diary-prompt] ${date}: "${question}" (#${idx + 1}/${questions.length})`);
}

main().catch(err => {
  console.error("[diary-prompt] FAILED:", err.message);
  process.exit(1);
});
