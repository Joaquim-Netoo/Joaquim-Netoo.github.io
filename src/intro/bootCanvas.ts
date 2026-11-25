import { CanvasTexture, LinearFilter, SRGBColorSpace } from "three";

/**
 * POST fictício desenhado num canvas 2D e usado como textura da tela.
 * draw(typed, bar) é chamado pelo GSAP: typed = 0..1 dos caracteres digitados, bar = 0..1 da barra real.
 */
export function createBootScreen(opts: { nome: string; phosphor: string; repos: number }) {
  const W = 1024;
  const H = 768;
  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d") as CanvasRenderingContext2D;
  const texture = new CanvasTexture(canvas);
  texture.colorSpace = SRGBColorSpace;
  texture.minFilter = LinearFilter;
  texture.generateMipmaps = false;

  const lines = [
    `${opts.nome} BIOS v1.0   (C) 2026`,
    "MEMORY TEST ........ 640K OK",
    `DETECTING PROJECTS ...... ${String(opts.repos).padStart(2, "0")} OK`,
    "LOADING PORTFOLIO",
  ];
  const total = lines.reduce((s, l) => s + l.length, 0);
  const BG = "#060b07";
  const FONT = '36px "Departure Mono", monospace';
  const X = 84;
  const Y0 = 132;
  const LH = 58;

  let last = "";

  function draw(typed: number, bar: number, cursor = true) {
    const key = `${typed.toFixed(3)}|${bar.toFixed(2)}|${cursor}`;
    if (key === last) return;
    last = key;

    ctx.fillStyle = BG;
    ctx.fillRect(0, 0, W, H);
    ctx.font = FONT;
    ctx.textBaseline = "alphabetic";
    ctx.fillStyle = opts.phosphor;
    ctx.shadowColor = opts.phosphor;
    ctx.shadowBlur = 10;

    // logotipo do "fabricante" no canto
    ctx.globalAlpha = 0.55;
    ctx.fillText("640K", W - X - ctx.measureText("640K").width, Y0);
    ctx.globalAlpha = 1;

    let chars = Math.floor(typed * total);
    let y = Y0;
    let cx = X;
    let cy = Y0;
    for (const line of lines) {
      if (chars <= 0) break;
      const shown = line.slice(0, chars);
      ctx.fillText(shown, X, y);
      cx = X + ctx.measureText(shown).width;
      cy = y;
      chars -= line.length;
      y += LH;
    }

    if (typed >= 1) {
      const cells = 18;
      const filled = Math.round(bar * cells);
      const barText = `${"█".repeat(filled)}${"░".repeat(cells - filled)}  ${Math.round(bar * 100)}%`;
      ctx.fillText(barText, X, y);
      cx = X + ctx.measureText(barText).width;
      cy = y;
    }

    if (cursor) ctx.fillRect(typed === 0 ? X : cx + 6, (typed === 0 ? Y0 : cy) - 30, 20, 36);
    texture.needsUpdate = true;
  }

  draw(0, 0, false);

  return {
    texture,
    draw,
    dispose: () => texture.dispose(),
  };
}
