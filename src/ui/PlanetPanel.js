import { escapeHTML as e, safeURL, safeAsset } from "../utils/spatial.js";
import { categoryColors } from "../sceneConfig.js";
export class PlanetPanel {
  constructor(data, onItem, onContact) {
    this.data = data;
    this.onItem = onItem;
    this.onContact = onContact;
    this.element = document.querySelector("#planet-panel");
    this.content = this.element.querySelector(".panel-content");
    this.element.addEventListener("click", (event) => {
      const button = event.target.closest("[data-item]");
      if (button)
        this.onItem({
          destination: this.current.id,
          type: button.dataset.type,
          itemId: button.dataset.item,
        });
    });
  }
  show(config) {
    this.current = config;
    this.element.style.setProperty("--planet-color", config.color);
    this.element.querySelector(".panel-eyebrow").textContent =
      `${config.index} / ${config.name.toUpperCase()}`;
    this.element.querySelector("h2").textContent = config.section;
    this.element.querySelector(".panel-description").textContent =
      config.description;
    this.content.innerHTML = this.render(config.id);
    this.element.classList.add("open");
    this.element.inert = false;
    this.element.setAttribute("aria-hidden", "false");
    if (config.id === "moon")
      this.onContact(this.content.querySelector("form"));
  }
  hide() {
    this.element.classList.remove("open");
    this.element.inert = true;
    this.element.setAttribute("aria-hidden", "true");
  }
  select(id) {
    this.content
      .querySelectorAll("[data-item]")
      .forEach((el) => el.classList.toggle("selected", el.dataset.item === id));
    const details = this.content.querySelector(
      `[data-detail="${CSS.escape(id)}"]`,
    );
    if (details) {
      details.open = true;
      details.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }
  }
  filter(category) {
    this.content
      .querySelectorAll("[data-category]")
      .forEach(
        (el) => (el.hidden = category && el.dataset.category !== category),
      );
    this.content
      .querySelectorAll('[data-type="ring"]')
      .forEach((el) =>
        el.classList.toggle("selected", el.dataset.item === category),
      );
  }
  render(id) {
    const d = this.data;
    switch (id) {
      case "mars":
        return `<div class="timeline">${d.workExperience.map((job, i) => `<details data-detail="${e(job.id)}" ${i === 0 ? "open" : ""}><summary><span class="period">${e(job.period)}</span><strong>${e(job.company)}</strong><span>${e(job.role)}</span><i>↗</i></summary><ul>${job.achievements.map((a) => `<li>${e(a)}</li>`).join("")}</ul></details>`).join("")}</div>`;
      case "neptune":
        return d.projects
          .map(
            (p, i) =>
              `<button class="project-card" data-item="${e(p.id)}" data-type="project"><span class="project-art art-${i}" aria-hidden="true"><span>${["◎", "ƒ", "✳"][i % 3]}</span><small>EXPERIMENT / 0${i + 1}</small></span><span class="project-title">${e(p.name)} <span>↗</span></span><span class="project-desc">${e(p.description)}</span><span class="tags">${p.stack.map((s) => `<span>${e(s)}</span>`).join("")}</span></button>`,
          )
          .join("");
      case "saturn":
        return `<div class="category-filters"><button class="chip" data-type="ring" data-item="">All</button>${Object.entries(
          categoryColors,
        )
          .map(
            ([category, color]) =>
              `<button class="chip" style="--chip:${color}" data-type="ring" data-item="${category}">${category}</button>`,
          )
          .join(
            "",
          )}</div>${d.certifications.map((c) => `<button class="cert-card" data-item="${e(c.id)}" data-type="cert" data-category="${e(c.ringCategory)}"><span class="cert-icon" style="color:${categoryColors[c.ringCategory]}">✧</span><span><small>${e(c.issuer)}</small><strong>${e(c.name)}</strong><span>${e(c.year)} · ${e(c.ringCategory)}</span></span><span>↗</span></button>`).join("")}`;
      case "jupiter":
        return `<p class="section-note">Experience, measured in years of making.</p>${d.skills.map((s) => `<button class="skill-card" data-item="${e(s.id)}" data-type="skill"><span class="skill-heading"><strong>${e(s.category)}</strong><span>${e(s.years ?? "—")} years</span></span><span class="skill-track"><span style="width:${Math.min(100, ((s.years || 0) / 8) * 100)}%;background:${s.bandColor}"></span></span><span class="tags">${s.items.map((item) => `<span>${e(item)}</span>`).join("")}</span></button>`).join("")}<p class="section-note">The storm at the heart of it all: creative development.</p>`;
      case "earth":
        return `<div class="avatar">${d.identity.avatar && safeAsset(d.identity.avatar) ? `<img src="${e(safeAsset(d.identity.avatar))}" alt="${e(d.identity.name)}" />` : e(d.identity.initials)}</div><h3>Hello, I'm ${e(d.identity.name)}.</h3><p class="bio">${e(d.about.bio)}</p><p class="bio muted">${e(d.about.note)}</p><h4>BEYOND THE SCREEN</h4><div class="interest-list">${d.about.interests.map((item) => `<button class="chip" data-type="pin" data-item="${e(item.id)}">${e(item.label)} ↗</button>`).join("")}</div><h4>LANGUAGES</h4><div class="interest-list">${d.about.languages.map((item) => `<button class="chip" data-type="pin" data-item="${e(item.id)}">${e(item.label)}</button>`).join("")}</div>`;
      case "moon":
        return `<p class="bio">Have an idea, an opportunity, or a good space fact? I'd love to hear it.</p><form id="contact-form"><label>Your name<input name="name" autocomplete="name" placeholder="Ground control" required maxlength="100" /></label><label>Email address<input name="email" type="email" autocomplete="email" placeholder="you@yourworld.com" required maxlength="254" /></label><label>Your message<textarea name="message" rows="4" placeholder="Let's make something together…" required maxlength="5000"></textarea></label><button class="send-button" type="submit">${d.contact.endpoint ? "Send transmission" : d.contact.email ? "Open email draft" : "Preview transmission"} <span>↗</span></button><p class="form-status" role="status"></p></form><div class="social-links">${Object.entries(
          d.contact.socials,
        )
          .filter(([, url]) => safeURL(url))
          .map(
            ([name, url]) =>
              `<a href="${e(safeURL(url))}" target="_blank" rel="noopener noreferrer">${e(name)} ↗</a>`,
          )
          .join(
            "",
          )}</div>${!d.contact.email && !d.contact.endpoint ? '<p class="section-note">Demo mode · Contact delivery has not been configured.</p>' : ""}`;
      default:
        return "";
    }
  }
}
