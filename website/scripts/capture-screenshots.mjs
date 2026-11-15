import fs from "node:fs";
import path from "node:path";
import os from "node:os";
import { spawn } from "node:child_process";
import { chromium } from "@playwright/test";

const BASE_URL = process.env.SCREENSHOT_BASE_URL || "http://localhost:3000";
const OUT_DIR = path.resolve(process.cwd(), "docs", "screenshots");
const LAPORAN_SCREENS_DIR = path.resolve(process.cwd(), "..", "laporan", "screenshots");
const SLIDEV_SCREENS_DIR = path.resolve(process.cwd(), "..", "slidev", "public", "screens");

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
    fs.mkdirSync(LAPORAN_SCREENS_DIR, { recursive: true });
    fs.mkdirSync(SLIDEV_SCREENS_DIR, { recursive: true });

    const browser = await chromium.launch({
      headless: true,
      ...(executablePath ? { executablePath } : {}),
    });
    const context = await browser.newContext({
      viewport: { width: 1440, height: 900 },
    });
    const page = await context.newPage();

    console.log("[docs:screens] 1. Capturing Landing Page (01 & 02)...");
    await page.goto(`${BASE_URL}/`, { waitUntil: "networkidle" });
    await page.screenshot({
      path: path.join(OUT_DIR, "01-landing-hero.png"),
      fullPage: false,
    });
    fs.copyFileSync(
      path.join(OUT_DIR, "01-landing-hero.png"),
      path.join(LAPORAN_SCREENS_DIR, "01-landing.png"),
    );

    await page.locator("#armada").scrollIntoViewIfNeeded();
    await page.waitForTimeout(300);
    await page.screenshot({
      path: path.join(OUT_DIR, "02-landing-fleet-pricing.png"),
      fullPage: false,
    });
    fs.copyFileSync(
      path.join(OUT_DIR, "02-landing-fleet-pricing.png"),
      path.join(LAPORAN_SCREENS_DIR, "02-landing-fleet-pricing.png"),
    );

    console.log("[docs:screens] 2. Capturing Booking Catalog (03) & Smart AI Motor Touring (04)...");
    await page.goto(`${BASE_URL}/book?start=2026-11-25&end=2026-11-27`, {
      waitUntil: "networkidle",
    });
    await page.screenshot({
      path: path.join(OUT_DIR, "03-book-catalog.png"),
      fullPage: false,
    });
    fs.copyFileSync(
      path.join(OUT_DIR, "03-book-catalog.png"),
      path.join(LAPORAN_SCREENS_DIR, "03-catalog.png"),
    );

    await page
      .getByTestId("ai-query-input")
      .fill("motor yang cocok untuk touring bareng pacar, budget 200rb maksimal");
    await page.getByTestId("ai-submit-button").click();
    await page.getByTestId("ai-recommendation-results").waitFor({ state: "visible" });
    await page.getByTestId("ai-recommendation-panel").scrollIntoViewIfNeeded();
    await page.waitForTimeout(300);
    await page.screenshot({
      path: path.join(OUT_DIR, "04-book-ai-recommend.png"),
      fullPage: false,
    });
    fs.copyFileSync(
      path.join(OUT_DIR, "04-book-ai-recommend.png"),
      path.join(LAPORAN_SCREENS_DIR, "04-ai-recommend.png"),
    );

    console.log("[docs:screens] 3. Capturing Firebase Auth Modal (05) & Logging in as Customer...");
    await page.getByTestId("login-google-button").first().click();
    await page.locator("dialog[open]").waitFor({ state: "visible" });
    await page.waitForTimeout(250);
    await page.screenshot({
      path: path.join(LAPORAN_SCREENS_DIR, "05-auth-modal.png"),
      fullPage: false,
    });

    await page
      .locator("dialog[open]")
      .getByTestId("emulator-login-customer")
      .click();
    await page.getByTestId("active-user-pill").waitFor({ state: "visible" });

    console.log("[docs:screens] 4. Capturing RBAC 403 on /admin (16)...");
    await page.goto(`${BASE_URL}/admin`, { waitUntil: "networkidle" });
    await page.getByTestId("admin-access-denied").waitFor({ state: "visible" });
    await page.screenshot({
      path: path.join(LAPORAN_SCREENS_DIR, "16-rbac-403-and-404.png"),
      fullPage: false,
    });

    console.log("[docs:screens] 5. Capturing Checkout (06), QRIS Unpaid (07), QRIS Paid/Confirmed (08), & 409 Conflict (17)...");
    await page.goto(`${BASE_URL}/book?start=2026-12-18&end=2026-12-19`, {
      waitUntil: "networkidle",
    });
    await page.getByTestId("select-vehicle-BK 1750 AAD").click();
    await page.getByTestId("vehicle-checkout-view").waitFor({ state: "visible" });
    const avanzaCheckoutUrl = page.url();
    await page.getByTestId("checkout-start-date").fill("2026-12-18");
    await page.getByTestId("checkout-end-date").fill("2026-12-19");
    await page.screenshot({
      path: path.join(OUT_DIR, "05-book-checkout.png"),
      fullPage: false,
    });
    fs.copyFileSync(
      path.join(OUT_DIR, "05-book-checkout.png"),
      path.join(LAPORAN_SCREENS_DIR, "06-checkout-qris.png"),
    );

    // Open a second tab on the same vehicle & dates BEFORE submitting tab 1, to demonstrate real 2-tab double-booking HTTP 409 Conflict
    const page2 = await context.newPage();
    await page2.goto(avanzaCheckoutUrl, { waitUntil: "networkidle" });
    await page2.getByTestId("checkout-start-date").fill("2026-12-18");
    await page2.getByTestId("checkout-end-date").fill("2026-12-19");

    // Tab 1 submits first -> succeeds (HTTP 201)
    await page.getByTestId("submit-booking-button").click();
    await page.getByTestId("booking-detail-view").waitFor({ state: "visible" });
    await page.waitForTimeout(300);
    await page.screenshot({
      path: path.join(LAPORAN_SCREENS_DIR, "07-booking-detail-qris.png"),
      fullPage: false,
    });

    await page.getByTestId("simulate-upload-proof-button").click();
    await page.getByTestId("booking-detail-feedback").waitFor({ state: "visible" });
    await page.waitForTimeout(300);
    await page.screenshot({
      path: path.join(LAPORAN_SCREENS_DIR, "08-booking-paid-confirmed.png"),
      fullPage: false,
    });

    // Tab 2 submits second for the same vehicle & dates -> rejected by server with HTTP 409 Conflict
    await page2.getByTestId("submit-booking-button").click();
    await page2.getByTestId("checkout-error-alert").waitFor({ state: "visible" });
    await page2.getByTestId("checkout-error-alert").scrollIntoViewIfNeeded();
    await page2.waitForTimeout(250);
    await page2.screenshot({
      path: path.join(LAPORAN_SCREENS_DIR, "17-double-booking-409.png"),
      fullPage: false,
    });
    await page2.close();

    console.log("[docs:screens] 6. Capturing My Bookings (09)...");
    await page.goto(`${BASE_URL}/book/bookings`, { waitUntil: "networkidle" });
    await page.screenshot({
      path: path.join(OUT_DIR, "06-book-my-bookings.png"),
      fullPage: false,
    });
    fs.copyFileSync(
      path.join(OUT_DIR, "06-book-my-bookings.png"),
      path.join(LAPORAN_SCREENS_DIR, "09-my-bookings-and-profile.png"),
    );

    console.log("[docs:screens] 7. Logging in as Admin & Capturing Admin Surfaces (10..15)...");
    await page.getByTestId("logout-button").click();
    await page.getByTestId("login-google-button").first().waitFor({ state: "visible" });
    await page.goto(`${BASE_URL}/admin`, { waitUntil: "networkidle" });
    await page.getByTestId("login-google-button").first().click();
    await page
      .locator("dialog[open]")
      .getByTestId("emulator-login-admin")
      .click();
    await page.getByTestId("admin-dashboard-view").waitFor({ state: "visible" });
    await page.waitForTimeout(300);

    await page.screenshot({
      path: path.join(OUT_DIR, "07-admin-dashboard.png"),
      fullPage: false,
    });
    fs.copyFileSync(
      path.join(OUT_DIR, "07-admin-dashboard.png"),
      path.join(LAPORAN_SCREENS_DIR, "10-admin-dashboard.png"),
    );

    // Also capture Landing Page while logged in as Admin to verify single-row navbar
    await page.goto(`${BASE_URL}/`, { waitUntil: "networkidle" });
    await page.waitForTimeout(250);
    await page.screenshot({
      path: path.join(OUT_DIR, "01b-landing-logged-in-admin.png"),
      fullPage: false,
    });

    await page.goto(`${BASE_URL}/admin/categories`, { waitUntil: "networkidle" });
    await page.waitForTimeout(250);
    await page.screenshot({
      path: path.join(LAPORAN_SCREENS_DIR, "11-admin-categories.png"),
      fullPage: false,
    });

    await page.goto(`${BASE_URL}/admin/vehicles`, { waitUntil: "networkidle" });
    await page.waitForTimeout(250);
    await page.screenshot({
      path: path.join(OUT_DIR, "08-admin-vehicles.png"),
      fullPage: false,
    });
    fs.copyFileSync(
      path.join(OUT_DIR, "08-admin-vehicles.png"),
      path.join(LAPORAN_SCREENS_DIR, "12-admin-vehicles.png"),
    );

    await page.goto(`${BASE_URL}/admin/bookings`, { waitUntil: "networkidle" });
    await page.waitForTimeout(250);
    // Open "Semua Aksi" modal on the first booking row that has one
    const moreBtn = page.locator('[data-testid^="more-actions-"]').first();
    if ((await moreBtn.count()) > 0) {
      await moreBtn.click();
      await page.waitForTimeout(250);
    }
    await page.screenshot({
      path: path.join(OUT_DIR, "09-admin-bookings.png"),
      fullPage: false,
    });
    fs.copyFileSync(
      path.join(OUT_DIR, "09-admin-bookings.png"),
      path.join(LAPORAN_SCREENS_DIR, "13-admin-bookings-actions.png"),
    );

    await page.goto(`${BASE_URL}/admin/maintenance`, { waitUntil: "networkidle" });
    await page.waitForTimeout(250);
    await page.screenshot({
      path: path.join(OUT_DIR, "10-admin-maintenance.png"),
      fullPage: false,
    });
    fs.copyFileSync(
      path.join(OUT_DIR, "10-admin-maintenance.png"),
      path.join(LAPORAN_SCREENS_DIR, "14-admin-maintenance.png"),
    );

    await page.goto(`${BASE_URL}/admin/customers`, { waitUntil: "networkidle" });
    await page.waitForTimeout(250);
    await page.screenshot({
      path: path.join(LAPORAN_SCREENS_DIR, "15-admin-customers.png"),
      fullPage: false,
    });

    // Sync OUT_DIR screenshots to Slidev public/screens
    const outFiles = fs.readdirSync(OUT_DIR).filter((f) => f.endsWith(".png"));
    for (const file of outFiles) {
      fs.copyFileSync(path.join(OUT_DIR, file), path.join(SLIDEV_SCREENS_DIR, file));
    }

    await browser.close();
    console.log(
      `[docs:screens] Successfully captured 10 docs/slidev screenshots and 17 laporan screenshots into ${LAPORAN_SCREENS_DIR}`,
    );
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
