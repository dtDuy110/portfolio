import * as THREE from "three";
import { destinations } from "../sceneConfig.js";

export class FlightExperience {
  constructor(controller, visitor, quality, navigate) {
    this.controller = controller;
    this.visitor = visitor;
    this.quality = quality;
    this.hud = document.createElement("div");
    this.hud.className = "flight-hud";
    this.hud.innerHTML =
      '<span class="flight-signal"></span><div><small>VISITOR 001 · FLIGHT SYSTEM</small><strong>Choose your next destination</strong></div><span class="flight-percent">READY</span>';
    document.body.append(this.hud);
    this.label = this.hud.querySelector("strong");
    this.percent = this.hud.querySelector(".flight-percent");
    const picker = document.createElement("select");
    picker.setAttribute("aria-label", "Fly to another destination");
    picker.innerHTML = '<option value="">Fly to…</option>' + destinations.map((p) => `<option value="${p.id}">${p.name}</option>`).join("");
    picker.addEventListener("change", () => {
      if (picker.value) navigate(picker.value);
      picker.value = "";
    });
    this.hud.append(picker);
    visitor.managed = true;
    controller.visitor = visitor;
  }

  begin(name) {
    this.skip();
    this.hud.classList.add("in-flight");
    document.body.classList.add("in-transit");
    document.querySelector("#planet-panel").inert = true;
    this.label.textContent = `Departing · ${name}`;
    this.controller.journey = (t) => {
      this.visitor.seek(t);
      this.label.textContent = `${t < 0.18 ? "Departing" : t < 0.8 ? "In transit" : "Approaching"} · ${name}`;
      this.percent.textContent = `${Math.round(t * 100)}%`;
    };
  }

  arrive(name) {
    this.visitor.seek(1);
    this.hud.classList.remove("in-flight");
    document.body.classList.remove("in-transit");
    const panel = document.querySelector("#planet-panel");
    panel.inert = panel.getAttribute("aria-hidden") === "true";
    this.label.textContent = `Arrived · ${name}`;
    this.percent.textContent = "CONNECTED";
  }

  intro() {
    let seen = false;
    try {
      seen = localStorage.getItem("universe-intro-v1") === "seen";
    } catch {}
    if (seen || this.quality.reduced) return;
    try {
      localStorage.setItem("universe-intro-v1", "seen");
    } catch {}
    this.overlay = document.createElement("div");
    this.overlay.className = "flight-intro";
    this.overlay.innerHTML =
      '<div><p>INCOMING TRANSMISSION / VISITOR 001</p><h2>Your journey<br>starts here.</h2><span>A personal space odyssey</span></div><button type="button">Skip intro ↗</button>';
    document.body.append(this.overlay);
    this.overlay.querySelector("button").onclick = () => this.skip();
    document.body.classList.add("cinematic-intro");
    const camera = this.controller.camera;
    const end = camera.position.clone();
    const target = this.controller.controls.target.clone();
    camera.position.copy(this.visitor.home).add(new THREE.Vector3(0, 3, 9));
    this.controller.controls.target.copy(this.visitor.home);
    this.controller.animate(end, target, 3.8, () => this.finishIntro());
  }

  finishIntro() {
    this.overlay?.remove();
    this.overlay = null;
    document.body.classList.remove("cinematic-intro");
  }

  skip() {
    if (!this.overlay) return;
    this.controller.tween?.progress(1);
    this.finishIntro();
  }
}
