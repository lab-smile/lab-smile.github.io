#!/usr/bin/env bash
set -euo pipefail

script_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
redesign_dir="$(cd "${script_dir}/.." && pwd)"
repo_dir="$(cd "${redesign_dir}/.." && pwd)"
data_dir="${redesign_dir}/data"

mkdir -p "${data_dir}"

# Content data is NOT copied here: both sites read the shared JSON in the
# repo-root data/ directory. Only the default site's page markup is snapshotted,
# because Vanderbilt mirrors its prose sections (team, teaching, media,
# openings, genealogy, contact) verbatim through canonical-sync.js.
cp "${repo_dir}/index.html" "${data_dir}/default-content.html"
cp "${repo_dir}/js/genealogy-tree.js" "${redesign_dir}/js/genealogy-tree.js"

echo "Refreshed default-site markup snapshot in ${data_dir}"
