// Actual SVG canvas output; not a browser UI screenshot.
import fs from 'node:fs';
import {newProject,addComponent,VERSION} from '../dist/js/model.js';
import {builtinParts} from '../dist/js/component-library.js';
import {renderCanvas} from '../dist/js/canvas.js';
import {addMeasurementPoint,finishMeasurement} from '../dist/js/measurement.js';
import {setup} from '../tests/setup.mjs';
setup();
const p=newProject('Distance and area measurement'),b=p.panels[0];b.w=180;b.h=110;b.shape='rect';b.color='#c9b78e';
for(const [id,x,y,label] of [['pot',45,55,'GAIN'],['gen-usb-c-panel-coupler',125,55,'USB']]){const c=addComponent(p,b,builtinParts.find(d=>d.id===id),x,y);c.label=label;}
const svg={clientWidth:1100,setAttribute(k,v){this[k]=v;},innerHTML:''};globalThis.document={getElementById:id=>id==='canvas'?svg:{}};
const app={p,panel:b,stage:'arrange',tool:'measure',selection:[],prefs:{grid:5,units:'mm'},view:{x:-20,y:-20,w:220,h:150},side:'front',measure:[],measureMode:'distance',measureClosed:false,measureHover:null};
const colors={'--grid':'#64765735','--muted':'#9fad95','--accent':'#c6e79a','--accentText':'#17251d','--bg':'#15261f','--danger':'#f0a293','--surface':'#21342b','--surface2':'#2c4135','--text':'#e4eada'};
const measurementCSS=fs.readFileSync('src/style.css','utf8').split('.measurement-overlay')[1].split('@media')[0];
function save(name){
 renderCanvas(app);
 const style=`text{font-family:DejaVu Sans,sans-serif}.measurement-overlay${measurementCSS}`;
 const body=(style+svg.innerHTML).replace(/var\((--[\w-]+)\)/g,(_,key)=>colors[key]);
 const split=body.indexOf('<');
 fs.writeFileSync(`qa/v160-${name}.svg`,`<svg xmlns="http://www.w3.org/2000/svg" width="1100" height="750" viewBox="${svg.viewBox}"><style>${body.slice(0,split)}</style><rect x="-1000" y="-1000" width="5000" height="5000" fill="#15261f"/>${body.slice(split)}</svg>`);
}
addMeasurementPoint(app,{x:45,y:55,label:'P1 · mounting reference',snapped:true});save('first-point');
app.measureHover={x:125,y:55,label:'J1 · mounting reference',snapped:true};save('distance-preview');
app.measureMode='area';app.measure=[];app.measureHover=null;
for(const [x,y] of [[20,20],[155,20],[155,90],[20,90]])addMeasurementPoint(app,{x,y,label:'Grid',snapped:true});
finishMeasurement(app);save('area');
app.side='rear';save('rear-area');
fs.writeFileSync('qa/v160-measurement-summary.json',JSON.stringify({version:VERSION,area:9450,perimeter:410,units:'mm',frontRearValuesEqual:true,liveBrowserTested:false},null,2));
console.log(`Generated ${VERSION} measurement canvas fixtures.`);
