/**
 * ETERNIA 임무보고서 · 구글 Apps Script (hchis.hj 계정에서 실행)
 *  - type:'photo' 요청 → 인증샷 JPG를 드라이브 'ETERNIA 임무보고서 인증샷' 폴더에 저장, 링크 공개, 파일 id 반환
 *  - 그 외 요청       → 설문 응답 한 줄을 스프레드시트 'ETERNIA 임무보고서 응답'에 추가
 * 설정 방법은 README_사진QR설정.md 참고
 */
const FOLDER_NAME = 'ETERNIA 임무보고서 인증샷';
const SHEET_NAME = 'ETERNIA 임무보고서 응답';

function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    if (data.type === 'photo') return json(savePhoto(data));
    return json(saveRow(data));
  } catch (err) {
    return json({ ok: false, error: String(err) });
  }
}

function doGet() { return json({ ok: true, service: 'eternia-report' }); }

function savePhoto(d) {
  if (!d.image) throw new Error('no image');
  const bytes = Utilities.base64Decode(d.image);
  if (bytes.length > 8 * 1024 * 1024) throw new Error('too large');
  const name = `${d.file || 'HB'}_${(d.agent || 'AGENT').replace(/\s+/g, '_')}_${Utilities.formatDate(new Date(), 'Asia/Seoul', 'MMdd_HHmmss')}.jpg`;
  const file = folder_().createFile(Utilities.newBlob(bytes, 'image/jpeg', name));
  file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
  return { ok: true, id: file.getId() };
}

function saveRow(row) {
  const ss = sheet_(), sh = ss.getSheets()[0];
  const keys = Object.keys(row);
  if (sh.getLastRow() === 0) sh.appendRow(keys);
  const head = sh.getRange(1, 1, 1, sh.getLastColumn()).getValues()[0];
  keys.forEach(k => { if (head.indexOf(k) < 0) { head.push(k); sh.getRange(1, head.length).setValue(k); } });
  sh.appendRow(head.map(h => row[h] == null ? '' : row[h]));
  return { ok: true };
}

function folder_() {
  const p = PropertiesService.getScriptProperties();
  const id = p.getProperty('FOLDER_ID');
  if (id) { try { return DriveApp.getFolderById(id); } catch (e) {} }
  const f = DriveApp.createFolder(FOLDER_NAME);
  p.setProperty('FOLDER_ID', f.getId());
  return f;
}

function sheet_() {
  const p = PropertiesService.getScriptProperties();
  const id = p.getProperty('SHEET_ID');
  if (id) { try { return SpreadsheetApp.openById(id); } catch (e) {} }
  const s = SpreadsheetApp.create(SHEET_NAME);
  p.setProperty('SHEET_ID', s.getId());
  return s;
}

function json(o) { return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON); }

/** 처음 한 번 실행: 드라이브/시트 권한 승인 + 폴더·시트 생성 */
function setup() { folder_(); sheet_(); Logger.log('폴더: ' + folder_().getUrl() + '\n시트: ' + sheet_().getUrl()); }
