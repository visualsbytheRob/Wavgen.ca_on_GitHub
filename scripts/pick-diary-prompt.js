#!/usr/bin/env node
// Picks a diary prompt from src/_data/diaryQuestions.json that hasn't been
// used recently, writes it to src/_data/dailyPrompt.json. Tracks recently-
// used indices in .diary-prompt-state.json so each pick is a fresh question
// even if you fire the button multiple times in a day.
//
// Window size: questions repeat only after ~all-but-one have been used.
// With ~365 questions, that's roughly a year between repeats at one-a-day.
//
// Run manually: `npm run diary:pick`. Also run by .github/workflows/diary-prompt.yml.

const fs = require("node:fs/promises");
const path = require("node:path");

const ROOT = path.join(__dirname, "..");
const QUESTIONS_FILE = path.join(ROOT, "src", "_data", "diaryQuestions.json");
const OUT_FILE = path.join(ROOT, "src", "_data", "dailyPrompt.json");
const STATE_FILE = path.join(ROOT, ".diary-prompt-state.json");

async function loadState() {
  try {
    return JSON.parse(await fs.readFile(STATE_FILE, "utf8"));
  } catch {
    return { recently_used: [] };
  }
}

async function saveState(state) {
  await fs.writeFile(STATE_FILE, JSON.stringify(state, null, 2) + "\n");
}

async function main() {
  const { questions } = JSON.parse(await fs.readFile(QUESTIONS_FILE, "utf8"));
  if (!Array.isArray(questions) || questions.length === 0) {
    throw new Error("diaryQuestions.json has no questions");
  }
  const state = await loadState();
  const total = questions.length;

  // Keep the sliding window at total-1 so there's always at least one
  // unused question to pick from. Trim oldest entries if window exceeds.
  const windowSize = Math.max(1, total - 1);
  while (state.recently_used.length >= windowSize) {
    state.recently_used.shift();
  }

  // Pick a random unused index
  const used = new Set(state.recently_used);
  const candidates = [];
  for (let i = 0; i < total; i++) {
    if (!used.has(i)) candidates.push(i);
  }
  const idx = candidates[Math.floor(Math.random() * candidates.length)];

  state.recently_used.push(idx);
  await saveState(state);

  const question = questions[idx];
  const date = new Date().toISOString().slice(0, 10);

  await fs.writeFile(OUT_FILE, JSON.stringify({
    date,
    question,
    source: "random-with-history",
    chosen_index: idx,
    bank_size: total,
    recently_used_window: state.recently_used.length
  }, null, 2) + "\n");

  console.log(`[diary-prompt] ${date}: "${question}" (#${idx + 1}/${total}, window=${state.recently_used.length})`);
}

main().catch(err => {
  console.error("[diary-prompt] FAILED:", err.message);
  process.exit(1);
});
