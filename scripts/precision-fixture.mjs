// Actual application canvas geometry, rasterized separately; not browser UI QA.
import fs from 'node:fs';
import {newProject,addComponent,VERSION} from '../dist/js/model.js';
import {builtinParts} from '../dist/js/component-library.js';
import {renderCanvas} from '../dist/js/canvas.js';
import {precisionPosition} from '../dist/js/precision.js';
import {svgExport,pdfExport} from '../dist/js/exports.js';
import {setup} from '../tests/setup.mjs';
setup();
const p=newProject('Precision placement'),b=p.panels[0];b.w=180;b.h=110;b.shape='rect';b.color='#c9b78e';
const a=addComponent(p,b,builtinParts.find(d=>d.id==='pot'),40,55),c=addComponent(p,b,builtinParts.find(d=>d.id==='gen-usb-c-panel-coupler'),95,55);
a.label='GAIN';c.label='USB';c.rotation=25;
Object.assign(a,precisionPosition(b,a,{kind:'border',edge:'left',distance:20}));
Object.assign(c,precisionPosition(b,c,{kind:'relative',referenceId:a.id,direction:'right',distance:15,align:true}));
fs.writeFileSync('examples/precision-placement.json',JSON.stringify(p,null,2));
fs.writeFileSync('qa/v150-precision-fabrication.svg',svgExport(p,b));
fs.writeFileSync('qa/v150-precision-fabrication.pdf',await pdfExport(p,b,{pdfMode:'sheet'}));
const svg={clientWidth:1100,setAttribute(k,v){this[k]=v;},innerHTML:''};globalThis.document={getElementById:id=>id==='canvas'?svg:{}};
for(const side of ['front','rear']){
 renderCanvas({p,panel:b,stage:'arrange',tool:'select',selection:[c.id],precision:{basis:'front',referenceId:a.id,direction:'right',show:true},prefs:{grid:5,units:'mm'},view:{x:-20,y:-20,w:220,h:150},side});
 const colors={'--grid':'#64765735','--muted':'#9fad95','--accent':'#c6e79a','--bg':'#15261f','--danger':'#f0a293','--surface':'#21342b','--surface2':'#2c4135','--text':'#e4eada'};
 const body=svg.innerHTML.replace(/var\((--[\w-]+)\)/g,(_,key)=>colors[key]);
 fs.writeFileSync(`qa/v150-${side}-precision.svg`,`<svg xmlns="http://www.w3.org/2000/svg" width="1100" height="750" viewBox="${svg.viewBox}"><style>text{font-family:DejaVu Sans,sans-serif}.selection{stroke:#c6e79a;fill:none}.precision-line{stroke:#c6e79a;fill:none}.precision-dimension rect{fill:#21342b;stroke:#c6e79a}.precision-dimension text{fill:#e4eada}</style><rect x="-1000" y="-1000" width="5000" height="5000" fill="#15261f"/>${body}</svg>`);
}
console.log(`Generated ${VERSION} precision placement fixtures.`);
