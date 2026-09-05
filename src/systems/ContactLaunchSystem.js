import * as THREE from "three";
import gsap from "gsap";
export class ContactLaunchSystem {
  constructor(scene) {
    const positions = new Float32Array(180 * 3);
    this.geometry = new THREE.BufferGeometry();
    this.geometry.setAttribute(
      "position",
      new THREE.BufferAttribute(positions, 3),
    );
    this.points = new THREE.Points(
      this.geometry,
      new THREE.PointsMaterial({
        color: "#ffd590",
        size: 0.07,
        transparent: true,
        opacity: 0,
        depthWrite: false,
      }),
    );
    scene.add(this.points);
  }
  launch(origin) {
    const state = { t: 0 };
    const curve = new THREE.QuadraticBezierCurve3(
      origin.clone(),
      origin
        .clone()
        .multiplyScalar(0.5)
        .add(new THREE.Vector3(0, 15, 0)),
      new THREE.Vector3(),
    );
    gsap.to(state, {
      t: 1,
      duration: 1.8,
      onUpdate: () => {
        const center = curve.getPoint(state.t);
        const p = this.geometry.attributes.position;
        for (let i = 0; i < p.count; i++) {
          const angle = i * 2.399;
          const r = (1 - state.t) * 0.7 * (i / p.count);
          p.setXYZ(
            i,
            center.x + Math.cos(angle) * r,
            center.y + Math.sin(angle) * r,
            center.z + Math.sin(i) * r,
          );
        }
        p.needsUpdate = true;
        this.points.material.opacity = Math.sin(state.t * Math.PI);
      },
    });
  }
}
