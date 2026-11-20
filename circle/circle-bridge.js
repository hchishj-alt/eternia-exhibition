/* ETERNIA CIRCLE · 공모전용 사본에만 들어가는 연결 스크립트.
   각 페이지(입사지원서 · 3D 전시장 · 임무 보고서)가 바깥 서클 화면(index.html)에
   "지금 어디까지 왔는지"만 알려 줍니다. 원본 사이트에는 없는 파일입니다. */
(function () {
  'use strict';
  if (window.parent === window) return;
  function send(type, data) {
    var m = { src: 'eternia-circle', type: type };
    if (data) for (var k in data) m[k] = data[k];
    try { parent.postMessage(m, '*'); } catch (e) {}
  }
  var lastUser = 0;
  ['pointerdown', 'keydown'].forEach(function (t) {
    addEventListener(t, function () { lastUser = Date.now(); }, true);
  });
  function ready(fn) { if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', fn); else fn(); }

  function exhibit() {
    send('page', { page: 'booth' });
    // 로고 오프닝은 서클의 초대장에서 이미 봤으므로 전시장에서는 바로 로딩으로 넘어갑니다.
    setTimeout(function () { var s = document.getElementById('introSkip'); try { if (s && !s.hidden) s.click(); } catch (e) {} }, 350);
    document.addEventListener('intro:entered', function () { send('ready'); });
    var cur = -1;
    setInterval(function () {
      var t = window.__tour, s; if (!t) return;
      try { s = t.getState(); } catch (e) { return; }
      if (s.current !== cur) { cur = s.current; send('step', { step: cur, user: Date.now() - lastUser < 2500 }); }
    }, 250);
    document.addEventListener('click', function (e) {
      var a = e.target.closest && e.target.closest('a[href="application.html"]');
      if (a) { e.preventDefault(); send('open-application'); }
    }, true);
    var ducked = false;
    addEventListener('message', function (e) {
      var d = e.data; if (!d || d.src !== 'eternia-circle-shell') return;
      var b = document.getElementById('soundToggle');
      if (d.cmd === 'goto' && window.__tour) { try { window.__tour.navigate(d.step); } catch (err) {} }
      if (d.cmd === 'duck' && b && b.getAttribute('aria-pressed') === 'true') { ducked = true; b.click(); }
      if (d.cmd === 'unduck' && b && ducked) { ducked = false; if (b.getAttribute('aria-pressed') !== 'true') b.click(); }
    });
  }

  function application() {
    send('page', { page: 'apply' });
    var d = document.getElementById('submitDialog'), f = document.getElementById('sheet'), sent = false;
    if (!d || !f) return;
    new MutationObserver(function () {
      if (d.dataset.state === 'done' && !sent) {
        sent = true;
        send('applied', { no: (document.getElementById('doneNo') || {}).textContent || '', codename: 'BLOOMING ' + (f.codename.value || ''), division: f.division.value || '' });
      }
      if (d.dataset.state !== 'done') sent = false;
    }).observe(d, { attributes: true, attributeFilter: ['data-state'] });
  }

  function report() {
    send('page', { page: 'report' });
    var done = false;
    new MutationObserver(function () {
      var h = document.querySelector('.screen h1.mc');
      if (h && !done) { done = true; send('reported'); }
      if (!h) done = false;
    }).observe(document.body, { childList: true, subtree: true });
  }

  ready(function () {
    if (document.getElementById('gameIntro')) exhibit();
    else if (document.getElementById('sheet')) application();
    else if (document.querySelector('.app')) report();
  });
})();
