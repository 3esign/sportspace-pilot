/* Lightweight WebGL spatial view. Heights: OSM height, or 3 m per mapped level.
   Unknown heights remain flat. No network or dependencies. */
(() => {
  'use strict';
  const vertex = `attribute vec3 a_position;attribute vec3 a_color;attribute vec2 a_uv;
    uniform vec2 u_center;uniform vec2 u_size;uniform float u_scale;uniform float u_pitch;uniform float u_bearing;uniform float u_distance;
    varying vec3 v_color;varying vec2 v_uv;varying float v_fog;
    void main(){vec2 delta=a_position.xz-u_center;float cb=cos(u_bearing),sb=sin(u_bearing),cp=cos(u_pitch),sp=sin(u_pitch);
    float x=delta.x*cb-delta.y*sb;float y=delta.x*sb+delta.y*cb;
    float py=y*cp-a_position.y*sp;float depth=y*sp+a_position.y*cp;
    float w=(u_distance-depth)/u_distance;float n=5.0,f=35000.0;
    float z=(f+n)/(f-n)*w-(2.0*f*n/(f-n))/u_distance;
    gl_Position=vec4(x*u_scale*2.0/u_size.x,-py*u_scale*2.0/u_size.y,z,w);
    v_color=a_color;v_uv=a_uv;v_fog=clamp((-depth/u_distance-.3)*.2,0.0,.24);}`;
  const fragment = `precision mediump float;varying vec3 v_color;varying vec2 v_uv;varying float v_fog;uniform sampler2D u_texture;uniform float u_textured;
    void main(){vec3 color=u_textured>.5?texture2D(u_texture,v_uv).rgb:v_color;gl_FragColor=vec4(mix(color,vec3(.898,.925,.906),v_fog),1.0);}`;
  const area=(a,b,c)=>(b[0]-a[0])*(c[1]-a[1])-(b[1]-a[1])*(c[0]-a[0]);
  function triangulate(input){
    const p=input.filter((v,i)=>!i||Math.hypot(v[0]-input[i-1][0],v[1]-input[i-1][1])>.005);
    if(p.length>2&&Math.hypot(p[0][0]-p.at(-1)[0],p[0][1]-p.at(-1)[1])<.01)p.pop();
    if(p.length<3)return {p,t:[]};
    let signed=0;for(let i=0;i<p.length;i++)signed+=p[i][0]*p[(i+1)%p.length][1]-p[(i+1)%p.length][0]*p[i][1];
    const idx=p.map((_,i)=>i);if(signed<0)idx.reverse();const triangles=[];let safety=p.length*p.length;
    while(idx.length>3&&safety-->0){let cut=false;for(let i=0;i<idx.length;i++){
      const a=idx[(i+idx.length-1)%idx.length],b=idx[i],c=idx[(i+1)%idx.length];
      const cross=area(p[a],p[b],p[c]);if(Math.abs(cross)<.000001){idx.splice(i,1);cut=true;break;}if(cross<0)continue;
      let inside=false;for(const d of idx){if(d===a||d===b||d===c)continue;if(area(p[a],p[b],p[d])>.000001&&area(p[b],p[c],p[d])>.000001&&area(p[c],p[a],p[d])>.000001){inside=true;break;}}
      if(!inside){triangles.push(a,b,c);idx.splice(i,1);cut=true;break;}
    }if(!cut)break;}
    if(idx.length===3)triangles.push(...idx);return {p,t:idx.length>3?[]:triangles};
  }
  class SportSpace3D {
    constructor(canvas,data,toWorld){
      this.canvas=canvas;this.available=false;this.error=null;this.buildings=true;
      try{
        const gl=canvas.getContext('webgl',{alpha:false,antialias:true,preserveDrawingBuffer:true,powerPreference:'low-power'});if(!gl)throw new Error('WebGL nije dostupan.');this.gl=gl;
        const compile=(type,source)=>{const s=gl.createShader(type);gl.shaderSource(s,source);gl.compileShader(s);if(!gl.getShaderParameter(s,gl.COMPILE_STATUS))throw new Error(gl.getShaderInfoLog(s));return s;};
        this.program=gl.createProgram();const vs=compile(gl.VERTEX_SHADER,vertex),fs=compile(gl.FRAGMENT_SHADER,fragment);gl.attachShader(this.program,vs);gl.attachShader(this.program,fs);gl.linkProgram(this.program);gl.deleteShader(vs);gl.deleteShader(fs);if(!gl.getProgramParameter(this.program,gl.LINK_STATUS))throw new Error(gl.getProgramInfoLog(this.program));gl.useProgram(this.program);
        this.uniforms={};for(const key of ['center','size','scale','pitch','bearing','distance','textured','texture'])this.uniforms[key]=gl.getUniformLocation(this.program,'u_'+key);
        this.attrs={position:gl.getAttribLocation(this.program,'a_position'),color:gl.getAttribLocation(this.program,'a_color'),uv:gl.getAttribLocation(this.program,'a_uv')};
        const vertices=[],lines=[];let extruded=0,unknown=0,roofFailures=0;
        const push=(target,x,h,z,color)=>target.push(x,h,z,...color,0,0);
        for(const f of data.surfaces){if(f.k!=='building')continue;if(!f.h){unknown++;continue;}const polygon=triangulate(f.p.map(toWorld));const {p,t}=polygon;if(p.length<3)continue;if(!t.length){roofFailures++;continue;}extruded++;
          for(const index of t)push(vertices,p[index][0],f.h+.25,p[index][1],[.92,.945,.91]);
          for(let i=0;i<p.length;i++){const a=p[i],b=p[(i+1)%p.length],dx=b[0]-a[0],dz=b[1]-a[1],length=Math.hypot(dx,dz)||1;const light=.82+.12*(dx*.45-dz*.85)/length;const color=[light*.84,light*.94,light*.89];for(const [q,h] of [[a,.2],[b,.2],[b,f.h],[a,.2],[b,f.h],[a,f.h]])push(vertices,q[0],h,q[1],color);push(lines,a[0],f.h+.3,a[1],[.60,.71,.65]);push(lines,b[0],f.h+.3,b[1],[.60,.71,.65]);if(f.h>12){push(lines,a[0],.2,a[1],[.62,.72,.67]);push(lines,a[0],f.h,a[1],[.62,.72,.67]);}}
        }
        this.mesh=this.buffer(vertices);this.lines=this.buffer(lines);this.stats={extruded,unknown_flat:unknown,roof_failures:roofFailures,triangles:vertices.length/24};this.available=true;
        canvas.addEventListener('webglcontextlost',event=>{event.preventDefault();this.available=false;canvas.dispatchEvent(new CustomEvent('spatial-unavailable',{bubbles:true}));});
      }catch(error){this.error=error.message;}
    }
    buffer(vertices){const gl=this.gl,b=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,b);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(vertices),gl.STATIC_DRAW);return {buffer:b,count:vertices.length/8};}
    setTrees(points,toWorld){if(!this.available||this.trees)return;const vertices=[];const push=(x,y,z,c)=>vertices.push(x,y,z,...c,0,0);for(const point of points){const [x,z]=toWorld(point);for(let k=0;k<6;k++){const a=k*Math.PI/3,b=(k+1)*Math.PI/3,ax=x+Math.cos(a)*5,az=z+Math.sin(a)*5,bx=x+Math.cos(b)*5,bz=z+Math.sin(b)*5,c=[.22+k*.008,.43+k*.01,.27+k*.006];push(x,14,z,c);push(ax,4,az,c);push(bx,4,bz,c);push(x,3,z,[.32,.34,.24]);push(x+Math.cos(a),0,z+Math.sin(a),[.32,.34,.24]);push(x+Math.cos(b),0,z+Math.sin(b),[.32,.34,.24]);}}this.trees=this.buffer(vertices);this.stats.tree_symbols=points.length;}
    setGround(image,bounds){if(!this.available)return;const gl=this.gl;if(this.texture)gl.deleteTexture(this.texture);if(this.ground)gl.deleteBuffer(this.ground.buffer);this.texture=gl.createTexture();gl.bindTexture(gl.TEXTURE_2D,this.texture);gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL,true);gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,gl.RGBA,gl.UNSIGNED_BYTE,image);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.LINEAR);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE);
      const [x1,y1,x2,y2]=bounds;const v=[];for(const [x,y,u,w] of [[x1,y1,0,1],[x2,y1,1,1],[x2,y2,1,0],[x1,y1,0,1],[x2,y2,1,0],[x1,y2,0,0]])v.push(x,0,y,1,1,1,u,w);this.ground=this.buffer(v);
    }
    bind(mesh){const gl=this.gl;gl.bindBuffer(gl.ARRAY_BUFFER,mesh.buffer);for(const [name,size,offset] of [['position',3,0],['color',3,12],['uv',2,24]]){gl.enableVertexAttribArray(this.attrs[name]);gl.vertexAttribPointer(this.attrs[name],size,gl.FLOAT,false,32,offset);}}
    render(camera,width,height,dpr,pitch,bearing,buildings,trees=false){if(!this.available||!this.ground)return;const gl=this.gl;const w=Math.round(width*dpr),h=Math.round(height*dpr);if(this.canvas.width!==w||this.canvas.height!==h){this.canvas.width=w;this.canvas.height=h;}gl.viewport(0,0,w,h);gl.clearColor(.898,.925,.906,1);gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);gl.enable(gl.DEPTH_TEST);gl.depthFunc(gl.LEQUAL);gl.useProgram(this.program);const u=this.uniforms;gl.uniform2f(u.center,camera.x,camera.y);gl.uniform2f(u.size,width,height);gl.uniform1f(u.scale,camera.scale);gl.uniform1f(u.pitch,pitch);gl.uniform1f(u.bearing,bearing);gl.uniform1f(u.distance,height/(.9*camera.scale));gl.uniform1f(u.textured,1);gl.activeTexture(gl.TEXTURE0);gl.bindTexture(gl.TEXTURE_2D,this.texture);gl.uniform1i(u.texture,0);this.bind(this.ground);gl.drawArrays(gl.TRIANGLES,0,this.ground.count);if(buildings){gl.uniform1f(u.textured,0);this.bind(this.mesh);gl.drawArrays(gl.TRIANGLES,0,this.mesh.count);this.bind(this.lines);gl.drawArrays(gl.LINES,0,this.lines.count);}if(trees&&this.trees){gl.uniform1f(u.textured,0);this.bind(this.trees);gl.drawArrays(gl.TRIANGLES,0,this.trees.count);}}
    project(p,camera,width,height,pitch,bearing,h=0){const dx=p[0]-camera.x,dy=p[1]-camera.y,cb=Math.cos(bearing),sb=Math.sin(bearing),x=dx*cb-dy*sb,y=dx*sb+dy*cb,D=height/(.9*camera.scale),depth=y*Math.sin(pitch)+h*Math.cos(pitch),factor=D/(D-depth);return [width/2+x*camera.scale*factor,height/2+(y*Math.cos(pitch)-h*Math.sin(pitch))*camera.scale*factor];}
    unproject(p,camera,width,height,pitch,bearing){const sx=(p[0]-width/2)/camera.scale,sy=(p[1]-height/2)/camera.scale,D=height/(.9*camera.scale);const y=sy/(Math.cos(pitch)+sy*Math.sin(pitch)/D),x=sx*(1-y*Math.sin(pitch)/D),cb=Math.cos(bearing),sb=Math.sin(bearing);return [camera.x+x*cb+y*sb,camera.y-x*sb+y*cb];}
    dispose(){if(!this.gl)return;for(const object of [this.mesh,this.lines,this.ground,this.trees])if(object)this.gl.deleteBuffer(object.buffer);if(this.texture)this.gl.deleteTexture(this.texture);if(this.program)this.gl.deleteProgram(this.program);}
  }
  window.SportSpace3D=SportSpace3D;
})();
