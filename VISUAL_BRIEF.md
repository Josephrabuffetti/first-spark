# First Spark formation brief (v6)

## The implementation prompt

Act as a game art director, animation engineer, and skeptical QA reviewer. Improve the existing First Spark game without sacrificing its 60 discoveries, recipes, saves, zoom, mobile controls, or reduced-motion option.

The player must see matter becoming a recognizable astronomical object, rather than an image being replaced. Preserve an object's position, material identity, and silhouette through time. Use the existing cohesive AI artwork as materials, with a transparent cold-cloud asset that contains no pre-existing star.

Build a persistent continuous formation model. Start with a faint non-stellar energy seed. The first spark expands into diffuse material; cooling and hydrogen allow a cold gas cloud to gather. Gravity contracts the cloud around a progressively heating protostar. Only after that contraction should a distinct stellar surface and corona emerge as fusion ignites. Later, irregular disk material must visibly move into a rocky body. Keep the star distinct from the planet and move the camera gently toward the newly forming world. Atmosphere gathers gradually, an ocean spreads over the same rocky silhouette, and microbial coastal color appears progressively.

Never use a generic screen flash to stand in for formation. Never display a finished sun before the protostar stage. Never replace the star with a planet. Never use evenly spaced circles, dot spirals, abrupt scale changes, or a reveal card that conceals the process. All scene-changing discoveries and Universe/Planet view switches must interpolate from the exact currently displayed state, including during rapid consecutive discoveries. Ordinary molecular recipes must not restart or flash the cosmic scene.

Use a short readable formation status and progress indicator. Major transitions should provide multiple visibly different stages over roughly 2–4 seconds. Keep input usable during them. Reduced motion must give a coherent final scene immediately. Cancel obsolete effects on reset/import. Existing saves should load into their correct settled state, without replaying old discoveries.

Implement objective tests for intermediate values, frame continuity, retargeting, normal-motion browser progression, input races, saves, reduced motion, desktop/mobile layout, and maximum-zoom performance. Capture actual intermediate frames and ask an independent reviewer to inspect them and run tests. Fix significant findings and repeat the affected checks.

## Independent review rubric

| Category | Points |
| --- | ---: |
| Temporal continuity | 30 |
| Recognizable, physically motivated formation | 20 |
| Composition and cohesive art | 15 |
| Usability, zoom, accessibility | 15 |
| Correctness, saves, rapid input | 10 |
| Performance and mobile behavior | 10 |

A hard star/planet swap, broken primary control, save loss, runtime error, or critical mobile overlap is a blocking defect. Scores are editorial judgments, not objective proof of perfection. The reviewer must report deductions and limitations honestly, without raising the score to satisfy a target.

## Scope

This patch focuses on visual formation and testing. A year counter, random planetary events, species evolution, and triggered volcanic eruptions remain the next simulation patch in ROADMAP.md. Science remains a compressed game interpretation, not a literal real-time origin-of-the-universe simulation.
