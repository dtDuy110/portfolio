import * as THREE from "three";

export function createFlightPath(start, end, obstacles = []) {
  let lift = Math.max(5, start.distanceTo(end) * 0.42);
  let curve;
  for (let attempt = 0; attempt < 12; attempt++) {
    const a = start.clone().lerp(end, 0.18);
    const b = start.clone().lerp(end, 0.72);
    a.y += lift;
    b.y += lift;
    curve = new THREE.CatmullRomCurve3(
      [start.clone(), a, b, end.clone()],
      false,
      "centripetal",
    );
    const blocked = curve
      .getPoints(160)
      .some((point) =>
        obstacles.some(
          ({ position, radius }) => point.distanceTo(position) < radius,
        ),
      );
    if (!blocked) return curve;
    lift *= 1.45;
  }
  return curve;
}
