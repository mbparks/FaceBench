import tempfile, os
import struct, numpy as np
from collections import Counter
for n in ['cad','text']:
 b=open(os.path.join(tempfile.gettempdir(),'fb2-'+n+'.stl'),'rb').read();cnt=struct.unpack_from('<I',b,80)[0];dt=np.dtype([('normal','<f4',(3,)),('vertices','<f4',(3,3)),('attr','<u2')]);t=np.frombuffer(b,dt,offset=84)['vertices'].astype(float);v,idx=np.unique(t.reshape(-1,3),axis=0,return_inverse=True);idx=idx.reshape(-1,3);edges=np.sort(np.concatenate([idx[:,[0,1]],idx[:,[1,2]],idx[:,[2,0]]]),axis=1);u,c=np.unique(edges,axis=0,return_counts=True);vol=np.einsum('ij,ij->i',t[:,0],np.cross(t[:,1],t[:,2])).sum()/6
 print(n,'triangles',cnt,'non-two-use edges',int((c!=2).sum()),'volume',round(vol,3),'bounds',v.min(0),v.max(0))

 assert (c==2).all(), "Open mesh"
 assert vol>0, "Winding error"
