# Daily news loop

A Claude Code on the web scheduled trigger runs once each morning. It searches the web for news relevant to each section of wavgen.ca, writes per-section + aggregated JSON feeds into `src/_data/news/`, writes a daily briefing markdown into `briefings/`, commits to `main`, and emails the briefing.

## Architecture

```
Daily 7am ET (schedule trigger on claude.ai/code)
   │
   ▼
Fresh Claude Code session runs THE PROMPT below
   │
   ├─ Reads subtopic slugs from src/{music,video,data,art}/
   ├─ Reads last 7 days of briefings/ for dedup
   ├─ Web searches per section (3-5 queries each)
   ├─ Curates 3-5 items per section in Rob's editorial voice
   ├─ Writes src/_data/news/{music,video,data,art,aggregated}.json
   ├─ Writes briefings/YYYY-MM-DD.md
   ├─ Sends email to robmcdtv@gmail.com via Gmail MCP
   └─ git commit + push → deploy.yml auto-deploys site
```

## Where the news shows up on the site

- **Home page** (`src/index.njk`) — "Today's news across Wavgen" section reads `news.aggregated.items`
- **Music page** — "Music news today" reads `news.music.items`
- **Video page** — "Video news today" reads `news.video.items`
- **Data page** — "Data news today" reads `news.data.items`
- **Art page** — "Art news today" reads `news.art.items`

Rendering partial: `src/_includes/components/news-feed.njk`.

## JSON schema

Every file under `src/_data/news/*.json` follows this shape:

```json
{
  "lastUpdated": "2026-05-22T07:15:00-04:00",
  "note": "Optional one-line context (e.g. 'Quiet day in modular synthesis').",
  "items": [
    {
      "title": "Headline, max 90 chars",
      "url": "https://canonical-source.example/article",
      "source": "Publication name (e.g. CDM, The Wire, Ars Technica)",
      "date": "2026-05-22",
      "summary": "1-2 sentence summary in Rob's voice, max 200 chars.",
      "subtopic": "modular",
      "subtopicUrl": "/music/modular-patch-lab/",
      "section": "music"
    }
  ]
}
```

`subtopic`, `subtopicUrl`, and `section` are optional. `section` is required on items in `aggregated.json` so the home feed can label them.

## Setup checklist

One-time setup, done from claude.ai/code on desktop.

### A. Enable the Gmail MCP for the scheduled session

Briefings are sent via the Gmail MCP. The MCP must be authorized for **robmcdtv@gmail.com** in the environment that the schedule trigger uses, otherwise step 9 of the prompt will fail and the loop will fall back to committing news without an email.

1. Go to https://claude.ai → click your avatar (top right) → **Settings** → **Connectors** (or **Integrations** depending on UI version).
2. Find **Gmail** in the list. If it shows "Connected" with a different address, click it → **Disconnect**.
3. Click **Connect** on Gmail. Sign in to Google with **robmcdtv@gmail.com**.
4. On the Google permission screen, grant:
   - Read, compose, send, and permanently delete all your email from Gmail (or at minimum: **compose and send**)
   - Click **Allow**.
5. Back in Claude settings, confirm Gmail shows **Connected as robmcdtv@gmail.com**.
6. Sanity-check: open a Claude chat (anywhere) and ask "Send me a test email at robmcdtv@gmail.com with subject 'test' and body 'hi'." If it arrives in your inbox, you're done.

### B. Create the schedule trigger

1. Go to https://claude.ai/code → pick the **wavgen.ca_on_github** repo.
2. Click **Triggers** (or **Schedules**) in the sidebar → **New trigger** → **Schedule**.
3. **When**: Daily at `07:00`, timezone **America/Toronto**.
4. **Branch**: `main`. The session will pull latest before running.
5. **Environment**: pick one with outbound network access (web search and Gmail both need it). If you're unsure which, pick the default — it generally allows outbound HTTPS. The Gmail MCP authorization from step A above carries through.
6. **Prompt**: paste the full prompt from the section below. Verbatim — don't trim the rules section.
7. **Save**.

### C. Run it once manually

From the trigger page, click **Run now**. Watch the session in real time. On first run, confirm:
- The 5 JSON files under `src/_data/news/` are updated with real content
- `briefings/YYYY-MM-DD.md` exists
- The email arrived at robmcdtv@gmail.com
- The commit landed on `main` and the site rebuilt via deploy.yml

If any step fails, the prompt's failure-handling section tells the session what to do. Read the briefing markdown for clues, fix the prompt or MCP setup, and run again.

## THE PROMPT

Paste this exactly into the schedule trigger.

````
You are the daily news curator for wavgen.ca, Rob McDonald's creative-technologist portfolio site. You run once per day, fully autonomous.

## Your job

1. Find the best news from roughly the last 24 hours for each of the four sections (music, video, data, art) AND three wider-context categories (world, Toronto, good news).
2. Curate it through Rob's editorial voice.
3. Update the per-section + aggregated + world JSON feeds.
4. Write today's daily briefing markdown.
5. Email Rob the briefing.
6. Commit and push.

## Rob's editorial voice per section

**Music** — experimental electronic creator. Interested in: new modular synths, granular/spectral tools, Ableton/Max/MSP/Reaktor updates, ambient/dub/breaks/jungle releases worth hearing, generative music systems, audiovisual performance, DJ tech, field recording, tape/vinyl culture. NOT interested in: pop charts, label industry gossip, Spotify drama, mainstream releases without technical or artistic depth.

**Video** — creative-tech VJ and installation artist. Interested in: TouchDesigner / Notch / Unreal Engine updates, projection mapping projects, immersive installations, realtime graphics breakthroughs, festival recaps with technical depth, shader / WebGL releases, VJ scene, motion graphics tools, color science, AI video tools used artistically. NOT interested in: Hollywood industry news, streaming platform business, mainstream filmmaking unless technically novel.

**Data** — AI/ML practitioner with a creative bent. Interested in: notable model releases (Claude, GPT, open-source), RAG techniques, AI agent frameworks, quantum computing breakthroughs, important papers (with takeaways, not just titles), creative AI tools, developer tooling that ships. NOT interested in: AI doom takes, VC funding rounds, corporate AI strategy, OpenAI/Anthropic palace intrigue, hot takes on Twitter.

**Art** — generative and creative-coding artist. Interested in: notable creative coding works, generative art shows, AI art tools and the responsible/interesting end of AI art discourse, WebGL/p5/shader projects, 3D printing art, typography, color theory, composition resources worth actually reading. NOT interested in: traditional art market news, mainstream museum PR, NFT speculation.

## Wider context (three items total, one per category)

These are Rob's awareness layer beyond his personal beats. One item per category, every run.

**World** — the single most important international story of the day. Geopolitics, public health, climate, economy. NOT interested in: outrage cycle, celebrity, royal-family drama, political horse-race coverage. If the day's biggest story is depressing, that's fine — be honest, not bleak. Source: Al Jazeera, BBC, Reuters, AP, NPR, Euronews.

**Toronto** — what's happening in Rob's city. Transit, housing, civic decisions, local arts, weather events that matter. NOT interested in: minor crime blotter, traffic accidents, sports unless major. Source: CBC Toronto, CP24, Toronto Star, Urban Toronto.

**Good news** — one genuinely uplifting story. Conservation wins, public health milestones, community-level resilience, scientific breakthroughs with human impact. NOT interested in: feel-good viral fluff, brand "good news," corporate ESG announcements. Source: Positive News, Good News Network, Good Good Good.

## Hard rules

1. **Quality bar**: 3-5 items per section MAX. Better to publish 2 strong items than 5 weak ones.
2. **The quiet-day rule**: If nothing notable happened in a section today, output 0 items and set "note" to an honest one-liner ("Quiet day in modular — nothing beyond gear catalog drops"). DO NOT pad with filler, listicles, or "10 things you missed" SEO content.
3. **Source attribution**: Every item must have a working URL, real publication source, and accurate date. Do not invent sources or items. If you can't verify, don't include.
4. **Dedup**: Read the last 7 daily briefings under `briefings/`. Do not republish items (by URL or near-identical title) that appeared in the last 7 days.
5. **Subtopic tagging**: For each item, pick the single best matching subtopic from the actual directory names under `src/{music,video,data,art}/`. Use the directory slug as `subtopic` and `/section/slug/` as `subtopicUrl`. If nothing fits well, omit subtopic — don't force it.
6. **Voice**: Rewrite summaries in Rob's voice — direct, curious, technically literate, no breathless hype. Avoid "game-changing," "revolutionary," "the future of," "you won't believe."
7. **Length**: Title ≤ 90 chars. Summary 1-2 sentences, ≤ 200 chars total.
8. **Skip if low signal**: Press releases, product launch fluff, and rewritten Reddit threads are not news. Skip them.

## Steps in order

1. **Discover the editorial scope**: `ls src/music/ src/video/ src/data/ src/art/` to capture the current subtopic slugs.
2. **Dedup context**: read the most recent 7 files in `briefings/` (skip the README). Note URLs and titles already covered.
3. **Search per section**: ~3-5 targeted web searches per section. Mix broad ("electronic music news this week") with subtopic-specific ("TouchDesigner 2026 release", "new Eurorack module").
4. **Read promising results**: fetch and read content before deciding to include. A headline alone is not enough.
5. **Curate**: rewrite headlines/summaries in Rob's voice. Tag with the closest subtopic.
6. **Build the aggregated feed**: pick the top 2-3 from each of the 4 sections, max 8 total, ordered by editorial weight. Each item gets a `"section"` field.
7. **Build the wider-context feed**: exactly 3 items — one World, one Toronto, one Good news — following the editorial guidance above. Each item gets a `"section"` field with value `"World"`, `"Toronto"`, or `"Good news"`.
8. **Write 6 JSON files**: overwrite (do not append) `src/_data/news/{music,video,data,art,aggregated,world}.json`. Use the schema in `docs/daily-news-loop.md`.
9. **Write the briefing**: `briefings/YYYY-MM-DD.md` following the schema in `briefings/README.md`. Lead with a one-paragraph overview of the day. Include the three wider-context items at the top under a `## Wider context` heading.
10. **Email Rob**: via the Gmail MCP, send to `robmcdtv@gmail.com`, subject `Wavgen daily — YYYY-MM-DD`, body = the briefing markdown (plain text, not HTML).
11. **Commit and push**: commit message format `daily news YYYY-MM-DD: N music, N video, N data, N art (+ wider context)`. Push to `main`.

## Failure handling

- Web search returns garbage → still write empty JSON arrays with explanatory `note` fields, commit them, and email Rob explaining "search was thin today."
- Gmail send fails → still commit and push the news files. Add a note to `briefings/YYYY-MM-DD.md` saying email failed.
- A JSON file would be invalid → fail loudly. Do not commit malformed JSON. Email Rob the error.
- `git push` fails → email Rob the error. Do not force push.

## Cost discipline

You have a token budget. Aim for ≤ 25 web searches and ≤ 30 page fetches per run. If a section is producing nothing after 5 searches, stop searching that section and write the quiet-day note.
````

## Iteration

The prompt above is the v1. Expect to revise it after the first 1-2 weeks based on what shows up. Things you'll likely want to tune:

- Which sources keep producing garbage → add a "skip these domains" list
- Which subtopics never get matched → maybe the agent doesn't know what they are; add brief descriptions
- Tone drift → tighten the voice section with examples of good/bad summaries
- Volume per section — maybe data is too noisy, art too quiet; adjust per-section maximums

To revise: edit this file, then update the prompt in the schedule trigger UI to match. Keep this doc as the canonical source.

## Cost expectations

Rough estimate at current Claude API rates: $0.20–$0.60 per daily run. Monthly: $6–$18. Set a $25/month spend cap in Anthropic console as a backstop.

## Known limitations

- **First 1-2 weeks will be uneven** — the prompt is unproven, web search picks up SEO sludge, the agent doesn't yet know which sources you trust.
- **No human review before publish** — the site updates directly. If a bad item ships, it stays until the next run replaces it (or you `git revert`).
- **Email depends on Gmail MCP being enabled in the trigger's environment** — easy to forget after an environment change.
- **No archive page yet** — old `briefings/` markdowns aren't rendered as a public page. Add `/briefings/` Eleventy collection later if you want a public history.
