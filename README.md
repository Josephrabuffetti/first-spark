# First Spark

A cozy browser discovery game. Combine ingredients to move from a fictional cosmic beginning to stars, a rocky planet, and a living microbial ocean.

Play online: https://josephrabuffetti.github.io/first-spark/

## World explorer and motion upgrade (v3)

After creating a rocky planet, choose **Explore world**. Zoom from 100% to 350% with the buttons, mouse wheel, or + / − keys; drag the globe to pan. **Reset view** (or 0) returns to the overview, and Escape or **Back to creating** returns to the creation field. The creations strip shows only unlocked world features and opens their science notes. Camera position is temporary; existing v1 saves remain compatible.

New discoveries send a ripple through the scene, and planet surfaces blend over 1.8 seconds as oceans and microbial life appear. Volcanoes, ocean ripples, vent bubbles, and microbial shimmer add visible surface detail. The creation field charges during merges, ingredients ease into their slots, and discovery symbols bloom into view. Reduced motion keeps discoveries and camera controls immediate. A custom SVG spark-and-orbit icon serves as both the brand mark and favicon.

Validation: `npm test` and `node --check game.js` pass. A separate DOM interaction run exercised all 36 recipes, completion, saved progress, explorer entry/exit, zoom limits, feature selection, and reduced-motion drawing. Browser screenshot and real canvas rendering checks were unavailable in the implementation environment because Chromium downloads failed; these still need visual review on desktop and mobile.

## Previous visual and interaction upgrade (v2)

The observatory now has a central creation field, glowing ingredient orbs, a textured rotating planet, and atmospheric nebula lighting. Drag a collection ingredient into the field, then drop another onto it to merge. You can also drag the two field orbs together. Magnetic highlighting, collision animations, discovery reveals, and particle bursts celebrate successful combinations; unmatched pairs gently rebound. Click-and-Merge and keyboard controls remain available. Existing v1 saves remain compatible.

## Play

Open `index.html` directly in a modern browser. No installation or build is required. For a consistent browser-save origin, use Node.js and run `npm start`, then open http://127.0.0.1:4173.

Click two ingredient cards and choose **Merge**, or drag one ingredient onto another inside the creation field. Ingredients are reusable, including combining an ingredient with itself. Click a filled field slot to clear it. Hints first give a clue, then prepare a recipe on a second click.

## Included

- 40 discoveries and 36 recipes, all reachable from four starting ingredients.
- Procedural animated universe and planet, with four milestones.
- Universe/planet views, discovery filters, search, keyboard controls, and responsive layouts.
- Science notes distinguishing established science, open questions, and fiction.
- Browser saves, named worlds, export/import, optional synthesized sounds, reduced motion, and confirmed reset.
- A complete first chapter ending in a living microbial ocean; later civilizations are a future expansion.

## Development

`npm test` checks the discovery graph for completeness, unique recipes, and journal metadata. `node --check game.js` checks the main script syntax.

`data.js` contains the ingredients and recipe graph. `game.js` contains pointer interactions, persistence, animations, and canvas art. `style.css` contains base styling and `experience.css` the v2 visual design. No packages or build tools are needed. Google Fonts is optional; system fonts work offline. All illustrations and sounds are generated locally.

## Hosting later

The static files are hosted on GitHub Pages from `main`. Publish `index.html`, `style.css`, `experience.css`, `data.js`, `game.js`, and `icon.svg` together at the same path. The Node server is only a local convenience. No backend or API keys are needed. Repository: https://github.com/Josephrabuffetti/first-spark

Progress is stored per browser and origin. Export progress before switching from a local file to localhost or a hosted version. Science recipes are simplified game abstractions, not a simulation of cosmic evolution or a proven origin-of-life pathway.

