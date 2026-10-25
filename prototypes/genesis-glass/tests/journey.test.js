import test from 'node:test';
import assert from 'node:assert/strict';
import { Journey, DURATIONS } from '../journey.js';
function rig(reduced=false){let time=0;const journey=new Journey({now:()=>time,reduced});return {journey,advance(ms){time+=ms;journey.tick();}};}
test('exactly five deliberate gestures reach final, each stable until a new gesture',()=>{
 const {journey:j,advance}=rig();
 for(let i=0;i<5;i++){
  advance(600);assert.equal(j.wheel(70),true);assert.equal(j.stage,i);assert.equal(j.busy,true);
  advance(DURATIONS[i]);assert.equal(j.stage,i+1);assert.equal(j.busy,false);
  advance(3000);assert.equal(j.stage,i+1);
 }
 assert.equal(j.go(1),false);
});
test('momentum during movement and after settling cannot skip a stage',()=>{
 const {journey:j,advance}=rig();j.wheel(80);
 for(let i=0;i<160;i++){advance(30);j.wheel(i<100?40:5);}
 assert.equal(j.stage,1);assert.equal(j.busy,false);
 advance(600);assert.equal(j.wheel(60),true);advance(3000);assert.equal(j.stage,2);
});
test('reverse returns one stage and retraces the same narrative value',()=>{
 const {journey:j,advance}=rig();j.jump(4);advance(600);j.wheel(-80);advance(2400);assert.ok(Math.abs(j.value-3.5)<1e-8);advance(2400);assert.equal(j.stage,3);
});
test('inputs are locked while moving, skip cancels movement with no later bounce',()=>{
 const {journey:j,advance}=rig();j.go(1);assert.equal(j.go(1),false);assert.equal(j.go(-1),false);advance(1000);j.jump(5);advance(10000);assert.equal(j.stage,5);assert.equal(j.busy,false);
});
test('reduced motion preserves discrete gestures and has no camera animation',()=>{
 const {journey:j,advance}=rig(true);for(let i=1;i<=5;i++){advance(600);j.wheel(80);assert.equal(j.stage,i);assert.equal(j.busy,false);}advance(600);j.wheel(-80);assert.equal(j.stage,4);
});
test('small trackpad deltas accumulate only within a fresh gesture',()=>{
 const {journey:j,advance}=rig();for(let i=0;i<7;i++){j.wheel(4);advance(15);}assert.equal(j.busy,false);j.wheel(4);assert.equal(j.busy,true);
});

import { storyState } from '../story-state.js';
import { PATHS, STOPS, SCENE } from '../scene-config.js';
import { CatmullRomCurve3, Vector3 } from 'three';
test('laptop, phone and wood projection satisfy all six stops and reverse deterministically',()=>{
 for(const phase of [0,1,2,3,4,5]){
  const state=storyState(phase);
  assert.equal(state.laptopClosed,phase>=2?1:0);
  assert.equal(state.phoneRaised,phase>=4?1:0);
  assert.equal(state.projection,0);
 }
 assert.ok(storyState(4.3).projection>.5);
 assert.ok(storyState(4.28).tap>.99);
 const phases=[1.7,3.8,4.22,4.7];const forward=phases.map(storyState);
 assert.deepEqual(phases.slice().reverse().map(storyState).reverse(),forward);
});
test('all five paths share endpoints and clear the principal tree trunks',()=>{
 assert.equal(PATHS.length,5);assert.equal(STOPS.length,6);
 PATHS.forEach((points,i)=>{
  assert.deepEqual(points[0],STOPS[i].position);
  assert.deepEqual(points.at(-1),STOPS[i+1].position);
  const curve=new CatmullRomCurve3(points.map(p=>new Vector3(...p)),false,'centripetal');
  for(let j=0;j<=200;j++){
   const p=curve.getPointAt(j/200);
   for(const [x,z,r,h] of SCENE.foregroundTrees){
    if(p.y>h+1)continue;
    const radius=r*(1-.965*Math.min(1,p.y/h));
    assert.ok(Math.hypot(p.x-x,p.z-z)>radius*1.2+.3,`path ${i}, point ${j} clips tree at ${x},${z}`);
   }
  }
 });
});
