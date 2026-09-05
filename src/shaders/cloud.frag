uniform float uTime;
uniform float uDim;
varying vec3 vPosition;
varying vec3 vNormal;
varying vec3 vWorld;
#include <noise>
void main(){
  float clouds=smoothstep(.55,.76,fbm(normalize(vPosition)*9.));
  float light=.35+max(dot(normalize(vNormal),normalize(vec3(-12.,20.,22.)-vWorld)),0.)*.65;
  gl_FragColor=vec4(vec3(.75,.84,.89)*light,clouds*.48*uDim);
}
