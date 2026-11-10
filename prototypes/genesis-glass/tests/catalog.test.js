import test from 'node:test';
import assert from 'node:assert/strict';
import {catalog,checkoutFor} from '../catalog.js';
test('commercial draft cannot expose a payment link without explicit approval and a real HTTPS URL',()=>{
 assert.equal(checkoutFor({approved:false,checkoutUrl:'https://pay.kiwify.com.br/example'}),null);
 assert.equal(checkoutFor({approved:true,checkoutUrl:null}),null);
 assert.equal(checkoutFor({approved:true,checkoutUrl:'javascript:alert(1)'}),null);
 assert.equal(checkoutFor({approved:true,checkoutUrl:'http://example.com'}),null);
 const url='https://pay.kiwify.com.br/example';assert.equal(checkoutFor({approved:true,checkoutUrl:url}),url);
});
test('AI automation is a launch proposal without a working demonstration or payment destination',()=>{
 const service=catalog.find(s=>s.id==='assistant');
 assert.equal(service.availability,'development');
 assert.equal(service.demoUrl,null);
 for(const plan of service.plans)assert.equal(checkoutFor(plan),null);
});
test('commercial plans define an implementation fee and explicit limits without enabling checkout',()=>{
 assert.equal(new Set(catalog.map(s=>s.id)).size,catalog.length);
 for(const service of catalog){
  assert.ok(service.scope);assert.equal(new Set(service.plans.map(p=>p.id)).size,service.plans.length);
  for(const plan of service.plans){assert.ok(plan.monthly>0);assert.ok(plan.setup>0);assert.ok(plan.limits.length>0);assert.equal(checkoutFor(plan),null);}
 }
});
