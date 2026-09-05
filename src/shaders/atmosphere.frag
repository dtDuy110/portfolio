uniform vec3 uColor;uniform float uDim;uniform float uTime;varying vec3 vNormal;varying vec3 vWorld;
void main(){float rim=pow(1.-abs(dot(normalize(cameraPosition-vWorld),normalize(vNormal))),3.);gl_FragColor=vec4(uColor,rim*.30*uDim);}
