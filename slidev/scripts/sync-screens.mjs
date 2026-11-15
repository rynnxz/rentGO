import fs from "node:fs";
import path from "node:path";

const srcScreensDir = path.resolve(process.cwd(), "..", "website", "docs", "screenshots");
const destScreensDir = path.resolve(process.cwd(), "public", "screens");

fs.mkdirSync(destScreensDir, { recursive: true });

if (fs.existsSync(srcScreensDir)) {
  const files = fs.readdirSync(srcScreensDir).filter((f) => f.endsWith(".png"));
  for (const file of files) {
    fs.copyFileSync(path.join(srcScreensDir, file), path.join(destScreensDir, file));
  }
  console.log(`[sync:screens] Copied ${files.length} screenshots from ${srcScreensDir} to ${destScreensDir}`);
} else {
  console.log(`[sync:screens] Source directory ${srcScreensDir} does not exist yet.`);
}

const srcVehiclesDir = path.resolve(process.cwd(), "..", "website", "public", "vehicles");
const destVehiclesDir = path.resolve(process.cwd(), "public", "vehicles");

fs.mkdirSync(destVehiclesDir, { recursive: true });

if (fs.existsSync(srcVehiclesDir)) {
  const vFiles = fs
    .readdirSync(srcVehiclesDir)
    .filter((f) => /\.(png|jpg|jpeg|jfif|svg|webp)$/i.test(f));
  for (const file of vFiles) {
    fs.copyFileSync(path.join(srcVehiclesDir, file), path.join(destVehiclesDir, file));
  }
  console.log(`[sync:screens] Copied ${vFiles.length} vehicle assets from ${srcVehiclesDir} to ${destVehiclesDir}`);
}
