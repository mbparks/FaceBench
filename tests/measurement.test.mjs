import test from 'node:test';
import assert from 'node:assert/strict';
import {newProject,addComponent,starterParts,circ,rect} from '../dist/js/model.js';
import {transform} from '../dist/js/geometry.js';
import {snapMeasurement,measurementFeatures,invalidateMeasurementFeatures,polygonMeasurement,addMeasurementPoint,finishMeasurement,measurementSummary,measurementOverlay} from '../dist/js/measurement.js';
const close=(a,b)=>assert.ok(Math.abs(a-b)<1e-8,`${a} != ${b}`);
function fixture(){const p=newProject(),b=p.panels[0];b.shape='rect';b.w=200;b.h=150;const c=addComponent(p,b,starterParts[0],80,70);c.definition.front=circ(30);c.definition.rear=rect(40,20);c.definition.openings=[circ(4)];return {p,b,c};}
const state=(mode='area')=>({measure:[],measureMode:mode,measureHover:null,measureClosed:false});

test('feature snaps select exact panel corners, component references and circle edges',()=>{
 const {b,c}=fixture();let p=snapMeasurement(b,{x:.2,y:.1},{mode:'geometry',tolerance:.5});close(p.x,0);close(p.y,0);assert.ok(p.snapped);
 p=snapMeasurement(b,{x:c.x+.1,y:c.y-.1},{mode:'geometry',tolerance:.5});close(p.x,c.x);close(p.y,c.y);
 const a=Math.PI/7,raw={x:c.x+15.2*Math.cos(a),y:c.y+15.2*Math.sin(a)};p=snapMeasurement(b,raw,{mode:'geometry',tolerance:.5});close(Math.hypot(p.x-c.x,p.y-c.y),15);assert.match(p.label,/edge/);
});
test('rotated rectangles snap to physical edges and rounded panels have no phantom sharp corners',()=>{
 const {b,c}=fixture();c.definition.front=rect(40,20);c.rotation=33;
 const target=transform(17,10,c),raw=transform(17,10.2,c),p=snapMeasurement(b,raw,{mode:'geometry',tolerance:.4});close(p.x,target.x);close(p.y,target.y);
 b.shape='rounded';b.radius=10;invalidateMeasurementFeatures(b);const features=measurementFeatures(b);assert.ok(!features.points.some(p=>p.x===0&&p.y===0));
 const edge=snapMeasurement(b,{x:2.8,y:2.8},{mode:'geometry',tolerance:.5});close(Math.hypot(edge.x-10,edge.y-10),10);
});
test('rear snapping uses rear body while physical coordinates and unit-independent values remain stable',()=>{
 const {b,c}=fixture();const p=snapMeasurement(b,{x:c.x+19.8,y:c.y+6},{side:'rear',mode:'geometry',tolerance:.4});close(p.x,c.x+20);close(p.y,c.y+6);
 const front=snapMeasurement(b,{x:c.x+19.8,y:c.y+6},{side:'front',mode:'geometry',tolerance:.4});assert.equal(front.snapped,false);
});
test('grid, free points and axis constraints never silently round free coordinates',()=>{
 const {b}=fixture();let p=snapMeasurement(b,{x:33.12,y:38.9},{mode:'grid',grid:5});close(p.x,35);close(p.y,40);
 p=snapMeasurement(b,{x:33.12,y:38.9},{mode:'geometry-grid',free:true});close(p.x,33.12);close(p.y,38.9);assert.equal(p.snapped,false);
 p=snapMeasurement(b,{x:33.12,y:38.9},{mode:'grid',grid:5,anchor:{x:10,y:36.2},shift:true});close(p.x,35);close(p.y,36.2);
});
test('closure snaps point one only with at least three points; Alt permits a nearby distinct point',()=>{
 const {b}=fixture(),options={mode:'off',first:{x:20,y:20},canClose:true,tolerance:1};
 assert.equal(snapMeasurement(b,{x:20.2,y:20.1},options).close,true);
 assert.notEqual(snapMeasurement(b,{x:20.2,y:20.1},{...options,canClose:false}).close,true);
 assert.notEqual(snapMeasurement(b,{x:20.2,y:20.1},{...options,free:true}).close,true);
});
test('rectangle, concave and reversed polygons return correct area and closed perimeter',()=>{
 const ps=[{x:0,y:0},{x:40,y:0},{x:40,y:30},{x:0,y:30}];for(const points of [ps,ps.toReversed()]){const s=polygonMeasurement(points);assert.ok(s.valid);close(s.area,1200);close(s.perimeter,140);}
 const s=polygonMeasurement([{x:0,y:0},{x:40,y:0},{x:40,y:10},{x:10,y:10},{x:10,y:30},{x:0,y:30}]);assert.ok(s.valid);close(s.area,600);close(s.perimeter,140);
});
test('crossing, touching, collinear and too-short area outlines cannot report a valid area',()=>{
 for(const pts of [[],[{x:0,y:0},{x:1,y:1}],[{x:0,y:0},{x:1,y:1},{x:2,y:2}],[{x:0,y:0},{x:10,y:10},{x:0,y:10},{x:10,y:0}],[{x:0,y:0},{x:10,y:0},{x:10,y:10},{x:5,y:0},{x:0,y:10}]])assert.equal(polygonMeasurement(pts).valid,false);
 const s=state();s.measure=[{x:0,y:0},{x:10,y:10},{x:0,y:10},{x:10,y:0}];assert.throws(()=>finishMeasurement(s),/cross/);assert.equal(s.measureClosed,false);
});
test('area point workflow ignores duplicate clicks, closes on exact first point and retains a finished result',()=>{
 const s=state();for(const p of [{x:0,y:0},{x:10,y:0},{x:10,y:0},{x:10,y:10},{x:0,y:10},{x:0,y:0}])addMeasurementPoint(s,p);
 assert.equal(s.measure.length,4);assert.ok(s.measureClosed);addMeasurementPoint(s,{x:30,y:30});assert.equal(s.measure.length,4);assert.throws(()=>addMeasurementPoint(state(),{x:NaN,y:0}),/finite/);
});
test('distance starts a fresh pair after completion; area summaries convert square units correctly',()=>{
 const s=state('distance');for(const p of [{x:0,y:0},{x:3,y:4}])addMeasurementPoint(s,p);assert.match(measurementSummary(s),/Distance 5 mm/);
 addMeasurementPoint(s,{x:20,y:30});assert.equal(s.measure.length,1);assert.match(measurementSummary(s),/Point 1 set/);
 const a=state();a.measure=[{x:0,y:0},{x:25.4,y:0},{x:25.4,y:25.4},{x:0,y:25.4}];finishMeasurement(a);assert.match(measurementSummary(a,'in'),/Area 1 in² · Perimeter 4 in/);
});
test('first point and live segment render immediately, rear coordinates mirror without changing measurements',()=>{
 const {b}=fixture(),s=state('distance');addMeasurementPoint(s,{x:20,y:30});let svg=measurementOverlay(s,b,'front',1);assert.match(svg,/data-measure-point="1"/);assert.match(svg,/cx="20" cy="30"/);
 s.measureHover={x:23,y:34,label:'Grid',snapped:true};svg=measurementOverlay(s,b,'rear',1);assert.match(svg,/cx="180" cy="30"/);assert.match(svg,/measurement-preview/);assert.match(svg,/>5 mm</);assert.match(svg,/>Grid</);
});
test('feature cache can be invalidated after part drag so old edges cannot be snapped',()=>{
 const {b,c}=fixture();measurementFeatures(b);c.x+=40;invalidateMeasurementFeatures(b);
 const p=snapMeasurement(b,{x:c.x+.1,y:c.y},{mode:'geometry',tolerance:.5});close(p.x,c.x);
});
