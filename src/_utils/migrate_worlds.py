#!/usr/bin/env python3
"""
WAVGEN World Migration Script
==============================
Converts standalone HTML world files from C:\\Claude into Eleventy Nunjucks pages
at src/<domain>/<slug>/index.njk, using the world.njk layout.

Usage:
    python src/_utils/migrate_worlds.py [--domain DATA] [--dry-run]

Options:
    --domain    One of: Data Music Art Video AV all  (default: all)
    --dry-run   Preview what would be written without touching the filesystem
    --force     Overwrite already-migrated pages (default: skip existing)

Examples:
    python src/_utils/migrate_worlds.py --domain Data --dry-run
    python src/_utils/migrate_worlds.py --domain Data
    python src/_utils/migrate_worlds.py --domain Music --force
    python src/_utils/migrate_worlds.py

Requirements:
    pip install beautifulsoup4
"""

import os
import re
import sys
import argparse
from pathlib import Path

try:
    from bs4 import BeautifulSoup, Comment
except ImportError:
    sys.exit("Missing dependency: run  pip install beautifulsoup4")

# Domain configuration
DOMAIN_MAP = {
    "Data":  {"site_folder": "data",  "nav_section": "data",  "color": "#06B6D4"},
    "Music": {"site_folder": "music", "nav_section": "music", "color": "#1DB954"},
    "Art":   {"site_folder": "art",   "nav_section": "art",   "color": "#FF6B35"},
    "Video": {"site_folder": "video", "nav_section": "video", "color": "#3B82F6"},
    "AV":    {"site_folder": "av",    "nav_section": "av",    "color": "#7C3AED"},
}

SOURCE_ROOT = Path(os.environ.get("WAVGEN_SOURCE_ROOT", r"C:\Claude"))
SITE_ROOT   = Path(os.environ.get("WAVGEN_SITE_ROOT",   r"C:\Users\robmc\Documents\Wavgen\Wavgen.ca_on_GitHub\src"))

SITE_NAV_SIGNALS = ["WAVGEN", "The Waveform Generation", "wavgen.ca"]


def extract_world_meta(soup):
    title = ""
    title_tag = soup.find("title")
    if title_tag:
        raw = title_tag.get_text(strip=True)
        title = re.sub(r"\s*[---]\s*(WAVGEN|The Waveform Generation).*$", "", raw, flags=re.I).strip()

    description = ""
    desc_tag = soup.find("meta", attrs={"name": "description"})
    if desc_tag:
        description = desc_tag.get("content", "").strip()

    domain = ""
    body = soup.find("body")
    if body:
        for cls in body.get("class", []):
            if cls.lower().startswith("domain-"):
                domain = cls.replace("domain-", "").lower()
                break

    if not domain:
        dmeta = soup.find("meta", attrs={"name": re.compile(r"wavgen:?domain", re.I)})
        if dmeta:
            domain = dmeta.get("content", "").strip().lower()

    return title, description, domain


def _looks_like_site_nav(nav_tag):
    text = nav_tag.get_text()
    domain_hits = sum(1 for d in ["Music", "Art", "Video", "Data", "AV"] if d in text)
    brand_hit   = any(s in text for s in SITE_NAV_SIGNALS)
    return brand_hit and domain_hits >= 2


def strip_outer_shell(soup):
    body = soup.find("body")
    if not body:
        return str(soup)

    for nav in body.find_all("nav"):
        if _looks_like_site_nav(nav):
            nav.decompose()
            break

    for el in body.find_all(class_=re.compile(r"\bwg-nav\b")):
        el.decompose()

    for comment in body.find_all(string=lambda t: isinstance(t, Comment)):
        if any(sig in comment for sig in ["<!DOCTYPE", "wavgen-core"]):
            comment.extract()

    return body.decode_contents()


def _make_frontmatter(title, description, domain, permalink):
    title_safe = title.replace('"', "'")
    desc_safe  = description.replace('"', "'")
    return (
        "---\n"
        "layout: world.njk\n"
        f'title: "{title_safe}"\n'
        f'description: "{desc_safe}"\n'
        f"domain: {domain}\n"
        f"permalink: {permalink}\n"
        "---\n\n"
    )


def create_njk_page(title, description, domain, body_content, output_path, dry_run=False):
    rel   = output_path.parent.relative_to(SITE_ROOT)
    perm  = "/" + rel.as_posix() + "/"
    text  = _make_frontmatter(title, description, domain, perm) + body_content

    if dry_run:
        print(f"  [DRY-RUN] -> {output_path}")
        print(f"             title: {title!r}  domain: {domain!r}  permalink: {perm}")
        return

    output_path.parent.mkdir(parents=True, exist_ok=True)
    output_path.write_text(text, encoding="utf-8")
    print(f"  OK  {output_path}")


def migrate_domain(domain_name, dry_run=False, force=False):
    if domain_name not in DOMAIN_MAP:
        print(f"[ERROR] Unknown domain: {domain_name!r}. Choose from: {', '.join(DOMAIN_MAP)}")
        return 0

    config     = DOMAIN_MAP[domain_name]
    source_dir = SOURCE_ROOT / domain_name
    site_dir   = SITE_ROOT  / config["site_folder"]

    if not source_dir.is_dir():
        print(f"[WARN]  Source directory not found: {source_dir}  (skipping {domain_name})")
        return 0

    html_files = sorted(source_dir.glob("*.html"))
    if not html_files:
        print(f"[WARN]  No .html files found in {source_dir}")
        return 0

    print(f"\n{'='*60}")
    print(f"Domain: {domain_name}  ({len(html_files)} files)")
    print(f"Source: {source_dir}")
    print(f"Target: {site_dir}")
    print(f"{'='*60}")

    migrated = 0
    skipped  = 0
    errors   = 0

    for html_file in html_files:
        # Skip domain index pages
        if html_file.name == "index.html":
            print(f"  [SKIP]   index.html  (domain index, not a world)")
            skipped += 1
            continue

        # Build slug: underscores to hyphens, strip -world/-environment/-dimension
        slug = html_file.stem.lower().replace("_", "-")
        slug = re.sub(r'-world$', '', slug)
        slug = re.sub(r'-environment$', '', slug)
        slug = re.sub(r'-dimension$', '', slug)

        output_dir  = site_dir / slug
        output_path = output_dir / "index.njk"

        if output_path.exists() and not force:
            print(f"  [SKIP]   {slug}  (already exists -- use --force to overwrite)")
            skipped += 1
            continue

        try:
            raw  = html_file.read_text(encoding="utf-8", errors="replace")
            soup = BeautifulSoup(raw, "html.parser")

            title, description, domain_val = extract_world_meta(soup)

            if not title:
                title = slug.replace("-", " ").title()
            if not domain_val:
                domain_val = config["nav_section"]

            body_content = strip_outer_shell(soup)

            create_njk_page(
                title=title,
                description=description,
                domain=domain_val,
                body_content=body_content,
                output_path=output_path,
                dry_run=dry_run,
            )
            migrated += 1

        except Exception as exc:
            print(f"  [ERROR]  {html_file.name}: {exc}")
            errors += 1

    status = "DRY-RUN -- " if dry_run else ""
    print(f"\n{status}{domain_name}: {migrated} migrated, {skipped} skipped, {errors} errors")
    return migrated


def main():
    parser = argparse.ArgumentParser(
        description="Migrate WAVGEN standalone world HTML files into Eleventy .njk pages.",
    )
    parser.add_argument(
        "--domain",
        choices=list(DOMAIN_MAP.keys()) + ["all"],
        default="all",
        help="Which domain to migrate (default: all)",
    )
    parser.add_argument(
        "--dry-run",
        action="store_true",
        help="Preview without writing files",
    )
    parser.add_argument(
        "--force",
        action="store_true",
        help="Overwrite already-migrated pages",
    )
    parser.add_argument(
        "--source-root",
        default=None,
        help="Override SOURCE_ROOT",
    )
    parser.add_argument(
        "--site-root",
        default=None,
        help="Override SITE_ROOT (path to the Eleventy src/ folder)",
    )
    args = parser.parse_args()

    global SOURCE_ROOT, SITE_ROOT
    if args.source_root:
        SOURCE_ROOT = Path(args.source_root)
    if args.site_root:
        SITE_ROOT = Path(args.site_root)

    domains = list(DOMAIN_MAP.keys()) if args.domain == "all" else [args.domain]

    total = 0
    for d in domains:
        total += migrate_domain(d, dry_run=args.dry_run, force=args.force)

    print(f"\n{'--'*30}")
    print(f"Total migrated: {total} worlds")
    if args.dry_run:
        print("(dry-run -- no files were written)")


if __name__ == "__main__":
    main()
