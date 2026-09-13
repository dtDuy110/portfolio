import * as THREE from "three";
import { BasePlanet } from "./BasePlanet.js";
export class Mars extends BasePlanet {
  constructor(config, data, quality) {
    super(config, 1, quality);
    this.beacons = [];
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
      const beacon = new THREE.Mesh(new THREE.ConeGeometry(0.025, 0.7, 8), new THREE.MeshBasicMaterial({ color: "#ffc892", transparent: true, opacity: 0.65 }));
      beacon.position.copy(crater.position).multiplyScalar(1.16);
      beacon.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), crater.position.clone().normalize());
      this.spin.add(beacon);
      this.beacons.push(beacon);
      beacon.visible = false;
    }
  }
  focus(active) {
    super.focus(active);
    this.beacons.forEach((beacon) => { beacon.visible = active; });
  }
  update(time, delta) {
    super.update(time, delta);
    this.beacons.forEach((beacon, i) => { beacon.material.opacity = 0.4 + Math.sin(time * 1.6 + i) * 0.2; });
  }
}
