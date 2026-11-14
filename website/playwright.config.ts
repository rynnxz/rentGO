import fs from "node:fs";
import path from "node:path";
import os from "node:os";
import { defineConfig, devices } from "@playwright/test";

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

export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: 0,
  workers: 1,
  reporter: "list",
  use: {
    baseURL: "http://localhost:3000",
    trace: "on-first-retry",
    launchOptions: executablePath ? { executablePath } : undefined,
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
  webServer: {
    command: "npm run dev",
    url: "http://localhost:3000",
    reuseExistingServer: !process.env.CI,
    timeout: 120000,
  },
});
