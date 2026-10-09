/* Each installation owns its cache, including copies hosted under different paths. */
const PREFIX='facebench-'+encodeURIComponent(new URL(self.registration.scope).pathname)+'-';
const CACHE=PREFIX+'3.0.0';
const ASSETS=['./','./index.html','./style.css','./viewer.js','./app.js','./ui.js','./creative.js','./studio.js','./fabrication.js','./legacy-core.js','./svg-import.js','./core.js','./mesh-worker.js','./example.json','./engine.js','./assets/fonts.js','./assets/valve-backing.json','./vendor/three.min.js','./vendor/manifold.js','./vendor/manifold.wasm','./vendor/jszip.min.js','./vendor/opentype.min.js','./vendor/OrbitControls.js'];
self.addEventListener('install',event=>event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(ASSETS)).then(()=>self.skipWaiting())));
self.addEventListener('activate',event=>event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(key=>key.startsWith(PREFIX)&&key!==CACHE).map(key=>caches.delete(key)))).then(()=>self.clients.claim())));
self.addEventListener('fetch',event=>{if(event.request.method!=='GET'||new URL(event.request.url).origin!==location.origin||!event.request.url.startsWith(self.registration.scope))return;event.respondWith(caches.open(CACHE).then(cache=>cache.match(event.request)).then(response=>response||fetch(event.request)))});
