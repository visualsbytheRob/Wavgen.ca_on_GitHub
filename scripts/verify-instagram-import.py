"""Verify staged Instagram objects against public R2; report stays outside the site."""
import concurrent.futures, hashlib, json, subprocess, sys
from pathlib import Path

report_path = Path(sys.argv[1])
report = json.loads(report_path.read_text(encoding='utf-8'))
objects = {v['key']: v for row in report['files'] for v in row['variants'].values()}

def verify(item):
    key, expected = item
    url = 'https://media.wavgen.ca/' + key
    header = subprocess.check_output(['curl', '--fail', '--silent', '--show-error', '--retry', '2',
                                     '--max-time', '30', '-I', '-H', 'Origin: https://wavgen.ca', url], text=True)
    assert 'server: cloudflare' in header.lower(), key
    assert 'access-control-allow-origin: https://wavgen.ca' in header.lower(), key
    body = subprocess.check_output(['curl', '--fail', '--silent', '--show-error', '--retry', '2', '--max-time', '60', url])
    assert len(body) == expected['bytes'] and hashlib.sha256(body).hexdigest() == expected['sha256'], key
    return {'key': key, 'bytes': len(body), 'sha256': expected['sha256'], 'verified': True}

with concurrent.futures.ThreadPoolExecutor(max_workers=6) as pool:
    results = list(pool.map(verify, objects.items()))
(report_path.parent / 'r2-verification.json').write_text(json.dumps(results, indent=2) + '\n', encoding='utf-8')
print(f'PASS: {len(results)} Instagram R2 objects; Cloudflare, CORS, byte lengths and SHA-256 verified.')
