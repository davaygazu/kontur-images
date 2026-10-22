const fs=require('fs'),vm=require('vm'),assert=require('node:assert/strict');
const code=fs.readFileSync(__dirname+'/notice.js','utf8');
function setup({complete=false,width=0,top=50,opacity='1',stored=false,placeholder=false}={}){
 let clock=0,id=0,timers=new Map(),events={},observers=[],mutation,storage=new Map(stored?[['kontur-photo-notice-v1','1']]:[]);
 const button={addEventListener:(n,f)=>events.close=f};
 const notice={hidden:true,contains:()=>false,querySelector:()=>button};
 const raw='https://raw.githubusercontent.com/davaygazu/kontur-images/main/test.webp';
 const img={nodeType:1,tagName:'IMG',currentSrc:placeholder?'data:image/gif;base64,x':raw,src:raw,complete,naturalWidth:width,isConnected:true,parentElement:null,opacity,
 getAttribute:()=>img.src,getBoundingClientRect:()=>({width:300,height:200,bottom:img.top+200,right:320,top:img.top,left:20}),
 addEventListener:(n,f)=>events[n]=f,querySelectorAll:()=>[],top};
 const body={nodeType:1,querySelectorAll:()=>[img],appendChild:()=>{}};
 const document={body,hidden:false,getElementById:()=>notice,addEventListener:(n,f)=>events[n]=f};
 const context={window:{},document,sessionStorage:{getItem:k=>storage.get(k),setItem:(k,v)=>storage.set(k,v)},Map,innerHeight:800,innerWidth:390,
 getComputedStyle:el=>({display:'block',visibility:'visible',opacity:el.opacity||'1'}),
 setTimeout:(fn,ms)=>{timers.set(++id,{at:clock+ms,fn});return id},clearTimeout:id=>timers.delete(id),
 IntersectionObserver:class{constructor(fn){this.fn=fn;observers.push(this)}observe(){}unobserve(){}disconnect(){}},
 MutationObserver:class{constructor(fn){mutation=fn}observe(){}disconnect(){}}};
 context.window.IntersectionObserver=context.IntersectionObserver;
 vm.runInNewContext(code,context);
 function advance(ms){const end=clock+ms;while(true){let next=[...timers].sort((a,b)=>a[1].at-b[1].at)[0];if(!next||next[1].at>end)break;clock=next[1].at;timers.delete(next[0]);next[1].fn()}clock=end}
 return {img,notice,events,advance,storage,document,intersection:yes=>observers[0].fn([{target:img,isIntersecting:yes}]),mutate:()=>mutation([{type:'attributes',target:img}])};
}
let a=setup();a.advance(5999);assert(a.notice.hidden);a.advance(1);assert(!a.notice.hidden);a.img.complete=true;a.img.naturalWidth=1080;a.events.load();assert(!a.notice.hidden);console.log('6-second threshold; load completion does not dismiss OK');
a=setup();a.advance(1000);a.img.complete=true;a.img.naturalWidth=1080;a.events.load();a.advance(7000);assert(a.notice.hidden);console.log('Fast image does not notify OK');
a=setup({top:1200});a.advance(7000);assert(a.notice.hidden);a.img.top=50;a.intersection(true);a.advance(6000);assert(!a.notice.hidden);console.log('Offscreen image waits for viewport OK');
a=setup({opacity:'0'});a.advance(7000);assert(a.notice.hidden);a.img.opacity='1';a.mutate();a.advance(6250);assert(!a.notice.hidden);console.log('Hidden gallery slide ignored; visible slide monitored OK');
a=setup({complete:true,width:0});assert(!a.notice.hidden);a.events.close();assert(a.notice.hidden);a.advance(10000);assert(a.notice.hidden);console.log('Broken image and close OK');
a=setup({stored:true});a.advance(10000);assert(a.notice.hidden);console.log('Once per tab session OK');
a=setup({placeholder:true});a.advance(6000);assert(!a.notice.hidden);console.log('Lazy source change from placeholder monitored OK');
a=setup();a.advance(1000);a.document.hidden=true;a.events.visibilitychange();a.advance(10000);assert(a.notice.hidden);a.document.hidden=false;a.events.visibilitychange();a.advance(6250);assert(!a.notice.hidden);console.log('Background tab timer paused OK');

a=setup();a.advance(6000);assert(!a.notice.hidden);a.img.top=1200;a.intersection(false);a.advance(10000);assert(!a.notice.hidden);a.img.opacity='0';a.mutate();a.advance(250);assert(!a.notice.hidden);a.document.hidden=true;a.events.visibilitychange();a.advance(10000);assert(!a.notice.hidden);a.document.hidden=false;a.events.visibilitychange();a.advance(250);assert(!a.notice.hidden);a.events.close();assert(a.notice.hidden);a.img.top=50;a.intersection(true);a.advance(10000);assert(a.notice.hidden);console.log('Scroll, hidden slide and tab switch retain notice; only close dismisses OK');
