# Chuyang Wei — research homepage

A compact, custom academic homepage. No framework or build step is required.

## Preview

```sh
python3 -m http.server 8792 --bind 127.0.0.1
```

Open http://127.0.0.1:8792. The homepage is `index.html`; the curated notes index is `notes/index.html`.

## Edit

- `index.html`: biography, research, projects, publications, education.
- `assets/profile/site.css`: layout, design tokens, responsive and dark themes.
- `assets/profile/site.js`: optional theme preference. All content and navigation work without JavaScript.
- `assets/profile/fonts/`: self-hosted DM Sans and Libre Caslon Display, with their SIL Open Font License files.

Older blog pages and their assets retain their original paths. The new homepage and notes index do not load the old theme, music player, counters, or third-party scripts.

## Verify

```sh
python3 scripts/check_site.py
node --check assets/profile/site.js
```

Browser QA covers desktop, tablet, mobile, navigation, theme persistence, and console errors.

## Deploy

GitHub Pages serves the repository root on `master`. Merge the redesign branch into `master` to publish. `.nojekyll` keeps these files as static assets.

## Content maintenance

Update the current-focus date and footer when reviewing the content. Add publication status only after confirming it. Keep a historical leaderboard result explicitly historical; current rankings can change.
