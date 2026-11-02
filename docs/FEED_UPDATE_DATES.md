# Atom update dates

Rob approved publication of all 20 diary entries, including the seven August 2025 test entries, for the November 2, 2026 merge train. No entries were removed or edited by this fix.

`published` and the filename-based Atom ID remain unchanged. Each entry's `updated` is the latest of its publication date, optional explicit `updated` frontmatter, and latest Git commit date for that file. Uncommitted local edits use file mtime as well, so editing a body updates local preview feeds automatically. Clean builds ignore checkout mtime. The feed-level timestamp is the maximum entry modification date, so rebuilding unchanged content does not manufacture updates.

The Pages checkout fetches full Git history. A shallow checkout fails with a clear message instead of attributing every entry to the latest unrelated commit. Git and full history are required to build the feed accurately.

Tests cover clean-checkout stability, local edits, committed edits, invalid explicit dates, and a real Eleventy source-edit/rebuild cycle. The latter preserves entry ID and publication date, advances both update timestamps, proves an unchanged rebuild is stable, then removes its synthetic fixture and confirms the original 20-entry feed is restored. Ten malformed XML/Atom variants remain rejected.
