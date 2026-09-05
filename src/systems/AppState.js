export class AppState {
  constructor() {
    this.name = "loading";
    this.destination = null;
    this.item = null;
  }
  set(name, destination = this.destination) {
    this.name = name;
    this.destination = destination;
    window.dispatchEvent(
      new CustomEvent("universe:state", { detail: { name, destination } }),
    );
  }
  get transitioning() {
    return this.name === "flying-in" || this.name === "flying-out";
  }
}
