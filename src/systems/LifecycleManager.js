export class LifecycleManager {
  constructor(canvas, { resize, visibility, lost, restore }) {
    this.abort = new AbortController();
    const options = { signal: this.abort.signal };
    window.addEventListener("resize", resize, options);
    document.addEventListener(
      "visibilitychange",
      () => visibility(document.hidden),
      options,
    );
    canvas.addEventListener(
      "webglcontextlost",
      (event) => {
        event.preventDefault();
        lost();
      },
      options,
    );
    canvas.addEventListener("webglcontextrestored", restore, options);
  }
  dispose() {
    this.abort.abort();
  }
}
