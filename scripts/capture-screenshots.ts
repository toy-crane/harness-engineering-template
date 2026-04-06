import { chromium } from "playwright";
import { mkdirSync } from "fs";
import { resolve } from "path";

const VIEWPORTS = {
  mobile: { width: 375, height: 812 },
  desktop: { width: 1280, height: 900 },
} as const;

type ViewportName = keyof typeof VIEWPORTS;

function parseArgs(argv: string[]) {
  const args = argv.slice(2);
  let url = "";
  let output = "";
  let viewports: ViewportName[] = ["mobile", "desktop"];

  for (let i = 0; i < args.length; i++) {
    switch (args[i]) {
      case "--url":
        url = args[++i];
        break;
      case "--output":
        output = args[++i];
        break;
      case "--viewports":
        viewports = args[++i].split(",") as ViewportName[];
        break;
    }
  }

  if (!url || !output) {
    console.error("Usage: bun scripts/capture-screenshots.ts --url <url> --output <dir> [--viewports mobile,desktop]");
    process.exit(1);
  }

  return { url, output: resolve(output), viewports };
}

async function main() {
  const { url, output, viewports } = parseArgs(process.argv);

  mkdirSync(output, { recursive: true });

  const browser = await chromium.launch({ headless: true });

  for (const vp of viewports) {
    const size = VIEWPORTS[vp];
    if (!size) {
      console.error(`Unknown viewport: ${vp}`);
      continue;
    }

    const page = await browser.newPage({ viewport: size });
    await page.goto(url, { waitUntil: "networkidle" });
    const path = resolve(output, `${vp}.png`);
    await page.screenshot({ path, fullPage: true });
    console.log(`Captured: ${path}`);
    await page.close();
  }

  await browser.close();
}

main();
