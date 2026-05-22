# Monthly music + video refresh loop

A third Claude Code on the web scheduled trigger, separate from the news loop and the diary loop. Runs once a month, refreshes the homepage's "Latest tracks" and "Latest videos" sections with whatever's most recent on Bandcamp and YouTube.

This loop is dumb on purpose: it just runs the local script `scripts/refresh-latest-feeds.js`, which does all the scraping and writes two JSON data files. Claude doesn't parse HTML in-prompt for this one — the script is faster, more deterministic, and you can run it locally any time without burning a session.

## Architecture

```
Monthly (1st of the month, 9am ET)
   │
   ▼
npm run refresh:feeds
   ├─ Fetches https://waveformgeneration.bandcamp.com/music
   │   ├─ Parses 3 most recent release URLs from the page
   │   └─ For each, fetches the release page and extracts the
   │       numeric album/track ID for the Bandcamp embed iframe
   │
   ├─ Fetches https://www.youtube.com/feeds/videos.xml?channel_id=UCLK1PORnw7wtArjjhfnA2RQ
   │   └─ Parses 3 most recent video IDs from the YouTube RSS feed
   │
   └─ Writes src/_data/latestTracks.json and src/_data/latestVideos.json
   │
   ▼
git commit + push → GitHub Pages rebuilds → homepage updates
```

The homepage (`src/index.njk`) reads those two JSON files and renders three Bandcamp embeds + three YouTube embeds in the "Latest tracks" / "Latest videos" section.

## Running locally

```bash
npm run refresh:feeds
git add src/_data/latestTracks.json src/_data/latestVideos.json
git commit -m "refresh: monthly Bandcamp + YouTube feeds"
git push
```

That's the whole flow. The scheduled trigger does exactly this, automatically.

## Setup checklist (Claude Code on the web)

### A. Create the schedule trigger

1. claude.ai/code → wavgen.ca_on_github → Triggers → New trigger → Schedule.
2. **When**: 1st of each month at `09:00`, timezone **America/Toronto**. (cron: `0 9 1 * *`)
3. **Branch**: `main`.
4. **Environment**: same as the news/diary loops. No MCPs needed for this one — pure git + bash.
5. **Prompt**: paste the prompt from below.
6. **Save**.

### B. Run once manually to verify

Click **Run now**. Watch the session — it should run `npm run refresh:feeds`, see two data files change, commit, push. Then check wavgen.ca homepage in 1-2 minutes — the embeds should reflect whatever's most current on your Bandcamp + YouTube.

## THE PROMPT

Paste this exactly into the schedule trigger.

````
You are the monthly feed refresh worker for Rob McDonald's wavgen.ca site. Your job is to update the homepage "Latest tracks" and "Latest videos" sections with whatever's most recent on Bandcamp and YouTube. You run autonomously.

## Your job (one shot, no creativity needed)

1. Run `npm run refresh:feeds`. This executes `scripts/refresh-latest-feeds.js` which fetches Bandcamp + YouTube and writes two JSON files under `src/_data/`.
2. Check `git diff` to confirm both `src/_data/latestTracks.json` and `src/_data/latestVideos.json` changed (or one of them — if nothing's new, that's OK too).
3. If there are changes, `git add` those files and commit with message: `refresh: monthly Bandcamp + YouTube feeds (YYYY-MM-DD)` (use today's date).
4. `git push origin main`.
5. Done. No email, no diary entry, no other output.

## Hard rules

1. **Only the two data files.** If the script touches anything else, abort and report — something is wrong.
2. **No edits to the script.** This loop doesn't tune the parser; it just runs it. If the script fails, report the error and exit — don't try to fix it.
3. **If both files are unchanged** (no new releases or videos since last run), exit silently. No commit, no push.
4. **Don't run other npm scripts.** No build, no tests, just `refresh:feeds`.

## Failure handling

- If `npm run refresh:feeds` exits non-zero, dump the error to the session log and exit. Don't commit partial state. The script may need updating because Bandcamp or YouTube changed their HTML — that's a human fix.
- If `git push` fails on network, retry up to 4 times with exponential backoff (2s, 4s, 8s, 16s).
````

## When you might need to update the script

`scripts/refresh-latest-feeds.js` parses HTML with regex. That's pragmatic but fragile to upstream changes. Symptoms:

- **Bandcamp regex stops matching**: `no embed id for <url> — skipping` warnings. Means the embed code pattern on release pages changed. Update the regex in `refreshTracks()`.
- **YouTube RSS structure changes**: rare but possible. Symptoms = 0 videos written. Update the regex in `refreshVideos()`.

If you're tuning the parser, run `npm run refresh:feeds` locally and inspect the output JSON before pushing.

## Cost expectations

The script runs in under 5 seconds. The trigger session is correspondingly cheap — maybe $0.05 per run. ~$0.60/year total.

## Cadence rationale

Monthly is right for this content. Music releases happen once every few months at most; YouTube uploads are more frequent but the homepage doesn't need to reflect every new upload within hours. If you start releasing music or videos more frequently, bump to weekly by changing the cron to `0 9 * * 1` (Mondays 9am) and re-saving the trigger.
