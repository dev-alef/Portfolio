import * as THREE from 'three';
import { createForest } from './forest-world.js';
import { STOPS, PATHS, CAPTIONS, CONTACT } from './scene-config.js';
import { Journey } from './journey.js';
import { AmbientAudio } from './ambient-audio.js';

const $ = id => document.getElementById(id);
const media = matchMedia('(prefers-reduced-motion: reduce)');
const audio = new AmbientAudio();
const canvas = $('forest-scene');
let renderer, world, camera, ready = false, lost = false, fallback = false;
let frame = 0, lastTime = 0, ambientTime = 0, drawnStage = -1, lastBusy = false;
const curves = PATHS.map(points => new THREE.CatmullRomCurve3(points.map(p=>new THREE.Vector3(...p)),false,'centripetal'));
const targetCurves = [
  [STOPS[0].target,[0,1.8,9],[0,1.8,3],STOPS[1].target],
  [STOPS[1].target,[2.6,1.1,-3.6],[2.6,1.1,-3.5],STOPS[2].target],
  [STOPS[2].target,[9,17,-8],[9,43,-8],[4,64,-25],STOPS[3].target],
  [STOPS[3].target,[6,43,-9],[7,16,-8],[2.6,1.3,-3.8],STOPS[4].target],
  [STOPS[4].target,[2.2,1.15,-3.6],[-2,1.8,-4],STOPS[5].target],
].map(points=>new THREE.CatmullRomCurve3(points.map(p=>new THREE.Vector3(...p)),false,'centripetal'));
const journey = new Journey({ reduced: media.matches, onChange: sync });
$('contact').href = CONTACT;
function sync() {
  const busy = journey.busy;
  document.body.dataset.moving = String(busy);
  document.body.dataset.stage = String(journey.stage);
  document.documentElement.dataset.journeyValue = journey.value.toFixed(4);
  $('previous').disabled = busy || journey.stage===0;
  $('next').disabled = busy || journey.stage===5;
  $('explore').disabled = busy;
  $('skip').textContent = journey.stage===5 && !busy ? 'Rever experiência ↺' : 'Pular animação ↗';
  if (busy && !lastBusy) audio.whoosh();
  if (!busy && lastBusy && renderer) renderer.shadowMap.needsUpdate=true;
  lastBusy=busy;
  if (drawnStage !== journey.stage || !busy) {
    const [tag,headline,description]=CAPTIONS[journey.stage];
    $('eyebrow').textContent=tag;
    if(journey.stage===0)$('headline').innerHTML='Tecnologia que<br/><em>cria raízes.</em>';
    else $('headline').textContent=headline;
    $('description').textContent=description;
    $('explore').hidden=journey.stage!==0;
    $('contact').hidden=journey.stage!==5;
    $('counter').textContent=`0${journey.stage} / 05`;
    $('chapter').textContent=tag.replace(/^\d+ \/ /,'').toLowerCase();
    $('hint').textContent=journey.stage===5?'Role para cima para revisitar ↑':'Role ou deslize para descobrir ↓';
    document.querySelectorAll('.progress li').forEach((item,i)=>{item.classList.toggle('done',i<journey.stage);if(i===journey.stage-1)item.setAttribute('aria-current','step');else item.removeAttribute('aria-current');});
    if(!busy)$('scene-status').textContent=`${journey.stage} de 5. ${headline}`;
    drawnStage=journey.stage;
  }
  wake();
}
function step(direction) { if(!ready&&!fallback)return false; return journey.go(direction); }
$('explore').addEventListener('click',()=>step(1));
$('next').addEventListener('click',()=>step(1));
$('previous').addEventListener('click',()=>step(-1));
function skip() { journey.jump(journey.stage===5&&!journey.busy?0:5); }
$('skip').addEventListener('click',skip);
$('home').addEventListener('click',e=>{e.preventDefault();journey.jump(0);});
$('sound').addEventListener('click',async()=>{
  try { const enabled=await audio.toggle();$('sound').setAttribute('aria-pressed',String(enabled));$('sound-label').textContent=enabled?'Silenciar':'Ativar som'; }
  catch { $('sound-label').textContent='Som indisponível';$('sound').disabled=true; }
});
addEventListener('wheel',event=>{
  if(event.ctrlKey||Math.abs(event.deltaX)>Math.abs(event.deltaY)||event.target.closest('a,button'))return;
  event.preventDefault();
  if(!ready&&!fallback)return;
  const multiplier=event.deltaMode===1?16:event.deltaMode===2?innerHeight:1;
  journey.wheel(event.deltaY*multiplier);
},{passive:false});
let touch=null;
addEventListener('touchstart',event=>{if(event.touches.length!==1||event.target.closest('a,button')){touch=null;return;}const t=event.touches[0];touch={x:t.clientX,y:t.clientY,blocked:journey.busy};},{passive:true});
addEventListener('touchmove',event=>{if(touch&&Math.abs(event.touches[0].clientY-touch.y)>10)event.preventDefault();},{passive:false});
addEventListener('touchend',event=>{if(!touch)return;const start=touch;touch=null;if(start.blocked||journey.busy)return;const t=event.changedTouches[0],dy=start.y-t.clientY,dx=start.x-t.clientX;if(Math.abs(dy)>45&&Math.abs(dy)>Math.abs(dx)*1.3)step(Math.sign(dy));},{passive:true});
addEventListener('touchcancel',()=>{touch=null;},{passive:true});
addEventListener('keydown',event=>{
  if(event.repeat||event.altKey||event.ctrlKey||event.metaKey||event.target.closest('a,button,input,textarea,select,[contenteditable]'))return;
  const dir=['ArrowDown','ArrowRight','PageDown',' '].includes(event.key)?1:['ArrowUp','ArrowLeft','PageUp'].includes(event.key)?-1:0;
  if(dir){event.preventDefault();step(dir);}else if(event.key==='End'){event.preventDefault();journey.jump(5);}else if(event.key==='Home'){event.preventDefault();journey.jump(0);}
});
media.addEventListener('change',()=>{journey.reduced=media.matches||fallback;if(journey.busy&&journey.reduced)journey.jump(journey.motion.to);wake();});
document.addEventListener('visibilitychange',()=>{
  if(document.hidden){cancelAnimationFrame(frame);frame=0;audio.suspend();if(journey.busy)journey.jump(journey.motion.to);}
  else{lastTime=performance.now();audio.resume();wake();}
});
function showFallback(message='Prévia em imagem. Você pode navegar pelas cinco etapas.') {
  fallback=true;ready=false;journey.reduced=true;
  if(journey.busy)journey.jump(journey.motion.to);
  document.documentElement.dataset.sceneReady='false';document.documentElement.dataset.fallback='true';
  $('loading').hidden=false;$('loading').firstElementChild.textContent=message;$('load-number').textContent='';
  $('explore').disabled=false;sync();
}
function wake(){if(!frame&&!document.hidden&&ready&&!lost)frame=requestAnimationFrame(render);}
const cameraTarget=new THREE.Vector3();
function render(time) {
  frame=0;
  if(!ready||lost||document.hidden)return;
  const delta=Math.min(.1,Math.max(0,(time-lastTime)/1000));lastTime=time;ambientTime+=delta;
  journey.tick();
  const phase=journey.value,index=Math.min(4,Math.floor(phase)),t=phase-index;
  camera.position.copy(curves[index].getPointAt(t));
  cameraTarget.copy(targetCurves[index].getPoint(t));
  camera.lookAt(cameraTarget);
  world.update(ambientTime,phase,media.matches,camera);
  renderer.render(world.scene,camera);
  audio.update(ambientTime,phase);
  document.documentElement.dataset.drawCalls=String(renderer.info.render.calls);
  document.documentElement.dataset.triangles=String(renderer.info.render.triangles);
  if(!media.matches||journey.busy)wake();
}
function resize(){if(!renderer||!camera||lost)return;renderer.setPixelRatio(Math.min(devicePixelRatio,innerWidth<700?1.15:1.5));renderer.setSize(innerWidth,innerHeight);camera.aspect=innerWidth/innerHeight;camera.fov=innerWidth<700?65:58;camera.updateProjectionMatrix();wake();}
addEventListener('resize',resize);
canvas.addEventListener('webglcontextlost',event=>{event.preventDefault();lost=true;cancelAnimationFrame(frame);frame=0;showFallback('Conexão gráfica interrompida. A navegação continua disponível.');});
canvas.addEventListener('webglcontextrestored',()=>{if(!world)return;lost=false;ready=true;fallback=false;journey.reduced=media.matches;renderer.shadowMap.needsUpdate=true;document.documentElement.dataset.sceneReady='true';delete document.documentElement.dataset.fallback;$('loading').hidden=true;resize();wake();});
async function start(){
  try{
    renderer=new THREE.WebGLRenderer({canvas,antialias:true,powerPreference:'high-performance'});
    renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.03;
    renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;renderer.shadowMap.autoUpdate=false;renderer.shadowMap.needsUpdate=true;
    camera=new THREE.PerspectiveCamera(58,1,.08,900);
    world=await createForest(renderer,progress=>{$('load-number').textContent=`${Math.round(progress*100)}%`;$('load-bar').style.width=`${progress*100}%`;});
    if(lost)return;
    ready=true;resize();camera.position.fromArray(STOPS[journey.stage].position);camera.lookAt(new THREE.Vector3(...STOPS[journey.stage].target));
    // First visible frame is compiled before dismissing the loading overlay.
    await renderer.compileAsync(world.scene,camera);
    document.documentElement.dataset.sceneReady='true';$('loading').hidden=true;lastTime=performance.now();sync();wake();
  }catch(error){console.error('A cena 3D não pôde iniciar:',error);showFallback();renderer?.dispose();}
}
sync();start();
