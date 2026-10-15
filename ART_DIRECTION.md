# First Spark v5 artwork

Generation mode: built-in `image_gen` tool, four separate text-to-image requests, no external reference images. No API/CLI fallback. Source PNGs were generated for this project and preserved in the working session; optimized WebP derivatives are committed with the game.

## Shipped paths and use

| Path | Use |
| --- | --- |
| `assets/ai-nebula.webp` | Background and soft stellar nursery |
| `assets/ai-rocky.webp` | Barren planetary surface |
| `assets/ai-ocean.webp` | Fictional ocean-world surface |
| `assets/ai-stellar.webp` | Stellar plasma and softly masked opening energy wisp |

Only image resizing and WebP compression were applied for delivery. Sphere projection, cloud cover, lighting, and coastal microbial color are runtime game rendering, not baked-in alterations to the source art.

## Prompts

### Nebula

Use case: stylized-concept. Asset type: wide seamless-feeling background for First Spark, a refined cosmic discovery game. Create an exquisite painterly cinematic deep-space vista, wide landscape 3:2. Very dark midnight indigo and near-black, soft wisps of luminous teal and muted lavender cosmic dust concentrated along the upper right, a few tiny delicate stars. Keep the left half and bottom third mostly dark and quiet for readable UI. Elegant premium indie-game atmosphere, subtle filmic light, beautiful fluid organic cloud structure. Restrained luminosity and saturation, not a colorful stock galaxy photo. No sun, planet, large star, rings, geometric spirals, text, letters, logos, borders, grid, watermark, UI, frames.

### Rocky world

Use case: stylized-concept. Asset type: equirectangular planetary surface texture for a sphere in the First Spark cosmic discovery game. Generate a flat rectangular 2:1 world map of an entirely fictional barren basalt planet, with rich midnight-slate volcanic rock, subtle copper mineral veins, weathered ridges, and dark crater basins. All terrain, no water, no clouds, no vegetation. Sophisticated painterly realism, intricate but restrained, harmonious indigo and warm slate palette. Uniform diffuse lighting across the whole map, no cast shadows, no globe or circular silhouette. The left and right edges should visually tile. Top and bottom are polar regions. Full bleed surface texture only, no space background, no perspective, no labels, no text, no grid, no border, no icons.

### Ocean world

Use case: stylized-concept. Asset type: equirectangular planetary surface texture for a sphere in First Spark, a premium cosmic discovery game. Generate a flat rectangular 2:1 world map of an entirely fictional ocean planet. Vast deep indigo and teal oceans, elegant irregular slate and jade archipelagos, delicate turquoise coastal shelves, subtle mountain ranges and pale mineral shorelines. Original geography that does not resemble Earth. No vegetation or forests, no cities, no clouds. Sophisticated painterly realism and detailed organic terrain; restrained dark indigo, teal, cool stone, tiny warm copper highlights. Uniform diffuse lighting throughout, no baked shadows. Left and right edges should visually tile. Full bleed map texture, no globe or circle silhouette, no perspective, no space background, no text, labels, grid, border, symbols.

### Stellar plasma

Use case: stylized-concept. Asset type: equirectangular stellar energy surface texture for a sphere in the First Spark cosmic discovery game. A full-bleed flat rectangular 2:1 texture of amber and pale golden plasma, flowing luminous convection cells, delicate darker copper filaments and curling fluid energy. Painterly cinematic sophistication, soft warm gold with fine physical detail, luminous and restrained rather than neon orange. No white overexposure, no recognizable solar photograph. Uniform all-over surface detail, left and right edges should visually tile. No sphere or circle, no perspective, no black background, no text, no labels, no border, no grid, no UI.
