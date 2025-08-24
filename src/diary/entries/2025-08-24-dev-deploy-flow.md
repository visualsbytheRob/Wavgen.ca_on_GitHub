---
title: Dev + Deploy flow (convenient reference)
date: 2025-08-24
---

- Local dev options:
  - Two terminals: `npm run build-css` and `npm run serve`.
  - Or one command (recommended): `npm run dev` using `concurrently`.
- Production build check: `npm run build` runs Tailwind then Eleventy.
- Deploy via Git:
  - `git add .`, `git commit -m "…"`, `git push origin main`.
  - GitHub Actions builds: Node setup → npm ci → build-css → eleventy → deploy `_site/`.
- Quick cheatsheet:
  - `npm run dev` → edit → commit → push → wait for Pages.
