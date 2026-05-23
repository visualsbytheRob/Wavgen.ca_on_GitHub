# Cloudflare Worker setup — enable one-tap workflow firing

Deploys `cloudflare-worker/wavgen-triggers.js` to Cloudflare's free Workers tier so the buttons on `/diary/` can fire GitHub Actions workflows in one tap instead of two. Activates the **💍 One button to rule them all** mode.

**Cost: $0.** Cloudflare Workers free tier gives 100,000 requests/day. You'll use ~100/year.

**Time: ~10 minutes**, one time.

## Step 1 — Create a Cloudflare account

If you don't have one: <https://dash.cloudflare.com/sign-up>. Just an email + password, no credit card needed.

## Step 2 — Create a fine-grained GitHub PAT (one more time, this is the last time)

This PAT stays in Cloudflare — never in your browser, never in code.

1. Open <https://github.com/settings/personal-access-tokens/new>
2. **Token name**: `Wavgen Cloudflare Worker`
3. **Expiration**: 1 year (renewable — set a calendar reminder)
4. **Repository access**: *Only select repositories* → `Wavgen.ca_on_GitHub`
5. **Repository permissions** → **Actions: Read and write** (the only one)
6. Generate, **copy immediately** (only shown once)

## Step 3 — Create the Worker

1. Cloudflare dashboard → left sidebar → **Workers & Pages**
2. **Create application** → **Create Worker**
3. **Name**: `wavgen-triggers` (or whatever you want — the resulting URL will be `wavgen-triggers.YOURNAME.workers.dev`)
4. Click **Deploy** (deploys a placeholder)
5. After deploy, click **Edit code** (top-right)
6. Delete all the placeholder code in the editor
7. Open `cloudflare-worker/wavgen-triggers.js` from this repo, copy ALL of its contents, paste into the Cloudflare editor
8. Click **Save and deploy** (top-right)

## Step 4 — Add the two secrets

Still in the Worker's page on Cloudflare:

1. **Settings** tab → **Variables and Secrets** section → **Add variable**
2. Add `GH_PAT`:
   - Type: **Secret** (the dropdown — important, not "Text")
   - Value: paste the PAT from Step 2
3. Add `TRIGGER_PASSWORD`:
   - Type: **Secret**
   - Value: `transmit` (or whatever you set as the password in `src/diary/index.njk`)
4. Click **Deploy** to apply

## Step 5 — Copy the Worker URL and paste it into the diary page

1. Back to the Worker's main page on Cloudflare — note the URL near the top (e.g. `https://wavgen-triggers.YOURNAME.workers.dev`)
2. In this repo, open `src/diary/index.njk`
3. Find the line:
   ```js
   var WORKER_URL = '';  // e.g. 'https://wavgen-triggers.YOURNAME.workers.dev/'
   ```
4. Paste your URL between the quotes (keep the trailing slash):
   ```js
   var WORKER_URL = 'https://wavgen-triggers.YOURNAME.workers.dev/';
   ```
5. Commit and push. Site rebuilds in ~1 minute.

## Step 6 — Test it

1. Visit https://wavgen.ca/diary/
2. Enter the password → unlock
3. Notice the hint text now says *"Buttons fire workflows directly via your Cloudflare Worker."*
4. The **💍 One button to rule them all** button is now visible at the bottom of the manual-triggers card
5. Tap any individual button → see `✅ Fired 1/1 workflow` within a second
6. Tap the rule-them-all button → see `✅ Fired 3/3 workflows`
7. Check the GitHub Actions tab — three runs in flight

## What you've got

- **One-tap firing** for any individual workflow
- **One-tap firing for ALL three** at once via the rule-them-all button
- Password is now **real security** (server-side checked) instead of UX flavor
- PAT lives only in Cloudflare Worker secrets — never in your browser, never in committed code
- If someone guesses the password, the Worker has a 500ms delay on wrong attempts to slow brute-force; even so, the only thing they can do is fire your workflows (= emails to you)

## Safety story

- Cloudflare Worker secrets are encrypted at rest, only injected into the Worker's runtime, never visible after creation
- The PAT scope is limited to one repo + Actions:write — no code access, no other repos, no secrets exposure
- Wrong-password requests get a 401 + 500ms penalty; the Worker doesn't expose any info on failures
- CORS is locked to `https://wavgen.ca` — other websites can't call your Worker
- The Worker only accepts pre-allow-listed workflow names (`news-briefing.yml`, `diary-prompt.yml`, `collect-diary-replies.yml`, `all`) — random workflow names get rejected

## If you ever want to disable

- **Pause the Worker**: Cloudflare dashboard → wavgen-triggers → Settings → bottom of page → "Delete"
- **Or just revert the URL**: set `WORKER_URL = ''` in `src/diary/index.njk` and push — buttons fall back to deep-link mode immediately

## Changing the password

- **In the Worker** (server-side check): Cloudflare dashboard → Worker → Settings → Variables → edit `TRIGGER_PASSWORD` → Deploy
- **In the page** (client-side label/UX): edit `PASSWORD` in `src/diary/index.njk`, commit, push

Both must match for the unlock + fire flow to work.
