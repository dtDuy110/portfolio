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
    this.light = new THREE.PointLight("#ffd580", 130, 100, 2);
    this.group.add(this.light);
  }
  update(time, delta) {
    super.update(time, delta);
    this.halo.scale.setScalar(
      19 + Math.sin(time * 0.8) * 0.4 + (this.hovered ? 1 : 0),
    );
    this.light.intensity = 130 + Math.sin(time) * 8;
  }
  dim(value) {
    super.dim(value);
    this.halo.material.opacity = value;
  }
}
