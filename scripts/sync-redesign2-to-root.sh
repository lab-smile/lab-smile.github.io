#!/usr/bin/env bash
#
# sync-redesign2-to-root.sh
#
# Promotes the canonical redesign2/ source to the repo root (what GitHub Pages
# serves). redesign2/ pages live one level below root and reach shared assets
# (img/, publications.json, softwares.json, CV_Fang.pdf, ...) via "../". At root
# those "../" would point above the repo, so this script strips the "../" prefix
# from the copied files.
#
# redesign2/ is NEVER modified — it stays canonical with "../" intact.
# This script makes NO git changes. Review the diff, then commit yourself.
#
# Usage:  ./scripts/sync-redesign2-to-root.sh

set -euo pipefail

# Resolve repo root (parent of this script's dir) regardless of cwd.
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
SRC="$ROOT/redesign2"

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

echo "Syncing redesign2/ -> root ..."

# 1. Copy HTML pages to root.
cp "$SRC"/*.html "$ROOT"/

# 2. Copy css/, js/, components/ (overwrites root copies of same-named files).
#    NOTE: js/genealogy-tree.js is a SHARED root asset (referenced by
#    redesign2/genealogy.html as ../js/genealogy-tree.js). It is NOT in
#    redesign2/js/, so it is intentionally preserved at root by this copy.
mkdir -p "$ROOT/css" "$ROOT/js" "$ROOT/components"
cp "$SRC"/css/* "$ROOT/css/"
cp "$SRC"/js/* "$ROOT/js/"
cp "$SRC"/components/* "$ROOT/components/"

# 3. Strip "../" from the copied root files (root is one level up from redesign2/).
#    CDN https:// links have no "../"; CSS holds only data-URI url() (no "../").
for f in "$ROOT"/*.html "$ROOT"/components/*.html "$ROOT"/js/publications.js "$ROOT"/js/software.js; do
  [[ -f "$f" ]] && sed_inplace 's|\.\./||g' "$f"
done

html_count=$(ls "$SRC"/*.html | wc -l | tr -d ' ')
echo "Done. Synced $html_count HTML pages + css/js/components, stripped ../ paths at root."
echo "Review with 'git status' / 'git diff', then commit when ready."
