/* Headless DOM-contract tests, NOT a substitute for browser interaction or visual QA. */
import test from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs';import {setup} from './setup.mjs';import {example,clone} from '../dist/js/model.js';
setup();
class Element {constructor(){this.dataset={};this.style={setProperty(){}};this.listeners={};this.classList={add(){},remove(){},toggle(){},contains(){return false;}};this.clientWidth=1000;this.clientHeight=700;this.value='';this.innerHTML='';this.hidden=false;this.open=false;this.files=[];this.type='text';}addEventListener(k,f){this.listeners[k]=f;}setAttribute(k,v){this[k]=v;}querySelector(){return new Element();}showModal(){this.open=true;}close(){this.open=false;}focus(){}select(){}click(){}getBoundingClientRect(){return {left:0,top:0,width:1000,height:700};}}
const nodes=new Map();const node=key=>{if(!nodes.has(key))nodes.set(key,new Element());return nodes.get(key);};const listeners={};globalThis.document={querySelector:node,querySelectorAll:()=>[],getElementById:id=>node('#'+id),documentElement:new Element(),body:new Element(),hidden:false,addEventListener:(k,f)=>listeners[k]=f,createElement:()=>new Element()};globalThis.window=globalThis;const windowListeners={};globalThis.addEventListener=(name,fn)=>windowListeners[name]=fn;globalThis.innerWidth=1440;globalThis.requestAnimationFrame=fn=>setTimeout(fn,0);globalThis.location={protocol:'http:',reload(){}};globalThis.fetch=async()=>({ok:true,arrayBuffer:async()=>{const b=fs.readFileSync(new URL('../dist/fonts/DejaVuSans.ttf',import.meta.url));return b.buffer.slice(b.byteOffset,b.byteOffset+b.byteLength);}});
await import('../dist/js/app.js');await new Promise(r=>setTimeout(r,25));const api=globalThis.INTERFACEBENCH;const realTimeout=globalThis.setTimeout;globalThis.setTimeout=(fn,ms,...args)=>{const t=realTimeout(fn,ms,...args);if(ms>1000)t.unref();return t;};test.after(()=>api.store.channel?.close());const act=(name,dataset={})=>api.action(name,{dataset});
test('app boots and renders welcome without storage, using an explicit backup-needed status',()=>{assert.match(node('#dialogContent').innerHTML,/Give your/);assert.match(node('#saveState').textContent,/Backup needed/);});
test('example render produces canvas, library, inspector; precise edit, duplicate, rotate and undo retain model',async()=>{await api.openProject(example());const a=api.app;assert.match(node('#leftContent').innerHTML,/COMPONENT LIBRARY/);assert.match(node('#canvas').innerHTML,/data-object/);const id=a.panel.components[0].id;api.select([id]);const orig=a.panel.components.length;await act('duplicate');assert.equal(a.panel.components.length,orig+1);await act('undo');assert.equal(a.panel.components.length,orig);api.select([id]);await act('rotate');assert.equal(a.panel.components.find(c=>c.id===id).rotation,90);await act('undo');assert.equal(a.panel.components.find(c=>c.id===id).rotation,0);});
test('numeric edit validates and unit display changes never mutate dimensions',async()=>{const a=api.app;api.select([a.panel.components[0].id]);listeners.change({target:{dataset:{field:'object.x'},value:'0.5 in'}});assert.equal(a.panel.components[0].x,12.7);const s=JSON.stringify(a.p);listeners.change({target:{id:'units',value:'in',type:'select-one',dataset:{}}});assert.equal(JSON.stringify(a.p),s);});
test('every main stage renders and rehearsal leaves geometry unchanged',async()=>{await api.openProject(example());const before=JSON.stringify(api.app.p);for(const stage of ['define','arrange','connect','rehearse','fabricate']){await act('stage',{stage});if(stage==='connect')assert.match(node('#stageSurface').innerHTML,/wireBody/);if(stage==='fabricate')assert.match(node('#stageSurface').innerHTML,/Create fabrication ZIP/);}assert.equal(JSON.stringify(api.app.p),before);});
test('custom definition dialog actually contains dimension and terminals controls',async()=>{api.select([api.app.panel.components[0].id]);await act('edit-definition');assert.match(node('#dialogContent').innerHTML,/name="openings"/);assert.match(node('#dialogContent').innerHTML,/name="rearW"/);assert.match(node('#dialogContent').innerHTML,/name="terminals"/);await act('close');});
test('malformed project import does not replace current project; imported baseline survives',async()=>{const before=JSON.stringify(api.app.p);await assert.rejects(api.readFile(new File(['{"bad":true}'],'bad.json',{type:'application/json'}),'project'));assert.equal(JSON.stringify(api.app.p),before);const p=example(),snapshot=clone(p);p.baselines.push({id:'baseline-test',name:'A',date:'2026-10-08',snapshot});await api.readFile(new File([JSON.stringify(p)],'p.json',{type:'application/json'}),'project');assert.equal(api.app.p.baselines.length,1);});
test('locks protect numeric fields, transforms and deletion; multi-selection arrangement works',async()=>{await api.openProject(example());const a=api.app,id=a.panel.components[0].id;api.select([id]);await act('lock');const before=clone(a.panel.components[0]);await act('rotate');await act('delete');assert.deepEqual(a.panel.components[0],before);await act('lock');api.select(a.panel.components.slice(0,3).map(c=>c.id));await act('align',{kind:'cy'});assert.equal(new Set(a.panel.components.slice(0,3).map(c=>c.y)).size,1);});
async function submitValues(form,values){const Original=globalThis.FormData;globalThis.FormData=class{constructor(){}[Symbol.iterator](){return Object.entries(values)[Symbol.iterator]();}};try{return await api.submit({dataset:{form}});}finally{globalThis.FormData=Original;}}
test('terminal table rename preserves IDs and wiring through definition submit and undo',async()=>{await api.openProject(example());api.select([api.app.panel.components[0].id]);await act('edit-definition');const c=clone(api.app.panel.components[0]),d=c.definition,original=clone(api.app.p.connections);listeners.change({target:{dataset:{terminal:'name',index:'0'},value:'Renamed SDA',type:'text'}});const values={name:d.name,kind:d.kind,prefix:d.prefix,mountReference:d.mountReference,source:d.source,notes:d.notes,verifiedDate:d.verifiedDate,depth:d.depth,bend:d.bend,minThickness:d.minThickness,maxThickness:d.maxThickness,openings:JSON.stringify(d.openings)};for(const k of ['front','rear','access'])Object.assign(values,{[k+'Type']:d[k].type,[k+'W']:d[k].d||d[k].w,[k+'H']:d[k].h||d[k].d,[k+'R']:d[k].r||0});await submitValues('definition',values);assert.equal(api.app.panel.components[0].definition.terminals[0].name,'Renamed SDA');assert.deepEqual(api.app.p.connections,original);await act('undo');assert.equal(api.app.panel.components[0].definition.terminals[0].name,d.terminals[0].name);});
test('sourced presets, scale legend dialog and library revision apply are reachable',async()=>{await api.openProject(example());api.select([api.app.panel.components[0].id]);await act('controller');node('#m-profile').value='nano-every';await act('controller-preset');assert.equal(node('#m-name').value,'Arduino Nano Every');assert.match(node('#m-pins').value,/A7,A7,5/);await act('close');const a=api.app.panel.artwork.find(a=>a.type==='rotary');api.select([a.id]);await act('legend');assert.match(node('#dialogContent').innerHTML,/Custom labels/);await submitValues('legend',{labelMode:'numeric',labelPrefix:'',labelSuffix:' V',labelMin:'0',labelMax:'10',labelDecimals:'0',labelEvery:'2',majorEvery:'2',legendSize:'3',legendGap:'2',majorLength:'4',minorLength:'2',customLabels:''});assert.equal(api.app.panel.artwork.find(x=>x.id===a.id).labelMode,'numeric');api.select([api.app.panel.components[0].id]);await act('save-library');await submitValues('save-library',{saveKind:'revision',revisionNote:'Reviewed dimensions'});const saved=api.app.library.at(-1);await act('library-updates');assert.match(node('#dialogContent').innerHTML,/Apply r/);await act('apply-revision',{id:saved.id});assert.equal(api.app.panel.components[0].definition.id,saved.id);await act('undo');assert.notEqual(api.app.panel.components[0].definition.id,saved.id);});
test('companion import previews without mutation, applies atomically and is undoable',async()=>{await api.openProject(example());const before=JSON.stringify(api.app.p),file=new File([fs.readFileSync(new URL('./fixtures/copperbench-schema5.json',import.meta.url))],'board.json');await api.readFile(file,'copperbench');assert.equal(JSON.stringify(api.app.p),before);assert.match(node('#dialogContent').innerHTML,/mounting/);await submitValues('handoff-import',{});assert.equal(api.app.p.panels.length,2);await act('undo');assert.equal(JSON.stringify(api.app.p.panels),JSON.stringify(JSON.parse(before).panels));await act('interchange');assert.match(node('#dialogContent').innerHTML,/PINNOTE/);await act('handoff-export',{target:'pinnote'});assert.match(node('#dialogContent').innerHTML,/Wire lengths/);await act('close');});
test('catalog search, filters and favorites persist through placement and undo',async()=>{
 await api.openProject(example());await act('stage',{stage:'arrange'});await act('catalog-reset');
 const a=api.app,baseline=JSON.stringify(a.p);assert.ok(a.library.length>=267);assert.match(node('#leftContent').innerHTML,/24 of/);
 listeners.change({target:{id:'partCategory',value:'data',dataset:{}}});
 listeners.input({target:{id:'partSearch',value:'usb type c',dataset:{}}});
 assert.match(node('#partResults').innerHTML,/USB-C panel coupler/);assert.equal(node('#partCount').textContent,'1 of 1 parts');
 const id='gen-usb-c-panel-coupler';await act('part-favorite',{id});assert.ok(a.prefs.favoriteParts.includes(id));assert.equal(JSON.stringify(a.p),baseline);
 await act('part-details',{id});assert.equal(JSON.stringify(a.p),baseline);assert.match(node('#dialogContent').innerHTML,/24 terminals/);assert.match(node('#dialogContent').innerHTML,/Generic planning template/);
 await act('place-preview',{id});assert.equal(a.panel.components.at(-1).definition.id,id);assert.equal(a.catalog.query,'usb type c');assert.match(node('#leftContent').innerHTML,/value="usb type c"/);assert.equal(a.catalog.category,'data');
 await act('undo');assert.equal(a.panel.components.length,JSON.parse(baseline).panels[0].components.length);
 await act('catalog-reset');listeners.change({target:{id:'partSource',value:'favorites',dataset:{}}});assert.match(node('#partResults').innerHTML,/USB-C panel coupler/);
 await act('part-favorite',{id});assert.match(node('#partResults').innerHTML,/No matching parts/);
 await act('catalog-reset');await act('catalog-more');assert.equal(a.catalog.limit,48);assert.match(node('#partCount').textContent,/48 of/);
 listeners.input({target:{id:'partSearch',value:'<script>',dataset:{}}});assert.match(node('#partResults').innerHTML,/No matching parts/);
 await act('catalog-reset');
});
test('exactly two component fabrication checkboxes save, undo, and drive front/rear export selection',async()=>{
 await api.openProject(example());await act('stage',{stage:'arrange'});const a=api.app,id=a.panel.components[0].id;api.select([id]);
 const html=node('#rightContent').innerHTML;assert.equal((html.match(/data-label-side=/g)||[]).length,2);assert.match(html,/> Label on Front</);assert.match(html,/> Label on Rear</);assert.doesNotMatch(html,/master|assembly guide/i);
 const index=fs.readFileSync(new URL('../dist/index.html',import.meta.url),'utf8');assert.doesNotMatch(index,/labels-front|labels-rear|data-label-side/);
 const change=(side,checked)=>listeners.change({target:{dataset:{labelScope:'component',labelSide:side,id},checked}});
 change('front',false);change('rear',true);assert.deepEqual(a.panel.components[0].labelSides,{front:false,rear:true});
 await act('rear');assert.ok(node('#canvas').innerHTML.includes(`data-component-label="${id}"`));change('rear',false);assert.ok(!node('#canvas').innerHTML.includes(`data-component-label="${id}"`));await act('undo');assert.deepEqual(a.panel.components[0].labelSides,{front:false,rear:true});
 const json=JSON.stringify(a.p);await api.openProject(JSON.parse(json));assert.deepEqual(a.panel.components[0].labelSides,{front:false,rear:true});assert.equal(a.panel.labelSides,undefined);
 await act('stage',{stage:'fabricate'});assert.doesNotMatch(node('#stageSurface').innerHTML,/out-rear|Rear guide/);await act('rear');assert.match(node('#stageSurface').innerHTML,/REAR/);await act('front');assert.match(node('#stageSurface').innerHTML,/FRONT/);
 await act('stage',{stage:'arrange'});
});

test('precision border edits save exact units and support undo and import without changing reference parts',async()=>{
 const {borderDistances}=await import('../dist/js/precision.js');
 await api.openProject(example());await act('stage',{stage:'arrange'});api.app.prefs.units='mm';
 const id=api.app.panel.components[0].id;api.select([id]);
 assert.match(node('#rightContent').innerHTML,/Precision placement/);assert.equal((node('#rightContent').innerHTML.match(/data-border=/g)||[]).length,4);
 const before=clone(api.app.p);
 listeners.change({target:{dataset:{border:'left',id},value:'0.5 in'}});
 assert.ok(Math.abs(borderDistances(api.app.panel,api.app.panel.components[0]).left-12.7)<1e-9);
 assert.deepEqual(api.app.panel.components.slice(1),before.panels[0].components.slice(1));
 const saved=JSON.stringify(api.app.p);await act('undo');assert.deepEqual(api.app.panel.components,before.panels[0].components);
 await api.openProject(JSON.parse(saved));assert.ok(Math.abs(borderDistances(api.app.panel,api.app.panel.components[0]).left-12.7)<1e-9);
});
test('relative spacing and editable canvas dimensions apply once, mirror on rear, and respect locks/rehearsal',async()=>{
 const {borderDistances,relativeGap}=await import('../dist/js/precision.js');
 await api.openProject(example());await act('stage',{stage:'arrange'});const a=api.app;const [reference,moving]=a.panel.components;api.select([moving.id]);
 for(const [id,value] of [['precisionReference',reference.id],['precisionDirection','right']])listeners.change({target:{id,value,dataset:{}}});
 node('#precisionGap').value='5 mm';await act('precision-place');
 assert.ok(Math.abs(relativeGap(a.panel.components[1],a.panel.components[0],'right')-5)<1e-9);assert.deepEqual(a.panel.components[0],reference);
 assert.match(node('#canvas').innerHTML,/data-kind="relative"/);assert.match(node('#canvas').innerHTML,/role="button" tabindex="0"/);
 const before=clone(a.panel.components[1]);await act('rear');assert.deepEqual(a.panel.components[1],before);
 await act('dimension-edit',{id:moving.id,kind:'border',edge:'right',basis:'front'});await submitValues('precision-dimension',{distance:'20'});
 assert.ok(Math.abs(borderDistances(a.panel,a.panel.components[1]).right-20)<1e-9);
 await act('undo');assert.deepEqual(a.panel.components[1],before);
 await act('lock');const locked=clone(a.panel.components[1]);await assert.rejects(act('precision-place'),/Unlock/);assert.deepEqual(a.panel.components[1],locked);await act('lock');
 await act('stage',{stage:'rehearse'});await assert.rejects(act('precision-place'),/Leave Rehearse/);assert.doesNotMatch(node('#canvas').innerHTML,/precision-dimension/);
 await act('stage',{stage:'arrange'});await act('front');
});
test('two selected reference dimension moves only the second selected part and invalid input preserves the design',async()=>{
 await api.openProject(example());await act('stage',{stage:'arrange'});const a=api.app,[first,second]=a.panel.components;
 api.select([first.id,second.id]);assert.match(node('#canvas').innerHTML,/data-kind="distance"/);
 await act('dimension-edit',{id:second.id,kind:'distance',referenceId:first.id});
 const saved=JSON.stringify(a.p);await assert.rejects(submitValues('precision-dimension',{distance:'-4'}),/distance/);assert.equal(JSON.stringify(a.p),saved);
 await submitValues('precision-dimension',{distance:'2 in'});const [f,s]=a.panel.components;assert.deepEqual(f,first);assert.ok(Math.abs(Math.hypot(f.x-s.x,f.y-s.y)-50.8)<1e-9);
});
test('dimension pointer and keyboard activation open editing without beginning a canvas drag',async()=>{
 await api.openProject(example());await act('stage',{stage:'arrange'});const c=api.app.panel.components[0];api.select([c.id]);
 const dimension={dataset:{action:'dimension-edit',kind:'border',edge:'left',id:c.id,basis:'front'}},target={tagName:'g',closest:()=>dimension};
 node('#canvas').setPointerCapture=()=>{throw Error('A dimension must not begin a drag.');};
 node('#canvas').listeners.pointerdown({button:0,target});
 let prevented=false;windowListeners.keydown({key:'Enter',target,preventDefault(){prevented=true;}});
 assert.ok(prevented);assert.match(node('#dialogContent').innerHTML,/Edit dimension/);await act('close');
 listeners.click({target,preventDefault(){}});assert.match(node('#dialogContent').innerHTML,/Move component/);await act('close');
});

function measurementPointer(x,y,extra={}){return {button:0,pointerId:1,clientX:x,clientY:y,target:{tagName:'svg',closest:()=>null},preventDefault(){},...extra};}
function enableMeasurementPointerContract(){
 globalThis.DOMPoint=class{constructor(x,y){this.x=x;this.y=y;}matrixTransform(){return this;}};
 node('#canvas').getScreenCTM=()=>({inverse:()=>({})});node('#canvas').setPointerCapture=()=>{};
}
function measureClick(x,y,extra={}){const e=measurementPointer(x,y,extra);node('#canvas').listeners.pointerdown(e);node('#canvas').listeners.pointerup(e);}
function measureKey(key,extra={}){windowListeners.keydown({key,target:{tagName:'svg',closest:()=>null},preventDefault(){},...extra});}

test('Measure is explicitly active, snaps point one and previews the next segment without modifying the project',async()=>{
 await api.openProject(example());enableMeasurementPointerContract();const saved=JSON.stringify(api.app.p);await act('measure');
 let prevented=false;windowListeners.keydown({key:'Enter',target:{tagName:'BUTTON',closest:()=>null},preventDefault(){prevented=true;}});assert.equal(prevented,false);
 assert.equal(node('#measureTool')['aria-pressed'],'true');assert.equal(node('#measurePanel').hidden,false);assert.equal(document.body.dataset.tool,'measure');
 listeners.change({target:{id:'measureSnap',value:'grid',dataset:{}}});measureClick(13.1,17.3);
 assert.equal(api.app.measure.length,1);assert.equal(api.app.measure[0].x,15);assert.equal(api.app.measure[0].y,15);assert.match(node('#canvas').innerHTML,/data-measure-point="1"/);assert.match(node('#measureReadout').textContent,/Point 1 set/);
 node('#canvas').listeners.pointermove(measurementPointer(33,31));await new Promise(r=>setTimeout(r,5));assert.match(node('#canvas').innerHTML,/measurement-preview/);assert.match(node('#measureReadout').textContent,/Live distance/);
 measureClick(33,31);assert.equal(api.app.measure.length,2);assert.match(node('#measureReadout').textContent,/Distance 25 mm/);assert.equal(JSON.stringify(api.app.p),saved);
 await act('select-tool');assert.equal(node('#measurePanel').hidden,true);assert.equal(node('#measureTool')['aria-pressed'],'false');
});
test('area clicks close at the starting point, report area/perimeter and undo independently of parts',async()=>{
 await api.openProject(example());enableMeasurementPointerContract();await act('measure');await act('measure-mode',{mode:'area'});listeners.change({target:{id:'measureSnap',value:'off',dataset:{}}});const saved=JSON.stringify(api.app.p);
 for(const p of [[10,10],[60,10],[60,40],[10,40]])measureClick(...p);
 assert.equal(api.app.measure.length,4);assert.equal(node('#measureFinish').disabled,false);assert.match(node('#canvas').innerHTML,/measurement-area/);
 measureClick(10,10);assert.equal(api.app.measureClosed,true);assert.match(node('#measureReadout').textContent,/Area 1500 mm² · Perimeter 160 mm/);assert.equal(node('#measureExact').disabled,true);
 measureKey('Backspace');assert.equal(api.app.measure.length,3);assert.equal(api.app.measureClosed,false);measureKey('Enter');assert.equal(api.app.measureClosed,true);assert.match(node('#measureReadout').textContent,/Area 750 mm²/);
 measureKey('z',{ctrlKey:true});assert.equal(api.app.measure.length,2);assert.equal(api.app.measureClosed,false);assert.equal(JSON.stringify(api.app.p),saved);
});
test('exact measurement coordinates accept units; invalid input keeps points and Escape clears then exits',async()=>{
 await api.openProject(example());await act('measure');await act('measure-mode',{mode:'distance'});await act('measure-exact');
 assert.match(node('#dialogContent').innerHTML,/Enter measurement point/);await submitValues('measure-point',{pointX:'1 in',pointY:'0'});await act('measure-exact');
 await assert.rejects(submitValues('measure-point',{pointX:'no',pointY:'10'}),/number/);assert.equal(api.app.measure.length,1);
 await submitValues('measure-point',{pointX:'2 in',pointY:'0'});assert.match(node('#measureReadout').textContent,/Distance 25.4 mm/);
 measureKey('Escape');assert.equal(api.app.measure.length,0);assert.equal(api.app.tool,'measure');measureKey('Escape');assert.equal(api.app.tool,'select');assert.equal(node('#measurePanel').hidden,true);
});
test('measurement rear clicks mirror physical coordinates, panning and pointer cancellation add no points',async()=>{
 await api.openProject(example());enableMeasurementPointerContract();await act('measure');listeners.change({target:{id:'measureSnap',value:'off',dataset:{}}});await act('rear');
 measureClick(20,30);assert.equal(api.app.measure[0].x,api.app.panel.w-20);assert.equal(api.app.measure[0].y,30);
 node('#canvas').listeners.pointerdown(measurementPointer(40,40));node('#canvas').listeners.pointercancel(measurementPointer(40,40));assert.equal(api.app.measure.length,1);
 measureClick(40,40,{button:1});assert.equal(api.app.measure.length,1);
 await act('measure-mode',{mode:'area'});for(const p of [[10,10],[40,40],[10,40],[40,10]])measureClick(...p);await assert.rejects(act('measure-finish'),/cross/);assert.equal(api.app.measureClosed,false);
 await act('measure-new');for(const p of [[10,10],[40,10],[40,40]])measureClick(...p);node('#canvas').listeners.dblclick({preventDefault(){}});assert.equal(api.app.measureClosed,true);
 await act('select-tool');await act('front');
});
