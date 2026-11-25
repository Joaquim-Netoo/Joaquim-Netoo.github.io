import { Color, PlaneGeometry, ShaderMaterial, type Texture } from "three";

/**
 * Shader da tela do CRT (escrito do zero; técnica estudada em shaders MIT — ver REFERENCIAS.md).
 * uPower 0→1 faz a sequência de ligar: ponto → linha horizontal → abre na vertical → overshoot.
 * uFlicker é limitado a 2–3 % e lento (WCAG 2.3.1: nada pisca 3×/s).
 */
const vertex = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const fragment = /* glsl */ `
  uniform sampler2D uMap;
  uniform float uPower;
  uniform float uTime;
  uniform float uScanline;
  uniform float uCurvature;
  uniform float uChromatic;
  uniform float uFlicker;
  uniform float uNoise;
  uniform float uFade;
  uniform float uGlass;
  uniform vec3 uTube;
  varying vec2 vUv;

  float hash(vec2 p) { return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453); }

  vec2 barrel(vec2 uv, float k) {
    vec2 c = uv * 2.0 - 1.0;
    c *= 1.0 + k * dot(c, c);
    return c * 0.5 + 0.5;
  }

  void main() {
    vec2 uv = barrel(vUv, uCurvature);
    float inside = step(0.0, uv.x) * step(uv.x, 1.0) * step(0.0, uv.y) * step(uv.y, 1.0);
    vec2 c = uv - 0.5;

    // aberração cromática radial (mais forte nas bordas)
    vec2 off = c * uChromatic * dot(c, c) * 4.0;
    vec3 img;
    img.r = texture2D(uMap, uv + off).r;
    img.g = texture2D(uMap, uv).g;
    img.b = texture2D(uMap, uv - off).b;
    img = mix(img, uTube, uFade);

    // ── sequência de ligar ──
    float p = uPower;
    vec2 a = abs(vUv - 0.5) * 2.0;
    float wx = max(smoothstep(0.08, 0.40, p), 0.002);
    float hy = mix(0.008, 1.0, smoothstep(0.42, 0.80, p));
    float mx = 1.0 - smoothstep(wx - 0.03, wx, a.x);
    float my = 1.0 - smoothstep(hy - 0.012, hy, a.y);
    float mask = mx * my * smoothstep(0.06, 0.09, p);
    vec2 d = (vUv - 0.5) * vec2(1.33, 1.0);
    float dotI = exp(-dot(d, d) * 2600.0) * smoothstep(0.0, 0.05, p) * (1.0 - smoothstep(0.12, 0.30, p));
    float hot = 1.0 - smoothstep(0.42, 0.85, p);
    vec3 col = mix(img, vec3(1.3), hot * 0.9) * mask;
    col += vec3(1.5) * dotI;
    // um único overshoot de brilho, suave
    col *= 1.0 + 0.25 * smoothstep(0.78, 0.86, p) * (1.0 - smoothstep(0.86, 1.0, p));

    // linhas de varredura com antialias (somem quando virariam moiré)
    float yl = uv.y * 240.0;
    float fw = fwidth(yl);
    float lines = 0.5 + 0.5 * cos(yl * 6.28318);
    col *= 1.0 - uScanline * lines * (1.0 - smoothstep(0.35, 0.8, fw));

    // oscilação lenta de 2–3 %
    col *= 1.0 - uFlicker * (0.5 + 0.5 * sin(uTime * 1.7));
    col += (hash(uv * 900.0 + fract(uTime * 7.0)) - 0.5) * uNoise * step(0.01, p);

    // vinheta do tubo
    float vig = smoothstep(0.86, 0.32, length(c * vec2(1.0, 1.18)));
    col *= mix(0.5, 1.0, vig) * inside;

    // vidro: tom do tubo apagado + reflexo frio suave da janela
    vec2 g = vUv - vec2(0.28, 0.78);
    float refl = exp(-dot(g, g) * 7.0) * 0.06;
    col += uTube * 0.55 + vec3(0.5, 0.62, 0.85) * refl * uGlass;

    gl_FragColor = vec4(col, 1.0);
    #include <tonemapping_fragment>
    #include <colorspace_fragment>
  }
`;

export type ScreenUniforms = {
  uMap: { value: Texture };
  uPower: { value: number };
  uTime: { value: number };
  uScanline: { value: number };
  uCurvature: { value: number };
  uChromatic: { value: number };
  uFlicker: { value: number };
  uNoise: { value: number };
  uFade: { value: number };
  uGlass: { value: number };
  uTube: { value: Color };
};

export function createScreenMaterial(map: Texture) {
  const uniforms: ScreenUniforms = {
    uMap: { value: map },
    uPower: { value: 0 },
    uTime: { value: 0 },
    uScanline: { value: 0.14 },
    uCurvature: { value: 0.06 },
    uChromatic: { value: 0.006 },
    uFlicker: { value: 0.025 },
    uNoise: { value: 0.035 },
    uFade: { value: 0 },
    uGlass: { value: 1 },
    uTube: { value: new Color("#0d140f") },
  };
  const material = new ShaderMaterial({ uniforms, vertexShader: vertex, fragmentShader: fragment, toneMapped: false });
  return { material, uniforms };
}

/** Plano com "barriga" de tubo: vértices deslocados em z, mais no centro. */
export function createCurvedScreen(width: number, height: number, bulge: number) {
  const geo = new PlaneGeometry(width, height, 48, 36);
  const pos = geo.attributes.position;
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i) / (width / 2);
    const y = pos.getY(i) / (height / 2);
    pos.setZ(i, bulge * (1 - x * x * 0.85) * (1 - y * y * 0.85));
  }
  pos.needsUpdate = true;
  geo.computeVertexNormals();
  return geo;
}
