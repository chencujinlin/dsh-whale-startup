"""Build an offline design preview from the production drawing code; optionally export it."""
import argparse,base64,json,subprocess
from pathlib import Path

root=Path(__file__).resolve().parents[1]
parser=argparse.ArgumentParser();parser.add_argument('--out',type=Path,default=root/'qa/v1.1.0/preview.mp4');parser.add_argument('--stills');parser.add_argument('--fps',type=int,default=60);parser.add_argument('--build-only',action='store_true');args=parser.parse_args()
preview=root/'qa/v1.1.0/preview';preview.mkdir(parents=True,exist_ok=True)
runtime=(root/'lib/bootstrap.js').read_text()
needle='window.__DSH_WHALE_SPLASH__={'
assert runtime.count(needle)==1
# These deterministic frame controls exist in the preview only, never in the plugin.
runtime=runtime.replace(needle,needle+'''renderAt(time){cancelAnimationFrame(raf);t=Math.max(0,Math.min(duration,Number(time)||0));status='ready';clearTimeout(mountFallback);const ring=clone.querySelector('[data-dsh-boot-spinner]');if(ring){ring.style.animation='none';ring.style.transform=`rotate(${t/.8*360}deg)`;}draw();},''',1).replace('requestAnimationFrame(tick)','0')
html=(root/'tools/preview-template.html').read_text().replace('/*WHALERUNTIME*/',runtime)
(preview/'index.html').write_text(html)
if args.build_only:print(preview/'index.html');raise SystemExit
from playwright.sync_api import sync_playwright
with sync_playwright() as p:
    browser=p.chromium.launch();page=browser.new_page(viewport={'width':1280,'height':820},device_scale_factor=1,reduced_motion='no-preference');errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
    page.goto((preview/'index.html').as_uri()+'?render=1');page.wait_for_function('window.__ready')
    if args.stills:
        args.out.mkdir(parents=True,exist_ok=True)
        for time in map(float,args.stills.split(',')):
            page.evaluate('t=>renderFrame(t)',time);page.screenshot(path=str(args.out/f't{time:05.2f}.png'))
    else:
        args.out.parent.mkdir(parents=True,exist_ok=True)
        ff=subprocess.Popen(['ffmpeg','-y','-v','error','-f','image2pipe','-framerate',str(args.fps),'-c:v','png','-i','-','-c:v','libx264','-preset','slow','-crf','16','-pix_fmt','yuv420p','-movflags','+faststart',str(args.out)],stdin=subprocess.PIPE)
        for frame in range(round(4.2*args.fps)):
            page.evaluate('t=>renderFrame(t)',frame/args.fps);ff.stdin.write(page.screenshot())
        ff.stdin.close();assert ff.wait()==0
    browser.close()
assert not errors,errors
print(args.out)
