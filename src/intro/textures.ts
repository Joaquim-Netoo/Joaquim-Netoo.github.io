import { DataTexture, RepeatWrapping, RGBAFormat, SRGBColorSpace, NoColorSpace } from "three";

/** Ruído de valor simples, determinístico (sem texturas baixadas). */
function makeNoise(seed: number) {
  let s = seed;
  const rnd = () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
  const N = 64;
  const grid = Array.from({ length: N * N }, rnd);
  const at = (x: number, y: number) => grid[((y % N) + N) % N * N + (((x % N) + N) % N)];
  const smooth = (t: number) => t * t * (3 - 2 * t);
  return (x: number, y: number) => {
    const xi = Math.floor(x);
    const yi = Math.floor(y);
    const tx = smooth(x - xi);
    const ty = smooth(y - yi);
    const a = at(xi, yi) + (at(xi + 1, yi) - at(xi, yi)) * tx;
    const b = at(xi, yi + 1) + (at(xi + 1, yi + 1) - at(xi, yi + 1)) * tx;
    return a + (b - a) * ty;
  };
}

function fbm(noise: (x: number, y: number) => number, x: number, y: number, oct = 4) {
  let v = 0;
  let amp = 0.5;
  let f = 1;
  for (let i = 0; i < oct; i++) {
    v += noise(x * f, y * f) * amp;
    f *= 2;
    amp *= 0.5;
  }
  return v;
}

function tex(size: number, fill: (x: number, y: number) => [number, number, number], srgb: boolean) {
  const data = new Uint8Array(size * size * 4);
  for (let y = 0; y < size; y++)
    for (let x = 0; x < size; x++) {
      const [r, g, b] = fill(x, y);
      const i = (y * size + x) * 4;
      data[i] = r;
      data[i + 1] = g;
      data[i + 2] = b;
      data[i + 3] = 255;
    }
  const t = new DataTexture(data, size, size, RGBAFormat);
  t.wrapS = t.wrapT = RepeatWrapping;
  t.colorSpace = srgb ? SRGBColorSpace : NoColorSpace;
  t.needsUpdate = true;
  return t;
}

let plasticCache: { map: DataTexture; rough: DataTexture } | null = null;

/** Plástico bege envelhecido: cor levemente amarelada e manchada + rugosidade alta irregular. Gerado uma vez. */
export function createPlasticTextures() {
  if (plasticCache) return plasticCache;
  const n = makeNoise(7);
  const size = 128;
  const map = tex(
    size,
    (x, y) => {
      const v = fbm(n, x / 11, y / 11);
      const speck = n(x * 3.4, y * 3.4) > 0.93 ? -18 : 0;
      const yellow = fbm(n, x / 35 + 9, y / 35 + 3) * 22;
      return [
        Math.min(255, 214 - 10 + v * 18 + speck),
        Math.min(255, 205 - 12 + v * 16 + speck - yellow * 0.2),
        Math.min(255, 184 - 20 + v * 12 + speck - yellow),
      ];
    },
    true,
  );
  const rough = tex(
    size,
    (x, y) => {
      const v = 200 + fbm(n, x / 4.5 + 40, y / 4.5 + 11, 3) * 55;
      return [v, v, v];
    },
    false,
  );
  plasticCache = { map, rough };
  return plasticCache;
}

/** Libera as texturas compartilhadas (chamado quando a intro é desmontada). */
export function disposeSharedTextures() {
  plasticCache?.map.dispose();
  plasticCache?.rough.dispose();
  plasticCache = null;
}

/** Veios de madeira escura da mesa. */
export function createWoodTexture() {
  const n = makeNoise(31);
  return tex(
    256,
    (x, y) => {
      const warp = fbm(n, x / 45, y / 9, 3) * 6;
      const grain = 0.5 + 0.5 * Math.sin(y / 2.75 + warp * 2.2);
      const v = 0.75 + grain * 0.18 + fbm(n, x / 3, y / 20, 2) * 0.12;
      return [Math.round(52 * v), Math.round(36 * v), Math.round(26 * v)];
    },
    true,
  );
}
