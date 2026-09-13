import { escapeHTML as e, safeURL, safeAsset } from "../utils/spatial.js";
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
    const share = document.createElement("button");
    share.className = "chip modal-share";
    share.textContent = "Copy link";
    share.addEventListener("click", async () => {
      try { await navigator.clipboard.writeText(location.href); share.textContent = "Link copied"; }
      catch { share.textContent = "Copy the browser address"; }
    });
    this.element.querySelector(".modal-inner").append(share);
  }
  open(title, eyebrow, body) {
    this.element.querySelector("h2").textContent = title;
    this.element.querySelector(".modal-eyebrow").textContent = eyebrow;
    this.element.querySelector(".modal-body").innerHTML = body;
    this.element.querySelector(".modal-share").textContent = "Copy link";
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
      `${safeAsset(p.image || "") ? `<img class="case-image" src="${e(safeAsset(p.image))}" alt="${e(p.name)} project preview" loading="lazy" />` : ""}<p>${e(p.description)}</p><div class="case-facts">${[ ["Role",p.role], ["Year",p.year] ].filter(([,value]) => value).map(([label,value]) => `<div><small>${label}</small><strong>${e(value)}</strong></div>`).join("")}</div>${[["The challenge", p.challenge], ["The approach", p.approach], ["The outcome", p.outcome]].filter(([,value]) => value).map(([title,value]) => `<section class="case-section"><h3>${title}</h3><p>${e(value)}</p></section>`).join("")}<div class="tags">${p.stack.map((s) => `<span>${e(s)}</span>`).join("")}</div><div class="modal-links">${links.map(([label, url]) => `<a href="${e(safeURL(url))}" target="_blank" rel="noopener noreferrer">${label} ↗</a>`).join("") || '<p class="section-note">Project links will appear when configured.</p>'}</div>`,
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
