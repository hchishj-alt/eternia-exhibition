/*!
 * 김하진 졸업전시 통합 기록 (초대장 · 환상선택 · ETERNIA 공용)
 * ------------------------------------------------------------------
 * 1) records/README.md 대로 구글 Apps Script 웹 앱을 배포하고
 * 2) 아래 RECORD_URL 에 웹 앱 주소(https://script.google.com/macros/s/.../exec)를 넣으면
 *    세 사이트의 방명록 · 알고리즘랩 · 이터니아 기록 · 하트/공유/다운로드 수가 한 시트에 쌓입니다.
 * 주소가 비어 있으면 아무것도 전송하지 않고, 하트 버튼은 화면 연출만 합니다.
 */
(function () {
  'use strict';
  var RECORD_URL = '';

  var store = {
    get: function (k) { try { return localStorage.getItem(k); } catch (e) { return null; } },
    set: function (k, v) { try { localStorage.setItem(k, v); } catch (e) {} }
  };
  var vid = store.get('grad_vid');
  if (!vid) { vid = 'v' + Date.now().toString(36) + Math.random().toString(36).slice(2, 8); store.set('grad_vid', vid); }

  var listeners = [], lastStats = null, statsPromise = null;
  function emit(stats) { if (!stats) return; lastStats = stats; listeners.forEach(function (fn) { try { fn(stats); } catch (e) {} }); }

  function post(kind, data) {
    if (!RECORD_URL) return Promise.resolve({ ok: false, error: 'not_configured' });
    return fetch(RECORD_URL, {
      method: 'POST', keepalive: true,
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify({ kind: kind, data: data || {}, vid: vid })
    }).then(function (r) { return r.json(); }).then(function (res) { if (res && res.stats) emit(res.stats); return res; })
      .catch(function () { return { ok: false, error: 'network' }; });
  }
  function load() {
    if (!RECORD_URL) return Promise.resolve(null);
    if (!statsPromise) statsPromise = fetch(RECORD_URL + '?fn=stats').then(function (r) { return r.json(); })
      .then(function (res) { if (res && res.stats) emit(res.stats); return res; })
      .catch(function () { statsPromise = null; return null; });
    return statsPromise;
  }

  /* ---------------- heart widget ---------------- */
  var css = '' +
    '.gr-heart{position:fixed;z-index:40;display:flex;align-items:center;gap:7px;height:46px;padding:0 14px 0 12px;' +
    'background:rgba(243,243,239,.95);border:1px solid #000;color:#191919;font:500 13px/1 "Space Grotesk","Pretendard",system-ui,sans-serif;' +
    'cursor:pointer;-webkit-tap-highlight-color:transparent;-webkit-backdrop-filter:blur(10px);backdrop-filter:blur(10px);' +
    'transition:transform .25s cubic-bezier(.34,1.56,.64,1)}' +
    '.gr-heart:active{transform:scale(.92)}' +
    '.gr-heart svg{width:20px;height:20px;fill:none;stroke:#191919;stroke-width:2;transition:fill .2s}' +
    '.gr-heart.on svg{fill:#ff3d7f;stroke:#ff3d7f}' +
    '.gr-heart.pop svg{animation:grPop .5s cubic-bezier(.34,1.56,.64,1)}' +
    '.gr-heart b{min-width:1ch;font-weight:500}' +
    '.gr-heart.dark{background:rgba(12,13,18,.82);border-color:rgba(255,255,255,.35);color:#f3f3ef}' +
    '.gr-heart.dark svg{stroke:#f3f3ef}' +
    '.gr-fly{position:fixed;z-index:41;pointer-events:none;font-size:18px;color:#ff3d7f;animation:grFly 1.1s ease-out forwards}' +
    '@keyframes grPop{0%{transform:scale(1)}40%{transform:scale(1.45)}100%{transform:scale(1)}}' +
    '@keyframes grFly{0%{opacity:1;transform:translate(0,0) scale(.6)}100%{opacity:0;transform:translate(var(--dx),-90px) scale(1.3) rotate(var(--rot))}}';

  function mountHeart(opt) {
    opt = opt || {};
    var site = opt.site || 'invitation';
    if (!document.getElementById('gr-style')) { var st = document.createElement('style'); st.id = 'gr-style'; st.textContent = css; document.head.appendChild(st); }
    var btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'gr-heart' + (opt.dark ? ' dark' : '');
    btn.setAttribute('aria-label', '하트 남기기');
    btn.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 20.5s-7.5-4.6-9.3-9.2C1.4 8 3.4 4.5 6.9 4.5c2.1 0 3.6 1.2 5.1 3 1.5-1.8 3-3 5.1-3 3.5 0 5.5 3.5 4.2 6.8-1.8 4.6-9.3 9.2-9.3 9.2z"/></svg><b></b>';
    var pos = opt.position || { left: '14px', bottom: '14px' };
    Object.keys(pos).forEach(function (k) { btn.style[k] = pos[k]; });
    (opt.parent || document.body).appendChild(btn);
    var countEl = btn.querySelector('b');
    var key = 'grad_heart_' + site, mineKey = 'grad_hearts_' + site;
    var liked = store.get(key) === '1';
    var mine = parseInt(store.get(mineKey) || '0', 10) || 0;   // 이 브라우저에서 누른 횟수
    var base = null, pending = 0, timer = null;
    function render() { btn.classList.toggle('on', liked); countEl.textContent = base == null ? (mine ? String(mine) : '') : String(base + pending); }
    render();
    onStats(function (s) { if (s.counts && s.counts[site]) { base = s.counts[site].heart; render(); } });
    function flush() { timer = null; if (!pending) return; var n = pending; pending = 0; if (base != null) base += n; event(site, 'heart', String(n)); }
    btn.addEventListener('click', function () {
      burst(btn);
      btn.classList.remove('pop'); void btn.offsetWidth; btn.classList.add('pop');
      // 누르는 만큼 모두 집계 (연타는 0.8초 묶어서 한 번에 전송)
      liked = true; store.set(key, '1');
      mine++; store.set(mineKey, String(mine));
      pending++; render();
      clearTimeout(timer); timer = setTimeout(flush, 800);
    });
    addEventListener('pagehide', flush);
    return btn;
  }
  function burst(el) {
    var r = el.getBoundingClientRect();
    for (var i = 0; i < 6; i++) {
      var h = document.createElement('span');
      h.className = 'gr-fly'; h.textContent = '♥';
      h.style.left = (r.left + 14 + Math.random() * 10) + 'px';
      h.style.top = (r.top + 4) + 'px';
      h.style.setProperty('--dx', (Math.random() * 60 - 30) + 'px');
      h.style.setProperty('--rot', (Math.random() * 60 - 30) + 'deg');
      h.style.animationDelay = (i * 60) + 'ms';
      document.body.appendChild(h);
      setTimeout(function (n) { n.remove(); }, 1400, h);
    }
  }

  /* 방명록 임시 보관: 서버 연결 전/네트워크 끊김 때 남긴 글은 다음 방문 때 자동 전송 */
  var QKEY = 'grad_gb_queue';
  function queued() { try { return JSON.parse(store.get(QKEY) || '[]'); } catch (e) { return []; } }
  function queueGuestbook(name, message, site) { var q = queued(); q.push({ name: name, message: message, site: site || 'invitation' }); store.set(QKEY, JSON.stringify(q.slice(-10))); }
  function flushQueue() {
    var q = queued(); if (!RECORD_URL || !q.length) return;
    store.set(QKEY, '[]');
    q.forEach(function (g) { post('guestbook', g).then(function (r) { if (!r || !r.ok) queueGuestbook(g.name, g.message, g.site); }); });
  }
  setTimeout(flushQueue, 1500);

  function event(site, action, target) { return post('event', { site: site, action: action, target: target || '' }); }
  function onStats(fn) { listeners.push(fn); if (lastStats) fn(lastStats); else load(); }

  window.GradRecord = {
    configured: !!RECORD_URL,
    url: RECORD_URL,
    vid: vid,
    event: event,
    guestbook: function (name, message, site) { return post('guestbook', { name: name, message: message, site: site || 'invitation' }); },
    lab: function (d) { return post('lab', d); },
    queueGuestbook: queueGuestbook,
    queued: function () { return RECORD_URL ? [] : queued(); },
    eternia: function (type, detail) { return post('eternia', { type: type, detail: detail }); },
    load: load,
    onStats: onStats,
    mountHeart: mountHeart,
    /** 페이지 방문 1회 기록 (같은 탭에서 새로고침은 다시 세지 않음) */
    view: function (site) {
      var k = 'grad_view_' + site;
      try { if (sessionStorage.getItem(k)) return; sessionStorage.setItem(k, '1'); } catch (e) {}
      event(site, 'view', location.pathname);
    }
  };
})();
