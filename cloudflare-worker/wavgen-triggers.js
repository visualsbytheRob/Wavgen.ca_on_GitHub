// Cloudflare Worker: wavgen-triggers
//
// Fires GitHub Actions workflows on this repo on behalf of password-authenticated
// requests from wavgen.ca. The PAT lives only in the Worker's environment
// secrets — never in the browser, never in the public repo.
//
// Deploy via Cloudflare dashboard (see docs/cloudflare-worker-setup.md).
// Required secrets:
//   GH_PAT             - fine-grained PAT, Actions:write on this repo
//   TRIGGER_PASSWORD   - the magic word users enter on /diary/

const REPO = "visualsbytheRob/Wavgen.ca_on_GitHub";
const ALLOWED_WORKFLOWS = [
  "news-briefing.yml",
  "diary-prompt.yml",
  "collect-diary-replies.yml"
];
const CORS_ORIGIN = "https://wavgen.ca";

function corsHeaders() {
  return {
    "Access-Control-Allow-Origin": CORS_ORIGIN,
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Max-Age": "86400"
  };
}

function jsonResponse(status, body) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders(), "Content-Type": "application/json" }
  });
}

async function fireWorkflow(workflow, env) {
  const res = await fetch(
    `https://api.github.com/repos/${REPO}/actions/workflows/${workflow}/dispatches`,
    {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${env.GH_PAT}`,
        "Accept": "application/vnd.github+json",
        "X-GitHub-Api-Version": "2022-11-28",
        "User-Agent": "wavgen-triggers-worker",
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ ref: "main" })
    }
  );
  return {
    workflow,
    status: res.status,
    ok: res.status === 204,
    error: res.status === 204 ? null : (await res.text()).slice(0, 200)
  };
}

export default {
  async fetch(request, env) {
    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: corsHeaders() });
    }
    if (request.method !== "POST") {
      return jsonResponse(405, { error: "POST only" });
    }

    let body;
    try {
      body = await request.json();
    } catch {
      return jsonResponse(400, { error: "invalid JSON" });
    }

    const { password, workflow } = body || {};
    if (!password || password !== env.TRIGGER_PASSWORD) {
      // Brief delay to slow down dumb brute-force attempts
      await new Promise(r => setTimeout(r, 500));
      return jsonResponse(401, { error: "wrong password" });
    }

    // "all" fires every allowed workflow
    if (workflow === "all") {
      const results = await Promise.all(ALLOWED_WORKFLOWS.map(w => fireWorkflow(w, env)));
      return jsonResponse(200, { results });
    }

    if (!ALLOWED_WORKFLOWS.includes(workflow)) {
      return jsonResponse(400, { error: "unknown workflow", allowed: ALLOWED_WORKFLOWS });
    }

    const result = await fireWorkflow(workflow, env);
    return jsonResponse(result.ok ? 200 : 502, { results: [result] });
  }
};
