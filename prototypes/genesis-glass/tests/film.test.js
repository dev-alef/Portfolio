import test from 'node:test';
import assert from 'node:assert/strict';
import { FILM, filmRange } from '../film-config.js';

test('six increasing media stops cover the supplied film in exactly five segments',()=>{
 assert.equal(FILM.stops.length,6);assert.equal(FILM.stops[0],0);assert.equal(FILM.stops.at(-1),FILM.lastFrame);
 FILM.stops.forEach((time,i)=>{assert.ok(Number.isFinite(time));if(i)assert.ok(time>FILM.stops[i-1]);});
});
test('backward playback retraces the exact same five spans in reverse media time',()=>{
 for(let i=0;i<5;i++){
  const a=filmRange(i,i+1),b=filmRange(i+1,i);
  assert.equal(a.reverse,false);assert.equal(b.reverse,true);
  assert.ok(Math.abs(a.start-(FILM.lastFrame-b.end))<1e-9);assert.ok(Math.abs(a.end-(FILM.lastFrame-b.start))<1e-9);
  assert.ok(Math.abs((a.end-a.start)-(b.end-b.start))<1e-9);
 }
});

test('new edition uses the five requested pause times',()=>{assert.deepEqual(FILM.stops,[0,4.6,6,16,23,29]);});
