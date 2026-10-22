const fs=require('node:fs');
const vm=require('node:vm');
const assert=require('node:assert/strict');
function environment(withIO=true){
 let rect={top:3000,bottom:6000},scripts=[],observers=[],timers=[],listeners={};
 const section={dataset:{},getBoundingClientRect:()=>rect};
 const doc={hidden:false,getElementById:()=>section,head:{appendChild:s=>scripts.push(s)},createElement:()=>({remove(){this.removed=true;}}),addEventListener:(n,fn)=>listeners[n]=fn};
 const win={innerHeight:800,setTimeout:fn=>{timers.push(fn);},addEventListener:(n,fn)=>listeners[n]=fn};
 if(withIO)win.IntersectionObserver=function(cb,opt){this.cb=cb;this.opt=opt;this.observe=()=>{};observers.push(this);};
 const ctx=vm.createContext({window:win,document:doc,IntersectionObserver:win.IntersectionObserver,requestAnimationFrame:fn=>timers.push(fn),Promise,console:{warn(){}}});
 vm.runInContext(fs.readFileSync('tests/beam-lazy/loader.js','utf8'),ctx);
 const calls={init:0,resume:0,pause:0};
 const api={resume(){calls.resume++;},pause(){calls.pause++;}};
 ctx.mountLazyBeam(()=>{calls.init++;return api;});
 return {ctx,win,doc,section,scripts,observers,timers,listeners,calls,setRect:r=>rect=r,flush:()=>{while(timers.length)timers.shift()();}};
}
const tick=async()=>{for(let i=0;i<6;i++)await Promise.resolve();};
(async()=>{
 const e=environment();
 assert.equal(e.scripts.length,0,'No library request above the block');assert.equal(e.calls.init,0);
 e.setRect({top:1100,bottom:4100});e.observers[0].cb([{isIntersecting:true}]);
 assert.equal(e.scripts.length,1);
 e.observers[0].cb([{isIntersecting:true}]);assert.equal(e.scripts.length,1,'Deduplicate in-flight request');
 e.win.THREE={WebGLRenderer:function(){}};e.scripts[0].onload();await tick();e.flush();
 assert.equal(e.calls.init,1);assert.equal(e.calls.resume,0,'Do not animate while merely nearby');
 e.setRect({top:100,bottom:3100});e.observers[1].cb([{isIntersecting:true}]);assert.equal(e.calls.resume,1);
 e.setRect({top:-3200,bottom:-200});e.observers[1].cb([{isIntersecting:false}]);assert(e.calls.pause>0);
 e.doc.hidden=true;e.listeners.visibilitychange();const resumes=e.calls.resume;
 e.setRect({top:100,bottom:3100});e.observers[1].cb([{isIntersecting:true}]);assert.equal(e.calls.resume,resumes,'No frames in a hidden tab');
 e.doc.hidden=false;e.listeners.visibilitychange();assert(e.calls.resume>resumes);assert.equal(e.calls.init,1,'Reuse scene after returning');
 const late=environment();late.setRect({top:1100,bottom:4100});late.observers[0].cb([{isIntersecting:true}]);late.setRect({top:3000,bottom:6000});late.win.THREE={WebGLRenderer:function(){}};late.scripts[0].onload();await tick();late.flush();assert.equal(late.calls.init,0,'Cancel expensive initialization when user scrolls away during download');
 late.setRect({top:100,bottom:3100});late.observers[0].cb([{isIntersecting:true}]);await tick();late.flush();assert.equal(late.calls.init,1);
 const fallback=environment(false);assert.equal(fallback.scripts.length,0);fallback.setRect({top:900,bottom:3900});fallback.listeners.scroll();fallback.flush();assert.equal(fallback.scripts.length,1,'Fallback works without IntersectionObserver');
 const failed=environment();failed.setRect({top:900,bottom:3900});failed.observers[0].cb([{isIntersecting:true}]);failed.scripts[0].onerror();await tick();assert.equal(failed.section.dataset.beamState,'error');failed.flush();assert.equal(failed.scripts.length,2,'Retry failed download once');failed.scripts[1].onerror();await tick();failed.flush();assert.equal(failed.scripts.length,2,'Bounded retries');
 console.log('PASS: delayed loading, deduplication, offscreen pause, hidden-tab pause, scene reuse, scroll-away during download, fallback and bounded retry');
})().catch(e=>{console.error(e);process.exitCode=1;});
