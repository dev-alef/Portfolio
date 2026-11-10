import {chromium} from 'playwright-core';
import assert from 'node:assert/strict';
const browser=await chromium.launch({executablePath:process.env.CHROME_PATH||'/usr/bin/google-chrome',args:['--no-sandbox']});
try{
 for(const width of [1440,390,320]){
  const context=await browser.newContext({viewport:{width,height:width===320?568:900},isMobile:width<700,hasTouch:width<700,reducedMotion:'reduce'});
  const page=await context.newPage(),errors=[];page.on('pageerror',error=>errors.push(error.message));
  await page.goto(process.env.PREVIEW_URL||'http://localhost:5175');await page.waitForFunction(()=>window.__ready);
  await page.locator('.progress [data-goto="1"]').click();await page.waitForFunction(()=>document.body.dataset.stage==='1');
  assert.equal(await page.locator('.catalog-card').count(),6);
  assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);
  await page.screenshot({path:`/tmp/genesis-catalog-${width}.png`});
  if(width>900){
   const layout=await page.locator('.catalog-rail').evaluate(el=>({display:getComputedStyle(el).display,horizontal:el.scrollWidth>el.clientWidth+1,first:el.firstElementChild.getBoundingClientRect().y,last:el.lastElementChild.getBoundingClientRect().y}));
   assert.equal(layout.display,'grid');assert.equal(layout.horizontal,false);assert.ok(layout.last>layout.first,'Desktop gallery has multiple rows');
   assert.equal(await page.locator('.catalog-tools .rail-controls').isVisible(),false);
   await page.locator('.catalog-preview').first().hover();await page.mouse.wheel(0,400);await page.waitForFunction(()=>document.querySelector('#panels').scrollTop>100);
   assert.equal(await page.locator('body').getAttribute('data-stage'),'1','Scrolling the gallery does not advance the film');
   await page.locator('#panels').focus();const before=await page.locator('#panels').evaluate(el=>el.scrollTop);await page.keyboard.press('PageDown');await page.waitForFunction(before=>document.querySelector('#panels').scrollTop>before,before);
   assert.equal(await page.locator('body').getAttribute('data-stage'),'1','Keyboard scroll stays in the gallery');
   await page.locator('#panels').evaluate(el=>el.scrollTop=0);
  }else{
   assert.equal(await page.locator('.catalog-rail').evaluate(el=>getComputedStyle(el).display),'flex','Mobile keeps the horizontal layout');
   assert.equal(await page.locator('.catalog-rail').evaluate(el=>el.scrollWidth>el.clientWidth),true);
  }

  assert.equal(await page.locator('.catalog-price').count(),0,'Prices remain in the solution details');
  const preview=page.locator('[data-preview-solution="burger"]');await preview.focus();await page.keyboard.press('Enter');await page.locator('#project-dialog').waitFor({state:'visible'});assert.equal(await page.locator('#project-title').innerText(),'Site + cardápio digital');await page.keyboard.press('Escape');assert.equal(await preview.evaluate(el=>el===document.activeElement),true,'Project preview is keyboard accessible');

  await page.getByRole('button',{name:'Beleza',exact:true}).click();assert.equal(await page.locator('.catalog-card:not([hidden])').count(),2);
  assert.equal(await page.locator('#result-count').innerText(),'2 soluções');await page.getByRole('button',{name:'Todos',exact:true}).click();
  for(const id of ['burger','salon','barber','clinic','stock','assistant']){
   const trigger=page.locator(`[data-solution="${id}"]`);await trigger.click();await page.locator('#project-dialog').waitFor({state:'visible'});
   assert.equal(await page.locator('#project-dialog a[href*="kiwify"]').count(),0,'Drafts cannot open a checkout');
   assert.equal(await page.locator('#project-dialog').evaluate(d=>d.scrollWidth>d.clientWidth+1),false,'Plan dialog has no horizontal overflow');
   if(id==='stock'){assert.equal(await page.locator('#project-dialog a[href="https://armazem-in.vercel.app/login"]').count(),0,'Restricted login is not sold as an open demo');}
   if(id==='burger'){assert.equal(await page.locator('#project-dialog a[href="https://burgerclub-demo.vercel.app/#inicio"]').count(),1);await page.screenshot({path:`/tmp/genesis-plans-${width}.png`});}
   const planCount=await page.locator('#project-dialog .solution-plan').count();assert.ok(planCount>=2);
   assert.equal(await page.locator('#project-dialog .plan-limits').count(),planCount,'Every plan shows its commercial limits');
   const terms=page.locator('#project-dialog .solution-terms');await terms.locator('summary').click();
   assert.equal(await terms.getAttribute('open'),'','Support conditions are accessible');
   if(id==='assistant'){
    assert.match(await page.locator('#project-dialog .solution-availability').innerText(),/ainda não está disponível para contratação/);
    assert.match(await page.locator('#project-dialog .plan-heading').innerText(),/Planos previstos/);
    assert.equal(await page.locator('#project-dialog a[href*="workers.dev"]').count(),0,'Unavailable automation is not linked as a working service');
    assert.match(await page.locator('#project-dialog .solution-scope').innerText(),/sem cobrança automática de excedente/);
   }
   await terms.locator('summary').click();
   await page.keyboard.press('Escape');assert.equal(await page.locator('#project-dialog').isVisible(),false);
   assert.equal(await trigger.evaluate(el=>el===document.activeElement),true,'Focus returns to selected solution');
  }
  await page.locator('.progress [data-goto="2"]').click();await page.waitForFunction(()=>document.body.dataset.stage==='2');assert.equal(await page.locator('.service-card').count(),6);
  assert.deepEqual(errors,[]);await context.close();console.log('PASS catalog filters, 6 plan dialogs, links, focus, mobile overflow, no active checkout',width);
 }
}finally{await browser.close();}
