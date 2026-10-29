# ETERNIA 가상 전시 사이트

빌드나 npm 설치 없이 그대로 올리는 정적 사이트입니다. 이 폴더의 **내용물 전체**(index.html, JS/CSS 파일, `assets` 폴더)를 저장소 최상위에 올리세요. ZIP 파일 자체를 올리는 것이 아닙니다.

## GitHub에 올리기

### 방법 A. GitHub Desktop (추천: 파일이 100개가 넘어도 한 번에 올라감)
1. GitHub Desktop 설치 후 로그인 → File → New repository
2. Name 입력(예: `eternia`), Local path 지정 → Create repository
3. 만들어진 저장소 폴더에 이 폴더의 내용물을 전부 복사 (index.html이 저장소 바로 아래에 있어야 함)
4. 왼쪽 아래 Summary에 `ETERNIA 최종본` 입력 → Commit to main
5. 위쪽 Publish repository → **Keep this code private 체크 해제**(무료 Pages는 Public 필요) → Publish

### 방법 B. 웹 브라우저 업로드
1. github.com → 오른쪽 위 + → New repository → 이름 입력, Public 선택 → Create repository
2. uploading an existing file 클릭
3. 압축 푼 폴더 **안의 내용물 전체**(index.html 등 파일 + `assets` 폴더)를 선택해서 한 번에 드래그 (총 89개라 업로드 한도 100개 안에 들어감, `assets` 폴더는 폴더째 끌어야 경로 유지)
4. 아래 Commit changes 클릭

### 사이트 공개 (GitHub Pages)
1. 저장소 Settings → 왼쪽 Pages
2. Source: **Deploy from a branch**, Branch: **main**, Folder: **/(root)** → Save
3. 1~3분 뒤 같은 화면 위쪽에 생기는 주소(`https://아이디.github.io/저장소이름/`)로 접속

수정할 때는 같은 이름의 파일을 덮어쓰고 다시 Commit하면 몇 분 뒤 반영됩니다. 반영이 안 보이면 Ctrl+F5로 새로고침하세요.

## 주의
- `assets` 폴더 이름과 그 안의 파일 이름을 바꾸지 마세요.
- index.html을 더블클릭해서 열면 3D가 로딩되지 않습니다. 로컬 확인은 VS Code → Live Server로 하세요.

## 전시 QR
- `?product=brioll#sponsor` / `?product=scott#sponsor`로 들어오면 로고 영상을 건너뛰고 협찬사 면으로 이동한 뒤 해당 브랜드 제품 상세창이 바로 열립니다.
- `product=` 뒤에 `brioll-5`처럼 제품 id를 넣으면 그 제품이 열립니다.

## 입사지원서 저장 (Google 시트)
`application.html`(헥사블룸 바이오테크 입사지원서)에서 **제출하기**를 누르면 관리자 구글 시트에 저장됩니다. 설정 방법과 관리자용 Apps Script 코드는 이 저장소 밖의 `HEXABLOOM_지원서_관리자` 폴더에 있습니다. (관리자 키가 들어 있으니 GitHub에 올리지 마세요.)

`application.html`의 `SUBMIT_URL`이 비어 있으면 제출할 때 안내 문구만 나옵니다.

## 소리
- 소리는 기본으로 켜져 있습니다. 로고 애니메이션이 시작될 때 BGM과 반짝임 효과음이 함께 나옵니다.
- 브라우저가 첫 방문에서 소리 자동재생을 막으면 인트로에 "시작하기 ▷" 버튼이 먼저 나옵니다. 누르면 소리와 함께 로고 애니메이션이 재생됩니다(크롬·사파리 정책상 이 클릭 한 번은 필요합니다).
- 오른쪽 위 원형 음표 버튼으로 전체 소리를 끄고 켤 수 있습니다. 보상을 받으면 획득 효과음이 납니다.
