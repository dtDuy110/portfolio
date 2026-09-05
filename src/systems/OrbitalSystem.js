import * as THREE from "three";
export class OrbitalSystem {
  constructor(scene, planets) {
    this.planets = planets;
    this.paused = false;
    this.focused = false;
    this.guides = new THREE.Group();
    for (const planet of planets.filter((p) => p.id !== "moon")) {
      const c = planet.config;
      const points = new THREE.EllipseCurve(0, 0, c.orbitRadius, c.orbitRadius)
        .getPoints(240)
        .map(
          (p) =>
            new THREE.Vector3(
              p.x,
              Math.sin(Math.atan2(p.y, p.x)) * c.orbitRadius * c.inclination,
              p.y,
            ),
        );
      const line = new THREE.Line(
        new THREE.BufferGeometry().setFromPoints(points),
        new THREE.LineDashedMaterial({
          color: "#a6b0c6",
          transparent: true,
          opacity: 0.13,
          dashSize: 0.13,
          gapSize: 0.2,
        }),
      );
      line.computeLineDistances();
      this.guides.add(line);
    }
    scene.add(this.guides);
    this.update(0);
  }
  update(delta) {
    for (const p of this.planets) {
      const c = p.config;
      if (!this.paused && !this.focused)
        p.angle += delta * c.speed * 0.18 * (p.hovered ? 0.12 : 1);
      const parent =
        p.id === "moon"
          ? this.planets.find((p) => p.id === "earth").position
          : new THREE.Vector3();
      p.position
        .set(
          Math.cos(p.angle) * c.orbitRadius,
          Math.sin(p.angle) * c.orbitRadius * c.inclination,
          Math.sin(p.angle) * c.orbitRadius,
        )
        .add(parent);
    }
  }
}
