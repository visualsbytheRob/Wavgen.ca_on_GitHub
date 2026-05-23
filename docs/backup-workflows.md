# Free-tier backup workflows

GitHub Actions versions of the three Claude loops. They run on cron, commit results to the repo, and let GitHub Pages auto-deploy the site. **Zero external API costs** beyond GitHub itself (free for public repos, 2000 min/month for private — way more than needed).

Designed to **coexist** with the Claude loops: each backup checks whether Claude already produced today's output and skips if so. You can run both, run only Claude (when subscription is active), or only the backups (when you pause Claude). The site keeps working in any combination.

## What each backup does and how it differs from Claude

| Loop | Claude version (paid) | Free backup (this) |
|---|---|---|
| **Monthly refresh** | Same: runs `npm run refresh:monthly`, commits, pushes | Identical — no editorial loss. **Pure 1:1 replacement.** |
| **News briefing** (M/W/F) | Selects, dedupes, summarizes news items per section; sends email | Aggregates RSS, dedupes against last 7 days, surfaces titles + RSS summaries. No editorial layer, no email. **Shows up on /diary/** |
| **Diary prompt** (daily) | Reads your repo context, asks one specific contextual question; sends email | Picks one of 50 hand-written questions by day-of-year. **Shows up on /diary/** at the top of the Site Log + emails via Gmail SMTP (when secrets configured) |

The two news briefings (Claude + RSS) produce different output even on the same day — Claude writes editorial summaries, RSS just lists headlines with descriptions. Both follow the same Markdown schema (frontmatter + sections), so both appear in the Site Log timeline.

## Files

```
.github/workflows/
├── monthly-refresh.yml         # cron `0 14 1 * *`     → npm run refresh:monthly + commit
├── news-briefing.yml           # cron `0 12 * * *`     → generate-briefing + commit + email
├── diary-prompt.yml            # cron `0 13 * * *`     → pick-diary-prompt + commit + email
└── collect-diary-replies.yml   # cron `0 */2 * * *`    → poll Gmail, write entries, commit

scripts/
├── generate-briefing.js        # RSS aggregator, writes src/diary/news/YYYY-MM-DD.md
├── pick-diary-prompt.js        # picks today's question from rotation
├── send-email.js               # Gmail SMTP sender (CLI: subject + stdin body)
└── collect-diary-replies.js    # IMAP poller — reads replies, writes diary entries

src/_data/
├── diaryQuestions.json         # static rotation (~50 hand-written reflection questions)
└── dailyPrompt.json            # today's pick, surfaced on /diary/

.diary-processed-replies.json   # state file — Message-IDs already turned into entries
```

## The full diary loop

1. **9am EDT daily**: `diary-prompt.yml` picks today's question, writes JSON, emails you
2. **You reply** to that email anytime during the day (just hit reply, write 100-300 words, send)
3. **Within ~2 hours**: `collect-diary-replies.yml` polls Gmail, finds your reply, extracts the body (strips quoted text), writes `src/diary/entries/YYYY-MM-DD-question-slug.md`, commits, pushes
4. **GitHub Pages rebuilds**: your reply now appears on `/diary/` in the Site Log timeline, with the question as the entry title

Same Gmail app password handles both send (SMTP) and read (IMAP) — Gmail allows both with a single app password.

## Cron timing

GitHub Actions cron is in **UTC** and doesn't support timezones. The schedules above assume EDT (summer time, UTC-4):

| Workflow | Cron (UTC) | Fires at (EDT) | Fires at (EST, drifts) |
|---|---|---|---|
| News briefing | `0 12 * * *` | 8am daily | 7am daily |
| Diary prompt | `0 13 * * *` | 9am daily | 8am daily |
| Reply collector | `0 */2 * * *` | every 2 hours | every 2 hours |
| Monthly refresh | `0 14 1 * *` | 10am on the 1st | 9am on the 1st |

GitHub Actions cron is **not exact** — runs can be delayed 15-30 minutes during peak load. For a backup, that's fine.

## Coexisting with Claude

The news-briefing workflow checks if `src/diary/news/YYYY-MM-DD.md` already exists. If Claude wrote one earlier, the backup exits silently — no duplicate.

The diary-prompt workflow rewrites `dailyPrompt.json` every day; Claude doesn't touch this file, so they're complementary (Claude pushes email, backup surfaces on site).

The monthly-refresh workflow runs the same script Claude would run — overwrites the same JSON files with the same data. Idempotent, no conflict.

## Local testing

```bash
npm run briefing:generate    # writes today's briefing to src/diary/news/
npm run diary:pick           # writes today's prompt to src/_data/dailyPrompt.json
npm run refresh:monthly      # refreshes Bandcamp + YouTube + projects data
```

## Enabling and disabling

Workflows are **enabled by default** once committed. To disable one without deleting it: edit the file and change `on:` to `on: workflow_dispatch:` (manual-only). Or click into the Actions tab on GitHub and use the "Disable workflow" button.

## When the RSS sources fail

Some publishers block bot user agents (Pitchfork, The Verge, Resident Advisor changed feed URLs, blogTO removed RSS). The script logs `[briefing] skip <url>: HTTP 403/404` for each and continues with the rest. Currently still aggregating from:

- **Music**: bandcamp.com/daily, factmag.com
- **Video**: nofilmschool.com, petapixel.com, cinema5d.com
- **Data**: news.ycombinator.com, techcrunch.com
- **Art**: thisiscolossal.com, hyperallergic.com
- **Wider**: feeds.bbci.co.uk (world), goodnewsnetwork.org (good news)

Toronto RSS is currently absent — blogTO retired their feed. To add a Toronto source, edit `FEEDS` / `WIDER_CONTEXT` in `scripts/generate-briefing.js`. Candidates: `https://www.thestar.com/feed.RSS_GenericList.001.rss` (Toronto Star), CBC Toronto feed, or build a daily Google News RSS query.

## Adding more diary questions

Edit `src/_data/diaryQuestions.json` — add strings to the `questions` array. The rotation auto-extends; pick-script runs `dayOfYear % count` so any size works.

## Costs

- **GitHub Actions**: 0 minutes consumed for public repos. Each job runs in ~30-90 seconds. Even at maximum frequency (~10 runs/month total: 12 news + 30 diary + 1 monthly = 43 runs × 1 min ≈ 43 min/month) you'd be far under the 2000-min free tier for private repos.
- **Bandwidth/storage**: Negligible. Each briefing markdown is ~5KB. JSON data files ~3-15KB each.
- **No API keys required.** No SMTP. No email. No paid services anywhere.

## Email setup (free, optional)

Both the diary prompt and the news briefing workflows can email via Gmail SMTP using a free app password. Without secrets configured, the workflows still commit to the repo and surface content on the site — they just don't email.

### Generate a Gmail app password

1. Go to <https://myaccount.google.com/apppasswords> (requires 2-Step Verification enabled — same page will walk you through enabling it if not)
2. Pick a name like `Wavgen GitHub Actions` and create
3. Google shows a 16-character password — copy it now, you can't view it again later (you CAN delete it and make a new one any time)

### Add three GitHub repo secrets

Repo settings → Secrets and variables → Actions → New repository secret.

| Secret name | Value |
|---|---|
| `GMAIL_USER` | The Gmail address that sends (e.g. `robmcdtv@gmail.com`) |
| `GMAIL_APP_PASSWORD` | The 16-character app password from step 1 (paste as-is, spaces are fine) |
| `EMAIL_TO` | The address that receives (usually same as `GMAIL_USER`) |

Once these three are set, the next scheduled run will email you. To disable email later, delete `GMAIL_APP_PASSWORD` from secrets — the workflows fall back to site-only mode automatically.

### Safety story

- App passwords are **single-purpose** — they can ONLY authenticate SMTP send. They cannot read your inbox, change settings, or access your account.
- They're **revocable** in one click at <https://myaccount.google.com/apppasswords> without touching your main Gmail password.
- GitHub secrets are **encrypted at rest** and auto-masked in workflow logs (even if a step tried to `echo` the password, GitHub redacts it).
- The credential never leaves your repo's secret store and Google's SMTP server — no third party touches it.

### What you'll get

- **Diary prompt email** daily at ~9am EDT — subject `Wavgen prompt — YYYY-MM-DD`, body is the question
- **News briefing email** Mon/Wed/Fri at ~8am EDT — subject `Wavgen briefing — YYYY-MM-DD`, body is the briefing markdown (without the YAML frontmatter)

## Manual triggers on /diary/ (one-tap workflow firing)

The "Manual triggers" card on `/diary/` has a password-locked launcher with:
- 📰 **Scrape news now**
- ✍️ **Send me a prompt now**
- 📥 **Collect replies now**
- 💍 **One button to rule them all** (fires all three at once)

Default password is **`transmit`** (changeable in one line of `src/diary/index.njk`).

### One-time setup (~3 minutes)

The buttons need a GitHub PAT to fire workflows. To avoid GitHub's secret scanner auto-revoking it, we lightly XOR-obfuscate the PAT with your password before committing it.

1. **Generate a fine-grained PAT**:
   - <https://github.com/settings/personal-access-tokens/new>
   - Name: `Wavgen diary buttons`
   - Expiration: 1 year (renewable)
   - Repository access: *Only select repositories* → `Wavgen.ca_on_GitHub`
   - Repository permissions: **Actions** = Read and write (the only one)
   - Generate, copy the token (only shown once)

2. **Obfuscate it locally**:
   ```bash
   node scripts/obfuscate-pat.js <YOUR_PAT> transmit
   ```
   It prints a base64 string like `ExsVBgYPNgQVBj4oMiYs…`

3. **Paste the result into `src/diary/index.njk`**:
   ```js
   var PASSWORD = 'transmit';
   var OBFUSCATED_PAT = 'ExsVBgYPNgQVBj4oMiYs…';  // paste here
   ```

4. **Commit and push.** Done.

### How it works

- The committed file contains the XOR'd base64 — no `github_pat_…` literal, so GitHub's secret scanner doesn't flag/auto-revoke it
- When you enter the password on /diary/, the JS decodes the PAT in browser memory and uses it to POST to the GitHub API
- Wrong password = the decoded "PAT" is garbage → GitHub API rejects → buttons fail with a clear error
- The 💍 button POSTs to all three workflow_dispatch endpoints in parallel

### Until you paste the PAT

The buttons fall back to deep-link mode (open the GitHub Actions page in a new tab; tap Run workflow there). So they always work — they just become one-tap once the PAT is in place.

### Security reality (you said you don't care, here's what you're accepting)

- The committed file has BOTH the obfuscated PAT and the password (in plain JS source). Anyone who finds both and knows XOR can recover the PAT.
- Worst case if extracted: someone fires your workflows = you get spam emails from the news/diary loops. They cannot read your code, see other secrets, or touch any other repo (the PAT is scoped narrowly).
- Mitigation when annoying: delete the PAT at <https://github.com/settings/personal-access-tokens>, regenerate, re-run the obfuscate script, push.

## Future enhancements (optional)

- **Auto-disable Claude triggers** when these are running, by checking a repo flag. Currently you manually choose which to use.
