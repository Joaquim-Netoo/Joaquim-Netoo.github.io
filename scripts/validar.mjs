/**
 * Validação com Playwright + Chrome local (gratuito).
 * Uso: node scripts/validar.mjs [url] [pasta-de-saída]
 * Gera screenshots da intro (cada label), de cada seção em 1440/768/390 e um relatório JSON.
 */
import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import { chromium } from "playwright";

const URL = process.argv[2] ?? "http://localhost:5173/";
const OUT = path.resolve(process.argv[3] ?? "validacao");
mkdirSync(OUT, { recursive: true });

const report = { url: URL, console: [], pageErrors: [], externalRequests: [], failed: [], checks: {} };
const browser = await chromium.launch({ channel: "chrome", args: ["--use-angle=default", "--enable-gpu"] });

function watch(page, tag) {
  page.on("console", (m) => {
    if (["error", "warning"].includes(m.type())) report.console.push(`[${tag}] ${m.type()}: ${m.text()}`);
  });
  page.on("pageerror", (e) => report.pageErrors.push(`[${tag}] ${e.message}`));
  page.on("request", (r) => {
    const u = r.url();
    if (/api\.github\.com|opengraph\.githubassets\.com/.test(u)) report.externalRequests.push(u);
  });
  page.on("response", (r) => {
    if (r.status() >= 400) report.failed.push(`[${tag}] ${r.status()} ${r.url()}`);
  });
}

const wait = (ms) => new Promise((r) => setTimeout(r, ms));

// ── 1. Intro completa em 1440 ──
{
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await ctx.newPage();
  watch(page, "intro");
  await page.goto(URL, { waitUntil: "networkidle" });
  await wait(1200);
  await page.screenshot({ path: `${OUT}/intro-0-escuro.png` });
  await page.keyboard.press("Enter");
  const t0 = Date.now();
  const shots = [
    ["intro-1-power", 90],
    ["intro-2-liga-ponto", 200],
    ["intro-3-liga-linha", 450],
    ["intro-4-liga-abre", 800],
    ["intro-5-boot", 1700],
    ["intro-6-boot-fim", 2450],
    ["intro-7-mergulho", 3100],
    ["intro-8-atravessa", 3650],
    ["intro-9-final", 5200],
  ];
  for (const [name, at] of shots) {
    const d = at - (Date.now() - t0);
    if (d > 0) await wait(d);
    await page.screenshot({ path: `${OUT}/${name}.png` });
  }
  report.checks.introFps = await page.evaluate(() => window.__introFps ?? null);
  report.checks.introDone = await page.evaluate(() => document.documentElement.dataset.intro);
  report.checks.introLayerGone = (await page.$("[data-intro-layer]")) === null;
  await ctx.close();
}

// ── 2. Visita repetida (versão curta) e pular com Esc ──
{
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await ctx.newPage();
  watch(page, "curta");
  await page.goto(URL, { waitUntil: "networkidle" });
  await page.keyboard.press("Escape");
  await wait(600);
  report.checks.escSkips = (await page.$("[data-intro-layer]")) === null;
  await page.reload({ waitUntil: "networkidle" });
  const t = Date.now();
  await page.waitForFunction(() => document.querySelector("[data-intro-layer]") === null, null, { timeout: 8000 });
  report.checks.shortIntroMs = Date.now() - t;
  await ctx.close();
}

// ── 3. Âncora pula a intro ──
{
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await ctx.newPage();
  watch(page, "ancora");
  await page.goto(`${URL}#projetos`, { waitUntil: "networkidle" });
  await wait(500);
  report.checks.anchorSkips = (await page.$("[data-intro-layer]")) === null;
  report.checks.anchorScrollY = await page.evaluate(() => window.scrollY);
  await page.screenshot({ path: `${OUT}/ancora-projetos.png` });
  await ctx.close();
}

// ── 4. Reduced motion ──
{
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, reducedMotion: "reduce" });
  const page = await ctx.newPage();
  watch(page, "reduced");
  await page.goto(URL, { waitUntil: "networkidle" });
  await wait(400);
  await page.screenshot({ path: `${OUT}/reduced-0-estatica.png` });
  await wait(1600);
  report.checks.reducedHasCanvas = (await page.$("canvas")) !== null;
  await page.screenshot({ path: `${OUT}/reduced-1-final.png` });
  await ctx.close();
}

// ── 5. Seções em 3 larguras ──
for (const width of [1440, 768, 390]) {
  const ctx = await browser.newContext({ viewport: { width, height: width === 390 ? 844 : 900 }, deviceScaleFactor: 1 });
  const page = await ctx.newPage();
  watch(page, `secoes-${width}`);
  await page.goto(`${URL}?sem-intro`, { waitUntil: "networkidle" });
  await wait(400);
  report.checks[`overflowX-${width}`] = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
  for (const id of ["topo", "projetos", "arquivo", "sobre", "stack", "atividade", "contato"]) {
    await page.evaluate((id) => {
      const el = document.getElementById(id);
      window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - (id === "topo" ? 0 : 60), behavior: "instant" });
    }, id);
    await wait(900);
    await page.screenshot({ path: `${OUT}/${width}-${id}.png` });
  }
  await page.evaluate(() => window.scrollTo({ top: document.body.scrollHeight, behavior: "instant" }));
  await wait(700);
  await page.screenshot({ path: `${OUT}/${width}-footer.png` });
  await ctx.close();
}

report.checks.h1Count = null;
{
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await ctx.newPage();
  await page.goto(`${URL}?sem-intro`, { waitUntil: "networkidle" });
  report.checks.h1Count = await page.$$eval("h1", (h) => h.length);
  report.checks.fontsLoaded = await page.evaluate(async () => {
    await document.fonts.ready;
    return ["Departure Mono", "Atkinson Hyperlegible Next", "Newsreader"].map((f) => [f, document.fonts.check(`italic 40px "${f}"`) || document.fonts.check(`40px "${f}"`)]);
  });
  await ctx.close();
}

await browser.close();
writeFileSync(`${OUT}/relatorio.json`, JSON.stringify(report, null, 2));
console.log(JSON.stringify(report, null, 2));
