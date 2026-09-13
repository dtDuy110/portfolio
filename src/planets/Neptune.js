import * as THREE from "three";
import { BasePlanet } from "./BasePlanet.js";
export class Neptune extends BasePlanet {
  constructor(config, data, quality) {
    super(config, 2, quality);
    this.moons = data.projects.map((item, i) => {
      const moon = new THREE.Mesh(
        new THREE.SphereGeometry(0.17 + item.complexity * 0.3, 20, 12),
        new THREE.MeshStandardMaterial({
          color: ["#93b9df", "#c3afd0", "#b3c9c9"][i % 3],
          roughness: 0.8,
          emissive: "#162538",
          emissiveIntensity: 0.4,
        }),
      );
      moon.userData = {
        destination: this.id,
        type: "project",
        itemId: item.id,
        label: item.name,
      };
      this.group.add(moon);
      this.targets.push(moon);
      return {
        mesh: moon,
        distance: this.radius * item.orbitDistance,
        angle: i * 2.1,
      };
    });
    this.focusRadius = this.radius * 3.6;
    this.satelliteGuides = new THREE.Group();
    for (const moon of this.moons) {
      const points = new THREE.EllipseCurve(0, 0, moon.distance, moon.distance).getPoints(100).map((p) => new THREE.Vector3(p.x, 0, p.y));
      this.satelliteGuides.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(points), new THREE.LineBasicMaterial({ color: "#64d8ed", transparent: true, opacity: 0.12, depthWrite: false })));
    }
    this.group.add(this.satelliteGuides);
    this.satelliteGuides.visible = false;
  }
  focus(active) {
    super.focus(active);
    this.satelliteGuides.visible = active;
    this.moons.forEach((m) => (m.mesh.visible = true));
  }
  update(time, delta) {
    super.update(time, delta);
    this.moons.forEach((m, i) => {
      if (!m.mesh.userData.hovered && !m.mesh.userData.selected)
        m.angle += (delta * (this.focused ? 0.045 : 0.14)) / (1 + i * 0.3);
      m.mesh.position.set(
        Math.cos(m.angle) * m.distance,
        Math.sin(m.angle * 0.7) * 0.5,
        Math.sin(m.angle) * m.distance,
      );
    });
  }
}
