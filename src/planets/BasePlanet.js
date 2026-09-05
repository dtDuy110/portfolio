import * as THREE from "three";
import { surface, atmosphereMaterial } from "../utils/materials.js";
import { latLng } from "../utils/spatial.js";
export class BasePlanet {
  constructor(config, kind, quality) {
    this.config = config;
    this.id = config.id;
    this.radius = config.radius;
    this.angle = config.phase;
    this.group = new THREE.Group();
    this.spin = new THREE.Group();
    this.group.add(this.spin);
    this.material = surface(kind, config.color);
    this.mesh = new THREE.Mesh(
      new THREE.SphereGeometry(
        this.radius,
        quality.segments,
        quality.segments / 2,
      ),
      this.material,
    );
    this.spin.add(this.mesh);
    this.mesh.userData = { destination: this.id };
    this.targets = [];
    this.materials = [this.material];
    this.focused = false;
    this.hovered = false;
    this.focusRadius = this.radius;
    this.atmosphere = new THREE.Mesh(
      new THREE.SphereGeometry(this.radius * 1.055, 32, 24),
      atmosphereMaterial(config.color),
    );
    this.group.add(this.atmosphere);
    this.materials.push(this.atmosphere.material);
  }
  marker(item, type, color, position, size = 0.09) {
    const marker = new THREE.Mesh(
      new THREE.SphereGeometry(this.radius * size, 12, 8),
      new THREE.MeshBasicMaterial({ color }),
    );
    marker.position.copy(
      latLng(position.lat, position.lng, this.radius * 1.02),
    );
    marker.userData = {
      destination: this.id,
      itemId: item.id,
      type,
      label: item.label || item.name || item.company || item.category,
    };
    this.spin.add(marker);
    this.targets.push(marker);
    marker.visible = false;
    return marker;
  }
  focus(active) {
    this.focused = active;
    for (const target of this.targets) target.visible = active;
  }
  update(time, delta) {
    this.spin.rotation.y += delta * (this.focused ? 0.045 : 0.025);
    for (const material of this.materials)
      if (material.uniforms?.uTime) material.uniforms.uTime.value = time;
    this.material.uniforms.uHover.value = THREE.MathUtils.damp(
      this.material.uniforms.uHover.value,
      this.hovered ? 1 : 0,
      5,
      delta,
    );
  }
  dim(value) {
    for (const material of this.materials)
      if (material.uniforms?.uDim) material.uniforms.uDim.value = value;
    this.group.traverse((object) => {
      const material = object.material;
      if (!material?.isMeshStandardMaterial) return;
      material.userData.originalColor ??= material.color.clone();
      material.color
        .copy(material.userData.originalColor)
        .multiplyScalar(value);
    });
  }
  get position() {
    return this.group.position;
  }
}
