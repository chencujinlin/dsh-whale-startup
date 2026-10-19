function startWhaleIntro(assets) {
  'use strict';
  const pending=window.__DSH_WHALE_SPLASH_PENDING__;
  const boot=document.querySelector('#root > [data-dsh-boot]');
  if(!pending||pending.disabled||!boot||window.__DSH_WHALE_SPLASH__)return;
  const original=boot.firstElementChild;
  if(!original||!boot.querySelector('[data-dsh-boot-spinner]'))return;
  const clone=original.cloneNode(true), overlay=document.createElement('div'), plate=document.createElement('div'), canvas=document.createElement('canvas'),style=document.createElement('style');
  overlay.dataset.dshWhaleSplash='';overlay.setAttribute('aria-hidden','true');
  overlay.style.cssText='position:fixed;inset:0;z-index:2147483645;overflow:hidden;pointer-events:auto;isolation:isolate';
  plate.style.cssText='position:absolute;inset:0;pointer-events:none';plate.style.background=getComputedStyle(boot).backgroundColor;
  clone.style.position='absolute';clone.style.margin='0';clone.style.pointerEvents='none';clone.style.transformOrigin='center';
  canvas.style.cssText='position:absolute;inset:0;width:100%;height:100%;pointer-events:none';
  style.textContent='html[data-whale-startup-active] .dshwv-root{visibility:hidden!important}';
  overlay.append(plate,clone,canvas);document.head.append(style);document.body.append(overlay);
  document.documentElement.setAttribute('data-whale-startup-active','');
  const c=canvas.getContext('2d'),images=[];
  const duration=3.8,impactAt=1.68,readyAt=1.12,holdAt=.88;
  const clamp=(v)=>Math.max(0,Math.min(1,v)),p=(t,a,b)=>clamp((t-a)/(b-a)),mix=(a,b,v)=>a+(b-a)*v;
  const smooth=v=>v*v*(3-2*v),out=v=>1-(1-v)**3,inOut=v=>v<.5?4*v*v*v:1-(-2*v+2)**3/2;
  let status='loading',t=0,elapsed=0,last=performance.now(),raf=0,dead=false,loaded=false,mountFallback=0;
  let w=innerWidth,h=innerHeight,scale=1,center={x:w/2,y:h/2},spinner={...center};
  const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
  function measure(){
    const oldWidth=w,oldHeight=h;
    w=innerWidth;h=innerHeight;scale=Math.min(w/1280,h/820);
    const dpr=Math.min(devicePixelRatio||1,2);canvas.width=Math.round(w*dpr);canvas.height=Math.round(h*dpr);c.setTransform(dpr,0,0,dpr,0,0);
    if(original.isConnected){const r=original.getBoundingClientRect(),q=boot.querySelector('[data-dsh-boot-spinner]')?.getBoundingClientRect();center={x:r.x+r.width/2,y:r.y+r.height/2};spinner=q?{x:q.x+q.width/2,y:q.y+q.height/2}:center;clone.style.left=`${r.x}px`;clone.style.top=`${r.y}px`;clone.style.width=`${r.width}px`;clone.style.height=`${r.height}px`;}
    else{const dx=(w-oldWidth)/2,dy=(h-oldHeight)/2;center.x+=dx;center.y+=dy;spinner.x+=dx;spinner.y+=dy;clone.style.left=`${parseFloat(clone.style.left)+dx}px`;clone.style.top=`${parseFloat(clone.style.top)+dy}px`;}
  }
  function dispose(reason='complete'){
    if(dead)return;dead=true;cancelAnimationFrame(raf);clearTimeout(mountFallback);clearTimeout(assetTimeout);observer.disconnect();removeEventListener('resize',measure);removeEventListener('pagehide',onPageHide);overlay.remove();style.remove();document.documentElement.removeAttribute('data-whale-startup-active');
    status=reason;
  }
  const onPageHide=()=>dispose('navigation');
  function syncNative(){
    if(dead||status==='ready')return;
    if(!boot.isConnected){
      // Removal alone is never a success signal. A missing bridge fails open.
      if(!mountFallback)mountFallback=setTimeout(()=>{if(status!=='ready')dispose('handoff-unavailable');},250);
      return;
    }
    const nativeSpinner=boot.querySelector('[data-dsh-boot-spinner]');
    if(!nativeSpinner){status='failed';clone.replaceChildren(...[...original.childNodes].map(n=>n.cloneNode(true)));measure();return;}
    const displaySpinner=clone.querySelector('[data-dsh-boot-spinner]');
    if(displaySpinner)displaySpinner.style.cssText=nativeSpinner.style.cssText;
  }
  const observer=new MutationObserver(syncNative);observer.observe(boot,{subtree:true,attributes:true,childList:true,characterData:true});
  // Observe only removal of the boot root; the React commit signal remains authoritative.
  observer.observe(boot.parentElement,{childList:true});
  const assetTimeout=setTimeout(()=>dispose('asset-timeout'),2000);
  window.__DSH_WHALE_SPLASH__={
    ready(){if(dead||status==='failed')return;pending.ready=true;if(loaded){status='ready';if(t>=holdAt)t=readyAt;clearTimeout(mountFallback);}},
    dispose,
    getState(){return{version:'1.0.0',status,time:t,loaded,reduced,active:!dead};}
  };
  function sprite(index,x,y,size,rotation=0,sx=1,alpha=1){
    if(!images[index])return;c.save();c.globalAlpha=alpha;c.translate(x,y);c.rotate(rotation);c.scale(sx,1);c.drawImage(images[index],-size/2,-size,size,size);c.restore();
  }
  function bubble(text,x,y,alpha){
    if(alpha<=0)return;c.save();c.globalAlpha=alpha;c.font='600 16px -apple-system,"PingFang SC",sans-serif';const bw=c.measureText(text).width+36;c.fillStyle='white';c.strokeStyle='#d9dfdc';c.lineWidth=1;c.beginPath();c.roundRect(x-bw/2,y-23,bw,43,12);c.fill();c.stroke();c.beginPath();c.moveTo(x+2,y+20);c.lineTo(x+12,y+30);c.lineTo(x+16,y+20);c.fill();c.stroke();c.fillStyle='#56617a';c.textAlign='center';c.fillText(text,x,y+4);c.restore();
  }
  function target(){const r=document.querySelector('.dshwv-root .dshwv-img')?.getBoundingClientRect();return r&&r.width&&r.height?{x:r.x+r.width/2,y:r.bottom,size:r.height}:{x:w-100*scale,y:h-10*scale,size:210*scale};}
  function character(time){
    let pose=0,x=879,y=676,size=510,rot=0,sx=1;const enter=out(p(time,.12,.52));x+=mix(75,0,enter);
    if(time>=.9&&time<1.18){pose=1;const v=smooth(p(time,.9,1.18));x+=6*v;rot=.012*v;}
    if(time>=1.18&&time<1.55){pose=2;const v=out(p(time,1.18,1.47));x+=14*v;rot=.03*v;y+=4*v;}
    if(time>=1.55&&time<1.66){pose=3;const v=smooth(p(time,1.55,1.66));x=mix(893,852,v);rot=mix(.03,-.01,v);}
    if(time>=1.66&&time<2.24){pose=4;const v=out(p(time,1.66,1.76));x=mix(852,825,v);rot=mix(-.01,-.038,v);sx=1+.025*Math.sin(p(time,1.66,1.96)*Math.PI);}
    if(time>=2.24){pose=5;const q=out(p(time,2.24,2.58));x=mix(825,1088,q);y=mix(676,770,q);size=mix(510,400,q);rot=mix(-.038,0,q);}
    let px=center.x+(x-640)*scale,py=center.y+(y-410)*scale,ps=size*scale;
    if(time>=2.91){const v=inOut(p(time,2.91,3.72)),end=target();px=mix(center.x+448*scale,end.x,v);py=mix(center.y+360*scale,end.y,v);ps=mix(400*scale,end.size,v);rot=-.018*Math.sin(v*Math.PI);}
    sprite(pose,px,py,ps,rot,sx,enter);
    c.save();c.translate(center.x-640*scale,center.y-410*scale);c.scale(scale,scale);
    if(time>.6&&time<1.12)bubble('还没好？',922,181,smooth(p(time,.6,.75))*(1-p(time,1.04,1.12)));
    if(time>=1.14&&time<1.53)bubble('我来。',940,178,smooth(p(time,1.14,1.25))*(1-p(time,1.45,1.53)));
    if(time>=2.4&&time<3.07)bubble('开工。',1120,340,smooth(p(time,2.4,2.57))*(1-p(time,2.94,3.07)));
    c.restore();
  }
  function draw(){
    c.clearRect(0,0,w,h);
    if(reduced){const a=status==='ready'?smooth(p(t,readyAt,readyAt+.3)):0;plate.style.opacity=String(1-a);clone.style.opacity=String(1-a);if(a){const end=target();sprite(5,end.x,end.y,end.size,0,1,a);}if(a>=1)dispose();return;}
    const hit=smooth(p(t,impactAt,1.78)),fly=p(t,1.78,2.31),f=fly*fly;
    clone.style.transform=`translate(${-Math.max(w+100,1350*scale)*f}px,${-75*scale*f}px) rotate(${-0.04*hit-1.25*f}rad) scale(${1-.045*hit},${1+.025*hit})`;
    clone.style.visibility=t>=2.31?'hidden':'visible';
    plate.style.opacity=String(1-smooth(p(t,1.9,2.31)));overlay.style.pointerEvents=t<2.31?'auto':'none';
    character(t);
    const q=p(t,impactAt,impactAt+.32);
    if(t>=impactAt&&q<1){c.save();c.globalAlpha=(1-q)**1.5;c.translate(spinner.x+9*scale,spinner.y);c.scale((.7+q*.7)*scale,(.7+q*.7)*scale);c.lineWidth=3;c.lineCap='round';c.strokeStyle='#cfb17f';for(const[a,b,x,y]of[[-37,-19,-61,-32],[-27,-38,-38,-61],[-38,10,-66,13],[-13,-46,-13,-65]]){c.beginPath();c.moveTo(a,b);c.lineTo(x,y);c.stroke();}c.beginPath();c.ellipse(-5,-2,30,48,-.25,Math.PI*.62,Math.PI*1.7);c.strokeStyle='#afc1dd';c.stroke();c.restore();}
  }
  function tick(now){
    if(dead)return;const dt=Math.min((now-last)/1000,.05);last=now;elapsed+=dt;
    if(loaded)t=Math.min(status==='ready'?duration:holdAt,t+dt);
    try{draw();if(t>=duration){dispose();return;}}catch(e){dispose('render-error');console.warn('Whale startup animation skipped:',e);return;}
    if(!dead)raf=requestAnimationFrame(tick);
  }
  try{measure();syncNative();addEventListener('resize',measure);addEventListener('pagehide',onPageHide);raf=requestAnimationFrame(tick);
    Promise.all(Object.values(assets).map(src=>new Promise((resolve,reject)=>{const im=new Image();im.onload=()=>resolve(im);im.onerror=reject;im.src=src;}))).then(result=>{if(dead)return;images.push(...result);loaded=true;clearTimeout(assetTimeout);if(pending.ready)window.__DSH_WHALE_SPLASH__.ready();}).catch(()=>dispose('asset-error'));
  }catch(e){dispose('initialization-error');}
}
