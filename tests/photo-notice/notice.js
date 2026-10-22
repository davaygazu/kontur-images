(function () {
  'use strict';
  if (window.__konturPhotoNotice || !('IntersectionObserver' in window)) return;
  window.__konturPhotoNotice = true;
  var key = 'kontur-photo-notice-v1';
  try { if (sessionStorage.getItem(key)) return; } catch (_) {}
  var notice = document.getElementById('kontur-photo-notice');
  if (!notice) return;
  // Escape Tilda record stacking/overflow contexts without changing document flow.
  document.body.appendChild(notice);
  var records = new Map(), shown = false, closed = false, refreshTimer = 0;
  function source(img) {
    var current = img.currentSrc || '';
    return current && !/^data:/.test(current) ? current : (img.getAttribute('src') || current);
  }
  function eligible(img) {
    return /^https:\/\/raw\.githubusercontent\.com\/davaygazu\/kontur-images\//.test(source(img));
  }
  function visible(img) {
    if (document.hidden || !img.isConnected) return false;
    var r = img.getBoundingClientRect();
    if (r.width < 40 || r.height < 40 || r.bottom <= 0 || r.right <= 0 || r.top >= innerHeight || r.left >= innerWidth) return false;
    for (var el = img; el && el !== document; el = el.parentElement) {
      var style = getComputedStyle(el);
      if (style.display === 'none' || style.visibility === 'hidden' || Number(style.opacity) === 0) return false;
    }
    return true;
  }
  function stop(rec) { clearTimeout(rec.timer); rec.timer = 0; }
  function pending(img) { return eligible(img) && visible(img) && (!img.complete || img.naturalWidth === 0); }
  function reveal(img) {
    if (shown || closed || !pending(img)) return;
    shown = true;
    try { sessionStorage.setItem(key, '1'); } catch (_) {}
    notice.hidden = false;
    records.forEach(stop);
  }
  function hideWhenReady() {
    if (!shown || closed) return;
    var waiting = false;
    records.forEach(function (_, img) { if (pending(img)) waiting = true; });
    if (!waiting) notice.hidden = true;
  }
  function check(img, rec) {
    var src = source(img);
    if (rec.src !== src) { stop(rec); rec.src = src; }
    if (!pending(img)) { stop(rec); hideWhenReady(); return; }
    if (shown || closed) return;
    if (img.complete && img.naturalWidth === 0) { reveal(img); return; }
    if (!rec.timer) rec.timer = setTimeout(function () { rec.timer = 0; reveal(img); }, 6000);
  }
  var observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      var rec = records.get(entry.target);
      if (!rec) return;
      if (entry.isIntersecting) check(entry.target, rec); else { stop(rec); hideWhenReady(); }
    });
  });
  function register(img) {
    if (!eligible(img)) return;
    if (records.has(img)) { check(img, records.get(img)); return; }
    var rec = {timer: 0, src: source(img)};
    records.set(img, rec);
    img.addEventListener('load', function () { check(img, rec); });
    img.addEventListener('error', function () { check(img, rec); });
    observer.observe(img);
    check(img, rec);
  }
  function scan(node) {
    if (node.nodeType !== 1) return;
    if (node.tagName === 'IMG') register(node);
    node.querySelectorAll('img').forEach(register);
  }
  function refresh() {
    clearTimeout(refreshTimer);
    // Also covers opacity transitions that begin with an invisible slide.
    refreshTimer = setTimeout(function () {
      records.forEach(function (rec, img) {
        if (!img.isConnected) { stop(rec); observer.unobserve(img); records.delete(img); }
        else check(img, rec);
      });
    }, 250);
  }
  scan(document.body);
  var mutations = new MutationObserver(function (changes) {
    var changed = false;
    changes.forEach(function (change) {
      if (notice.contains(change.target)) return;
      if (change.type === 'childList') {
        change.addedNodes.forEach(scan);
        if (change.removedNodes.length) changed = true;
      } else {
        var target = change.target;
        if (target.tagName === 'IMG') { register(target); changed = true; }
        else if (target.querySelector('img')) changed = true;
      }
    });
    if (changed) refresh();
  });
  mutations.observe(document.body, {subtree: true, childList: true, attributes: true,
    attributeFilter: ['src', 'srcset', 'sizes', 'class', 'style', 'hidden']});
  document.addEventListener('visibilitychange', function () {
    if (document.hidden) records.forEach(stop); else refresh();
  });
  notice.querySelector('button').addEventListener('click', function () {
    closed = true;
    notice.hidden = true;
    clearTimeout(refreshTimer);
    records.forEach(stop);
    observer.disconnect();
    mutations.disconnect();
  });
})();
