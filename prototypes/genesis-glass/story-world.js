import * as THREE from 'three';
import { storyState } from './story-state.js';
import { terrainY } from './scene-config.js';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
const clamp = THREE.MathUtils.clamp;
const smooth = (a,b,x) => { const t=clamp((x-a)/(b-a),0,1); return t*t*(3-2*t); };

export function createStoryWorld(scene, textures, random, mobile) {
  const bark = new THREE.MeshStandardMaterial({map:textures.bark,normalMap:textures.barkNormal,normalScale:new THREE.Vector2(1.3,1.3),color:'#ad7655',roughness:.95});
  const moss = new THREE.MeshStandardMaterial({map:textures.floor,normalMap:textures.floorNormal,color:'#627a36',roughness:1});
  const darkWood = bark.clone(); darkWood.color.set('#493126');
  const stone = new THREE.MeshStandardMaterial({color:'#575b50',roughness:1});
  const mesh = (geo,mat,parent=scene) => { const o=new THREE.Mesh(geo,mat); o.castShadow=o.receiveShadow=true; parent.add(o); return o; };
  const sphere=new THREE.SphereGeometry(1,16,12), cube=new THREE.BoxGeometry(1,1,1);
  function ellipsoid(parent,mat,pos,scale) { const o=mesh(sphere,mat,parent); o.position.set(...pos);o.scale.set(...scale);return o; }
  function box(parent,mat,pos,scale) { const o=mesh(cube,mat,parent);o.position.set(...pos);o.scale.set(...scale);return o; }
  const segmentGeo=new THREE.CylinderGeometry(1,1,1,10), up=new THREE.Vector3(0,1,0);
  function placeSegment(o,a,b,r1,r2=r1) {
    const v=new THREE.Vector3().fromArray(b).sub(new THREE.Vector3().fromArray(a));
    o.position.fromArray(a).addScaledVector(v,.5);o.quaternion.setFromUnitVectors(up,v.clone().normalize());o.scale.set(r1,v.length(),r2);
  }
  function segment(parent,mat,a,b,r) {const o=mesh(segmentGeo,mat,parent);placeSegment(o,a,b,r);return o;}

  // Continuous hollow trunk: a gently bending tube with a real open interior.
  const tunnelPoints=Array.from({length:13},(_,i)=>new THREE.Vector3(.35*Math.sin(i/12*Math.PI*1.3),2.5,22-i*1.27));
  const axis=new THREE.CatmullRomCurve3(tunnelPoints);
  function wornTube(radius){
    const g=new THREE.TubeGeometry(axis,64,radius,48,false),p=g.attributes.position,uv=g.attributes.uv;
    for(let i=0;i<p.count;i++){const t=uv.getX(i),center=axis.getPointAt(t),a=uv.getY(i)*Math.PI*2;
      const f=1+.025*Math.sin(a*7)+.014*Math.sin(a*13+t*4);
      p.setXYZ(i,center.x+(p.getX(i)-center.x)*f,center.y+(p.getY(i)-center.y)*f,p.getZ(i));}
    g.computeVertexNormals();return g;
  }
  const outer=mesh(wornTube(3.3),bark);
  const innerMat=darkWood.clone();innerMat.side=THREE.BackSide;
  mesh(wornTube(2.72),innerMat);
  for(const end of [0,1]) {
    const ring=mesh(new THREE.RingGeometry(2.72,3.3,64),bark);ring.position.copy(axis.getPoint(end));ring.material=bark.clone();ring.material.side=THREE.DoubleSide;
    for(let i=0;i<6;i++){const patch=ellipsoid(scene,moss,[ring.position.x+Math.cos(i)*3.08,2.5+Math.sin(i)*3.08,ring.position.z],[.34,.14,.025]);patch.rotation.z=i;}
  }
  // Fallen log and the nearby tree share the clearing; no teleporting props.
  const seat=mesh(new THREE.CylinderGeometry(.36,.42,2.5,20),bark);seat.rotation.z=Math.PI/2;seat.position.set(2.6,.38,-3.9);
  const seatEnd=mesh(new THREE.CircleGeometry(.35,32),new THREE.MeshStandardMaterial({color:'#9a7752',roughness:1}));seatEnd.rotation.y=Math.PI/2;seatEnd.position.set(3.86,.38,-3.9);
  for(let i=0;i<8;i++)ellipsoid(scene,moss,[1.7+i*.23,.64,-4.12],[.22,.12,.23]);
  // Moss breaks up root silhouettes without luminous or artificial effects.
  for(let i=0;i<26;i++){const a=random()*Math.PI*2,r=2.4+random()*1.8;ellipsoid(scene,moss,[9+Math.cos(a)*r,.15+random()*.12,-8+Math.sin(a)*r],[.35+random()*.6,.13,.24+random()*.4]);}

  // Code sits on real curved bark geometry. Its material is transparent and unlit,
  // but not emissive/bloomed; the texture includes irregular gaps like bark fissures.
  function codeMap(lines) {
    const c=document.createElement('canvas');c.width=512;c.height=256;const x=c.getContext('2d');
    x.font='25px monospace';x.fillStyle='#7caa79';
    lines.forEach((line,i)=>x.fillText(line,24,48+i*46));
    x.globalCompositeOperation='destination-out';
    for(let i=0;i<180;i++){x.fillStyle=`rgba(0,0,0,${random()*.5})`;x.fillRect(random()*512,random()*256,1+random()*3,random()*80);}
    const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;return t;
  }
  function tunnelCode(z,angle,lines) {
    const center=axis.getPoint((22-z)/15.24);const geo=new THREE.CylinderGeometry(2.705,2.705,.85,24,1,true,angle,.55);
    // Cylinder's axis is Y; rotate to follow the fallen trunk's Z axis.
    geo.rotateX(Math.PI/2);
    const mat=new THREE.MeshBasicMaterial({map:codeMap(lines),transparent:true,opacity:.4,depthWrite:false,side:THREE.DoubleSide,polygonOffset:true,polygonOffsetFactor:-1});
    const o=mesh(geo,mat);o.position.set(center.x,center.y,z);o.castShadow=false;return o;
  }
  const darkness=mesh(new THREE.CircleGeometry(2.68,48),new THREE.MeshBasicMaterial({color:'#020403',transparent:true,opacity:1,depthWrite:false,side:THREE.DoubleSide}));darkness.position.set(0,2.5,19.5);darkness.castShadow=false;
  const codes=[tunnelCode(17,-1.3,['const origem = ideia;','criar({ propósito });']),tunnelCode(11,1.8,['conectar(pessoas);','crescer.juntos();'])];
  const finalProjection=mesh(new THREE.CylinderGeometry(.425,.425,1.1,24,1,true,-.8,1.3).rotateZ(Math.PI/2),new THREE.MeshBasicMaterial({map:codeMap(['ideia.conectar();','// um novo começo']),transparent:true,opacity:0,depthWrite:false,polygonOffset:true,polygonOffsetFactor:-1}));
  finalProjection.position.set(2.6,.38,-3.9);finalProjection.castShadow=false;

  // A single persistent articulated character and a single set of props.
  const person=new THREE.Group();person.position.set(2.6,0,-3.8);person.rotation.y=-.1;scene.add(person);
  const skin=new THREE.MeshStandardMaterial({color:'#95654b',roughness:.78});
  const shirt=new THREE.MeshStandardMaterial({color:'#263f30',roughness:.94});
  const trousers=new THREE.MeshStandardMaterial({color:'#252b2c',roughness:1});
  const hair=new THREE.MeshStandardMaterial({color:'#121713',roughness:1});
  const black=new THREE.MeshStandardMaterial({color:'#111918',roughness:.7});
  const torso=new THREE.Group();torso.position.y=.85;person.add(torso);
  ellipsoid(torso,shirt,[0,.27,0],[.285,.37,.18]);
  box(torso,shirt,[0,.18,.145],[.48,.5,.06]);
  const seam=new THREE.MeshStandardMaterial({color:'#415345',roughness:1});
  box(torso,seam,[.01,.17,.18],[.012,.49,.007]);
  for(let i=0;i<4;i++)ellipsoid(torso,black,[.015,.33-i*.11,.19],[.012,.012,.006]);
  for(const s of [-1,1]){const collar=box(torso,seam,[s*.085,.48,.13],[.1,.15,.025]);collar.rotation.z=s*.35;box(torso,seam,[s*.14,.24,.18],[.1,.11,.01]);}
  segment(torso,skin,[0,.48,0],[0,.64,0],.085);
  const head=new THREE.Group();head.position.set(0,.72,.01);head.rotation.x=.12;torso.add(head);
  ellipsoid(head,skin,[0,0,0],[.14,.19,.14]);
  ellipsoid(head,skin,[0,-.07,.035],[.105,.115,.125]);
  ellipsoid(head,skin,[0,-.012,.135],[.028,.05,.035]);
  for(const side of [-1,1]) {
    ellipsoid(head,skin,[side*.142,-.025,0],[.025,.048,.035]);
    ellipsoid(head,black,[side*.052,.023,.127],[.023,.012,.008]);
    const brow=box(head,hair,[side*.052,.05,.126],[.055,.009,.014]);brow.rotation.z=side*-.12;
  }
  const lips=box(head,new THREE.MeshStandardMaterial({color:'#694739',roughness:1}),[0,-.09,.138],[.055,.009,.006]);
  // Dense short curls, slightly taller on top and shorter, unshaved sides.
  const curls=new THREE.InstancedMesh(new THREE.SphereGeometry(1,6,5),hair,180);const dummy=new THREE.Object3D();
  for(let i=0;i<180;i++){const theta=random()*6.28,phi=random()*1.65;dummy.position.set(Math.cos(theta)*Math.sin(phi)*.14,Math.cos(phi)*.18+.045,Math.sin(theta)*Math.sin(phi)*.135-.018);dummy.scale.setScalar(phi<1?.026+random()*.012:.018);dummy.updateMatrix();curls.setMatrixAt(i,dummy.matrix);}head.add(curls);
  ellipsoid(person,trousers,[0,.65,.02],[.26,.16,.19]);
  for(const s of [-1,1]) {
    segment(person,trousers,[s*.15,.67,.03],[s*.2,.62,.5],.125);
    ellipsoid(person,trousers,[s*.2,.62,.5],[.125,.125,.13]);
    segment(person,trousers,[s*.2,.6,.5],[s*.22,.16,.65],.085);
    ellipsoid(person,black,[s*.22,.095,.76],[.105,.075,.2]);
  }
  const arms=[];
  for(const side of [-1,1]) {
    arms.push({side,upper:mesh(segmentGeo,shirt,person),lower:mesh(segmentGeo,shirt,person),hand:ellipsoid(person,skin,[0,0,0],[.05,.035,.08])});
  }
  const laptop=new THREE.Group();laptop.position.set(0,.86,.36);person.add(laptop);
  const metal=new THREE.MeshStandardMaterial({color:'#424c4b',metalness:.65,roughness:.38});
  box(laptop,metal,[0,0,0],[.64,.025,.43]);
  const keys=box(laptop,black,[0,.016,-.025],[.54,.006,.24]);
  const keycaps=new THREE.InstancedMesh(cube,metal,60);for(let row=0;row<5;row++)for(let col=0;col<12;col++){dummy.position.set(-.24+col*.043,.021,-.12+row*.043);dummy.rotation.set(0,0,0);dummy.scale.set(.031,.004,.027);dummy.updateMatrix();keycaps.setMatrixAt(row*12+col,dummy.matrix);}laptop.add(keycaps);
  box(laptop,metal,[0,.02,.135],[.19,.003,.09]);
  const lid=new THREE.Group();lid.position.set(0,.012,-.205);laptop.add(lid);
  box(lid,metal,[0,.2,0],[.64,.4,.022]);
  const screen=mesh(new THREE.PlaneGeometry(.584,.346),new THREE.MeshBasicMaterial({map:codeMap(['const solução = {','  ideia, cuidado, código','};','construir(solução);']),color:'#82a58b'}),lid);screen.position.set(0,.2,.013);
  const screenBack=box(lid,black,[0,.2,.011],[.59,.35,.002]);
  // Laptop backpack stays beside the same log in every camera state.
  const bag=new THREE.Group();bag.position.set(3.7,.05,-3.6);bag.rotation.z=-.15;scene.add(bag);
  ellipsoid(bag,black,[0,.28,0],[.25,.33,.15]);box(bag,trousers,[0,.23,.12],[.32,.31,.07]);
  for(const s of [-1,1]){const strap=mesh(new THREE.TorusGeometry(.13,.018,5,16,Math.PI*1.6),black,bag);strap.position.set(s*.16,.27,-.1);strap.scale.y=1.6;}
  const handle=mesh(new THREE.TorusGeometry(.07,.015,5,12,Math.PI),black,bag);handle.position.y=.59;
  const phone=new THREE.Group();person.add(phone);box(phone,black,[0,0,0],[.078,.155,.012]);
  box(phone,new THREE.MeshStandardMaterial({color:'#33493e',roughness:.3}),[0,0,.007],[.065,.136,.002]);
  phone.rotation.x=-.5;

  // Small contained fire, actual stones and logs; heat/light stays local.
  const fireCenter=new THREE.Vector3(.4,.12,-1.9);
  for(let i=0;i<12;i++){const a=i/12*Math.PI*2;ellipsoid(scene,stone,[fireCenter.x+Math.cos(a)*.48,.13,fireCenter.z+Math.sin(a)*.48],[.15,.12,.12]);}
  for(let i=0;i<4;i++){const log=mesh(new THREE.CylinderGeometry(.045,.07,.65,8),darkWood);log.position.copy(fireCenter);log.rotation.set(Math.PI/2,0,i*1.2);}
  const flameClock={value:0};
  const flameMat=new THREE.ShaderMaterial({transparent:true,depthWrite:false,side:THREE.DoubleSide,uniforms:{time:flameClock},vertexShader:'varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',fragmentShader:`varying vec2 vUv;uniform float time;
    void main(){float y=vUv.y;float x=vUv.x-.5+sin(y*9.-time*5.)*.07*y+sin(y*18.+time*7.)*.04*y;
    float width=pow(1.-y,.85)*.42;float a=(1.-smoothstep(width*.35,width,abs(x)))*smoothstep(0.,.15,y)*(1.-smoothstep(.7,1.,y));
    vec3 c=mix(vec3(1.,.69,.2),vec3(.85,.19,.025),y);gl_FragColor=vec4(c,a*.8);
    #include <tonemapping_fragment>
    #include <colorspace_fragment>
    }`});
  const flames=[];
  for(let i=0;i<5;i++){const f=mesh(new THREE.PlaneGeometry(1,1),flameMat);f.position.set(fireCenter.x+Math.sin(i*2)*.1,.28,fireCenter.z+Math.cos(i*2)*.1);f.scale.set(.22,.55,1);f.castShadow=false;flames.push(f);}
  const firelight=new THREE.PointLight('#ff9b42',3,5,2);firelight.position.copy(fireCenter).add(new THREE.Vector3(0,.55,0));scene.add(firelight);

  // Distant terrain and winding river remain part of the same world.
  const ground=new THREE.PlaneGeometry(800,780,230,240);ground.rotateX(-Math.PI/2);ground.translate(0,0,-330);
  const riverX=z=>-25+Math.sin(z*.014)*25+Math.sin(z*.033)*10;
  function landY(x,z){
    const dist=Math.abs(x-riverX(z));
    const hills=Math.max(0,Math.sin(x*.02+z*.008)*12+Math.cos(z*.022)*11+15)*smooth(18,90,dist)-2;
    const far=smooth(60,105,Math.abs(x)) * (1-smooth(-160,-110,z)) + smooth(95,150,-z);
    return THREE.MathUtils.lerp(terrainY(x,z)-.12,hills,Math.min(1,far));
  }
  const pv=ground.attributes.position,colors=[];const color=new THREE.Color();
  for(let i=0;i<pv.count;i++){const x=pv.getX(i),z=pv.getZ(i),dist=Math.abs(x-riverX(z));const h=landY(x,z);pv.setY(i,h);color.setHSL(.28,.2,.13+random()*.035);colors.push(color.r,color.g,color.b);}
  ground.setAttribute('color',new THREE.Float32BufferAttribute(colors,3));ground.computeVertexNormals();mesh(ground,new THREE.MeshStandardMaterial({vertexColors:true,roughness:1}));
  const riverVertices=[],indices=[];
  for(let i=0;i<=150;i++){const z=-90-i*3.8,x=riverX(z),w=12+Math.sin(i*.2)*2;riverVertices.push(x-w,-.7,z,x+w,-.7,z);if(i<150){const a=i*2;indices.push(a,a+1,a+2,a+1,a+3,a+2);}}
  const rg=new THREE.BufferGeometry();rg.setAttribute('position',new THREE.Float32BufferAttribute(riverVertices,3));rg.setIndex(indices);rg.computeVertexNormals();
  const water=mesh(rg,new THREE.MeshStandardMaterial({color:'#789eaa',metalness:.08,roughness:.23}));water.castShadow=false;
  const treeCanvas=document.createElement('canvas');treeCanvas.width=256;treeCanvas.height=512;const tx=treeCanvas.getContext('2d');
  tx.fillStyle='#334533';tx.fillRect(126,50,5,462);
  // Photo-textured branch sprays build a detailed distant conifer silhouette.
  const twig=textures.twig?.image,alpha=textures.twigAlpha?.image;
  const spray=document.createElement('canvas');spray.width=spray.height=1024;const sx=spray.getContext('2d');
  if(twig){sx.drawImage(twig,0,0,1024,1024);if(alpha){const ac=document.createElement('canvas');ac.width=ac.height=1024;const ax=ac.getContext('2d');ax.drawImage(alpha,0,0,1024,1024);const pixels=ax.getImageData(0,0,1024,1024);for(let i=0;i<pixels.data.length;i+=4)pixels.data[i+3]=pixels.data[i];ax.putImageData(pixels,0,0);sx.globalCompositeOperation='destination-in';sx.drawImage(ac,0,0);}}
  for(let level=0;level<17;level++){const y=20+level*25,w=22+level*6;for(let j=0;j<5;j++){tx.save();tx.translate(128+(random()-.5)*w*.5,y);tx.rotate((j-2)*.6);if(twig)tx.drawImage(spray,29,42,190,310,-w*.4,-w*.2,w*.8,w*1.4);else{tx.fillStyle='#476042';tx.beginPath();tx.ellipse(0,0,w,w*.5,0,0,6.28);tx.fill();}tx.restore();}}
  const treeMap=new THREE.CanvasTexture(treeCanvas);treeMap.colorSpace=THREE.SRGBColorSpace;
  const crossed=mergeGeometries([new THREE.PlaneGeometry(1,1).translate(0,.5,0),new THREE.PlaneGeometry(1,1).rotateY(Math.PI/2).translate(0,.5,0)]);
  const farTrees=new THREE.InstancedMesh(crossed,new THREE.MeshStandardMaterial({map:treeMap,alphaTest:.38,side:THREE.DoubleSide,color:'#8f9f7d',roughness:1}),mobile?4500:8500);
  for(let i=0;i<farTrees.count;i++){const x=(random()-.5)*650,z=-65-random()*600,dist=Math.abs(x-riverX(z));const size=dist<20?0:12+random()*10;dummy.position.set(x,landY(x,z),z);dummy.rotation.set(0,random()*6.28,0);dummy.scale.set(size*.65,size,size*.65);dummy.updateMatrix();farTrees.setMatrixAt(i,dummy.matrix);}scene.add(farTrees);
  const sky=mesh(new THREE.SphereGeometry(700,24,16),new THREE.ShaderMaterial({side:THREE.BackSide,depthWrite:false,uniforms:{top:{value:new THREE.Color('#688997')},bottom:{value:new THREE.Color('#bdc7ba')}},vertexShader:'varying vec3 vDirection;void main(){vDirection=position;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}',fragmentShader:'uniform vec3 top;uniform vec3 bottom;varying vec3 vDirection;void main(){float h=smoothstep(-.05,.55,normalize(vDirection).y);gl_FragColor=vec4(mix(bottom,top,h),1.);\n #include <tonemapping_fragment> \n #include <colorspace_fragment> \n}'}));sky.castShadow=sky.receiveShadow=false;
  // Thin mist billboards drift continuously; no repeated reset positions.
  const mistCanvas=document.createElement('canvas');mistCanvas.width=mistCanvas.height=128;const mx=mistCanvas.getContext('2d');const grad=mx.createRadialGradient(64,64,0,64,64,64);grad.addColorStop(0,'rgba(210,225,222,.3)');grad.addColorStop(1,'rgba(210,225,222,0)');mx.fillStyle=grad;mx.fillRect(0,0,128,128);
  const mistTexture=new THREE.CanvasTexture(mistCanvas);const mists=[];
  for(let i=0;i<9;i++){const m=mesh(new THREE.PlaneGeometry(30,7),new THREE.MeshBasicMaterial({map:mistTexture,transparent:true,opacity:.17,depthWrite:false,side:THREE.DoubleSide}));m.position.set((i%3-1)*18,3+i*.8,-22-i*10);m.userData.baseX=m.position.x;m.castShadow=false;mists.push(m);}
  // Bake static objects sharing a material into a single draw call.
  const batches=new Map();
  for(const object of [...scene.children]){
    if(!object.isMesh||object.isInstancedMesh||object.material.transparent||object===water)continue;
    object.updateMatrix();const key=object.material.uuid;
    if(!batches.has(key))batches.set(key,{material:object.material,objects:[]});
    batches.get(key).objects.push(object);
  }
  for(const {material,objects} of batches.values()){
    if(objects.length<2)continue;
    const geometries=objects.map(o=>o.geometry.clone().applyMatrix4(o.matrix));
    const merged=mergeGeometries(geometries,false);
    if(merged){const batch=mesh(merged,material);objects.forEach(o=>scene.remove(o));}
    geometries.forEach(g=>g.dispose());
  }
  return {
    update(time,phase,reduced,camera) {
      const motion=reduced?0:time;
      darkness.material.opacity=1-smooth(.04,.35,phase);darkness.visible=phase<.35;
      torso.scale.y=1+Math.sin(motion*1.4)*.006;
      head.rotation.x=.12*(1-smooth(1.6,2,phase));
      const state=storyState(phase);const close=state.laptopClosed;lid.rotation.x=-.12+close*(Math.PI/2+.12);
      const pickup=state.phoneRaised;
      phone.visible=pickup>.01;
      phone.position.set(.28,.65+pickup*.43,.1+pickup*.28);
      phone.rotation.y=-.12;
      for(const arm of arms){const s=arm.side;const typing=phase<1.55?Math.sin(motion*7+s)*.008:0;
        const wrist=s===1?[.28,.89+pickup*.17,.44-pickup*.07]:[-.18,.89- close*.035,.43];
        if(s===-1){const tap=state.tap;wrist[0]+=tap*.4;wrist[1]+=tap*.2;wrist[2]-=tap*.05;}
        wrist[1]+=typing;
        const shoulder=[s*.25,1.28,0],elbow=[s*.36,.99,.21];placeSegment(arm.upper,shoulder,elbow,.09);placeSegment(arm.lower,elbow,wrist,.065);arm.hand.position.set(...wrist);
      }
      flameClock.value=motion;for(let i=0;i<flames.length;i++){flames[i].scale.y=.5+Math.sin(motion*7+i*2)*.05;flames[i].position.y=.12+flames[i].scale.y*.5;flames[i].rotation.y=Math.atan2(camera.position.x-fireCenter.x,camera.position.z-fireCenter.z);}
      firelight.intensity=2.5+Math.sin(motion*9)*.3+Math.sin(motion*14)*.2;
      finalProjection.material.opacity=state.projection;
      codes.forEach(o=>o.material.opacity=state.tunnelProjection);
      mists.forEach((m,i)=>{m.position.x=m.userData.baseX+Math.sin(motion*.035+i)*2;m.rotation.y=Math.atan2(camera.position.x-m.position.x,camera.position.z-m.position.z);});
      water.material.roughness=.25+Math.sin(motion*.15)*.02;
    },
    character:person,
  };
}
