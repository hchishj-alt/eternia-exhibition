(() => {
  'use strict';
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- 작품 링크: 같은 저장소 안의 기존 사이트 ---------- */
  // 깃허브 Pages 주소가 생기면 url을 그 주소(https://…)로 바꿔도 됩니다.
  const WORKS = {
    eternia:  { title: '01 / ETERNIA',  url: 'https://hchishj-alt.github.io/eternia-exhibition/', needsServer: true },
    hwansang: { title: '02 / 환상선택', url: '../hwansang/index.html' }
  };

  /* ---------- text splitting ---------- */
  $$('[data-split="chars"]').forEach(el => {
    let i = 0;
    const walk = node => {
      [...node.childNodes].forEach(n => {
        if (n.nodeType === 3) {
          const frag = document.createDocumentFragment();
          for (const c of n.textContent) {
            const s = document.createElement('span');
            s.className = 'ch'; s.textContent = c; s.style.setProperty('--i', i++);
            frag.appendChild(s);
          }
          n.replaceWith(frag);
        } else if (n.nodeType === 1) walk(n);
      });
    };
    walk(el);
  });
  $$('[data-split="lines"]').forEach(el => {
    [...el.children].forEach((child, i) => {
      const ln = document.createElement('span');
      ln.className = 'ln';
      child.style.setProperty('--i', i);
      child.replaceWith(ln); ln.appendChild(child);
    });
  });
  $$('.days .day').forEach((d, i) => d.style.setProperty('--i', i));

  /* ---------- hero intro ---------- */
  const hero = $('.hero');
  const startHero = () => {
    document.body.classList.remove('is-loading');
    document.body.classList.add('ready');
    hero.classList.add('ready');
    $$('[data-split], [data-anim]', hero).forEach(el => el.classList.add('in'));
    setTimeout(typeInvite, reduce ? 0 : 1900);
  };
  function typeInvite() {
    const el = $('.typing');
    const text = el.dataset.type, lime = +el.dataset.lime || 0;
    const render = n => {
      const a = text.slice(0, Math.min(n, lime)), b = text.slice(lime, Math.max(n, lime));
      el.innerHTML = (a ? `<b>${a}</b>` : '') + (n > lime ? b : '');
    };
    if (reduce) { render(text.length); return; }
    el.classList.add('typing-on');
    let n = 0;
    const t = setInterval(() => {
      render(++n);
      if (n >= text.length) { clearInterval(t); setTimeout(() => el.classList.remove('typing-on'), 1800); }
    }, 75);
  }
  const heroImgs = $$('img', hero);
  let pending = heroImgs.length;
  const done = () => { if (--pending <= 0) requestAnimationFrame(startHero); };
  heroImgs.forEach(img => (img.complete ? done() : (img.addEventListener('load', done), img.addEventListener('error', done))));
  setTimeout(() => { if (!hero.classList.contains('ready')) startHero(); }, 2500);

  /* ---------- scroll reveals ---------- */
  const targets = $$('[data-split], [data-anim], .work, .days').filter(el => !hero.contains(el));
  if ('IntersectionObserver' in window && !reduce) {
    const io = new IntersectionObserver(entries => {
      entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
    }, { threshold: 0.18, rootMargin: '0px 0px -6% 0px' });
    targets.forEach(el => io.observe(el));
  } else targets.forEach(el => el.classList.add('in'));

  /* ---------- work viewer ---------- */
  const viewer = $('#viewer'), frame = $('#viewerFrame'), loading = $('#viewerLoading');
  function openWork(key, push = true) {
    const w = WORKS[key]; if (!w) return;
    $('#viewerTitle').textContent = w.title;
    $('#viewerOut').href = w.url;
    viewer.className = 'viewer ' + key;
    viewer.hidden = false;
    loading.classList.remove('done');
    // 3D 사이트는 파일을 더블클릭(file://)해서 열면 브라우저가 스크립트를 막아 검은 화면이 됩니다.
    if (w.needsServer && location.protocol === 'file:' && !/^https?:/.test(w.url)) {
      frame.src = 'about:blank';
      loading.innerHTML = '<p class="viewer-note"><b>ETERNIA는 3D 사이트라 파일을 더블클릭해서 열면 보이지 않아요.</b><br>깃허브에 올린 주소나 VS Code Live Server로 초대장을 열면 여기서 바로 보입니다.</p>';
    } else {
      loading.innerHTML = '<span class="spin"></span><span>작품 웹사이트를 불러오는 중</span>';
      frame.src = w.url;
    }
    document.body.classList.add('viewer-open');
    requestAnimationFrame(() => requestAnimationFrame(() => viewer.classList.add('open')));
    if (push) history.pushState({ work: key }, '', '#' + key);
  }
  function closeWork(fromPop = false) {
    viewer.classList.remove('open');
    document.body.classList.remove('viewer-open');
    setTimeout(() => { viewer.hidden = true; frame.src = 'about:blank'; }, 650);
    if (!fromPop && WORKS[location.hash.slice(1)]) history.back();
  }
  frame.addEventListener('load', () => { if (frame.getAttribute('src') !== 'about:blank') loading.classList.add('done'); });
  $$('[data-work]').forEach(b => b.addEventListener('click', () => openWork(b.dataset.work)));
  $('#viewerClose').addEventListener('click', () => closeWork());
  addEventListener('popstate', () => {
    const k = location.hash.slice(1);
    if (WORKS[k]) openWork(k, false); else if (!viewer.hidden) closeWork(true);
  });
  addEventListener('keydown', e => { if (e.key === 'Escape' && !viewer.hidden) closeWork(); });
  if (WORKS[location.hash.slice(1)]) setTimeout(() => openWork(location.hash.slice(1), false), 400);

  /* ---------- actions ---------- */
  const say = (el, msg) => { el.textContent = msg; clearTimeout(el._t); el._t = setTimeout(() => (el.textContent = ''), 3500); };
  const actionStatus = $('#actionStatus');
  const ADDRESS = '서울 종로구 대학로 57 홍익대 대학로 아트센터 B1';

  async function copy(text) {
    try { await navigator.clipboard.writeText(text); return true; }
    catch { const t = document.createElement('textarea'); t.value = text; document.body.appendChild(t); t.select();
      const ok = document.execCommand('copy'); t.remove(); return ok; }
  }
  $('#shareLink').addEventListener('click', async () => {
    const url = location.href.split('#')[0];
    if (navigator.share) {
      try { await navigator.share({ title: '김하진 졸업전시 초대장', text: '2026.11.11 – 11.15 · 홍익대 대학로 아트센터 B1', url }); return; } catch (e) { if (e.name === 'AbortError') return; }
    }
    say(actionStatus, (await copy(url)) ? '초대장 링크를 복사했어요.' : '링크를 복사하지 못했어요. 주소창의 링크를 공유해 주세요.');
  });
  $('#copyAddr').addEventListener('click', async () => {
    say($('#copyStatus'), (await copy(ADDRESS)) ? '주소를 복사했어요.' : '복사하지 못했어요: ' + ADDRESS);
  });
  $('#saveCal').addEventListener('click', () => {
    const stamp = new Date().toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
    const ics = [
      'BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//HAJIN KIM//GRAD SHOW//KO', 'CALSCALE:GREGORIAN',
      'BEGIN:VEVENT', 'UID:hajin-gradshow-2026@invite', 'DTSTAMP:' + stamp,
      'DTSTART;VALUE=DATE:20261111', 'DTEND;VALUE=DATE:20261116',
      'SUMMARY:김하진 졸업전시 (10:00–17:30)', 'LOCATION:' + ADDRESS,
      'DESCRIPTION:ETERNIA · 환상선택 / 전 기간 관람 가능', 'END:VEVENT',
      'BEGIN:VEVENT', 'UID:hajin-gradshow-opening-2026@invite', 'DTSTAMP:' + stamp,
      'DTSTART;TZID=Asia/Seoul:20261114T163000', 'DTEND;TZID=Asia/Seoul:20261114T180000',
      'SUMMARY:김하진 졸업전시 오프닝', 'LOCATION:' + ADDRESS, 'END:VEVENT', 'END:VCALENDAR'
    ].join('\r\n');
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([ics], { type: 'text/calendar;charset=utf-8' }));
    a.download = '김하진_졸업전시.ics'; a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 2000);
    say(actionStatus, '캘린더 파일을 내려받았어요. 열면 일정에 추가됩니다.');
  });

  /* ---------- lightbox ---------- */
  const lb = $('#lightbox'), lbBody = $('#lbBody'), lbSave = $('#lbSave');
  const INSTA = 'https://www.instagram.com/p/Dek8G5RE9AT/?img_index=3';
  function openLightbox(title, node, saveHref, saveName) {
    $('#lbTitle').textContent = title;
    lbBody.innerHTML = ''; lbBody.append(...[].concat(node));
    if (saveHref) { lbSave.href = saveHref; lbSave.download = saveName; lbSave.hidden = false; } else lbSave.hidden = true;
    lb.hidden = false; document.body.classList.add('viewer-open');
    requestAnimationFrame(() => requestAnimationFrame(() => lb.classList.add('open')));
  }
  function closeLightbox() {
    lb.classList.remove('open'); document.body.classList.remove('viewer-open');
    setTimeout(() => { lb.hidden = true; lbBody.innerHTML = ''; }, 350);
  }
  $('#lbClose').addEventListener('click', closeLightbox);
  lb.addEventListener('click', e => { if (e.target === lb || e.target === lbBody) closeLightbox(); });
  addEventListener('keydown', e => { if (e.key === 'Escape' && !lb.hidden) closeLightbox(); });


  /* ---------- 초대장 PNG: 메인 화면 느낌으로 1080×1920 카드를 직접 그림 ---------- */
  const loadImg = src => new Promise((res, rej) => { const i = new Image(); i.onload = () => res(i); i.onerror = rej; i.src = src; });
  async function buildInviteCard() {
    const W = 1080, H = 1920, s = W / 518, HERO = 745 * s;
    const c = document.createElement('canvas'); c.width = W; c.height = H;
    const g = c.getContext('2d');
    try { await Promise.all(['700 112px "Space Grotesk"', '500 14px "Space Grotesk"', '400 20px Audiowide', '700 20px "Noto Sans KR"', '500 20px "Noto Sans KR"', '400 20px "Noto Sans KR"'].map(f => document.fonts.load(f, 'A가'))); } catch (e) {}
    const [plate, person, shadow, smoke, cloud, logo] = await Promise.all(
      ['hero-plate.jpg', 'hero-person.webp', 'hero-shadow.png', 'hero-smoke.webp', 'cloud.png', 'logo-mark.png'].map(n => loadImg('assets/' + n)));
    const U = v => v * s;
    // spaced text helper (letter-spacing in design px), align: left/right
    function text(str, x, y, font, color, ls = 0, align = 'left', alpha = 1) {
      g.font = font; g.fillStyle = color; g.globalAlpha = alpha; g.textBaseline = 'alphabetic';
      const chars = [...str], ws = chars.map(ch => g.measureText(ch).width);
      const total = ws.reduce((a, b) => a + b, 0) + U(ls) * (chars.length - 1);
      let cx = align === 'right' ? x - total : align === 'center' ? x - total / 2 : x;
      chars.forEach((ch, i) => { g.fillText(ch, cx, y); cx += ws[i] + U(ls); });
      g.globalAlpha = 1; return total;
    }
    // hero
    g.drawImage(plate, 0, 0, W, HERO);
    [[-40, 52, 136], [150, 8, 147], [300, 205, 96], [430, 330, 84]].forEach(([x, y, w]) => g.drawImage(cloud, U(x), U(y), U(w), U(w * cloud.height / cloud.width)));
    g.drawImage(shadow, 0, U(576), U(191), U(45));
    g.drawImage(smoke, 0, U(453), U(79), U(113));
    g.drawImage(person, U(31), U(156), U(215), U(407));
    g.globalAlpha = .86; g.drawImage(logo, U(347), U(19), U(152), U(24)); g.globalAlpha = 1;
    text('HAJIN KIM / GRADUATION EXHIBITION', U(20), U(30), `500 ${U(7)}px "Space Grotesk"`, '#fff', .47, 'left', .75);
    const R = U(503);
    text('KIM HAJIN', R, U(150), `400 ${U(24)}px Audiowide`, '#dfff00', 1.2, 'right');
    let w = text('PLAY', R, U(170), `700 ${U(10)}px "Space Grotesk"`, '#dfff00', .8, 'right');
    text('DESIGN / MEDIA / ', R - w - U(.8), U(170), `700 ${U(10)}px "Space Grotesk"`, '#fff', .8, 'right');
    text('GRAD', R, U(272), `700 ${U(112.66)}px "Space Grotesk"`, '#fff', -9.58, 'right');
    text('SHOW.', R + U(4), U(378), `700 ${U(113.94)}px "Space Grotesk"`, '#fff', -9.69, 'right');
    w = text('의 졸업전시에 초대합니다.', R, U(420), `500 ${U(14)}px "Noto Sans KR"`, '#fff', -.28, 'right');
    text('김하진', R - w, U(420), `500 ${U(14)}px "Noto Sans KR"`, '#dfff00', -.28, 'right');
    // place chip on hero (like the main)
    g.fillStyle = 'rgba(255,254,250,.94)'; g.fillRect(U(20), U(612), U(214), U(110));
    text('11.11 — 11.15', U(30), U(646), `400 ${U(26)}px Audiowide`, '#132c20', -.9);
    text('홍익대 대학로 아트센터 B1', U(30), U(672), `700 ${U(12.5)}px "Noto Sans KR"`, '#132c20');
    text('서울 종로구 대학로 57', U(30), U(690), `400 ${U(10)}px "Noto Sans KR"`, '#3e5348');
    text('OPENING 11.14 (SAT) 16:30', U(30), U(710), `500 ${U(9)}px "Space Grotesk"`, '#132c20', .6);
    // info panel
    const top = HERO;
    g.fillStyle = '#ffffff'; g.fillRect(0, top, W, H - top);
    g.fillStyle = '#dfff00'; g.fillRect(0, top, W, U(10));
    text('GRADUATION EXHIBITION / 2026', U(20), top + U(36), `400 ${U(9.5)}px Audiowide`, '#323232', 1.2);
    text('[꼬두라미]', U(20), top + U(70), `700 ${U(26)}px "Noto Sans KR"`, '#191919', -1);
    text('건국대학교 글로컬 미디어콘텐츠학과', U(20), top + U(94), `500 ${U(13.5)}px "Noto Sans KR"`, '#191919', -.3);
    text('11회 졸업 전시회', U(20), top + U(114), `500 ${U(13.5)}px "Noto Sans KR"`, '#191919', -.3);
    g.fillStyle = 'rgba(34,34,34,.25)'; g.fillRect(U(20), top + U(128), U(478), Math.max(2, U(.6)));
    text('DATE', U(20), top + U(146), `500 ${U(8.5)}px "Space Grotesk"`, '#65655f', .8);
    text('2026.11.11 – 11.15 · 10:00 – 17:30', U(70), top + U(146), `500 ${U(10.5)}px "Noto Sans KR"`, '#191919');
    text('PLACE', U(20), top + U(162), `500 ${U(8.5)}px "Space Grotesk"`, '#65655f', .8);
    text('홍익대 대학로 아트센터 B1 · 서울 종로구 대학로 57', U(70), top + U(162), `500 ${U(10.5)}px "Noto Sans KR"`, '#191919');
    // right column: works
    const chip = (label, bg, fg, y) => { g.font = `500 ${U(9)}px "Space Grotesk"`; const tw = g.measureText(label).width + U(12); g.fillStyle = bg; g.fillRect(U(498) - tw, y, tw, U(15)); text(label, U(498) - U(6), y + U(11), `500 ${U(9)}px "Space Grotesk"`, fg, .3, 'right'); };
    chip('01 / ETERNIA', '#dfff00', '#11271f', top + U(28));
    chip('02 / 환상선택', '#dc62cc', '#ffffff', top + U(48));
    text('김하진 졸업전시 · 2026', U(498), top + U(110), `500 ${U(8.5)}px "Space Grotesk"`, '#65655f', .6, 'right');
    return c.toDataURL('image/png');
  }
  $('#savePng').addEventListener('click', async () => {
    say(actionStatus, '초대장 이미지를 만드는 중이에요…');
    try {
      const url = await buildInviteCard();
      const img = new Image(); img.src = url; img.alt = '김하진 졸업전시 초대장';
      const hint = document.createElement('p'); hint.className = 'lb-hint';
      hint.textContent = '휴대폰에서는 이미지를 길게 눌러 사진에 저장할 수 있어요.';
      openLightbox('초대장 미리보기', [img, hint], url, '김하진_졸업전시_초대장.png');
      say(actionStatus, '');
    } catch (e) {
      console.warn(e);
      say(actionStatus, location.protocol === 'file:' ? '파일을 더블클릭해서 연 상태에선 이미지 저장이 막혀요. 깃허브 주소나 Live Server로 열어 주세요.' : '이미지를 만들지 못했어요. 다시 시도해 주세요.');
    }
  });

  /* ---------- 기록 (records/record.js) ---------- */
  const R = window.GradRecord || { configured: false, event() {}, view() {}, onStats() {}, mountHeart() {}, guestbook: () => Promise.resolve({ ok: false }) };
  const ev = (action, target) => R.event('invitation', action, target);
  R.view('invitation');
  R.mountHeart({ site: 'invitation', position: { left: 'max(14px, calc(50vw - 259 * min(1px, 100vw / 518) + 20 * min(1px, 100vw / 518)))', bottom: 'calc(14px + env(safe-area-inset-bottom))' } });
  $('#shareLink').addEventListener('click', () => ev('share', 'link'));
  $('#saveCal').addEventListener('click', () => ev('calendar', 'ics'));
  $('#savePng').addEventListener('click', () => ev('download', 'invitation_png'));
  $('#instaLink').addEventListener('click', () => ev('instagram', 'post'));
  $('#copyAddr').addEventListener('click', () => ev('copy_address', 'address'));
  $$('.map-btn[href]').forEach(a => a.addEventListener('click', () => ev('map', a.textContent.replace(' ↗', '').trim())));
  $$('[data-work]').forEach(b => b.addEventListener('click', () => ev('open_work', b.dataset.work)));
  $('#viewerOut').addEventListener('click', () => ev('open_work', $('#viewerTitle').textContent + ' (new tab)'));

  /* ---------- 방명록 ---------- */
  const gStatus = $('#guestStatus'), gList = $('#guestList');
  const esc = t => String(t).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const entryHtml = g => `<li><p class="gl-msg">${esc(g.message)}</p><p class="gl-meta"><b>${esc(g.name)}</b><span>${esc(g.time || '방금')}</span></p></li>`;
  if (R.configured) {
    gStatus.textContent = '따뜻한 한마디를 남겨주세요. 남긴 글은 아래에 바로 보여요.';
    R.load().then(res => { if (res && res.guestbook) gList.innerHTML = res.guestbook.map(entryHtml).join(''); });
  }
  $('#guestForm').addEventListener('submit', async e => {
    e.preventDefault();
    const shake = () => { gStatus.classList.remove('shake'); void gStatus.offsetWidth; gStatus.classList.add('shake'); };
    if (!R.configured) { shake(); return; }
    const name = $('#gName').value.trim(), msg = $('#gMsg').value.trim();
    if (!name || !msg) { gStatus.textContent = '이름과 메시지를 모두 적어 주세요.'; shake(); return; }
    const btn = e.submitter || $('#guestForm button'); btn.disabled = true;
    gStatus.textContent = '마음을 전하는 중이에요…';
    const res = await R.guestbook(name, msg, 'invitation');
    btn.disabled = false;
    if (res && res.ok) {
      gList.insertAdjacentHTML('afterbegin', entryHtml({ name, message: msg, time: '방금' }));
      gList.firstElementChild.classList.add('new');
      $('#gMsg').value = '';
      gStatus.textContent = '고마워요! 방명록에 남겨졌어요.';
    } else { gStatus.textContent = '저장하지 못했어요. 잠시 후 다시 시도해 주세요.'; shake(); }
  });
})();

/* floating nav: docked in hero → fixed after the hero */
(function(){
  var nav=document.querySelector('.fnav'); if(!nav) return;
  var docked=null, ticking=false;
  function u(){ return Math.min(1, window.innerWidth/518); }
  function update(){
    ticking=false;
    var d = window.scrollY < 733*u();
    if (d===docked) return;
    docked=d;
    nav.classList.toggle('docked', d);
    nav.classList.remove('float-in');
    if(!d){ void nav.offsetWidth; nav.classList.add('float-in'); }
  }
  update();
  window.addEventListener('scroll',function(){ if(!ticking){ ticking=true; requestAnimationFrame(update); } },{passive:true});
  window.addEventListener('resize',update);
})();
