const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),{JSDOM}=require('jsdom');
const root=path.resolve(__dirname,'..'),pause=ms=>new Promise(r=>setTimeout(r,ms));
(async()=>{
 const {build,laserStack,vectorEdit,materialStack,calibration}=await import('../engine.js'),C=globalThis.FaceCore;
 const factory=C.newFace();assert.equal(factory.mounting,'cad');assert.equal(factory.thickness,2.3);assert.equal(factory.width,156);assert.equal(factory.height,126.105);
 const magnetic=await build(factory);assert.equal(magnetic.mesh.status,'NoError');assert.equal(magnetic.mesh.components,1);assert(magnetic.mesh.bounds.min[2]<-6.7);assert.equal(magnetic.mesh.trianglesCount,52946);
 async function app(stored={}){
  const dom=new JSDOM(fs.readFileSync(path.join(root,'index.html'),'utf8'),{url:'http://localhost:8080/facebench/',runScripts:'outside-only',pretendToBeVisual:true}),w=dom.window,errors=[],workers=[];
  const run=source=>vm.runInContext(source,dom.getInternalVMContext()),el=id=>w.document.getElementById(id);
  for(const [key,value] of Object.entries(stored))w.localStorage.setItem(key,value);
  w.addEventListener('error',e=>errors.push(e.error));w.setImmediate=setImmediate;w.clearImmediate=clearImmediate;w.TextEncoder=TextEncoder;w.TextDecoder=TextDecoder;w.crypto.randomUUID=require('node:crypto').randomUUID;w.confirm=()=>true;
  w.HTMLDialogElement.prototype.showModal=function(){this.setAttribute('open','')};w.HTMLDialogElement.prototype.close=function(){this.removeAttribute('open');this.dispatchEvent(new w.Event('close'))};w.ResizeObserver=class{observe(){}disconnect(){}};
  w.URL.createObjectURL=()=> 'blob:test';w.URL.revokeObjectURL=()=>{};w.HTMLAnchorElement.prototype.click=function(){};
  w.HTMLCanvasElement.prototype.getContext=()=>new Proxy({measureText:s=>({width:s.length*8}),createImageData:(width,height)=>({data:new Uint8ClampedArray(width*height*4)})},{get:(obj,key)=>obj[key]||(()=>{})});w.HTMLCanvasElement.prototype.getBoundingClientRect=()=>({width:800,height:550,left:0,top:0});w.HTMLCanvasElement.prototype.setPointerCapture=function(){};
  w.Worker=class{constructor(){this.active=true;workers.push(this)}postMessage(m){const task=m.action==='stack'?laserStack(m.project):m.action==='vector'?vectorEdit(m.project,m.options):m.action==='materials'?materialStack(m.project,m.options):m.action==='calibration'?calibration(m.project,m.options):build(m.project,m.options);task.then(result=>{if(this.active)this.onmessage({data:{id:m.id,result}})}).catch(e=>{if(this.active)this.onmessage({data:{id:m.id,error:e.message}})})}terminate(){this.active=false}};
  for(const name of ['vendor/jszip.min.js','vendor/opentype.min.js','assets/fonts.js','legacy-core.js','core.js','creative.js','svg-import.js','fabrication.js'])run(fs.readFileSync(path.join(root,name),'utf8'));
  w.FaceViewer=class{setMesh(){}setAppearance(){}fit(){}resize(){}};
  for(const name of ['app.js','ui.js','studio.js'])run(fs.readFileSync(path.join(root,name),'utf8'));
  await pause(40);assert.equal(run('booting'),false);
  return {w,run,el,change(id,value){el(id).value=String(value);el(id).dispatchEvent(new w.Event('change'))},snapshot(){return Object.fromEntries(Array.from({length:w.localStorage.length},(_,i)=>{let key=w.localStorage.key(i);return [key,w.localStorage.getItem(key)]}))},close(){run('clearTimeout(geomTimer);clearTimeout(saveTimer)');workers.forEach(worker=>worker.terminate());dom.window.close();assert.deepEqual(errors,[])}};
 }
 const key='facebench-blank-setup-v1';
 const project=a=>JSON.parse(a.run('JSON.stringify(p)'));
 const saved=a=>JSON.parse(a.w.localStorage.getItem(key)).blank;
 let a=await app();assert.equal(a.run('p.mounting'),'cad');assert(!a.el('coupons').disabled);assert.equal(saved(a).mounting,'cad');
 // Standard controls cannot accidentally remove the backing.
 assert(a.el('width').disabled);assert(a.el('height').disabled);assert(a.el('preset').querySelector('[value=custom]').disabled);
 assert(a.el('mounting').querySelector('[value=none]').disabled);assert(a.el('flatSettings').classList.contains('advanced'));
 for(const [id,value] of [['width',180],['height',140],['mounting','none'],['preset','custom']])a.change(id,value);
 assert.equal(a.run('p.mounting'),'cad');assert.equal(a.run('p.width'),156);assert.equal(a.run('p.height'),126.105);
 a.el('removeBacking').click();assert.equal(a.run('p.mounting'),'cad','Easy mode cannot remove backing');
 // Save compatible face preferences, then load every starter through its actual UI.
 a.change('faceThickness',4.2);a.change('radius',7);a.change('material','PETG');a.change('color','#123456');a.change('bevel',.4);a.change('precision',.1);
 let expected=saved(a);
 async function checkMagneticGeometry(q,label){
  assert.equal(q.mounting,'cad',label);assert.equal(q.protectMounts,true,label);assert.equal(q.width,156);assert.equal(q.height,126.105);
  const result=await build(q);assert.equal(result.mesh.status,'NoError',label);assert.equal(result.mesh.components,1,label);
  assert.deepEqual(result.mesh.bounds.min,magnetic.mesh.bounds.min,label+' retains CAD backing');
  const stl=new DataView(C.stl(result.mesh));let minZ=Infinity;
  for(let i=0;i<stl.getUint32(80,true);i++)for(let v=0;v<3;v++)minZ=Math.min(minZ,stl.getFloat32(84+i*50+12+v*12+8,true));
  assert(Math.abs(minZ-magnetic.mesh.bounds.min[2])<1e-5,label+' STL contains rear backing');
 }
 for(let i=0;i<3;i++){
  a.el('openStarters').click();const cards=a.el('starterList').children;assert.equal(cards.length,3);assert(cards[i].textContent.includes('Magnetic backing included'));cards[i].querySelector('button').click();
  await checkMagneticGeometry(project(a),['Contour current','Maker badge','Light garden'][i]);assert.deepEqual(saved(a),expected);
 }
 a.el('sample').click();assert.equal(a.run('p.name'),'MISFIT / 02');await checkMagneticGeometry(project(a),'Load example');assert.deepEqual(saved(a),expected);
 await checkMagneticGeometry(C.migrate(JSON.parse(fs.readFileSync(path.join(root,'example.json'),'utf8'))),'example.json');
 a.el('new').click();assert.deepEqual(JSON.parse(a.run('JSON.stringify(C.blankSetup(p))')),expected);assert.equal(a.run('p.objects.length'),0);
 a.change('faceThickness',4.4);a.el('undo').click();assert.equal(saved(a).thickness,4.2);a.el('redo').click();assert.equal(saved(a).thickness,4.4);
 let before=a.w.localStorage.getItem(key);a.change('faceThickness',0);assert.equal(a.w.localStorage.getItem(key),before);assert.equal(a.run('p.thickness'),4.4);
 // Prototype pockets and disabled protection are project-only; new faces always get protected CAD backing.
 a.change('mounting','round');assert.equal(a.run('p.mounting'),'round');a.el('protectMounts').checked=false;a.el('protectMounts').dispatchEvent(new a.w.Event('change'));
 a.el('new').click();assert.equal(a.run('p.mounting'),'cad');assert.equal(a.run('p.protectMounts'),true);assert.equal(a.run('p.thickness'),4.4);
 // Unmounted/custom needs Advanced plus an explicit confirmation. Cancel and Undo retain the magnetic face.
 a.el('mode').click();assert.equal(a.run('prefs.advanced'),true);let confirmations=0;
 a.w.confirm=()=>{confirmations++;return false};a.el('removeBacking').click();assert.equal(confirmations,1);assert.equal(a.run('p.mounting'),'cad');
 a.w.confirm=()=>true;a.el('removeBacking').click();assert.equal(a.run('p.mounting'),'none');assert(!a.el('width').disabled);assert(!a.el('restoreBacking').hidden);assert(a.el('dimensions').textContent.includes('No mounting'));
 a.el('undo').click();assert.equal(a.run('p.mounting'),'cad');a.el('redo').click();assert.equal(a.run('p.mounting'),'none');
 a.change('width',190);a.change('height',140);a.change('radius',68);assert.equal(a.run('p.width'),190);assert.equal(saved(a).mounting,'cad');assert.equal(saved(a).width,156);assert.equal(saved(a).radius,63.0525);
 await pause(650);let disk=a.snapshot();a.close();a=await app(disk);assert.equal(a.run('p.mounting'),'none','Existing custom project is preserved');assert.equal(a.run('p.width'),190);
 a.el('restoreBacking').click();assert.equal(a.run('p.mounting'),'cad');assert.equal(a.run('p.width'),156);assert.equal(a.run('p.thickness'),4.4);assert.equal(a.run('p.radius'),63.0525);
 a.el('undo').click();assert.equal(a.run('p.mounting'),'none');a.el('new').click();assert.equal(a.run('p.mounting'),'cad');assert.equal(a.run('p.width'),156);assert.equal(a.run('p.thickness'),4.4);assert.equal(a.run('p.material'),'PETG');
 await pause(650);disk=a.snapshot();a.close();
 // Preferences work even without a current autosave.
 delete disk['facebench-v2-current'];delete disk['facebench-v2-previous'];a=await app(disk);assert.equal(a.run('p.mounting'),'cad');assert.equal(a.run('p.thickness'),4.4);a.close();
 // Legacy flat projects remain editable; their old defaults never create new unmounted faces.
 let legacy=C.defaults();legacy.version='3.0.1';a=await app({'facebench-v2-current':JSON.stringify({project:legacy})});assert.equal(a.run('p.mounting'),'none');a.el('new').click();assert.equal(a.run('p.mounting'),'cad');assert.equal(a.run('p.thickness'),2.3);a.close();
 legacy.width=210;legacy.height=150;legacy.thickness=5;legacy.radius=70;legacy.material='Wood';
 a=await app({'facebench-v2-current':JSON.stringify({project:legacy}),[key]:JSON.stringify({version:1,blank:C.blankSetup(legacy)})});assert.equal(a.run('p.width'),210);a.el('new').click();assert.equal(a.run('p.width'),156);assert.equal(a.run('p.thickness'),5);assert.equal(a.run('p.mounting'),'cad');assert.equal(a.run('p.material'),'Wood');a.close();
 // Invalid preference records recover; blocked storage keeps settings for the current session.
 a=await app({[key]:'{broken'});assert.equal(a.run('p.mounting'),'cad');a.w.Storage.prototype.setItem=function(){throw Error('Storage blocked')};a.change('faceThickness',4);a.el('new').click();assert.equal(a.run('p.thickness'),4);assert(a.el('blankSaveStatus').textContent.includes('session'));a.close();
 console.log('PASS magnetic starts: all three starter buttons, app/file examples and binary STL backing; guarded dimensions and flat opt-out; saved face settings, undo/redo, reload, legacy preferences and storage recovery.');
})().catch(error=>{console.error(error);process.exitCode=1});
