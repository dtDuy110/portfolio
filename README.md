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
