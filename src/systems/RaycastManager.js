import * as THREE from "three";
export class RaycastManager {
  constructor(canvas, camera, planets, star, callbacks) {
    this.canvas = canvas;
    this.camera = camera;
    this.planets = planets;
    this.star = star;
    this.callbacks = callbacks;
    this.ray = new THREE.Raycaster();
    this.pointer = new THREE.Vector2(4, 4);
    this.down = null;
    this.active = null;
    this.focused = null;
    this.disabled = false;
    this.last = null;
    canvas.addEventListener("pointermove", (e) => {
      const r = canvas.getBoundingClientRect();
      this.pointer.set(
        ((e.clientX - r.left) / r.width) * 2 - 1,
        (-(e.clientY - r.top) / r.height) * 2 + 1,
      );
      this.screen = { x: e.clientX, y: e.clientY };
    });
    canvas.addEventListener("pointerleave", () => {
      this.pointer.set(4, 4);
      this.setHover(null);
    });
    canvas.addEventListener("pointerdown", (e) => {
      this.down = { x: e.clientX, y: e.clientY };
    });
    canvas.addEventListener("pointerup", (e) => {
      if (
        this.down &&
        Math.hypot(e.clientX - this.down.x, e.clientY - this.down.y) < 7 &&
        !this.disabled
      ) {
        const r = canvas.getBoundingClientRect();
        this.pointer.set(
          ((e.clientX - r.left) / r.width) * 2 - 1,
          (-(e.clientY - r.top) / r.height) * 2 + 1,
        );
        this.update();
        if (this.active) this.callbacks.select(this.active);
      }
      this.down = null;
    });
  }
  resolve(hit) {
    const data = hit.object.userData;
    if (data.items) {
      const item = data.items[hit.instanceId];
      return {
        ...data,
        itemId: item.id,
        label: item.name,
        object: hit.object,
        point: hit.point,
      };
    }
    return { ...data, object: hit.object, point: hit.point };
  }
  update() {
    if (this.disabled) {
      this.setHover(null);
      return;
    }
    this.ray.setFromCamera(this.pointer, this.camera);
    let hits = [];
    if (this.focused) {
      const p = this.focused;
      hits = this.ray.intersectObjects(
        p.targets.filter((t) => t.visible),
        false,
      );
      // Analytic occlusion avoids cracks along triangulated sphere seams.
      const surfacePoint = this.ray.ray.intersectSphere(
        new THREE.Sphere(
          p.mesh.getWorldPosition(new THREE.Vector3()),
          p.radius ?? p.mesh.geometry.parameters.radius,
        ),
        new THREE.Vector3(),
      );
      const surface = surfacePoint
        ? { distance: this.camera.position.distanceTo(surfacePoint) }
        : null;
      hits = hits.filter(
        (h) => !surface || h.distance <= surface.distance + 0.18,
      );
    } else {
      for (const p of [...this.planets, this.star]) {
        if (p.rings) {
          const ringHit = this.ray.intersectObjects(p.rings.children, false)[0];
          if (ringHit)
            hits.push({
              ...ringHit,
              object: { userData: { destination: p.id } },
            });
        }
        const sphere = new THREE.Sphere(
          p.position,
          p.radius * (p.id === "moon" ? 1.8 : 1.08),
        );
        const point = this.ray.ray.intersectSphere(sphere, new THREE.Vector3());
        if (point)
          hits.push({
            distance: this.camera.position.distanceTo(point),
            point,
            object: { userData: { destination: p.id } },
          });
      }
      hits.sort((a, b) => a.distance - b.distance);
    }
    this.active = hits.length ? this.resolve(hits[0]) : null;
    this.setHover(this.active);
  }
  setHover(hit) {
    const key = hit ? `${hit.destination}:${hit.itemId || ""}` : null;
    if (this.last !== key) {
      if (this.hoverObject) {
        this.hoverObject.userData.hovered = false;
        if (this.hoverObject.material?.uniforms?.uHover)
          this.hoverObject.material.uniforms.uHover.value = 0;
      }
      this.hoverObject = hit?.object;
      if (this.hoverObject) {
        this.hoverObject.userData.hovered = true;
        if (this.hoverObject.material?.uniforms?.uHover)
          this.hoverObject.material.uniforms.uHover.value = 1;
      }
      this.last = key;
      this.callbacks.hover(hit);
    }
    this.canvas.style.cursor = hit ? "pointer" : this.focused ? "grab" : "grab";
    if (hit?.label) this.callbacks.tooltip(hit, this.screen);
  }
}
