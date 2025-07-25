<!--
DEV_DEPLOY_FLOW.md
This document is a developer reference for setting up local development and deployment for the Wavgen.ca Eleventy site.
- Explains how to run Eleventy and Tailwind together
- Shows recommended workflows and npm scripts
- Each section is commented for teaching clarity
-->

## 🚧 LOCAL DEVELOPMENT FLOW

<!--
Step 1: How to start the local dev server and Tailwind watcher for live CSS updates
-->
### 1. **Start Dev Server with Tailwind Watcher**

You need to run both the Eleventy server **and** the Tailwind compiler.

There are two main ways to do this:

<!--
Option A: Manual setup using two terminals for Tailwind and Eleventy
-->
#### ✅ Option A (Manual, Two-Terminal Setup):

```bash
# Terminal 1
npm run build-css     # Tailwind watch mode

# Terminal 2
npm run serve         # Eleventy dev server
```

<!--
Option B: Recommended setup using npm concurrently to run both commands in one terminal
-->
#### ✅ Option B (Recommended: One Command with `concurrently`)

Install `concurrently` once:

```bash
npm install --save-dev concurrently
```

Then update your `package.json`:

```json
"scripts": {
  ...
  "dev": "concurrently \"npm run build-css\" \"eleventy --serve\""
}
```

Now you can run:

```bash
npm run dev
```

---

### 2. **Edit Files**

* Write content in `.njk`, `.html`, `.md`, or `.js` files in `src/`, `_includes/`, etc.
* Use Tailwind utility classes directly or inside `@layer components` in `src/input.css`.

---

### 3. **Rebuild for Production (Optional Check)**

To test a production-style build locally:

```bash
npm run build
```

This runs:

```bash
"build": "npm run build-css && eleventy"
```

---

## 🚀 DEPLOYMENT FLOW

### 1. **Git Workflow**

```bash
# Stage your changes
git add .

# Commit with a message
git commit -m "Update styles and layout for nav"

# Push to GitHub (usually main or master branch)
git push origin main
```

### 2. **GitHub Actions Deploy Flow**

After the push:

1. **GitHub Actions Workflow triggers** (based on `on: push` in `.github/workflows/deploy.yml`)
2. Steps that run:

   * Checkout repo
   * Setup Node and cache
   * `npm ci` installs exact dependencies
   * Tailwind compiles CSS (`build-css`)
   * Eleventy builds static site into `_site/`
   * Files are uploaded as an artifact
   * GitHub Pages deploys `_site` live

### 3. **View Live Site**

After a few moments, your site will be available at:

```
https://<username>.github.io/<repo-name>/
```

Or if you're using a custom domain, the one you configured.

---

## 📂 FILES TO REMEMBER

| File                           | Purpose                                                                |
| ------------------------------ | ---------------------------------------------------------------------- |
| `tailwind.config.js`           | Configures purging, colors, fonts, safelist                            |
| `input.css`                    | Tailwind base file (with `@tailwind` directives and custom components) |
| `.eleventy.js`                 | Eleventy config – controls passthroughs, directories, plugins          |
| `.github/workflows/deploy.yml` | GitHub Actions script for automatic deployment                         |
| `_site/`                       | Eleventy’s output folder — auto-deployed to GitHub Pages               |

---

## 🧠 Summary Cheatsheet

```bash
# 1. Local dev with Tailwind + Eleventy
npm run dev

# 2. Stage + commit changes
git add .
git commit -m "Describe your changes"

# 3. Push to deploy
git push origin main

# 4. Wait for GitHub Actions to deploy
# ✅ Live site auto-updates
```
