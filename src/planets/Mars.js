import * as THREE from "three";
import { BasePlanet } from "./BasePlanet.js";
export class Mars extends BasePlanet {
  constructor(config, data, quality) {
    super(config, 1, quality);
    for (const job of data.workExperience) {
      const crater = this.marker(
        job,
        "job",
        "#46231f",
        job.craterPosition,
        0.16,
      );
      crater.scale.set(1, 1, 0.12);
      crater.quaternion.setFromUnitVectors(
        new THREE.Vector3(0, 0, 1),
        crater.position.clone().normalize(),
      );
      const rim = new THREE.Mesh(
        new THREE.TorusGeometry(this.radius * 0.15, this.radius * 0.013, 6, 24),
        new THREE.MeshBasicMaterial({ color: "#a45c3c" }),
      );
      crater.add(rim);
      rim.scale.set(1, 1, 8);
    }
  }
}
