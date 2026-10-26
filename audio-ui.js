// Sound is on by default: the BGM and a logo sting start together with the logo animation.
// Browsers may block sound until the first click, so in that case the intro waits on its 시작하기 button.
const button=document.createElement('button');button.id='soundToggle';button.type='button';document.body.append(button);
const bgm=new Audio('assets/hornet-bgm.mp3');bgm.loop=true;bgm.volume=.22;bgm.preload='auto';let enabled=true,unlocked=false,skipToggle=false,ctx,missionTimer;
const intro=document.querySelector('#gameIntro'),introPlay=document.querySelector('#introPlay');
function paint(){button.textContent=enabled?'♫':'♪';button.classList.toggle('muted',!enabled);button.setAttribute('aria-label',enabled?'전체 소리 끄기':'전체 소리 켜기');button.setAttribute('aria-pressed',String(enabled));button.title=enabled?'소리 끄기':'소리 켜기'}paint();
try{ctx=new AudioContext()}catch{}
function tone(kind='tap'){if(!enabled||!ctx||ctx.state!=='running')return;const t=ctx.currentTime;const notes=kind==='reward'?[440,660,880]:kind==='start'?[220,330,440]:kind==='hover'?[550]:[440,660];notes.forEach((f,i)=>{const o=ctx.createOscillator(),g=ctx.createGain();o.type='sine';o.frequency.setValueAtTime(f,t+i*.075);o.frequency.exponentialRampToValueAtTime(f*.97,t+i*.075+.25);g.gain.setValueAtTime(0,t+i*.075);g.gain.linearRampToValueAtTime(kind==='hover'?.012:.035,t+i*.075+.018);g.gain.exponentialRampToValueAtTime(.0001,t+i*.075+.32);o.connect(g).connect(ctx.destination);o.start(t+i*.075);o.stop(t+i*.075+.34)})}
// Rising shimmer under the logo animation.
function logoSting(){if(!enabled||!ctx)return;ctx.resume().then(()=>{const t=ctx.currentTime+.05;[[196,0],[294,.12],[392,.24],[587,.4],[784,.55]].forEach(([f,d])=>{const o=ctx.createOscillator(),g=ctx.createGain();o.type=d>.3?'triangle':'sine';o.frequency.setValueAtTime(f,t+d);g.gain.setValueAtTime(0,t+d);g.gain.linearRampToValueAtTime(.05,t+d+.06);g.gain.exponentialRampToValueAtTime(.0001,t+d+1.6);o.connect(g).connect(ctx.destination);o.start(t+d);o.stop(t+d+1.7)})}).catch(()=>{})}
// Light sparkle chime whenever a reward is granted.
function rewardChime(){if(!enabled||!ctx||ctx.state!=='running')return;const t=ctx.currentTime;[[784,0],[1047,.07],[1319,.14],[1568,.21],[2093,.3]].forEach(([f,d])=>{const o=ctx.createOscillator(),g=ctx.createGain();o.type='triangle';o.frequency.setValueAtTime(f,t+d);g.gain.setValueAtTime(.0001,t+d);g.gain.exponentialRampToValueAtTime(.045,t+d+.012);g.gain.exponentialRampToValueAtTime(.0001,t+d+.55);o.connect(g).connect(ctx.destination);o.start(t+d);o.stop(t+d+.6)})}
const rewardDialog=document.querySelector('#rewardDialog');new MutationObserver(()=>{if(rewardDialog.open)rewardChime()}).observe(rewardDialog,{attributes:true,attributeFilter:['open']});
function playBgm(){if(enabled)return bgm.play();return Promise.resolve()}
// Starts the logo animation; with sound on it first checks that audio is allowed.
function beginIntro(){const go=()=>document.dispatchEvent(new Event('intro:play'));bgm.pause();bgm.currentTime=0;if(!enabled){go();return}playBgm().then(()=>{unlocked=true;logoSting();go()}).catch(()=>{introPlay.innerHTML='시작하기 ▷';introPlay.hidden=false})}
introPlay.addEventListener('click',()=>{unlocked=true;playBgm().catch(()=>{});logoSting()});
function unlock(e){if(unlocked)return;unlocked=true;if(e.target.closest?.('#soundToggle'))skipToggle=true;ctx?.resume().catch(()=>{});playBgm().catch(()=>{})}
['pointerdown','keydown','touchstart'].forEach(type=>window.addEventListener(type,unlock,{capture:true,passive:true}));
// A first click on the toggle while audio was still blocked just starts the sound instead of turning it off.
button.onclick=async()=>{if(skipToggle){skipToggle=false;return}enabled=!enabled;if(enabled){try{await ctx?.resume()}catch{}tone('start');playBgm().catch(()=>{})}else bgm.pause();paint()};
let hoverAt=0;document.addEventListener('pointerover',e=>{if(e.target.closest('button,a')&&performance.now()-hoverAt>180){hoverAt=performance.now();tone('hover')}});document.addEventListener('click',e=>{const b=e.target.closest('button,a');if(b&&b!==button&&b!==introPlay)tone('tap')});
document.addEventListener('visibilitychange',()=>{if(document.hidden)bgm.pause();else if(unlocked)playBgm().catch(()=>{})});
const mission=document.createElement('aside');mission.id='arrivalMission';mission.hidden=true;mission.setAttribute('role','status');mission.innerHTML='<strong>관람하고 보상을 획득하세요!</strong>';document.body.append(mission);
function arrive(){if(unlocked)playBgm().catch(()=>{});mission.hidden=false;mission.classList.remove('appear');void mission.offsetWidth;mission.classList.add('appear');tone('start');clearTimeout(missionTimer);missionTimer=setTimeout(()=>{mission.hidden=true;document.querySelector('.rewards-widget').classList.add('awaiting-reward')},4300)}
new MutationObserver(()=>{if(intro.hidden)arrive();else {mission.hidden=true;clearTimeout(missionTimer)}}).observe(intro,{attributes:true,attributeFilter:['hidden']});
document.querySelector('#rewardsToggle').addEventListener('click',()=>document.querySelector('.rewards-widget').classList.remove('awaiting-reward'));
// Logo replay is a click, so the animation restarts with BGM and sting.
document.addEventListener('tour:replay',beginIntro);
beginIntro();
