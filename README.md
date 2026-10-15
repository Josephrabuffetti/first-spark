# First Spark

A cosmic discovery game: combine ingredients to turn a first spark into stars, a rocky world, and a living ocean.

Play: https://josephrabuffetti.github.io/first-spark/

## v5 · Original AI art and the chemistry of life

The old borrowed artwork has been replaced by a cohesive generated set: a quiet indigo nebula, a fictional basalt world, an ocean world with original geography, and flowing golden stellar plasma. The opening uses a soft energy wisp instead of a tiny dot, hard sphere, or geometric spiral. Atmosphere, lighting, coastal microbial color, and movement are drawn by the game. See [ART_DIRECTION.md](ART_DIRECTION.md) for the asset paths, generation mode, and prompts.

There are now **60 discoveries and 56 recipes**. The 20 new discoveries include nitrogen, phosphate, sulfur, ammonia, amino acids, peptides, proteins, sugars, nucleobases, nucleosides, nucleotides, RNA, DNA, enzymes, ATP, metabolism, biofilms, membrane transport, carbon dioxide, and fermentation.

**Life pathways** in the collection shows four paths, progress, prerequisite clues, and buttons to prepare recipes when both ingredients are available. Original recipes, item IDs, and v1 save format are preserved; old 40-discovery saves can continue directly into the expansion.

Zoom − / + and Reset are visible from the first screen. Focus view hides the creation field for a closer look. Drag to pan and scroll to zoom in Focus or Explore mode. Escape returns to creating. Once a planet exists, Explore your planet opens discovery notes. Reduced motion remains available.

## Play locally

Open `index.html` in a modern browser, or run `npm start` and visit http://127.0.0.1:4173. No runtime dependencies, build step, backend, or API key are needed. Development-only Playwright is used by the optional browser checks.

Click two ingredients and Merge, or drag one field orb into another. Ingredients are reusable. Hints first offer a clue, then prepare a pairing. The journal includes recipe and science notes. The living ocean remains Chapter One's milestone; the extra chemistry can be explored before or after completion.

## Validation

- `npm test`: recipe uniqueness, all 60 discoveries reachable, science notes, and preservation of the original 40-item progression.
- `node --check game.js`: syntax.
- `npm install`, `npx playwright install chromium`, `npm run test:browser`: actual controls for all 56 recipes, a legacy save, the new pathways panel, zoom, exploration, save reload, reduced motion, mobile overflow, and screenshot review. `CHROMIUM_PATH`, `TEST_PORT`, and `SCREENSHOT_DIR` optionally select a browser executable, port, and screenshot folder.

## Source and hosting

GitHub Pages serves `main`. Publish HTML, CSS, JavaScript, `icon.svg`, and `assets/` together. Assets are hosted locally to the site. Progress is stored per browser and origin; export it before changing origin or clearing browser data. The local Node server is only a convenience.

Recipes are simplified game abstractions, not laboratory instructions or a proven pathway to the origin of life. [ROADMAP.md](ROADMAP.md) records the requested next patch; years, random planetary events, species evolution, and eruptions are not simulated in v5.
