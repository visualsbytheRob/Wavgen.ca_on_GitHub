# Slack ↔ Claude integration

How Slack is wired to this repo, and how to operate it.

## Channels

| Channel | Purpose |
|---|---|
| `#agents` | High-signal: task started/done, PR opened, deploy outcome summary |
| `#agent-logs` | Firehose: per-step output, raw CI logs, noisy stuff |

## GitHub Actions secrets

Set these at https://github.com/visualsbytherob/wavgen.ca_on_github/settings/secrets/actions

| Secret | What it is | Source |
|---|---|---|
| `SLACK_WEBHOOK_AGENTS` | Incoming-webhook URL posting to `#agents` | Slack app "Wavgen Agents" → Incoming Webhooks |
| `SLACK_WEBHOOK_AGENT_LOGS` | Incoming-webhook URL posting to `#agent-logs` | same app, second webhook |
| `ANTHROPIC_API_KEY` | Claude API key (billing for triggered runs) | console.anthropic.com |

## How Slack triggers Claude

1. You invoke a Slack Workflow Builder shortcut in `#agents` with a task prompt.
2. The workflow POSTs to `https://api.github.com/repos/visualsbytherob/wavgen.ca_on_github/dispatches` with:
   ```json
   { "event_type": "claude-task", "client_payload": { "prompt": "<your prompt>", "user": "<slack user>" } }
   ```
   Auth: `Authorization: Bearer <GitHub fine-grained PAT>` stored as a Slack workflow variable.
3. GitHub fires `.github/workflows/claude-from-slack.yml`.
4. Workflow posts "task started" to `#agents`, runs `anthropics/claude-code-action`, posts result.

You can also dry-run via the Actions tab → "Claude from Slack" → "Run workflow" with a prompt.

## How GitHub events reach Slack

Slack's official GitHub app, subscribed in `#agents` via `/github subscribe visualsbytherob/wavgen.ca_on_github`.

## How deploys reach Slack

`.github/workflows/deploy.yml` posts the deploy result (success/failure + commit SHA + site URL) to `#agent-logs` via `SLACK_WEBHOOK_AGENT_LOGS`. No-op if the secret is unset.

## Known issues

- `deploy.yml` and `eleventy-deploy.yml` both fire on push to main and both deploy to GitHub Pages. They race. Dedupe in a follow-up.
