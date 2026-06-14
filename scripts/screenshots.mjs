import { chromium } from "playwright";
import { mkdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT = join(__dirname, "..", "docs", "screenshots");
mkdirSync(OUT, { recursive: true });

const BASE = process.env.BASE_URL || "http://localhost:3000";

const pages = [
  ["home", "/"],
  ["fixtures", "/fixtures"],
  ["groups", "/groups"],
  ["knockout", "/knockout"],
  ["teams", "/teams"],
  ["players", "/players"],
  ["stadiums", "/stadiums"],
  ["stats", "/stats"],
  ["news", "/news"],
  ["travel", "/travel"],
  ["watch-parties", "/watch-parties"],
  ["wall-chart", "/wall-chart"],
  ["my-world-cup", "/my-world-cup"],
  ["reminders", "/reminders"],
  ["settings", "/settings"],
  ["tickets", "/tickets"]
];

const browser = await chromium.launch();
const ctx = await browser.newContext({
  viewport: { width: 1280, height: 900 },
  deviceScaleFactor: 2,
  colorScheme: "dark"
});
const page = await ctx.newPage();

for (const [name, path] of pages) {
  await page.goto(BASE + path, { waitUntil: "networkidle", timeout: 60000 });
  // Let countdowns, slideshow fades and client data settle.
  await page.waitForTimeout(2500);
  // Dismiss the PWA install prompt if present so it doesn't cover content.
  await page.evaluate(() => {
    document.querySelectorAll("button").forEach((b) => {
      if (b.textContent && b.textContent.trim() === "✕") b.click();
    });
  });
  await page.waitForTimeout(300);
  const file = join(OUT, `${name}.png`);
  await page.screenshot({ path: file, fullPage: true });
  console.log("captured", name);
}

await browser.close();
console.log("done");
