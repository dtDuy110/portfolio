import * as THREE from "three";
import { BasePlanet } from "./BasePlanet.js";
import { glowTexture } from "../utils/materials.js";
export class IdentityStar extends BasePlanet {
  constructor(quality) {
    super({ id: "star", radius: 3.05, color: "#ffd580", phase: 0 }, 0, quality);
    this.halo = new THREE.Sprite(
      new THREE.SpriteMaterial({
        map: glowTexture(),
        color: "#ffd394",
        transparent: true,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      }),
    );
    this.halo.scale.setScalar(19);
    this.group.add(this.halo);
    this.corona = new THREE.Mesh(
      new THREE.SphereGeometry(3.25, 48, 32),
      new THREE.ShaderMaterial({
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        uniforms: { uTime: { value: 0 }, uDim: { value: 1 } },
        vertexShader: `varying vec3 vN; varying vec3 vV; void main(){vec4 p=modelViewMatrix*vec4(position,1.);vN=normalize(normalMatrix*normal);vV=normalize(-p.xyz);gl_Position=projectionMatrix*p;}`,
        fragmentShader: `uniform float uTime;uniform float uDim;varying vec3 vN;varying vec3 vV;void main(){float rim=pow(1.-abs(dot(normalize(vN),normalize(vV))),2.);float rays=.7+.3*sin(vN.y*38.+sin(vN.x*24.+uTime*.7)*3.);gl_FragColor=vec4(vec3(1.,.55,.16),rim*rays*.65*uDim);}`,
      }),
    );
    this.group.add(this.corona);
    this.materials.push(this.corona.material);
    this.light = new THREE.PointLight("#ffd580", 130, 100, 2);
    this.group.add(this.light);
  }
  update(time, delta) {
    super.update(time, delta);
    this.halo.scale.setScalar(
      19 + Math.sin(time * 0.8) * 0.4 + (this.hovered ? 1 : 0),
    );
    this.light.intensity = 130 + Math.sin(time) * 8;
    this.corona.scale.setScalar(1 + Math.sin(time * 0.65) * 0.015);
  }
  dim(value) {
    super.dim(value);
    this.halo.material.opacity = value;
  }
}
