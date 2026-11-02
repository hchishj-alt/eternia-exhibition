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
  /* 구글 폼으로 기록을 받고(쓰기), 응답 시트를 CSV로 읽어 옴(읽기). Apps Script 권한 없이 동작 */
  var FORM_URL = 'https://docs.google.com/forms/d/e/1FAIpQLSc-yjfxjunhICA8z3XGYpK7-4Abj2v_yhRH-Rm-0xWy5q0QDg/formResponse';
  var FORM_ENTRY = 'entry.1467654799';
  var SHEET_CSV = 'https://docs.google.com/spreadsheets/d/1-8mWSMaEJUf_1IqdzUoMwVQ4oqoUSEBEVckebaYgi5M/pub?gid=1776921462&single=true&output=csv';
  var RECORD_URL = FORM_URL;
  var SITES = ['invitation', 'hwansang', 'eternia'];
  var ACTIONS = ['view', 'heart', 'share', 'download', 'calendar', 'poster', 'instagram', 'open_work', 'map', 'copy_address', 'click'];

  var store = {
    get: function (k) { try { return localStorage.getItem(k); } catch (e) { return null; } },
    set: function (k, v) { try { localStorage.setItem(k, v); } catch (e) {} }
  };
  var vid = store.get('grad_vid');
  if (!vid) { vid = 'v' + Date.now().toString(36) + Math.random().toString(36).slice(2, 8); store.set('grad_vid', vid); }

  var listeners = [], lastStats = null, statsPromise = null, lastRows = null, localExtra = [];
  function emit(stats) { if (!stats) return; lastStats = stats; listeners.forEach(function (fn) { try { fn(stats); } catch (e) {} }); }

  function clip(v, n) { return String(v == null ? '' : v).replace(/[\u0000-\u001f]/g, ' ').trim().slice(0, n); }
  function post(kind, data) {
    var payload = { k: kind, d: data || {}, v: vid };
    var body = new URLSearchParams(); body.append(FORM_ENTRY, JSON.stringify(payload).slice(0, 2000));
    localExtra.push({ time: new Date(), k: kind, d: payload.d, v: vid });
    if (lastRows) emit(buildStats(lastRows.concat(localExtra)));
    return fetch(FORM_URL, { method: 'POST', mode: 'no-cors', keepalive: true, body: body })
      .then(function () { return { ok: true, stats: lastStats }; })
      .catch(function () { return { ok: false, error: 'network' }; });
  }

  /* CSV 파서 (따옴표·줄바꿈 처리) */
  function parseCSV(t) {
    var rows = [], row = [], f = '', q = false;
    for (var i = 0; i < t.length; i++) {
      var c = t[i];
      if (q) { if (c === '"') { if (t[i + 1] === '"') { f += '"'; i++; } else q = false; } else f += c; }
      else if (c === '"') q = true;
      else if (c === ',') { row.push(f); f = ''; }
      else if (c === '\n' || c === '\r') { if (c === '\r' && t[i + 1] === '\n') i++; row.push(f); rows.push(row); row = []; f = ''; }
      else f += c;
    }
    if (f || row.length) { row.push(f); rows.push(row); }
    return rows;
  }
  function toRecords(csv) {
    return parseCSV(csv).slice(1).map(function (r) {
      try { var p = JSON.parse(r[1] || '{}'); return { time: r[0], k: p.k, d: p.d || {}, v: p.v, hidden: !!(r[2] && r[2].trim()) }; } catch (e) { return null; }
    }).filter(Boolean);
  }
  function buildStats(recs) {
    var counts = {}; SITES.forEach(function (s) { counts[s] = {}; ACTIONS.forEach(function (a) { counts[s][a] = 0; }); });
    var st = { counts: counts, guestbook: 0, lab: 0, eternia: 0 };
    recs.forEach(function (r) {
      if (r.k === 'event') {
        var s = r.d.site, a = r.d.action;
        if (counts[s] && counts[s][a] !== undefined) counts[s][a] += a === 'heart' ? Math.max(1, Math.min(50, parseInt(r.d.target, 10) || 1)) : 1;
      } else if (st[r.k] !== undefined) st[r.k]++;
    });
    return st;
  }
  function fmtTime(t) {
    var d = t instanceof Date ? t : null;
    if (!d) { var m = String(t).match(/(\d{4})\D+(\d{1,2})\D+(\d{1,2})\D+(오전|오후)?\s*(\d{1,2}):(\d{2})/); if (!m) return String(t).slice(5, 16);
      var h = +m[5]; if (m[4] === '오후' && h < 12) h += 12; if (m[4] === '오전' && h === 12) h = 0;
      return ('0' + m[2]).slice(-2) + '.' + ('0' + m[3]).slice(-2) + ' ' + ('0' + h).slice(-2) + ':' + m[6]; }
    return ('0' + (d.getMonth() + 1)).slice(-2) + '.' + ('0' + d.getDate()).slice(-2) + ' ' + ('0' + d.getHours()).slice(-2) + ':' + ('0' + d.getMinutes()).slice(-2);
  }
  function load() {
    if (!statsPromise) statsPromise = fetch(SHEET_CSV + '&t=' + Math.floor(Date.now() / 60000), { cache: 'no-store' })
      .then(function (r) { if (!r.ok) throw 0; return r.text(); })
      .then(function (csv) {
        lastRows = toRecords(csv);
        var all = lastRows.concat(localExtra), stats = buildStats(all);
        emit(stats);
        var gb = lastRows.filter(function (r) { return r.k === 'guestbook' && !r.hidden && r.d.name && r.d.message; })
          .slice(-40).reverse().map(function (r) { return { time: fmtTime(r.time), name: clip(r.d.name, 20), message: clip(r.d.message, 300), site: r.d.site }; });
        return { ok: true, stats: stats, guestbook: gb, records: lastRows };
      })
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
    queued: function () { return []; },
    sheetCsv: SHEET_CSV,
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
