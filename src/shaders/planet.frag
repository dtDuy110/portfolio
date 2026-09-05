uniform float uTime;
uniform float uKind;
uniform float uDim;
uniform float uHover;
uniform vec3 uColor;
varying vec3 vPosition;
varying vec3 vNormal;
varying vec3 vWorld;
varying vec2 vUv;
#include <noise>
void main(){
 vec3 p=normalize(vPosition);float n=fbm(p*8.);vec3 col=uColor;
 if(uKind<.5){float cells=fbm(p*13.+uTime*.025);col=mix(vec3(1.,.28,.025),vec3(1.,.84,.4),cells*1.4);col+=pow(noise(p*40.+uTime*.07),5.)*.35;}
 else if(uKind<1.5){float rocky=fbm(p*15.);col=mix(vec3(.22,.045,.025),vec3(.76,.29,.12),rocky*1.45);col*=.7+.5*noise(p*80.);}
 else if(uKind<2.5){float swirl=fbm(p*5.+vec3(sin(p.y*14.+uTime*.08)*1.2,uTime*.018,cos(p.x*8.)*.4));float bands=sin(p.y*25.+swirl*14.);col=mix(vec3(.025,.075,.23),vec3(.10,.39,.68),swirl);col+=vec3(.025,.065,.11)*bands;}
 else if(uKind<3.5){float b=sin(p.y*45.+n*4.);col=mix(vec3(.40,.29,.14),vec3(.87,.74,.47),.5+.5*b)*(.82+n*.35);}
 else if(uKind<4.5){float land=fbm(p*3.5+vec3(2.,0.,1.));float coast=smoothstep(.47,.51,land);col=mix(vec3(.015,.14,.30),mix(vec3(.09,.25,.15),vec3(.37,.44,.24),n),coast);float ice=smoothstep(.83,.95,abs(p.y));col=mix(col,vec3(.77,.84,.85),ice);float clouds=smoothstep(.63,.77,fbm(p*8.+vec3(uTime*.015,0,0)));col=mix(col,vec3(.8,.87,.9),clouds*.8);}
 else if(uKind<5.5){float stripe=sin(p.y*34.+n*6.);col=mix(vec3(.28,.17,.34),vec3(.68,.47,.63),stripe*.5+.5);col=mix(col,vec3(.85,.69,.73),smoothstep(.7,.96,sin(p.y*68.+n*3.))*.6);float spot=length((vUv-vec2(.64+sin(uTime*.02)*.025,.43))*vec2(2.,5.));col=mix(col,vec3(.62,.27,.35),1.-smoothstep(.03,.10,spot));}
 else {col=mix(vec3(.23,.25,.29),vec3(.65,.66,.68),n*1.4);col*=.85+.15*noise(p*70.);}
 float light=max(dot(normalize(vNormal),normalize(vec3(-12.,20.,22.)-vWorld)),0.);
 vec3 viewDir=normalize(cameraPosition-vWorld);float rim=pow(1.-max(dot(viewDir,normalize(vNormal)),0.),3.);
 if(uKind>.5)col*=.21+light*.95;else col*=1.4;
 col+=uColor*rim*(.12+uHover*.25);col*=uDim;gl_FragColor=vec4(col,1.);
 #include <tonemapping_fragment>
 #include <colorspace_fragment>
}
