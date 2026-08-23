#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

LOGO="public/lighthouse.svg"
ICONS_DIR="public/icons"
SPLASH_DIR="public/splash"
OG_IMAGE="public/og-image.png"
METADATA="lib/pwa-assets.generated.json"
BG="#FFFFFF"
PAG="./node_modules/.bin/pwa-asset-generator"

rm -rf "$ICONS_DIR" "$SPLASH_DIR"
mkdir -p "$ICONS_DIR" "$SPLASH_DIR"

# Standard manifest icons (purpose: any)
"$PAG" "$LOGO" "$ICONS_DIR" \
  --icon-only --background "$BG" --type png --opaque \
  --scrape false --maskable false --padding "10%"

# Maskable manifest icons (purpose: maskable)
"$PAG" "$LOGO" "$ICONS_DIR" \
  --icon-only --background "$BG" --type png --opaque \
  --scrape false --maskable true --padding "10%"

# Portrait splash screens
"$PAG" "$LOGO" "$SPLASH_DIR" \
  --splash-only --portrait-only --background "$BG" --type png --opaque \
  --scrape false

# Open Graph image (1200x630): white background + navy lighthouse
node -e "
const sharp = require('sharp');
const fs = require('fs');
const svg = fs.readFileSync('$LOGO');
(async () => {
  const logo = await sharp(svg, { density: 300 })
    .resize({ width: 1080, height: 567, fit: 'contain', background: { r: 255, g: 255, b: 255, alpha: 0 } })
    .png().toBuffer();
  await sharp({ create: { width: 1200, height: 630, channels: 3, background: '$BG' } })
    .composite([{ input: logo, gravity: 'center' }])
    .png().toFile('$OG_IMAGE');
})();
"

# Emit metadata consumed by app/manifest.ts and app/layout.tsx
node -e "
const fs = require('fs');
const threeX = new Set([1320, 1206, 1260, 1290, 1179, 1170, 1284, 1125, 1242]);
const toIcon = (file, purpose) => ({
  src: \`/icons/\${file}\`,
  sizes: file.match(/(\d+)/)[1] + 'x' + file.match(/(\d+)/)[1],
  type: 'image/png',
  ...(purpose ? { purpose } : {}),
});
const icons = [];
for (const f of fs.readdirSync('$ICONS_DIR')) {
  const m = f.match(/^manifest-icon-\d+(?:\.maskable)?\.png$/);
  if (m) icons.push(toIcon(f, f.includes('.maskable') ? 'maskable' : undefined));
}
const appleFile = fs.readdirSync('$ICONS_DIR').find((f) => /^apple-icon-180\.png\$/.test(f));
const appleTouchIcon = appleFile
  ? { src: \`/icons/\${appleFile}\`, sizes: '180x180', type: 'image/png' }
  : null;
const splash = [];
for (const f of fs.readdirSync('$SPLASH_DIR')) {
  const m = f.match(/^apple-splash-(\d+)-(\d+)\.png$/);
  if (m) splash.push({ src: \`/splash/\${f}\`, width: +m[1], height: +m[2], scaleFactor: threeX.has(+m[1]) ? 3 : 2 });
}
fs.writeFileSync('$METADATA', JSON.stringify({ background: '$BG', icons, appleTouchIcon, splash }, null, 2) + '\n');
"

echo "Generated $(ls "$ICONS_DIR" | wc -l | tr -d ' ') icon files, $(ls "$SPLASH_DIR" | wc -l | tr -d ' ') splash screens, og-image.png and $(basename "$METADATA")."
