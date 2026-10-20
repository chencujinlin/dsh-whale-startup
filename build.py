from pathlib import Path
import base64,json
root=Path(__file__).resolve().parent
(root/'lib').mkdir(exist_ok=True)
names=['waiting','impatient','windup','swing','slap','smug','cheer']
assets={}
for name in names:
    dest=root/'assets'/f'{name}.png'
    if not dest.is_file():raise SystemExit(f'Missing character asset: assets/{name}.png')
    assets[name]='data:image/png;base64,'+base64.b64encode(dest.read_bytes()).decode()
source=(root/'src/bootstrap.js').read_text()
(root/'lib/bootstrap.js').write_text('try{('+source+')('+json.dumps(assets)+')}catch(e){console.warn("Whale startup animation unavailable",e)}\n')
print('Built offline animation assets into lib/bootstrap.js')
