import * as THREE from "three";
import gsap from "gsap";
import { BasePlanet } from "./BasePlanet.js";
export class Jupiter extends BasePlanet {
  constructor(config, data, quality) {
    super(config, 5, quality);
    this.mesh.visible = false;
    const total = data.skills.reduce((sum, s) => sum + (s.years || 1), 0);
    let theta = 0;
    this.bands = data.skills.map((skill, i) => {
      const height = (Math.PI * (skill.years || 1)) / total;
      const band = new THREE.Mesh(
        new THREE.SphereGeometry(
          this.radius,
          quality.segments,
          20,
          0,
          Math.PI * 2,
          theta,
          height + 0.003,
        ),
        this.material.clone(),
      );
      theta += height;
      band.material.uniforms.uColor.value.set(skill.bandColor);
      this.materials.push(band.material);
      band.userData = {
        destination: this.id,
        type: "skill",
        itemId: skill.id,
        label: skill.category,
      };
      this.spin.add(band);
      this.targets.push(band);
      return band;
    });
    this.focusRadius = this.radius * 1.3;
  }
  focus(active, reduced = false) {
    this.focused = active;
    this.bands.forEach((band, i) => {
      gsap.killTweensOf(band.position);
      gsap.to(band.position, {
        y: active ? ((this.bands.length - 1) / 2 - i) * 0.6 : 0,
        duration: reduced ? 0 : 0.8,
        ease: "power2.inOut",
      });
    });
  }
}
