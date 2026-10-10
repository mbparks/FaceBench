import {transform, worldCommands} from './geometry.js';

export const measurementBases = [['front','Front face'],['openings','Mounting holes / cutouts'],['rear','Rear body'],['center','Mounting reference']];
export const directions = [['right','Right of'],['left','Left of'],['below','Below'],['above','Above']];
const sides = ['left','right','top','bottom'];
const box = points => {
  if (!points.length) throw Error('This measurement has no geometry.');
  const x=Math.min(...points.map(p=>p.x)),y=Math.min(...points.map(p=>p.y));
  return {x,y,w:Math.max(...points.map(p=>p.x))-x,h:Math.max(...points.map(p=>p.y))-y};
};
const corners = b => [{x:b.x,y:b.y},{x:b.x+b.w,y:b.y+b.h}];

// Exact extrema, including Bezier control points that are not themselves on the curve.
function pathBounds(cs) {
  let previous={x:0,y:0},start=previous;const points=[];
  for(const c of cs){
    if(c.type==='Z'){previous=start;continue;}
    const end={x:c.x,y:c.y};points.push(end);
    if(c.type==='M')start=end;
    if(c.type==='Q'||c.type==='C'){
      const roots=[];
      for(const k of ['x','y']){
        const a=previous[k],b=c[k+'1'],d=end[k];
        if(c.type==='Q'){
          const denominator=a-2*b+d;if(Math.abs(denominator)>1e-12)roots.push((a-b)/denominator);
        }else{
          const cc=c[k+'2'],A=-a+3*b-3*cc+d,B=2*(a-2*b+cc),C=b-a;
          if(Math.abs(A)<1e-12){if(Math.abs(B)>1e-12)roots.push(-C/B);}
          else {const discriminant=B*B-4*A*C;if(discriminant>=0){roots.push((-B+Math.sqrt(discriminant))/(2*A),(-B-Math.sqrt(discriminant))/(2*A));}}
        }
      }
      for(const t of roots.filter(t=>t>0&&t<1)){
        const u=1-t,p={};for(const k of ['x','y'])p[k]=c.type==='Q'?u*u*previous[k]+2*u*t*c[k+'1']+t*t*end[k]:u*u*u*previous[k]+3*u*u*t*c[k+'1']+3*u*t*t*c[k+'2']+t*t*t*end[k];points.push(p);
      }
    }
    previous=end;
  }
  return box(points);
}
export function shapeBounds(shape, component) {
  const centre=transform(shape.x||0,shape.y||0,component),angle=(component.rotation||0)*Math.PI/180;
  if(shape.type==='circle')return {x:centre.x-shape.d/2,y:centre.y-shape.d/2,w:shape.d,h:shape.d};
  if(shape.type==='rect'){
    const r=Math.min(shape.r||0,shape.w/2,shape.h/2),c=Math.abs(Math.cos(angle)),s=Math.abs(Math.sin(angle));
    const w=2*(c*(shape.w/2-r)+s*(shape.h/2-r)+r),h=2*(s*(shape.w/2-r)+c*(shape.h/2-r)+r);
    return {x:centre.x-w/2,y:centre.y-h/2,w,h};
  }
  return pathBounds(worldCommands(shape,component));
}
export function componentBounds(component,basis='front') {
  if(!component?.definition)throw Error('Select a component to measure.');
  if(!measurementBases.some(([key])=>key===basis))throw Error('Choose a measurement boundary.');
  if(basis==='center')return {x:component.x,y:component.y,w:0,h:0};
  const shapes=basis==='openings'?component.definition.openings:[component.definition[basis]];
  return box(shapes.flatMap(s=>corners(shapeBounds(s,component))));
}
export function panelBounds(panel) {
  return panel.shape==='imported'?box(panel.outline):{x:0,y:0,w:panel.w,h:panel.h};
}
export function borderDistances(panel,component,basis='front') {
  const a=componentBounds(component,basis),p=panelBounds(panel);
  return {left:a.x-p.x,right:p.x+p.w-a.x-a.w,top:a.y-p.y,bottom:p.y+p.h-a.y-a.h};
}
export function relativeGap(component,reference,direction,basis='front') {
  const a=componentBounds(component,basis),b=componentBounds(reference,basis);
  if(direction==='right')return a.x-b.x-b.w;
  if(direction==='left')return b.x-a.x-a.w;
  if(direction==='below')return a.y-b.y-b.h;
  if(direction==='above')return b.y-a.y-a.h;
  throw Error('Choose a placement direction.');
}
export function precisionPosition(panel,component,request) {
  if(!panel.components.includes(component))throw Error('The selected component is no longer on this panel.');
  if(component.locked||panel.layers.cut.locked)throw Error('Unlock this component and its cut layer before positioning.');
  const {kind,basis='front',distance}=request;
  if(!Number.isFinite(distance)||distance<0||distance>10000)throw Error('Enter a distance from 0 to 10000 mm.');
  let x=component.x,y=component.y;
  if(kind==='border'){
    if(!sides.includes(request.edge))throw Error('Choose a panel border.');
    const delta=distance-borderDistances(panel,component,basis)[request.edge];
    if(request.edge==='left')x+=delta;if(request.edge==='right')x-=delta;
    if(request.edge==='top')y+=delta;if(request.edge==='bottom')y-=delta;
  }else{
    const reference=panel.components.find(c=>c.id===request.referenceId);
    if(!reference||reference===component)throw Error('Choose a different reference component.');
    if(kind==='distance'){
      const dx=x-reference.x,dy=y-reference.y,length=Math.hypot(dx,dy);
      x=reference.x+(length?dx/length:1)*distance;y=reference.y+(length?dy/length:0)*distance;
    }else if(kind==='relative'){
      const delta=distance-relativeGap(component,reference,request.direction,basis);
      if(request.direction==='right')x+=delta;if(request.direction==='left')x-=delta;
      if(request.direction==='below')y+=delta;if(request.direction==='above')y-=delta;
      if(request.align){if(['left','right'].includes(request.direction))y=reference.y;else x=reference.x;}
    }else throw Error('Unknown placement operation.');
  }
  return {x,y};
}

// All geometry remains in front coordinates. Only the canvas mirrors the result.
export function precisionDimensions(panel,component,{basis='front',referenceId='',direction='right'}={}) {
  const a=componentBounds(component,basis),p=panelBounds(panel),cx=a.x+a.w/2,cy=a.y+a.h/2;
  const values=borderDistances(panel,component,basis);
  const dims=[
    {edge:'left',a:{x:p.x,y:cy},b:{x:a.x,y:cy}},
    {edge:'right',a:{x:a.x+a.w,y:cy},b:{x:p.x+p.w,y:cy}},
    {edge:'top',a:{x:cx,y:p.y},b:{x:cx,y:a.y}},
    {edge:'bottom',a:{x:cx,y:a.y+a.h},b:{x:cx,y:p.y+p.h}}
  ].map(d=>({...d,kind:'border',componentId:component.id,basis,value:values[d.edge],label:d.edge[0].toUpperCase()+d.edge.slice(1)}));
  const reference=panel.components.find(c=>c.id===referenceId&&c!==component);
  if(reference){
    const r=componentBounds(reference,basis),horizontal=['right','left'].includes(direction);
    const low=direction==='right'||direction==='below'?r:a,high=low===r?a:r;
    const line=horizontal?Math.min(a.y,r.y):Math.min(a.x,r.x);
    dims.push({kind:'relative',componentId:component.id,referenceId,basis,direction,label:'Gap',value:relativeGap(component,reference,direction,basis),a:horizontal?{x:low.x+low.w,y:line}:{x:line,y:low.y+low.h},b:horizontal?{x:high.x,y:line}:{x:line,y:high.y},offset:true});
  }
  return dims;
}
