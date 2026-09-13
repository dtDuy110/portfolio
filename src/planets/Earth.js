import * as THREE from "three";
import { BasePlanet } from "./BasePlanet.js";
import vertexShader from "../shaders/planet.vert?raw";
import fragment from "../shaders/cloud.frag?raw";
import noise from "../utils/noise.glsl?raw";
export class Earth extends BasePlanet {
  constructor(config, data, quality) {
    super(config, 4, quality);
    this.atmosphere.material.uniforms.uColor.value.set("#469fef");
    this.atmosphere.scale.setScalar(1.025);
    [...data.about.interests, ...data.about.languages].forEach((item) =>
      this.marker(item, "pin", "#c9f0dc", item, 0.055),
    );
    this.clouds = new THREE.Mesh(
      new THREE.SphereGeometry(
        this.radius * 1.018,
        quality.segments,
        quality.segments / 2,
      ),
      new THREE.ShaderMaterial({
        vertexShader,
        fragmentShader: fragment.replace("#include <noise>", noise),
        transparent: true,
        depthWrite: false,
        uniforms: { uTime: { value: 0 }, uDim: { value: 1 } },
      }),
    );
    this.group.add(this.clouds);
    this.materials.push(this.clouds.material);
  }
  update(time, delta) {
    super.update(time, delta);
    this.clouds.rotation.y += delta * (this.focused ? 0.061 : 0.035);
  }
}
