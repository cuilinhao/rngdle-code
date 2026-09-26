import { defineConfig } from "@playwright/test";
export default defineConfig({
  testDir: "./tests/browser",
  timeout: 45000,
  expect: { timeout: 10000 },
  fullyParallel: true,
  workers: 3,
  reporter: [
    ["list"],
    ["json", { outputFile: "verification/browser-results.json" }],
    ["html", { open: "never" }],
  ],
  use: {
    baseURL: process.env.BASE_URL || "http://127.0.0.1:5173",
    channel: process.env.CI ? undefined : "chrome",
    headless: !!process.env.CI,
    viewport: { width: 1440, height: 1000 },
    locale: "en-US",
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
  },
  outputDir: "test-results",
});
