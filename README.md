# First Spark

A cozy browser discovery game. Combine ingredients to move from a fictional cosmic beginning to stars, a rocky planet, and a living microbial ocean.

Play online: https://josephrabuffetti.github.io/first-spark/

## Illustrated universe and visible zoom (v4)

The observatory now uses locally hosted nebula art by Rawdanitsu (CC0) and Sun, Mars, Earth, and cloud textures by Solar System Scope / INOVE (CC BY 4.0). See [ASSET_CREDITS.md](ASSET_CREDITS.md) and **How to play → Artwork & credits**. No AI-generated assets are used.

The opening and early universe have textured cosmic artwork in place of geometric spirals. Planets use spherical texture projection, moving cloud cover, atmospheric scattering, and directional lighting. Earth and Mars imagery illustrates fictional developmental stages; it is not a reconstruction of early Earth.

**Zoom − / + and Reset are available from the first screen**, in every scene. **Focus view** hides the creation field for a closer look; drag to pan or scroll to zoom. Escape returns to creating. Once a planet exists, **Explore your planet** opens the world explorer and discovery notes. Existing v1 saves still load.

Validation: recipe graph, JavaScript syntax, all 36 combinations through actual Chromium controls, completion, save reload, zoom before any discovery, Focus/Escape, planet exploration, pan, reduced motion, and mobile horizontal overflow. Desktop and mobile screenshots inspected in Chromium.

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

`data.js` contains the ingredients and recipe graph. `game.js` contains pointer interactions, persistence, animations, and canvas art. `style.css` contains base styling and `experience.css` the v2 visual design. No packages or build tools are needed. Google Fonts is optional; system fonts work offline. Artwork is served locally; sounds are synthesized locally.

For browser checks, run `npm install`, `npx playwright install chromium`, then `npm run test:browser`. Set `CHROMIUM_PATH` to use an existing Chromium executable; optional `SCREENSHOT_DIR` controls where the six review screenshots go. The game itself still needs no dependencies or build step.

## Hosting later

The static files are hosted on GitHub Pages from `main`. Publish `index.html`, `style.css`, `experience.css`, `data.js`, `game.js`, and `icon.svg`, and `assets/` together at the same path. The Node server is only a local convenience. No backend or API keys are needed. Repository: https://github.com/Josephrabuffetti/first-spark

Progress is stored per browser and origin. Export progress before switching from a local file to localhost or a hosted version. Science recipes are simplified game abstractions, not a simulation of cosmic evolution or a proven origin-of-life pathway.

