import {audioIcon,initSiteInteractions} from './site-interactions.js';
import { createPanels } from './panels.js';
import { chapters } from './content.js';
import { Journey } from './journey.js';
import { FILM, filmRange } from './film-config.js';
const $=id=>document.getElementById(id);
const forward=$('film-forward'), backward=$('film-backward'), soundtrack=$('film-audio');
const reduced=matchMedia('(prefers-reduced-motion: reduce)');
let active=forward, run=null, serial=0, ready=false, fallback=false, sound=false, lastBusy=false, frame=0;
let watchdog=0;
const panels=createPanels({navigate:jump,next:()=>step(1),explore:withSound=>{setSound(withSound);step(1);}});
const journey=new Journey({reduced:reduced.matches,onChange:sync});

forward.muted=backward.muted=true;forward.defaultMuted=backward.defaultMuted=true;
for(const video of [forward,backward]){video.setAttribute('playsinline','');video.setAttribute('webkit-playsinline','');}
forward.src=innerWidth<700?FILM.mobile:FILM.forward;forward.poster=FILM.poster;
backward.dataset.src=innerWidth<700?FILM.reverseMobile:FILM.reverse;
soundtrack.src=FILM.audio;
forward.muted=backward.muted=true;
function status(text){$('scene-status').textContent=text;}
function sync(){
 document.body.dataset.stage=journey.stage;
 document.body.dataset.moving=String(journey.busy);
 document.documentElement.dataset.journeyValue=journey.value.toFixed(4);
 const destination=journey.motion?.to??journey.stage;
 $('previous').disabled=destination===0;
 $('next').disabled=destination===5;
 $('counter').textContent=`0${journey.stage} / 05`;
 $('chapter').textContent=chapters[journey.stage];
 document.querySelectorAll('.progress li').forEach((li,i)=>{li.classList.toggle('done',i<journey.stage);if(i===journey.stage-1)li.setAttribute('aria-current','step');else li.removeAttribute('aria-current');});
 if(!journey.busy){panels.show(journey.stage);status(`${journey.stage} de 5. ${chapters[journey.stage]}`);}
 if(journey.busy&&!lastBusy){lastBusy=true;startMovement(journey.motion.from,journey.motion.to);}
 lastBusy=journey.busy;
}
function waitFor(video,event,predicate,timeout=12000){
 if(predicate())return Promise.resolve();
 return new Promise((resolve,reject)=>{
  const timer=setTimeout(()=>finish(new Error(`Tempo excedido: ${event}`)),timeout);
  const check=()=>{if(predicate())finish();};
  const fail=()=>finish(new Error('Falha no arquivo de vídeo'));
  function finish(error){clearTimeout(timer);video.removeEventListener(event,check);video.removeEventListener('error',fail);error?reject(error):resolve();}
  video.addEventListener(event,check);video.addEventListener('error',fail);
 });
}
async function seek(video,time,force=false){
 await waitFor(video,'loadedmetadata',()=>video.readyState>=1);
 const target=Math.max(0,Math.min(time,video.duration-1/24));
 if(force||Math.abs(video.currentTime-target)>.015){video.currentTime=target;await waitFor(video,'seeked',()=>!video.seeking);}
 await waitFor(video,'loadeddata',()=>video.readyState>=2);
}
function playWithin(video){
 let timer;const play=video.play();
 return Promise.race([play,new Promise((_,reject)=>{timer=setTimeout(()=>{reject(new Error('Tempo de reprodução excedido'));},12000);})]).finally(()=>clearTimeout(timer));
}
function show(video){
 active=video;forward.classList.toggle('visible',video===forward);backward.classList.toggle('visible',video===backward);
 document.documentElement.dataset.sceneReady='true';
}
async function syncAudio(){
 const token=serial;
 if(!sound||!run||run.reverse){soundtrack.pause();return;}
 try{await seek(soundtrack,active.currentTime);if(token===serial&&sound&&run&&!run.reverse)await soundtrack.play();}catch{status('O vídeo continua sem áudio.');}
}
function stopMedia(keepAudio=false){forward.pause();backward.pause();if(!keepAudio)soundtrack.pause();cancelAnimationFrame(frame);frame=0;clearTimeout(watchdog);}
function restartWatchdog(token){clearTimeout(watchdog);watchdog=setTimeout(()=>{if(token===serial&&run)fail('O vídeo demorou a carregar. Use as setas para continuar.');},20000);}
async function startMovement(from,to){
 const token=++serial;stopMedia(true);
 const range=filmRange(from,to),video=range.reverse?backward:forward;
 run={...range,from,to,video,token};
 if(!video.src){video.src=video.dataset.src;video.load();}
 restartWatchdog(token);
 // Called synchronously from the gesture, before awaiting panel animations.
 const priming=playWithin(video);priming.catch(()=>{});
 try{
  await panels.leave();
  await priming;
  if(token!==serial)return;video.pause();
  await seek(video,range.start);
  if(token!==serial)return;
  show(video);video.playbackRate=1;
  await playWithin(video);
  if(token!==serial)return;
  ready=true;window.__ready=true;
  $('loading').hidden=true;
  frame=requestAnimationFrame(tick);
  syncAudio();
 }catch(error){if(token===serial)fail('Não foi possível reproduzir este trecho. A navegação e o contato continuam disponíveis.');}
}
async function tick(){
 frame=0;if(!run||!journey.busy)return;
 const {video,start,end,to}=run;
 const fraction=Math.max(0,Math.min(1,(video.currentTime-start)/(end-start)));
 if(journey.motion)journey.motion.eased=fraction;
 document.documentElement.dataset.journeyValue=journey.value.toFixed(4);
 document.documentElement.dataset.filmTime=(run.reverse?FILM.lastFrame-video.currentTime:video.currentTime).toFixed(3);
 if(video.currentTime>=end-1/48||video.ended){
  video.pause();soundtrack.pause();clearTimeout(watchdog);run=null;
  const token=serial;
  try{await seek(video,end,true);}catch{}
  if(token===serial)journey.jump(to);
  return;
 }
 frame=requestAnimationFrame(tick);
}
async function jump(stage){
 const token=++serial;stopMedia();run=null;
 const priming=!fallback&&forward.readyState<2?playWithin(forward):null;priming?.catch(()=>{});
 await panels.leave();
 if(token!==serial)return;
 if(fallback){journey.jump(stage);return;}
 try{if(priming){await priming;if(token!==serial)return;forward.pause();}await seek(forward,FILM.stops[stage]);if(token===serial){ready=true;window.__ready=true;$('loading').hidden=true;show(forward);journey.jump(stage);}}catch{if(token===serial)fail('Exibindo a composição estática.');}
}
function step(direction){
 if(journey.busy){jump(Math.max(0,Math.min(5,(journey.motion?.to??journey.stage)+direction)));return;}
 if(reduced.matches||fallback){jump(Math.max(0,Math.min(5,journey.stage+direction)));return;}
 journey.go(direction);
}
function fail(message){
 ++serial;stopMedia();run=null;fallback=true;ready=false;
 const target=journey.motion?.to??journey.stage;journey.reduced=true;journey.jump(target);
 $('loading').hidden=false;$('loading').firstElementChild.textContent=message;$('load-number').textContent='';$('loading').querySelector('.load-track').hidden=true;$('retry-video').hidden=false;
 document.documentElement.dataset.fallback='true';status(message);window.__ready=true;
}
$('next').addEventListener('click',()=>step(1));$('previous').addEventListener('click',()=>step(-1));
$('home').addEventListener('click',e=>{e.preventDefault();jump(0);});
function soundUI(label=sound?'Silenciar':'Ativar som'){
 $('sound').setAttribute('aria-pressed',String(sound));$('sound').setAttribute('aria-label',label);$('sound').title=label;$('sound-label').textContent=label;$('sound-icon').innerHTML=audioIcon(!sound);
}
let soundRequest=0;
async function setSound(enabled){
 const request=++soundRequest;
 sound=enabled;soundUI();if(!sound){soundtrack.pause();return;}
 // Unlock audio synchronously from the visitor's click, before the panel exit.
 try{soundtrack.currentTime=run&&!run.reverse?active.currentTime:FILM.stops[journey.stage];const playback=soundtrack.play();await playback;if(request!==soundRequest)return;if(!sound||!run||run.reverse)soundtrack.pause();}
 catch(error){if(error.name!=='AbortError'&&request===soundRequest&&sound){sound=false;soundUI('Som indisponível');}}
}
$('sound').addEventListener('click',()=>setSound(!sound));soundUI();initSiteInteractions();

function contentGesture(target){
 if(target.closest('a,button,input,textarea,select,summary,dialog,.projects-rail,.filters,.contact-form,.faq-panel'))return true;
 const content=target.closest('#panels');
 return content&&content.scrollHeight>content.clientHeight+2;
}
addEventListener('wheel',event=>{
 if($('mobile-menu').open||event.ctrlKey||Math.abs(event.deltaX)>Math.abs(event.deltaY)||contentGesture(event.target))return;
 event.preventDefault();
 const before=journey.stage;
 journey.wheel(event.deltaY*(event.deltaMode===1?16:event.deltaMode===2?innerHeight:1));
 if(!journey.busy&&journey.stage!==before)jump(journey.stage);
},{passive:false});
let touch;
addEventListener('touchstart',e=>{if($('mobile-menu').open||e.touches.length!==1||contentGesture(e.target)){touch=null;return;}touch={x:e.touches[0].clientX,y:e.touches[0].clientY,blocked:journey.busy};},{passive:true});
addEventListener('touchmove',e=>{if(touch&&Math.abs(touch.y-e.touches[0].clientY)>10)e.preventDefault();},{passive:false});
addEventListener('touchend',e=>{if(!touch)return;const t=touch;touch=null;if(t.blocked||journey.busy)return;const dy=t.y-e.changedTouches[0].clientY,dx=t.x-e.changedTouches[0].clientX;if(Math.abs(dy)>45&&Math.abs(dy)>Math.abs(dx)*1.3)step(Math.sign(dy));},{passive:true});
addEventListener('touchcancel',()=>touch=null,{passive:true});
addEventListener('keydown',e=>{if($('mobile-menu').open||e.repeat||e.ctrlKey||e.altKey||e.metaKey||e.target.closest('button,a,input,textarea,select,summary,dialog,[contenteditable]'))return;const d=['ArrowDown','ArrowRight','PageDown',' '].includes(e.key)?1:['ArrowUp','ArrowLeft','PageUp'].includes(e.key)?-1:0;if(d){e.preventDefault();step(d);}else if(e.key==='End'){e.preventDefault();jump(5);}else if(e.key==='Home'){e.preventDefault();jump(0);}});
reduced.addEventListener('change',()=>{journey.reduced=reduced.matches||fallback;if(journey.busy&&reduced.matches)jump(journey.motion.to);});
document.addEventListener('visibilitychange',()=>{if(document.hidden&&journey.busy)jump(journey.motion.to);if(document.hidden)soundtrack.pause();});
for(const video of [forward,backward]){
 video.addEventListener('timeupdate',()=>{if(run?.video===video){restartWatchdog(run.token);if(!frame)frame=requestAnimationFrame(tick);}});
 video.addEventListener('waiting',()=>{if(run?.video===video){soundtrack.pause();$('loading').hidden=false;$('loading').firstElementChild.textContent='Carregando o próximo trecho';$('load-number').textContent='';}});
 video.addEventListener('playing',()=>{if(run?.video===video){$('loading').hidden=true;syncAudio();}});
 video.addEventListener('error',()=>{if(video===forward||run?.video===video)fail('O filme está indisponível. A navegação e o contato continuam acessíveis.');});
}
async function init(){
 const token=serial;sync();
 try{
  await waitFor(forward,'loadedmetadata',()=>forward.readyState>=1,8000);
  if(token!==serial)return;
  ready=true;$('loading').hidden=true;
  // A mobile browser may defer decoded frames until an explicit play gesture.
  // The supplied poster is shown immediately; exploration primes play first.
  show(forward);sync();window.__ready=true;
 }catch{if(token===serial)fail('O vídeo não carregou. Você pode tentar novamente ou navegar pelas seções.');}
}
$('retry-video').onclick=async()=>{
 const token=++serial;stopMedia();run=null;forward.load();$('retry-video').hidden=true;$('loading').querySelector('.load-track').hidden=false;$('loading').firstElementChild.textContent='Tentando carregar o vídeo';
 try{await playWithin(forward);if(token!==serial)return;forward.pause();await seek(forward,FILM.stops[journey.stage]);if(token!==serial)return;ready=true;fallback=false;journey.reduced=reduced.matches;delete document.documentElement.dataset.fallback;$('loading').hidden=true;show(forward);sync();}
 catch{if(token===serial)fail('O vídeo continua indisponível. As seções e o contato estão acessíveis.');}
};

init();
if(!reduced.matches&&innerWidth>760&&(navigator.deviceMemory??8)>=4)import('./glass-effects.js').then(m=>m.startGlassEffects()).catch(()=>{});
