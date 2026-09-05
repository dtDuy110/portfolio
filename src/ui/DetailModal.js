import { escapeHTML as e, safeURL } from "../utils/spatial.js";
export class DetailModal {
  constructor() {
    this.element = document.querySelector("#detail-modal");
    this.element
      .querySelector(".modal-close")
      .addEventListener("click", () => this.close());
    this.element.addEventListener("click", (event) => {
      if (event.target === this.element) this.close();
    });
    this.element.addEventListener("close", () => this.onClose?.());
  }
  open(title, eyebrow, body) {
    this.element.querySelector("h2").textContent = title;
    this.element.querySelector(".modal-eyebrow").textContent = eyebrow;
    this.element.querySelector(".modal-body").innerHTML = body;
    this.element.showModal();
  }
  project(p) {
    const links = [
      ["Source code", p.github],
      ["Live project", p.live],
    ].filter(([, url]) => safeURL(url));
    this.open(
      p.name,
      "PERSONAL PROJECT",
      `<p>${e(p.description)}</p><div class="tags">${p.stack.map((s) => `<span>${e(s)}</span>`).join("")}</div><div class="modal-links">${links.map(([label, url]) => `<a href="${e(safeURL(url))}" target="_blank" rel="noopener noreferrer">${label} ↗</a>`).join("") || '<p class="section-note">Project links will appear when configured.</p>'}</div>`,
    );
  }
  cert(c) {
    this.open(
      c.name,
      "CERTIFICATION",
      `<p>${e(c.issuer)} · ${e(c.year)}</p><p>Category: ${e(c.ringCategory)}</p>${safeURL(c.badgeUrl) ? `<a class="text-link" href="${e(safeURL(c.badgeUrl))}" target="_blank" rel="noopener noreferrer">Verify credential ↗</a>` : '<p class="section-note">Sample credential. Replace it with your verified certification.</p>'}`,
    );
  }
  close() {
    this.element.close();
  }
  get isOpen() {
    return this.element.open;
  }
}
