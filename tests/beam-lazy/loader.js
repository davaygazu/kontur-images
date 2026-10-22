
function mountLazyBeam(init){
  var section=document.getElementById('kntBeamV2');
  if(!section || section.__konturBeamLazy) return;
  section.__konturBeamLazy=true;
  section.dataset.beamState='idle';
  section.dataset.beamActive='false';
  var near=false,visible=false,busy=false,controller=null;
  var retries=0;
  var libraryURL='https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.min.js';

  function loadThree(){
    if(window.THREE && window.THREE.WebGLRenderer) return Promise.resolve();
    if(window.__konturThree160Promise) return window.__konturThree160Promise;
    window.__konturThree160Promise=new Promise(function(resolve,reject){
      var script=document.createElement('script');
      script.src=libraryURL;
      script.async=true;
      script.onload=function(){
        if(window.THREE && window.THREE.WebGLRenderer) resolve();
        else reject(new Error('Three.js did not initialize'));
      };
      script.onerror=function(){
        script.remove();
        reject(new Error('Three.js could not be loaded'));
      };
      document.head.appendChild(script);
    }).catch(function(error){
      window.__konturThree160Promise=null;
      throw error;
    });
    return window.__konturThree160Promise;
  }

  function syncRendering(){
    if(!controller) return;
    var active=visible && !document.hidden;
    section.dataset.beamActive=String(active);
    if(active) controller.resume();
    else controller.pause();
  }

  function measure(){
    var rect=section.getBoundingClientRect();
    near=rect.top<window.innerHeight+600 && rect.bottom>-600;
    visible=rect.top<window.innerHeight && rect.bottom>0;
  }

  function start(){
    if(controller || busy || !near || document.hidden || retries>=2) return;
    busy=true;
    section.dataset.beamState='loading';
    loadThree().then(function(){
      var initialize=function(){
        measure();
        if(!near || document.hidden){
          busy=false;
          section.dataset.beamState='idle';
          return;
        }
        try{
          section.dataset.beamState='initializing';
          controller=init();
          if(!controller) throw new Error('Beam initialization failed');
          section.dataset.beamState='ready';
          busy=false;
          syncRendering();
        }catch(error){
          busy=false;
          retries=2;
          section.dataset.beamState='error';
          console.warn('KONTUR 3D:',error);
        }
      };
      if(window.requestIdleCallback) window.requestIdleCallback(initialize,{timeout:600});
      else window.setTimeout(initialize,0);
    }).catch(function(error){
      busy=false;
      retries++;
      section.dataset.beamState='error';
      console.warn('KONTUR 3D:',error);
      if(retries<2) window.setTimeout(check,3000);
    });
  }

  function check(){
    measure();
    start();
    syncRendering();
  }

  if('IntersectionObserver' in window){
    var warmObserver=new IntersectionObserver(function(entries){
      near=entries[0].isIntersecting;
      start();
    },{rootMargin:'600px 0px',threshold:0});
    var viewObserver=new IntersectionObserver(function(entries){
      visible=entries[0].isIntersecting;
      syncRendering();
    },{threshold:0});
    warmObserver.observe(section);
    viewObserver.observe(section);
  }else{
    var pending=false;
    var schedule=function(){
      if(pending) return;
      pending=true;
      requestAnimationFrame(function(){pending=false;check();});
    };
    window.addEventListener('scroll',schedule,{passive:true});
    window.addEventListener('resize',schedule,{passive:true});
  }
  document.addEventListener('visibilitychange',check);
  window.addEventListener('pageshow',check);
  check();
}
