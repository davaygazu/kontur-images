/* KONTUR: opt-in color preview. No photo requests or canvas work before activation. */
(function(){
'use strict';
if(window.__konturPopularColors)return;
window.__konturPopularColors=true;
var script=document.currentScript;
var base=new URL('color-preview/',script.src).href;
function init(){
 var modal=document.getElementById('konturProjectModal');
 var main=document.getElementById('konturGalleryMain');
 var title=document.getElementById('konturModalTitle');
 if(!modal||!main||!title)return;
 var gallery=main.parentElement,cache={},frame=null,controller=null,key='',active=false,generation=0;
 var style=document.createElement('style');
 style.textContent='.kontur-color-toolbar{display:flex;flex-wrap:wrap;align-items:center;gap:10px;margin:0 0 12px}.kontur-color-button{font:600 13px TildaSans,Arial,sans-serif;border:1px solid #096041;border-radius:999px;background:#096041;color:#fff;padding:11px 18px;cursor:pointer}.kontur-color-button:focus-visible{outline:2px solid #096041;outline-offset:3px}.kontur-color-button:disabled{opacity:.6;cursor:wait}.kontur-color-status{font:12px/1.4 TildaSans,Arial,sans-serif;color:#667068}.kontur-color-frame{display:block;border:0;width:100%;height:700px;background:#fff;border-radius:16px}.kontur-color-active>#konturGalleryMain,.kontur-color-active>#konturModalThumbs{display:none!important}';
 document.head.appendChild(style);
 var row=document.createElement('div');row.className='kontur-color-toolbar';
 var button=document.createElement('button');button.type='button';button.className='kontur-color-button';button.textContent='Подобрать цвет дома';button.setAttribute('aria-expanded','false');
 var status=document.createElement('span');status.className='kontur-color-status';status.setAttribute('role','status');
 row.append(button,status);gallery.insertBefore(row,main);
 function infer(){var t=title.textContent;return t.indexOf('83,52')>=0?'igora':t.indexOf('125,48')>=0?'leon':t.indexOf('141,80')>=0?'kvartsi':'';}
 function stop(){generation++;if(controller)controller.abort();controller=null;if(frame)frame.remove();frame=null;active=false;gallery.classList.remove('kontur-color-active');button.disabled=false;button.textContent='Подобрать цвет дома';button.setAttribute('aria-expanded','false');status.textContent='';}
 function sync(){var next=infer();if(!modal.classList.contains('is-open')||key!==next)stop();key=next;row.hidden=!key;}
 button.addEventListener('click',async function(){
  if(active){stop();return;}
  key=infer();if(!key)return;
  var target=key,ticket=++generation;button.disabled=true;status.textContent='Подготавливаем цвета…';controller=new AbortController();
  try{
   var html=cache[target];
   if(!html){var response=await fetch(base+target+'.html',{signal:controller.signal,credentials:'omit'});if(!response.ok)throw Error('HTTP '+response.status);html=await response.text();if(!html.startsWith('<!doctype html>'))throw Error('Invalid preview');cache[target]=html;}
   if(ticket!==generation||!modal.classList.contains('is-open'))return;
   frame=document.createElement('iframe');frame.className='kontur-color-frame';frame.title='Подбор цвета дома';frame.setAttribute('sandbox','allow-scripts');frame.setAttribute('referrerpolicy','no-referrer');frame.srcdoc=html;gallery.insertBefore(frame,main);
   active=true;gallery.classList.add('kontur-color-active');button.textContent='Вернуться к фотографиям';button.setAttribute('aria-expanded','true');status.textContent='Цвет меняется только на главном фото';
  }catch(error){if(error.name!=='AbortError')status.textContent='Не удалось загрузить палитру. Нажмите ещё раз.';}
  finally{if(ticket===generation){button.disabled=false;controller=null;}}
 });
 window.addEventListener('message',function(event){if(!frame||event.source!==frame.contentWindow||!event.data||event.data.type!=='kontur-color-height')return;var h=Number(event.data.height);if(Number.isFinite(h)&&h>0&&h<=5000)frame.style.height=Math.ceil(h)+'px';});
 new MutationObserver(sync).observe(modal,{attributes:true,attributeFilter:['class']});
 new MutationObserver(sync).observe(title,{childList:true,characterData:true,subtree:true});
 sync();
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();
