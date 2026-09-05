export class LoadingScreen {
  constructor() {
    this.element = document.querySelector("#loading");
  }
  progress(value) {
    this.element.style.setProperty(
      "--progress",
      `${Math.round(value * 360)}deg`,
    );
    this.element.querySelector("small").textContent =
      `${Math.round(value * 100)}%`;
  }
  finish() {
    this.progress(1);
    this.element.classList.add("loaded");
    setTimeout(() => this.element.remove(), 500);
  }
}
