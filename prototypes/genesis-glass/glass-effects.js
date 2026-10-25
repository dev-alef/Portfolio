import * as THREE from 'three';
// Fixed orthographic camera; only small decorative objects move. No video processing.
export function startGlassEffects(){
 const canvas=document.querySelector('#glass-atmosphere');let renderer;
 try{renderer=new THREE.WebGLRenderer({canvas,alpha:true,antialias:false,powerPreference:'low-power'});}catch{return;}
 renderer.setPixelRatio(Math.min(devicePixelRatio,1.25));
 const scene=new THREE.Scene(),camera=new THREE.OrthographicCamera(-1,1,1,-1,.1,10);camera.position.z=2;
 const positions=new Float32Array(36*3),seeds=new Float32Array(36);
 for(let i=0;i<36;i++){positions[i*3]=Math.sin(i*17.13);positions[i*3+1]=Math.cos(i*7.37);seeds[i]=i*.317;}
 const geometry=new THREE.BufferGeometry();geometry.setAttribute('position',new THREE.BufferAttribute(positions,3));geometry.setAttribute('seed',new THREE.BufferAttribute(seeds,1));
 const material=new THREE.ShaderMaterial({transparent:true,depthWrite:false,uniforms:{time:{value:0},pixelRatio:{value:renderer.getPixelRatio()}},vertexShader:`uniform float time;uniform float pixelRatio;attribute float seed;varying float glow;void main(){vec3 p=position;p.x+=sin(time*.11+seed)*.035;p.y+=sin(time*.08+seed*2.)*.045;gl_Position=projectionMatrix*modelViewMatrix*vec4(p,1.);gl_PointSize=(2.+sin(seed)*.6)*pixelRatio;glow=.18+.12*sin(time*.3+seed);}`,fragmentShader:`varying float glow;void main(){float d=length(gl_PointCoord-.5);float a=smoothstep(.5,.04,d)*glow;gl_FragColor=vec4(.70,.88,.73,a);}`});
 scene.add(new THREE.Points(geometry,material));
 let frame=0,last=0,disposed=false;const reduced=matchMedia('(prefers-reduced-motion: reduce)');
 function draw(t){frame=0;if(disposed||document.hidden||reduced.matches)return;if(t-last>50){last=t;material.uniforms.time.value=t*.001;renderer.render(scene,camera);}frame=requestAnimationFrame(draw);}
 function resume(){cancelAnimationFrame(frame);frame=0;if(!document.hidden&&!reduced.matches&&!disposed)frame=requestAnimationFrame(draw);else renderer.clear();}
 function resize(){renderer.setSize(innerWidth,innerHeight,false);}resize();resume();
 document.addEventListener('visibilitychange',resume);reduced.addEventListener('change',resume);addEventListener('resize',resize);
 canvas.addEventListener('webglcontextlost',e=>{e.preventDefault();cancelAnimationFrame(frame);disposed=true;canvas.style.display='none';});
 addEventListener('pagehide',()=>{cancelAnimationFrame(frame);disposed=true;geometry.dispose();material.dispose();renderer.dispose();},{once:true});
}
