const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),{JSDOM}=require('jsdom');
const root=path.resolve(__dirname,'..'),pause=ms=>new Promise(r=>setTimeout(r,ms));
(async()=>{
 const {build,laserStack,vectorEdit,materialStack,calibration}=await import('../engine.js'),C=globalThis.FaceCore;
 async function app(stored={}){
  const dom=new JSDOM(fs.readFileSync(path.join(root,'index.html'),'utf8'),{url:'http://localhost:8080/facebench/',runScripts:'outside-only',pretendToBeVisual:true}),w=dom.window,errors=[],workers=[];
  const run=source=>vm.runInContext(source,dom.getInternalVMContext()),el=id=>w.document.getElementById(id);
  for(const [key,value] of Object.entries(stored))w.localStorage.setItem(key,value);
  w.addEventListener('error',e=>errors.push(e.error));w.setImmediate=setImmediate;w.clearImmediate=clearImmediate;w.TextEncoder=TextEncoder;w.TextDecoder=TextDecoder;w.crypto.randomUUID=require('node:crypto').randomUUID;w.confirm=()=>true;
  w.HTMLDialogElement.prototype.showModal=function(){this.setAttribute('open','')};w.HTMLDialogElement.prototype.close=function(){this.removeAttribute('open');this.dispatchEvent(new w.Event('close'))};w.ResizeObserver=class{observe(){}disconnect(){}};
  w.URL.createObjectURL=()=> 'blob:test';w.URL.revokeObjectURL=()=>{};w.HTMLAnchorElement.prototype.click=function(){};
  w.drawCommands=[];w.HTMLCanvasElement.prototype.getContext=()=>{let points=[],state={measureText:s=>({width:s.length*8}),createImageData:(width,height)=>({data:new Uint8ClampedArray(width*height*4)}),beginPath(){points=[]},moveTo(x,y){points.push([x,y])},lineTo(x,y){points.push([x,y])},stroke(){w.drawCommands.push({type:'stroke',color:state.strokeStyle,points:points.map(p=>p.slice())})},fill(){w.drawCommands.push({type:'fill',points:points.map(p=>p.slice())})}};return new Proxy(state,{get:(obj,key)=>obj[key]||(()=>{})})};w.HTMLCanvasElement.prototype.getBoundingClientRect=()=>({width:800,height:550,left:0,top:0});w.HTMLCanvasElement.prototype.setPointerCapture=function(){};
  w.Worker=class{constructor(){this.active=true;workers.push(this)}postMessage(m){const task=m.action==='stack'?laserStack(m.project):m.action==='vector'?vectorEdit(m.project,m.options):m.action==='materials'?materialStack(m.project,m.options):m.action==='calibration'?calibration(m.project,m.options):build(m.project,m.options);task.then(result=>{if(this.active)this.onmessage({data:{id:m.id,result}})}).catch(e=>{if(this.active)this.onmessage({data:{id:m.id,error:e.message}})})}terminate(){this.active=false}};
  for(const name of ['vendor/jszip.min.js','vendor/opentype.min.js','assets/fonts.js','legacy-core.js','core.js','creative.js','svg-import.js','fabrication.js'])run(fs.readFileSync(path.join(root,name),'utf8'));
  w.FaceViewer=class{setMesh(){}setAppearance(){}fit(){}resize(){}};
  for(const name of ['app.js','ui.js','studio.js'])run(fs.readFileSync(path.join(root,name),'utf8'));
  await pause(40);assert.equal(run('booting'),false);
  return {w,run,el,change(id,value){el(id).value=String(value);el(id).dispatchEvent(new w.Event('change'))},snapshot(){return Object.fromEntries(Array.from({length:w.localStorage.length},(_,i)=>{let key=w.localStorage.key(i);return [key,w.localStorage.getItem(key)]}))},close(){run('clearTimeout(geomTimer);clearTimeout(saveTimer)');workers.forEach(worker=>worker.terminate());dom.window.close();assert.deepEqual(errors,[])}};
 }
 let a=await app();
 const near=(x,y,msg)=>assert(Math.abs(x-y)<1e-7,`${msg||'Coordinate'}: ${x} != ${y}`);
 const json=code=>JSON.parse(a.run('JSON.stringify('+code+')'));
 const seed=(shapes,ids=shapes.map(o=>o.id))=>a.run('clearTimeout(geomTimer);clearTimeout(saveTimer);p=C.newFace();p.objects='+JSON.stringify(shapes)+'.map(o=>baseObject(o.type||"rect",o));selected='+JSON.stringify(ids)+';history=[];future=[];revision++;planResult=null;drag=null;drawing=false;panMode=false;view="design";render()');
 const positions=()=>json('p.objects.map(o=>({id:o.id,x:o.x,y:o.y,symmetry:o.symmetry}))');
 const boxes=()=>json('p.objects.map(shapeBounds)');
 const pointer=(kind,x,y,extra={})=>{let m=json('mapping');a.el('canvas')['onpointer'+kind](new a.w.MouseEvent('pointer'+kind,{button:0,clientX:m.cx+x*m.s,clientY:m.cy+y*m.s,...extra}))};
 const toggle=(id,value)=>{a.el(id).checked=value;a.el(id).dispatchEvent(new a.w.Event('change'))};
 const fixture=[{id:'r',type:'rect',x:-35,y:-20,w:16,h:8,rotation:37},{id:'s',type:'star',x:8,y:23,w:18,h:24,rotation:19},{id:'p',type:'path',x:32,y:-6,w:20,h:18,rotation:-22,contours:[[[0,0],[.9,0],[.3,.8]]]}];
 // Drag feedback is based on visual centers, draws both axes, and bypasses stale cached paths.
 seed([{id:'a',x:30,y:22,w:20,h:14}]);pointer('down',30,22);
 a.run('planRevision=revision;planResult={objectPaths:{a:[[[777,777],[778,777],[777,778]]]}}');a.w.drawCommands.length=0;
 pointer('move',.5,22);near(a.run('p.objects[0].x'),0);near(a.run('p.objects[0].y'),22);assert.equal(a.el('centerGuideStatus').textContent,'Centered horizontally');
 assert(a.w.drawCommands.some(c=>c.type==='stroke'&&c.color==='#70e2ff'&&c.points.every(p=>p[0]===0)));
 assert(!a.w.drawCommands.some(c=>c.points.some(p=>p[0]===777)),'Moving shapes must not use cached world paths');
 pointer('move',8,22);assert(a.el('centerGuideStatus').hidden);
 pointer('move',8,.4);assert.equal(a.el('centerGuideStatus').textContent,'Centered vertically');
 pointer('move',.4,.5);near(a.run('p.objects[0].x'),0);near(a.run('p.objects[0].y'),0);assert.equal(a.el('centerGuideStatus').textContent,'Centered on faceplate');
 assert(a.w.drawCommands.some(c=>c.type==='stroke'&&c.color==='#e4fa82'&&c.points.every(p=>p[1]===0)));
 pointer('up',0,0);assert(a.el('centerGuideStatus').hidden);assert.equal(a.run('history.length'),1);a.el('undo').click();near(a.run('p.objects[0].x'),30);near(a.run('p.objects[0].y'),22);a.el('redo').click();near(a.run('p.objects[0].x'),0);
 // A disabled guide toggle, Alt, cancellation and a plain click never leave stale guides or extra undo entries.
 seed([{id:'a',x:30,y:22,w:20,h:14}]);toggle('centerGuides',false);toggle('snap',false);pointer('down',30,22);pointer('move',.25,.35);near(a.run('p.objects[0].x'),.25);assert(a.el('centerGuideStatus').hidden);pointer('cancel',0,0);near(a.run('p.objects[0].x'),30);assert.equal(a.run('history.length'),0);
 toggle('centerGuides',true);toggle('snap',true);pointer('down',30,22);pointer('move',.25,.35,{altKey:true});near(a.run('p.objects[0].x'),.25);assert(a.el('centerGuideStatus').hidden);pointer('cancel',0,0);pointer('down',30,22);pointer('up',30,22);assert.equal(a.run('history.length'),0);
 // Six-screen-pixel attraction behaves consistently while zoomed and panned.
 toggle('snap',false);for(let zoom of [.5,2]){seed([{id:'a',x:30,y:22,w:20,h:14}]);a.run(`viewState={zoom:${zoom},panX:19,panY:-12};draw()`);let scale=a.run('mapping.s');pointer('down',30,22);pointer('move',4/scale,22);near(a.run('p.objects[0].x'),0);pointer('move',8/scale,22);near(a.run('p.objects[0].x'),8/scale);assert(a.el('centerGuideStatus').hidden);pointer('cancel',0,0)}a.run('viewState={zoom:1,panX:0,panY:0};draw()');
 // Multi-object dragging preserves fractional spacing; linked symmetry axes translate with their shapes.
 seed([{id:'a',x:-24.3,y:15.2,w:10,h:10,group:'g'},{id:'b',x:-5.1,y:15.2,w:20,h:10,group:'g'}]);toggle('snap',true);let b=json('unionBounds(p.objects.map(shapeBounds))'),cx=(b.minX+b.maxX)/2,cy=(b.minY+b.maxY)/2;pointer('down',-24.3,15.2);pointer('move',-24.3-cx+.3,15.2-cy+.3);near(a.run('p.objects[1].x-p.objects[0].x'),19.2);b=json('unionBounds(p.objects.map(shapeBounds))');near((b.minX+b.maxX)/2,0);near((b.minY+b.maxY)/2,0);pointer('up',0,0);
 seed([{id:'s',x:18,y:12,w:10,h:10,symmetry:{mode:'mirrorX',x:8,y:0,count:2}}]);pointer('down',18,12);pointer('move',10.2,12);b=boxes()[0];near((b.minX+b.maxX)/2,0);near(a.run('p.objects[0].symmetry.x'),0);pointer('cancel',0,0);near(a.run('p.objects[0].symmetry.x'),8);
 // All edge/center commands use rotated and asymmetric geometry, not the stored object origins.
 for(let mode of ['left','right','top','bottom','cx','cy']){seed(fixture);a.change('alignTarget','selection');let before=json('unionBounds(p.objects.map(shapeBounds))');a.change('align',mode);for(let b of boxes()){if(mode==='cx')near((b.minX+b.maxX)/2,(before.minX+before.maxX)/2,mode);else if(mode==='cy')near((b.minY+b.maxY)/2,(before.minY+before.maxY)/2,mode);else{let key={left:'minX',right:'maxX',top:'minY',bottom:'maxY'}[mode];near(b[key],before[key],mode)}}assert.equal(a.run('history.length'),1)}
 // Reference selection order is independent of layer order. Locked reference shapes stay fixed.
 seed([{...fixture[0],id:'other'},{...fixture[1],id:'anchor',locked:true}],['anchor','other']);let original=positions()[1],reference=boxes()[1];a.change('alignTarget','first');assert(!a.el('align').disabled);a.change('align','cx');assert.deepEqual(positions()[1],original);b=boxes()[0];near((b.minX+b.maxX)/2,(reference.minX+reference.maxX)/2);assert(a.el('alignHint').textContent.includes('Reference:'));
 // Groups are one alignment unit and retain internal spacing; partially locked groups remain fixed.
 seed([{id:'a',x:-30,y:10,w:10,h:10,group:'g'},{id:'b',x:-15,y:12,w:10,h:10,group:'g'},{id:'c',x:25,y:20,w:12,h:8}],['c','a','b']);a.change('alignTarget','first');a.change('align','left');near(a.run('p.objects[1].x-p.objects[0].x'),15);near(a.run('p.objects[1].y-p.objects[0].y'),2);near(Math.min(boxes()[0].minX,boxes()[1].minX),boxes()[2].minX);
 a.run('p.objects[0].locked=true;render()');let lockedBefore=positions().slice(0,2);a.change('alignTarget','selection');a.change('align','right');assert.deepEqual(positions().slice(0,2),lockedBefore);
 for(let axis of ['x','y']){seed(fixture);let before=boxes(),centers=before.map(b=>axis==='x'?(b.minX+b.maxX)/2:(b.minY+b.maxY)/2).sort((a,b)=>a-b);a.change('align','d'+axis);let after=boxes().map(b=>axis==='x'?(b.minX+b.maxX)/2:(b.minY+b.maxY)/2).sort((a,b)=>a-b);near(after[0],centers[0]);near(after[2],centers[2]);near(after[1],(centers[0]+centers[2])/2)}
 seed(fixture.slice(0,2));assert(a.el('align').querySelector('[value=dx]').disabled);a.change('align','dx');assert.equal(a.run('history.length'),0);
 seed(fixture.slice(0,1));let initial=boxes()[0];a.el('centerX').click();b=boxes()[0];near((b.minX+b.maxX)/2,0);near(b.minY,initial.minY);a.el('centerY').click();b=boxes()[0];near((b.minY+b.maxY)/2,0);a.el('undo').click();near(boxes()[0].minY,initial.minY);
 seed(fixture);let gap=a.run('p.objects[1].x-p.objects[0].x');a.el('center').click();b=json('unionBounds(p.objects.map(shapeBounds))');near((b.minX+b.maxX)/2,0);near((b.minY+b.maxY)/2,0);near(a.run('p.objects[1].x-p.objects[0].x'),gap);
 // Every order control has distinct behavior and preserves relative order of multi-selected shapes.
 const layerShapes=['a','b','c','d','e'].map((id,i)=>({id,x:i*12-24,y:20,w:6,h:6}));
 for(let [button,expected] of [['sendBack','bdace'],['sendBackward','badce'],['bringForward','acbed'],['bringFront','acebd']]){seed(layerShapes,['b','d']);a.el(button).click();assert.equal(a.run('p.objects.map(o=>o.id).join("")'),expected);assert.equal(a.run('history.length'),1);a.el('undo').click();assert.equal(a.run('p.objects.map(o=>o.id).join("")'),'abcde');a.el('redo').click();assert.equal(a.run('p.objects.map(o=>o.id).join("")'),expected)}
 seed(layerShapes,['a']);assert(a.el('sendBack').disabled);assert(a.el('sendBackward').disabled);seed(layerShapes,['e']);assert(a.el('bringFront').disabled);assert(a.el('bringForward').disabled);
 seed(layerShapes.map(o=>({...o,locked:o.id==='b'})),['b','d']);a.el('sendBack').click();assert.equal(a.run('p.objects.map(o=>o.id).join("")'),'dabce');
 // Context menu offers the same four operations and preserves an existing multiple selection.
 seed(layerShapes,['b','d']);let m=json('mapping');a.el('canvas').oncontextmenu(new a.w.MouseEvent('contextmenu',{clientX:m.cx-12*m.s,clientY:m.cy+20*m.s}));assert.deepEqual(json('selected'),['b','d']);assert.deepEqual(json('Array.from(menu.children).map(b=>b.textContent)'),['Duplicate','Send to back','Send backward','Bring forward','Bring to front','Delete']);a.run('menu.children[4].click()');assert.equal(a.run('p.objects.map(o=>o.id).join("")'),'acebd');
 toggle('centerGuides',false);await pause(650);let disk=a.snapshot();a.close();a=await app(disk);assert.equal(a.run('p.objects.map(o=>o.id).join("")'),'acebd');assert.equal(a.el('centerGuides').checked,false);assert.equal(a.run('p.mounting'),'cad');a.close();
 console.log('PASS arrangement: live axis guides and draw commands, exact snapping/Alt/zoom/cancel/undo, group spacing and symmetry, rotated/asymmetric alignment, fixed references, distribution, four layer orders, context menu and reload.');
})().catch(error=>{console.error(error);process.exitCode=1});
