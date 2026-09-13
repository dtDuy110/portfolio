import * as THREE from "three";

// The visitor travels independently of the camera, so OrbitControls stays usable.
export class VisitorShip {
  constructor(scene, quality) {
    this.quality = quality;
    this.home = new THREE.Vector3(4.5, 2.5, 5);
    this.group = new THREE.Group();
    this.group.position.copy(this.home);
    this.group.scale.setScalar(0.8);
    this.model = new THREE.Group();
    this.group.add(this.model);
    const hull = new THREE.Mesh(
      new THREE.SphereGeometry(1, 32, 16),
      new THREE.MeshStandardMaterial({ color: "#bacbdc", metalness: 0.65, roughness: 0.28 }),
    );
    hull.scale.set(1, 0.22, 1);
    this.model.add(hull);
    const dome = new THREE.Mesh(
      new THREE.SphereGeometry(0.48, 24, 16),
      new THREE.MeshStandardMaterial({ color: "#8cfff2", emissive: "#168e9a", emissiveIntensity: 0.8, metalness: 0.25, roughness: 0.15 }),
    );
    dome.position.y = 0.19;
    dome.scale.y = 0.8;
    this.model.add(dome);
    this.light = new THREE.MeshBasicMaterial({ color: "#72ffdf" });
    const rim = new THREE.Mesh(new THREE.TorusGeometry(0.94, 0.035, 8, 48), this.light);
    rim.rotation.x = Math.PI / 2;
    this.model.add(rim);
    const lamps = new THREE.InstancedMesh(new THREE.SphereGeometry(0.065, 8, 6), this.light, 10);
    const matrix = new THREE.Matrix4();
    for (let i = 0; i < 10; i++) {
      const angle = (i / 10) * Math.PI * 2;
      lamps.setMatrixAt(i, matrix.makeTranslation(Math.cos(angle) * 0.78, -0.16, Math.sin(angle) * 0.78));
    }
    this.model.add(lamps);
    this.glow = new THREE.Mesh(
      new THREE.ConeGeometry(0.5, 1.3, 24, 1, true),
      new THREE.MeshBasicMaterial({ color: "#49ebdd", transparent: true, opacity: 0.12, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide }),
    );
    this.glow.position.y = -0.7;
    this.model.add(this.glow);
    this.clock = 0;
    scene.add(this.group);
  }

  visit(planet, duration) {
    // Stay above the ring/moon envelope, on the camera-facing side.
    const extent = planet.focusRadius;
    const end = planet.position.clone().add(new THREE.Vector3(-0.62, 0.72, 0.8).normalize().multiplyScalar(extent * 1.18));
    this.travel(end, duration, Math.min(0.8, planet.radius * 0.22));
  }

  back() {
    this.travel(this.home, 1.2, 0.8);
  }

  travel(end, duration, scale) {
    const start = this.group.position.clone();
    const lift = Math.max(4, start.distanceTo(end) * 0.4);
    const a = start.clone().lerp(end, 0.3);
    const b = start.clone().lerp(end, 0.72);
    a.y += lift;
    b.y += lift * 0.7;
    this.flight = {
      curve: new THREE.CatmullRomCurve3([start, a, b, end.clone()]),
      elapsed: 0, duration, fromScale: this.group.scale.x, scale,
    };
    if (this.quality.reduced) {
      this.group.position.copy(end);
      this.group.scale.setScalar(scale);
      this.flight = null;
    }
  }

  update(delta, moving = true) {
    if (this.flight) {
      const flight = this.flight;
      flight.elapsed += delta;
      const t = Math.min(1, flight.elapsed / flight.duration);
      const eased = t < 0.5 ? 4 * t ** 3 : 1 - (-2 * t + 2) ** 3 / 2;
      this.group.position.copy(flight.curve.getPointAt(eased));
      this.group.scale.setScalar(THREE.MathUtils.lerp(flight.fromScale, flight.scale, eased));
      const tangent = flight.curve.getTangentAt(eased);
      this.model.rotation.z = -tangent.x * Math.sin(t * Math.PI) * 0.3;
      this.glow.material.opacity = 0.12 + Math.sin(t * Math.PI) * 0.2;
      if (t === 1) this.flight = null;
    }
    if (moving && !this.quality.reduced) {
      this.clock += delta;
      this.model.position.y = Math.sin(this.clock * 1.8) * 0.08;
      this.model.rotation.y += delta * 0.35;
    }
  }
}
