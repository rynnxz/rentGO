import fs from "node:fs";
import path from "node:path";
import os from "node:os";
import { spawn } from "node:child_process";
import { chromium } from "@playwright/test";

const BASE_URL = process.env.SCREENSHOT_BASE_URL || "http://localhost:3000";
const OUT_DIR = path.resolve(process.cwd(), "docs", "screenshots");

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

async function isServerUp(url) {
  try {
    const res = await fetch(url);
    return res.status > 0;
  } catch {
    return false;
  }
}

async function waitForServer(url, timeoutMs = 60000) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    if (await isServerUp(url)) return true;
    await new Promise((r) => setTimeout(r, 800));
  }
  throw new Error(`Server at ${url} did not become ready within ${timeoutMs}ms`);
}

async function main() {
  // Reset local store to fresh seed state for consistent screenshots
  const localDbPath = path.join(process.cwd(), ".data", "rentgo-local.json");
  if (fs.existsSync(localDbPath)) {
    fs.unlinkSync(localDbPath);
  }

  let serverProc = null;
  if (!(await isServerUp(BASE_URL))) {
    console.log("[docs:screens] Starting local Next.js server...");
    serverProc = spawn("npm.cmd", ["run", "dev"], {
      cwd: process.cwd(),
      stdio: "ignore",
      shell: true,
    });
    await waitForServer(BASE_URL);
  }

  try {
    fs.mkdirSync(OUT_DIR, { recursive: true });
    const browser = await chromium.launch({
      headless: true,
      ...(executablePath ? { executablePath } : {}),
    });
    const context = await browser.newContext({
      viewport: { width: 1366, height: 820 },
    });
    const page = await context.newPage();

    console.log("[docs:screens] 1. Capturing Landing Hero & Fleet...");
    await page.goto(`${BASE_URL}/?site=landing`, { waitUntil: "networkidle" });
    await page.screenshot({
      path: path.join(OUT_DIR, "01-landing-hero.png"),
      fullPage: false,
    });

    await page.locator("#armada").scrollIntoViewIfNeeded();
    await page.waitForTimeout(300);
    await page.screenshot({
      path: path.join(OUT_DIR, "02-landing-fleet-pricing.png"),
      fullPage: false,
    });

    console.log("[docs:screens] 2. Capturing Booking Catalog & AI Recommendation...");
    await page.goto(`${BASE_URL}/?site=book&start=2026-11-25&end=2026-11-27`, {
      waitUntil: "networkidle",
    });
    await page.screenshot({
      path: path.join(OUT_DIR, "03-book-catalog.png"),
      fullPage: false,
    });

    await page.getByTestId("ai-submit-button").click();
    await page.getByTestId("ai-recommendation-results").waitFor({ state: "visible" });
    await page.screenshot({
      path: path.join(OUT_DIR, "04-book-ai-recommend.png"),
      fullPage: false,
    });

    console.log("[docs:screens] 3. Logging in as Customer & Capturing Checkout + Pesanan Saya...");
    await page.goto(`${BASE_URL}/?site=book&start=2026-11-25&end=2026-11-27`, {
      waitUntil: "networkidle",
    });
    await page.getByTestId("login-google-button").first().click();
    await page
      .locator("dialog[open]")
      .getByTestId("emulator-login-customer")
      .click();
    await page.getByTestId("active-user-pill").waitFor({ state: "visible" });

    await page.getByTestId("select-vehicle-BK 1750 AAD").click();
    await page.getByTestId("vehicle-checkout-view").waitFor({ state: "visible" });
    await page.screenshot({
      path: path.join(OUT_DIR, "05-book-checkout.png"),
      fullPage: false,
    });

    await page.goto(`${BASE_URL}/bookings?site=book`, { waitUntil: "networkidle" });
    await page.screenshot({
      path: path.join(OUT_DIR, "06-book-my-bookings.png"),
      fullPage: false,
    });

    console.log("[docs:screens] 4. Logging in as Admin & Capturing Admin Dashboard, Vehicles, Bookings, Maintenance...");
    await page.getByTestId("logout-button").click();
    await page.getByTestId("login-google-button").first().waitFor({ state: "visible" });
    await page.goto(`${BASE_URL}/?site=admin`, { waitUntil: "networkidle" });
    await page.getByTestId("login-google-button").first().click();
    await page
      .locator("dialog[open]")
      .getByTestId("emulator-login-admin")
      .click();
    await page.getByTestId("admin-dashboard-view").waitFor({ state: "visible" });

    await page.screenshot({
      path: path.join(OUT_DIR, "07-admin-dashboard.png"),
      fullPage: false,
    });

    await page.goto(`${BASE_URL}/vehicles?site=admin`, { waitUntil: "networkidle" });
    await page.screenshot({
      path: path.join(OUT_DIR, "08-admin-vehicles.png"),
      fullPage: false,
    });

    await page.goto(`${BASE_URL}/bookings?site=admin`, { waitUntil: "networkidle" });
    await page.screenshot({
      path: path.join(OUT_DIR, "09-admin-bookings.png"),
      fullPage: false,
    });

    await page.goto(`${BASE_URL}/maintenance?site=admin`, { waitUntil: "networkidle" });
    await page.screenshot({
      path: path.join(OUT_DIR, "10-admin-maintenance.png"),
      fullPage: false,
    });

    await browser.close();
    console.log(`[docs:screens] Successfully captured 10 screenshots into ${OUT_DIR}`);
  } finally {
    if (serverProc && serverProc.pid) {
      try {
        spawn("taskkill", ["/pid", String(serverProc.pid), "/f", "/t"]);
      } catch {
        // ignore
      }
    }
  }
}

main().catch((err) => {
  console.error("[docs:screens] Failed:", err);
  process.exit(1);
});
