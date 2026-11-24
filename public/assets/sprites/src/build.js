// Writes every sprite to assets/sprites/svg, renders PNGs (1x and 2x) to
// assets/sprites/png with Playwright, and writes assets/sprites/manifest.json.
// Usage: node assets/sprites/src/build.js [--svg-only]
const fs = require('fs');
const path = require('path');
const sprites = require('./sprites');

const root = path.resolve(__dirname, '..');
const svgDir = path.join(root, 'svg');
const pngDir = path.join(root, 'png');
fs.mkdirSync(svgDir, { recursive: true });
fs.mkdirSync(pngDir, { recursive: true });

const manifest = { facing: 'right', sprites: {} };
for (const [name, s] of Object.entries(sprites)) {
  fs.writeFileSync(path.join(svgDir, `${name}.svg`), s.svg.trim() + '\n');
  manifest.sprites[name] = {
    svg: `svg/${name}.svg`,
    png: `png/${name}.png`,
    png2x: `png/${name}@2x.png`,
    width: s.w,
    height: s.h,
    anchor: s.anchor,
    role: s.role,
  };
}
fs.writeFileSync(path.join(root, 'manifest.json'), JSON.stringify(manifest, null, 2) + '\n');

if (process.argv.includes('--svg-only')) process.exit(0);

(async () => {
  const { chromium } = require('playwright');
  const browser = await chromium.launch();
  for (const scale of [1, 2]) {
    const page = await browser.newPage({ deviceScaleFactor: scale });
    for (const [name, s] of Object.entries(sprites)) {
      await page.setViewportSize({ width: s.w, height: s.h });
      await page.setContent(
        `<html><body style="margin:0;background:transparent">${s.svg}</body></html>`
      );
      const file = scale === 1 ? `${name}.png` : `${name}@2x.png`;
      await page.locator('svg').screenshot({ path: path.join(pngDir, file), omitBackground: true });
    }
    await page.close();
  }
  await browser.close();
  console.log('Built', Object.keys(sprites).length, 'sprites');
})();
