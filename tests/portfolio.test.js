import test from "node:test";
import assert from "node:assert/strict";
import * as THREE from "three";
import { data, validatePortfolio } from "../src/data/PortfolioStore.js";
import {
  fitDistance,
  latLng,
  safeURL,
  safeAsset,
  escapeHTML,
} from "../src/utils/spatial.js";
import { OrbitalSystem } from "../src/systems/OrbitalSystem.js";
import { ContactForm } from "../src/ui/ContactForm.js";
import { CameraController } from "../src/systems/CameraController.js";
import { RaycastManager } from "../src/systems/RaycastManager.js";

test("picking rejects a project moon hidden behind its opaque planet", () => {
  const canvas = {
    addEventListener() {},
    style: {},
    getBoundingClientRect: () => ({ left: 0, top: 0, width: 100, height: 100 }),
  };
  const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 100);
  camera.position.z = 10;
  camera.lookAt(0, 0, 0);
  camera.updateMatrixWorld();
  const mesh = new THREE.Mesh(
    new THREE.SphereGeometry(1),
    new THREE.MeshBasicMaterial(),
  );
  const moon = new THREE.Mesh(
    new THREE.SphereGeometry(0.2),
    new THREE.MeshBasicMaterial(),
  );
  moon.userData = {
    destination: "neptune",
    itemId: "project",
    type: "project",
  };
  moon.position.z = -2;
  moon.updateMatrixWorld();
  mesh.updateMatrixWorld();
  const picking = new RaycastManager(
    canvas,
    camera,
    [],
    {},
    { hover() {}, tooltip() {} },
  );
  picking.pointer.set(0, 0);
  picking.focused = { mesh, targets: [moon] };
  picking.update();
  assert.equal(picking.active?.itemId, undefined);
  moon.position.z = 2;
  moon.updateMatrixWorld();
  picking.update();
  assert.equal(picking.active.itemId, "project");
});

test("portfolio content has complete destinations and rejects duplicate item identities", () => {
  assert.equal(validatePortfolio(data), data);
  const invalid = structuredClone(data);
  invalid.projects.push({ ...invalid.projects[0] });
  assert.throws(() => validatePortfolio(invalid), /duplicate ID/);
  delete invalid.contact;
  assert.throws(() => validatePortfolio(invalid), /Missing portfolio section/);
});

test("camera framing fits both portrait and landscape without clipping the sphere", () => {
  for (const aspect of [0.45, 0.75, 1, 1.8, 2.4]) {
    const distance = fitDistance(8, 38, aspect, 0.66);
    const angle = Math.asin(8 / distance);
    assert.ok(angle < (38 * Math.PI) / 360);
    assert.ok(angle < Math.atan(Math.tan((38 * Math.PI) / 360) * aspect));
  }
  assert.ok(fitDistance(8, 38, 0.5) > fitDistance(8, 38, 1.8));
});

test("latitude/longitude markers remain on the planet at poles and the date line", () => {
  for (const [lat, lng] of [
    [90, 0],
    [-90, 120],
    [0, 180],
    [25, 50],
  ]) {
    assert.ok(Math.abs(latLng(lat, lng, 3).length() - 3) < 1e-10);
  }
  assert.equal(latLng(90, 0, 3).y, 3);
});

test("focus frames keep the selected body above the mobile sheet and beside the desktop panel", () => {
  const oldWidth = globalThis.innerWidth,
    oldHeight = globalThis.innerHeight;
  try {
    for (const [width, height] of [
      [390, 844],
      [682, 696],
      [1440, 900],
    ]) {
      globalThis.innerWidth = width;
      globalThis.innerHeight = height;
      const camera = new THREE.PerspectiveCamera(38, width / height, 0.1, 900);
      const planet = {
        id: "jupiter",
        position: new THREE.Vector3(10, 2, -6),
        focusRadius: 4.42,
      };
      const frame = CameraController.prototype.frame.call({ camera }, planet);
      camera.position.copy(frame.position);
      camera.lookAt(frame.target);
      camera.updateMatrixWorld(true);
      const right = new THREE.Vector3(1, 0, 0).applyQuaternion(
        camera.quaternion,
      );
      const up = new THREE.Vector3(0, 1, 0).applyQuaternion(camera.quaternion);
      const positions = [
        right,
        right.clone().negate(),
        up,
        up.clone().negate(),
      ];
      for (const direction of positions) {
        const projected = planet.position
          .clone()
          .addScaledVector(direction, planet.focusRadius)
          .project(camera);
        const x = ((projected.x + 1) * width) / 2,
          y = ((1 - projected.y) * height) / 2;
        assert.ok(y > 100, `Planet overlaps header at ${width}px`);
        assert.ok(
          y < (width <= 760 ? height * 0.48 : height - 60),
          `Planet overlaps bottom panel at ${width}px`,
        );
        assert.ok(
          x > 0 && x < (width <= 760 ? width : width - 440),
          `Planet overlaps side panel at ${width}px`,
        );
      }
    }
  } finally {
    globalThis.innerWidth = oldWidth;
    globalThis.innerHeight = oldHeight;
  }
});

test("Moon remains relative to Earth; pause and focus preserve orbital phase", () => {
  const makePlanet = (id, radius) => ({
    id,
    angle: 1,
    position: new THREE.Vector3(),
    config: { orbitRadius: radius, inclination: 0, speed: 0.1 },
  });
  const earth = makePlanet("earth", 8.5),
    moon = makePlanet("moon", 3.1);
  const orbits = new OrbitalSystem(new THREE.Scene(), [earth, moon]);
  orbits.update(1);
  assert.ok(Math.abs(moon.position.distanceTo(earth.position) - 3.1) < 1e-10);
  const position = earth.position.clone();
  orbits.paused = true;
  orbits.update(2);
  assert.deepEqual(earth.position, position);
  orbits.paused = false;
  orbits.focused = true;
  orbits.update(2);
  assert.deepEqual(earth.position, position);
});

test("untrusted links cannot execute scripts and local avatar assets are allowed", () => {
  assert.equal(safeURL("javascript:alert(1)"), "");
  assert.equal(safeURL("data:text/html,<script>"), "");
  assert.equal(
    safeURL("https://example.com/project"),
    "https://example.com/project",
  );
  assert.equal(safeAsset("/avatar.jpg"), "/avatar.jpg");
  assert.equal(safeAsset("//evil.example/avatar.jpg"), "");
  assert.equal(escapeHTML('<script>"&'), "&lt;script&gt;&quot;&amp;");
});

function formFixture() {
  const status = { textContent: "" },
    button = { disabled: false };
  const form = {
    callback: null,
    resetCount: 0,
    reportValidity: () => true,
    addEventListener(_name, callback) {
      this.callback = callback;
    },
    querySelector(selector) {
      return selector === ".form-status" ? status : button;
    },
    reset() {
      this.resetCount++;
    },
  };
  return { form, status, button };
}

test("contact preview is explicitly unsent; failed delivery retains input and successful delivery animates", async () => {
  const originalFormData = globalThis.FormData,
    originalFetch = globalThis.fetch;
  globalThis.FormData = class {
    *[Symbol.iterator]() {
      yield ["name", "Test"];
      yield ["email", "test@example.com"];
      yield ["message", "Hello"];
    }
  };
  let launches = 0,
    requests = 0;
  try {
    const demo = formFixture();
    globalThis.fetch = async () => {
      requests++;
      return { ok: false };
    };
    new ContactForm({ email: "", endpoint: "" }, () => launches++).bind(
      demo.form,
    );
    await demo.form.callback({ preventDefault() {} });
    assert.match(demo.status.textContent, /No message was sent/);
    assert.equal(requests, 0);
    assert.equal(launches, 0);
    const live = formFixture();
    new ContactForm(
      { endpoint: "https://example.com/contact" },
      () => launches++,
    ).bind(live.form);
    await live.form.callback({ preventDefault() {} });
    assert.equal(live.form.resetCount, 0);
    assert.equal(live.button.disabled, false);
    assert.equal(launches, 0);
    globalThis.fetch = async () => ({ ok: true });
    await live.form.callback({ preventDefault() {} });
    assert.equal(live.form.resetCount, 1);
    assert.equal(launches, 1);
  } finally {
    globalThis.FormData = originalFormData;
    globalThis.fetch = originalFetch;
  }
});
