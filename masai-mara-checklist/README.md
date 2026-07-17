# Masai Mara Field Checklist

A standalone, installable, offline-first web app for ticking off wildlife and
birds during a Masai Mara trip. No build step, no framework, no external
requests — every picture is a generated inline SVG and every fact is baked
into the page, so it keeps working with the phone in airplane mode.

## Running it

Any static file server works, e.g.:

```
cd masai-mara-checklist
python3 -m http.server 8080
# or: npx serve .
```

Then open `http://localhost:8080`. To actually test offline behaviour, load
the page once (so the service worker installs), then turn on airplane mode
and reload.

To use it on a phone in the Mara: host it anywhere (GitHub Pages, Netlify,
a spare S3 bucket, etc.), open it once over camp wifi, then tap
"Add to Home Screen" from the browser share menu. From then on it opens like
a native app with no connection required.

## What's in here

- `data.js` — 62 species (mammals, primates, reptiles, birds) with a fact,
  habitat note, and rough rarity rating each.
- `icons.js` — a small generative SVG engine that draws a distinct "field
  badge" illustration per species from simple shapes (no image files, so
  nothing to fetch and nothing to break offline).
- `app.js` — checklist state (localStorage), filters/search/sort, a personal
  sighting log (time, note, GPS tag, your own photo), Big Five tracker with
  a confetti celebration, export/import backup, and a share-summary button.
- `sw.js` / `manifest.webmanifest` — offline caching and "install to home
  screen" support.

## Ideas for next time

- Multi-trip mode (separate lists per safari/date).
- A simple day-by-day journal alongside the species log.
- "Achievements" (e.g. first predator, all birds in a family, full Big Five).
- QR-code export so a travel companion can import your spotted list onto
  their own phone without any signal.
- A packed reference panel of Great Migration timing by month.
