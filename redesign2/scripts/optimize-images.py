#!/usr/bin/env python3
"""
Image Optimization Pipeline for SMILE Lab Website Redesign
Converts images to WebP format and generates thumbnails.
"""

import os
import json
import sys
from pathlib import Path

try:
    from PIL import Image
except ImportError:
    print("Pillow is required. Install with: pip install Pillow")
    sys.exit(1)

# Configuration
SOURCE_DIR = Path(__file__).resolve().parent.parent.parent / "img"
OPTIMIZED_DIR = Path(__file__).resolve().parent.parent / "img" / "optimized"
THUMBS_DIR = Path(__file__).resolve().parent.parent / "img" / "thumbs"
MANIFEST_PATH = Path(__file__).resolve().parent.parent / "img" / "manifest.json"

MAX_WIDTH = 1920
MAX_QUALITY = 80
THUMB_MAX = 400
THUMB_QUALITY = 75
TEAM_THUMB_SIZE = (300, 300)

SUPPORTED_EXTENSIONS = {".jpg", ".jpeg", ".png", ".gif", ".bmp", ".tiff", ".webp"}
TEAM_DIRS = {"lab", "personal"}


def optimize_image(src_path, dest_path, max_width, quality):
    """Convert and resize an image to WebP."""
    dest_path.parent.mkdir(parents=True, exist_ok=True)
    try:
        with Image.open(src_path) as img:
            if img.mode in ("RGBA", "LA") or (img.mode == "P" and "transparency" in img.info):
                img = img.convert("RGBA")
            else:
                img = img.convert("RGB")

            if img.width > max_width:
                ratio = max_width / img.width
                new_size = (max_width, int(img.height * ratio))
                img = img.resize(new_size, Image.LANCZOS)

            img.save(dest_path, "WEBP", quality=quality)
            return True
    except Exception as e:
        print(f"  ERROR processing {src_path}: {e}")
        return False


def create_thumbnail(src_path, dest_path, is_team=False):
    """Create a thumbnail, with optional square crop for team photos."""
    dest_path.parent.mkdir(parents=True, exist_ok=True)
    try:
        with Image.open(src_path) as img:
            if img.mode in ("RGBA", "LA") or (img.mode == "P" and "transparency" in img.info):
                img = img.convert("RGBA")
            else:
                img = img.convert("RGB")

            if is_team:
                # Center crop to square, then resize
                min_dim = min(img.width, img.height)
                left = (img.width - min_dim) // 2
                top = (img.height - min_dim) // 2
                img = img.crop((left, top, left + min_dim, top + min_dim))
                img = img.resize(TEAM_THUMB_SIZE, Image.LANCZOS)
            else:
                if img.width > THUMB_MAX:
                    ratio = THUMB_MAX / img.width
                    new_size = (THUMB_MAX, int(img.height * ratio))
                    img = img.resize(new_size, Image.LANCZOS)

            img.save(dest_path, "WEBP", quality=THUMB_QUALITY)
            return True
    except Exception as e:
        print(f"  ERROR creating thumbnail for {src_path}: {e}")
        return False


def main():
    if not SOURCE_DIR.exists():
        print(f"Source directory not found: {SOURCE_DIR}")
        sys.exit(1)

    OPTIMIZED_DIR.mkdir(parents=True, exist_ok=True)
    THUMBS_DIR.mkdir(parents=True, exist_ok=True)

    manifest = {}
    processed = 0
    skipped = 0
    errors = 0

    for src_path in sorted(SOURCE_DIR.rglob("*")):
        if not src_path.is_file():
            continue
        if src_path.suffix.lower() not in SUPPORTED_EXTENSIONS:
            continue

        rel_path = src_path.relative_to(SOURCE_DIR)
        webp_name = rel_path.with_suffix(".webp")

        opt_dest = OPTIMIZED_DIR / webp_name
        thumb_dest = THUMBS_DIR / webp_name

        # Skip if already processed (incremental)
        if opt_dest.exists() and opt_dest.stat().st_mtime > src_path.stat().st_mtime:
            skipped += 1
            manifest[str(rel_path)] = {
                "optimized": str(Path("img/optimized") / webp_name),
                "thumb": str(Path("img/thumbs") / webp_name),
            }
            continue

        print(f"Processing: {rel_path}")

        # Determine if this is a team photo
        is_team = any(part in TEAM_DIRS for part in rel_path.parts)

        ok1 = optimize_image(src_path, opt_dest, MAX_WIDTH, MAX_QUALITY)
        ok2 = create_thumbnail(src_path, thumb_dest, is_team=is_team)

        if ok1 and ok2:
            processed += 1
            manifest[str(rel_path)] = {
                "optimized": str(Path("img/optimized") / webp_name),
                "thumb": str(Path("img/thumbs") / webp_name),
            }
        else:
            errors += 1

    # Write manifest
    with open(MANIFEST_PATH, "w") as f:
        json.dump(manifest, f, indent=2)

    print(f"\nDone! Processed: {processed}, Skipped: {skipped}, Errors: {errors}")
    print(f"Manifest written to: {MANIFEST_PATH}")


if __name__ == "__main__":
    main()
