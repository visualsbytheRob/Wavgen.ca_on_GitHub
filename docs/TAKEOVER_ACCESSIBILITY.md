# Accessibility takeover completion

Rebuilt from main `8537eb1`. No accessibility branch, `40692ce`, `affdbfc`, `df5e8c3`, or `layoutdiff.js` was available in fetched GitHub history. None of the reported in-session implementation was recovered. The reported skip-link bug and all 34 mouse-only Big Data controls were freshly reproduced. The lost worlds layer's visual neutrality cannot be verified; this PR replaces it with a newly tested implementation.

## Behavior

- Shell skip links move actual focus to their target, including after the existing smooth-scroll handler intercepts the click. Closed mobile navigation is inert; opening updates expanded state and moves focus into it; Tab stays inside; Escape restores focus. Icon controls have accessible names.
- The existing command palette now supports Ctrl/Cmd+K, named search, navigable page results, focus containment, Escape and focus restoration. The existing input appearance and placeholder are preserved; page search is implemented, while track/action search remains outside this takeover. Gallery triggers and close control accept Enter/Space, the dialog traps Tab, and its existing restore behavior is retained.
- Diary labels are associated with their inputs. No content or color changes.
- All 98 standalone worlds load a small shared layer. It adds keyboard activation to non-native inline click controls, a skip link and one main landmark. Four existing main landmarks retain their boundaries; the other worlds use a boxless main wrapper and skip to their first heading/hero target. A boxless landmark cannot receive focus, so its skip target is a real rendered element. No global visual reset or palette edits.
- Big Data's 34 non-native controls receive keyboard activation. Accordion and pipeline state is exposed to assistive technology; SVG controls use a dispatched click event because SVG elements do not uniformly support `.click()`. Section headings are real h2s; subordinate h4s become h3s with the same styles, including dynamically rendered headings. A boxless main surrounds the existing positioned wrapper and the papers, key terms and quiz sections, retaining the original layout boundary. Copy buttons have names and updated information boxes announce changes politely.

## Verification

Windows Node 24.18.0 / installed Chrome; CI is configured for Node 22. `npm ci`, full `npm run build`, `npm test` pass. The repository originally had no test script; the complete new suite is now `npm test`.

- Keyboard suite checks shell skip focus, mobile state/restore, palette search/trap/restore, gallery keyboard open/trap/restore, Big Data main coverage/outline, all 34 non-native control semantics, accordion Enter/Space, pipeline Space, SVG Enter and quiz keyboard activation. All 98 worlds have one main landmark, a working skip focus target, and keyboard support on non-native inline click controls. Continuous animation loops are paused for the world checks; this is not a test of every world simulation or audio engine.
- `layoutdiff.js` compares 103 routes (all 98 worlds plus five shell/content pages) at 390px and 1280px widths: **104,104 original elements, zero geometry/computed-style differences**. Geometry, typography, color, spacing, borders, opacity, transforms, shadows and pseudo styles are checked. The shared stylesheet changes only keyboard focus presentation; no resting visual changes were found.
- JavaScript is disabled for the layout comparison, external assets blocked, CSS/SVG animation time frozen. Equal-date diary entries have nondeterministic build order; only those tied groups are normalized before comparison. All original nodes remain. Added boxless wrappers/skip links are excluded from matching, as are script/style/link nodes. New landmark/heading IDs are normalized for matching. This is deterministic layout/style evidence, not a pixel or dynamic-canvas equivalence claim. Claude Desktop's visual AAT remains required.
- Big Data's existing low-contrast palette findings from the dark-theme audit remain deliberately untouched because visual changes require Rob's approval.

Run `npm ci`, `npx playwright install chromium`, `npm run build`, `npm test`. Set `CHROME_PATH` to use installed Chrome. The suite uses an existing `_site-baseline` initial build when available; otherwise it creates an ignored worktree of exact main `8537eb1` under `.cache/a11y-baseline`, installs locked dependencies and builds it. `node scripts/layoutdiff.js BASELINE_BUILD CURRENT_BUILD` supports explicit build paths. The baseline worktree can be removed later with `git worktree remove .cache/a11y-baseline`.

Evidence summary: `tests/layout-neutrality.json`. Builder verification only; Claude Desktop AAT tomorrow and Rob's acceptance/merge remain outstanding. No merge or deployment. This PR is independent of #11–16; overlapping shell edits may require conflict resolution when Rob chooses merge order.

## Approved merge-train integration

Compared against merged main `435d432` (#11, #12, #14, #15, #16): 103 routes, both widths, 104,386 original elements, zero differences. Full schema, theme, performance and accessibility suites passed. The catalogue and palette scripts are both copied; the diary password keeps its label and gray-400 placeholder. The baseline preparer now pins this integrated parent.
