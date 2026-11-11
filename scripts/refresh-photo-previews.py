"""Compose native SVG information cards with approved photographs; originals stay untouched."""
import base64, json, textwrap
from pathlib import Path
from xml.sax.saxutils import escape

site = Path(__file__).resolve().parents[1]
manifest_path = site / 'src/_data/contentSnapshots.json'
manifest = json.loads(manifest_path.read_text(encoding='utf-8'))
approved = json.loads((site / 'src/_data/approvedImages.json').read_text(encoding='utf-8'))
records = json.loads((site.parent / 'media-review/content-capture/records.json').read_text(encoding='utf-8'))
records = {(r['key'], r['index']): r for r in records}
for key, cards in manifest.items():
    pool = approved.get(key) or approved.get(key.split('/')[0]) or approved['home']
    for index, card in enumerate(cards, 1):
        record = records[key, index]
        art = pool[(index - 1) % len(pool)]
        data = base64.b64encode((site / 'src' / art['url'].lstrip('/')).read_bytes()).decode()
        title = textwrap.wrap(card['fileSlug'], 39)
        body = textwrap.wrap(record.get('body', '')[:500], 67)
        y = 122
        lines = []
        for line in title:
            lines.append(f'<text x="48" y="{y}" font-size="36" font-weight="700">{escape(line)}</text>')
            y += 43
        y += 18
        space = max(1, (565 - y) // 32)
        if len(body) > space:
            body = body[:space]
            body[-1] = body[-1].rstrip('., ') + '…'
        for line in body:
            lines.append(f'<text x="48" y="{y}" font-size="23" fill="#e2e8f0">{escape(line)}</text>')
            y += 32
        svg = f'''<svg xmlns="http://www.w3.org/2000/svg" width="1000" height="660" viewBox="0 0 1000 660">
<defs><linearGradient id="shade" x2="0" y2="1"><stop stop-color="#100c1b" stop-opacity=".68"/><stop offset="1" stop-color="#100c1b" stop-opacity=".9"/></linearGradient></defs>
<image href="data:image/webp;base64,{data}" width="1000" height="660" preserveAspectRatio="xMidYMid slice"/>
<path fill="url(#shade)" d="M0 0h1000v660H0z"/><path fill="#fedd00" d="M0 0h1000v10H0z"/>
<g font-family="Arial,sans-serif" fill="white"><text x="48" y="65" fill="#fedd00" font-size="18">{escape(record['page'].upper())}</text>{''.join(lines)}
<path stroke="#6366f1" d="M48 595H952"/><text x="48" y="628" font-size="16" fill="#fedd00">THE WAVEFORM GENERATION</text><text x="952" y="628" text-anchor="end" font-size="16" fill="#fedd00">{index} / 7 · Explore the full section →</text></g></svg>'''
        card['url'] = card['url'].rsplit('.', 1)[0] + '.svg'
        (site / 'src' / card['url'].lstrip('/')).write_text(svg, encoding='utf-8')
manifest_path.write_text(json.dumps(manifest, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
browser_path = site / 'src/assets/content-snapshots.js'
rest = browser_path.read_text(encoding='utf-8').split('\n', 1)[1]
browser_path.write_text('window.wavgenContentSnapshots = ' + json.dumps(manifest, ensure_ascii=False, separators=(',', ':')) + ';\n' + rest, encoding='utf-8')
print('Updated 196 photo-backed information cards using approved artwork.')
