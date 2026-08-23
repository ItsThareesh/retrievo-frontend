import { mkdir, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { generateImages } from "pwa-asset-generator";

const projectRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
);

const LOGO = path.join(projectRoot, "public", "lighthouse.svg");
const ICONS_DIR = path.join(projectRoot, "public", "icons");
const SPLASH_DIR = path.join(projectRoot, "public", "splash");
const METADATA_FILE = path.join(projectRoot, "lib", "pwa-assets.generated.json");

const BRAND_BACKGROUND = "#FFFFFF";

const sharedOptions = {
  type: "png",
  opaque: true,
  background: BRAND_BACKGROUND,
  scrape: false,
};

const publicUrl = (dir, fileName) =>
  `/${path.basename(dir)}/${path.basename(fileName)}`;

const toManifestIcon = (dir, image, extra = {}) => ({
  src: publicUrl(dir, image.path),
  sizes: `${image.width}x${image.height}`,
  type: "image/png",
  ...extra,
});

async function generateIcons() {
  const standard = await generateImages(LOGO, ICONS_DIR, {
    ...sharedOptions,
    iconOnly: true,
    maskable: false,
    padding: "10%",
  });
  const maskable = await generateImages(LOGO, ICONS_DIR, {
    ...sharedOptions,
    iconOnly: true,
    maskable: true,
    padding: "10%",
  });

  const manifestIcons = (run) =>
    run.savedImages
      .filter((image) => image.name.startsWith("manifest-icon"))
      .map((image) => toManifestIcon(ICONS_DIR, image));

  const appleTouchIcon = standard.savedImages
    .filter((image) => image.name.startsWith("apple-icon"))
    .map((image) => toManifestIcon(ICONS_DIR, image))
    .at(-1);

  return {
    icons: [
      ...manifestIcons(standard),
      ...manifestIcons(maskable).map((icon) => ({
        ...icon,
        purpose: "maskable",
      })),
    ],
    appleTouchIcon,
  };
}

async function generateSplashScreens() {
  const { savedImages } = await generateImages(LOGO, SPLASH_DIR, {
    ...sharedOptions,
    splashOnly: true,
    portraitOnly: true,
  });

  return savedImages.map(({ name, width, height, scaleFactor }) => ({
    src: publicUrl(SPLASH_DIR, `${name}.png`),
    width,
    height,
    scaleFactor,
  }));
}

async function main() {
  await Promise.all([
    rm(ICONS_DIR, { recursive: true, force: true }),
    rm(SPLASH_DIR, { recursive: true, force: true }),
  ]);

  const [{ icons, appleTouchIcon }, splash] = [
    await generateIcons(),
    await generateSplashScreens(),
  ];

  await mkdir(path.dirname(METADATA_FILE), { recursive: true });
  await writeFile(
    METADATA_FILE,
    `${JSON.stringify({ background: BRAND_BACKGROUND, icons, appleTouchIcon, splash }, null, 2)}\n`,
  );

  console.log(
    `Generated ${icons.length} icons, 1 apple touch icon and ${splash.length} splash screens.`,
  );
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
