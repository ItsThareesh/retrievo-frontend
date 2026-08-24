# PWA Assets

Icons and splash screens are generated with [`pwa-asset-generator`](https://github.com/onderceylan/pwa-asset-generator). The source logo is `public/lighthouse.svg` (kept untouched - it's the single source of truth).

## Icons (scripted)

```bash
npm run generate:pwa-assets
```

This regenerates the three icon PNGs in `public/icons/` and merges the icon entries into `public/manifest.json`. The manifest is the tool's output, so don't hand-edit the `icons` array - `start_url`, `theme_color`, and `background_color` are preserved across runs.

- `public/icons/manifest-icon-192.maskable.png` (192×192, `any` + `maskable`)
- `public/icons/manifest-icon-512.maskable.png` (512×512, `any` + `maskable`)
- `public/icons/apple-icon-180.png` (180×180)

## Splash screens (manual)

Splash PNGs are generated separately (they're large and only change when the logo changes):

```bash
npx pwa-asset-generator public/lighthouse.svg public/splash \
  --splash-only --portrait-only --background "#FFFFFF" --type png --opaque --scrape false \
  --padding "15%"
```

- `--padding "15%"` shrinks the logo slightly (default is `10%`). Tune it: larger = smaller logo.
- White background matches the navbar/`background_color` for a seamless launch.
- Portrait-only because the app is mobile-first; add `--landscape-only` if you also need landscape.
- Filenames are based on device dimensions, so the `<link>` tags below stay valid even after regenerating.

The generated PNGs go in `public/splash/` (currently 20 portrait sizes).

## Apple launch `<link>` tags

Copy these into the `<head>` of `app/layout.tsx` (they tell iOS which splash to show per device). These are already present in `layout.tsx` - keep them in sync if you change the splash set.

```html
<link rel="apple-touch-startup-image" href="/splash/apple-splash-2048-2732.png" media="(device-width: 1024px) and (device-height: 1366px) and (-webkit-device-pixel-ratio: 2) and (orientation: portrait)" />
<link rel="apple-touch-startup-image" href="/splash/apple-splash-1668-2388.png" media="(device-width: 834px) and (device-height: 1194px) and (-webkit-device-pixel-ratio: 2) and (orientation: portrait)" />
<link rel="apple-touch-startup-image" href="/splash/apple-splash-1536-2048.png" media="(device-width: 768px) and (device-height: 1024px) and (-webkit-device-pixel-ratio: 2) and (orientation: portrait)" />
<link rel="apple-touch-startup-image" href="/splash/apple-splash-1640-2360.png" media="(device-width: 820px) and (device-height: 1180px) and (-webkit-device-pixel-ratio: 2) and (orientation: portrait)" />
<link rel="apple-touch-startup-image" href="/splash/apple-splash-1668-2224.png" media="(device-width: 834px) and (device-height: 1112px) and (-webkit-device-pixel-ratio: 2) and (orientation: portrait)" />
<link rel="apple-touch-startup-image" href="/splash/apple-splash-1620-2160.png" media="(device-width: 810px) and (device-height: 1080px) and (-webkit-device-pixel-ratio: 2) and (orientation: portrait)" />
<link rel="apple-touch-startup-image" href="/splash/apple-splash-1488-2266.png" media="(device-width: 744px) and (device-height: 1133px) and (-webkit-device-pixel-ratio: 2) and (orientation: portrait)" />
<link rel="apple-touch-startup-image" href="/splash/apple-splash-1320-2868.png" media="(device-width: 440px) and (device-height: 956px) and (-webkit-device-pixel-ratio: 3) and (orientation: portrait)" />
<link rel="apple-touch-startup-image" href="/splash/apple-splash-1206-2622.png" media="(device-width: 402px) and (device-height: 874px) and (-webkit-device-pixel-ratio: 3) and (orientation: portrait)" />
<link rel="apple-touch-startup-image" href="/splash/apple-splash-1260-2736.png" media="(device-width: 420px) and (device-height: 912px) and (-webkit-device-pixel-ratio: 3) and (orientation: portrait)" />
<link rel="apple-touch-startup-image" href="/splash/apple-splash-1290-2796.png" media="(device-width: 430px) and (device-height: 932px) and (-webkit-device-pixel-ratio: 3) and (orientation: portrait)" />
<link rel="apple-touch-startup-image" href="/splash/apple-splash-1179-2556.png" media="(device-width: 393px) and (device-height: 852px) and (-webkit-device-pixel-ratio: 3) and (orientation: portrait)" />
<link rel="apple-touch-startup-image" href="/splash/apple-splash-1170-2532.png" media="(device-width: 390px) and (device-height: 844px) and (-webkit-device-pixel-ratio: 3) and (orientation: portrait)" />
<link rel="apple-touch-startup-image" href="/splash/apple-splash-1284-2778.png" media="(device-width: 428px) and (device-height: 926px) and (-webkit-device-pixel-ratio: 3) and (orientation: portrait)" />
<link rel="apple-touch-startup-image" href="/splash/apple-splash-1125-2436.png" media="(device-width: 375px) and (device-height: 812px) and (-webkit-device-pixel-ratio: 3) and (orientation: portrait)" />
<link rel="apple-touch-startup-image" href="/splash/apple-splash-1242-2688.png" media="(device-width: 414px) and (device-height: 896px) and (-webkit-device-pixel-ratio: 3) and (orientation: portrait)" />
<link rel="apple-touch-startup-image" href="/splash/apple-splash-828-1792.png" media="(device-width: 414px) and (device-height: 896px) and (-webkit-device-pixel-ratio: 2) and (orientation: portrait)" />
<link rel="apple-touch-startup-image" href="/splash/apple-splash-1242-2208.png" media="(device-width: 414px) and (device-height: 736px) and (-webkit-device-pixel-ratio: 3) and (orientation: portrait)" />
<link rel="apple-touch-startup-image" href="/splash/apple-splash-750-1334.png" media="(device-width: 375px) and (device-height: 667px) and (-webkit-device-pixel-ratio: 2) and (orientation: portrait)" />
<link rel="apple-touch-startup-image" href="/splash/apple-splash-640-1136.png" media="(device-width: 320px) and (device-height: 568px) and (-webkit-device-pixel-ratio: 2) and (orientation: portrait)" />
```

> The `apple-touch-icon` and `apple-mobile-web-app-capable` tags are emitted automatically by Next.js from the `icons.apple` and `appleWebApp` fields in `app/layout.tsx`'s `metadata` - no need to paste those manually.

## Theme color

`theme_color` in `public/manifest.json` is set to the light navbar color (`#f1f1f1`), and `app/layout.tsx` additionally exports a `viewport` with per-scheme `themeColor` (`#f1f1f1` light, `#171717` dark) so the Android app bar follows the navbar. On iOS the status bar uses `appleWebApp.statusBarStyle: "black-translucent"` (translucent, content shows through).
