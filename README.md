# First Spark

A cozy browser discovery game. Combine ingredients to move from a fictional cosmic beginning to stars, a rocky planet, and a living microbial ocean.

## Play

Open `index.html` directly in a modern browser. No installation or build is required. For a consistent browser-save origin, use Node.js and run `npm start`, then open http://127.0.0.1:4173.

Click two ingredient cards (or drag them into the cradle), then choose **Create**. Ingredients are reusable, including combining an ingredient with itself. Click a filled cradle slot to clear it. Hints first give a clue, then prepare a recipe on a second click.

## Included

- 40 discoveries and 36 recipes, all reachable from four starting ingredients.
- Procedural animated universe and planet, with four milestones.
- Universe/planet views, discovery filters, search, keyboard controls, and responsive layouts.
- Science notes distinguishing established science, open questions, and fiction.
- Browser saves, named worlds, export/import, optional synthesized sounds, reduced motion, and confirmed reset.
- A complete first chapter ending in a living microbial ocean; later civilizations are a future expansion.

## Development

`npm test` checks the discovery graph for completeness, unique recipes, and journal metadata. `node --check game.js` checks the main script syntax.

`data.js` contains the ingredients and recipe graph. `game.js` contains interactions, persistence, and canvas art. `style.css` contains responsive styling. No packages or build tools are needed. Google Fonts is optional; system fonts work offline. All illustrations and sounds are generated locally.

## Hosting later

The static files can be hosted on GitHub Pages. Publish `index.html`, `style.css`, `data.js`, and `game.js` together at the same path. The Node server is only a local convenience. No backend or API keys are needed. Repository: https://github.com/Josephrabuffetti/first-spark

Progress is stored per browser and origin. Export progress before switching from a local file to localhost or a hosted version. Science recipes are simplified game abstractions, not a simulation of cosmic evolution or a proven origin-of-life pathway.

