import fs from "node:fs";
import path from "node:path";
import os from "node:os";
import { createRequire } from "node:module";

const requireFromWebsite = createRequire(
  path.resolve(process.cwd(), "..", "website", "package.json"),
);
const { chromium } = requireFromWebsite("@playwright/test");

const localChromium1248 = path.join(
  os.homedir(),
  "AppData",
  "Local",
  "ms-playwright",
  "chromium-1248",
  "chrome-win64",
  "chrome.exe",
);
const executablePath = fs.existsSync(localChromium1248)
  ? localChromium1248
  : undefined;

function imageToDataUri(filePath) {
  if (!fs.existsSync(filePath)) return "";
  const bytes = fs.readFileSync(filePath);
  return `data:image/png;base64,${bytes.toString("base64")}`;
}

async function main() {
  const outDir = path.resolve(process.cwd(), "dist");
  fs.mkdirSync(outDir, { recursive: true });
  const pdfPath = path.join(outDir, "RentGo-UTS.pdf");

  const screensDir = path.resolve(process.cwd(), "public", "screens");
  const rawSlides = fs.readFileSync(
    path.resolve(process.cwd(), "slides.md"),
    "utf8",
  );
  const styleCss = fs.readFileSync(
    path.resolve(process.cwd(), "style.css"),
    "utf8",
  );

  // Strip frontmatter and split slides by `\n---\n`
  const withoutFrontmatter = rawSlides.replace(/^---[\s\S]*?---\r?\n/, "");
  const slideBlocks = withoutFrontmatter
    .split(/\r?\n---\r?\n/)
    .map((s) => s.trim())
    .filter(Boolean);

  function renderSlideBlockToHtml(md) {
    let html = md
      // Replace /screens/*.png with inline base64 data URI
      .replace(/src="\/screens\/([^"]+\.png)"/g, (_m, fname) => {
        const uri = imageToDataUri(path.join(screensDir, fname));
        return uri ? `src="${uri}"` : `src="/screens/${fname}"`;
      })
      // Convert mermaid blocks to styled architecture boxes
      .replace(/```mermaid\r?\n([\s\S]*?)```/g, (_m, code) => {
        return `<pre class="mermaid-box">${code
          .replace(/</g, "&lt;")
          .replace(/>/g, "&gt;")}</pre>`;
      })
      // Convert headings
      .replace(/^# (.*)$/gm, "<h1>$1</h1>")
      .replace(/^## (.*)$/gm, "<h2>$1</h2>")
      // Convert bold & inline code
      .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
      .replace(/`([^`]+)`/g, "<code>$1</code>");

    return html;
  }

  const slidesHtml = slideBlocks
    .map(
      (block, idx) => `
      <section class="slide-page slidev-layout">
        <header class="slide-topbar">
          <span class="rentgo-badge">RentGo Medan - UTS MMPRPL</span>
          <span class="slide-meta">Akbar Riansyah | Slide ${idx + 1} / ${slideBlocks.length}</span>
        </header>
        <div class="slide-body">
          ${renderSlideBlockToHtml(block)}
        </div>
      </section>`,
    )
    .join("\n");

  const fullDocument = `<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="utf-8" />
  <title>RentGo Medan - Dek Presentasi UTS (Akbar Riansyah)</title>
  <style>
    ${styleCss}
    @page {
      size: 1280px 720px;
      margin: 0;
    }
    * {
      box-sizing: border-box;
    }
    body {
      margin: 0;
      padding: 0;
      background: var(--slate-50);
      font-family: "Plus Jakarta Sans", system-ui, -apple-system, sans-serif;
    }
    .slide-page {
      width: 1280px;
      height: 720px;
      padding: 40px 56px;
      page-break-after: always;
      display: flex;
      flex-direction: column;
      justify-content: flex-start;
      background: var(--slate-50);
      border-bottom: 6px solid var(--primary-600);
      overflow: hidden;
    }
    .slide-topbar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 18px;
      padding-bottom: 10px;
      border-bottom: 1px solid var(--slate-200);
    }
    .slide-meta {
      font-size: 13px;
      font-weight: 700;
      color: var(--slate-600);
    }
    .slide-body h1 {
      font-size: 32px;
      margin: 0 0 8px 0;
      color: var(--navy-900);
    }
    .slide-body h2 {
      font-size: 20px;
      margin: 0 0 14px 0;
      color: var(--primary-600);
    }
    .slide-body p, .slide-body li {
      font-size: 15px;
      line-height: 1.5;
    }
    .grid { display: grid; }
    .grid-cols-2 { grid-template-columns: repeat(2, minmax(0, 1fr)); }
    .grid-cols-3 { grid-template-columns: repeat(3, minmax(0, 1fr)); }
    .grid-cols-5 { grid-template-columns: repeat(5, minmax(0, 1fr)); }
    .grid-cols-12 { grid-template-columns: repeat(12, minmax(0, 1fr)); }
    .col-span-5 { grid-column: span 5 / span 5; }
    .col-span-7 { grid-column: span 7 / span 7; }
    .gap-2 { gap: 10px; }
    .gap-3 { gap: 14px; }
    .gap-4 { gap: 18px; }
    .mt-1 { margin-top: 4px; }
    .mt-2 { margin-top: 8px; }
    .mt-3 { margin-top: 12px; }
    .mt-4 { margin-top: 16px; }
    .mt-6 { margin-top: 24px; }
    .mermaid-box {
      background: var(--navy-900);
      color: var(--surface-white);
      padding: 14px 18px;
      border-radius: 10px;
      font-family: monospace;
      font-size: 13px;
      line-height: 1.45;
    }
    img {
      max-height: 360px;
      width: 100%;
      object-fit: contain;
      border-radius: 8px;
      border: 1px solid var(--slate-200);
      background: var(--surface-white);
    }
    code {
      background: var(--primary-50);
      color: var(--primary-700);
      padding: 2px 6px;
      border-radius: 4px;
      font-family: monospace;
      font-size: 0.9em;
    }
  </style>
</head>
<body>
  ${slidesHtml}
</body>
</html>`;

  const browser = await chromium.launch({
    headless: true,
    ...(executablePath ? { executablePath } : {}),
  });
  const page = await browser.newPage();
  await page.setContent(fullDocument, { waitUntil: "load" });
  await page.pdf({
    path: pdfPath,
    width: "1280px",
    height: "720px",
    printBackground: true,
  });
  await browser.close();
  console.log(`[slidev:export] Exported ${slideBlocks.length}-slide PDF deck to ${pdfPath}`);
}

main().catch((err) => {
  console.error("[slidev:export] Failed:", err);
  process.exit(1);
});
