export const arrowIcon=(direction='diagonal')=>`<svg class="ui-arrow" viewBox="0 0 24 24" fill="none" aria-hidden="true" focusable="false"><path d="${direction==='left'?'M20 12H4m6-6-6 6 6 6':direction==='right'?'M4 12h16m-6-6 6 6-6 6':'M5 19 19 5M6 5h13v13'}"/></svg>`;
import {gsap} from 'gsap';
export const audioIcon=(muted=false)=>`<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M11 5 6 9H3v6h3l5 4V5Z"/>${muted?'<path d="m16 9 5 6m0-6-5 6"/>':'<path d="M15 8a6 6 0 0 1 0 8m3-11a10 10 0 0 1 0 14"/>'}</svg>`;
export const decodeLabel=text=>`<span class="decode-label" data-label="${text}" aria-hidden="true"><span>${text}</span></span>`;
export function initSiteInteractions(){
 const reduced=matchMedia('(prefers-reduced-motion: reduce)'),states=new Map();
 function stop(el){const s=states.get(el);if(s){cancelAnimationFrame(s.frame);s.label.textContent=s.original;s.label.style.removeProperty('color');states.delete(el);}}
 function prepare(el){
 if(el.querySelector('.decode-label'))return;
 const nodes=[...el.childNodes].filter(n=>n.nodeType===3&&n.textContent.trim());
 if(!nodes.length)return;
 if(!el.hasAttribute('aria-label'))el.setAttribute('aria-label',el.textContent.trim());
 const node=nodes[0],text=node.textContent.trim(),holder=document.createElement('span');holder.className='decode-label';holder.dataset.label=text;holder.setAttribute('aria-hidden','true');const label=document.createElement('span');label.textContent=text;holder.append(label);node.replaceWith(holder);el.dataset.siteDecode='';
 }
 const selector='[data-site-decode],a:not(.primary):not(.brand),button.text-link';
 function play(el){prepare(el);stop(el);if(reduced.matches)return;const holder=el.querySelector('.decode-label'),label=holder?.firstElementChild;if(!label)return;const original=holder.dataset.label,s={label,original,frame:0};states.set(el,s);const start=performance.now();function tick(now){if(!el.isConnected||reduced.matches){stop(el);return;}const elapsed=now-start,p=Math.min(1,elapsed/550),chars='!#$%01923@ABCDEFGHIJKLMNOPQRSTUVWXYZ&*?{}[]<>/+';label.style.color=`rgb(${Math.round(80+175*p)},${Math.round(210+45*p)},${Math.round(135+120*p)})`;label.textContent=[...original].map((c,i)=>c===' '?' ':i<p*original.length?c:chars[(Math.floor(elapsed/65)+i*7)%chars.length]).join('');if(p<1)s.frame=requestAnimationFrame(tick);else stop(el);}s.frame=requestAnimationFrame(tick);}
 document.addEventListener('pointerover',e=>{const el=e.target.closest(selector);if(el&&e.pointerType==='mouse'&&!el.contains(e.relatedTarget))play(el);});
 document.addEventListener('pointerout',e=>{const el=e.target.closest(selector);if(el&&!el.contains(e.relatedTarget))stop(el);});
 document.addEventListener('focusin',e=>{const el=e.target.closest(selector);if(el)play(el);});document.addEventListener('focusout',e=>{const el=e.target.closest(selector);if(el)stop(el);});reduced.addEventListener('change',()=>states.forEach((_,el)=>stop(el)));
 const menu=document.querySelector('#mobile-menu'),toggle=document.querySelector('#menu-toggle');
 let menuMotion;
 toggle.onclick=()=>{menuMotion?.kill();menu.showModal();toggle.setAttribute('aria-expanded','true');if(reduced.matches)return;
 menuMotion=gsap.timeline().fromTo(menu,{opacity:0,y:-18,scale:.97},{opacity:1,y:0,scale:1,duration:.35,ease:'power3.out',clearProps:'transform,opacity'}).fromTo(menu.querySelectorAll('nav button'),{opacity:0,y:12},{opacity:1,y:0,duration:.3,stagger:.045,clearProps:'transform,opacity'},.12);};
 function closeMenu(){menuMotion?.kill();if(reduced.matches){menu.close();return;}menuMotion=gsap.to(menu,{opacity:0,y:-10,duration:.18,onComplete:()=>{menu.close();gsap.set(menu,{clearProps:'transform,opacity'});}});}
 menu.addEventListener('cancel',e=>{e.preventDefault();closeMenu();});
 function letters(link){if(reduced.matches)return;const label=link.querySelector('.char-label');if(!label.children.length){label.replaceChildren(...[...label.textContent].map(c=>{const span=document.createElement('span');span.textContent=c;return span;}));}gsap.killTweensOf(label.children);gsap.fromTo(label.children,{y:0},{keyframes:[{y:-5,duration:.16},{y:0,duration:.22}],stagger:.018,ease:'power2.out'});}
 document.addEventListener('pointerover',e=>{const link=e.target.closest('[data-site-letters]');if(link&&!link.contains(e.relatedTarget))letters(link);});
 document.addEventListener('focusin',e=>{const link=e.target.closest('[data-site-letters]');if(link)letters(link);});
 menu.addEventListener('close',()=>{menuMotion?.kill();gsap.set([menu,...menu.querySelectorAll('nav button')],{clearProps:'transform,opacity'});toggle.setAttribute('aria-expanded','false');});
 menu.querySelector('.menu-close').onclick=closeMenu;
 menu.addEventListener('click',e=>{if(e.target.closest('[data-goto]'))menu.close();else if(e.target===menu){const r=menu.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)menu.close();}});
 matchMedia('(min-width: 901px)').addEventListener('change',e=>{if(e.matches&&menu.open)menu.close();});
}
