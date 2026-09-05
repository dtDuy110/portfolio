import * as THREE from "three";
import { BasePlanet } from "./BasePlanet.js";
import { ringMaterial } from "../utils/materials.js";
import { categoryColors } from "../sceneConfig.js";
export class Saturn extends BasePlanet {
  constructor(config, data, quality) {
    super(config, 3, quality);
    this.rings = new THREE.Group();
    this.rings.rotation.x = -Math.PI / 2 - 0.4;
    this.rings.rotation.y = 0.2;
    this.group.add(this.rings);
    Object.entries(categoryColors).forEach(([category, color], i) => {
      const inner = this.radius * (1.4 + i * 0.23);
      const geometry = new THREE.RingGeometry(
        inner,
        inner + this.radius * 0.18,
        100,
      );
      const pos = geometry.attributes.position,
        uv = geometry.attributes.uv;
      for (let j = 0; j < pos.count; j++)
        uv.setXY(
          j,
          (Math.hypot(pos.getX(j), pos.getY(j)) - inner) / (this.radius * 0.18),
          0,
        );
      const ring = new THREE.Mesh(geometry, ringMaterial(color));
      ring.userData = {
        destination: this.id,
        type: "ring",
        itemId: category,
        label: category[0].toUpperCase() + category.slice(1),
      };
      this.rings.add(ring);
      this.targets.push(ring);
      this.materials.push(ring.material);
      const certs = data.certifications.filter(
        (c) => c.ringCategory === category,
      );
      const gems = new THREE.InstancedMesh(
        new THREE.OctahedronGeometry(0.14),
        new THREE.MeshBasicMaterial({ color }),
        certs.length,
      );
      certs.forEach((cert, j) => {
        const a = j * 2.5 + i;
        gems.setMatrixAt(
          j,
          new THREE.Matrix4().makeTranslation(
            Math.cos(a) * (inner + 0.2),
            Math.sin(a) * (inner + 0.2),
            0.06,
          ),
        );
      });
      gems.userData = { destination: this.id, type: "cert", items: certs };
      this.rings.add(gems);
      this.targets.push(gems);
    });
    this.focusRadius = this.radius * 2.5;
  }
  focus(active) {
    this.focused = active;
  }
}
