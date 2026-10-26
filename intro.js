const intro=document.querySelector('#gameIntro'),video=document.querySelector('#introVideo'),loading=document.querySelector('#introLoading'),fill=document.querySelector('#introProgressFill'),text=document.querySelector('#introProgressText');
let loaded=false,videoDone=false,entered=false,loadingAt=0;
const blocked=[...document.body.children].filter(e=>e!==intro&&e.tagName!=='SCRIPT');blocked.forEach(e=>e.inert=true);
function enter(){if(!loaded||!videoDone||entered)return;const wait=Math.max(0,900-(performance.now()-loadingAt));setTimeout(()=>{if(entered)return;entered=true;text.textContent='연결 완료 · 이터니아에 오신 걸 환영합니다';fill.style.width='100%';setTimeout(()=>{intro.classList.add('entering');document.body.classList.remove('booting');blocked.forEach(e=>e.inert=false);setTimeout(()=>{intro.hidden=true;video.pause();document.querySelector('#panelToggle')?.focus({preventScroll:true})},1100)},220)},wait)}
function showLoading(){if(videoDone)return;videoDone=true;loadingAt=performance.now();video.pause();video.classList.add('finished');loading.hidden=false;document.querySelector('#introSkip').hidden=true;document.querySelector('#introPlay').hidden=true;document.querySelector('#introSound').hidden=true;enter()}
video.addEventListener('ended',showLoading);video.addEventListener('error',showLoading);document.querySelector('#introSkip').onclick=showLoading;
document.querySelector('#introSound').onclick=()=>{video.muted=!video.muted;document.querySelector('#introSound').textContent=video.muted?'소리 켜기 ♫':'소리 끄기 ♫'};
// The logo video itself is silent; audio-ui.js starts the BGM + logo sting and then fires 'intro:play'.
// If the browser blocks sound until a click, audio-ui.js shows the 시작하기 button first.
video.muted=true;const playButton=document.querySelector('#introPlay');let introStarted=false;
function playIntro(){introStarted=true;playButton.hidden=true;video.play().catch(()=>playButton.hidden=false)}
document.addEventListener('intro:play',playIntro);playButton.onclick=()=>{video.play().then(()=>{introStarted=true;playButton.hidden=true}).catch(showLoading)};
setTimeout(()=>{if(!introStarted&&playButton.hidden)playIntro()},2500);
document.addEventListener('tour:load',e=>{const p=Math.round(e.detail.loaded/e.detail.total*100);fill.style.width=p+'%';text.textContent=`전시 리소스 ${e.detail.loaded} / ${e.detail.total}`;});
document.addEventListener('tour:ready',()=>{loaded=true;fill.style.width='100%';text.textContent='전시 준비 완료';enter()});
if(matchMedia('(prefers-reduced-motion: reduce)').matches)showLoading();

export function replayIntro(){
 document.querySelectorAll('dialog[open]').forEach(d=>d.close());
 entered=false;videoDone=false;loadingAt=0;intro.hidden=false;intro.classList.remove('entering');video.classList.remove('finished');loading.hidden=true;document.body.classList.add('booting');blocked.forEach(e=>e.inert=true);
 document.querySelector('#introSkip').hidden=false;document.querySelector('#introSound').hidden=false;playButton.hidden=true;introStarted=false;video.currentTime=0;
}
document.addEventListener('tour:replay',replayIntro);
document.querySelector('#dismissLogoCue').onclick=()=>document.querySelector('.logo-replay-cue').hidden=true;
