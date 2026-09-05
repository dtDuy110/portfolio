varying vec3 vPosition;
varying vec3 vNormal;
varying vec3 vWorld;
varying vec2 vUv;
void main(){vPosition=position;vUv=uv;vNormal=normalize(mat3(modelMatrix)*normal);vec4 world=modelMatrix*vec4(position,1.);vWorld=world.xyz;gl_Position=projectionMatrix*viewMatrix*world;}
