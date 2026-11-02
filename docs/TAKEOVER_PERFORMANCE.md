# Performance takeover completion

No `claude/inspiring-mayer-1g1cxf` branch or performance commits were present in the fresh GitHub inventory. Rebuilt from main `8537eb1`; no in-session work was recovered. Measurements were captured from the untouched production build before edits.

Precise passthrough paths omit 43 unused files totaling 295,627 bytes: 17 .gitkeep files, 3 raw READMEs, 3 stale/inlined CSS files, 11 unused scripts, and 9 GSAP plugins. Source files remain intact. Flip/TextPlugin load only on `/data/webdev/`. The duplicate playground include is removed; Chrome reproduced `Identifier 'CodePlayground' has already been declared` before and no page errors afterward.

| Measure | Before | After |
|---|---:|---:|
| Deployment files | 295 | 252 |
| Deployment bytes | 16,421,494 | 16,106,279 |
| Deployment gzip bytes | 5,375,657 | 5,272,982 |
| Home HTML + local CSS/JS bytes | 484,362 | 448,623 |
| Home same gzip bytes | 130,616 | 117,416 |
| Data HTML + local CSS/JS bytes | 435,051 | 399,312 |
| Webdev HTML + local CSS/JS bytes | 433,217 | 433,179 |
| Big Data HTML + local CSS/JS bytes | 333,115 | 333,115 |

Method: filesystem raw bytes and gzip level 9, page subtotal includes distinct directly linked local CSS/JS plus HTML. These are not network timings or Core Web Vitals. Images, fonts and runtime requests are outside the page subtotal. All local files count toward deployment totals. Total reduction is 315,215 raw bytes; beyond omitted assets, smaller script includes repeat across shell pages. The existing randomized image ordering can vary compressed HTML sizes slightly. Detailed manifest and methodology: `tests/performance-measurements.json`; reproducible harness: `npm run measure` on a clean build.

## Existing publication finding — left for Rob

Eleventy renders developer READMEs as public unstyled HTML at `/images/README/`, `/js/systems/README/`, and `/js/systems/animation/README/`. They remain in the output and are explicitly tested. Omitting raw README passthrough copies does not suppress template rendering. No route was silently deleted.

## Verification

`npm ci`, `npm run build`, and `npm test` passed on Windows Node 24.18.0 / Chrome. Four page smoke tests verify no uncaught JS errors or local 404s, plugin availability on webdev only, and a single loaded playground class. Static scan checks all 820 local CSS/JS references in 218 HTML files. All three rendered README routes remain. The baseline had 1,051 references. External requests are blocked, so Monaco CDN loading and editor functionality are not claimed tested.

Run `npm ci`, `npx playwright install chromium`, `npm run build`, `npm test`. Set `CHROME_PATH` to use installed Chrome. The repository previously had no test script; the complete added suite is now `npm test`. CI's configured runtime is Node 22; local verification is not a CI-runtime claim.

Claude Desktop AAT and Rob's acceptance/merge remain outstanding. No merges or deployments.
