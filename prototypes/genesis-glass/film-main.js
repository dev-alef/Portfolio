import { createPanels } from './panels.js';
import { chapters } from './content.js';
import { Journey } from './journey.js';
import { FILM, filmRange } from './film-config.js';
const $=id=>document.getElementById(id);
const forward=$('film-forward'), backward=$('film-backward'), soundtrack=$('film-audio');
const reduced=matchMedia('(prefers-reduced-motion: reduce)');
let active=forward, run=null, serial=0, ready=false, fallback=false, sound=false, lastBusy=false, frame=0;
let watchdog=0;
const panels=createPanels({navigate:jump,next:()=>step(1)});
const journey=new Journey({reduced:reduced.matches,onChange:sync});

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
 $('skip').textContent=journey.stage===5&&!journey.busy?'Rever experiência ↺':'Pular animação ↗';
 $('counter').textContent=`0${journey.stage} / 05`;
 $('chapter').textContent=chapters[journey.stage];
 $('hint').textContent=journey.stage===5?'Role para ler · ↑ para voltar':matchMedia('(pointer:coarse)').matches?'Deslize no cenário ou use → para continuar':'Role sobre o cenário para continuar · ou use →';
 document.querySelectorAll('.progress li').forEach((li,i)=>{li.classList.toggle('done',i<journey.stage);if(i===journey.stage-1)li.setAttribute('aria-current','step');else li.removeAttribute('aria-current');});
 if(!journey.busy){panels.show(journey.stage);status(`${journey.stage} de 5. ${chapters[journey.stage]}`);}
 if(journey.busy&&!lastBusy){lastBusy=true;startMovement(journey.motion.from,journey.motion.to);}
 lastBusy=journey.busy;
}
function waitFor(video,event,predicate,timeout=20000){
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
function show(video){
 active=video;forward.classList.toggle('visible',video===forward);backward.classList.toggle('visible',video===backward);
 document.documentElement.dataset.sceneReady='true';
}
async function syncAudio(){
 const token=serial;
 if(!sound||!run||run.reverse){soundtrack.pause();return;}
 try{await seek(soundtrack,active.currentTime);if(token===serial&&sound&&run&&!run.reverse)await soundtrack.play();}catch{status('O vídeo continua sem áudio.');}
}
function stopMedia(){forward.pause();backward.pause();soundtrack.pause();cancelAnimationFrame(frame);frame=0;clearTimeout(watchdog);}
function restartWatchdog(token){clearTimeout(watchdog);watchdog=setTimeout(()=>{if(token===serial&&run)fail('O vídeo demorou a carregar. Use as setas para continuar.');},20000);}
async function startMovement(from,to){
 const token=++serial;stopMedia();
 const range=filmRange(from,to),video=range.reverse?backward:forward;
 run={...range,from,to,video,token};
 if(!video.src){video.src=video.dataset.src;video.load();}
 restartWatchdog(token);
 try{
  await panels.leave();
  if(token!==serial)return;
  await seek(video,range.start);
  if(token!==serial)return;
  show(video);video.playbackRate=1;
  await video.play();
  if(token!==serial){video.pause();return;}
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
 await panels.leave();
 if(token!==serial)return;
 if(!ready||fallback){journey.jump(stage);return;}
 try{await seek(forward,FILM.stops[stage]);if(token===serial){show(forward);journey.jump(stage);}}catch{if(token===serial)fail('Exibindo a composição estática.');}
}
function step(direction){
 if(!ready&&!fallback)return;
 if(journey.busy){jump(Math.max(0,Math.min(5,(journey.motion?.to??journey.stage)+direction)));return;}
 if(reduced.matches||fallback){jump(Math.max(0,Math.min(5,journey.stage+direction)));return;}
 journey.go(direction);
}
function fail(message){
 ++serial;stopMedia();run=null;fallback=true;ready=false;
 const target=journey.motion?.to??journey.stage;journey.reduced=true;journey.jump(target);
 $('loading').hidden=false;$('loading').firstElementChild.textContent=message;$('load-number').textContent='';
 document.documentElement.dataset.fallback='true';status(message);window.__ready=true;
}
$('next').addEventListener('click',()=>step(1));$('previous').addEventListener('click',()=>step(-1));
$('skip').addEventListener('click',()=>jump(journey.stage===5&&!journey.busy?0:5));
$('home').addEventListener('click',e=>{e.preventDefault();jump(0);});
$('sound').addEventListener('click',async()=>{
 sound=!sound;$('sound').setAttribute('aria-pressed',String(sound));$('sound-label').textContent=sound?'Silenciar':'Ativar som';
 if(!sound){soundtrack.pause();return;}
 // Unlock only through this explicit action. Backward playback stays silent.
 try{soundtrack.currentTime=run&&!run.reverse?active.currentTime:FILM.stops[journey.stage];await soundtrack.play();if(!run||run.reverse)soundtrack.pause();}
 catch{sound=false;$('sound').setAttribute('aria-pressed','false');$('sound-label').textContent='Som indisponível';}
});
function contentGesture(target){
 if(target.closest('a,button,input,textarea,select,summary,dialog,.projects-rail,.filters,.contact-form,.faq-panel'))return true;
 const content=target.closest('#panels');
 return content&&content.scrollHeight>content.clientHeight+2;
}
addEventListener('wheel',event=>{
 if(event.ctrlKey||Math.abs(event.deltaX)>Math.abs(event.deltaY)||contentGesture(event.target))return;
 event.preventDefault();if(!ready&&!fallback)return;
 const before=journey.stage;
 journey.wheel(event.deltaY*(event.deltaMode===1?16:event.deltaMode===2?innerHeight:1));
 if(!journey.busy&&journey.stage!==before)jump(journey.stage);
},{passive:false});
let touch;
addEventListener('touchstart',e=>{if(e.touches.length!==1||contentGesture(e.target)){touch=null;return;}touch={x:e.touches[0].clientX,y:e.touches[0].clientY,blocked:journey.busy};},{passive:true});
addEventListener('touchmove',e=>{if(touch&&Math.abs(touch.y-e.touches[0].clientY)>10)e.preventDefault();},{passive:false});
addEventListener('touchend',e=>{if(!touch)return;const t=touch;touch=null;if(t.blocked||journey.busy)return;const dy=t.y-e.changedTouches[0].clientY,dx=t.x-e.changedTouches[0].clientX;if(Math.abs(dy)>45&&Math.abs(dy)>Math.abs(dx)*1.3)step(Math.sign(dy));},{passive:true});
addEventListener('touchcancel',()=>touch=null,{passive:true});
addEventListener('keydown',e=>{if(e.repeat||e.ctrlKey||e.altKey||e.metaKey||e.target.closest('button,a,input,textarea,select,summary,dialog,[contenteditable]'))return;const d=['ArrowDown','ArrowRight','PageDown',' '].includes(e.key)?1:['ArrowUp','ArrowLeft','PageUp'].includes(e.key)?-1:0;if(d){e.preventDefault();step(d);}else if(e.key==='End'){e.preventDefault();jump(5);}else if(e.key==='Home'){e.preventDefault();jump(0);}});
reduced.addEventListener('change',()=>{journey.reduced=reduced.matches||fallback;if(journey.busy&&reduced.matches)jump(journey.motion.to);});
document.addEventListener('visibilitychange',()=>{if(document.hidden&&journey.busy)jump(journey.motion.to);if(document.hidden)soundtrack.pause();});
for(const video of [forward,backward]){
 video.addEventListener('timeupdate',()=>{if(run?.video===video){restartWatchdog(run.token);if(!frame)frame=requestAnimationFrame(tick);}});
 video.addEventListener('waiting',()=>{if(run?.video===video){soundtrack.pause();$('loading').hidden=false;$('loading').firstElementChild.textContent='Carregando o próximo trecho';$('load-number').textContent='';}});
 video.addEventListener('playing',()=>{if(run?.video===video){$('loading').hidden=true;syncAudio();}});
 video.addEventListener('error',()=>{if(video===forward||run?.video===video)fail('O filme está indisponível. A navegação e o contato continuam acessíveis.');});
}
async function init(){
 sync();
 try{
  await waitFor(forward,'loadeddata',()=>forward.readyState>=2);
  ready=true;await seek(forward,FILM.stops[journey.stage]);$('loading').hidden=true;show(forward);sync();window.__ready=true;
 }catch{fail('O filme não carregou. Você ainda pode acessar o contato.');}
}
init();
if(!reduced.matches&&innerWidth>760&&(navigator.deviceMemory??8)>=4)import('./glass-effects.js').then(m=>m.startGlassEffects()).catch(()=>{});
