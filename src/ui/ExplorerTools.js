import { destinations } from "../sceneConfig.js";
import { SpaceAudio } from "../systems/SpaceAudio.js";

export function parseRoute(hash, data) {
  try {
    const [planet, item] = hash.replace(/^#\/?/, "").split("/").map(decodeURIComponent);
    if (!destinations.some((p) => p.id === planet)) return null;
    return { planet, item: planet === "neptune" && data.projects.some((p) => p.id === item) ? item : null };
  } catch { return null; }
}

export class ExplorerTools {
  constructor(data, navigate, back, project) {
    this.data = data;
    this.navigate = navigate;
    this.back = back;
    this.project = project;
    this.audio = new SpaceAudio();
    this.visited = new Set();
    this.steps = ["earth", "neptune", "mars", "jupiter", "saturn", "moon"];
    this.step = -1;
    this.bar = document.createElement("section");
    this.bar.className = "explorer-tools";
    this.bar.setAttribute("aria-label", "Exploration controls");
    this.bar.innerHTML = '<button data-action="tour">Guided tour</button><button data-action="audio" aria-pressed="false">Sound off</button><button data-action="share">Copy link</button><span class="visited-count">0 / 6 explored</span><p class="explorer-status" role="status"></p>';
    document.body.append(this.bar);
    this.tour = document.createElement("aside");
    this.tour.className = "tour-card";
    this.tour.hidden = true;
    this.tour.innerHTML = '<small>GUIDED TOUR</small><strong></strong><p></p><div><button data-action="previous">Previous</button><button data-action="next">Next destination</button><button data-action="exit">Exit tour</button></div>';
    document.body.append(this.tour);
    for (const element of [this.bar, this.tour]) element.addEventListener("click", (event) => this.action(event.target.closest("[data-action]")?.dataset.action));
    window.addEventListener("hashchange", () => this.restore());
    window.addEventListener("universe:state", ({ detail }) => this.state(detail));
    window.addEventListener("pagehide", () => this.audio.dispose(), { once: true });
  }
  async action(action) {
    if (!action) return;
    if (action === "audio") {
      try {
        const enabled = await this.audio.toggle();
        const button = this.bar.querySelector('[data-action="audio"]');
        button.textContent = enabled ? "Sound on" : "Sound off";
        button.setAttribute("aria-pressed", String(enabled));
      } catch { this.message("Audio is unavailable in this browser."); }
    }
    if (action === "share") {
      try { await navigator.clipboard.writeText(location.href); this.message("Link copied. Share this destination."); }
      catch { this.message("Copy the address from your browser to share this destination."); }
    }
    if (action === "exit") this.exit();
    if (action === "tour") { this.step = 0; this.goStep(); }
    if (action === "previous" && this.step > 0) { this.step--; this.goStep(); }
    if (action === "next") {
      if (this.step === this.steps.length - 1) { this.exit(); this.message("Tour complete. Your next chapter starts with a hello."); }
      else { this.step++; this.goStep(); }
    }
  }
  message(text) { this.bar.querySelector(".explorer-status").textContent = text; }
  goStep() {
    this.tour.hidden = false;
    const id = this.steps[this.step];
    const config = destinations.find((p) => p.id === id);
    const descriptions = {
      earth: "Meet the person behind this universe.", neptune: "Open a project satellite to explore its story.",
      mars: "Explore the roles and milestones along the way.", jupiter: "Discover the tools behind the work.",
      saturn: "Explore learning milestones by category.", moon: "Finish the journey with a conversation.",
    };
    this.tour.querySelector("strong").textContent = `${this.step + 1} / 6 · ${config.name}`;
    this.tour.querySelector("p").textContent = descriptions[id];
    this.tour.querySelector('[data-action="previous"]').disabled = this.step === 0;
    this.tour.querySelector('[data-action="next"]').textContent = this.step === 5 ? "Finish tour" : "Next destination";
    this.navigate(id);
  }
  exit() { this.step = -1; this.tour.hidden = true; }
  write(planet, item = null) {
    const hash = planet ? `#/${encodeURIComponent(planet)}${item ? `/${encodeURIComponent(item)}` : ""}` : "";
    if (location.hash !== hash) history.pushState(null, "", location.pathname + location.search + hash);
  }
  restore() {
    const route = parseRoute(location.hash, this.data);
    this.exit();
    this.pending = route?.item;
    if (route) this.navigate(route.planet);
    else this.back();
  }
  state({ name, destination }) {
    if (name === "flying-in") {
      this.audio.cue();
      if (this.step >= 0 && this.steps[this.step] !== destination) this.exit();
    }
    if (name === "focus") {
      this.audio.cue(true);
      this.visited.add(destination);
      this.bar.querySelector(".visited-count").textContent = `${this.visited.size} / 6 explored`;
      document.querySelectorAll("[data-destination]").forEach((el) => el.classList.toggle("visited", this.visited.has(el.dataset.destination)));
      if (this.visited.size === 6) this.message("✦ Explorer's log complete. All six worlds discovered.");
      if (this.pending) { const id = this.pending; this.pending = null; this.project(id); }
    }
    if (name === "overview") this.exit();
  }
}
