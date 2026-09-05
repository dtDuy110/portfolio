export class QualityManager {
  constructor() {
    this.mobile = matchMedia("(max-width: 760px)").matches;
    this.reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
    this.segments = this.mobile ? 40 : 64;
    this.stars = this.mobile ? 3000 : 8000;
    this.dpr = Math.min(devicePixelRatio, this.mobile ? 1.25 : 1.75);
    this.samples = [];
    this.lastChange = 0;
  }
  sample(delta, renderer, time) {
    if (delta > 0.2) return;
    this.samples.push(delta);
    if (this.samples.length < 180) return;
    const avg = this.samples.reduce((a, b) => a + b, 0) / this.samples.length;
    this.samples = [];
    if (avg > 0.03 && this.dpr > 1 && time - this.lastChange > 8) {
      this.dpr = 1;
      renderer.setPixelRatio(1);
      this.lastChange = time;
    }
  }
}
