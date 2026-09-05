import * as THREE from "three";
import vertexShader from "../shaders/planet.vert?raw";
import fragment from "../shaders/planet.frag?raw";
import atmosphere from "../shaders/atmosphere.frag?raw";
import ring from "../shaders/saturn-ring.frag?raw";
import noise from "./noise.glsl?raw";
export function surface(kind, color) {
  return new THREE.ShaderMaterial({
    vertexShader,
    fragmentShader: fragment.replace("#include <noise>", noise),
    uniforms: {
      uTime: { value: 0 },
      uKind: { value: kind },
      uColor: { value: new THREE.Color(color) },
      uDim: { value: 1 },
      uHover: { value: 0 },
    },
  });
}
export function atmosphereMaterial(color) {
  return new THREE.ShaderMaterial({
    vertexShader,
    fragmentShader: atmosphere,
    uniforms: {
      uTime: { value: 0 },
      uColor: { value: new THREE.Color(color) },
      uDim: { value: 1 },
    },
    transparent: true,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    side: THREE.BackSide,
  });
}
export function ringMaterial(color) {
  return new THREE.ShaderMaterial({
    vertexShader,
    fragmentShader: ring,
    uniforms: {
      uColor: { value: new THREE.Color(color) },
      uDim: { value: 1 },
      uHover: { value: 0 },
    },
    transparent: true,
    side: THREE.DoubleSide,
    depthWrite: false,
  });
}
export function glowTexture() {
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = 128;
  const ctx = canvas.getContext("2d");
  const gradient = ctx.createRadialGradient(64, 64, 0, 64, 64, 64);
  gradient.addColorStop(0, "rgba(255,226,158,1)");
  gradient.addColorStop(0.18, "rgba(255,182,82,.7)");
  gradient.addColorStop(0.45, "rgba(245,119,37,.15)");
  gradient.addColorStop(1, "rgba(200,90,20,0)");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 128, 128);
  return new THREE.CanvasTexture(canvas);
}
