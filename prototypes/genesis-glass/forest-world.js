import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { SCENE, pathX, terrainY } from './scene-config.js';
import { createStoryWorld } from './story-world.js';

// Geometria autoral; materiais CC0 documentados em public/textures/credits.json.
export async function createForest(renderer, onProgress = () => {}) {
  const mobile = innerWidth < 700;
  const windTime = { value: 0 };
  function sway(material, strength) {
    material.onBeforeCompile = shader => {
      shader.uniforms.uWindTime = windTime;
      shader.vertexShader = `uniform float uWindTime;\n${shader.vertexShader}`.replace("#include <begin_vertex>", `#include <begin_vertex>\n transformed.x += sin(uWindTime * .65 + position.y * 2.0 + position.z) * ${strength.toFixed(3)} * max(0.0, position.y);`);
    };
    material.customProgramCacheKey = () => `wind-${strength}`;
  }
  let seed = SCENE.seed;
  const random = () => { seed = (seed * 1664525 + 1013904223) >>> 0; return seed / 4294967296; };
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(SCENE.fog.color);
  scene.fog = new THREE.FogExp2(SCENE.fog.color, SCENE.fog.density);
  const light = SCENE.light;
  scene.add(new THREE.HemisphereLight(light.sky, light.ground, light.ambient));
  const sun = new THREE.DirectionalLight(light.sun, light.intensity);
  sun.position.fromArray(light.position);
  sun.target.position.set(0, 0, -12);
  sun.castShadow = true;
  sun.shadow.mapSize.set(mobile ? 1024 : 1536, mobile ? 1024 : 1536);
  Object.assign(sun.shadow.camera, { left: -23, right: 23, top: 30, bottom: -30, near: 0.5, far: 100 });
  sun.shadow.normalBias = 0.045;
  sun.shadow.bias = -0.0001;
  scene.add(sun, sun.target);

  const loader = new THREE.TextureLoader();
  const assets = [
    ['bark', '/textures/bark_brown_01_diff_1k.jpg', true, 2, 10],
    ['barkNormal', '/textures/bark_brown_01_nor_gl_1k.jpg', false, 2, 10],
    ['floor', '/textures/forest_floor_diff_1k.jpg', true, 36, 44],
    ['floorNormal', '/textures/forest_floor_nor_gl_1k.jpg', false, 36, 44],
    ['twig', '/textures/pine_tree_01_twig_diff_1k.jpg', true, 1, 1],
    ['twigAlpha', '/textures/pine_tree_01_twig_alpha_1k.png', false, 1, 1],
    ['twigNormal', '/textures/pine_tree_01_twig_nor_gl_1k.jpg', false, 1, 1],
  ];
  const textures = {};
  let failedTextures = 0;
  await Promise.all(assets.map(async ([key, url, srgb, rx, ry]) => {
    try {
      const texture = await loader.loadAsync(url);
      if (srgb) texture.colorSpace = THREE.SRGBColorSpace;
      texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
      texture.repeat.set(rx, ry);
      texture.anisotropy = Math.min(8, renderer.capabilities.getMaxAnisotropy());
      textures[key] = texture;
    } catch { failedTextures++; } finally { onProgress(.1 + Object.keys(textures).length * .075); }
  }));

  // Use only the photographed needle spray, not the atlas's pinecones or UV padding.
  for (const key of ['twig','twigAlpha','twigNormal']) if(textures[key]) {
    textures[key].repeat.set(190/1024,310/1024);
    textures[key].offset.set(29/1024,1-352/1024);
  }
  const floorGeometry = new THREE.PlaneGeometry(130, 160, 100, 140);
  floorGeometry.rotateX(-Math.PI / 2);
  floorGeometry.translate(0, 0, -49);
  const floorVertices = floorGeometry.attributes.position;
  const floorColors = [];
  const tint = new THREE.Color();
  for (let i = 0; i < floorVertices.count; i++) {
    const x = floorVertices.getX(i), z = floorVertices.getZ(i);
    floorVertices.setY(i, terrainY(x, z));
    tint.set('#a9b38a').multiplyScalar(0.8 + random() * 0.35);
    floorColors.push(tint.r, tint.g, tint.b);
  }
  floorGeometry.setAttribute('color', new THREE.Float32BufferAttribute(floorColors, 3));
  floorGeometry.computeVertexNormals();
  const floor = new THREE.Mesh(floorGeometry, new THREE.MeshStandardMaterial({
    map: textures.floor || null, normalMap: textures.floorNormal || null,
    normalScale: new THREE.Vector2(0.55, 0.55), roughness: 1, vertexColors: true,
  }));
  floor.receiveShadow = true;
  scene.add(floor);

  const trailCanvas = document.createElement('canvas');
  trailCanvas.width = trailCanvas.height = 256;
  const tc = trailCanvas.getContext('2d');
  tc.fillStyle = '#806049'; tc.fillRect(0, 0, 256, 256);
  for (let i = 0; i < 14000; i++) {
    const v = 40 + Math.floor(random() * 90);
    tc.fillStyle = `rgba(${v + 35},${v + 12},${v},${0.1 + random() * 0.35})`;
    tc.fillRect(random() * 256, random() * 256, random() * 2.5 + 0.5, random() * 1.5 + 0.5);
  }
  const trailMap = new THREE.CanvasTexture(trailCanvas);
  trailMap.colorSpace = THREE.SRGBColorSpace;
  trailMap.wrapS = trailMap.wrapT = THREE.RepeatWrapping;
  trailMap.repeat.set(1, 25);
  const trailVertices = [], trailUvs = [], trailIndices = [];
  for (let i = 0; i <= 140; i++) {
    const z = 27 - i;
    const halfWidth = 1.4 + Math.sin(z * 0.55) * 0.07;
    for (const side of [-1, 1]) {
      const x = pathX(z) + halfWidth * side;
      trailVertices.push(x, terrainY(x, z) + 0.018, z);
      trailUvs.push(side === -1 ? 0 : 1, i / 140);
    }
    if (i < 140) {
      const a = i * 2;
      trailIndices.push(a, a + 1, a + 2, a + 1, a + 3, a + 2);
    }
  }
  const maskCanvas = document.createElement('canvas');
  maskCanvas.width = maskCanvas.height = 256;
  const mc = maskCanvas.getContext('2d');
  mc.fillStyle = '#000'; mc.fillRect(0, 0, 256, 256);
  for (let y = 0; y < 256; y++) {
    const edge = 12 + random() * 12;
    const gradient = mc.createLinearGradient(0, 0, 256, 0);
    gradient.addColorStop(0, '#000'); gradient.addColorStop(edge / 256, '#999');
    gradient.addColorStop(0.18, '#fff'); gradient.addColorStop(0.82, '#fff');
    gradient.addColorStop(1 - edge / 256, '#999'); gradient.addColorStop(1, '#000');
    mc.fillStyle = gradient; mc.fillRect(0, y, 256, 1);
  }
  const trailAlpha = new THREE.CanvasTexture(maskCanvas);
  trailAlpha.wrapS = trailAlpha.wrapT = THREE.RepeatWrapping;
  trailAlpha.repeat.set(1, 25);
  const trailGeometry = new THREE.BufferGeometry();
  trailGeometry.setAttribute('position', new THREE.Float32BufferAttribute(trailVertices, 3));
  trailGeometry.setAttribute('uv', new THREE.Float32BufferAttribute(trailUvs, 2));
  trailGeometry.setIndex(trailIndices);
  trailGeometry.computeVertexNormals();
  const trail = new THREE.Mesh(trailGeometry, new THREE.MeshStandardMaterial({ map: trailMap, alphaMap: trailAlpha, transparent: true, depthWrite: false, roughness: 1 }));
  trail.receiveShadow = true;
  scene.add(trail);

  const bark = new THREE.MeshStandardMaterial({
    map: textures.bark || null, normalMap: textures.barkNormal || null,
    normalScale: new THREE.Vector2(0.9, 0.9), roughness: 1, color: '#c69571',
  });
  const trees = SCENE.foregroundTrees.map(([x, z, r, h]) => ({ x, z, r, h }));
  for (let i = 0; i < 105; i++) {
    const z = 17 - random() * 132;
    const x = (random() > 0.5 ? 1 : -1) * (7 + random() * 42);
    if ((z > -14 && z < 26 && Math.abs(x) < 14) || trees.some(t => Math.hypot(t.x - x, t.z - z) < 3.4)) continue;
    trees.push({ x, z, r: 0.45 + random() * 0.95, h: 27 + random() * 22 });
  }
  for (let i = 0; i < 42; i++) {
    const z = -35 - random() * 75;
    const x = (random() - 0.5) * 34;
    if (Math.abs(x - pathX(z)) < 2.2 || trees.some(t => Math.hypot(t.x - x, t.z - z) < 2.2)) continue;
    trees.push({ x, z, r: 0.35 + random() * 0.65, h: 25 + random() * 16 });
  }
  const unitTrunk = new THREE.CylinderGeometry(0.035, 1, 1, 32, 36);
  unitTrunk.translate(0, 0.5, 0);
  const p = unitTrunk.attributes.position;
  for (let i = 0; i < p.count; i++) {
    const h = p.getY(i), angle = Math.atan2(p.getZ(i), p.getX(i));
    const fluting = 1 + Math.sin(angle * 9 + h * 1.2) * 0.045 + Math.sin(angle * 19 - h) * 0.018;
    const flare = 1 + Math.exp(-h * 32) * (0.28 + Math.sin(angle * 5) * 0.09);
    p.setX(i, p.getX(i) * flare * fluting + Math.sin(h * 5) * 0.055);
    p.setZ(i, p.getZ(i) * flare * fluting + Math.sin(h * 3.5) * 0.045);
  }
  unitTrunk.computeVertexNormals();
  const trunks = new THREE.InstancedMesh(unitTrunk, bark, trees.length);
  trunks.castShadow = trunks.receiveShadow = true;
  const roots = new THREE.InstancedMesh(new THREE.CylinderGeometry(0.07, 0.32, 1, 7), bark, trees.length * 5);
  roots.castShadow = roots.receiveShadow = true;
  const branches = new THREE.InstancedMesh(new THREE.CylinderGeometry(0.035, 0.17, 1, 6), bark, trees.length * 6);
  branches.castShadow = true;
  const dummy = new THREE.Object3D();
  const up = new THREE.Vector3(0, 1, 0);
  const direction = new THREE.Vector3();
  function segment(mesh, index, start, end, radius = 1) {
    direction.copy(end).sub(start);
    dummy.position.copy(start).add(end).multiplyScalar(0.5);
    dummy.quaternion.setFromUnitVectors(up, direction.clone().normalize());
    dummy.scale.set(radius, direction.length(), radius);
    dummy.updateMatrix();
    mesh.setMatrixAt(index, dummy.matrix);
  }
  const foliageCards = [];
  trees.forEach((tree, i) => {
    const y = terrainY(tree.x, tree.z);
    dummy.position.set(tree.x, y, tree.z);
    dummy.rotation.set(0, random() * 6.28, 0);
    dummy.scale.set(tree.r, tree.h, tree.r);
    dummy.updateMatrix();
    trunks.setMatrixAt(i, dummy.matrix);
    trunks.setColorAt(i, tint.setHSL(0.07, 0.05 + random() * 0.12, 0.65 + random() * 0.22));
    for (let k = 0; k < 5; k++) {
      const a = k / 5 * Math.PI * 2 + i;
      const endX = tree.x + Math.cos(a) * tree.r * 1.8;
      const endZ = tree.z + Math.sin(a) * tree.r * 1.8;
      // Wider end at the trunk, tapering into the forest floor.
      segment(roots, i * 5 + k,
        new THREE.Vector3(tree.x + Math.cos(a) * tree.r * 0.65, y + 0.65, tree.z + Math.sin(a) * tree.r * 0.65),
        new THREE.Vector3(endX, terrainY(endX, endZ) + 0.04, endZ), tree.r * 1.2);
    }
    for (let k = 0; k < 6; k++) {
      const a = tree.x === 9 ? (-1.1 + k * .4) : k * 2.4 + i;
      const by = y + tree.h * (0.48 + k * 0.085);
      const length = 5.5 - k * 0.8;
      const start = new THREE.Vector3(tree.x, by, tree.z);
      const end = new THREE.Vector3(tree.x + Math.cos(a) * length, by - 0.4, tree.z + Math.sin(a) * length);
      segment(branches, i * 6 + k, start, end, tree.r * 0.75);
      for (let q = 0; q < 24; q++) {
        const t = 0.08 + q * 0.038;
        foliageCards.push({ x: THREE.MathUtils.lerp(start.x, end.x, t), y: by + random() * 0.8, z: THREE.MathUtils.lerp(start.z, end.z, t), a: a + random(), size: (1.6 + random() * 1.5) * (1 - k * .08) });
      }
    }
  });
  scene.add(trunks, roots, branches);

  // Needle silhouettes are drawn locally; no generated or external alpha assets.
  const needleCanvas = document.createElement('canvas');
  needleCanvas.width = needleCanvas.height = 256;
  const nc = needleCanvas.getContext('2d');
  nc.strokeStyle = '#778754'; nc.lineWidth = 3;
  nc.beginPath(); nc.moveTo(22, 232); nc.lineTo(137, 15); nc.stroke();
  for (let k = 0; k < 17; k++) {
    const t = k / 17;
    const sx = 29 + t * 108, sy = 218 - t * 197;
    for (const side of [-1, 1]) {
      const ex = sx + side * (45 * (1 - t) + 12), ey = sy - 27;
      nc.lineWidth = 1.4; nc.strokeStyle = '#6d7e4b';
      nc.beginPath(); nc.moveTo(sx, sy); nc.lineTo(ex, ey); nc.stroke();
      for (let q = 0; q < 12; q++) {
        const f = q / 12;
        const x = sx + (ex - sx) * f, y = sy + (ey - sy) * f;
        nc.strokeStyle = q % 2 ? '#8b9f67' : '#536b37';
        nc.lineWidth = 1.8;
        nc.beginPath(); nc.moveTo(x, y); nc.lineTo(x - 3, y - 11); nc.moveTo(x, y); nc.lineTo(x + 5, y + 7); nc.stroke();
      }
    }
  }
  const needleMap = new THREE.CanvasTexture(needleCanvas);
  needleMap.colorSpace = THREE.SRGBColorSpace;
  const foliage = new THREE.InstancedMesh(new THREE.PlaneGeometry(1, 1), new THREE.MeshStandardMaterial({
    map: textures.twig || needleMap, alphaMap: textures.twigAlpha || null, normalMap: textures.twigNormal || null, normalScale: new THREE.Vector2(.35,.35), alphaTest: 0.4, side: THREE.DoubleSide, roughness: 1, color: '#b3c3a0',
  }), foliageCards.length);
  foliageCards.forEach((card, i) => {
    dummy.position.set(card.x, card.y, card.z);
    dummy.rotation.set(-0.4 - random() * 1.1, card.a, random() * 2);
    dummy.scale.set(card.size * 1.3, card.size, 1);
    dummy.updateMatrix(); foliage.setMatrixAt(i, dummy.matrix);
  });
  sway(foliage.material, .015);
  foliage.castShadow = !mobile;
  scene.add(foliage);

  // Fern fronds: curved stems and paired leaflets, with genuine spatial depth.
  const fernVertices = [], fernColors = [];
  const leafColor = new THREE.Color();
  function triangle(a, b, c, shade) {
    fernVertices.push(...a, ...b, ...c);
    leafColor.set(shade);
    for (let i = 0; i < 3; i++) fernColors.push(leafColor.r, leafColor.g, leafColor.b);
  }
  for (let k = 0; k < 22; k++) {
    const t = (k + 1) / 24;
    const z = -1.85 * t;
    const y = Math.sin(t * Math.PI * 0.88) * 0.67;
    const width = Math.pow(Math.sin(t * Math.PI), 0.85) * 0.32;
    for (const side of [-1, 1]) {
      const base = [0, y, z];
      const tip = [side * width, y - 0.055, z - 0.17];
      const mid = [side * width * 0.51, y + 0.016, z - 0.11];
      const rimA = [side * width * 0.4, y + 0.007, z + 0.025];
      const rimB = [side * width * 0.6, y - 0.015, z - 0.19];
      triangle(base, rimA, mid, k % 2 ? '#597238' : '#657d3d');
      triangle(rimA, tip, mid, '#70884a');
      triangle(mid, tip, rimB, '#506d32');
      triangle(base, mid, rimB, '#45612c');
    }
    const nextT = (k + 2) / 24;
    const nextY = Math.sin(nextT * Math.PI * 0.88) * 0.67;
    triangle([-0.009, y, z], [0.009, y, z], [0, nextY, -1.85 * nextT], '#71824a');
  }
  const fernGeometry = new THREE.BufferGeometry();
  fernGeometry.setAttribute('position', new THREE.Float32BufferAttribute(fernVertices, 3));
  fernGeometry.setAttribute('color', new THREE.Float32BufferAttribute(fernColors, 3));
  fernGeometry.computeVertexNormals();
  const fernLocations = [];
  for (let i = 0; i < (mobile ? 280 : 560); i++) {
    const z = 18 - random() * 85;
    const x = pathX(z) + (random() > 0.5 ? 1 : -1) * (2.1 + Math.pow(random(), 2) * 13);
    if ((z > 5 && z < 25 && Math.abs(x) < 3.6) || (z > -6 && z < 3 && x > -3 && x < 5) || trees.some(t => Math.hypot(t.x - x, t.z - z) < t.r * 1.1)) continue;
    fernLocations.push({ x, z, size: 0.48 + random() * 0.78 });
  }
  const ferns = new THREE.InstancedMesh(fernGeometry, new THREE.MeshStandardMaterial({ vertexColors: true, side: THREE.DoubleSide, roughness: 1 }), fernLocations.length * 6);
  fernLocations.forEach((fern, i) => {
    for (let k = 0; k < 6; k++) {
      dummy.position.set(fern.x, terrainY(fern.x, fern.z) + 0.04, fern.z);
      dummy.rotation.set((random() - 0.5) * 0.12, k / 6 * Math.PI * 2 + i, 0);
      const size = fern.size * (0.8 + random() * 0.45);
      dummy.scale.set(size, size * (0.8 + random() * 0.3), size);
      dummy.updateMatrix(); ferns.setMatrixAt(i * 6 + k, dummy.matrix);
      ferns.setColorAt(i * 6 + k, tint.setHSL(0.22, 0.12 + random() * 0.16, 0.65 + random() * 0.22));
    }
  });
  ferns.receiveShadow = true;
  // Use the CC0 fern asset when available; procedural fronds remain a local fallback.
  try {
    const [asset, alpha] = await Promise.all([
      new GLTFLoader().loadAsync('/models/fern_02_1k.gltf'),
      loader.loadAsync('/models/fern_02_alpha_1k.png'),
    ]);
    alpha.flipY = false;
    alpha.anisotropy = Math.min(4, renderer.capabilities.getMaxAnisotropy());
    const variants = [];
    asset.scene.traverse(object => { if (object.isMesh) variants.push(object); });
    if (!variants.length) throw new Error('Empty fern model');
    variants.forEach((variant, variantIndex) => {
      const locations = fernLocations.filter((_, i) => i % variants.length === variantIndex);
      const material = variant.material.clone();
      material.alphaMap = alpha;
      material.alphaTest = 0.5;
      material.side = THREE.DoubleSide;
      material.roughness = 1;
      material.color.set('#ffffff');
      material.normalScale.set(0.55, 0.55);
      material.emissive.set('#2a3d12');
      material.emissiveIntensity = 0.18;
      const batch = new THREE.InstancedMesh(variant.geometry, material, locations.length);
      locations.forEach((fern, i) => {
        dummy.position.set(fern.x, terrainY(fern.x, fern.z) + 0.04, fern.z);
        dummy.rotation.set(0, random() * Math.PI * 2, 0);
        dummy.scale.setScalar(fern.size * 3.4);
        dummy.updateMatrix(); batch.setMatrixAt(i, dummy.matrix);
      });
      sway(material, .035);
      batch.receiveShadow = true;
      scene.add(batch);
    });
  } catch {
    failedTextures++;
    scene.add(ferns);
  }

  const rockGeometry = new THREE.IcosahedronGeometry(1, 1);
  const rocks = new THREE.InstancedMesh(rockGeometry, new THREE.MeshStandardMaterial({ color: '#667056', roughness: 1, flatShading: true }), 80);
  for (let i = 0; i < rocks.count; i++) {
    const z = 20 - random() * 100;
    const x = pathX(z) + (random() > 0.5 ? 1 : -1) * (1.5 + random() * 15);
    const size = 0.04 + random() * 0.18;
    dummy.position.set(x, terrainY(x, z), z);
    dummy.rotation.set(random(), random(), random());
    dummy.scale.set(size * 1.4, size, size);
    dummy.updateMatrix(); rocks.setMatrixAt(i, dummy.matrix);
  }
  rocks.receiveShadow = true; scene.add(rocks);

  // A few soft particles catch the light; motion stays subtle and optional.
  const particlePositions = [];
  for (let i = 0; i < 65; i++) particlePositions.push((random() - 0.5) * 24, 0.7 + random() * 8, 12 - random() * 55);
  const particlesGeometry = new THREE.BufferGeometry();
  particlesGeometry.setAttribute('position', new THREE.Float32BufferAttribute(particlePositions, 3));
  const particles = new THREE.Points(particlesGeometry, new THREE.PointsMaterial({ color: '#d5d7a3', size: 0.022, transparent: true, opacity: 0.48, depthWrite: false }));
  scene.add(particles);
  onProgress(.85);
  const story = createStoryWorld(scene, textures, random, mobile);
  onProgress(1);
  return { scene, failedTextures, update(time, phase, reduced, camera) {
    windTime.value = reduced ? 0 : time;
    scene.fog.density = THREE.MathUtils.lerp(SCENE.fog.density, .0032, THREE.MathUtils.smoothstep(camera.position.y, 15, 55));
    story.update(time, phase, reduced, camera);
  } };
}
