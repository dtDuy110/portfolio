import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import gsap from "gsap";
import { fitDistance } from "../utils/spatial.js";
export class CameraController {
  constructor(camera, canvas, quality) {
    this.camera = camera;
    this.quality = quality;
    this.controls = new OrbitControls(camera, canvas);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.06;
    this.controls.enablePan = false;
    this.controls.minPolarAngle = 0.3;
    this.controls.maxPolarAngle = Math.PI * 0.48;
    this.controls.minDistance = 15;
    this.controls.maxDistance = 160;
    this.controls.rotateSpeed = 0.55;
    this.target = new THREE.Vector3();
    this.overview();
  }
  overview() {
    const distance = fitDistance(32, this.camera.fov, this.camera.aspect, 0.92);
    this.camera.position.set(0, distance * 0.68, distance * 0.74);
    this.controls.target.set(0, 0, 0);
    this.camera.lookAt(0, 0, 0);
    this.controls.update();
  }
  frame(planet) {
    const mobile = innerWidth <= 760;
    const rect = mobile
      ? {
          x: 0,
          y: 100,
          width: innerWidth,
          height: Math.max(120, innerHeight * 0.48 - 100),
        }
      : {
          x: 0,
          y: 130,
          width: innerWidth - Math.min(440, innerWidth * 0.36),
          height: innerHeight - 190,
        };
    const tangent = Math.tan(THREE.MathUtils.degToRad(this.camera.fov / 2));
    const coverage = planet.id === "neptune" ? 0.88 : 0.74;
    const angle = Math.min(
      Math.atan(((tangent * rect.height) / innerHeight) * coverage),
      Math.atan(
        ((tangent * this.camera.aspect * rect.width) / innerWidth) * coverage,
      ),
    );
    const distance = planet.focusRadius / Math.sin(angle);
    const direction = new THREE.Vector3(0.2, 0.38, 1).normalize();
    const right = new THREE.Vector3()
      .crossVectors(new THREE.Vector3(0, 1, 0), direction)
      .normalize();
    const up = new THREE.Vector3().crossVectors(direction, right).normalize();
    const centerX = ((rect.x + rect.width / 2) / innerWidth) * 2 - 1;
    const centerY = 1 - ((rect.y + rect.height / 2) / innerHeight) * 2;
    const target = planet.position
      .clone()
      .addScaledVector(
        right,
        -centerX * distance * tangent * this.camera.aspect,
      )
      .addScaledVector(up, -centerY * distance * tangent);
    const position = target.clone().addScaledVector(direction, distance);
    return { position, target };
  }
  fly(planet, onComplete) {
    if (!this.focused && !this.saved) {
      this.saved = {
        position: this.camera.position.clone(),
        target: this.controls.target.clone(),
      };
    }
    this.focused = planet;
    const frame = this.frame(planet);
    this.controls.minDistance = planet.radius * 1.7;
    this.controls.maxDistance = frame.position.distanceTo(frame.target) * 2.5;
    this.animate(frame.position, frame.target, 2.6, onComplete);
  }
  back(onComplete) {
    this.focused = null;
    this.controls.minDistance = 15;
    this.controls.maxDistance = 160;
    const saved = this.saved || {
      position: new THREE.Vector3(0, 65, 72),
      target: new THREE.Vector3(),
    };
    this.animate(saved.position, saved.target, 2.2, () => {
      this.saved = null;
      onComplete?.();
    });
  }
  animate(end, target, duration, onComplete) {
    this.tween?.kill();
    this.controls.enabled = false;
    const start = this.camera.position.clone(),
      look = this.controls.target.clone();
    const clearance = Math.max(7, start.distanceTo(end) * 0.18);
    const a = start.clone().lerp(end, 0.32);
    a.y += clearance;
    const b = start.clone().lerp(end, 0.76);
    b.y += clearance * 0.5;
    const curve = new THREE.CatmullRomCurve3(
      [start, a, b, end],
      false,
      "centripetal",
    );
    const progress = { t: 0 };
    const journey = this.journey;
    this.journey = null;
    this.tween = gsap.to(progress, {
      t: 1,
      duration: this.quality.reduced ? 0.01 : duration,
      ease: "power2.inOut",
      onUpdate: () => {
        journey?.(progress.t);
        this.camera.position.copy(curve.getPointAt(progress.t));
        this.controls.target.copy(look).lerp(target, progress.t);
        if (journey && this.visitor && !this.quality.reduced) {
          const weight = Math.sin(Math.PI * progress.t) * 0.32;
          this.controls.target.lerp(this.visitor.group.position, weight);
        }
        this.camera.lookAt(this.controls.target);
      },
      onComplete: () => {
        this.controls.enabled = true;
        this.controls.update();
        onComplete?.();
      },
    });
  }
  resize() {
    if (this.tween?.isActive()) this.tween.progress(1);
    this.camera.aspect = innerWidth / innerHeight;
    this.camera.updateProjectionMatrix();
    if (this.focused) {
      const frame = this.frame(this.focused);
      this.animate(frame.position, frame.target, 0.3);
      const distance = fitDistance(
        32,
        this.camera.fov,
        this.camera.aspect,
        0.92,
      );
      this.saved = {
        position: new THREE.Vector3(0, distance * 0.68, distance * 0.74),
        target: new THREE.Vector3(),
      };
    } else {
      this.overview();
      this.saved = null;
    }
  }
  update() {
    if (this.controls.enabled) this.controls.update();
  }
}
