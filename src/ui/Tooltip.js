export class Tooltip {
  constructor() {
    this.element = document.querySelector("#tooltip");
  }
  show(hit, screen) {
    if (!screen) return;
    this.element.textContent = hit.label;
    this.element.hidden = false;
    this.element.style.left = `${Math.min(screen.x + 15, innerWidth - this.element.offsetWidth - 16)}px`;
    this.element.style.top = `${Math.min(screen.y + 15, innerHeight - 50)}px`;
  }
  hide() {
    this.element.hidden = true;
  }
}
