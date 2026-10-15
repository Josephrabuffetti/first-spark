# v7 review: moving formation and planetary history

October 15, 2026. This patch follows the formation brief in VISUAL_BRIEF.md and adds the requested next simulation update. A separate AI reviewer inspected the implementation, ran independent browser checks, and reported defects without a target score.

## Delivered behavior

- Visible gas streams move inward, independently moving cloud wisps change the silhouette, and faster orbital fragments gather into a planet. Major formation sequences last 4–6 seconds. Watch formation replays the latest transformation while preserving the current view. Enable animations explicitly turns off reduced motion when the player requests it.
- Planetary history advances in 1,000-year steps, manually or every eight visible, unblocked seconds. Running time starts paused after reload; menus and hidden tabs pause elapsed time. Existing discoveries are preserved.
- Eligible random events arrive every 3,000 years: volcanic eruptions, meteors, rain, blooms, and quieter ages. Effects include a volcanic cone/caldera, lava and ejecta, meteor trails, rainfall, and bloom patches. Environmental values and the latest 20 events persist.
- Four microbial lineages unlock from discoveries, time, minerals, and oxygenation. Oxygenation requires cyanobacteria. The timeline is explicitly fictional and compressed.
- Watch world opens planet exploration with its own year and time controls, so the player can see events while advancing time.

## Review fixes

The independent reviewer caught overly broad oxygen production, an unbounded reduced-motion effect, replay restoring a stale camera pose, and stale event messages after resetting/importing worlds. All were fixed. Mobile exploration controls were checked and the planet moved lower to clear the clock panel. Vitals now separate labels from numbers.

Independent browser regressions verified mobile clock advancement to Year 3,000, volcano-event reset cleanup, and star discovery → Focus → replay preserving the focused center within one pixel. No runtime exceptions occurred in those checks.

## Validation

- `npm test`: 60 discoveries and 56 recipes reachable; continuous intermediate formation/retargeting; deterministic events, bounds, lineage prerequisites, legacy saves, invalid import fields, oxygen prerequisites, and year cap.
- `npm run test:browser`: full recipe progression, legacy saves, reload, exploration, pan, zoom, reduced motion, mobile overflow, and runtime checks.
- `npm run test:animation`: seven normal-motion formation/camera sequences plus input, completion, reduced-motion, accessibility, and mobile regressions. Headless CPU Canvas2D max-zoom result: p95 draw CPU 0.9 ms; p95 actual draw interval 18.3 ms; full backing resolution.
- `npm run test:world`: timeline unlock, four lineages at 12,000 years with prerequisites, persisted history, paused reload, motion replay, all five event effects, mobile HUD, menu pause/resume, and reset cleanup.

## Limits

The event graphics are temporary; their metrics/history persist, but terrain is not permanently deformed. The lineage system is a first conditional adaptation model, not open-ended species simulation. No claim of perfection is made. Physical phones and hardware GPUs were not tested; the previous forced-SwiftShader compositor limitation remains relevant. The original AI-generated materials are reused; additional movement and event illustrations are drawn at runtime.
