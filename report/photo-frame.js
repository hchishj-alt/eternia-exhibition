/* ETERNIA 임무보고서 인증샷 프레임 (시안 B · 코너 브래킷) — 1080×1350 캔버스
   ETF.draw(ctx, source|null, logo, meta, {mirror})
   source가 null이면 사진 없이 프레임만 그림(실시간 미리보기 위에 겹치는 용도) */
(function () {
  const LIME = '#D4F03A', ROSE = '#C93A6B', W = 1080, H = 1350;
  const FONT = "Orbitron, 'Pretendard Variable', 'Noto Sans KR', sans-serif";
  function hexPath(x, cx, cy, r, rot) { x.beginPath(); for (let i = 0; i < 6; i++) { const a = (60 * i + rot) * Math.PI / 180; const px = cx + r * Math.cos(a), py = cy + r * Math.sin(a); i ? x.lineTo(px, py) : x.moveTo(px, py); } x.closePath(); }
  function bolt(x, cx, cy, r) {
    hexPath(x, cx, cy, r + 3, 30); x.fillStyle = '#0b0c0f'; x.fill();
    const g = x.createLinearGradient(cx - r, cy - r, cx + r, cy + r); g.addColorStop(0, '#6a6f7a'); g.addColorStop(.5, '#3a3e47'); g.addColorStop(1, '#1d1f25');
    hexPath(x, cx, cy, r, 30); x.fillStyle = g; x.fill();
    x.strokeStyle = '#0b0c0f'; x.lineWidth = 2.5; x.beginPath(); x.moveTo(cx - r * .55, cy); x.lineTo(cx + r * .55, cy); x.stroke();
  }
  function seam(x, x1, y1, x2, y2) {
    x.strokeStyle = '#07080a'; x.lineWidth = 4; x.beginPath(); x.moveTo(x1, y1); x.lineTo(x2, y2); x.stroke();
    const h = y1 === y2; x.strokeStyle = '#4a4f59'; x.lineWidth = 1.5;
    x.beginPath(); x.moveTo(x1 + (h ? 0 : 2.5), y1 + (h ? 2.5 : 0)); x.lineTo(x2 + (h ? 0 : 2.5), y2 + (h ? 2.5 : 0)); x.stroke();
  }
  function hazard(x, l, t, w, h) {
    x.save(); x.beginPath(); x.rect(l, t, w, h); x.clip();
    x.fillStyle = '#111215'; x.fillRect(l, t, w, h); x.fillStyle = LIME;
    for (let i = -h; i < w + h; i += 22) { x.beginPath(); x.moveTo(l + i, t + h); x.lineTo(l + i + 11, t + h); x.lineTo(l + i + 11 + h, t); x.lineTo(l + i + h, t); x.closePath(); x.fill(); }
    x.restore();
  }
  function txt(x, s, px, py, size, color, align, weight) {
    x.font = `${weight || 800} ${size}px ${FONT}`; x.fillStyle = color; x.textAlign = align || 'left'; x.textBaseline = 'middle'; x.fillText(s, px, py);
  }
  function photo(x, img, mirror) {
    const iw = img.videoWidth || img.naturalWidth || img.width, ih = img.videoHeight || img.naturalHeight || img.height;
    const k = Math.max(W / iw, H / ih), sw = W / k, sh = H / k;
    x.save(); if (mirror) { x.translate(W, 0); x.scale(-1, 1); }
    x.drawImage(img, (iw - sw) / 2, (ih - sh) / 2, sw, sh, 0, 0, W, H); x.restore();
    // 포토필터: 그린 틴트 + 스캔라인 + 비네팅
    x.save();
    x.globalCompositeOperation = 'soft-light'; x.fillStyle = 'rgba(20,40,30,.44)'; x.fillRect(0, 0, W, H);
    x.globalCompositeOperation = 'overlay'; x.fillStyle = 'rgba(212,240,58,.08)'; x.fillRect(0, 0, W, H);
    x.globalCompositeOperation = 'source-over';
    for (let y = 0; y < H; y += 4) { x.fillStyle = 'rgba(0,0,0,.055)'; x.fillRect(0, y, W, 1.5); }
    const v = x.createRadialGradient(W / 2, H / 2, W * .35, W / 2, H / 2, H * .75);
    v.addColorStop(0, 'rgba(0,0,0,0)'); v.addColorStop(1, 'rgba(0,0,0,.45)'); x.fillStyle = v; x.fillRect(0, 0, W, H);
    x.restore();
  }
  function plate(x, pts, bolts, seams) {
    x.save(); x.beginPath(); pts.forEach(([a, b], i) => i ? x.lineTo(a, b) : x.moveTo(a, b)); x.closePath();
    x.shadowColor = 'rgba(0,0,0,.6)'; x.shadowBlur = 20;
    const g = x.createLinearGradient(0, 0, W, H); g.addColorStop(0, '#2e3139'); g.addColorStop(1, '#1a1c21');
    x.fillStyle = g; x.fill(); x.shadowBlur = 0; x.strokeStyle = '#0b0c0f'; x.lineWidth = 3; x.stroke(); x.clip();
    let s = 11; const rnd = () => (s = (s * 16807) % 2147483647) / 2147483647;
    for (let i = 0; i < 260; i++) { x.fillStyle = `rgba(255,255,255,${rnd() * .035})`; x.fillRect(rnd() * W, rnd() * H, 40 + rnd() * 140, 1); }
    seams.forEach(v => seam(x, ...v)); x.restore();
    bolts.forEach(([a, b]) => bolt(x, a, b, 10));
  }
  function draw(x, src, logo, meta, opt) {
    opt = opt || {};
    x.clearRect(0, 0, W, H);
    if (src) photo(x, src, opt.mirror);
    plate(x, [[0, 0], [330, 0], [300, 44], [70, 44], [44, 70], [44, 300], [0, 330]], [[22, 22], [270, 22], [22, 270]], [[150, 0, 150, 44], [0, 160, 44, 160]]);
    plate(x, [[W, 0], [W - 330, 0], [W - 300, 44], [W - 70, 44], [W - 44, 70], [W - 44, 300], [W, 330]], [[W - 22, 22], [W - 270, 22], [W - 22, 270]], [[W - 150, 0, W - 150, 44], [W - 44, 160, W, 160]]);
    plate(x, [[0, H], [0, H - 330], [44, H - 300], [44, H - 200], [300, H - 200], [340, H - 160], [W - 340, H - 160], [W - 300, H - 200], [W - 44, H - 200], [W - 44, H - 300], [W, H - 330], [W, H]],
      [[22, H - 300], [22, H - 22], [W - 22, H - 300], [W - 22, H - 22], [360, H - 22], [W - 360, H - 22]],
      [[0, H - 200, 300, H - 200], [W - 300, H - 200, W, H - 200], [380, H - 160, 380, H], [W - 380, H - 160, W - 380, H]]);
    x.save(); x.strokeStyle = LIME; x.lineWidth = 4; x.shadowColor = LIME; x.shadowBlur = 14;
    x.beginPath(); x.moveTo(300, 44); x.lineTo(70, 44); x.lineTo(44, 70); x.lineTo(44, 300); x.stroke();
    x.beginPath(); x.moveTo(W - 300, 44); x.lineTo(W - 70, 44); x.lineTo(W - 44, 70); x.lineTo(W - 44, 300); x.stroke();
    x.beginPath(); x.moveTo(44, H - 300); x.lineTo(44, H - 200); x.lineTo(300, H - 200); x.lineTo(340, H - 160); x.lineTo(W - 340, H - 160); x.lineTo(W - 300, H - 200); x.lineTo(W - 44, H - 200); x.lineTo(W - 44, H - 300); x.stroke();
    x.restore();
    txt(x, 'HEXABLOOM · MISSION REPORT', W / 2, 30, 20, '#fff', 'center', 800);
    if (logo && logo.width) {
      // 로고 PNG의 투명 여백을 잘라내고(글자 영역만) 가운데 패널(380~700, H-160~H) 정중앙에 배치
      const nw = logo.naturalWidth || logo.width, nh = logo.naturalHeight || logo.height;
      const sx = nw * 51 / 446, sy = nh * 14 / 188, sw = nw * 339 / 446, sh = nh * 122 / 188;
      const lh = 84, lw = sw * lh / sh;
      x.drawImage(logo, sx, sy, sw, sh, W / 2 - lw / 2, H - 86 - lh / 2, lw, lh);
    }
    txt(x, 'AGENT', 70, H - 156, 13, '#6c707a', 'left', 800);
    txt(x, meta.agent, 70, H - 120, 22, LIME, 'left', 900);
    txt(x, meta.file, 70, H - 84, 15, '#9A9EA7', 'left', 700);
    txt(x, meta.date, W - 70, H - 120, 22, '#fff', 'right', 900);
    txt(x, 'HONGIK UNIV. B1', W - 70, H - 84, 15, '#9A9EA7', 'right', 700);
    hazard(x, 70, H - 52, 220, 16); hazard(x, W - 290, H - 52, 220, 16);
    x.fillStyle = ROSE; x.beginPath(); x.arc(W - 160, 100, 7, 0, 7); x.fill();
    txt(x, 'REC', W - 80, 100, 20, ROSE, 'right', 900);
    txt(x, 'CAM-01', 80, 100, 18, '#fff', 'left', 800);
  }
  window.ETF = { draw, W, H };
})();
