import * as THREE from "three";
export class LabelManager {
  constructor(planets, camera, onSelect) {
    this.camera = camera;
    this.container = document.querySelector("#labels");
    this.entries = planets.map((p) => {
      const button = document.createElement("button");
      button.className = `planet-label label-${p.id}`;
      button.style.setProperty("--planet-color", p.config.color);
      button.innerHTML = `<span class="label-dot"></span><span><strong>${p.config.name}</strong><small>${p.config.section}</small></span><span class="label-arrow">↗</span>`;
      button.addEventListener("click", () => onSelect(p.id));
      button.setAttribute(
        "aria-label",
        `${p.config.name}: ${p.config.section}`,
      );
      this.container.append(button);
      return { planet: p, element: button };
    });
  }
  update(focused) {
    const taken = [];
    for (const { planet, element } of this.entries) {
      if (focused) {
        element.hidden = true;
        continue;
      }
      const point = planet.position
        .clone()
        .add(new THREE.Vector3(0, -planet.radius - 0.55, 0))
        .project(this.camera);
      const x = (point.x * 0.5 + 0.5) * innerWidth,
        y = (-point.y * 0.5 + 0.5) * innerHeight;
      const mobile = innerWidth < 760;
      const width = mobile ? 80 : 145;
      const collision = taken.some(
        (p) => Math.abs(p.x - x) < width && Math.abs(p.y - y) < 48,
      );
      const visible =
        point.z < 1 &&
        x > 30 &&
        x < innerWidth - 30 &&
        y > 100 &&
        y < innerHeight - 180 &&
        !collision;
      element.hidden = !visible;
      if (visible) {
        taken.push({ x, y });
        element.style.transform = `translate(${x}px,${y}px) translate(-50%,0)`;
      }
      element.classList.toggle("hovered", planet.hovered);
    }
  }
}
