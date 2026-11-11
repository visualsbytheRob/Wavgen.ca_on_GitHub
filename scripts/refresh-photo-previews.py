"""Compose clean SVG photo previews with approved photographs; originals stay untouched."""
import base64, json
from pathlib import Path

site = Path(__file__).resolve().parents[1]
manifest_path = site / 'src/_data/contentSnapshots.json'
manifest = json.loads(manifest_path.read_text(encoding='utf-8'))
approved = json.loads((site / 'src/_data/approvedImages.json').read_text(encoding='utf-8'))
for key, cards in manifest.items():
    pool = approved.get(key) or approved.get(key.split('/')[0]) or approved['home']
    for index, card in enumerate(cards, 1):
        art = pool[(index - 1) % len(pool)]
        data = base64.b64encode((site / 'src' / art['url'].lstrip('/')).read_bytes()).decode()
        svg = f'''<svg xmlns="http://www.w3.org/2000/svg" width="1000" height="660" viewBox="0 0 1000 660">
<image href="data:image/webp;base64,{data}" width="1000" height="660" preserveAspectRatio="xMidYMid slice"/>
</svg>'''
        card['url'] = card['url'].rsplit('.', 1)[0] + '.svg'
        (site / 'src' / card['url'].lstrip('/')).write_text(svg, encoding='utf-8')
manifest_path.write_text(json.dumps(manifest, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
browser_path = site / 'src/assets/content-snapshots.js'
rest = browser_path.read_text(encoding='utf-8').split('\n', 1)[1]
browser_path.write_text('window.wavgenContentSnapshots = ' + json.dumps(manifest, ensure_ascii=False, separators=(',', ':')) + ';\n' + rest, encoding='utf-8')
print('Updated 196 clean photo previews using approved artwork.')
