/**
 * Gera, a partir da própria cena 3D (modo ?still), as imagens estáticas:
 *  - public/images/crt-static.webp  (versão reduced-motion / sem WebGL)
 *  - public/og-image.png            (Open Graph, 1200×630)
 * Uso: com o `npm run dev` rodando → node scripts/gerar-imagens.mjs [url]
 */
import { mkdirSync } from "node:fs";
import path from "node:path";
import { chromium } from "playwright";
import sharp from "sharp";

const URL = (process.argv[2] ?? "http://localhost:5173/") + "?still=1";
const ROOT = path.resolve(import.meta.dirname, "..");
mkdirSync(path.join(ROOT, "public/images"), { recursive: true });

const browser = await chromium.launch({ channel: "chrome", args: ["--use-angle=default", "--enable-gpu"] });

async function shot(width, height) {
  const page = await browser.newPage({ viewport: { width, height }, deviceScaleFactor: 1 });
  await page.goto(URL, { waitUntil: "networkidle" });
  await page.waitForFunction(() => window.__stillReady === true, null, { timeout: 20000 });
  await new Promise((r) => setTimeout(r, 700));
  const buf = await page.screenshot({ type: "png" });
  await page.close();
  return buf;
}

const stat = await shot(1600, 1000);
await sharp(stat).webp({ quality: 80 }).toFile(path.join(ROOT, "public/images/crt-static.webp"));
const og = await shot(1200, 630);
await sharp(og).png({ palette: true, quality: 85, compressionLevel: 9 }).toFile(path.join(ROOT, "public/og-image.png"));

await browser.close();
console.log("ok: public/images/crt-static.webp e public/og-image.png");
