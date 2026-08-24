#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

LOGO="public/lighthouse.svg"
ICONS_DIR="public/icons"
MANIFEST="public/manifest.json"
BG="#FFFFFF"
PAG="./node_modules/.bin/pwa-asset-generator"

rm -rf "$ICONS_DIR"
mkdir -p "$ICONS_DIR"

# Manifest icons - the tool updates public/manifest.json (src, sizes, purpose).
"$PAG" "$LOGO" "$ICONS_DIR" \
  --icon-only --background "$BG" --type png --opaque \
  --scrape false --maskable true --padding "10%" \
  --manifest "$MANIFEST" --path-override "/icons"

echo "Generated $(ls "$ICONS_DIR" | wc -l | tr -d ' ') icon files and updated $(basename "$MANIFEST")."
