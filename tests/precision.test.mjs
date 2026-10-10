import test from 'node:test';
import assert from 'node:assert/strict';
import {newProject,addComponent,starterParts,circ,rect,parseUnit} from '../dist/js/model.js';
import {componentBounds,shapeBounds,borderDistances,relativeGap,precisionPosition,panelBounds,precisionDimensions} from '../dist/js/precision.js';
const close=(actual,expected)=>assert.ok(Math.abs(actual-expected)<1e-9,`${actual} != ${expected}`);
function fixture(){const p=newProject(),b=p.panels[0];b.w=200;b.h=120;const a=addComponent(p,b,starterParts[0],40,50),c=addComponent(p,b,starterParts[0],100,60);a.definition.front=circ(20);c.definition.front=rect(30,10);return {p,b,a,c};}

test('border placement gives the requested physical gap on all four edges and preserves the other coordinate',()=>{
 const {b,c}=fixture();c.rotation=37;
 for(const edge of ['left','right','top','bottom']){
  const before={x:c.x,y:c.y};Object.assign(c,precisionPosition(b,c,{kind:'border',edge,distance:12.7}));
  close(borderDistances(b,c)[edge],12.7);close(c[['left','right'].includes(edge)?'y':'x'],before[['left','right'].includes(edge)?'y':'x']);
 }
});
test('exact rotated circle, rectangle and rounded rectangle bounds',()=>{
 const {c}=fixture();c.x=0;c.y=0;c.rotation=45;
 let a=shapeBounds(circ(20,3,0),c);close(a.w,20);close(a.x,3/Math.sqrt(2)-10);
 a=shapeBounds(rect(30,10),c);close(a.w,40/Math.sqrt(2));close(a.h,40/Math.sqrt(2));
 a=shapeBounds(rect(30,10,0,0,2),c);close(a.w,32/Math.sqrt(2)+4);
});
test('compound cutouts use all holes and exact transformed Bezier extrema',()=>{
 const {c}=fixture();c.x=0;c.y=0;c.rotation=90;c.definition.openings=[circ(4,-10,0),circ(6,12,0)];
 const b=componentBounds(c,'openings');close(b.x,-3);close(b.y,-12);close(b.h,27);
 const path={type:'path',commands:[{type:'M',x:0,y:0},{type:'C',x1:0,y1:12,x2:12,y2:12,x:12,y:0}]};
 const a=shapeBounds(path,{x:0,y:0,rotation:0});close(a.h,9);close(a.w,12);
 const q=shapeBounds({type:'path',commands:[{type:'M',x:0,y:0},{type:'Q',x1:10,y1:20,x:20,y:0}]},{rotation:0});close(q.h,10);
});
test('relative gap supports all directions, mixed sizes and rotations while reference stays fixed',()=>{
 const {b,a,c}=fixture();c.rotation=29;const fixed=JSON.stringify(a);
 for(const direction of ['right','left','above','below']){
  Object.assign(c,precisionPosition(b,c,{kind:'relative',referenceId:a.id,direction,distance:5,align:true}));
  close(relativeGap(c,a,direction),5);close(c[['right','left'].includes(direction)?'y':'x'],a[['right','left'].includes(direction)?'y':'x']);
  assert.equal(JSON.stringify(a),fixed);
 }
});
test('front, rear, openings and reference bases remain independent of view and labels',()=>{
 const {b,c}=fixture();c.definition.rear=rect(40,20);c.definition.openings=[circ(8)];c.label='A VERY LONG LABEL';
 const widths={front:30,rear:40,openings:8,center:0};
 for(const [basis,w] of Object.entries(widths)){
  Object.assign(c,precisionPosition(b,c,{kind:'border',edge:'left',basis,distance:10}));close(c.x,10+w/2);
 }
});
test('centre distance preserves direction and has a deterministic coincident fallback',()=>{
 const {b,a,c}=fixture();c.x=a.x+3;c.y=a.y+4;
 Object.assign(c,precisionPosition(b,c,{kind:'distance',referenceId:a.id,distance:50}));close(c.x-a.x,30);close(c.y-a.y,40);
 c.x=a.x;c.y=a.y;Object.assign(c,precisionPosition(b,c,{kind:'distance',referenceId:a.id,distance:25}));close(c.x-a.x,25);close(c.y,a.y);
});
test('invalid distances, self-reference, stale selection and locks cannot move a part',()=>{
 const {b,a,c}=fixture(),before=JSON.stringify(c),request={kind:'border',edge:'left',distance:10};
 for(const distance of [-1,NaN,Infinity,10001])assert.throws(()=>precisionPosition(b,c,{...request,distance}));
 assert.throws(()=>precisionPosition(b,c,{kind:'relative',referenceId:c.id,direction:'right',distance:10}));
 assert.throws(()=>precisionPosition(b,c,{kind:'relative',referenceId:a.id,direction:'wrong',distance:10}));
 assert.throws(()=>precisionPosition(b,{...c},request));assert.equal(JSON.stringify(c),before);
 c.locked=true;assert.throws(()=>precisionPosition(b,c,request),/Unlock/);c.locked=false;b.layers.cut.locked=true;assert.throws(()=>precisionPosition(b,c,request),/Unlock/);
});
test('inch input and offset imported outline bounds position correctly; overlay values describe the same geometry',()=>{
 const {b,a,c}=fixture();b.shape='imported';b.outline=[{x:10,y:20},{x:210,y:20},{x:210,y:120},{x:10,y:120}];
 assert.deepEqual(panelBounds(b),{x:10,y:20,w:200,h:100});
 Object.assign(c,precisionPosition(b,c,{kind:'border',edge:'left',distance:parseUnit('0.5 in')}));close(c.x,37.7);
 const dims=precisionDimensions(b,c,{referenceId:a.id,direction:'right'});close(dims[0].value,12.7);assert.equal(dims.length,5);close(dims[4].value,relativeGap(c,a,'right'));
});
