import {chromium} from 'playwright-core';
import assert from 'node:assert/strict';
const browser=await chromium.launch({executablePath:'/usr/bin/google-chrome',args:['--no-sandbox']});
try{for(const width of [1440,390,320]){
 const page=await browser.newPage({viewport:{width,height:844},isMobile:width<700,hasTouch:width<700},);const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto(process.env.PREVIEW_URL||'http://localhost:5175');await page.waitForFunction(()=>window.__ready);await page.emulateMedia({reducedMotion:'reduce'});
 await page.locator('.brand-symbol').evaluate(img=>img.decode());assert.equal(await page.locator('.brand small').innerText(),'SOLUÇÕES DIGITAIS');
 for(const stage of [1,2,3,4,5]){
  await page.locator(`.progress [data-goto="${stage}"]`).click();await page.waitForFunction(s=>document.body.dataset.stage===String(s),stage);
  assert.equal(await page.locator('#panels').evaluate(el=>/[↗←→]/u.test(el.textContent)),false,'No emoji-capable text arrows');
  assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);
 }
 assert.equal(await page.locator('a[href="https://www.instagram.com/genesiscodesd/"]').count(),1);await page.waitForFunction(()=>document.querySelectorAll('.social-icon svg').length===3);
 await page.screenshot({path:`/tmp/genesis-icons-${width}.png`});assert.deepEqual(errors,[]);console.log('PASS brand, SVG arrows, Instagram, all stages',width);await page.close();
}}finally{await browser.close();}
