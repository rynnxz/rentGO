import fs from "node:fs";
import path from "node:path";
import { test, expect } from "@playwright/test";

test.describe("RentGo Medan E2E Verification Suite", () => {
  test.beforeAll(() => {
    const localDbPath = path.join(process.cwd(), ".data", "rentgo-local.json");
    if (fs.existsSync(localDbPath)) {
      fs.unlinkSync(localDbPath);
    }
  });

  test("E2E-01 & E2E-08: Direct /site/* blocked (404), unauthenticated admin gate, and customer 403 on admin surface", async ({
    page,
  }) => {
    // 1. Direct request to /site/admin must be blocked with 404
    const directRes = await page.goto("/site/admin");
    expect(directRes?.status()).toBe(404);

    // 2. Unauthenticated visit to Admin surface (?site=admin) shows login gate
    await page.goto("/?site=admin");
    await expect(page.getByTestId("admin-login-gate")).toBeVisible();

    // 3. Login as Customer (Nadia Siregar) via Firebase Auth Emulator dialog
    await page.getByTestId("login-google-button").first().click();
    await page.getByTestId("emulator-login-customer").first().click();

    // 4. Customer visiting Admin surface (?site=admin) gets HTTP 403 Access Denied view
    await expect(page.getByTestId("admin-access-denied")).toBeVisible();
    await expect(page.getByTestId("active-user-pill")).toContainText(
      "Nadia Siregar",
    );
  });

  test("E2E-02: Admin creates a new vehicle and it appears on public booking catalog", async ({
    page,
  }) => {
    await page.goto("/?site=admin");
    await page.getByTestId("login-google-button").first().click();
    await page.getByTestId("emulator-login-admin").first().click();

    await expect(page.getByTestId("admin-dashboard-view")).toBeVisible();
    await page.getByTestId("nav-admin-vehicles").click();
    await expect(page.getByTestId("admin-vehicles-view")).toBeVisible();

    const uniquePlate = `BK ${Math.floor(8000 + Math.random() * 900)} ETE`;
    await page.getByTestId("add-vehicle-button").click();
    await page.locator("#v-plate").fill(uniquePlate);
    await page.locator("#v-brand").fill("Honda");
    await page.locator("#v-model").fill("HR-V SE Turbo");
    await page.locator("#v-price").fill("580000");
    await page.getByTestId("submit-vehicle-button").click();

    await expect(page.getByTestId("vehicle-feedback-banner")).toContainText(
      uniquePlate,
    );

    // Verify new vehicle appears in public booking catalog (?site=book)
    await page.goto("/?site=book&start=2026-12-10&end=2026-12-11");
    await expect(
      page.getByTestId(`catalog-card-${uniquePlate}`),
    ).toBeVisible();
  });

  test("E2E-03 & E2E-04: Customer creates booking -> appears in Pesanan Saya -> Admin transitions pending -> confirmed -> ongoing -> completed", async ({
    page,
  }) => {
    // 1. Login as Customer on Booking surface
    await page.goto("/?site=book&start=2026-12-15&end=2026-12-16");
    await page.getByTestId("login-google-button").first().click();
    await page.getByTestId("emulator-login-customer").first().click();
    await expect(page.getByTestId("active-user-pill")).toContainText(
      "Nadia Siregar",
    );

    // 2. Select available vehicle BK 1750 AAD (Toyota Avanza 1.5 G CVT)
    await page.getByTestId("select-vehicle-BK 1750 AAD").click();
    await expect(page.getByTestId("vehicle-checkout-view")).toBeVisible();

    // 3. Submit checkout for 2026-12-15 to 2026-12-16 (2 inclusive days)
    await page.getByTestId("checkout-start-date").fill("2026-12-15");
    await page.getByTestId("checkout-end-date").fill("2026-12-16");
    await page.getByTestId("submit-booking-button").click();

    // 4. Redirected to Booking Detail page with booking code RG-...
    await expect(page.getByTestId("booking-detail-view")).toBeVisible();
    const bookingCode = (
      await page.getByTestId("detail-booking-code").innerText()
    ).trim();
    expect(bookingCode).toMatch(/^RG-\d{6}-[A-Z0-9]{4}$/);

    // Verify initial status is pending + unpaid => "Menunggu Pembayaran"
    await expect(page.getByTestId("booking-status-badge")).toContainText(
      "Menunggu Pembayaran",
    );
    await expect(
      page.getByTestId("simulate-upload-proof-button"),
    ).toBeVisible();

    // 5. Simulate QRIS paid -> UI immediately revalidates without reload, button disappears, badge shows "Menunggu Konfirmasi Admin"
    await page.getByTestId("simulate-upload-proof-button").click();
    await expect(page.getByTestId("booking-detail-feedback")).toBeVisible();
    await expect(page.getByTestId("booking-status-badge")).toContainText(
      "Menunggu Konfirmasi Admin",
    );
    await expect(page.getByTestId("simulate-upload-proof-button")).toHaveCount(
      0,
    );
    await expect(page.getByTestId("paid-status-callout")).toBeVisible();

    // 6. Verify it appears in "Pesanan Saya" with "Menunggu Konfirmasi Admin" & "Lunas"
    await page.goto("/bookings?site=book");
    const myCard = page.getByTestId(`my-booking-card-${bookingCode}`);
    await expect(myCard).toBeVisible();
    await expect(myCard).toContainText("Menunggu Konfirmasi Admin");
    await expect(myCard).toContainText("Lunas");

    // 7. Logout customer & login as Admin to process state machine transitions
    await page.getByTestId("logout-button").click();
    await expect(
      page.getByTestId("login-google-button").first(),
    ).toBeVisible();
    await page.goto("/bookings?site=admin");
    await page.getByTestId("login-google-button").first().click();
    await page.getByTestId("emulator-login-admin").first().click();

    await expect(page.getByTestId("admin-bookings-view")).toBeVisible();
    const row = page.getByTestId(`booking-row-${bookingCode}`);
    await expect(row).toBeVisible();
    await expect(row).toContainText("Menunggu Konfirmasi Admin");
    await expect(row).toContainText("Lunas");

    // Transition: pending -> confirmed ("Siap Diambil")
    await page.getByTestId(`transition-${bookingCode}-confirmed`).click();
    await expect(page.getByTestId("booking-feedback-banner")).toContainText(
      "Konfirmasi",
    );
    await expect(row).toContainText("Siap Diambil");

    // Transition: confirmed -> ongoing ("Sedang Disewa")
    await page.getByTestId(`transition-${bookingCode}-ongoing`).click();
    await expect(page.getByTestId("booking-feedback-banner")).toContainText(
      "Ongoing",
    );
    await expect(row).toContainText("Sedang Disewa");

    // Transition: ongoing -> completed ("Selesai")
    await page.getByTestId(`transition-${bookingCode}-completed`).click();
    await expect(page.getByTestId("booking-feedback-banner")).toContainText(
      "Selesaikan Sewa",
    );
    await expect(row).toContainText("Selesai");
  });

  test("E2E-05: Customer cancels a pending booking and vehicle becomes available again for those dates", async ({
    page,
  }) => {
    await page.goto("/?site=book&start=2026-12-20&end=2026-12-21");
    await page.getByTestId("login-google-button").first().click();
    await page.getByTestId("emulator-login-customer").first().click();

    // Book Toyota Agya GR Sport (BK 1482 AAC) for 2026-12-20..2026-12-21
    await page.getByTestId("select-vehicle-BK 1482 AAC").click();
    await page.getByTestId("checkout-start-date").fill("2026-12-20");
    await page.getByTestId("checkout-end-date").fill("2026-12-21");
    await page.getByTestId("submit-booking-button").click();

    await expect(page.getByTestId("booking-detail-view")).toBeVisible();

    // Cancel the pending booking
    await page.getByTestId("cancel-booking-button").click();
    await expect(page.getByTestId("booking-detail-feedback")).toContainText(
      "dibatalkan",
    );

    // Verify BK 1482 AAC is available again in catalog for 2026-12-20..2026-12-21
    await page.goto("/?site=book&start=2026-12-20&end=2026-12-21");
    await expect(
      page.getByTestId("catalog-card-BK 1482 AAC"),
    ).toBeVisible();
  });

  test("E2E-06: Vehicle in active maintenance is automatically hidden from customer availability search", async ({
    page,
  }) => {
    // Seed data has BK 7099 AAL (Toyota Hiace Premio) in maintenance ("in_progress") from 2026-11-14 to 2026-11-18
    await page.goto("/?site=book&start=2026-11-15&end=2026-11-16");
    await expect(page.getByTestId("book-catalog-view")).toBeVisible();
    await expect(
      page.getByTestId("catalog-card-BK 7099 AAL"),
    ).toHaveCount(0);
  });

  test("E2E-07: AI Smart Vehicle Recommendation ('Bantu Saya Pilih') returns valid available vehicles", async ({
    page,
  }) => {
    await page.goto("/?site=book&start=2026-11-25&end=2026-11-27");
    await expect(page.getByTestId("ai-recommendation-panel")).toBeVisible();

    await page
      .getByTestId("ai-query-input")
      .fill(
        "Saya butuh mobil keluarga 7 kursi matic ke Danau Toba budget 500rb per hari",
      );
    await page.getByTestId("ai-submit-button").click();

    await expect(
      page.getByTestId("ai-recommendation-results"),
    ).toBeVisible();
    await expect(page.getByTestId("ai-rec-card-1")).toBeVisible();
  });

  test("E2E-09: Interactive PickupMap, Light/Dark Theme Toggle persistence, and 320px Mobile Hamburger Drawer", async ({
    page,
  }) => {
    await page.goto("/");

    // 1. Verify PickupMap section on Landing Page with 3 locations & Google Maps route links
    await expect(page.getByTestId("pickup-map-section")).toBeVisible();
    await expect(
      page.getByTestId("location-card-kualanamu-airport"),
    ).toContainText("Bandara Kualanamu");
    await expect(
      page.getByTestId("location-card-stasiun-medan"),
    ).toContainText("Stasiun Medan");
    await expect(
      page.getByTestId("location-card-kantor-rentgo-medan"),
    ).toContainText("Kantor RentGo Medan");
    await expect(page.getByTestId("use-my-location-button")).toBeVisible();
    await expect(
      page.getByTestId("open-route-kualanamu-airport"),
    ).toHaveAttribute(
      "href",
      "https://www.google.com/maps/dir/?api=1&destination=3.6422,98.8853",
    );

    // 2. Verify ThemeToggle switches between light and dark theme and persists across reload
    const toggleBtn = page.getByTestId("theme-toggle-button").first();
    await expect(toggleBtn).toBeVisible();
    const initialTheme = await page.locator("html").getAttribute("data-theme");
    await toggleBtn.click();
    const toggledTheme = await page.locator("html").getAttribute("data-theme");
    expect(toggledTheme).toBe(initialTheme === "dark" ? "light" : "dark");

    await page.reload();
    await expect(page.locator("html")).toHaveAttribute(
      "data-theme",
      toggledTheme || "dark",
    );

    // 3. Verify 320px mobile viewport: Hamburger drawer opens & closes on Esc key
    await page.setViewportSize({ width: 320, height: 640 });
    const hamburgerBtn = page.getByTestId("mobile-hamburger-button").first();
    await expect(hamburgerBtn).toBeVisible();
    await hamburgerBtn.click();

    const drawer = page.getByTestId("mobile-nav-drawer");
    await expect(drawer).toBeVisible();

    await page.keyboard.press("Escape");
    await expect(drawer).toHaveCount(0);
  });
});
