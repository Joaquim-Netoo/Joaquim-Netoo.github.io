/**
 * Testes de interação e acessibilidade (Playwright + axe-core, gratuitos).
 * Uso: com o servidor rodando → node scripts/testar-interacoes.mjs [url] [pasta]
 */
import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import AxeBuilder from "@axe-core/playwright";
import { chromium } from "playwright";
import sharp from "sharp";

const URL = process.argv[2] ?? "http://localhost:5173/";
const OUT = path.resolve(process.argv[3] ?? "validacao");
mkdirSync(OUT, { recursive: true });
const wait = (ms) => new Promise((r) => setTimeout(r, ms));
const r = {};
const errors = [];

const browser = await chromium.launch({ channel: "chrome", args: ["--use-angle=default", "--enable-gpu"] });

// ── Teclado, Dialog, filtros, terminal, desligar ──
{
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await ctx.newPage();
  page.on("console", (m) => ["error", "warning"].includes(m.type()) && errors.push(m.text()));
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto(`${URL}?sem-intro`, { waitUntil: "networkidle" });

  await page.keyboard.press("Tab");
  r.firstFocus = await page.evaluate(() => document.activeElement?.textContent?.trim());

  // Dialog pelo teclado
  const btn = page.locator("#projetos article h3 button").first();
  await btn.focus();
  await page.keyboard.press("Enter");
  await page.waitForSelector("[role=dialog]");
  await wait(300);
  r.dialogTitle = await page.locator("[role=dialog] h2").first().textContent();
  r.dialogHasLangBar = (await page.locator("[role=dialog] [role=img]").count()) > 0;
  r.dialogLinks = await page.locator("[role=dialog] a").evaluateAll((as) => as.map((a) => a.textContent.trim()));
  await page.screenshot({ path: `${OUT}/dialog-projeto.png` });
  await page.keyboard.press("Escape");
  await wait(300);
  r.dialogClosed = (await page.locator("[role=dialog]").count()) === 0;
  r.focusReturned = await page.evaluate(() => document.activeElement?.closest("article") !== null);

  // Filtro e ordenação do arquivo
  await page.locator("#arquivo").scrollIntoViewIfNeeded();
  const total = await page.locator("#arquivo tbody tr:not(:has([aria-controls]))").count();
  // primeira aba de linguagem (depois de TODAS): todas as linhas filtradas devem ser dessa linguagem
  const tab = page.getByRole("tab").nth(1);
  const lang = (await tab.textContent()).replace(/[[\]]/g, "").trim();
  await tab.click();
  // a coluna de tecnologias guarda a lista completa no title
  const langs = await page.locator("#arquivo tbody tr:visible td:nth-child(2)").evaluateAll((tds) => tds.map((td) => td.title));
  await page.getByRole("button", { name: "NOME" }).click();
  // a ordenação vale dentro de cada grupo (projetos e pasta FACULDADE\): checa o grupo principal
  const names = await page.locator("#arquivo tbody:first-of-type tr td:first-child button").allTextContents();
  r.arquivo = {
    total,
    filtro: `${lang}: ${langs.length}`,
    filtroCorreto: langs.length > 0 && langs.every((l) => l.toUpperCase().split(", ").includes(lang)),
    ordenadoPorNome: names.join(",") === [...names].sort((a, b) => a.localeCompare(b, "pt-BR", { sensitivity: "base" })).join(","),
  };

  // Terminal Ctrl+K
  await page.keyboard.press("Control+k");
  await page.waitForSelector("[cmdk-input]");
  await page.keyboard.type("tema ambar");
  await page.keyboard.press("Enter");
  await wait(200);
  r.temaAmbar = await page.evaluate(() => document.documentElement.dataset.phosphor);
  await page.screenshot({ path: `${OUT}/terminal-ctrl-k.png` });
  await page.keyboard.type("help");
  await page.keyboard.press("Enter");
  await wait(150);
  r.helpPrinted = await page.locator("[cmdk-root] pre").count();
  await page.keyboard.press("Escape");
  await page.evaluate(() => {
    localStorage.removeItem("lt:phosphor");
    document.documentElement.dataset.phosphor = "green";
  });

  // Desligar / ligar
  await page.getByRole("button", { name: /DESLIGAR/ }).click();
  await wait(1800);
  r.offMessage = await page.locator("#tela-off .off-msg").isVisible();
  await page.screenshot({ path: `${OUT}/desligado.png` });
  await page.getByRole("button", { name: "LIGAR DE NOVO" }).click();
  await wait(1000);
  r.ligouDeNovo = await page.evaluate(() => getComputedStyle(document.getElementById("tela")).visibility === "visible" && window.scrollY < 5);

  // axe (WCAG 2 AA)
  const axe = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21aa"]).exclude("canvas").analyze();
  r.axe = axe.violations.map((v) => ({ id: v.id, impact: v.impact, n: v.nodes.length, exemplo: v.nodes[0]?.target?.join(" ") }));
  await ctx.close();
}

// ── Disquetes 3D: hover + clique abre o Dialog ──
{
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await ctx.newPage();
  await page.goto(`${URL}?sem-intro`, { waitUntil: "networkidle" });
  await page.evaluate(() => document.getElementById("projetos").scrollIntoView());
  await wait(1500);
  const canvas = page.locator("#projetos canvas");
  r.floppyCanvas = (await canvas.count()) > 0;
  if (r.floppyCanvas) {
    await canvas.scrollIntoViewIfNeeded();
    await wait(800);
    const box = await canvas.boundingBox();
    // procura um ponto que acerte um disquete (cursor vira pointer)
    let hit = null;
    for (let y = 0.25; y <= 0.75 && !hit; y += 0.05)
      for (let x = 0.35; x <= 0.65 && !hit; x += 0.1) {
        await page.mouse.move(box.x + box.width * x, box.y + box.height * y);
        await wait(60);
        if ((await page.evaluate(() => document.body.style.cursor)) === "pointer") hit = [x, y];
      }
    r.floppyHover = Boolean(hit);
    await page.screenshot({ path: `${OUT}/disquete-hover.png` });
    if (hit) {
      await page.mouse.click(box.x + box.width * hit[0], box.y + box.height * hit[1]);
      await wait(250);
      await page.screenshot({ path: `${OUT}/disquete-drive.png` });
      await page.waitForSelector("[role=dialog]", { timeout: 3000 }).catch(() => {});
      r.floppyOpensDialog = (await page.locator("[role=dialog]").count()) > 0;
    }
  }
  await ctx.close();
}

// ── Flashes na intro (WCAG 2.3.1): no máximo 3 por segundo ──
{
  const ctx = await browser.newContext({ viewport: { width: 960, height: 600 } });
  const page = await ctx.newPage();
  await page.goto(URL, { waitUntil: "networkidle" });
  await wait(900);
  await page.keyboard.press("Enter");
  const samples = [];
  const t0 = Date.now();
  while (Date.now() - t0 < 4200) {
    const buf = await page.screenshot({ type: "jpeg", quality: 60 });
    const { channels } = await sharp(buf).greyscale().stats();
    samples.push({ t: Date.now() - t0, l: channels[0].mean / 255 });
  }
  // conta transições opostas ≥ 10% de luminância (definição de flash geral da WCAG)
  const ext = [];
  let dir = 0;
  let ref = samples[0];
  for (const s of samples.slice(1)) {
    const d = s.l - ref.l;
    if (Math.abs(d) >= 0.1) {
      const nd = Math.sign(d);
      if (nd !== dir) ext.push(s.t);
      dir = nd;
      ref = s;
    } else if (Math.sign(d) === dir) ref = s;
  }
  let maxPerSecond = 0;
  for (const t of ext) maxPerSecond = Math.max(maxPerSecond, ext.filter((u) => u >= t && u < t + 1000).length / 2);
  r.flash = { amostras: samples.length, maxLuminancia: Math.max(...samples.map((s) => s.l)).toFixed(2), flashesPorSegundoMax: maxPerSecond };
  await ctx.close();
}

// ── CPU 4× mais lenta: a qualidade cai sem travar ──
{
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await ctx.newPage();
  const cdp = await ctx.newCDPSession(page);
  await cdp.send("Emulation.setCPUThrottlingRate", { rate: 4 });
  await page.goto(URL, { waitUntil: "networkidle" });
  await wait(1500);
  await page.keyboard.press("Enter");
  const t = Date.now();
  await page.waitForFunction(() => document.querySelector("[data-intro-layer]") === null, null, { timeout: 15000 }).catch(() => {});
  r.cpu4x = { introTerminouEmMs: Date.now() - t, fps: (await page.evaluate(() => window.__introFps ?? [])).map(Math.round) };
  await ctx.close();
}

await browser.close();
r.consoleErrors = errors;
writeFileSync(`${OUT}/interacoes.json`, JSON.stringify(r, null, 2));
console.log(JSON.stringify(r, null, 2));
