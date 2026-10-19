import { readFileSync } from 'node:fs';

const bootstrap = readFileSync(new URL('./bootstrap.js', import.meta.url));
export const injection = `(()=>{try{
  if(window.__DSH_WHALE_SPLASH_PENDING__||!document.querySelector('#root > [data-dsh-boot]'))return;
  window.__DSH_WHALE_SPLASH_PENDING__={ready:false,disabled:false};
  const s=document.createElement('script');s.src='/dsh-whale-startup/bootstrap.js';s.async=true;
  s.onerror=()=>{window.__DSH_WHALE_SPLASH_PENDING__.disabled=true;window.__DSH_WHALE_SPLASH__?.dispose('unavailable')};
  document.head.append(s);
}catch(e){}})()`;

export default {
  name: 'whale-startup',
  apply(root) {
    // Subscribe before the desktop host collects its one-time injection table.
    root.on('webserver/index-inject', table => {
      if (!table.some(row => row.kind === 'script' && row.text === injection))
        table.push({kind:'script', placement:'body', text:injection});
    });
    root.inject(['webServer', 'connection'], ctx => {
      ctx.effect(() => ctx.webServer.register({
        kind:'exact', path:'/dsh-whale-startup/bootstrap.js',
        handler(req,res) {
          let rejection;
          try{rejection=ctx.connection.requestRejection(req);}catch{rejection=403;}
          if(rejection){res.writeHead(typeof rejection==='number'?rejection:403);res.end();return;}
          if(req.method!=='GET'&&req.method!=='HEAD'){res.writeHead(405,{'Allow':'GET, HEAD'});res.end();return;}
          res.writeHead(200,{'Content-Type':'application/javascript; charset=utf-8','Cache-Control':'no-store','Content-Length':String(bootstrap.length)});
          res.end(req.method==='HEAD'?undefined:bootstrap);
        }
      }));
    });
  }
};
