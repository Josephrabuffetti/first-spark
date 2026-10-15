# First Spark

A cosmic discovery game: combine ingredients to turn a first spark into stars, a rocky world, and a living ocean.

Play: https://josephrabuffetti.github.io/first-spark/

## v7 · See things form

Scene changes now use a persistent formation model rather than switching between a seed, cloud, star, and planet renderer. Cold gas contracts into a visibly warming protostar, fusion gradually reveals a stellar surface, and irregular disk fragments converge into a separate rocky body. The star remains visible as the camera follows the new world. Atmosphere, ocean material, and microbial coastal color interpolate on the same globe.

Major changes take roughly 2–4 seconds, have readable progress, and postpone discovery overlays until the formation is visible. Rapid subsequent discoveries retarget from the displayed state rather than restarting. Unrelated molecular recipes do not flash or restart the cosmic scene. Reduced motion settles immediately. Existing saves load settled; reset/import cancel obsolete visual effects.

The implementation brief and review criteria are in [VISUAL_BRIEF.md](VISUAL_BRIEF.md). Testing and independent critique results are recorded in [VISUAL_REVIEW.md](VISUAL_REVIEW.md).

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
- `npm run test:animation`: normal-motion captures of six formation sequences, rapid progression, reduced-motion completion, accessible status, mobile layout, and instrumented desktop rendering. `ANIMATION_DIR` selects the capture folder. The PNG difference check only confirms changing frames; formation quality requires the recorded visual review, not just a checksum.
- `npm install`, `npx playwright install chromium`, `npm run test:browser`: actual controls for all 56 recipes, a legacy save, the new pathways panel, zoom, exploration, save reload, reduced motion, mobile overflow, and screenshot review. `CHROMIUM_PATH`, `TEST_PORT`, and `SCREENSHOT_DIR` optionally select a browser executable, port, and screenshot folder.

## Source and hosting

GitHub Pages serves `main`. Publish HTML, CSS, JavaScript, `icon.svg`, and `assets/` together. Assets are hosted locally to the site. Progress is stored per browser and origin; export it before changing origin or clearing browser data. The local Node server is only a convenience.

Recipes are simplified game abstractions, not laboratory instructions or a proven pathway to the origin of life. [ROADMAP.md](ROADMAP.md) records the requested next patch; years, random planetary events, species evolution, and eruptions are not simulated in v5.

## Living-world update

After creating a planet, use **Watch world** to enter exploration, then advance 1,000 years or run time. Five event types change environmental values; four microbial lineages appear when discoveries and conditions allow. Years and history are saved, and running time always starts paused on reload. Oxygenation requires cyanobacteria. Timelines are fictional and compressed.

**Watch formation** replays the last material transformation. If reduced motion is active, the control says **Enable animations** and changes that setting only when clicked. Major formation sequences last 4–6 seconds, with moving gas streams, separate cloud wisps, and orbiting fragments.

Run `npm run test:world` for timeline, events, lineage, persistence, replay, and menu-pause browser checks. See [V7_REVIEW.md](V7_REVIEW.md) for this patch's review.
