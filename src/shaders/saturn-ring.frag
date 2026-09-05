uniform vec3 uColor;uniform float uHover;uniform float uDim;varying vec2 vUv;
void main(){float lines=.65+.35*sin(vUv.x*250.);gl_FragColor=vec4(uColor*(.7+uHover*.7),(.28+lines*.36)*uDim);}
