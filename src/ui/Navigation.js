import { destinations } from "../sceneConfig.js";
export function shell(data) {
  document.querySelector("#app").innerHTML = `
 <div id="loading" role="status"><div class="loading-orbit"><span></span></div><p>Initializing solar system…</p><small>0%</small></div>
 <canvas id="universe" aria-label="Interactive solar system. Use the destination navigation to explore each planet."></canvas>
 <div class="vignette" aria-hidden="true"></div>
 <header class="site-header"><button class="wordmark" id="home" aria-label="Return to universe overview"><span class="brand-icon">✳</span> MY UNIVERSE<span class="brand-period">.</span></button><span class="header-caption">A PERSONAL EXPLORATION</span><button id="contact-shortcut" class="contact-shortcut"><span class="status-dot"></span> Let's connect <span>↗</span></button></header>
 <main><div class="intro" id="intro"><p class="eyebrow"><span></span> WELCOME TO MY CORNER OF THE COSMOS</p><h1>A world of work.<br/>A universe of <em>possibilities.</em></h1><p>Developer. Maker. Perpetually curious.<br/>Pick a planet. Get to know my world.</p></div>
 <div class="scene-coordinate" aria-hidden="true"><span>SYS. 001</span><span>THE PERSONAL SOLAR SYSTEM</span><span>∞ POSSIBILITIES</span></div>
 <div id="identity-label"><span class="identity-caption">THE CENTER OF IT ALL</span><strong></strong><span class="identity-tagline"></span></div>
 <div id="labels"></div><div id="tooltip" role="tooltip" hidden></div>
 <button id="back" class="back-button" hidden>← <span>Back to universe</span><kbd>ESC</kbd></button>
 <aside id="planet-panel" aria-labelledby="panel-title" aria-hidden="true" inert><div class="panel-topline"><span class="panel-eyebrow"></span><button class="panel-close" aria-label="Close planet">×</button></div><h2 id="panel-title" tabindex="-1"></h2><p class="panel-description"></p><div class="panel-content"></div><div class="panel-footer">PART OF A BIGGER PICTURE <span>✳</span></div></aside>
 <div class="bottom-interface"><div class="explore-heading"><span>CHOOSE YOUR DESTINATION</span><span class="explore-count">06 WORLDS TO EXPLORE</span></div><nav id="navigation" aria-label="Portfolio destinations">${destinations.map((p) => `<button class="destination" data-destination="${p.id}" style="--planet-color:${p.color}"><span class="nav-orb orb-${p.id}"></span><span><strong>${p.name}</strong><small>${p.section}</small></span><span class="nav-index">${p.index}</span></button>`).join("")}</nav><footer><span class="interaction-hint"><span>↔</span> Drag to orbit <i>·</i> Scroll to explore <i>·</i> Click to discover</span><span class="footer-right"><span class="demo-badge">SAMPLE UNIVERSE</span><button id="motion-toggle" aria-pressed="false">Ⅱ <span>Pause orbits</span></button><button id="view-toggle">List view</button></span></footer></div>
 <section id="list-view" hidden aria-label="Portfolio list view"><div class="list-heading"><p class="eyebrow">YOUR UNIVERSE, AT A GLANCE</p><h2>Every world has a story.</h2><p>Choose a destination to explore.</p></div><div class="list-grid">${destinations.map((p) => `<button data-destination="${p.id}" style="--planet-color:${p.color}"><span>${p.index} / ${p.name}</span><h3>${p.section}</h3><p>${p.description}</p><strong>Explore ${p.name} ↗</strong></button>`).join("")}</div></section>
 </main><dialog id="detail-modal" aria-labelledby="modal-title"><div class="modal-inner"><button class="modal-close" aria-label="Close details">×</button><p class="modal-eyebrow"></p><h2 id="modal-title"></h2><div class="modal-body"></div></div></dialog><div id="announcer" class="sr-only" aria-live="polite"></div>`;
  document.querySelector("#identity-label strong").textContent =
    data.identity.name;
  document.querySelector(".identity-tagline").textContent =
    data.identity.tagline;
  document.querySelector(".demo-badge").hidden = !data.demo;
  if (data.demo)
    document.querySelector(".panel-footer").firstChild.textContent =
      "SAMPLE CONTENT · YOUR STORY GOES HERE ";
}
