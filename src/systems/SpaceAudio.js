export class SpaceAudio {
  constructor() {
    this.enabled = false;
    document.addEventListener("visibilitychange", () => {
      if (document.hidden) this.context?.suspend();
      else if (this.enabled) this.context?.resume().catch(() => {});
    });
  }
  async toggle() {
    if (!this.context) {
      const Audio = window.AudioContext || window.webkitAudioContext;
      if (!Audio) return false;
      this.context = new Audio();
      this.master = this.context.createGain();
      this.master.gain.value = 0.035;
      this.master.connect(this.context.destination);
      [55, 82.41, 110].forEach((frequency) => {
        const oscillator = this.context.createOscillator();
        oscillator.frequency.value = frequency;
        oscillator.connect(this.master);
        oscillator.start();
      });
    }
    this.enabled = !this.enabled;
    if (this.enabled) await this.context.resume();
    else await this.context.suspend();
    return this.enabled;
  }
  cue(arrival = false) {
    if (!this.enabled || this.context?.state !== "running") return;
    const now = this.context.currentTime;
    const oscillator = this.context.createOscillator();
    const gain = this.context.createGain();
    oscillator.frequency.setValueAtTime(arrival ? 440 : 100, now);
    oscillator.frequency.exponentialRampToValueAtTime(arrival ? 660 : 220, now + 0.5);
    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(0.07, now + 0.04);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.7);
    oscillator.connect(gain).connect(this.context.destination);
    oscillator.start(now);
    oscillator.stop(now + 0.75);
    oscillator.onended = () => { oscillator.disconnect(); gain.disconnect(); };
  }
  dispose() { this.context?.close(); }
}
