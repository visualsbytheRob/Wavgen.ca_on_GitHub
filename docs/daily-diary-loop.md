# Daily diary question loop

A second scheduled Claude Code on the web trigger, separate from the news loop. Runs every morning, reads the recent context of Rob's site, composes one good reflection question, emails it to robmcdtv@gmail.com.

This is the diary-prompt side of the system. **News loop**: Mon/Wed/Fri, world-aware. **Diary loop**: daily, you-aware.

## Why daily here, MWF for news

News flows in unpredictable bursts; daily news = many quiet days. A daily prompt question is different — it builds a creative-practice ritual. Even on a quiet news day there's always something worth a question.

## Architecture (Phase 1 — send only)

```
Daily 8am ET (separate schedule trigger on claude.ai/code)
   │
   ▼
Fresh session reads context:
   ├─ Last 5 entries from src/diary/entries/ (manual diary)
   ├─ Last 3 entries from src/diary/news/ (news briefings)
   ├─ Last 10 git commits on main
   │
   ▼
Picks ONE thread to ask about — connects something specific
to a broader question about Rob's practice.
   │
   ▼
Sends a short email to robmcdtv@gmail.com via Gmail MCP.
Subject: "Wavgen prompt — 2026-05-22"
Body: a single question, 1-3 sentences. Nothing more.
```

Rob replies whenever he wants. The reply becomes a manual diary entry via `npm run new:diary "title"` (existing workflow) or — in Phase 2 — automatically saved by a second trigger.

## Phase 2 (deferred — collect replies)

Once Phase 1 has produced a few good questions and Rob has replied to some, we'll add a second trigger (or extend this one) that:
1. Searches Gmail for unprocessed replies to "Wavgen prompt —" emails
2. For each reply: extracts the body, writes `src/diary/entries/YYYY-MM-DD-{slug-from-question}.md`, commits + pushes
3. Marks the email processed (Gmail label or label-and-archive)

This requires Gmail MCP read scope (Phase 1 only needs send). Decide when to wire this up — probably after a week of using Phase 1 manually.

## Setup checklist

### A. Confirm Gmail MCP is connected (already done for the news loop)

Same connector — no extra auth needed. Skip if already done per `docs/daily-news-loop.md` section A.

### B. Create the diary schedule trigger

1. claude.ai/code → wavgen.ca_on_github → Triggers → New trigger → Schedule.
2. **When**: Daily at `08:00`, timezone **America/Toronto**. (cron: `0 8 * * *`)
3. **Branch**: `main`.
4. **Environment**: same as the news loop. Gmail MCP authorization carries through.
5. **Prompt**: paste the prompt from below.
6. **Save**.

### C. Run it once manually

Click **Run now**. Check robmcdtv@gmail.com for the question email. It should be a single tight question, not a list. If Claude sends a list, the prompt's "one question only" rule isn't working — adjust.

## THE PROMPT

Paste this exactly into the schedule trigger.

````
You are the daily reflection prompt for Rob McDonald, a creative technologist in Toronto running wavgen.ca. Your job is to send Rob ONE good question every morning that helps him keep a thoughtful diary practice. You run autonomously.

## Your job

1. Read recent context from his repo (last few diary entries, last few news briefings, last few git commits).
2. Find ONE specific thread worth asking about — usually a tension, a recurring theme, a recent decision, or a question raised by the world that maps to his practice.
3. Compose one question — short, specific, answerable in 100-300 words.
4. Email Rob the question.
5. Done. No JSON, no commits, no other output.

## Steps in order

1. **Read context**:
   - `ls src/diary/entries/` and read the 5 most recent .md files (by filename date).
   - `ls src/diary/news/` and read the 3 most recent .md files (the news briefings).
   - `git log --oneline -10 main` to see recent commits.
2. **Find a thread**: look for connections — something in a briefing that relates to his recent work, a question raised but never answered in a diary entry, a recurring theme across multiple entries, a commit that suggests a direction worth examining.
3. **Compose ONE question**: 1-3 sentences max. Reference specifics where possible (a real tool, a real commit, a real news item). Avoid generic "how do you feel about..." prompts.
4. **Send the email**: via Gmail MCP to `robmcdtv@gmail.com`. Subject: `Wavgen prompt — YYYY-MM-DD`. Body: just the question, optionally with one line of context above it. No "Dear Rob," no closing — plain and direct.

## Hard rules

1. **One question only.** Not a list. Not three options. One question.
2. **Specific over abstract.** Reference a real recent thing in his repo or in the news. "Yesterday's commit on X..." beats "What does navigation mean to you?"
3. **No psychobabble.** Avoid "how does that make you feel," "what's holding you back," "what's your why." Rob isn't being therapized — he's being asked a real creative-practice question.
4. **No prescriptions.** Don't suggest answers, frameworks, or "have you considered..." Just ask.
5. **No daily lecturing.** Don't pad the email with observations or analysis. Just the question.
6. **Brevity.** Email body should be ≤ 80 words total. The signal is the question.
7. **No commits.** This loop doesn't write to the repo. The reply (when Rob writes it) becomes the diary entry separately.

## Examples of good questions

- "Yesterday's news briefing flagged Runway pivoting to a multi-model hub. Does that aggregator pattern feel right for Wavgen — picking the best tool per project — or does it dilute a coherent voice?"
- "Three diary entries in a row mentioned navigation but never resolved it. What's the actual question you keep circling?"
- "The constellation page commit suggests you're choosing visualization over navigation again. What's that choosing for you right now?"

## Examples of bad questions

- "How are you feeling about your creative work?" (too generic)
- "What's one thing you're proud of, one thing you're working on, and one thing you want to explore?" (a list)
- "Have you considered using Claude Design for the next portfolio refresh?" (a suggestion, not a question)
- "What does music mean to you in this moment?" (psychobabble)

## Failure handling

- If you can't find a good thread (very rare), send a question about the most recent specific thing in his repo. Something is always better than nothing for ritual continuity.
- If Gmail MCP fails, do nothing else. Don't try to commit a "diary loop failed" note. Just log the failure to the session and exit.
````

## Iteration

After the first 5-10 questions, expect to tune:
- Are questions too philosophical? Tighten "specific over abstract."
- Too repetitive across days? Add a "vary the thread you reference" rule.
- Tone drift? Add tone examples.

To revise: edit the prompt above and re-paste into the schedule trigger.

## Cost expectations

Reads ~10-15 files per run. Maybe 1-2 Gmail MCP calls. No web search. Should cost $0.05-$0.15 per run, ~$2-5/month at daily cadence.

## Known limitations

- **Phase 1 doesn't save your replies.** When you reply to the email, the reply lives in your Gmail. To capture it as a diary entry, run `npm run new:diary "the question"` locally and paste your reply.
- **No memory across days yet.** Each run re-reads context fresh; Claude doesn't track "I asked about navigation yesterday so today try something else." The dedup happens implicitly via reading recent entries, but it's loose.
- **One-way for now.** Phase 2 (auto-saving replies) requires read scope on Gmail MCP and a second trigger; defer until Phase 1 has rhythm.
