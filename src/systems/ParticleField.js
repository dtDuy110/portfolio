import * as THREE from "three";
import gsap from "gsap";
export class ParticleField {
  constructor(scene, quality) {
    this.pointer = new THREE.Vector2();
    const positions = new Float32Array(quality.stars * 3),
      colors = new Float32Array(quality.stars * 3),
      sizes = new Float32Array(quality.stars);
    for (let i = 0; i < quality.stars; i++) {
      const r = 110 + Math.random() * 280,
        theta = Math.random() * Math.PI * 2,
        z = Math.random() * 2 - 1,
        s = Math.sqrt(1 - z * z);
      positions.set(
        [r * s * Math.cos(theta), r * z, r * s * Math.sin(theta)],
        i * 3,
      );
      const brightness = 0.25 + Math.random() * 0.65;
      colors.set([brightness, brightness * 0.94, brightness * 0.88], i * 3);
      sizes[i] = Math.random() < 0.03 ? 2.4 : Math.random() * 1.2 + 0.35;
    }
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));
    geometry.setAttribute("aSize", new THREE.BufferAttribute(sizes, 1));
    this.material = new THREE.ShaderMaterial({
      uniforms: {
        uPointer: { value: this.pointer },
        uDpr: { value: quality.dpr },
      },
      vertexShader:
        "attribute float aSize; varying vec3 vColor; uniform vec2 uPointer; uniform float uDpr; void main(){vColor=color;vec4 p=modelViewMatrix*vec4(position,1.);p.xy+=uPointer*35./max(abs(p.z),20.);gl_Position=projectionMatrix*p;gl_PointSize=aSize*uDpr;}",
      fragmentShader:
        "varying vec3 vColor;void main(){float d=length(gl_PointCoord-.5);gl_FragColor=vec4(vColor,smoothstep(.5,.08,d));}",
      vertexColors: true,
      transparent: true,
      depthWrite: false,
    });
    this.points = new THREE.Points(geometry, this.material);
    this.points.frustumCulled = false;
    scene.add(this.points);
    this.streak = new THREE.Line(
      new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(),
        new THREE.Vector3(6, 2, 0),
      ]),
      new THREE.LineBasicMaterial({
        color: "#b4cce9",
        transparent: true,
        opacity: 0,
      }),
    );
    scene.add(this.streak);
    this.next = 8 + Math.random() * 10;
    this.elapsed = 0;
  }
  update(delta, enabled) {
    if (!enabled) return;
    this.elapsed += delta;
    if (this.elapsed > this.next) {
      this.elapsed = 0;
      this.next = 9 + Math.random() * 15;
      this.streak.position.set(
        -40 + Math.random() * 50,
        15 + Math.random() * 20,
        -20,
      );
      gsap.fromTo(
        this.streak.material,
        { opacity: 0 },
        { opacity: 0.7, duration: 0.35, yoyo: true, repeat: 1 },
      );
      gsap.to(this.streak.position, { x: "+=18", y: "-=9", duration: 0.7 });
    }
  }
}
