# Shared content data

These files are the single source of truth for site content. Both the default
single-page site at the repo root and the `redesign/` Vanderbilt build render
from them at runtime — nothing here is copied or generated.

Records render in array order. Image paths are repository-root-relative
(`img/gallery/example.jpg`); never write `../` into a JSON value, the renderers
add the prefix they need.

| File | Rendered by | Shape |
| --- | --- | --- |
| `publications.json` | root `js/publications.js`, `redesign/js/publications.js` | see CLAUDE.md |
| `softwares.json` | root `js/software.js`, `redesign/js/software.js` | `year`, `type`, `title`, `description`, `citation`, `links[]` |
| `news.json` | root `js/content.js`, `redesign/js/news.js` | `date`, `content_html` |
| `highlights.json` | root `js/content.js`, `redesign/js/news.js` | `date`, `image`, `url`, `content_html` |
| `grants.json` | root `js/content.js`, `redesign/js/canonical-sync.js` | `year`, `title_html`, `details_html`, `links[]` |
| `projects.json` | root `js/content.js`, `redesign/js/canonical-sync.js` | `title_html`, `image`, `image_alt`, `details_html`, `links[]` |
| `gallery.json` | root `js/content.js`, `redesign/js/gallery.js` | `image`, `full_image`, `alt`, `caption_html` |

`*_html` fields hold inline HTML and are inserted verbatim — keep the markup
minimal and well-formed.

## links

`links` is an array of `{ "label": "...", "url": "..." }`. Entries in
`projects.json` carry an extra `slot` telling the default site's layout where
the link belongs:

- `"slot": "overlay"` — the magnifier over the funder logo
- `"slot": "meta"` — a heading link under the project title (e.g. "Project Page")

`redesign/` ignores `slot` and renders every link as a chip, de-duplicated by
URL.

## Patents

There is no `patents.json`. Patents are the `"type": "Patents"` records inside
`publications.json`; `redesign/js/canonical-sync.js` filters them out at
runtime and turns `external_links` into a `links` array.
