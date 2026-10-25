export function mountSocialIcons(host){
 let disposed=false;const cleanups=[];
 const reduced=matchMedia('(prefers-reduced-motion: reduce)');
 import('lottie-web/build/player/lottie_light').then(({default:lottie})=>{
  if(disposed)return;
  host.querySelectorAll('[data-social]').forEach(container=>{
   const animation=lottie.loadAnimation({container,renderer:'svg',loop:false,autoplay:false,path:`/icons/${container.dataset.social}.json`});
   const link=container.closest('a');
   const play=()=>{if(!reduced.matches)animation.goToAndPlay(0,true);};
   const stop=()=>animation.goToAndStop(0,true);
   link.addEventListener('pointerenter',play);link.addEventListener('focus',play);reduced.addEventListener('change',stop);
   cleanups.push(()=>{link.removeEventListener('pointerenter',play);link.removeEventListener('focus',play);reduced.removeEventListener('change',stop);animation.destroy();});
  });
 }).catch(()=>{});
 return ()=>{disposed=true;cleanups.forEach(clean=>clean());};
}
