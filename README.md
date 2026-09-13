# My Universe

An interactive solar system portfolio built with Vite, vanilla JavaScript, Three.js, GSAP, and custom GLSL. No CSS framework.

## Run

- `npm install`
- `npm run dev`
- `npm run build` creates the static production site in `dist`.
- `npm run preview` serves the production build.
- `npm test` checks navigation mathematics, content invariants, and URL handling.

## Personalize

Edit `src/data/portfolio.json`. All biography, work, projects, certifications, and skills are illustrative samples, explicitly marked in the UI. Set `demo` to false only after replacing them with your own information. Keep IDs unique within each collection. Configure project and certificate URLs to reveal their link buttons. Skill `years` values determine band sizes and progress bars.

The contact form sends JSON `{ name, email, message }` to `contact.endpoint` when configured. Your endpoint must validate submissions, protect against abuse, and return a success status only after accepting the message. No delivery backend or credentials are included. With only `contact.email`, the form opens an email draft. With neither, it provides an explicitly unsent preview. Particle launch occurs only after an endpoint returns success.

## Interaction

- Drag to rotate, wheel/pinch to zoom, click a planet or destination button to focus.
- Select career craters, project moons, certificate rings/gems, skill bands, and personal pins; the same items are available in HTML panels.
- Escape closes details first, then returns to the overview.
- Pause stops ambient movement. Reduced-motion preferences disable flights and ambient motion by default.
- List view offers an alternate navigation surface. If WebGL initialization fails, this view becomes the fallback.

## Architecture

Planet classes live in `src/planets`, shaders in `src/shaders`, camera/orbit/picking/lifecycle systems in `src/systems`, and DOM interfaces in `src/ui`. Shared surface shaders use object-space procedural noise; no large image textures are required. Earth uses stylized procedural continents rather than geographically accurate mapping. Fonts load from Google Fonts with system font fallbacks.

Desktop budgets: 8,000 stars, DPR ≤1.75, shared geometry where appropriate, no shadow maps or postprocessing. Mobile: 3,000 stars, DPR ≤1.25, reduced sphere resolution and a bottom-sheet interface. Sustained slow frames lower DPR to 1.

Deployment is static. A configured external contact endpoint must permit the deployed origin. The repository does not contain any secrets.

## Exploration upgrade

The guided tour is visitor-paced and can be exited at any point. Sound starts off and is generated locally with Web Audio, without external audio requests. Visiting all six destinations unlocks an explorer-log message. Share routes use `#/earth` and `#/neptune/spacetracker`; unknown destinations are ignored. Progress is session-only.

### Replace sample stories

Keep `demo: true` until the sample companies, credentials and experience have been replaced. Each project supports optional `image` (local asset path), `role`, `year`, `challenge`, `approach` and `outcome` fields. Put real screenshots in `public/` and reference them with a leading slash. Empty optional fields stay hidden. Skills link to projects by matching stack names.

### Contact delivery

Set `contact.email` for an email-app draft, or `contact.endpoint` for an HTTPS JSON POST accepting `name`, `email`, `message`. The receiver must validate input, rate-limit requests, and return success only after accepting delivery. Never put API secrets in portfolio.json. Until a real recipient or endpoint is supplied, the form explicitly remains an unsent demo. Contact details are not saved in browser storage.

### Release checks

Run build and tests; verify first-visit intro, rapid destination changes, browser Back/Forward, project share links, tour exit, audio off/hidden tab, keyboard navigation, portrait layouts and reduced motion on target devices before a public launch. Real project imagery/content and contact delivery require owner-provided data.
