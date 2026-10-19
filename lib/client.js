window.__ModuleLoader__.load({
  id:'dsh-whale-startup',
  factory(require){
    const {useLayoutEffect}=require('react');
    function Ready(){
      useLayoutEffect(()=>{
        const pending=window.__DSH_WHALE_SPLASH_PENDING__;
        if(pending)pending.ready=true;
        window.__DSH_WHALE_SPLASH__?.ready();
      },[]);
      return null;
    }
    return {
      inject:['slots'],
      apply(ctx){
        // The effect runs only when the real workbench has committed.
        ctx.slots.inject('shell.overlay',()=>ctx.slots.register({name:'shell.overlay',id:'whale-startup-ready'},Ready));
        ctx.effect(()=>()=>{
          const pending=window.__DSH_WHALE_SPLASH_PENDING__;
          if(pending)pending.disabled=true;
          window.__DSH_WHALE_SPLASH__?.dispose('disabled');
        });
      }
    };
  }
});
