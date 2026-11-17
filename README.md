# Krillion · KSEA edition

A tiny, hardcoded parody of the Krillion daily game, made as an ad for KSEA at USC. Two prompts, no backend, no database. Rarer answers sink deeper.

## Run

```
npm install
npm run dev
```

Open http://localhost:3000.

## Poster

Put your poster at `public/poster.png`, then set `POSTER_SRC` to `"/poster.png"` in `src/lib/game.ts`. Until then the results page shows an empty placeholder box.

## Deploy

Push the repo to GitHub, import it in Vercel, and keep the defaults.

## Credits

Krillion is created by its original author and lives at https://krillion.io. This project is an unofficial fan parody made as a KSEA advertisement. The game concept, design and look are credited to Krillion. All artwork in this repo was drawn from scratch; no assets were copied from krillion.io.

Fonts are Press Start 2P and VT323 from Google Fonts (OFL), self-hosted via next/font.
