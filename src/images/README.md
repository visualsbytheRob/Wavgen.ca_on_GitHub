# Wavgen.ca Image Gallery Structure

This folder contains page-specific images for the Wavgen.ca portfolio site.
Each section has its own folder, and images are automatically loaded into Eleventy collections.

## Folder Structure

```
src/images/
├── home/               → collections.homeImages (hero backgrounds, featured)
│
├── art/
│   ├── painting/       → collections.paintingImages
│   ├── drawing/        → collections.drawingImages
│   ├── modelling/      → collections.modellingImages
│   └── printing/       → collections.printingImages
│
├── music/
│   ├── electro/        → collections.electroImages
│   ├── ambient/        → collections.ambientImages
│   ├── melodic/        → collections.melodicImages
│   └── breaks/         → collections.breaksImages
│
├── video/
│   ├── realtime/       → collections.realtimeImages
│   ├── mapping/        → collections.mappingImages
│   ├── mixing/         → collections.mixingImages
│   └── editing/        → collections.editingImages
│
└── data/
    ├── webdev/         → collections.webdevImages
    ├── cloud/          → collections.cloudImages
    ├── genai/          → collections.genaiImages
    └── coding/         → collections.codingImages
```

## Image Guidelines

- **Format**: WebP preferred, JPEG/PNG acceptable
- **Size**: Target 100-200KB per image for optimal load times
- **Dimensions**: 1200-1920px wide recommended for galleries
- **Naming**: Use descriptive names (e.g., `toronto-skyline-01.webp`)

## Usage in Templates

```njk
{# Loop through painting images on the painting page #}
{% for img in collections.paintingImages %}
  <img src="{{ img.url }}" alt="{{ img.fileSlug }}" class="gallery-img">
{% endfor %}
```

## Adding Images

1. Drop images into the appropriate folder
2. Restart the dev server (`npm run dev`)
3. Images are automatically available in the corresponding collection

## Image Metadata (Coming Soon)

A future `imageMetadata.json` will support:
- AI-generated descriptions
- Prompts used for generation
- Tags and categories
- Storyweave narrative connections
