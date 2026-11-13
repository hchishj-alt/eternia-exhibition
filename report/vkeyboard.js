/* ETERNIA 화면 키보드 — 아이패드 시스템 키보드 대신 페이지 안 키보드 (한글 두벌식 조합 + 영문 + 숫자)
   전체화면/웹앱 모드에서 시스템 키보드가 화면을 깨뜨리는 문제를 피하려고 모든 글자 입력칸을 readonly로 막고 이 키보드로 입력. */
(() => {
  const CHO = 'ㄱㄲㄴㄷㄸㄹㅁㅂㅃㅅㅆㅇㅈㅉㅊㅋㅌㅍㅎ';
  const JUNG = 'ㅏㅐㅑㅒㅓㅔㅕㅖㅗㅘㅙㅚㅛㅜㅝㅞㅟㅠㅡㅢㅣ';
  const JONG = ' ㄱㄲㄳㄴㄵㄶㄷㄹㄺㄻㄼㄽㄾㄿㅀㅁㅂㅄㅅㅆㅇㅈㅊㅋㅌㅍㅎ';
  const VV = { 'ㅗㅏ': 'ㅘ', 'ㅗㅐ': 'ㅙ', 'ㅗㅣ': 'ㅚ', 'ㅜㅓ': 'ㅝ', 'ㅜㅔ': 'ㅞ', 'ㅜㅣ': 'ㅟ', 'ㅡㅣ': 'ㅢ' };
  const CC = { 'ㄱㅅ': 'ㄳ', 'ㄴㅈ': 'ㄵ', 'ㄴㅎ': 'ㄶ', 'ㄹㄱ': 'ㄺ', 'ㄹㅁ': 'ㄻ', 'ㄹㅂ': 'ㄼ', 'ㄹㅅ': 'ㄽ', 'ㄹㅌ': 'ㄾ', 'ㄹㅍ': 'ㄿ', 'ㄹㅎ': 'ㅀ', 'ㅂㅅ': 'ㅄ' };
  const isV = c => JUNG.includes(c), isC = c => CHO.includes(c) || 'ㄳㄵㄶㄺㄻㄼㄽㄾㄿㅀㅄ'.includes(c);
  const jongOK = c => c !== ' ' && JONG.includes(c);
  // 자모 배열 → 완성형 글자
  function assemble(j) {
    let out = '', i = 0; const n = j.length;
    while (i < n) {
      const c = j[i];
      if (CHO.includes(c) && i + 1 < n && isV(j[i + 1])) {
        let v = j[i + 1]; i += 2;
        if (i < n && VV[v + j[i]]) { v = VV[v + j[i]]; i++; }
        let t = '';
        if (i < n && jongOK(j[i]) && !(i + 1 < n && isV(j[i + 1]))) {
          t = j[i]; i++;
          if (i < n && CC[t + j[i]] && !(i + 1 < n && isV(j[i + 1]))) { t = CC[t + j[i]]; i++; }
        }
        out += String.fromCharCode(0xAC00 + (CHO.indexOf(c) * 21 + JUNG.indexOf(v)) * 28 + (t ? JONG.indexOf(t) : 0));
      } else if (isV(c)) {
        let v = c; i++;
        if (i < n && VV[v + j[i]]) { v = VV[v + j[i]]; i++; }
        out += v;
      } else { out += c; i++; }
    }
    return out;
  }

  const KO = [['ㅂ', 'ㅈ', 'ㄷ', 'ㄱ', 'ㅅ', 'ㅛ', 'ㅕ', 'ㅑ', 'ㅐ', 'ㅔ'], ['ㅁ', 'ㄴ', 'ㅇ', 'ㄹ', 'ㅎ', 'ㅗ', 'ㅓ', 'ㅏ', 'ㅣ'], ['ㅋ', 'ㅌ', 'ㅊ', 'ㅍ', 'ㅠ', 'ㅜ', 'ㅡ']];
  const KO_S = { 'ㅂ': 'ㅃ', 'ㅈ': 'ㅉ', 'ㄷ': 'ㄸ', 'ㄱ': 'ㄲ', 'ㅅ': 'ㅆ', 'ㅐ': 'ㅒ', 'ㅔ': 'ㅖ' };
  const EN = [['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p'], ['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l'], ['z', 'x', 'c', 'v', 'b', 'n', 'm']];
  const NUM = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0'];

  const css = document.createElement('style');
  css.textContent = `
.vk{position:fixed;left:0;right:0;bottom:0;z-index:9999;background:#15161A;border-top:3px solid #D4F03A;box-shadow:0 -10px 40px #0008;padding:12px max(12px,env(safe-area-inset-left,0px)) calc(14px + env(safe-area-inset-bottom,0px));transform:translateY(105%);transition:transform .28s cubic-bezier(.2,.8,.2,1);user-select:none;-webkit-user-select:none;touch-action:manipulation;font-family:'Pretendard Variable','Noto Sans KR',system-ui,sans-serif}
.vk.on{transform:none}
.vk .bar{display:flex;align-items:center;justify-content:space-between;max-width:1100px;margin:0 auto 10px;color:#8A8F99;font:800 13px/1 'Orbitron',system-ui,sans-serif;letter-spacing:.12em}
.vk .bar b{color:#D4F03A}
.vk .rows{max-width:1100px;margin:0 auto;display:flex;flex-direction:column;gap:8px}
.vk .row{display:flex;gap:8px;justify-content:center}
.vk button{flex:1 1 0;min-width:0;height:clamp(48px,6.2vh,72px);border:0;border-radius:0;background:#2A2C33;color:#fff;font-family:inherit;font-weight:700;font-size:clamp(22px,2.8vh,30px);line-height:1;clip-path:polygon(0 0,calc(100% - 8px) 0,100% 8px,100% 100%,8px 100%,0 calc(100% - 8px));box-shadow:inset 0 -3px 0 #0006;-webkit-tap-highlight-color:transparent;padding:0}
.vk button:active,.vk button.dn{background:#D4F03A;color:#15161A}
.vk button.fn{background:#1E2026;color:#C9CCD3;font-size:clamp(15px,2vh,20px);font-weight:800}
.vk button.fn.lit{color:#D4F03A}
.vk button.w15{flex-grow:1.5}.vk button.w2{flex-grow:2}.vk button.w5{flex-grow:5}
.vk button.ok{background:#D4F03A;color:#15161A}
.vk-tgt{outline:3px solid #D4F03A!important;outline-offset:4px}
#app{transition:transform .28s cubic-bezier(.2,.8,.2,1)}
`;
  document.head.appendChild(css);

  const kb = document.createElement('div'); kb.className = 'vk'; kb.setAttribute('aria-hidden', 'true');
  document.body.appendChild(kb);

  let mode = 'ko', shift = false, tgt = null, prefix = '', jamo = [], lastVal = '';

  const SEL = 'input:not([type]),input[type=text],input[type=search],textarea';
  const lock = root => root.querySelectorAll?.(SEL).forEach(el => { if (!el.dataset.vk) { el.dataset.vk = 1; el.readOnly = true; el.setAttribute('inputmode', 'none'); el.setAttribute('autocomplete', 'off'); } });
  lock(document);
  new MutationObserver(ms => ms.forEach(m => m.addedNodes.forEach(n => { if (n.nodeType === 1) { if (n.matches(SEL)) lock(n.parentNode); else lock(n); } }))).observe(document.body, { childList: true, subtree: true });

  function draw() {
    const letters = mode === 'ko' ? KO.map(r => r.map(k => shift && KO_S[k] ? KO_S[k] : k)) : EN.map(r => r.map(k => shift ? k.toUpperCase() : k));
    const b = (k, cls = '', lab = k) => `<button type="button" data-k="${k}" class="${cls}">${lab}</button>`;
    kb.innerHTML = `<div class="bar"><span>HEXABLOOM <b>INPUT</b> · ${mode === 'ko' ? '한글' : 'ENGLISH'}</span><span>ETERNIA</span></div><div class="rows">
      <div class="row">${NUM.map(k => b(k)).join('')}</div>
      <div class="row">${letters[0].map(k => b(k)).join('')}</div>
      <div class="row">${letters[1].map(k => b(k)).join('')}${b('?')}</div>
      <div class="row">${b('SHIFT', 'fn w15' + (shift ? ' lit' : ''), '⇧')}${letters[2].map(k => b(k)).join('')}${b('!')}${b('BS', 'fn w15', '⌫')}</div>
      <div class="row">${b('LANG', 'fn w15', mode === 'ko' ? '한/<span style="opacity:.5">영</span>' : '<span style="opacity:.5">한</span>/영')}${b(',')}${b('SPACE', 'fn w5', '띄어쓰기')}${b('.')}${b('~')}${b('DONE', 'fn ok w2', '완료')}</div></div>`;
  }

  function sync() { // 다른 코드(빠른 답변 버튼 등)가 값을 바꿨으면 조합 상태 초기화
    if (tgt && tgt.value !== lastVal) { prefix = tgt.value; jamo = []; lastVal = tgt.value; }
  }
  function write(nv) {
    const max = tgt.maxLength > 0 ? tgt.maxLength : Infinity;
    if (nv.length > max) return false;
    tgt.value = nv; lastVal = nv;
    tgt.dispatchEvent(new Event('input', { bubbles: true }));
    if (tgt.tagName === 'TEXTAREA') tgt.scrollTop = tgt.scrollHeight;
    return true;
  }
  const commit = () => { prefix = prefix + assemble(jamo); jamo = []; };

  function press(k) {
    if (!tgt) return;
    sync();
    if (k === 'SHIFT') { shift = !shift; return draw(); }
    if (k === 'LANG') { commit(); mode = mode === 'ko' ? 'en' : 'ko'; shift = false; return draw(); }
    if (k === 'DONE') return close();
    if (k === 'BS') {
      if (jamo.length) { jamo.pop(); write(prefix + assemble(jamo)); }
      else if (prefix.length) { prefix = [...prefix].slice(0, -1).join(''); write(prefix); }
      return;
    }
    const ch = k === 'SPACE' ? ' ' : k;
    if (mode === 'ko' && (CHO.includes(ch) || isV(ch))) {
      jamo.push(ch);
      if (!write(prefix + assemble(jamo))) jamo.pop();
    } else {
      commit();
      if (write(prefix + ch)) prefix += ch;
    }
    if (shift) { shift = false; draw(); }
  }

  function lift() { // 입력칸이 키보드에 가려지면 화면을 위로 올림
    const app = document.getElementById('app'); if (!app || !tgt) return;
    app.style.transform = '';
    const kTop = innerHeight - kb.offsetHeight, r = tgt.getBoundingClientRect();
    const d = r.bottom + 24 - kTop;
    if (d > 0) app.style.transform = `translateY(${-Math.min(d, r.top - 16)}px)`;
  }
  function open(el) {
    if (tgt && tgt !== el) { commit(); tgt.classList.remove('vk-tgt'); }
    tgt = el; prefix = el.value; jamo = []; lastVal = el.value;
    el.classList.add('vk-tgt');
    if (!kb.classList.contains('on')) { shift = false; draw(); kb.classList.add('on'); }
    requestAnimationFrame(() => setTimeout(lift, 30));
  }
  function close() {
    if (tgt) { commit(); tgt.classList.remove('vk-tgt'); try { tgt.blur(); } catch (e) {} }
    tgt = null; jamo = [];
    kb.classList.remove('on');
    const app = document.getElementById('app'); if (app) app.style.transform = '';
  }
  window.ETVK = { open, close, assemble };

  // 키 누름: pointerdown으로 바로 반응 (포커스 뺏기지 않게)
  kb.addEventListener('pointerdown', e => {
    e.preventDefault();
    const b = e.target.closest('button[data-k]'); if (!b) return;
    b.classList.add('dn'); setTimeout(() => b.classList.remove('dn'), 110);
    press(b.dataset.k);
    if (navigator.vibrate) try { navigator.vibrate(8); } catch (_) {}
  });
  kb.addEventListener('click', e => e.preventDefault());

  document.addEventListener('focusin', e => { if (e.target.matches?.(SEL)) { lock(e.target.parentNode || document); open(e.target); } });
  document.addEventListener('pointerdown', e => {
    if (kb.contains(e.target)) return;
    const f = e.target.closest?.(SEL);
    if (f) { lock(f.parentNode); open(f); return; }
    if (tgt && kb.classList.contains('on')) close();
  }, true);
  // 화면이 바뀌어 입력칸이 사라지면 키보드 닫기
  setInterval(() => { if (tgt && !tgt.isConnected) close(); }, 400);
})();
