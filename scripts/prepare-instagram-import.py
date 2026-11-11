"""Prepare manifest-led Instagram web copies locally. Never uploads or alters originals."""
import argparse, collections, hashlib, io, json, re, zipfile
from pathlib import Path
from urllib.parse import urlparse
from PIL import Image, ImageOps

ROOT = Path(__file__).resolve().parents[1]
def digest(data):
    return hashlib.sha256(data).hexdigest()
def pixels(im):
    im = ImageOps.exif_transpose(im).convert('RGB')
    return digest(str(im.size).encode() + im.tobytes())
def write_json(path, value):
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(value, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('staging', type=Path)
    parser.add_argument('--apply', action='store_true', help='Update local site data; never deploy')
    args = parser.parse_args()
    stage = args.staging.resolve()
    source = json.loads((stage / 'manifest.json').read_text(encoding='utf-8'))
    media = json.loads((ROOT / 'config/media-manifest.json').read_text(encoding='utf-8'))
    approved = json.loads((ROOT / 'src/_data/approvedImages.json').read_text(encoding='utf-8'))
    # Repeatable preparation retains all pre-import decisions and regenerates only this import.
    for key in approved:
        approved[key] = [i for i in approved[key] if i.get('source') != 'instagram-import']
    media['entries'] = [e for e in media['entries'] if not e['path'].startswith('/images/instagram/')]
    old_urls = {i['url'] for pool in approved.values() for i in pool}
    old_hashes = {e['sha256']: e for e in media['entries'] if e['path'] in old_urls}
    old_pixels = {}
    for e in old_hashes.values():
        local = ROOT / e['source']
        if local.is_file():
            with Image.open(local) as im:
                old_pixels[pixels(im)] = e
    seen_bytes, seen_pixels, seen_objects = {}, {}, {}
    collisions, rows, additions = [], [], []
    with zipfile.ZipFile(stage / 'instagram-lead-images.zip') as archive:
        names = [i.filename for i in archive.infolist() if not i.is_dir()]
        assert len(names) == len(set(names)), 'Duplicate ZIP paths'
        assert set(names) == {r['file'] for r in source}, 'Manifest/ZIP mismatch'
        assert len(source) == len({r['post_id'] for r in source}), 'Duplicate post IDs'
        for row in source:
            assert Path(row['file']).name == row['file'], 'Unsafe archive filename'
            assert row['media_type'] in ('image', 'carousel', 'video')
            link = urlparse(row['ig_url'])
            assert link.scheme == 'https' and link.netloc == 'www.instagram.com'
            assert link.path.startswith(('/p/', '/reel/', '/tv/', '/stories/'))
            data = archive.read(row['file'])
            assert len(data) == row['bytes'] and row['downloaded'] is True
            source_hash = digest(data)
            with Image.open(io.BytesIO(data)) as opened:
                im = ImageOps.exif_transpose(opened).convert('RGB')
            pixel_hash = pixels(im)
            match = old_hashes.get(source_hash) or old_pixels.get(pixel_hash)
            duplicate = seen_bytes.get(source_hash) or seen_pixels.get(pixel_hash)
            status = 'video-cover' if row['media_type'] == 'video' else 'approved'
            record = {**row, 'sha256': source_hash, 'pixelSha256': pixel_hash, 'status': status, 'variants': {}}
            if match or duplicate:
                record['duplicateOf'] = match['path'] if match else duplicate['file']
                collisions.append({'file': row['file'], 'duplicateOf': record['duplicateOf'], 'media_type': row['media_type']})
            # A video cover may never suppress an approved still: dedupe within each publication class.
            seen_bytes.setdefault(source_hash, row)
            seen_pixels.setdefault(pixel_hash, row)
            prefix = 'instagram/video-covers' if status == 'video-cover' else 'site-images'
            for label, edge in [('thumb', 320), ('poster', 960), ('page', 1600)]:
                copy = im.copy()
                copy.thumbnail((edge, edge), Image.Resampling.LANCZOS)
                out = io.BytesIO()
                copy.save(out, format='WEBP', quality=85, method=6)
                encoded = out.getvalue()
                sha = digest(encoded)
                key = prefix + '/' + sha + '.webp'
                target = stage / 'objects' / key
                target.parent.mkdir(parents=True, exist_ok=True)
                if not target.exists():
                    target.write_bytes(encoded)
                variant = {'key': key, 'sha256': sha, 'bytes': len(encoded), 'width': copy.width, 'height': copy.height}
                record['variants'][label] = variant
                seen_objects[key] = variant
            rows.append(record)
            if status == 'video-cover':
                continue
            if match or any(a['sourceSha256'] == source_hash or a['pixelSha256'] == pixel_hash for a in additions):
                continue
            paths = {}
            for label, variant in record['variants'].items():
                local = '/images/instagram/' + variant['sha256'] + '.webp'
                paths[label] = local
                if not any(e['path'] == local for e in media['entries']):
                    media['entries'].append({'source': 'external/instagram/' + variant['sha256'] + '.webp', 'path': local, **variant})
            additions.append({'url': paths['page'], 'thumbnail': paths['thumb'], 'poster': paths['poster'],
                              'fileSlug': 'Instagram artwork ' + row['date'], 'href': row['ig_url'],
                              'assignedPage': row['ig_url'], 'source': 'instagram-import',
                              'postId': row['post_id'], 'sourceSha256': source_hash, 'pixelSha256': pixel_hash})
    approved['art'].extend(additions)
    counts = {'received': len(source), 'mediaTypes': dict(collections.Counter(r['media_type'] for r in source)),
              'uniqueSourceHashes': len(seen_bytes), 'collisions': len(collisions),
              'existingApprovedPathsChecked': len(old_urls), 'existingApprovedChecked': len(old_hashes), 'existingPixelsChecked': len(old_pixels),
              'addedApproved': len(additions), 'totalApproved': len(old_urls) + len(additions),
              'heldVideoCovers': sum(r['status'] == 'video-cover' for r in rows),
              'objects': len(seen_objects), 'objectBytes': sum(v['bytes'] for v in seen_objects.values()),
              'galleryObjects': sum(k.startswith('site-images/') for k in seen_objects),
              'videoCoverObjects': sum(k.startswith('instagram/video-covers/') for k in seen_objects)}
    write_json(stage / 'import-report.json', {'counts': counts, 'collisions': collisions, 'files': rows})
    write_json(stage / 'proposed-approved.json', approved)
    write_json(stage / 'proposed-media-manifest.json', media)
    if args.apply:
        write_json(ROOT / 'src/_data/approvedImages.json', approved)
        write_json(ROOT / 'config/media-manifest.json', media)
        (ROOT / 'src/js/approved-images.js').write_text('window.wavgenApprovedImages = ' + json.dumps(approved, ensure_ascii=False, separators=(',', ':')) + ';\n', encoding='utf-8')
    print(json.dumps(counts, indent=2))

if __name__ == '__main__':
    main()
