import fs from "node:fs";
import path from "node:path";
import os from "node:os";
import http from "node:http";
import { createRequire } from "node:module";

const requireFromWebsite = createRequire(
  path.resolve(process.cwd(), "..", "website", "package.json")
);
const { chromium } = requireFromWebsite("@playwright/test");

const localChromium1248 = path.join(
  os.homedir(),
  "AppData",
  "Local",
  "ms-playwright",
  "chromium-1248",
  "chrome-win64",
  "chrome.exe"
);
const executablePath = fs.existsSync(localChromium1248)
  ? localChromium1248
  : undefined;

const MIME_TYPES = {
  ".html": "text/html; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".mjs": "application/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".jfif": "image/jpeg",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
};

function startStaticSpaServer(distDir) {
  return new Promise((resolve, reject) => {
    const server = http.createServer((req, res) => {
      try {
        const parsed = new URL(req.url || "/", "http://127.0.0.1");
        let relPath = decodeURIComponent(parsed.pathname);
        if (relPath === "/") relPath = "/index.html";

        let filePath = path.join(distDir, relPath);
        if (!filePath.startsWith(distDir)) {
          res.writeHead(403);
          res.end("Forbidden");
          return;
        }

        if (!fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
          filePath = path.join(distDir, "index.html");
        }

        const ext = path.extname(filePath).toLowerCase();
        const contentType = MIME_TYPES[ext] || "application/octet-stream";
        res.writeHead(200, { "Content-Type": contentType });
        fs.createReadStream(filePath).pipe(res);
      } catch (err) {
        res.writeHead(500);
        res.end(String(err));
      }
    });

    server.on("error", reject);
    server.listen(0, "127.0.0.1", () => {
      const address = server.address();
      resolve({
        server,
        port: typeof address === "object" && address ? address.port : 0,
      });
    });
  });
}

async function main() {
  const distDir = path.resolve(process.cwd(), "dist");
  if (!fs.existsSync(path.join(distDir, "index.html"))) {
    throw new Error(
      "dist/index.html not found. Please run `npm run build` before `npm run export`."
    );
  }

  const { server, port } = await startStaticSpaServer(distDir);
  const baseUrl = `http://127.0.0.1:${port}`;
  console.log(`[slidev:export] Serving compiled SPA from ${distDir} at ${baseUrl}`);

  const browser = await chromium.launch({
    headless: true,
    ...(executablePath ? { executablePath } : {}),
  });

  try {
    const context = await browser.newContext({
      viewport: { width: 1280, height: 720 },
      deviceScaleFactor: 2,
      reducedMotion: "reduce",
    });

    const page = await context.newPage();
    const pageErrors = [];
    page.on("pageerror", (err) => {
      pageErrors.push(err.message || String(err));
    });

    const totalSlides = 16;
    const slideImagesBase64 = [];

    for (let i = 1; i <= totalSlides; i++) {
      const targetUrl = `${baseUrl}/${i}?clicks=99`;
      await page.goto(targetUrl, { waitUntil: "domcontentloaded" });
      await page
        .locator(`.slidev-page-${i}, .slidev-layout:visible`)
        .first()
        .waitFor({ state: "visible", timeout: 10000 });
      await page.waitForTimeout(i === 16 ? 2200 : 450);

      const visibleHtmlLen = await page.evaluate((slideNo) => {
        const pageEl =
          document.querySelector(`.slidev-page-${slideNo}`) ||
          document.querySelector("#slideshow");
        return pageEl ? pageEl.innerHTML.length : 0;
      }, i);

      if (visibleHtmlLen < 50) {
        throw new Error(
          `Slide ${i} rendered empty or nearly empty (HTML length: ${visibleHtmlLen})`
        );
      }

      const buf = await page.screenshot({ type: "png" });
      slideImagesBase64.push(`data:image/png;base64,${buf.toString("base64")}`);
      console.log(
        `[slidev:export] Verified & captured Slide ${i}/${totalSlides} (DOM size: ${visibleHtmlLen} chars)`
      );
    }

    if (pageErrors.length > 0) {
      throw new Error(`Runtime page errors detected:\n${pageErrors.join("\n")}`);
    }

    // Build a static 16-page 16:9 PDF from the exact rendered slides (no animations, projector safe)
    const pdfPage = await context.newPage();
    const pagesHtml = slideImagesBase64
      .map(
        (src, idx) => `
      <div class="pdf-slide">
        <img src="${src}" alt="Slide ${idx + 1}" />
      </div>`
      )
      .join("\n");

    const pdfHtml = `<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="utf-8" />
  <title>RentGo Medan - Presentasi UTS MMPRPL (Akbar Riansyah)</title>
  <style>
    @page {
      size: 1280px 720px;
      margin: 0;
    }
    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }
    html, body {
      background: #050914;
      width: 1280px;
    }
    .pdf-slide {
      width: 1280px;
      height: 720px;
      page-break-after: always;
      overflow: hidden;
      background: #050914;
    }
    .pdf-slide img {
      width: 1280px;
      height: 720px;
      display: block;
      object-fit: cover;
    }
  </style>
</head>
<body>
  ${pagesHtml}
</body>
</html>`;

    await pdfPage.setContent(pdfHtml, { waitUntil: "load" });

    const outPdfDist = path.join(distDir, "RentGo-UTS.pdf");
    const outPdfRoot = path.resolve(process.cwd(), "slides-export.pdf");

    await pdfPage.pdf({
      path: outPdfDist,
      width: "1280px",
      height: "720px",
      printBackground: true,
    });
    fs.copyFileSync(outPdfDist, outPdfRoot);

    console.log(`[slidev:export] Exported 16-slide static backup PDF to:`);
    console.log(`  1) ${outPdfDist}`);
    console.log(`  2) ${outPdfRoot}`);
  } finally {
    await browser.close();
    server.close();
  }
}

main().catch((err) => {
  console.error("[slidev:export] Failed:", err);
  process.exit(1);
});
