(function(){
"use strict";


function initBeam(){

"use strict";


/* =========================================================
   ELEMENTS
========================================================= */

const section =
  document.getElementById("kntBeamV2");

const canvas =
  document.getElementById("kntBeamCanvasV2");

const hint =
  document.getElementById("kntBeamHintV2");

const progress =
  document.getElementById("kntBeamProgressV2");

const progressBar =
  document.getElementById("kntBeamProgressBarV2");

if (
  !section ||
  !canvas ||
  typeof THREE === "undefined"
) return;

let beamRunning=false;
let beamFrame=null;
let scrollFrame=null;


/* =========================================================
   HELPERS
========================================================= */

function clamp(v,min,max){
  return Math.max(min,Math.min(max,v));
}

function lerp(a,b,t){
  return a + (b-a)*t;
}

function smootherstep(t){

  t = clamp(t,0,1);

  return t*t*t*(t*(t*6-15)+10);

}


/* =========================================================
   THREE
========================================================= */

const scene = new THREE.Scene();

const camera =
  new THREE.PerspectiveCamera(
    35,
    1,
    .1,
    100
  );

const renderer =
  new THREE.WebGLRenderer({
    canvas:canvas,
    antialias:true,
    alpha:true,
    powerPreference:"high-performance"
  });

renderer.setPixelRatio(
  Math.min(
    window.devicePixelRatio || 1,
    2
  )
);

renderer.outputColorSpace =
  THREE.SRGBColorSpace;

renderer.shadowMap.enabled = true;

renderer.shadowMap.type =
  THREE.PCFSoftShadowMap;


/* =========================================================
   LIGHT
========================================================= */

scene.add(
  new THREE.HemisphereLight(
    0xffffff,
    0xc8b89e,
    2.2
  )
);


const key =
  new THREE.DirectionalLight(
    0xfff7ea,
    3.4
  );

key.position.set(5,7,7);

key.castShadow = true;

scene.add(key);


const fill =
  new THREE.DirectionalLight(
    0xffdfb8,
    1.1
  );

fill.position.set(-6,3,4);

scene.add(fill);


const back =
  new THREE.DirectionalLight(
    0xffffff,
    1.2
  );

back.position.set(2,4,-6);

scene.add(back);


/* =========================================================
   FLOOR
========================================================= */

const floor =
  new THREE.Mesh(
    new THREE.PlaneGeometry(15,10),
    new THREE.ShadowMaterial({
      color:0x17211e,
      opacity:.085
    })
  );

floor.rotation.x = -Math.PI/2;

floor.position.y = -2.3;

floor.receiveShadow = true;

scene.add(floor);


/* =========================================================
   BEAM
========================================================= */

const beamGroup =
  new THREE.Group();

scene.add(beamGroup);


/* =========================================================
   5 ДОСОК
========================================================= */

const BOARD_COUNT = 5;

const LENGTH = 7.2;

const HEIGHT = 3.0;

const BOARD_WIDTH = .52;


/* =========================================================
   ПРОФИЛЬ - ДУБЛЬ 2
========================================================= */

/*
   Гребни стали ниже.

   Было:
   .22

   Сейчас:
   .16
*/

const TONGUE_WIDTH = .19;
const TONGUE_HEIGHT = .16;


/*
   Пазы стали мельче.

   Было:
   .19

   Сейчас:
   .14
*/

const GROOVE_WIDTH = .19;
const GROOVE_DEPTH = .14;


/*
   Скос крайних досок.
*/

const CHAMFER = .18;


/* =========================================================
   REAL WOOD - ДУБЛЬ 3
   Небольшая натуральная текстура древесины.
   Геометрия бруса не меняется.
========================================================= */

function seededRandom(seed){
  let s = seed >>> 0;
  return function(){
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

function woodTexture(base,index){

  const c = document.createElement("canvas");
  c.width = 512;
  c.height = 512;

  const ctx = c.getContext("2d");
  const rnd = seededRandom(1200 + index * 97);

  /* натуральная светлая сосна */
  const palette = [
    ["#e4bd83","#f0d09f","#d5a56b"],
    ["#e8c58e","#f2d5a5","#d8aa70"],
    ["#dfb77d","#edcc99","#d1a066"],
    ["#e6c088","#f0d19f","#d6a46a"],
    ["#e2ba80","#efce9a","#d3a168"]
  ][index];

  const bg = ctx.createLinearGradient(0,0,512,0);
  bg.addColorStop(0,palette[0]);
  bg.addColorStop(.5,palette[1]);
  bg.addColorStop(1,palette[0]);
  ctx.fillStyle = bg;
  ctx.fillRect(0,0,512,512);

  /*
    Широкие годовые слои.
    Они дают рисунок настоящей доски,
    а не набор мелких точек.
  */
  const centerY = 250 + (index-2)*38;

  for(let n=0;n<46;n++){

    const y0 = -120 + n*18 + rnd()*8;
    const amp = 10 + rnd()*24;
    const phase = rnd()*Math.PI*2;

    ctx.beginPath();

    for(let x=0;x<=512;x+=4){

      const distance = (x-256)/256;

      const y =
        y0 +
        Math.sin(x*.010 + phase)*amp*.18 +
        distance*distance*amp +
        Math.sin(x*.003 + phase)*7;

      if(x===0) ctx.moveTo(x,y);
      else ctx.lineTo(x,y);
    }

    ctx.strokeStyle =
      "rgba(104,62,29," + (0.045+rnd()*.055) + ")";

    ctx.lineWidth = .55 + rnd()*.8;
    ctx.stroke();
  }

  /* тонкие продольные волокна */
  for(let n=0;n<115;n++){

    const y = rnd()*512;
    const phase = rnd()*6.28;

    ctx.beginPath();

    for(let x=0;x<=512;x+=8){

      const yy =
        y +
        Math.sin(x*.018+phase)*(1+rnd()*1.2);

      if(x===0) ctx.moveTo(x,yy);
      else ctx.lineTo(x,yy);
    }

    ctx.strokeStyle =
      "rgba(91,54,27," + (0.018+rnd()*.025) + ")";

    ctx.lineWidth = .45;
    ctx.stroke();
  }

  /*
    1-2 небольших натуральных сучка.
    Не делаем россыпь точек.
  */
  const knots = index===1 || index===3 ? 2 : 1;

  for(let k=0;k<knots;k++){

    const x = 90 + rnd()*330;
    const y = 90 + rnd()*330;
    const r = 7 + rnd()*8;

    for(let ring=4;ring>=1;ring--){

      ctx.beginPath();
      ctx.ellipse(
        x,
        y,
        r*ring*1.55,
        r*ring*.72,
        rnd()*.18-.09,
        0,
        Math.PI*2
      );

      ctx.strokeStyle =
        "rgba(91,51,23," + (0.025 + (5-ring)*.025) + ")";

      ctx.lineWidth = .7;
      ctx.stroke();
    }

    const knot = ctx.createRadialGradient(
      x,y,0,
      x,y,r
    );

    knot.addColorStop(0,"rgba(77,43,21,.42)");
    knot.addColorStop(.35,"rgba(111,65,30,.28)");
    knot.addColorStop(1,"rgba(123,73,34,0)");

    ctx.fillStyle = knot;
    ctx.beginPath();
    ctx.ellipse(x,y,r*1.25,r*.72,0,0,Math.PI*2);
    ctx.fill();
  }

  /*
    Очень лёгкая неоднородность древесины.
  */
  for(let n=0;n<120;n++){
    ctx.fillStyle =
      "rgba(94,57,30," + (0.008+rnd()*.012) + ")";
    ctx.fillRect(rnd()*512,rnd()*512,.6,.6);
  }

  const texture = new THREE.CanvasTexture(c);

  texture.colorSpace = THREE.SRGBColorSpace;
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;

  /* небольшой рисунок, без заметной плитки */
  texture.repeat.set(1.15,1);

  texture.offset.set(
    (index*.137)%1,
    (index*.071)%1
  );

  if(renderer.capabilities.getMaxAnisotropy){
    texture.anisotropy =
      Math.min(4,renderer.capabilities.getMaxAnisotropy());
  }

  texture.needsUpdate = true;

  return texture;
}


/* =========================================================
   END GRAIN - ТОРЕЦ
========================================================= */

function endTexture(index){

  const c = document.createElement("canvas");
  c.width = 512;
  c.height = 512;

  const ctx = c.getContext("2d");
  const rnd = seededRandom(7400 + index*131);

  const bg = ctx.createLinearGradient(0,0,512,512);

  bg.addColorStop(0,"#efd09d");
  bg.addColorStop(.48,"#ddb27a");
  bg.addColorStop(1,"#f0d3a4");

  ctx.fillStyle = bg;
  ctx.fillRect(0,0,512,512);

  const centers = [
    [405,355],
    [75,330],
    [255,360],
    [415,340],
    [95,275]
  ];

  const cx = centers[index][0];
  const cy = centers[index][1];

  /*
    Кольца чуть неровные,
    чтобы торец не выглядел нарисованным циркулем.
  */
  for(let r=16;r<650;r+=9){

    ctx.beginPath();

    const steps = 90;

    for(let s=0;s<=steps;s++){

      const a = s/steps*Math.PI*2;

      const wobble =
        Math.sin(a*3 + r*.021)*1.8 +
        Math.sin(a*7 + index)*.9;

      const rr = r + wobble;

      const px = cx + Math.cos(a)*rr*.76;
      const py = cy + Math.sin(a)*rr;

      if(s===0) ctx.moveTo(px,py);
      else ctx.lineTo(px,py);
    }

    ctx.strokeStyle =
      "rgba(96,58,29," + (0.075+rnd()*.055) + ")";

    ctx.lineWidth = .7 + rnd()*.55;
    ctx.stroke();
  }

  /* тонкие древесные лучи */
  for(let n=0;n<16;n++){

    const a = rnd()*Math.PI*2;
    const len = 220+rnd()*320;

    ctx.beginPath();
    ctx.moveTo(cx,cy);
    ctx.lineTo(
      cx+Math.cos(a)*len,
      cy+Math.sin(a)*len
    );

    ctx.strokeStyle = "rgba(96,58,29,.025)";
    ctx.lineWidth = .5;
    ctx.stroke();
  }

  const texture = new THREE.CanvasTexture(c);

  texture.colorSpace = THREE.SRGBColorSpace;

  if(renderer.capabilities.getMaxAnisotropy){
    texture.anisotropy =
      Math.min(4,renderer.capabilities.getMaxAnisotropy());
  }

  texture.needsUpdate = true;

  return texture;
}


/* =========================================================
   ВНУТРЕННЯЯ ДОСКА

              ┌───┐
       ───────┘   └───────
       │                 │
       │                 │
       │                 │
       ───────┐   ┌───────
              └───┘

   Гребень и паз строго по центру.
========================================================= */

function innerBoardShape(){

  const w =
    BOARD_WIDTH;

  const h =
    HEIGHT;

  const tw =
    TONGUE_WIDTH;

  const th =
    TONGUE_HEIGHT;

  const gw =
    GROOVE_WIDTH;

  const gd =
    GROOVE_DEPTH;


  const s =
    new THREE.Shape();


  /*
     ЛЕВЫЙ НИЗ
  */

  s.moveTo(
    -w/2,
    -h/2
  );


  /*
     ДО ПАЗА
  */

  s.lineTo(
    -gw/2,
    -h/2
  );


  /*
     ПАЗ
  */

  s.lineTo(
    -gw/2,
    -h/2 + gd
  );

  s.lineTo(
    gw/2,
    -h/2 + gd
  );

  s.lineTo(
    gw/2,
    -h/2
  );


  /*
     ПРАВЫЙ НИЗ
  */

  s.lineTo(
    w/2,
    -h/2
  );


  /*
     ПРАВАЯ СТЕНКА
  */

  s.lineTo(
    w/2,
    h/2
  );


  /*
     К ГРЕБНЮ
  */

  s.lineTo(
    tw/2,
    h/2
  );


  /*
     ГРЕБЕНЬ
  */

  s.lineTo(
    tw/2,
    h/2 + th
  );

  s.lineTo(
    -tw/2,
    h/2 + th
  );

  s.lineTo(
    -tw/2,
    h/2
  );


  /*
     ЛЕВЫЙ ВЕРХ
  */

  s.lineTo(
    -w/2,
    h/2
  );


  s.closePath();


  return s;

}


/* =========================================================
   КРАЙНЯЯ ДОСКА 1

   СКОС СЛЕВА - НАРУЖУ

        ╲────────
         │
         │
         │
        ╱────────

========================================================= */

function leftOuterShape(){

  const w =
    BOARD_WIDTH;

  const h =
    HEIGHT;


  const s =
    new THREE.Shape();


  /*
     Начинаем после нижнего скоса.
  */

  s.moveTo(
    -w/2 + CHAMFER,
    -h/2
  );


  /*
     НИЖНЯЯ ГРАНЬ
  */

  s.lineTo(
    w/2,
    -h/2
  );


  /*
     ВНУТРЕННЯЯ СТОРОНА
     ПОЛНОСТЬЮ ПРЯМАЯ
  */

  s.lineTo(
    w/2,
    h/2
  );


  /*
     ВЕРХ
  */

  s.lineTo(
    -w/2 + CHAMFER,
    h/2
  );


  /*
     ВЕРХНИЙ ВНЕШНИЙ СКОС
  */

  s.lineTo(
    -w/2,
    h/2 - CHAMFER
  );


  /*
     НАРУЖНАЯ СТЕНКА
  */

  s.lineTo(
    -w/2,
    -h/2 + CHAMFER
  );


  /*
     НИЖНИЙ ВНЕШНИЙ СКОС
  */

  s.lineTo(
    -w/2 + CHAMFER,
    -h/2
  );


  s.closePath();


  return s;

}


/* =========================================================
   КРАЙНЯЯ ДОСКА 5

   СКОС СПРАВА - НАРУЖУ

   --------╱
          │
          │
          │
   --------╲

========================================================= */

function rightOuterShape(){

  const w =
    BOARD_WIDTH;

  const h =
    HEIGHT;


  const s =
    new THREE.Shape();


  /*
     ЛЕВАЯ ВНУТРЕННЯЯ СТОРОНА
  */

  s.moveTo(
    -w/2,
    -h/2
  );


  /*
     НИЖНЯЯ ГРАНЬ
  */

  s.lineTo(
    w/2 - CHAMFER,
    -h/2
  );


  /*
     НИЖНИЙ НАРУЖНЫЙ СКОС
  */

  s.lineTo(
    w/2,
    -h/2 + CHAMFER
  );


  /*
     НАРУЖНАЯ СТЕНКА
  */

  s.lineTo(
    w/2,
    h/2 - CHAMFER
  );


  /*
     ВЕРХНИЙ НАРУЖНЫЙ СКОС
  */

  s.lineTo(
    w/2 - CHAMFER,
    h/2
  );


  /*
     ВЕРХНЯЯ ГРАНЬ
  */

  s.lineTo(
    -w/2,
    h/2
  );


  /*
     ВНУТРЕННЯЯ СТОРОНА
     ПРЯМАЯ
  */

  s.lineTo(
    -w/2,
    -h/2
  );


  s.closePath();


  return s;

}


/* =========================================================
   EXTRUDE
========================================================= */

function extrudeBoard(shape){

  const geo =
    new THREE.ExtrudeGeometry(
      shape,
      {

        depth:LENGTH,

        bevelEnabled:true,

        bevelSegments:1,

        bevelSize:.008,

        bevelThickness:.008,

        steps:1,

        curveSegments:1

      }
    );


  /*
     Длина бруса идёт по X.
  */

  geo.rotateY(
    Math.PI/2
  );


  geo.translate(
    -LENGTH/2,
    0,
    0
  );


  geo.computeVertexNormals();


  return geo;

}


/* =========================================================
   CREATE BOARDS
========================================================= */

const colors = [

  "#e4bd83",

  "#e8c58e",

  "#dfb77d",

  "#e6c088",

  "#e2ba80"

];


const boards = [];


for(let i=0;i<BOARD_COUNT;i++){


  let shape;


if(i===0){

  shape =
    rightOuterShape();

}

else if(i===4){

  shape =
    leftOuterShape();

}

else{

  shape =
    innerBoardShape();

}


  const geometry =
    extrudeBoard(shape);


  const sideMaterial =
    new THREE.MeshStandardMaterial({

      map:
        woodTexture(
          colors[i],
          i
        ),

      roughness:.67,

      metalness:0

    });


  const endMaterial =
    new THREE.MeshStandardMaterial({

      map:
        endTexture(i),

      roughness:.73,

      metalness:0

    });


  const board =
    new THREE.Mesh(
      geometry,
      [
        endMaterial,
        sideMaterial
      ]
    );


  board.castShadow = true;

  board.receiveShadow = true;


  /*
     =====================================================
     ФИНАЛЬНОЕ ПОЛОЖЕНИЕ

     НИКАКИХ ПРОСВЕТОВ.

     5 ДОСОК СОПРИКАСАЮТСЯ
     ГРАНЬ К ГРАНИ.
     =====================================================
  */

  const finalZ =
    (
      i - 2
    ) *
    BOARD_WIDTH;


  /*
     Начальное разнесённое положение.
  */

  const startZ =
    (
      i - 2
    ) *
    1.25;


  const startX =
    Math.cos(
      i*1.4
    ) *
    .28;


  const startY =
    Math.sin(
      i*1.2
    ) *
    .42;


  board.userData = {

    finalZ:finalZ,

    startZ:startZ,

    startX:startX,

    startY:startY,

    startRX:
      (i-2)*.018,

    startRY:
      (i-2)*.025,

    startRZ:
      Math.sin(i)*.045,

    delay:
      Math.abs(i-2)*.025

  };


  beamGroup.add(board);

  boards.push(board);

}


/* =========================================================
   BASE ROTATION
========================================================= */

const BASE_X =
  -.13;

const BASE_Y =
  -.70;

const BASE_Z =
  .018;


let baseY =
  BASE_Y;


beamGroup.rotation.set(
  BASE_X,
  BASE_Y,
  BASE_Z
);


/* =========================================================
   ASSEMBLY
========================================================= */

let assembly = 0;


function setAssembly(value){

  assembly =
    clamp(
      value,
      0,
      1
    );


  boards.forEach(function(board){

    const d =
      board.userData;


    const local =
      clamp(
        (
          assembly -
          d.delay
        ) /
        .82,
        0,
        1
      );


    const t =
      smootherstep(local);


    board.position.x =
      lerp(
        d.startX,
        0,
        t
      );


    board.position.y =
      lerp(
        d.startY,
        0,
        t
      );


    board.position.z =
      lerp(
        d.startZ,
        d.finalZ,
        t
      );


    board.rotation.x =
      lerp(
        d.startRX,
        0,
        t
      );


    board.rotation.y =
      lerp(
        d.startRY,
        0,
        t
      );


    board.rotation.z =
      lerp(
        d.startRZ,
        0,
        t
      );

  });


  /*
     После сборки слегка поворачиваем,
     чтобы хорошо было видно:

     3 гребня
     +
     торец
     +
     длину бруса.
  */

  const reveal =
    smootherstep(
      clamp(
        (assembly-.78)/.22,
        0,
        1
      )
    );


  baseY =
    lerp(
      BASE_Y,
      -.80,
      reveal
    );


  progressBar.style.width =
    Math.round(
      assembly*100
    ) + "%";


  if(assembly>.965){

    progress.classList.add(
      "is-hidden"
    );

    hint.classList.add(
      "is-visible"
    );

    canvas.style.cursor =
      "grab";

  }

  else{

    progress.classList.remove(
      "is-hidden"
    );

    hint.classList.remove(
      "is-visible"
    );

    canvas.style.cursor =
      "default";

  }

}


/* =========================================================
   SCROLL
========================================================= */

let ticking = false;


function updateScroll(){

  const rect =
    section.getBoundingClientRect();


  const max =
    section.offsetHeight -
    window.innerHeight;


  if(max<=0){

    ticking=false;

    return;

  }


  const sectionProgress =
    clamp(
      -rect.top/max,
      0,
      1
    );


  const value =
    clamp(
      (
        sectionProgress-.05
      ) /
      .70,
      0,
      1
    );


  setAssembly(value);


  ticking=false;

}


function onScroll(){

  if(!beamRunning || ticking) return;


  ticking=true;


  scrollFrame=requestAnimationFrame(function(){
    scrollFrame=null;
    if(beamRunning) updateScroll();
    else ticking=false;
  });

}


/* =========================================================
   ROTATION
========================================================= */

let targetRX = 0;

let targetRY = 0;


let currentRX = 0;

let currentRY = 0;


let pointerActive = false;

let startX = 0;

let startY = 0;

let lastX = 0;

let lastY = 0;

let gesture = null;


canvas.addEventListener(
  "pointerdown",
  function(e){

    /*
       Пока брус собирается,
       canvas НЕ блокирует скролл.
    */

    if(assembly<.96) return;


    pointerActive=true;

    gesture=null;


    startX =
      e.clientX;

    startY =
      e.clientY;


    lastX =
      e.clientX;

    lastY =
      e.clientY;

  }
);


canvas.addEventListener(
  "pointermove",
  function(e){

    if(!pointerActive) return;


    const totalX =
      e.clientX -
      startX;


    const totalY =
      e.clientY -
      startY;


    if(
      gesture===null &&
      (
        Math.abs(totalX)>8 ||
        Math.abs(totalY)>8
      )
    ){

      /*
         Горизонтальный жест:
         вращаем.

         Вертикальный:
         оставляем странице.
      */

      if(
        Math.abs(totalX) >
        Math.abs(totalY)*1.15
      ){

        gesture =
          "rotate";

      }

      else{

        gesture =
          "scroll";

      }

    }


    if(
      gesture!=="rotate"
    ){

      return;

    }


    const dx =
      e.clientX -
      lastX;


    const dy =
      e.clientY -
      lastY;


    lastX =
      e.clientX;

    lastY =
      e.clientY;


    targetRY +=
      dx*.009;


    targetRX +=
      dy*.0045;


    targetRX =
      clamp(
        targetRX,
        -.58,
        .58
      );


    canvas.style.cursor =
      "grabbing";

  }
);


function endPointer(){

  pointerActive=false;

  gesture=null;


  if(assembly>.96){

    canvas.style.cursor =
      "grab";

  }

}


canvas.addEventListener(
  "pointerup",
  endPointer
);


canvas.addEventListener(
  "pointercancel",
  endPointer
);


/* =========================================================
   ZOOM
========================================================= */

let cameraScale =
  1;


let targetCameraScale =
  1;


canvas.addEventListener(
  "wheel",
  function(e){

    /*
       Обычный wheel скроллит страницу.

       Ctrl + wheel увеличивает 3D.
    */

    if(
      assembly<.96 ||
      !e.ctrlKey
    ){

      return;

    }


    e.preventDefault();


    targetCameraScale +=
      e.deltaY*.001;


    targetCameraScale =
      clamp(
        targetCameraScale,
        .80,
        1.22
      );

  },
  {
    passive:false
  }
);


/* =========================================================
   PINCH
========================================================= */

let pinchDistance =
  0;


let pinchScale =
  1;


function getTouchDistance(touches){

  const dx =
    touches[0].clientX -
    touches[1].clientX;


  const dy =
    touches[0].clientY -
    touches[1].clientY;


  return Math.sqrt(
    dx*dx +
    dy*dy
  );

}


canvas.addEventListener(
  "touchstart",
  function(e){

    if(
      assembly<.96
    ) return;


    if(
      e.touches.length===2
    ){

      pinchDistance =
        getTouchDistance(
          e.touches
        );


      pinchScale =
        targetCameraScale;

    }

  },
  {
    passive:true
  }
);


canvas.addEventListener(
  "touchmove",
  function(e){

    if(
      assembly<.96 ||
      e.touches.length!==2
    ){

      return;

    }


    e.preventDefault();


    const distance =
      getTouchDistance(
        e.touches
      );


    targetCameraScale =
      clamp(
        pinchScale *
        (
          pinchDistance /
          distance
        ),
        .80,
        1.22
      );

  },
  {
    passive:false
  }
);


/* =========================================================
   RESIZE
========================================================= */

function resize(){

  const container =
    canvas.parentElement;


  const w =
    container.clientWidth;


  const h =
    container.clientHeight;


  if(
    w<1 ||
    h<1
  ){

    return;

  }


  renderer.setSize(
    w,
    h,
    false
  );


  camera.aspect =
    w/h;


  camera.fov =
    window.innerWidth<=760
      ? 41
      : 34;


  camera.updateProjectionMatrix();

}


/* =========================================================
   CAMERA
========================================================= */

function updateCamera(){

  if(
    window.innerWidth<=760
  ){

    camera.position.set(
      8.4*cameraScale,
      4.15*cameraScale,
      10.8*cameraScale
    );

  }

  else{

    camera.position.set(
      8.0*cameraScale,
      4.55*cameraScale,
      11.4*cameraScale
    );

  }


  camera.lookAt(
    0,
    0,
    0
  );

}


/* =========================================================
   ANIMATION
========================================================= */

function animate(){

  beamFrame=null;
  if(!beamRunning || document.hidden) return;


  currentRX +=
    (
      targetRX -
      currentRX
    )*.085;


  currentRY +=
    (
      targetRY -
      currentRY
    )*.085;


  let idle = 0;


  if(
    assembly>.97 &&
    !pointerActive
  ){

    idle =
      Math.sin(
        performance.now()*.0004
      )*.03;

  }


  beamGroup.rotation.x =
    BASE_X +
    currentRX;


  beamGroup.rotation.y =
    baseY +
    currentRY +
    idle;


  beamGroup.rotation.z =
    BASE_Z;


  cameraScale +=
    (
      targetCameraScale -
      cameraScale
    )*.08;


  updateCamera();


  renderer.render(
    scene,
    camera
  );

  if(beamRunning) beamFrame=requestAnimationFrame(animate);

}


/* =========================================================
   INIT
========================================================= */

window.addEventListener(
  "scroll",
  onScroll,
  {
    passive:true
  }
);


window.addEventListener(
  "resize",
  function(){
    if(!beamRunning) return;
    resize();
    onScroll();
  }
);


resize();

setAssembly(0);

updateScroll();

function pause(){
  beamRunning=false;
  if(beamFrame!==null) cancelAnimationFrame(beamFrame);
  if(scrollFrame!==null) cancelAnimationFrame(scrollFrame);
  beamFrame=null;
  scrollFrame=null;
  ticking=false;
}

function resume(){
  if(beamRunning || document.hidden) return;
  beamRunning=true;
  resize();
  updateScroll();
  animate();
}

return {pause:pause,resume:resume};


}


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

mountLazyBeam(initBeam);
})();
