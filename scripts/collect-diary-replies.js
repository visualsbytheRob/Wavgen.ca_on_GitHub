#!/usr/bin/env node
// Polls Gmail via IMAP for replies to "Wavgen prompt — …" emails and
// converts each new reply into a diary entry markdown file under
// src/diary/entries/. Tracks processed messages by RFC 822 Message-ID
// in .diary-processed-replies.json (committed alongside the entries).
//
// Uses the SAME Gmail app password as the send-email script. No new
// secrets, no new APIs. Same scope (SMTP send + IMAP read are both
// granted by a single Gmail app password).
//
// Env vars (from GitHub Actions secrets):
//   GMAIL_USER          - Gmail address to read FROM
//   GMAIL_APP_PASSWORD  - the 16-char app password
//
// Exits 0 silently if creds missing, so the workflow degrades gracefully.

const fs = require("node:fs/promises");
const path = require("node:path");
const { ImapFlow } = require("imapflow");
const { simpleParser } = require("mailparser");

const ROOT = path.join(__dirname, "..");
const ENTRIES_DIR = path.join(ROOT, "src", "diary", "entries");
const STATE_FILE = path.join(ROOT, ".diary-processed-replies.json");
const SUBJECT_MATCH = /^Re:\s*Wavgen prompt\s*[—-]/i;

async function loadState() {
  try {
    return JSON.parse(await fs.readFile(STATE_FILE, "utf8"));
  } catch {
    return { processed: [] };
  }
}

async function saveState(state) {
  await fs.writeFile(STATE_FILE, JSON.stringify(state, null, 2) + "\n");
}

function extractReplyAndQuestion(text) {
  // Email replies typically have: [reply text]\n\nOn <date> <addr> wrote:\n> [original]
  // Split at the "On ... wrote:" delimiter that Gmail and most clients add.
  const delim = text.search(/^\s*On .{5,200} wrote:\s*$/m);
  let reply, quoted;
  if (delim >= 0) {
    reply = text.slice(0, delim).trim();
    quoted = text.slice(delim).trim();
  } else {
    // Fallback: split at first ">" line (older quoting style)
    const lines = text.split("\n");
    const firstQuoteIdx = lines.findIndex(l => /^\s*>/.test(l));
    if (firstQuoteIdx > 0) {
      reply = lines.slice(0, firstQuoteIdx).join("\n").trim();
      quoted = lines.slice(firstQuoteIdx).join("\n").trim();
    } else {
      reply = text.trim();
      quoted = "";
    }
  }
  // Original question is the first non-blank line of the quoted block,
  // stripped of leading "> " and any "On ... wrote:" line above it.
  const questionLines = quoted
    .split("\n")
    .map(l => l.replace(/^\s*>\s?/, "").trim())
    .filter(l => l && !/^On .{5,200} wrote:/i.test(l));
  const question = questionLines[0] || "";
  return { reply, question };
}

function slugify(s) {
  return s.toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 50);
}

function yamlEscape(s) {
  return s.replace(/"/g, '\\"');
}

async function processMessage(client, uid, state) {
  const msg = await client.fetchOne(uid, { source: true, envelope: true });
  if (!msg || !msg.source) return null;
  const messageId = msg.envelope?.messageId;
  if (!messageId) {
    console.warn(`[reply-collector] uid ${uid} has no Message-ID — skipping`);
    return null;
  }
  if (state.processed.includes(messageId)) return null;

  const parsed = await simpleParser(msg.source);

  // Only process replies authored by the user themselves (replies-to-self)
  const fromAddrs = (parsed.from?.value || []).map(a => (a.address || "").toLowerCase());
  const expectedUser = (process.env.GMAIL_USER || "").toLowerCase();
  if (!fromAddrs.includes(expectedUser)) {
    state.processed.push(messageId);  // mark so we don't reconsider
    return null;
  }

  const subject = parsed.subject || "";
  const dateMatch = subject.match(/(\d{4}-\d{2}-\d{2})/);
  const promptDate = dateMatch ? dateMatch[1] : (parsed.date || new Date()).toISOString().slice(0, 10);

  const text = parsed.text || "";
  const { reply, question } = extractReplyAndQuestion(text);

  if (!reply || reply.length < 4) {
    console.log(`[reply-collector] empty reply body for ${messageId} — skipping`);
    state.processed.push(messageId);
    return null;
  }

  const title = question || "Diary entry";
  const slug = slugify(question || reply.split(/\s+/).slice(0, 6).join(" ")) || "entry";
  const fileName = `${promptDate}-${slug}.md`;
  const filePath = path.join(ENTRIES_DIR, fileName);

  // Don't overwrite if a file already exists for this slug+date
  try {
    await fs.access(filePath);
    console.log(`[reply-collector] ${fileName} already exists — marking processed without overwrite`);
    state.processed.push(messageId);
    return null;
  } catch {}

  const md = `---\ntitle: "${yamlEscape(title)}"\ndate: ${promptDate}\n---\n\n${reply}\n`;
  await fs.mkdir(ENTRIES_DIR, { recursive: true });
  await fs.writeFile(filePath, md);
  state.processed.push(messageId);
  console.log(`[reply-collector] saved ${fileName} (${reply.length} chars)`);
  return fileName;
}

async function main() {
  const user = process.env.GMAIL_USER;
  const pass = process.env.GMAIL_APP_PASSWORD;
  if (!user || !pass) {
    console.log("[reply-collector] GMAIL_USER / GMAIL_APP_PASSWORD not set — skipping");
    return;
  }

  const state = await loadState();
  const client = new ImapFlow({
    host: "imap.gmail.com",
    port: 993,
    secure: true,
    auth: { user, pass },
    logger: false
  });

  await client.connect();
  let lock;
  try {
    lock = await client.getMailboxLock("INBOX");
    const uids = await client.search({ subject: "Wavgen prompt" });
    let saved = 0;
    for (const uid of uids) {
      // Quick subject pre-filter (search is fuzzy in Gmail)
      const env = await client.fetchOne(uid, { envelope: true });
      if (!env?.envelope?.subject || !SUBJECT_MATCH.test(env.envelope.subject)) continue;
      const result = await processMessage(client, uid, state);
      if (result) saved++;
    }
    console.log(`[reply-collector] processed pass complete: ${saved} new ${saved === 1 ? "entry" : "entries"}`);
  } finally {
    if (lock) lock.release();
    await client.logout();
  }

  await saveState(state);
}

main().catch(err => {
  console.error("[reply-collector] FAILED:", err.message);
  process.exit(1);
});
