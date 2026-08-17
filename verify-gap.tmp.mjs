import { chromium } from "playwright";

const browser = await chromium.launch({ args: ["--no-sandbox"] });
// Match the user's exact DevTools emulation: iPhone 14, 393x852, DPR 3.
const page = await browser.newPage({
  viewport: { width: 393, height: 852 },
  deviceScaleFactor: 3,
  userAgent:
    "Mozilla/5.0 (iPhone; CPU iPhone OS 18_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.6 Mobile/15E148 Safari/604.1",
});
await page.goto("http://localhost:4321/", { waitUntil: "networkidle" });
await page.waitForTimeout(1200);

// Right side (Garden controls) — open it.
const rightBtn = page.locator('button[aria-label*="sidebar"]').nth(1);
await rightBtn.evaluate((el) => el.click());
await page.waitForTimeout(700);
await page.screenshot({ path: "/tmp/claude-1000/-home-uwu-code-portfolio/822acf6b-5453-47aa-96d8-5898ded08e2b/scratchpad/gap-check-garden.png" });

const panel = page.locator('[aria-label="garden controls sidebar"]');
const panelBox = await panel.boundingBox();
const btnBox = await rightBtn.boundingBox();
const themeBtns = await page.locator('button[aria-label*="theme"]').evaluateAll((els) =>
  els.map((e) => e.getBoundingClientRect()),
);
const lastTheme = themeBtns[themeBtns.length - 1];

console.log("panel box:", JSON.stringify(panelBox));
console.log("button box:", JSON.stringify(btnBox));
console.log("last theme button bottom:", lastTheme.bottom);
console.log("gap panel-bottom to button-top (px):", panelBox.y + panelBox.height - btnBox.y);
console.log("gap theme-bottom to panel-top (px):", panelBox.y - lastTheme.bottom);

await browser.close();
