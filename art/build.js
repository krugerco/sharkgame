// Builds the Deep Bite sprite set.
//   art/svg/*.svg                     vector sources (for editing / previewing)
//   public/assets/sprites/*.png       what the game loads (@2x for creatures)
//   public/assets/sprites/manifest.json   read by public/js/art.js
// Usage: node art/build.js   (needs Playwright for the PNG render)
const fs = require('fs');
const path = require('path');
const sprites = require('./sprites');

const svgDir = path.join(__dirname, 'svg');
const outDir = path.resolve(__dirname, '../public/assets/sprites');
fs.mkdirSync(svgDir, { recursive: true });
fs.mkdirSync(outDir, { recursive: true });

const manifest = {};
for (const [name, s] of Object.entries(sprites)) {
  fs.writeFileSync(path.join(svgDir, `${name}.svg`), s.svg.trim() + '\n');
  if (!s.key) continue;
  const isBg = s.key.startsWith('bg.');
  const entry = { src: isBg ? `${name}.png` : `${name}@2x.png`, facing: 'right' };
  if (s.nose !== undefined) {
    // Map the game's collision radius onto the drawn body.
    const front = s.front ?? 1.0, span = s.span ?? 2.5;
    const rpx = (s.nose - s.tail) / span;
    entry.size = +(s.w / rpx).toFixed(3);
    entry.anchor = [+((s.nose - rpx * front) / s.w).toFixed(3), +(s.cy / s.h).toFixed(3)];
  } else if (s.size) {
    entry.size = s.size;
    entry.anchor = s.anchor;
  }
  if (s.parallax !== undefined) entry.parallax = s.parallax;
  manifest[s.key] = entry;
}
fs.writeFileSync(path.join(outDir, 'manifest.json'), JSON.stringify(manifest, null, 2) + '\n');

(async () => {
  const { chromium } = require('playwright');
  const browser = await chromium.launch();
  for (const [name, s] of Object.entries(sprites)) {
    if (!s.key) continue; // extra art: SVG only
    const isBg = s.key.startsWith('bg.');
    const page = await browser.newPage({ deviceScaleFactor: isBg ? 1 : 2, viewport: { width: s.w, height: s.h } });
    const tmp = path.join(svgDir, `${name}.svg`);
    await page.goto('file://' + tmp);
    await page.screenshot({ path: path.join(outDir, isBg ? `${name}.png` : `${name}@2x.png`), omitBackground: true });
    await page.close();
  }
  await browser.close();
  console.log('Built', Object.keys(manifest).length, 'game sprites');
})();
