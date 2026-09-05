import { Vector3 } from "three";
export function latLng(lat, lng, radius) {
  const phi = (lat * Math.PI) / 180,
    theta = (lng * Math.PI) / 180;
  return new Vector3(
    radius * Math.cos(phi) * Math.cos(theta),
    radius * Math.sin(phi),
    radius * Math.cos(phi) * Math.sin(theta),
  );
}
export function fitDistance(radius, fov, aspect, coverage = 0.66) {
  const vertical = (fov * Math.PI) / 360;
  const horizontal = Math.atan(Math.tan(vertical) * aspect);
  return radius / Math.sin(Math.min(vertical, horizontal)) / coverage;
}
export const escapeHTML = (value) =>
  String(value ?? "").replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        c
      ],
  );
export function safeURL(value) {
  try {
    const url = new URL(value);
    return ["https:", "http:"].includes(url.protocol) ? url.href : "";
  } catch {
    return "";
  }
}
export function safeAsset(value) {
  return typeof value === "string" && /^\/(?!\/)/.test(value)
    ? value
    : safeURL(value);
}
