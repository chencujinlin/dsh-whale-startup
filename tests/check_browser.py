"""Exercise the real plugin bootstrap and ready component against a native-size host fixture."""
import functools,http.server,json,re,socketserver,threading
from pathlib import Path
from playwright.sync_api import sync_playwright

root=Path(__file__).resolve().parents[1]
fixture='''<!doctype html><meta charset="utf-8"><style>
html,body{margin:0;font:12px -apple-system,sans-serif;background:white}#root{height:100vh}
[data-dsh-boot]{height:100%;display:grid;place-items:center;background:white}.card{display:flex;align-items:center;flex-direction:column;gap:16px}.brand{font-size:16px;font-weight:600;letter-spacing:.08em;line-height:24px}.hint{color:#81858c;line-height:18px}[data-dsh-boot-spinner]{width:20px;height:20px;border:2px solid #ddd;border-top-color:#0f1115;border-radius:100%;animation:spin .8s linear infinite}@keyframes spin{to{transform:rotate(360deg)}}.dshwv-root{position:fixed;right:24px;bottom:20px}.dshwv-img{width:150px;height:150px}
</style><div id="root"><div data-dsh-boot><div class="card"><div class="brand">HARNESS</div><div data-dsh-boot-spinner></div><div class="hint">Loading plugins…</div></div></div></div><!--OPTIONAL_WIDGET-->
<script>window.__DSH_WHALE_SPLASH_PENDING__={ready:false,disabled:false};</script><script src="/lib/bootstrap.js"></script>'''
class Handler(http.server.SimpleHTTPRequestHandler):
    def log_message(self,*args):pass
    def do_GET(self):
        if self.path.split('?')[0]=='/':
            widget='<div class="dshwv-root"><img class="dshwv-img" src="/assets/smug.png"></div>' if 'widget=1' in self.path else ''
            data=fixture.replace('<!--OPTIONAL_WIDGET-->',widget).encode();self.send_response(200);self.send_header('Content-Type','text/html; charset=utf-8');self.end_headers();self.wfile.write(data)
        else:super().do_GET()
server=socketserver.ThreadingTCPServer(('127.0.0.1',0),functools.partial(Handler,directory=str(root)))
threading.Thread(target=server.serve_forever,daemon=True).start()
out=root/'qa';out.mkdir(exist_ok=True);results={}
with sync_playwright() as p:
    browser=p.chromium.launch();page=browser.new_page(viewport={'width':1280,'height':820});page.clock.install();errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
    def load(reduced=False,widget=False):
        page.emulate_media(reduced_motion='reduce' if reduced else 'no-preference');page.goto(f'http://127.0.0.1:{server.server_address[1]}/'+('?widget=1' if widget else ''));page.wait_for_function('__DSH_WHALE_SPLASH__?.getState().loaded')
    state=lambda:page.evaluate('__DSH_WHALE_SPLASH__.getState()')
    def painted(min_y=0):
        return page.evaluate('''minY=>{const c=document.querySelector('[data-dsh-whale-splash] canvas'),d=c.getContext('2d').getImageData(0,0,c.width,c.height).data;let x0=c.width,y0=c.height,x1=0,y1=0,pixels=0,maxAlpha=0;for(let i=minY*c.width*4;i<d.length;i+=4){maxAlpha=Math.max(maxAlpha,d[i+3]);if(d[i+3]<16)continue;const n=i/4,x=n%c.width,y=Math.floor(n/c.width);x0=Math.min(x0,x);x1=Math.max(x1,x);y0=Math.min(y0,y);y1=Math.max(y1,y);pixels++;}return{x0,y0,x1,y1,pixels,maxAlpha};}''',min_y)
    def mount(bridge=True):
        page.evaluate("document.getElementById('root').innerHTML='<main id=workbench>ACTUAL WORKBENCH</main>'")
        if bridge:
            # Execute the delivered client factory and its registered commit component.
            page.evaluate('''async()=>{let registered;window.__ModuleLoader__={load({factory}){const mod=factory(name=>({useLayoutEffect:fn=>fn()}));mod.apply({slots:{inject:(_,fn)=>fn(),register:(_,component)=>{registered=component;}},effect:()=>{}});}};await new Promise((ok,fail)=>{const s=document.createElement('script');s.src='/lib/client.js';s.onload=ok;s.onerror=fail;document.head.append(s)});registered();}''')
    load();page.clock.run_for(6500);assert state()['time']==.88 and state()['status']=='loading';assert page.locator('[data-dsh-whale-splash]').count()==1
    page.screenshot(path=str(out/'loading.png'));results['loading_waits']=state();waiting_pixels=painted()
    assert page.locator('.dshwv-root').count()==0
    mount();page.clock.run_for(800);assert state()['status']=='ready';page.screenshot(path=str(out/'slap.png'))
    page.clock.run_for(1380);cheer_pixels=painted();assert cheer_pixels['pixels']>waiting_pixels['pixels']*1.5
    # Measure the character below the dialogue area; the comic balloon sits to her right.
    cheer_body=painted(300);assert abs((cheer_body['x0']+cheer_body['x1'])/2-640)<85
    independent_frame=page.locator('[data-dsh-whale-splash] canvas').evaluate("c=>c.toDataURL()")
    before=state()['time'];page.evaluate('__DSH_WHALE_SPLASH__.ready()');assert state()['time']==before
    page.screenshot(path=str(out/'cheer.png'));results['standalone_cheer_is_larger_and_centered']={'waiting':waiting_pixels,'cheer':cheer_pixels,'body':cheer_body}
    page.clock.run_for(650);assert painted()['maxAlpha']<128;results['cheer_fades_before_cleanup']=state()
    page.clock.run_for(450);assert not state()['active'];assert page.locator('#workbench').is_visible();assert page.locator('[data-dsh-whale-splash]').count()==0;results['standalone_outro_removes_itself']=state();page.screenshot(path=str(out/'complete.png'))
    load(widget=True);page.clock.run_for(6500);unrelated=page.locator('.dshwv-root').evaluate('(n)=>({html:n.outerHTML,visibility:getComputedStyle(n).visibility})');assert unrelated['visibility']=='visible'
    mount();page.clock.run_for(2180);assert page.locator('[data-dsh-whale-splash] canvas').evaluate("c=>c.toDataURL()") == independent_frame
    page.clock.run_for(1200);assert page.locator('.dshwv-root').evaluate('(n)=>({html:n.outerHTML,visibility:getComputedStyle(n).visibility})')==unrelated;results['unrelated_widget_untouched_and_does_not_affect_animation']=True
    load();page.evaluate("document.querySelector('.card').innerHTML='<div class=brand>HARNESS</div><strong>Failed to load plugins</strong><div>test-plugin</div>'");page.clock.run_for(5000);assert state()['status']=='failed' and state()['time']<=.88;assert page.locator('[data-dsh-whale-splash]').inner_text().find('test-plugin')>=0;page.screenshot(path=str(out/'failure.png'));results['native_failure_is_retained']=state()
    load();mount(False);page.clock.run_for(500);assert state()['status']=='handoff-unavailable' and not state()['active'];results['removal_without_commit_never_plays_success']=state()
    load();page.evaluate('__DSH_WHALE_SPLASH__.dispose("disabled")');assert page.locator('[data-dsh-whale-splash]').count()==0;assert page.locator('[data-dsh-boot]').is_visible();results['disable_restores_native_loading']=True
    load(True);mount();page.clock.run_for(2600);assert not state()['active'] and state()['reduced'];results['reduced_motion_handoff']=state()
    source=re.sub(r'data:image/png;base64,[A-Za-z0-9+/=]+','data:image/png;base64,AAAA',(root/'lib/bootstrap.js').read_text(),count=1)
    page.route('**/lib/bootstrap.js',lambda route:route.fulfill(body=source,content_type='application/javascript'))
    page.goto(f'http://127.0.0.1:{server.server_address[1]}/');page.wait_for_function('__DSH_WHALE_SPLASH__?.getState().status==="asset-error"');assert page.locator('[data-dsh-whale-splash]').count()==0;assert page.locator('[data-dsh-boot]').is_visible();results['asset_failure_restores_native_loading']=state()
    assert not errors,errors;results['page_errors']=errors
    browser.close()
server.shutdown();server.server_close()
(out/'browser-checks.json').write_text(json.dumps(results,ensure_ascii=False,indent=2)+'\n');print(json.dumps(results,ensure_ascii=False,indent=2))
