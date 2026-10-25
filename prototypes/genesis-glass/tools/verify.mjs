import { chromium } from 'playwright-core';
import assert from 'node:assert/strict';
import { mkdir, writeFile } from 'node:fs/promises';
const base=process.env.PREVIEW_URL||'http://localhost:5175';
const browser=await chromium.launch({executablePath:process.env.CHROME_PATH||'/usr/bin/google-chrome',headless:true,args:['--no-sandbox']});
const output=new URL('../test-results/',import.meta.url);await mkdir(output,{recursive:true});
const checks=[],errors=[];let page;
const log=(name,data)=>{checks.push({name,...data});console.log('PASS',name,JSON.stringify(data??{}));};
async function stage(n){await page.waitForFunction(n=>document.body.dataset.stage===String(n)&&document.body.dataset.moving==='false'&&!document.querySelector('#panels').inert,n,{timeout:20000});}
async function boot(context){page=await context.newPage();page.on('pageerror',e=>errors.push(e.message));await page.goto(base);await page.waitForFunction(()=>window.__ready);}
try{
 const desktop=await browser.newContext({viewport:{width:1440,height:900}});await boot(desktop);
 assert.equal(await page.locator('#sound').getAttribute('aria-pressed'),'false');
 for(const [i,t] of [4.6,6,16,23,29].entries()){
  await page.waitForTimeout(600);await page.mouse.move(8,400);await page.mouse.wheel(0,110);await stage(i+1);
  const state=await page.evaluate(()=>({time:document.querySelector('#film-forward').currentTime,paused:document.querySelector('#film-forward').paused}));assert.ok(Math.abs(state.time-t)<.05);assert.ok(state.paused);log('forward stop '+(i+1),state);
  if(i===0){await page.waitForTimeout(1100);await page.screenshot({path:new URL('solutions-desktop.png',output).pathname});}
 }
 await page.waitForTimeout(1000);await page.screenshot({path:new URL('final-desktop.png',output).pathname});
 await page.locator('summary').first().click();await page.waitForTimeout(400);assert.ok(await page.locator('details').first().getAttribute('open')!==null);await page.locator('summary').first().click();await page.waitForTimeout(350);assert.equal(await page.locator('details').first().getAttribute('open'),null);log('FAQ opens and closes');
 await page.mouse.move(8,400);await page.mouse.wheel(0,-110);await stage(4);assert.ok(Math.abs(await page.locator('#film-backward').evaluate(v=>v.currentTime)-6)<.05);log('reverse reaches 23 seconds');
 await page.locator('[name=name]').fill('Teste local');await page.locator('[name=email]').fill('teste@example.com');await page.locator('[name=message]').fill('Gostaria de construir um sistema de agendamento.');
 await page.evaluate(()=>{HTMLAnchorElement.prototype.click=function(){window.__mail=this.href;};});await page.locator('#contact-form button').click();const mail=await page.evaluate(()=>window.__mail);assert.ok(mail.startsWith('mailto:genesis.code.solucoes@gmail.com?'));assert.ok(decodeURIComponent(mail).includes('Teste local'));log('contact prepares correct email without sending');
 await page.locator('nav [data-goto="1"]').click();await stage(1);await page.waitForTimeout(1000);await page.locator('[data-filter="Inteligência artificial"]').click();assert.equal(await page.locator('.project-card:not([hidden])').count(),1);await page.locator('[data-project="3"]').click();assert.ok(await page.locator('#project-dialog').isVisible());await page.keyboard.press('Escape');assert.ok(!await page.locator('#project-dialog').isVisible());log('filters and accessible detail dialog');
 await page.locator('#home').click();await stage(0);await page.waitForTimeout(600);
 // A wheel burst continuing after arrival must still produce only one stage.
 await page.mouse.move(8,400);for(let i=0;i<60;i++){await page.mouse.wheel(0,8);await page.waitForTimeout(100);}await stage(1);log('trackpad momentum does not skip a stage');
 await page.locator('#next').click();await page.waitForTimeout(500);assert.ok(await page.locator('#previous').isEnabled());await page.locator('[data-goto="4"]').first().click();await stage(4);await page.waitForTimeout(2400);assert.equal(await page.locator('body').getAttribute('data-stage'),'4');log('navigation interrupts transition without stale arrival');
 await page.locator('#next').click();await page.waitForTimeout(500);await page.locator('#skip').click();await stage(5);await page.waitForTimeout(1000);log('skip during movement');
 await desktop.close();
 const mobile=await browser.newContext({viewport:{width:390,height:844},isMobile:true,hasTouch:true});await boot(mobile);
 for(let n=1;n<=5;n++){await page.locator(`.progress [data-goto="${n}"]`).click();await stage(n);await page.waitForTimeout(1000);assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));assert.ok(await page.evaluate(()=>document.querySelector('.scene').getBoundingClientRect().top>=document.querySelector('main').getBoundingClientRect().top-1));await page.screenshot({path:new URL(`mobile-${n}.png`,output).pathname});}
 log('all five mobile layouts fit viewport');
 await page.locator('#home').click();await stage(0);await page.waitForTimeout(600);
 await page.evaluate(()=>{const target=document.body;target.dispatchEvent(new TouchEvent('touchstart',{bubbles:true,touches:[new Touch({identifier:1,target,clientX:8,clientY:500})]}));target.dispatchEvent(new TouchEvent('touchend',{bubbles:true,changedTouches:[new Touch({identifier:1,target,clientX:8,clientY:200})]}));});await stage(1);log('touch swipe advances one stop');
 await page.setViewportSize({width:320,height:568});await page.locator('.progress [data-goto="5"]').click();await stage(5);assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));await page.screenshot({path:new URL('mobile-small.png',output).pathname});log('320px layout and scrollable final content');await mobile.close();
 const reduce=await browser.newContext({viewport:{width:1280,height:800},reducedMotion:'reduce'});await boot(reduce);await page.locator('#panels').focus();await page.keyboard.press('ArrowDown');await stage(1);assert.ok(await page.locator('#film-forward').evaluate(v=>v.paused));log('reduced motion immediate keyboard navigation');await reduce.close();
 const fail=await browser.newContext({viewport:{width:390,height:844}});await fail.route('**/film/*.mp4*',route=>route.abort());await boot(fail);await page.locator('.progress [data-goto="4"]').click();await stage(4);assert.ok(await page.locator('a[href^="mailto:"]').first().isVisible());log('video fallback preserves contact');await fail.close();
 assert.deepEqual(errors,[]);log('no JavaScript exceptions');
}finally{await writeFile(new URL('verification.json',output),JSON.stringify({checks,errors},null,2));await browser.close();}
