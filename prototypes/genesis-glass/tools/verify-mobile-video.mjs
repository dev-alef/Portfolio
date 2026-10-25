import {chromium} from 'playwright-core';
import assert from 'node:assert/strict';
const browser=await chromium.launch({executablePath:process.env.CHROME_PATH||'/usr/bin/google-chrome',args:['--no-sandbox']});
try{
 const context=await browser.newContext({viewport:{width:390,height:844},isMobile:true,hasTouch:true});
 // Model a device that exposes only metadata until play() is called from a gesture.
 await context.addInitScript(()=>{const descriptor=Object.getOwnPropertyDescriptor(HTMLMediaElement.prototype,'readyState'),originalPlay=HTMLMediaElement.prototype.play,unlocked=new WeakSet();Object.defineProperty(HTMLMediaElement.prototype,'readyState',{get(){const state=descriptor.get.call(this);return this instanceof HTMLVideoElement&&!unlocked.has(this)?Math.min(state,1):state;}});HTMLMediaElement.prototype.play=function(){unlocked.add(this);return originalPlay.call(this);};});
 const page=await context.newPage();await page.goto(process.env.PREVIEW_URL||'http://localhost:5175');await page.locator('#explore-muted').waitFor({state:'visible'});await page.locator('#explore-muted').click();
 await page.waitForFunction(()=>document.body.dataset.moving==='true'||document.body.dataset.stage==='1',null,{timeout:5000});
 assert.equal(await page.locator('#film-forward').evaluate(v=>v.paused),false);
 console.log('PASS mobile metadata-only preload: explicit click starts video');await context.close();
 const fail=await browser.newContext({viewport:{width:390,height:844}});await fail.route('**/film/*.mp4*',r=>r.abort());const p=await fail.newPage();await p.goto(process.env.PREVIEW_URL||'http://localhost:5175');await p.waitForFunction(()=>window.__ready);assert.ok(!(await p.locator('.load-track').isVisible()),'failure must stop the loading animation');await p.locator('#menu-toggle').click();await p.locator('#mobile-menu [data-goto="5"]').click();await p.locator('.faq-panel').waitFor({state:'visible'});console.log('PASS failed media: no endless spinner, navigation usable');await fail.close();
}finally{await browser.close();}
