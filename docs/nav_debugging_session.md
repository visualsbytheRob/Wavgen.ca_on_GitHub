# ✅ Wavgen Website — Debugging Summary & Tooling Guide

## 🧠 Key Takeaways

### 🛠 1. Tailwind and JavaScript Were Working — the Problem Was CSS Purging

* The burger menu *was* functional.
* Tailwind's Just-In-Time (JIT) compiler purged important classes like `translate-x-0`, which weren’t directly referenced in HTML/Nunjucks.
* This caused the mobile nav drawer and overlay to remain invisible despite JS functioning correctly.

### 🔐 2. Safelist Is Essential for Dynamic Classes

* Classes applied dynamically via JavaScript (e.g. `-translate-x-full`, `translate-x-0`, `z-[9999]`, etc.) **must be safelisted** in `tailwind.config.js`.
* Without this, Tailwind will purge them during production builds.

### 🧱 3. Tailwind Requires Accurate `content` Paths

* You must tell Tailwind where to look for class names. This includes:

  * `*.html`, `*.njk`, and `*.js` files inside `src/`, `includes/`, or `public/`
* Incorrect `content` paths result in a nearly empty compiled stylesheet.

### 📦 4. Tailwind Must Be Compiled During Deployment

* Your `npm run build` must include Tailwind compilation before Eleventy builds the site.
* GitHub Actions should reflect this by running Tailwind (either manually or via a combined script).
* If you forget this step, your production site will be unstyled.

### 🪝 5. Passthrough Copy is Required for Output CSS

* If Tailwind compiles into `src/css/style.css`, it must be copied to `_site/css/style.css` using:

  ```js
  eleventyConfig.addPassthroughCopy("src/css");
  ```
* Without this, your compiled CSS won’t show up on the live site.

---

## 📋 Tooling Stack Overview

| Tool                     | Purpose                               |
| ------------------------ | ------------------------------------- |
| **Eleventy**             | Static site generator                 |
| **Tailwind CSS**         | Utility-first styling                 |
| **JavaScript (Vanilla)** | Mobile nav & interactivity            |
| **GitHub Actions**       | Continuous deployment to GitHub Pages |
| **Nunjucks**             | Templating language (`*.njk`)         |

---

## 🚨 Gotchas to Watch For

| Issue                                  | Prevention                                                                                  |
| -------------------------------------- | ------------------------------------------------------------------------------------------- |
| Missing Tailwind classes in production | Use `safelist` + correct `content` paths                                                    |
| Styling disappears after rebuild       | Check `tailwind.config.js` + rebuild CSS                                                    |
| Nav drawer not showing                 | Confirm `translate-x-0` and `z-[10000]` are compiled                                        |
| `npm run serve` doesn’t compile CSS    | Use `concurrently` to run Eleventy + Tailwind                                               |
| CSS not deployed to GitHub Pages       | Ensure `build` script includes Tailwind build step                                          |
| Broken layout or flicker               | Check for missing `transform` or `transition` class                                         |
| Wrong file paths                       | Match CSS location in HTML (`/css/style.css`) with `eleventyConfig.addPassthroughCopy(...)` |
| Fonts not loading                      | Google Fonts must be imported in `input.css`, not `style.css`                               |
| Tailwind update changes behavior       | Re-audit `tailwind.config.js` after version bumps                                           |

---

## 🧠 Things You're Likely to Forget (but shouldn't)

* Tailwind doesn't include a class **unless** it literally sees it in your files or in `safelist`
* Running `npm run build` locally is **not** the same as your GitHub Actions environment
* `translate-x-0` and similar are used in **JavaScript**, not markup — always safelist them
* Rebuilding CSS should be part of your `npm run build`, not a separate manual step
* Passthrough copy in `.eleventy.js` is mandatory for non-template assets like CSS or images
* Always confirm the output path (`_site/css/`) is correct, especially when working across environments

---

## 🧰 Suggested Internal Docs Structure

In your repo, create:

```
docs/
├── setup.md
├── deploy.md
├── nav-debugging.md
└── gotchas.md
```

**Examples:**

### `docs/setup.md`

* Node & Tailwind installation
* Folder structure
* Running dev server: `npm run dev` or `npm run serve`
* Building CSS: `npm run build-css`

### `docs/deploy.md`

* GitHub Actions overview
* Tailwind + Eleventy build process
* `_site/` structure

### `docs/gotchas.md`

* Known issues & resolutions (like this nav drawer bug)
* CSS purge behavior
* JS + Tailwind dynamic class use

---

Let me know if you’d like me to scaffold these `.md` docs for you automatically — I can generate real files based on this summary and give you the full structure to drop into your repo.
