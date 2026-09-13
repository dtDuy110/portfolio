import "./style.css";
import * as THREE from "three";
import gsap from "gsap";
import { data } from "./data/PortfolioStore.js";
import { destinations } from "./sceneConfig.js";
import { shell } from "./ui/Navigation.js";
import { PlanetPanel } from "./ui/PlanetPanel.js";
import { DetailModal } from "./ui/DetailModal.js";
import { ContactForm } from "./ui/ContactForm.js";
import { Tooltip } from "./ui/Tooltip.js";
import { LabelManager } from "./ui/LabelManager.js";
import { LoadingScreen } from "./ui/LoadingScreen.js";
import { showFallback } from "./ui/FallbackPortfolio.js";
import { AppState } from "./systems/AppState.js";
import { QualityManager } from "./systems/QualityManager.js";
import { createScene } from "./systems/SceneFactory.js";
import { OrbitalSystem } from "./systems/OrbitalSystem.js";
import { CameraController } from "./systems/CameraController.js";
import { ParticleField } from "./systems/ParticleField.js";
import { RaycastManager } from "./systems/RaycastManager.js";
import { ContactLaunchSystem } from "./systems/ContactLaunchSystem.js";
import { VisitorShip } from "./systems/VisitorShip.js";
import { LifecycleManager } from "./systems/LifecycleManager.js";
import { AssetManager } from "./systems/AssetManager.js";
import { IdentityStar } from "./planets/IdentityStar.js";
import { Mars } from "./planets/Mars.js";
import { Neptune } from "./planets/Neptune.js";
import { Saturn } from "./planets/Saturn.js";
import { Earth } from "./planets/Earth.js";
import { Jupiter } from "./planets/Jupiter.js";
import { Moon } from "./planets/Moon.js";
import { escapeHTML, safeURL } from "./utils/spatial.js";

shell(data);
const state = new AppState(),
  quality = new QualityManager(),
  loading = new LoadingScreen(),
  tooltip = new Tooltip(),
  modal = new DetailModal();
const canvas = document.querySelector("#universe");
let renderer,
  scene,
  camera,
  controller,
  orbits,
  raycaster,
  particles,
  labels,
  launch,
  visitor,
  star,
  planets = [],
  hidden = document.hidden,
  failed = false,
  paused = quality.reduced,
  listMode = false,
  elapsed = 0,
  previous = 0,
  frameId,
  returnFocus = null,
  dimTween;
const contact = new ContactForm(data.contact, () => {
  if (!quality.reduced)
    launch?.launch(planets.find((p) => p.id === "moon").position);
});
const panel = new PlanetPanel(data, selectItem, (form) => contact.bind(form));
modal.onClose = () => {
  planets.forEach((p) =>
    p.targets.forEach((t) => (t.userData.selected = false)),
  );
  if (state.destination && !state.transitioning) state.set("focus");
};
const announcer = document.querySelector("#announcer");

function setActive(id) {
  document.querySelectorAll("[data-destination]").forEach((button) => {
    button.classList.toggle("active", button.dataset.destination === id);
    button.setAttribute(
      "aria-pressed",
      String(button.dataset.destination === id),
    );
  });
}
function selectDestination(id) {
  if (id === "star") {
    goBack();
    return;
  }
  const config = destinations.find((p) => p.id === id);
  if (!config) return;
  returnFocus = document.activeElement;
  modal.close();
  tooltip.hide();
  state.set("flying-in", id);
  document.body.classList.add("focused");
  document.querySelector("#back").hidden = false;
  setActive(id);
  panel.show(config);
  announcer.textContent = `Exploring ${config.name}: ${config.section}`;
  if (failed) {
    state.set("focus", id);
    document.querySelector("#panel-title").focus({ preventScroll: true });
    return;
  }
  const selected = planets.find((p) => p.id === id);
  orbits.focused = true;
  raycaster.disabled = true;
  raycaster.focused = selected;
  planets.forEach((p) => {
    p.focus(p === selected, quality.reduced);
    p.hovered = false;
  });
  star.hovered = false;
  gsap.killTweensOf(orbits.guides.children.map((l) => l.material));
  gsap.to(
    orbits.guides.children.map((l) => l.material),
    { opacity: 0, duration: quality.reduced ? 0 : 0.45 },
  );
  const dim = { t: 0 };
  dimTween?.kill();
  dimTween = gsap.to(dim, {
    t: 1,
    duration: 0.6,
    onUpdate: () => {
      planets.forEach((p) => p.dim(p === selected ? 1 : 1 - dim.t * 0.7));
      star.dim(1 - dim.t * 0.7);
    },
  });
  visitor.visit(selected, selected.id === "neptune" || selected.id === "saturn" ? 1.4 : 1.2);
  controller.fly(selected, () => {
    state.set("focus", id);
    raycaster.disabled = listMode;
    document.querySelector("#panel-title").focus({ preventScroll: true });
  });
}
function goBack() {
  if (modal.isOpen) {
    modal.close();
    return;
  }
  if (!state.destination) return;
  state.set("flying-out");
  tooltip.hide();
  panel.hide();
  document.body.classList.remove("focused");
  document.querySelector("#back").hidden = true;
  setActive(null);
  if (failed) {
    state.set("fallback", null);
    returnFocus?.focus?.();
    return;
  }
  dimTween?.kill();
  raycaster.disabled = true;
  raycaster.focused = null;
  planets.forEach((p) => {
    p.focus(false, quality.reduced);
    p.dim(1);
  });
  star.dim(1);
  visitor.back();
  controller.back(() => {
    state.set("overview", null);
    orbits.focused = false;
    raycaster.disabled = listMode;
    gsap.to(
      orbits.guides.children.map((l) => l.material),
      { opacity: 0.13, duration: 0.5 },
    );
    returnFocus?.focus?.({ preventScroll: true });
  });
}
function selectItem(hit) {
  if (!hit.itemId && hit.type !== "ring") {
    selectDestination(hit.destination);
    return;
  }
  tooltip.hide();
  panel.select(hit.itemId);
  state.item = hit.itemId;
  switch (hit.type) {
    case "job":
      break;
    case "project": {
      const p = data.projects.find((p) => p.id === hit.itemId);
      if (p) {
        planets
          .find((p) => p.id === "neptune")
          ?.targets.forEach(
            (t) => (t.userData.selected = t.userData.itemId === hit.itemId),
          );
        modal.project(p);
        state.set("detail");
      }
      break;
    }
    case "cert": {
      const c = data.certifications.find((c) => c.id === hit.itemId);
      if (c) {
        modal.cert(c);
        state.set("detail");
      }
      break;
    }
    case "ring": {
      panel.filter(hit.itemId);
      if (!failed && hit.itemId) {
        const p = planets.find((p) => p.id === "saturn");
        const frame = controller.frame(p);
        frame.position.y = p.position.y + p.focusRadius * 0.8;
        controller.animate(frame.position, frame.target, 0.6);
      }
      break;
    }
    case "skill": {
      const s = data.skills.find((s) => s.id === hit.itemId);
      if (s) {
        modal.open(
          s.category,
          "SKILLS & TECH STACK",
          `<p>${s.years ? `${s.years} years of hands-on experience.` : "Always learning."}</p><div class="tags">${s.items.map((item) => `<span>${escapeHTML(item)}</span>`).join("")}</div>`,
        );
        state.set("detail");
      }
      break;
    }
    case "pin": {
      const item = [...data.about.interests, ...data.about.languages].find(
        (i) => i.id === hit.itemId,
      );
      if (item) {
        modal.open(
          item.label,
          "A LITTLE MORE ABOUT ME",
          `<p>${data.about.interests.some((i) => i.id === item.id) ? "One of the things that keeps me curious beyond the screen." : "One of the languages in my world."}</p>`,
        );
        state.set("detail");
      }
      break;
    }
    case "social":
      if (safeURL(hit.url))
        window.open(safeURL(hit.url), "_blank", "noopener,noreferrer");
      break;
  }
}
function fallback(error) {
  console.error("Universe renderer unavailable:", error);
  failed = true;
  listMode = true;
  cancelAnimationFrame(frameId);
  controller?.tween?.kill();
  dimTween?.kill();
  panel.hide();
  document.body.classList.remove("focused");
  document.querySelector("#back").hidden = true;
  setActive(null);
  state.set("fallback", null);
  loading.finish();
  showFallback(
    "The 3D view is unavailable on this device. Every destination is still here.",
  );
}
document
  .querySelectorAll("[data-destination]")
  .forEach((button) =>
    button.addEventListener("click", () =>
      selectDestination(button.dataset.destination),
    ),
  );
document.querySelector("#home").addEventListener("click", () => {
  if (modal.isOpen) modal.close();
  goBack();
  if (listMode && !failed) toggleList();
});
document
  .querySelector("#contact-shortcut")
  .addEventListener("click", () => selectDestination("moon"));
document.querySelector("#back").addEventListener("click", goBack);
document.querySelector(".panel-close").addEventListener("click", goBack);
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && !modal.isOpen) goBack();
});
function updateMotionButton() {
  const button = document.querySelector("#motion-toggle");
  button.setAttribute("aria-pressed", String(paused));
  button.innerHTML = `${paused ? "▷" : "Ⅱ"} <span>${paused ? "Resume orbits" : "Pause orbits"}</span>`;
  if (orbits) orbits.paused = paused;
}
document.querySelector("#motion-toggle").addEventListener("click", () => {
  paused = !paused;
  updateMotionButton();
});
updateMotionButton();
function toggleList() {
  listMode = !listMode;
  document.body.classList.toggle("list-mode", listMode);
  document.querySelector("#list-view").hidden = !listMode;
  document.querySelector("#view-toggle").textContent = listMode
    ? "Universe view"
    : "List view";
  if (raycaster) raycaster.disabled = listMode;
}
document.querySelector("#view-toggle").addEventListener("click", toggleList);
canvas.addEventListener("pointermove", (event) => {
  if (particles && !quality.reduced)
    particles.pointer.set(
      (event.clientX / innerWidth - 0.5) * 2,
      (0.5 - event.clientY / innerHeight) * 2,
    );
});
try {
  ({ renderer, scene, camera } = createScene(canvas, quality));
  const constructors = {
    mars: Mars,
    neptune: Neptune,
    saturn: Saturn,
    earth: Earth,
    jupiter: Jupiter,
    moon: Moon,
  };
  // Earth precedes its satellite in the orbit update order.
  planets = [...destinations]
    .sort((a, b) => Number(a.id === "moon") - Number(b.id === "moon"))
    .map((config) => new constructors[config.id](config, data, quality));
  star = new IdentityStar(quality);
  scene.add(star.group);
  planets.forEach((p) => scene.add(p.group));
  orbits = new OrbitalSystem(scene, planets);
  orbits.paused = paused;
  particles = new ParticleField(scene, quality);
  controller = new CameraController(camera, canvas, quality);
  launch = new ContactLaunchSystem(scene);
  visitor = new VisitorShip(scene, quality);
  labels = new LabelManager(planets, camera, selectDestination);
  raycaster = new RaycastManager(canvas, camera, planets, star, {
    select: selectItem,
    hover: (hit) => {
      planets.forEach(
        (p) => (p.hovered = hit?.destination === p.id && !state.destination),
      );
      star.hovered = hit?.destination === "star";
      document.body.classList.toggle("identity-hover", star.hovered);
      if (!hit?.label) tooltip.hide();
    },
    tooltip: (hit, screen) => tooltip.show(hit, screen),
  });
  await new AssetManager().prepare(renderer, scene, camera, loading);
  loading.finish();
  state.set("overview", null);
  new LifecycleManager(canvas, {
    resize: () => {
      renderer.setSize(innerWidth, innerHeight);
      controller.resize();
    },
    visibility: (value) => {
      hidden = value;
      previous = 0;
      if (hidden) {
        cancelAnimationFrame(frameId);
      } else if (!failed) {
        frameId = requestAnimationFrame(animate);
      }
    },
    lost: () => fallback("Graphics context lost. Reload to retry the 3D view."),
    restore: () => {
      announcer.textContent =
        "Graphics restored. Reload to return to the universe.";
    },
  });
  function animate(timestamp) {
    if (hidden || failed) return;
    const delta = previous ? Math.min((timestamp - previous) / 1000, 0.05) : 0;
    previous = timestamp;
    if (!paused) elapsed += delta;
    orbits.update(delta);
    planets.forEach((p) => p.update(elapsed, paused ? 0 : delta));
    star.update(elapsed, paused ? 0 : delta);
    controller.update();
    visitor.update(delta, !paused);
    scene.updateMatrixWorld(true);
    if (!listMode) raycaster.update();
    particles.update(delta, !paused && !quality.reduced);
    labels.update(Boolean(state.destination) || listMode);
    const identity = star.position
      .clone()
      .add(new THREE.Vector3(0, -4.15, 0))
      .project(camera);
    document.querySelector("#identity-label").style.transform =
      `translate(${(identity.x * 0.5 + 0.5) * innerWidth}px,${(-identity.y * 0.5 + 0.5) * innerHeight}px) translate(-50%,0)`;
    renderer.render(scene, camera);
    quality.sample(delta, renderer, elapsed);
    frameId = requestAnimationFrame(animate);
  }
  frameId = requestAnimationFrame(animate);
  window.addEventListener(
    "pagehide",
    () => {
      cancelAnimationFrame(frameId);
      controller.controls.dispose();
      scene.traverse((object) => {
        object.geometry?.dispose();
        const materials = Array.isArray(object.material)
          ? object.material
          : [object.material];
        materials.forEach((material) => {
          material?.map?.dispose();
          material?.dispose();
        });
      });
      renderer.dispose();
    },
    { once: true },
  );
} catch (error) {
  fallback(error);
}
