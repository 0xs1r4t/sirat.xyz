#!/usr/bin/env node
// Screenshot capture half of the garden A/B harness (garden-webgpu-plan.md
// §6 "Screenshot A/B harness", docs/garden-screenshot-harness.md).
//
// Navigates the live dev server, pins every source of non-determinism this
// scene has (theme, reduced-motion → zeroed wind, device tier → fixed
// farDistance/windOctaves/DPR, the animated moon's clock), waits for the
// full scene (not just terrain) to have actually drawn, and screenshots
// just the garden's <canvas> — not the full page, so the Leva panel that
// debug mode renders never enters the shot.
//
// Usage:
//   node scripts/garden-capture.mjs [options]
//
// Options:
//   --url <base>       Base URL of the running dev/prod server (default http://localhost:4321)
//   --browser <name>   chromium | firefox | all (default chromium)
//   --theme <name>     night | day | both (default both)
//   --tier <name>      high | mid | low (default high)
//   --label <name>     Extra suffix on output filenames (default none)
//   --out <dir>        Output directory (default docs/garden-reference-frames/web)
//   --width <n>        Viewport width (default 1280)
//   --height <n>        Viewport height (default 800)

import { chromium, firefox } from "playwright";
import { mkdir } from "node:fs/promises";
import path from "node:path";

const args = process.argv.slice(2);
const getArg = (name, fallback) => {
  const i = args.indexOf(`--${name}`);
  return i === -1 ? fallback : args[i + 1];
};

const BASE_URL = getArg("url", "http://localhost:4321");
const BROWSER_ARG = getArg("browser", "chromium");
const THEME_ARG = getArg("theme", "both");
const TIER = getArg("tier", "high");
const LABEL = getArg("label", "");
const OUT_DIR = getArg(
  "out",
  path.join("docs", "garden-reference-frames", "web"),
);
const WIDTH = Number(getArg("width", "1280"));
const HEIGHT = Number(getArg("height", "800"));

// next-themes' storageKey defaults to "theme"; attribute="class" (layout.tsx)
// so the value is applied directly as the <html> class — matching
// useGardenTheme.ts's DARK_THEME_CLASS check.
const THEME_PRESETS = {
  night: { storageValue: "blueberry-lemon", isDark: true },
  day: { storageValue: "strawberry-matcha", isDark: false },
};

const BROWSERS = { chromium, firefox };

/** Pins every non-deterministic input this scene has, then screenshots the canvas. */
async function captureOne(browserType, browserName, themeName) {
  const preset = THEME_PRESETS[themeName];
  const browser = await browserType.launch();
  try {
    const context = await browser.newContext({
      viewport: { width: WIDTH, height: HEIGHT },
      deviceScaleFactor: 1, // pin DPR — Canvas dpr=[min,max] always clamps 1 into range
      reducedMotion: "reduce", // zeroes wind (Scene.tsx GardenRig: windSpeed/windStrength)
    });
    await context.addInitScript((storageValue) => {
      window.localStorage.setItem("theme", storageValue);
    }, preset.storageValue);

    const page = await context.newPage();
    const consoleErrors = [];
    page.on("console", (msg) => {
      if (msg.type() === "error") consoleErrors.push(msg.text());
    });

    const url = `${BASE_URL}/?debug&tier=${TIER}`;
    await page.goto(url, { waitUntil: "load" });

    const canvas = page.locator("#garden-canvas-root canvas");
    await canvas.waitFor({ state: "visible", timeout: 30_000 });

    // GardenRig's camera-pose effect (and the __gardenDebug bridge
    // registration right after it) has run once this flips true.
    await page.waitForFunction(() => window.__gardenDebug?.ready === true, {
      timeout: 30_000,
    });

    // Grass/flowers still have to finish their Suspense-gated texture loads
    // and mount their (chunked) meshes — poll the actual scene graph until
    // the mesh count stops growing, since renderer.info (drawCalls/
    // triangles) is known-unreliable here (see docs/garden-perf-benchmark.md's
    // draws=0/tris=0 gotcha) and load time varies by machine.
    let lastCount = -1;
    let stableStreak = 0;
    const deadline = Date.now() + 30_000;
    while (stableStreak < 3) {
      if (Date.now() > deadline) {
        throw new Error("Timed out waiting for the scene's mesh count to stabilize");
      }
      const count = await page.evaluate(
        () => window.__gardenDebug?.getMeshCount() ?? 0,
      );
      stableStreak = count > 0 && count === lastCount ? stableStreak + 1 : 0;
      lastCount = count;
      await page.waitForTimeout(300);
    }

    // Pin the moon clock (night theme's only remaining non-deterministic
    // input once reducedMotion has zeroed wind) — t=0 for a stable,
    // reproducible angle regardless of the isDark check itself. Under
    // frameloop="demand" this invalidate() only guarantees the *next* frame
    // reflects it, so follow with a couple of rAFs to be sure it presented.
    await page.evaluate(() => window.__gardenDebug.setFixedTime(0));
    await page.evaluate(
      () =>
        new Promise((resolve) => {
          requestAnimationFrame(() => requestAnimationFrame(resolve));
        }),
    );

    // canvas.screenshot() clips to the element's bounding box in the
    // *composited* page, not raw GPU pixels — since the garden canvas fills
    // the viewport, that box also picks up whatever DOM sits on top of it:
    // Leva's debug panel, the site's header/nav/sidebar-toggle chrome, the
    // separate MouseTrail canvas (renders a colored blob at its default
    // (0,0) pointer position with no real cursor in headless capture), even
    // Next.js's own dev-mode indicator portal. Rather than chase every one
    // of those by selector, isolate the DOM path from <body> down to
    // #garden-canvas-root and hide every sibling along the way. Done last,
    // after the scene has settled — mutating the DOM this way earlier (right
    // after navigation) raced Next dev's hydration and printed a harmless
    // but noisy "hydration mismatch" console warning.
    await page.evaluate(() => {
      const root = document.getElementById("garden-canvas-root");
      let el = root;
      while (el && el.parentElement) {
        const parent = el.parentElement;
        for (const sibling of Array.from(parent.children)) {
          if (sibling !== el) {
            sibling.style.setProperty("display", "none", "important");
          }
        }
        el = parent;
        if (el === document.body) break;
      }
    });

    const suffix = LABEL ? `-${LABEL}` : "";
    const filename = `${browserName}-${themeName}-${TIER}${suffix}.png`;
    const outPath = path.join(OUT_DIR, filename);
    await mkdir(OUT_DIR, { recursive: true });
    await canvas.screenshot({ path: outPath });

    if (consoleErrors.length > 0) {
      console.warn(
        `  [warn] ${consoleErrors.length} console error(s) during ${filename}:`,
      );
      for (const e of consoleErrors.slice(0, 5)) console.warn(`    ${e}`);
    }

    console.log(`  captured ${outPath}`);
    return outPath;
  } finally {
    await browser.close();
  }
}

async function main() {
  const browserNames =
    BROWSER_ARG === "all" ? ["chromium", "firefox"] : [BROWSER_ARG];
  const themeNames = THEME_ARG === "both" ? ["night", "day"] : [THEME_ARG];

  for (const browserName of browserNames) {
    const browserType = BROWSERS[browserName];
    if (!browserType) {
      throw new Error(`Unknown browser "${browserName}" (chromium|firefox)`);
    }
    for (const themeName of themeNames) {
      if (!THEME_PRESETS[themeName]) {
        throw new Error(`Unknown theme "${themeName}" (night|day)`);
      }
      console.log(`Capturing ${browserName} / ${themeName} / tier=${TIER}...`);
      await captureOne(browserType, browserName, themeName);
    }
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
