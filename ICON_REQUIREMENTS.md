# WeightWin Icon Assets

WeightWin now includes a baseline icon set generated programmatically to prevent missing favicon warnings. For production, please replace these placeholders with finalized brand assets that follow the guidelines below.

## Files & Locations

All icon assets live in the `public/` directory:

| File | Size | Purpose |
| --- | --- | --- |
| `favicon.ico` | 16×16, 32×32, 48×48 (multi-res) | Browser tabs, legacy support |
| `favicon-16x16.png` | 16×16 | Standard small favicon |
| `favicon-32x32.png` | 32×32 | Standard favicon |
| `apple-touch-icon.png` | 180×180 | iOS/iPadOS home screen icon |
| `android-chrome-192x192.png` | 192×192 | Android home screen / PWA |
| `android-chrome-512x512.png` | 512×512 | High-res Android / PWA |
| `site.webmanifest` | — | PWA metadata referencing icons |

## Design Guidelines

- **Concept:** Bold “W” monogram with subtle scale/health cues.
- **Primary color:** `#4F46E5` (Indigo).
- **Secondary color:** `#FFFFFF` (White).
- **Shape:** Rounded square background for modern look.
- **Contrast:** Ensure the glyph remains legible at 16×16.

## Recommended Generation Workflow

1. Create a 1024×1024 SVG or PNG master icon using Figma, Sketch, or similar.
2. Use a favicon generator (e.g., [RealFaviconGenerator](https://realfavicongenerator.net/), [favicon.io](https://favicon.io/)).
3. Replace the existing PNG/ICO files in `public/` with the generated versions.
4. Confirm filenames stay exactly the same.

## Verification Checklist

- [ ] `npm run dev` → no missing icon 404s in console.
- [ ] Browser tab displays branded favicon.
- [ ] Bookmark/favorites use the new icon.
- [ ] iOS “Add to Home Screen” shows the correct icon.
- [ ] Android/PWA install uses 192×192 and 512×512 assets.
- [ ] `site.webmanifest` references the updated icons.

## Notes

- The programmatically generated icons currently checked in are acceptable placeholders but should be replaced before final launch.
- Updating the PNG/ICO files does **not** require code changes (metadata already references the filenames above).

