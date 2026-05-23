# Free-tier backup workflows

GitHub Actions versions of the three Claude loops. They run on cron, commit results to the repo, and let GitHub Pages auto-deploy the site. **Zero external API costs** beyond GitHub itself (free for public repos, 2000 min/month for private — way more than needed).

Designed to **coexist** with the Claude loops: each backup checks whether Claude already produced today's output and skips if so. You can run both, run only Claude (when subscription is active), or only the backups (when you pause Claude). The site keeps working in any combination.

## What each backup does and how it differs from Claude

| Loop | Claude version (paid) | Free backup (this) |
|---|---|---|
| **Monthly refresh** | Same: runs `npm run refresh:monthly`, commits, pushes | Identical — no editorial loss. **Pure 1:1 replacement.** |
| **News briefing** (M/W/F) | Selects, dedupes, summarizes news items per section; sends email | Aggregates RSS, dedupes against last 7 days, surfaces titles + RSS summaries. No editorial layer, no email. **Shows up on /diary/** |
| **Diary prompt** (daily) | Reads your repo context, asks one specific contextual question; sends email | Picks one of 50 hand-written questions by day-of-year. **Shows up on /diary/** at the top of the Site Log |

The two news briefings (Claude + RSS) produce different output even on the same day — Claude writes editorial summaries, RSS just lists headlines with descriptions. Both follow the same Markdown schema (frontmatter + sections), so both appear in the Site Log timeline.

## Files

```
.github/workflows/
├── monthly-refresh.yml      # cron `0 14 1 * *`  → npm run refresh:monthly + commit
├── news-briefing.yml        # cron `0 12 * * 1,3,5` → generate-briefing + commit
└── diary-prompt.yml         # cron `0 13 * * *`  → pick-diary-prompt + commit

scripts/
├── generate-briefing.js     # RSS aggregator, writes src/diary/news/YYYY-MM-DD.md
└── pick-diary-prompt.js     # picks today's question from rotation

src/_data/
├── diaryQuestions.json      # static rotation (~50 hand-written reflection questions)
└── dailyPrompt.json         # today's pick, surfaced on /diary/
```

## Cron timing

GitHub Actions cron is in **UTC** and doesn't support timezones. The schedules above assume EDT (summer time, UTC-4):

| Workflow | Cron (UTC) | Fires at (EDT) | Fires at (EST, drifts) |
|---|---|---|---|
| News briefing | `0 12 * * 1,3,5` | 8am Mon/Wed/Fri | 7am Mon/Wed/Fri |
| Diary prompt | `0 13 * * *` | 9am daily | 8am daily |
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

## Future enhancements (optional)

- **Add email** by adding `nodemailer` and using a Gmail app password as a repo secret. Free, ~10 minutes of setup. The backup workflows would gain email parity with the Claude versions.
- **Better Toronto + local sources** — Google News RSS query targeting Toronto: `https://news.google.com/rss/search?q=Toronto&hl=en-CA`
- **Auto-disable Claude triggers** when these are running, by checking a repo flag. Currently you manually choose which to use.
