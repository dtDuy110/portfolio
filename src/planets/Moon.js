import * as THREE from "three";
import { BasePlanet } from "./BasePlanet.js";
export class Moon extends BasePlanet {
  constructor(config, data, quality) {
    super(config, 6, quality);
    const points = [];
    Object.entries(data.contact.socials)
      .filter(([, url]) => url)
      .forEach(([name, url], i) => {
        const dot = new THREE.Mesh(
          new THREE.SphereGeometry(0.045, 8, 8),
          new THREE.MeshBasicMaterial({ color: "#dce4f4" }),
        );
        dot.position.set(1.1 + i * 0.35, 0.3 + Math.sin(i * 2) * 0.3, 0);
        dot.userData = {
          destination: this.id,
          type: "social",
          itemId: name,
          label: name,
          url,
        };
        this.group.add(dot);
        this.targets.push(dot);
        points.push(dot.position);
      });
    if (points.length > 1)
      this.group.add(
        new THREE.Line(
          new THREE.BufferGeometry().setFromPoints(points),
          new THREE.LineBasicMaterial({
            color: "#8797b2",
            transparent: true,
            opacity: 0.3,
          }),
        ),
      );
  }
}
