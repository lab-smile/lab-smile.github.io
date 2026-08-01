#!/usr/bin/env bash
#
# sync-redesign-to-root.sh
#
# Promotes the canonical redesign/ source to the repo root (what GitHub Pages
# serves). redesign/ pages live one level below root and reach shared media
# assets (img/, CV_Fang.pdf, ...) and the shared content data (data/*.json) via
# "../". At root, "../" would point above the repo, so this script strips that
# prefix from the copied files.
#
# data/ is NOT copied: it already lives at the repo root and is the single
# source of truth for both sites. The JS resolves it at runtime, so no rewrite
# is needed there either.
#
# redesign/ is NEVER modified — it stays canonical with "../" intact.
# This script makes NO git changes. Review the diff, then commit yourself.
#
# Usage:  ./scripts/sync-redesign-to-root.sh

set -euo pipefail

# Resolve repo root (parent of this script's dir) regardless of cwd.
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
SRC="$ROOT/redesign"

if [[ ! -d "$SRC" ]]; then
  echo "error: $SRC not found" >&2
  exit 1
fi

# sed -i is non-portable: BSD/macOS needs '' arg, GNU/Linux does not.
sed_inplace() {
  if sed --version >/dev/null 2>&1; then
    sed -i "$@"          # GNU
  else
    sed -i '' "$@"       # BSD/macOS
  fi
}

echo "Syncing redesign/ -> root ..."

# 1. Copy HTML pages to root.
cp "$SRC"/*.html "$ROOT"/

# 2. Copy css/, js/, and components/ (overwrites root copies of same-named
#    files). redesign/js/genealogy-tree.js is a copy of the root file kept in
#    sync by redesign/scripts/refresh-content-snapshot.sh, so overwriting the
#    root one with it is a no-op.
mkdir -p "$ROOT/css" "$ROOT/js" "$ROOT/components"
cp "$SRC"/css/* "$ROOT/css/"
cp "$SRC"/js/* "$ROOT/js/"
cp "$SRC"/components/* "$ROOT/components/"

# 3. Strip "../" from the copied HTML (root is one level up from redesign/).
#    CDN https:// links have no "../"; CSS holds only data-URI url() (no "../").
#    JS is left alone: it derives its own prefix from window.location at runtime.
for f in "$ROOT"/*.html "$ROOT"/components/*.html; do
  [[ -f "$f" ]] && sed_inplace 's|\.\./||g' "$f"
done

html_count=$(ls "$SRC"/*.html | wc -l | tr -d ' ')
echo "Done. Synced $html_count HTML pages + css/js/components, stripped ../ paths at root."
echo "Review with 'git status' / 'git diff', then commit when ready."
