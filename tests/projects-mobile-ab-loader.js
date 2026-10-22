/* Isolated Tilda A/B loader. Use only on a separate test page. */
(function(){
  var anchor=document.currentScript;
  var shell=document.createElement('div');
  shell.innerHTML='<nav style="padding:18px 20px;background:#f0f3f0;font:16px Arial,sans-serif"><a href="?kp_photos=original" style="color:#096041">Текущая версия</a> &nbsp; / &nbsp; <a href="?kp_photos=mobile" style="color:#096041">Облегчённая версия</a><p id="kpABStatus" style="margin:10px 0 0"></p></nav>';
  anchor.parentNode.insertBefore(shell,anchor);
  var original=new URLSearchParams(location.search).get('kp_photos')==='original';
  shell.querySelector('#kpABStatus').textContent=original?'Сейчас: текущая версия фотографий':'Сейчас: облегчённые фотографии для экранов до 900 px';
  var script=document.createElement('script');
  script.src=original?'https://cdn.jsdelivr.net/gh/davaygazu/kontur-images@a5b5141f7d193be8f5fe0d7d185f2145e07b2d40/kontur-projects-webp.js':'https://cdn.jsdelivr.net/gh/davaygazu/kontur-images@a0d2528eb41bfdaedc0a97cbc76e29f05312cdbd/tests/projects-mobile-webp.js';
  script.onerror=function(){shell.querySelector('#kpABStatus').textContent='Не удалось загрузить скрипт. Обновите страницу.';};
  shell.appendChild(script);
})();
