# Dark theme takeover completion

Recovered from GitHub: `0d710ce` (CSS media-query theme) atop catalogue `490d25d`. The +431/-549 report matches the old complete branch diff including catalogue work; it does not establish that the later integration was pushed. Commit `5a62906` and the asserted 16-edit script are absent from fetched history. Their exact changes cannot be recovered or claimed verified.

Rebuilt muted-text fixes in templates and dynamically generated playground content, the diary password placeholder, black text on the blue email button, and 55% white world breadcrumb separators. Existing permanent dark panels retain readable muted text in either OS mode. No stored preference or runtime theme class is needed.

## Verification

- `npm ci`, `npm run build`, `npm test` passed on Windows Node 24.18.0, Chrome; CI uses Node 22.
- Browser matrix: four routes × light/dark × JavaScript on/off; stale stored preference ignored; live media switches and catalogue filtering pass.
- Full shell audit: 121 generated HTML pages. Solid-color text pairs deduplicated per page by computed foreground/background, text size and pseudo-element. This avoids counting every repeated diary entry as a separate failure. Baseline 110 failing page/pair combinations; final 7, all pre-existing Big Data palette pairs recorded in `tests/known-contrast.json`. Tests fail if that exact list changes.
- The original 9/91 count is not reproducible without the lost harness and its scope. The new audit has broader page coverage and a stated methodology. It reproduces the diary button and placeholder defects and muted-date pattern.
- The audit excludes iframe-world internals and flags image/gradient backgrounds for manual review rather than inventing solid-background ratios. It does not establish WCAG conformance. External requests are blocked in browser tests.
- Black on blue-500 is 5.71:1; hover blue-400 is also passing. Separators retain the requested 55% white (about 5.12:1 against the purple bar).

Run `npm ci`, `npx playwright install chromium`, `npm run build`, `npm test`. An installed Chrome can be selected with `CHROME_PATH`; `PLAYWRIGHT_MODULE` is an optional local module override. `node scripts/contrast-audit.cjs report.json` writes the full audit without enforcement; `npm test` enforces the known baseline.

This PR targets `claude/beautiful-sagan-va9skh` (#11), not main. Catalogue publication decisions remain with #11. Builder verification only: Claude Desktop AAT and Rob's merge decision remain outstanding. No merge or deployment performed.
