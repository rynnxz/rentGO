import fs from "node:fs";
import path from "node:path";

const srcDir = path.resolve(process.cwd(), "..", "website", "docs", "screenshots");
const destDir = path.resolve(process.cwd(), "public", "screens");

fs.mkdirSync(destDir, { recursive: true });

if (fs.existsSync(srcDir)) {
  const files = fs.readdirSync(srcDir).filter((f) => f.endsWith(".png"));
  for (const file of files) {
    fs.copyFileSync(path.join(srcDir, file), path.join(destDir, file));
  }
  console.log(`[sync:screens] Copied ${files.length} screenshots from ${srcDir} to ${destDir}`);
} else {
  console.log(`[sync:screens] Source directory ${srcDir} does not exist yet.`);
}
