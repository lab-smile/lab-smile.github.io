# Shared content data

These files are the single source of truth for site content, shared by root
and `legacy/`. Both render from them at runtime — nothing here is copied,
generated, or forked. `legacy/` (the archived UF-era site at `/legacy/`) reads
the same files via `../data/`; there is no separate `legacy/data/`.

Records render in array order. Image paths are repository-root-relative
(`img/gallery/example.jpg`); never write `../` into a JSON value, the renderers
add the prefix they need.

| File | Rendered by | Shape |
| --- | --- | --- |
| `publications.json` | `js/publications.js`, `js/research-dynamic.js` (patents only), `legacy/js/publications.js` | see CLAUDE.md |
| `softwares.json` | `js/software.js`, `legacy/js/software.js` | `year`, `type`, `title`, `description`, `citation`, `links[]` |
| `news.json` | `js/news.js`, `legacy/js/content.js` | `date`, `content_html` |
| `highlights.json` | `js/news.js`, `legacy/js/content.js` | `date`, `image`, `url`, `content_html` |
| `grants.json` | `js/research-dynamic.js`, `legacy/js/content.js` | `year`, `title_html`, `details_html`, `links[]` |
| `projects.json` | `js/research-dynamic.js`, `legacy/js/content.js` | `title_html`, `image`, `image_alt`, `details_html`, `links[]` |
| `gallery.json` | `js/gallery.js`, `legacy/js/content.js` | `image`, `full_image`, `alt`, `caption_html` |

`*_html` fields hold inline HTML and are inserted verbatim — keep the markup
minimal and well-formed.

## links

`links` is an array of `{ "label": "...", "url": "..." }`. Entries in
`projects.json` carry an extra `slot`, a holdover from the old UF layout
(`legacy/js/content.js` still reads it: `"overlay"` is the magnifier over the
funder logo, `"meta"` a heading link under the project title). The live site's
`js/research-dynamic.js` ignores `slot` and renders every link as a chip,
de-duplicated by URL.

## Patents

There is no `patents.json`. Patents are the `"type": "Patents"` records inside
`publications.json`; `js/research-dynamic.js` filters them out at runtime and
turns `external_links` into a `links` array.
