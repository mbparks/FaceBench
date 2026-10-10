import {transform,panelShape,commands} from './geometry.js';
const distance=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y);
const point=(x,y)=>({x,y});
const project=(p,a,b)=>{const dx=b.x-a.x,dy=b.y-a.y,t=Math.max(0,Math.min(1,((p.x-a.x)*dx+(p.y-a.y)*dy)/(dx*dx+dy*dy||1)));return point(a.x+t*dx,a.y+t*dy);};
const cache=new WeakMap();
export function invalidateMeasurementFeatures(panel){cache.delete(panel);}
function shapeFeatures(shape,placement,label,points,edges) {
  const put=(p,name)=>points.push({...transform(p.x,p.y,placement),label:`${label} · ${name}`});
  const segment=(a,b)=>edges.push({type:'line',a:transform(a.x,a.y,placement),b:transform(b.x,b.y,placement),label:`${label} · edge`});
  const arc=(centre,r,start,end)=>edges.push({type:'arc',centre,r,start,end,placement,label:`${label} · curved edge`});
  const x=shape.x||0,y=shape.y||0;
  if(shape.type==='circle'){
    put(point(x,y),'centre');for(let i=0;i<4;i++)put(point(x+shape.d/2*Math.cos(i*Math.PI/2),y+shape.d/2*Math.sin(i*Math.PI/2)),'quadrant');
    arc(point(x,y),shape.d/2,0,2*Math.PI);return;
  }
  if(shape.type==='rect'){
    const l=x-shape.w/2,r=x+shape.w/2,t=y-shape.h/2,b=y+shape.h/2,radius=Math.min(shape.r||0,shape.w/2,shape.h/2);
    put(point(x,y),'centre');for(const p of [point(x,t),point(r,y),point(x,b),point(l,y)])put(p,'edge midpoint');
    const lines=[[point(l+radius,t),point(r-radius,t)],[point(r,t+radius),point(r,b-radius)],[point(r-radius,b),point(l+radius,b)],[point(l,b-radius),point(l,t+radius)]];
    for(const [a,b] of lines){put(a,radius?'tangent':'corner');put(b,radius?'tangent':'corner');segment(a,b);}
    if(radius)for(const [cx,cy,start] of [[r-radius,b-radius,0],[l+radius,b-radius,Math.PI/2],[l+radius,t+radius,Math.PI],[r-radius,t+radius,3*Math.PI/2]])arc(point(cx,cy),radius,start,start+Math.PI/2);
    return;
  }
  let last=null,start=null;
  for(const c of commands(shape)){
    if(c.type==='Z'){if(last&&start)segment(last,start);last=start;continue;}
    const end=point(c.x,c.y);put(end,'vertex');
    if(c.type==='M')start=end;
    else if(last){
      if(c.type==='L'){segment(last,end);put(point((last.x+end.x)/2,(last.y+end.y)/2),'edge midpoint');}
      else if(c.type==='Q')put(point((last.x+2*c.x1+end.x)/4,(last.y+2*c.y1+end.y)/4),'curve midpoint');
      else if(c.type==='C')put(point((last.x+3*c.x1+3*c.x2+end.x)/8,(last.y+3*c.y1+3*c.y2+end.y)/8),'curve midpoint');
    }
    last=end;
  }
}
export function measurementFeatures(panel,side='front') {
  let entries=cache.get(panel);if(!entries){entries=new Map();cache.set(panel,entries);}if(entries.has(side))return entries.get(side);
  const points=[],edges=[];shapeFeatures(panelShape(panel),{},'Panel',points,edges);
  for(const c of panel.components){
    points.push({x:c.x,y:c.y,label:`${c.ref} · mounting reference`});
    shapeFeatures(c.definition[side==='rear'?'rear':'front'],c,`${c.ref} ${side==='rear'?'rear body':'front face'}`,points,edges);
    if(panel.layers.cut.visible)for(let i=0;i<c.definition.openings.length;i++)shapeFeatures(c.definition.openings[i],c,`${c.ref} cutout ${i+1}`,points,edges);
  }
  const result={points,edges};entries.set(side,result);return result;
}
function nearestEdge(p,edge) {
  if(edge.type==='line')return project(p,edge.a,edge.b);
  const o=edge.placement,a=-(o.rotation||0)*Math.PI/180,dx=p.x-(o.x||0),dy=p.y-(o.y||0),local=point(dx*Math.cos(a)-dy*Math.sin(a),dx*Math.sin(a)+dy*Math.cos(a));
  let angle=Math.atan2(local.y-edge.centre.y,local.x-edge.centre.x);if(angle<0)angle+=2*Math.PI;
  if(angle<edge.start||angle>edge.end){const at=t=>point(edge.centre.x+edge.r*Math.cos(t),edge.centre.y+edge.r*Math.sin(t));angle=distance(local,at(edge.start))<distance(local,at(edge.end))?edge.start:edge.end;}
  return transform(edge.centre.x+edge.r*Math.cos(angle),edge.centre.y+edge.r*Math.sin(angle),o);
}
export function snapMeasurement(panel,raw,{side='front',mode='geometry-grid',grid=5,tolerance=2,anchor=null,shift=false,free=false,first=null,canClose=false}={}) {
  if(![raw.x,raw.y].every(Number.isFinite))throw Error('Measurement coordinates must be finite.');
  const axis=shift&&anchor?(Math.abs(raw.x-anchor.x)>=Math.abs(raw.y-anchor.y)?'x':'y'):null;
  const constrained=axis?{...raw,[axis==='x'?'y':'x']:anchor[axis==='x'?'y':'x']}:{...raw};
  const compatible=p=>!axis||Math.abs(p[axis==='x'?'y':'x']-anchor[axis==='x'?'y':'x'])<1e-8;
  if(!free&&canClose&&first&&distance(constrained,first)<=tolerance&&compatible(first))return {...first,label:'Close area at point 1',snapped:true,close:true};
  const geometry=!free&&mode.startsWith('geometry'),onGrid=!free&&(mode==='grid'||mode==='geometry-grid');
  if(geometry){
    const features=measurementFeatures(panel,side);let best=null,bestDistance=tolerance;
    for(const p of features.points){const d=distance(constrained,p);if(d<=bestDistance&&compatible(p)){best=p;bestDistance=d;}}
    if(best)return {...best,snapped:true};
    for(const e of features.edges){const p=nearestEdge(constrained,e),d=distance(constrained,p);if(d<=bestDistance&&compatible(p)){best={...p,label:e.label};bestDistance=d;}}
    if(best)return {...best,snapped:true};
  }
  if(onGrid&&grid>0){const p={x:Math.round(constrained.x/grid)*grid,y:Math.round(constrained.y/grid)*grid};if(axis)p[axis==='x'?'y':'x']=anchor[axis==='x'?'y':'x'];return {...p,label:axis?'Grid · '+(axis==='x'?'horizontal':'vertical'):'Grid',snapped:true};}
  return {...constrained,label:axis?(axis==='x'?'Horizontal':'Vertical'):'Free point',snapped:!!axis};
}
const cross=(a,b,c)=>(b.x-a.x)*(c.y-a.y)-(b.y-a.y)*(c.x-a.x);
const onSegment=(p,a,b)=>Math.abs(cross(a,b,p))<1e-8&&p.x>=Math.min(a.x,b.x)-1e-8&&p.x<=Math.max(a.x,b.x)+1e-8&&p.y>=Math.min(a.y,b.y)-1e-8&&p.y<=Math.max(a.y,b.y)+1e-8;
const crossing=(a,b,c,d)=>{const ab1=cross(a,b,c),ab2=cross(a,b,d),cd1=cross(c,d,a),cd2=cross(c,d,b);return (ab1*ab2<0&&cd1*cd2<0)||onSegment(a,c,d)||onSegment(b,c,d)||onSegment(c,a,b)||onSegment(d,a,b);};
export function polygonMeasurement(points) {
  const n=points.length;if(n<3)return {valid:false,area:0,perimeter:0,reason:'Add at least three points.'};
  let twiceArea=0,perimeter=0;
  for(let i=0;i<n;i++){
    const a=points[i],b=points[(i+1)%n];perimeter+=distance(a,b);twiceArea+=a.x*b.y-b.x*a.y;
    if(distance(a,b)<1e-8)return {valid:false,area:0,perimeter,reason:'Two adjacent points coincide. Undo the last point.'};
    for(let j=i+1;j<n;j++){
      if(j===i+1||(i===0&&j===n-1))continue;
      if(crossing(a,b,points[j],points[(j+1)%n]))return {valid:false,area:0,perimeter,reason:'Outline crosses or touches itself. Undo a point and follow the perimeter.'};
    }
  }
  const area=Math.abs(twiceArea)/2;
  return {valid:area>1e-8,area,perimeter,reason:area>1e-8?'':'Area is zero. Pick points around a region.'};
}
export function addMeasurementPoint(state,p) {
  if(![p.x,p.y].every(n=>Number.isFinite(n)&&Math.abs(n)<=100000))throw Error('Point coordinates must be finite and within ±100000 mm.');
  if(state.measureClosed&&state.measureMode==='area')return;
  if(state.measureMode==='area'&&state.measure.length>=3&&distance(state.measure[0],p)<1e-8){finishMeasurement(state);return;}
  if(state.measureMode!=='area'&&state.measure.length===2)state.measure=[];
  if(state.measure.at(-1)&&distance(state.measure.at(-1),p)<1e-8)return;
  if(state.measure.length>=500)throw Error('This outline has 500 points. Finish it or undo a point.');
  state.measure.push({...p});state.measureHover=null;state.measureClosed=false;
}
export function finishMeasurement(state) {
  if(state.measureMode!=='area')return;
  const result=polygonMeasurement(state.measure);if(!result.valid)throw Error(result.reason);
  state.measureClosed=true;state.measureHover=null;
  return result;
}
export function measurementSummary(state,units='mm') {
  const factor=units==='in'?25.4:1,format=n=>+(n/factor).toFixed(units==='in'?5:3),pts=state.measure||[],hover=state.measureHover;
  const coords=hover?` · X ${format(hover.x)}, Y ${format(hover.y)} ${units} · ${hover.label}`:'';
  if(!pts.length)return `Click the first point${coords}`;
  if(state.measureMode!=='area'){
    const a=pts[0],b=pts[1]||hover;
    if(!b)return `Point 1 set · X ${format(a.x)}, Y ${format(a.y)} ${units} · Choose the end point`;
    return `${pts.length===2?'Distance':'Live distance'} ${format(distance(a,b))} ${units} · ΔX ${format(b.x-a.x)} · ΔY ${format(b.y-a.y)} ${units}${pts.length===2?' · Click to start another':coords}`;
  }
  const preview=!state.measureClosed&&hover&&(!pts.at(-1)||distance(hover,pts.at(-1))>1e-8)&&(!hover.close)?[...pts,hover]:pts,result=polygonMeasurement(preview);
  const base=result.valid?`${state.measureClosed?'Area':'Preview area'} ${+(result.area/(factor*factor)).toFixed(units==='in'?5:3)} ${units}² · Perimeter ${format(result.perimeter)} ${units}`:`${pts.length} point${pts.length===1?'':'s'} · ${preview.length>=3?result.reason:'Continue around the area'}`;
  return base+(state.measureClosed?' · New starts another outline':coords);
}

export function measurementOverlay(state,panel,side,scale,units='mm') {
  const pts=state.measure||[],hover=state.measureHover,area=state.measureMode==='area',closed=state.measureClosed;
  const display=p=>side==='rear'?{x:panel.w-p.x,y:p.y}:p;
  const factor=units==='in'?25.4:1,format=n=>+(n/factor).toFixed(units==='in'?5:3),width=1.7*scale;
  const path=ps=>ps.map((p,i)=>{const d=display(p);return `${i?'L':'M'} ${d.x} ${d.y}`;}).join(' ');
  const parts=[];
  const caption=(p,text)=>{const d=display(p),w=(text.length*6.4+16)*scale,h=24*scale;return `<g class="measurement-caption"><rect x="${d.x-w/2}" y="${d.y-h/2}" width="${w}" height="${h}" rx="${4*scale}" stroke-width="${scale}"/><text x="${d.x}" y="${d.y}" dy=".35em" text-anchor="middle" font-size="${11*scale}">${text.replace(/[<>&"]/g,c=>({'<':'&lt;','>':'&gt;','&':'&amp;','"':'&quot;'}[c]))}</text></g>`;};
  const live=hover&&!closed&&(area||pts.length<2),preview=live&&!hover.close?[...pts,hover]:pts;
  if(area&&preview.length>=3){
    parts.push(`<path class="measurement-area" d="${path(preview)} Z" stroke-width="${width}" ${closed?'':`stroke-dasharray="${5*scale} ${4*scale}"`}/>`);
    const stats=polygonMeasurement(preview);
    if(stats.valid){const centre={x:preview.reduce((s,p)=>s+p.x,0)/preview.length,y:preview.reduce((s,p)=>s+p.y,0)/preview.length};parts.push(caption(centre,`${closed?'Area':'Preview'} ${+(stats.area/(factor*factor)).toFixed(units==='in'?5:3)} ${units}²`));}
  }
  if(pts.length>=2)parts.push(`<path class="measurement-path" d="${path(pts)}${area&&closed?' Z':''}" stroke-width="${width}"/>`);
  if(live&&pts.length){parts.push(`<path class="measurement-preview" d="${path([pts.at(-1),hover])}" stroke-width="${width}" stroke-dasharray="${5*scale} ${4*scale}"/>`);}
  const lineEnd=area?(live?hover:null):(pts[1]||hover),lineStart=area?pts.at(-1):pts[0];
  if(lineStart&&lineEnd&&distance(lineStart,lineEnd)>1e-8){const centre={x:(lineStart.x+lineEnd.x)/2,y:(lineStart.y+lineEnd.y)/2-16*scale};parts.push(caption(centre,`${format(distance(lineStart,lineEnd))} ${units}`));}
  for(let i=0;i<pts.length;i++){
    const d=display(pts[i]);parts.push(`<circle class="measurement-point" data-measure-point="${i+1}" cx="${d.x}" cy="${d.y}" r="${9*scale}" stroke-width="${2*scale}"/><text class="measurement-number" x="${d.x}" y="${d.y}" dy=".35em" text-anchor="middle" font-size="${10*scale}">${i+1}</text>`);
  }
  if(hover&&!closed){
    const d=display(hover),r=6*scale;
    parts.push(`<path class="measurement-target" d="M ${d.x} ${d.y-r} L ${d.x+r} ${d.y} L ${d.x} ${d.y+r} L ${d.x-r} ${d.y} Z M ${d.x-r*2} ${d.y} H ${d.x+r*2} M ${d.x} ${d.y-r*2} V ${d.y+r*2}" stroke-width="${width}"/>`);
    // Snap target is named next to the cursor as well as in the control strip.
    parts.push(caption({x:hover.x,y:hover.y+26*scale},hover.label||'Free point'));
  }
  return `<g class="measurement-overlay">${parts.join('')}</g>`;
}
