/**
 * BUILD-TIME DATA
 *
 * Values derived from when the site is built, rather than hardcoded.
 * Exposed to every template as the global `build` object.
 *
 * Why this exists: the footer copyright year used to be typed by hand, so it
 * silently went stale every January. Deriving it at build time means each
 * deploy publishes the correct year with no edit required.
 */

module.exports = {
  // Four-digit year at build time, e.g. 2026. Used by src/_includes/footer.njk.
  currentYear: new Date().getFullYear()
};
