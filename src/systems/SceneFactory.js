import * as THREE from "three";
export function createScene(canvas, quality) {
  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: !quality.mobile,
    alpha: true,
    powerPreference: "high-performance",
  });
  renderer.setPixelRatio(quality.dpr);
  renderer.setSize(innerWidth, innerHeight);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.35;
  const scene = new THREE.Scene();
  scene.add(new THREE.AmbientLight("#b9cce7", 0.85));
  const fill = new THREE.DirectionalLight("#6bbbdc", 1.3);
  fill.position.set(10, 6, -15);
  scene.add(fill);
  const key = new THREE.DirectionalLight("#fff0d5", 2);
  key.position.set(-12, 20, 22);
  scene.add(key);
  const camera = new THREE.PerspectiveCamera(
    38,
    innerWidth / innerHeight,
    0.1,
    900,
  );
  return { renderer, scene, camera };
}
