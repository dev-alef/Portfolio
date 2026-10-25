import {mountSocialIcons} from './social-icons.js';
import { gsap } from 'gsap';
import {audioIcon,decodeLabel} from './site-interactions.js';
import { PANEL_REVEAL_DELAY, FINAL_PANEL_REVEAL_DELAY } from './film-config.js';
import { solutions, services, process, faq, EMAIL, mailLink, whatsappLink, chapters } from './content.js';
const reduced=matchMedia('(prefers-reduced-motion: reduce)');
const tag=(text)=>`<p class="eyebrow"><span></span>${text}</p>`;
const heading=(label,title,description='')=>`<div class="section-heading reveal">${tag(label)}<h2>${title}</h2>${description?`<p class="lead">${description}</p>`:''}</div>`;
const card=(s,i)=>`<article class="glass project-card reveal" data-category="${s.category}" style="--order:${i}"><div class="project-image"><img src="/concepts/${s.image}.webp" alt="Prévia conceitual: ${s.title}" width="800" height="500" loading="lazy"><span class="image-label">${s.development?'Em desenvolvimento':'Conceito'} · Demonstrativo</span></div><div class="project-copy"><span class="category">${s.category}</span><h3>${s.title}</h3><p>${s.text}</p><button class="text-link" data-project="${i}" aria-label="Ver detalhes: ${s.title}">Ver detalhes <span>↗</span></button></div></article>`;
function section(stage){
 if(stage===0)return `<section class="scene scene-hero"><div class="hero-copy glass reveal">${tag('Desenvolvimento Web • Sistemas • Automações')}<h1>Tecnologia que<br><em>cria raízes.</em></h1><p class="hero-description">Desenvolvemos experiências digitais, sistemas inteligentes e automações que ajudam empresas a trabalhar melhor, atender mais e crescer com tecnologia.</p><div class="actions"><button class="primary explore-button" id="explore" data-explore-sound="true"><span class="explore-label">Explorar floresta com som</span><span class="explore-orbit">${audioIcon()}</span></button><button class="hero-menu-link" id="explore-muted" data-explore-sound="false" data-site-letters aria-label="Explorar sem som"><span class="char-label">Explorar sem som</span><span class="mute-link-icon" aria-hidden="true">${audioIcon(true)}</span></button><button class="text-link decode-action" data-site-decode data-goto="4" aria-label="Vamos conversar"><i class="decode-signal" aria-hidden="true"></i>${decodeLabel('Vamos conversar')}<span aria-hidden="true">↗</span></button></div><div class="hero-signature"><span class="seed-mark">✧</span> Do primeiro encontro à próxima evolução.</div></div><div class="scene-coordinate reveal" aria-hidden="true"><span>01 / FLORESTA DE POSSIBILIDADES</span><i></i><small>Uma ideia. Infinitas conexões.</small></div></section>`;
 if(stage===1)return `<section class="scene scene-solutions">${heading('01 / SOLUÇÕES','Ideias que ganham <em>forma.</em>','Soluções que podemos construir para você')}<div class="collection-toolbar reveal"><p>Projetos demonstrativos são conceitos que mostram o tipo de solução que desenvolvemos.</p><div class="rail-controls"><button data-rail="-1" aria-label="Projetos anteriores">←</button><button data-rail="1" aria-label="Mais projetos">→</button></div></div><div class="filters reveal" aria-label="Filtrar soluções">${['Todos',...solutions.map(s=>s.category)].map((c,i)=>`<button data-filter="${c}" aria-pressed="${i===0}">${c}</button>`).join('')}</div><div class="projects-rail scene-scroll" tabindex="0" aria-label="Projetos demonstrativos; role horizontalmente">${solutions.map(card).join('')}</div><p class="collection-note reveal"><span>EXEMPLOS ILUSTRATIVOS · NENHUM CASE DE CLIENTE</span><span id="result-count" role="status">6 conceitos</span></p></section>`;
 if(stage===2)return `<section class="scene scene-services">${heading('02 / SERVIÇOS','O que <em>fazemos.</em>','Tecnologia que resolve. Cuidado em cada entrega.')}<div class="service-grid">${services.map(([title,text],i)=>`<article class="glass service-card reveal"><span class="service-number">0${i+1}<i></i></span><h3>${title}</h3><p>${text}</p></article>`).join('')}</div></section>`;
 if(stage===3)return `<section class="scene scene-process">${heading('03 / PROCESSO','Como <em>trabalhamos.</em>','Um caminho claro, construído com você.')}<div class="process-grid"><svg class="process-line" viewBox="0 0 1000 100" preserveAspectRatio="none" aria-hidden="true"><path d="M0 50 C150 0 180 100 330 50 S500 0 660 50 S850 100 1000 50"/></svg>${process.map(([title,text],i)=>`<article class="glass process-card reveal"><div class="process-number"><span>0${i+1}</span><i>↗</i></div><h3>${title}</h3><p>${text}</p></article>`).join('')}</div><p class="process-footnote reveal">Explorar, entender e construir. <span>Depois, evoluir juntos.</span></p></section>`;
 if(stage===4)return `<section class="scene scene-contact"><div class="contact-copy reveal">${tag('04 / CONTATO')}<h2>Vamos construir<br><em>sua solução?</em></h2><p class="lead">Conte sua ideia ou o problema que você quer resolver. Respondemos para entender o seu projeto.</p><a class="email-link" href="${mailLink()}">${EMAIL} <span>↗</span></a><p class="contact-note">Toda boa solução começa com uma conversa.</p></div><form id="contact-form" class="glass contact-form reveal"><span class="category">O PRIMEIRO PASSO</span><h3>Conta pra gente.</h3><label>Seu nome<input name="name" autocomplete="name" required maxlength="100" placeholder="Como podemos chamar você?"></label><label>Seu e-mail<input name="email" type="email" autocomplete="email" required maxlength="180" placeholder="voce@empresa.com.br"></label><label>O que você quer construir?<textarea name="message" required minlength="10" maxlength="3000" rows="3" placeholder="Uma ideia, um desafio ou um processo para melhorar…"></textarea></label><button class="primary" type="submit">Preparar meu e-mail <span>↗</span></button><p class="form-note" id="form-status" role="status">Abre seu aplicativo de e-mail com a mensagem preenchida. Nada é enviado automaticamente.</p></form></section>`;
 return `<section class="scene scene-finale"><div class="finale-grid"><div class="finale-story reveal">${tag('05 / NOSSA ESSÊNCIA')}<h2>Explorar, entender<br>e <em>construir.</em></h2><p class="lead">Genesis Code Soluções desenvolve sites, sistemas personalizados, aplicações web e automações com inteligência artificial. Começamos entendendo o problema real do seu negócio e só então construímos a solução digital que faz sentido para ele.</p><div class="finale-contact"><h3>Vamos construir sua solução?</h3><p>Conte sua ideia ou o problema que você quer resolver. Respondemos para entender o seu projeto.</p><div class="final-actions"><a class="primary" href="${whatsappLink}" target="_blank" rel="noopener noreferrer">Conversar pelo WhatsApp <span aria-hidden="true">↗</span></a><a class="text-link" href="${mailLink('Solicitar orçamento')}">Orçamento por e-mail <span aria-hidden="true">↗</span></a></div><a class="final-email" href="${mailLink()}">${EMAIL}</a></div><div class="project-socials"><p>Conheça os meus projetos e links</p><div><a class="text-link social-link" href="https://github.com/dev-alef" target="_blank" rel="noopener noreferrer"><span class="social-icon" data-social="github" aria-hidden="true"></span>GitHub<span aria-hidden="true">↗</span></a><a class="text-link social-link" href="https://www.instagram.com/alrs0n_/" target="_blank" rel="noopener noreferrer"><span class="social-icon" data-social="instagram" aria-hidden="true"></span>Instagram<span aria-hidden="true">↗</span></a><a class="text-link social-link" href="https://www.linkedin.com/in/alersonferreira/" target="_blank" rel="noopener noreferrer"><span class="social-icon" data-social="linkedin" aria-hidden="true"></span>LinkedIn<span aria-hidden="true">↗</span></a></div></div></div><div class="glass faq-panel reveal"><span class="category">FAQ</span><h3>Perguntas frequentes</h3>${faq.map(([q,a],i)=>`<details><summary>${q}<span aria-hidden="true">+</span></summary><div class="answer"><p>${a}</p></div></details>`).join('')}</div></div><div class="signature-footer reveal"><span>© 2026 Genesis Code Soluções</span><em>Explorar, entender e construir.</em></div></section>`;

}
export function createPanels({navigate,next,explore}){
 const host=document.querySelector('#panels'),dialog=document.querySelector('#project-dialog');
 let current=-1, timeline=null, leaving=null, resolveLeave=null;
 let cleanIcons=()=>{};
 const tilts=new Map();let hovered=null;
 function resetTilt(){if(hovered){const motion=tilts.get(hovered);motion?.x(0);motion?.y(0);motion?.lift(0);hovered=null;}}
 function clearTilts(){hovered=null;for(const [card,motion] of tilts){motion.x.tween.kill();motion.y.tween.kill();motion.lift.tween.kill();card.removeAttribute('data-tilting');}tilts.clear();}

 function cancel(){cleanIcons();cleanIcons=()=>{};clearTilts();timeline?.kill();timeline=null;if(resolveLeave){resolveLeave();resolveLeave=null;}leaving=null;}
 function show(stage){
  if(current===stage&&!host.inert)return;
  cancel();current=stage;host.inert=false;host.innerHTML=section(stage);host.scrollTop=0;
  if(stage===5)cleanIcons=mountSocialIcons(host);
  document.querySelectorAll('[data-goto]').forEach(b=>b.toggleAttribute('data-current',Number(b.dataset.goto)===stage));
  const items=host.querySelectorAll('.reveal');
  if(reduced.matches){
   gsap.set(host,{autoAlpha:1});
   if(stage>0)host.focus({preventScroll:true});
  }else{
   // The video has already settled. This is a deliberate presentation pause.
   const delay=stage===5?FINAL_PANEL_REVEAL_DELAY:stage>0?PANEL_REVEAL_DELAY:0;
   const entryDuration=.5;
   gsap.set(host,{autoAlpha:0});
   timeline=gsap.timeline({defaults:{ease:'power3.out'}})
    .to(host,{autoAlpha:1,duration:.3},delay)
    .fromTo(items,{opacity:0,y:24,z:-45,rotationY:-3},{opacity:1,y:0,z:0,rotationY:0,duration:entryDuration,stagger:.04,clearProps:'transform'},delay+.1);
   if(stage===3)timeline.fromTo(host.querySelector('.process-line path'),{strokeDashoffset:1100},{strokeDashoffset:0,duration:1.4},delay+.35);
   if(stage>0)timeline.call(()=>host.focus({preventScroll:true}),[],delay+.3);
  }
 }
 function leave(){
  if(leaving)return leaving;
  cancel();host.inert=true;
  if(dialog.open)dialog.close();
  leaving=new Promise(resolve=>{resolveLeave=resolve;const done=()=>{resolveLeave=null;leaving=null;resolve();};if(reduced.matches){gsap.set(host,{autoAlpha:0});done();}else timeline=gsap.to(host,{autoAlpha:0,duration:.28,ease:'power2.in',onComplete:done});});
  return leaving;
 }
 document.addEventListener('click',event=>{
  const button=event.target.closest('button');if(!button)return;
  if(button.dataset.goto!==undefined)navigate(Number(button.dataset.goto));
  if(button.dataset.exploreSound!==undefined)explore(button.dataset.exploreSound==='true');
  if(button.dataset.filter){const category=button.dataset.filter;host.querySelectorAll('[data-filter]').forEach(b=>b.setAttribute('aria-pressed',String(b===button)));let count=0;host.querySelectorAll('.project-card').forEach(card=>{card.hidden=category!=='Todos'&&card.dataset.category!==category;if(!card.hidden)count++;});host.querySelector('.projects-rail').scrollLeft=0;document.querySelector('#result-count').textContent=`${count} ${count===1?'conceito':'conceitos'}`;if(!reduced.matches)gsap.fromTo(host.querySelectorAll('.project-card:not([hidden])'),{opacity:0,y:10},{opacity:1,y:0,duration:.35,stagger:.04,clearProps:'transform'});}
  if(button.dataset.rail)host.querySelector('.projects-rail').scrollBy({left:Number(button.dataset.rail)*350,behavior:reduced.matches?'instant':'smooth'});
  if(button.dataset.project!==undefined){const s=solutions[Number(button.dataset.project)];document.querySelector('#project-content').innerHTML=`<img class="dialog-image" src="/concepts/${s.image}.webp" alt="Conceito de ${s.title}"><p class="eyebrow">${s.development?'EM DESENVOLVIMENTO':'CONCEITO'} · DEMONSTRATIVO</p><h2 id="project-title">${s.title}</h2><p>${s.text}</p><ul>${s.features.map(f=>`<li>${f}</li>`).join('')}</ul><p class="disclaimer">Exemplo ilustrativo, sem vínculo com um projeto de cliente. O escopo real é definido em conversa.</p><a class="primary" href="${mailLink('Tenho interesse: '+s.title)}">Conversar sobre esta solução <span aria-hidden="true">↗</span></a>`;dialog.showModal();}
  if(button.classList.contains('dialog-close'))dialog.close();
 });
 dialog.addEventListener('click',e=>{if(e.target===dialog){const r=dialog.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)dialog.close();}});
 host.addEventListener('wheel',e=>{
  const rail=e.target.closest('.projects-rail,.filters');
  if(rail&&!e.ctrlKey&&rail.scrollWidth>rail.clientWidth+2&&Math.abs(e.deltaY)>Math.abs(e.deltaX)){
   e.preventDefault();rail.scrollLeft+=e.deltaY*(e.deltaMode===1?16:e.deltaMode===2?rail.clientWidth:1);
  }
 },{passive:false});
 host.addEventListener('submit',e=>{
  if(e.target.id!=='contact-form')return;e.preventDefault();
  const data=new FormData(e.target),name=String(data.get('name')).trim(),email=String(data.get('email')).trim(),message=String(data.get('message')).trim();
  if(!name||message.length<10){document.querySelector('#form-status').textContent='Escreva seu nome e conte um pouco mais sobre a ideia.';return;}
  const body=`Olá, Genesis Code!\n\nMeu nome é ${name}.\nE-mail para retorno: ${email}\n\n${message}`;
  const link=document.createElement('a');link.href=mailLink('Projeto de '+name)+'&body='+encodeURIComponent(body);link.click();
  document.querySelector('#form-status').textContent='Mensagem preparada. Envie pelo seu aplicativo de e-mail. Se ele não abriu, use o endereço ao lado.';
 });
 host.addEventListener('click',e=>{
  const summary=e.target.closest('summary');if(!summary||reduced.matches)return;
  const details=summary.parentElement,answer=details.querySelector('.answer');
  e.preventDefault();gsap.killTweensOf(answer);
  if(details.open){gsap.to(answer,{height:0,opacity:0,duration:.25,onComplete:()=>{details.open=false;gsap.set(answer,{clearProps:'all'});}});}
  else{details.open=true;gsap.fromTo(answer,{height:0,opacity:0},{height:'auto',opacity:1,duration:.35,ease:'power2.out',clearProps:'height,opacity'});}
 });
 host.addEventListener('pointermove',e=>{
  if(reduced.matches||e.pointerType!=='mouse'||host.inert||timeline?.isActive())return;
  const card=e.target.closest('.glass');
  if(!card){resetTilt();return;}
  if(card.contains(document.activeElement)&&document.activeElement.matches('input,textarea,select')){resetTilt();return;}
  if(hovered!==card)resetTilt();hovered=card;
  let motion=tilts.get(card);
  if(!motion){
   gsap.set(card,{'--tilt-x':0,'--tilt-y':0,'--tilt-lift':0});
   const options={duration:.5,ease:'power3.out'};
   motion={x:gsap.quickTo(card,'--tilt-x',options),y:gsap.quickTo(card,'--tilt-y',options),lift:gsap.quickTo(card,'--tilt-lift',{...options,onComplete:()=>{if(hovered!==card)card.removeAttribute('data-tilting');}})};
   tilts.set(card,motion);
  }
  card.setAttribute('data-tilting','');
  const r=card.getBoundingClientRect(),x=Math.max(-1,Math.min(1,(e.clientX-r.left)/r.width*2-1)),y=Math.max(-1,Math.min(1,(e.clientY-r.top)/r.height*2-1));
  motion.x(-y*2.8);motion.y(x*3.2);motion.lift(-4);
  card.style.setProperty('--shine-x',`${(x+1)*50}%`);card.style.setProperty('--shine-y',`${(y+1)*50}%`);
 });
 host.addEventListener('pointerout',e=>{if(hovered&&!hovered.contains(e.relatedTarget))resetTilt();});
 host.addEventListener('pointerleave',resetTilt);
 host.addEventListener('focusin',e=>{if(e.target.matches('input,textarea,select'))resetTilt();});
 reduced.addEventListener('change',()=>{cancel();if(!host.inert){gsap.set(host,{autoAlpha:1});gsap.set(host.querySelectorAll('.reveal'),{opacity:1,clearProps:'transform'});}});
 return {show,leave};
}
