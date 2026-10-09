import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import {fileURLToPath} from 'node:url';
import '../engine.js';
const root=new URL('../',import.meta.url),read=f=>fs.readFileSync(new URL(f,root),'utf8'),pkg=JSON.parse(read('package.json'));
assert.equal(pkg.version,FaceCore.version);assert.equal(JSON.parse(read('package-lock.json')).version,pkg.version);assert.equal(FaceCore.migrate(JSON.parse(read('example.json'))).schema,3);
const html=read('index.html'),scripts=[...html.matchAll(/<script[^>]+src="([^"]+)"/g)].map(m=>m[1]);
assert(scripts.indexOf('core.js')<scripts.indexOf('creative.js'));assert(scripts.indexOf('app.js')<scripts.indexOf('studio.js'));
for(let src of scripts){assert(!/^https?:/.test(src));assert(fs.existsSync(new URL(src,root)),src)}
let listeners={},installed=[],lookups=[],removed=[],network=0,scope='https://example.com/facebench/',prefix='facebench-%2Ffacebench%2F-',cacheName=prefix+'3.0.0';
const context={URL,location:{origin:'https://example.com'},fetch:()=>{network++;return Promise.resolve('network')},self:{registration:{scope},addEventListener:(type,fn)=>listeners[type]=fn,skipWaiting:()=>{},clients:{claim:()=>{}}},caches:{open:async name=>({addAll:async paths=>{assert.equal(name,cacheName);installed=paths},match:async req=>{lookups.push([name,req.url]);return 'current-cache'}}),keys:async()=>[prefix+'2.9.0',cacheName,'facebench-%2Fother%2F-2.9.0'],delete:async name=>removed.push(name)}};
vm.runInNewContext(read('sw.js'),context);
let promise;listeners.install({waitUntil:p=>promise=p});await promise;for(let asset of installed){assert(fs.existsSync(new URL(asset,root)),asset)}for(let script of scripts)assert(installed.includes('./'+script),'Script omitted from offline assets: '+script);
listeners.activate({waitUntil:p=>promise=p});await promise;assert.deepEqual(removed,[prefix+'2.9.0']);
listeners.fetch({request:{method:'GET',url:scope+'core.js'},respondWith:p=>promise=p});assert.equal(await promise,'current-cache');assert.equal(lookups[0][0],cacheName);assert.equal(network,0);
let intercepted=false;listeners.fetch({request:{method:'GET',url:'https://example.com/other/core.js'},respondWith:()=>intercepted=true});assert(!intercepted);
console.log('PASS release: matching versions, schema, local assets, script order, scope-specific cache activation and current-cache lookup.');
