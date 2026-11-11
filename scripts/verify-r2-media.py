"""Read-only R2 release gate. Verify every object before publishing media URLs."""
import argparse, concurrent.futures, hashlib, json, subprocess
from pathlib import Path
p=argparse.ArgumentParser();p.add_argument('--headers-only',action='store_true');args=p.parse_args()
m=json.loads((Path(__file__).resolve().parents[1]/'config/media-manifest.json').read_text())
objects={e['key']:e for e in m['entries']}
def verify(item):
 key,e=item;url=m['baseUrl']+'/'+key
 headers=subprocess.check_output(['curl','--fail','--silent','--show-error','--retry','2','--max-time','30','-I','-H','Origin: https://wavgen.ca',url],text=True)
 lower=headers.lower()
 if 'server: cloudflare' not in lower:raise ValueError('Not Cloudflare: '+key)
 if 'access-control-allow-origin: https://wavgen.ca' not in lower and 'access-control-allow-origin: *' not in lower:raise ValueError('Missing slideshow CORS: '+key)
 if not args.headers_only:
  data=subprocess.check_output(['curl','--fail','--silent','--show-error','--retry','2','--max-time','60',url])
  if hashlib.sha256(data).hexdigest()!=e['sha256']:raise ValueError('Checksum differs: '+key)
 return key
with concurrent.futures.ThreadPoolExecutor(max_workers=6) as pool:
 results=list(pool.map(verify,objects.items()))
print(f'PASS: {len(results)} R2 objects, Cloudflare headers and read CORS'+('' if args.headers_only else ', SHA-256 matches'))
