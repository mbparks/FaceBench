import assert from 'node:assert/strict';
import {build} from '../engine.js';
const C=globalThis.FaceCore,p=C.defaults();p.mounting='cad';p.thickness=2.3;
const original=await build(p);p.thickness=4.8;const thicker=await build(p);
assert.equal(thicker.mesh.status,'NoError');assert.equal(thicker.mesh.components,1);
assert.deepEqual(thicker.mesh.bounds.min,original.mesh.bounds.min,'The CAD backing stays fixed');
assert.equal(thicker.mesh.bounds.max[2],4.8);
assert(Math.abs(thicker.mesh.volume-original.mesh.volume-p.width*p.height*2.5)<.02,'Only front-plate thickness changes');
p.objects=[{id:'raised',name:'Raised rectangle',type:'rect',x:-20,y:0,w:12,h:12,rotation:0,op:'raise',depth:1.2,color:'#cfed75',corner:0,bridges:0},{id:'engraved',name:'Engraved rectangle',type:'rect',x:20,y:0,w:12,h:12,rotation:0,op:'engrave',depth:.8,color:'#cfed75',corner:0,bridges:0}];
const result=await build(C.migrate(JSON.parse(JSON.stringify(p))));assert.equal(result.mesh.bounds.max[2],6);
const stl=new DataView(C.stl(result.mesh)),count=stl.getUint32(80,true);let minZ=Infinity,maxZ=-Infinity,recess=false;
for(let i=0;i<count;i++)for(let vertex=0;vertex<3;vertex++){let z=stl.getFloat32(84+i*50+12+vertex*12+8,true);minZ=Math.min(minZ,z);maxZ=Math.max(maxZ,z);if(Math.abs(z-4)<1e-5)recess=true}
assert(Math.abs(minZ-original.mesh.bounds.min[2])<1e-5);assert.equal(maxZ,6);assert(recess,'Engraving stays 0.8 mm below the updated front');
assert.equal(p.objects[0].depth,1.2);assert.equal(p.objects[1].depth,.8);
console.log('PASS outer face thickness: CAD backing unchanged, expected added volume, decoration heights/depths retained, JSON and binary STL dimensions.');
