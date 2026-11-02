/**
 * 김하진 졸업전시 통합 기록 서버 (Google Apps Script)
 * ------------------------------------------------------------
 * 초대장 · 환상선택 · ETERNIA 세 사이트의 기록을 이 스크립트가 붙어 있는
 * 구글 시트 한 곳에 모읍니다.
 *
 *   방명록      : 초대장 방명록 글
 *   알고리즘랩  : 환상선택 ALGORITHM LAB 에 남긴 문장
 *   이터니아    : ETERNIA 보상 받기 등 체험 기록
 *   반응        : 하트 · 공유 · 다운로드 · 방문 · 버튼 클릭 (모든 사이트)
 *
 * 설정 방법은 records/README.md 를 보세요.
 * 관리자 키는 코드에 적지 않고 [프로젝트 설정 → 스크립트 속성] 에 ADMIN_KEY 로 저장합니다.
 */

var SHEETS = {
  guestbook: { name: '방명록',     headers: ['시간', '사이트', '이름', '메시지', '방문자ID', '숨김'] },
  lab:       { name: '알고리즘랩', headers: ['시간', '게시자 이름', '문장', '증폭 신호', '증폭 강도', '방문자ID'] },
  eternia:   { name: '이터니아',   headers: ['시간', '종류', '내용', '방문자ID'] },
  event:     { name: '반응',       headers: ['시간', '사이트', '행동', '대상', '방문자ID'] }
};
var SITES = ['invitation', 'hwansang', 'eternia'];
var ACTIONS = ['view', 'heart', 'share', 'download', 'calendar', 'poster', 'instagram', 'open_work', 'map', 'copy_address', 'click'];

/* ---------------- 쓰기 (POST) ---------------- */
function doPost(e) {
  var body;
  try { body = JSON.parse(e.postData.contents); } catch (err) { return json_({ ok: false, error: 'bad_json' }); }
  var kind = String(body.kind || '');
  var d = body.data || {};
  var vid = clip_(body.vid, 40);
  var now = new Date();
  var lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    if (kind === 'guestbook') {
      var name = clip_(d.name, 20), msg = clip_(d.message, 300);
      if (!name || !msg) return json_({ ok: false, error: 'empty' });
      sheet_('guestbook').appendRow([now, site_(d.site), name, msg, vid, '']);
    } else if (kind === 'lab') {
      var text = clip_(d.text, 100);
      if (!text) return json_({ ok: false, error: 'empty' });
      sheet_('lab').appendRow([now, clip_(d.name, 30), text, clip_(d.signal, 20), Number(d.intensity) || '', vid]);
    } else if (kind === 'eternia') {
      sheet_('eternia').appendRow([now, clip_(d.type, 40), clip_(d.detail, 300), vid]);
    } else if (kind === 'event') {
      var action = ACTIONS.indexOf(d.action) >= 0 ? d.action : 'click';
      sheet_('event').appendRow([now, site_(d.site), action, clip_(d.target, 60), vid]);
    } else {
      return json_({ ok: false, error: 'unknown_kind' });
    }
  } finally {
    lock.releaseLock();
  }
  return json_({ ok: true, stats: stats_() });
}

/* ---------------- 읽기 (GET) ----------------
 *  ?fn=stats            공개: 사이트별 하트·공유·다운로드·방문 수 + 최근 방명록
 *  ?fn=export&key=...   관리자: 모든 시트의 모든 행
 */
function doGet(e) {
  var p = (e && e.parameter) || {};
  if (p.fn === 'export') {
    var key = PropertiesService.getScriptProperties().getProperty('ADMIN_KEY');
    if (!key || p.key !== key) return json_({ ok: false, error: 'unauthorized' });
    var out = {};
    Object.keys(SHEETS).forEach(function (k) {
      var values = sheet_(k).getDataRange().getValues();
      out[k] = { name: SHEETS[k].name, headers: values[0], rows: values.slice(1).map(function (r) {
        return r.map(function (v) { return v instanceof Date ? Utilities.formatDate(v, 'Asia/Seoul', 'yyyy-MM-dd HH:mm:ss') : v; });
      }) };
    });
    return json_({ ok: true, stats: stats_(), sheets: out });
  }
  return json_({ ok: true, stats: stats_(), guestbook: recentGuestbook_(40) });
}

/* ---------------- 집계 ---------------- */
function stats_() {
  var counts = {};
  SITES.forEach(function (s) { counts[s] = {}; ACTIONS.forEach(function (a) { counts[s][a] = 0; }); });
  var rows = sheet_('event').getDataRange().getValues().slice(1);
  rows.forEach(function (r) { var s = r[1], a = r[2]; if (counts[s] && counts[s][a] !== undefined) counts[s][a]++; });
  return {
    counts: counts,
    guestbook: Math.max(0, sheet_('guestbook').getLastRow() - 1),
    lab: Math.max(0, sheet_('lab').getLastRow() - 1),
    eternia: Math.max(0, sheet_('eternia').getLastRow() - 1)
  };
}
function recentGuestbook_(n) {
  var values = sheet_('guestbook').getDataRange().getValues().slice(1);
  return values.filter(function (r) { return !r[5]; }).slice(-n).reverse().map(function (r) {
    return { time: Utilities.formatDate(r[0], 'Asia/Seoul', 'MM.dd HH:mm'), name: r[2], message: r[3] };
  });
}

/* ---------------- 도우미 ---------------- */
function sheet_(k) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var def = SHEETS[k];
  var sh = ss.getSheetByName(def.name);
  if (!sh) {
    sh = ss.insertSheet(def.name);
    sh.appendRow(def.headers);
    sh.setFrozenRows(1);
    sh.getRange(1, 1, 1, def.headers.length).setFontWeight('bold').setBackground('#dfff00');
  }
  return sh;
}
function site_(s) { return SITES.indexOf(s) >= 0 ? s : 'invitation'; }
function clip_(v, n) {
  var s = String(v == null ? '' : v).replace(/[\u0000-\u001f]/g, ' ').trim();
  if (/^[=+\-@]/.test(s)) s = "'" + s; // 시트 수식으로 실행되지 않게
  return s.slice(0, n);
}
function json_(o) { return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON); }

/** 처음 한 번 실행: 시트 4개를 만들고 관리자 키를 정합니다. 키는 실행 로그에 표시됩니다. */
function setup() {
  Object.keys(SHEETS).forEach(sheet_);
  var props = PropertiesService.getScriptProperties();
  var key = props.getProperty('ADMIN_KEY');
  if (!key) { key = Utilities.getUuid().slice(0, 8); props.setProperty('ADMIN_KEY', key); }
  Logger.log('관리자 키: ' + key + '  (records/admin.html 에서 입력)');
}
