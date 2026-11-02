/*
 * src/_utils/apps.js
 * The public/private rule for the app catalogue (src/_data/apps.json), in one
 * place. Everything public that is rendered from the catalogue goes through
 * these two functions:
 *   - the showcase cards on /data/ (the `publicApps` filter in .eleventy.js)
 *   - the schema.org ItemList JSON-LD (src/_utils/structured-data.js)
 * so a card and its structured-data entry can never disagree about a link.
 */

// An app is public only when its visibility is exactly "public". Anything else
// (missing, "private", a typo such as "Public") counts as private: fail closed.
function isPublicApp(app) {
  return Boolean(app) && app.visibility === "public";
}

// Project an entry down to what a PUBLIC page may show. A private app's
// launchUrl (e.g. a tailnet host) is dropped here so it never reaches public
// HTML; only the unlinked private launchpad reads launchUrl for every app.
// publicUrl is the one link a public page may carry: the launch URL of a
// public app, else its demo URL (demos use demo data only).
function toPublicApp(app) {
  return {
    id: app.id,
    name: app.name,
    description: app.description || "",
    category: app.category || "",
    tech: Array.isArray(app.tech) ? app.tech : [],
    access: app.access || "",
    publicUrl: (isPublicApp(app) && app.launchUrl) ? app.launchUrl : (app.demoUrl || "")
  };
}

module.exports = { isPublicApp, toPublicApp };
