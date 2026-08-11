// Converts every png/jpg/jpeg/gif under src/assets to WebP.
// Run: node scripts/convert-images.js  (from frontend/)
import fs from "fs";
import path from "path";
import sharp from "sharp";

const ASSETS_DIR = path.join(import.meta.dirname, "..", "src", "assets");
const EXTENSIONS = [".png", ".jpg", ".jpeg", ".gif"];

const files = [];
(function walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full);
    else if (EXTENSIONS.includes(path.extname(entry.name).toLowerCase())) {
      files.push(full);
    }
  }
})(ASSETS_DIR);

let totalBefore = 0;
let totalAfter = 0;
for (const file of files) {
  const isGif = path.extname(file).toLowerCase() === ".gif";
  const out = file.replace(/\.[^.]+$/, ".webp");
  const before = fs.statSync(file).size;
  totalBefore += before;
  try {
    const pipeline = isGif
      ? sharp(file, { animated: true }).webp({ quality: 75 })
      : sharp(file).webp({ quality: 80 });
    await pipeline.toFile(out);
    const after = fs.statSync(out).size;
    totalAfter += after;
    console.log(
      `${String(Math.round(before / 1024)).padStart(6)} KB -> ${String(
        Math.round(after / 1024),
      ).padStart(6)} KB  ${path.relative(ASSETS_DIR, file)}`,
    );
  } catch (err) {
    console.error(`FAILED: ${file} - ${err.message}`);
  }
}
console.log(
  `\nTOTAL: ${(totalBefore / 1024 / 1024).toFixed(2)} MB -> ${(
    totalAfter /
    1024 /
    1024
  ).toFixed(2)} MB`,
);
