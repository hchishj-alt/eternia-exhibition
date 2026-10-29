const intro=document.querySelector('#gameIntro'),video=document.querySelector('#introVideo'),loading=document.querySelector('#introLoading'),fill=document.querySelector('#introProgressFill'),text=document.querySelector('#introProgressText');
let loaded=false,videoDone=false,entered=false,loadingAt=0;
// The bar fills over at least MIN_LOADING ms, never ahead of the real load progress.
const MIN_LOADING=1900;let realProgress=0,shownProgress=0,progressRaf=0;
function tickProgress(){const t=Math.min(1,(performance.now()-loadingAt)/MIN_LOADING);shownProgress=Math.max(shownProgress,Math.min(realProgress,(1-(1-t)*(1-t))*100));fill.style.width=shownProgress+'%';if(loaded)text.textContent=`전시 공간 동기화 중 · ${Math.round(shownProgress)}%`;if(shownProgress<100)progressRaf=requestAnimationFrame(tickProgress);else{progressRaf=0;enter()}}
const blocked=[...document.body.children].filter(e=>e!==intro&&e.tagName!=='SCRIPT');blocked.forEach(e=>e.inert=true);
function enter(){if(!loaded||!videoDone||entered||shownProgress<100)return;setTimeout(()=>{if(entered)return;entered=true;text.textContent='연결 완료 · 이터니아에 오신 걸 환영합니다';fill.style.width='100%';setTimeout(()=>{intro.classList.add('entering');document.body.classList.remove('booting');blocked.forEach(e=>e.inert=false);setTimeout(()=>{intro.hidden=true;video.pause();document.querySelector('#panelToggle')?.focus({preventScroll:true});document.dispatchEvent(new Event('intro:entered'))},1100)},220)},250)}
function showLoading(){if(videoDone)return;videoDone=true;loadingAt=performance.now();video.pause();video.classList.add('finished');loading.hidden=false;document.querySelector('#introSkip').hidden=true;document.querySelector('#introPlay').hidden=true;document.querySelector('#introSound').hidden=true;shownProgress=0;fill.style.width='0%';cancelAnimationFrame(progressRaf);tickProgress()}
video.addEventListener('ended',showLoading);video.addEventListener('error',showLoading);document.querySelector('#introSkip').onclick=showLoading;
document.querySelector('#introSound').onclick=()=>{video.muted=!video.muted;document.querySelector('#introSound').textContent=video.muted?'소리 켜기 ♫':'소리 끄기 ♫'};
// The logo video itself is silent; audio-ui.js starts the BGM + logo sting and then fires 'intro:play'.
// If the browser blocks sound until a click, audio-ui.js shows the 시작하기 button first.
video.muted=true;const playButton=document.querySelector('#introPlay');let introStarted=false;
function playIntro(){if(videoDone)return;introStarted=true;playButton.hidden=true;video.play().catch(()=>playButton.hidden=false)}
document.addEventListener('intro:play',playIntro);playButton.onclick=()=>{video.play().then(()=>{introStarted=true;playButton.hidden=true}).catch(showLoading)};
setTimeout(()=>{if(!introStarted&&playButton.hidden)playIntro()},2500);
document.addEventListener('tour:load',e=>{realProgress=Math.round(e.detail.loaded/e.detail.total*100);text.textContent=`전시 리소스 ${e.detail.loaded} / ${e.detail.total}`;});
document.addEventListener('tour:ready',()=>{loaded=true;realProgress=100;text.textContent='전시 준비 완료';enter()});
// Exhibition QR codes (?product=brioll / ?product=scott) skip the logo video and go straight to loading.
if(matchMedia('(prefers-reduced-motion: reduce)').matches||new URLSearchParams(location.search).has('product'))showLoading();

export function replayIntro(){
 document.querySelectorAll('dialog[open]').forEach(d=>d.close());
 entered=false;videoDone=false;loadingAt=0;cancelAnimationFrame(progressRaf);shownProgress=0;fill.style.width='0%';intro.hidden=false;intro.classList.remove('entering');video.classList.remove('finished');loading.hidden=true;document.body.classList.add('booting');blocked.forEach(e=>e.inert=true);
 document.querySelector('#introSkip').hidden=false;document.querySelector('#introSound').hidden=false;playButton.hidden=true;introStarted=false;video.currentTime=0;
}
document.addEventListener('tour:replay',replayIntro);
document.querySelector('#dismissLogoCue').onclick=()=>document.querySelector('.logo-replay-cue').hidden=true;
