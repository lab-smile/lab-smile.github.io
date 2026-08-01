# redesign/data

Content data does **not** live here. It lives in the repo-root `data/`
directory and is shared by both sites — see `data/README.md`.

This directory holds one generated file:

- `default-content.html` — a snapshot of the root `index.html`, refreshed by
  `redesign/scripts/refresh-content-snapshot.sh`. `canonical-sync.js` reads it
  to mirror the prose-only sections (team, teaching, media, openings,
  genealogy, contact, research overview) that have no JSON representation.

Do not hand-edit it. Edit the root `index.html`, then re-run the refresh script.
