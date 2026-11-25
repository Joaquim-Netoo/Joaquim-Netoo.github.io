# REFERÊNCIAS — "Ligue a Tela"

Pesquisa feita antes de qualquer código de UI. Regra: estudar a técnica e escrever o próprio código. Nenhum shader ou componente foi copiado; os de licença GPL foram descartados de propósito.

**Disponibilidade dos MCPs nesta sessão**

- **shadcn MCP:** não estava conectado. Usei a documentação oficial do shadcn/ui (via Context7) e o CLI `shadcn` (gratuito) para gerar os componentes base, depois restilizados com os tokens.
- **21st MCP:** não estava conectado, então foi pulado. Nada pago foi usado.
- **chrome-devtools MCP:** não estava conectado. A validação usa Playwright (gratuito) e o Chrome local.

## 0. Intro 3D — monitor CRT

| Seção | Componente/técnica escolhida | Fonte | Nome/link | Adaptação para a identidade "Ligue a Tela" |
|---|---|---|---|---|
| Intro | Sequência de ligar: ponto → linha → expansão vertical → overshoot | CodePen / artigo | [lbebber — CRT turn-on](https://codepen.io/lbebber/pen/XJRdrV) · [gamelord CRT animation](https://www.mintlify.com/ryanmagoon/gamelord/components/animations/crt-animation) | Reescrita como função de `uPower` dentro do fragment shader (máscaras `smoothstep` em x/y), em vez de keyframes CSS. Assim o mesmo uniform controla o tubo 3D e o GSAP guia tudo numa timeline. |
| Intro | Curvatura de barril, scanlines, aberração cromática e vinheta no shader | Shaders MIT | [crtty (MIT)](https://docs.rs/crate/crtty/0.1.2) · [hiulit Godot CRT (MIT)](https://perons.itch.io/godot-crt-shader) · ~~[RetroArch CRT-geom](https://gist.github.com/anonymous/dda125d65ded3fe9ed955800666eacf9)~~ (GPL, descartado) | Só a técnica (distorção radial `uv += uv * r² * k`, offset RGB proporcional à distância do centro). O shader foi escrito do zero, com uniforms `uCurvature`, `uChromatic`, `uScanline`, `uFlicker` limitado a 2–3 % e lento. |
| Intro | Texto de boot desenhado num `CanvasTexture` com `needsUpdate` a cada caractere | three.js manual | [Canvas Textures](https://threejs.org/manual/en/canvas-textures.html) · [Retro CRT terminal em CSS/JS](https://dev.to/ekeijl/retro-crt-terminal-screen-in-css-js-4afh) · [Low-poly room, fly into the CRT](https://discourse.threejs.org/t/a-low-poly-room-where-you-fly-into-the-crt/92694) | POST fictício `JOAQUIM BIOS v1.0` digitado linha a linha, com a barra ligada ao progresso real do `import()` da cena. Esta foi a escolha porque o canvas 2D passa pelo shader e herda curvatura e scanlines de graça. A alternativa com HTML + homografia (terceira referência) não teria isso. |
| Intro | Câmera em curva até a tela, com o FOV abrindo no fim | Codrops / R3F | [Camera fly-through com Theatre.js + R3F](https://tympanus.net/codrops/2023/02/14/animate-a-camera-fly-through-on-scroll-using-theatre-js-and-react-three-fiber/) · [discourse: camera on scroll](https://discourse.threejs.org/t/how-to-change-camera-position-on-scroll-in-react-three-fibre/42771) | Sem Theatre.js e sem scroll (o prompt proíbe sequestrar o scroll): uma `CatmullRomCurve3` de 3 pontos, percorrida por um proxy `{ t }` tweenado pelo GSAP dentro da mesma timeline, com `camera.fov` e `updateProjectionMatrix`. |
| Intro | Monitor procedural com `RoundedBox`, `ContactShadows` e `PerformanceMonitor` | drei docs | [drei RoundedBox / ContactShadows / PerformanceMonitor](https://github.com/pmndrs/drei) | Gabinete bege envelhecido com ruído procedural no `roughnessMap` (DataTexture gerada em JS), sem nenhum modelo nem textura baixada. |

## 1. Hero

| Seção | Componente/técnica escolhida | Fonte | Nome/link | Adaptação |
|---|---|---|---|---|
| Hero | SplitText por caractere, "fósforo acendendo" | GSAP docs | [SplitText](https://gsap.com/docs/v3/Plugins/SplitText/) · [ekeijl terminal](https://dev.to/ekeijl/retro-crt-terminal-screen-in-css-js-4afh) · [lbebber](https://codepen.io/lbebber/pen/XJRdrV) | Cada caractere vai de `opacity 0 + brilho alto` para o estado normal, com stagger total de ~0,6 s e ease-out. Sem glitch nem chacoalhar. |

## 2. Marquee de stack

| Seção | Componente/técnica escolhida | Fonte | Nome/link | Adaptação |
|---|---|---|---|---|
| Marquee | Loop horizontal + `timeScale` reagindo à velocidade do scroll | GreenSock | [GreenSock pen GRwePYw (loop + velocity)](https://codepen.io/GreenSock/pen/GRwePYw) · [seamlessLoop helper](https://gsap.com/docs/v3/HelperFunctions/helpers/seamlessLoop/) · [forum: speed on scroll](https://greensock.com/forums/topic/32738-increase-speed-of-marquee-when-user-scroll/) | Escolhida a versão mais simples (duas cópias da faixa + `xPercent: -50`, repeat infinito), com `ScrollTrigger.getVelocity()` limitado por `clamp` e devolvido a 1 com `quickTo`. Ela impressiona mais que um marquee em CSS puro porque reage ao gesto. A velocidade é sutil (máximo 3×) para não cansar. |

## 3. Projetos em destaque — disquetes 3D

| Seção | Componente/técnica escolhida | Fonte | Nome/link | Adaptação |
|---|---|---|---|---|
| Disquetes | Disquete procedural (corpo, shutter metálico, etiqueta em CanvasTexture) | three.js / R3F | [three.js Canvas Textures](https://threejs.org/manual/en/canvas-textures.html) · [r3f-by-example](https://onion2k.github.io/r3f-by-example) · [drei RoundedBox](https://github.com/pmndrs/drei) | Não achei nenhuma referência boa de disquete 3D com licença livre, então foi criado do zero: `RoundedBox` fino, shutter de alumínio com `metalness` alto que desliza no hover, e etiqueta com o nome do repo "à mão" em Departure Mono. `frameloop="demand"` e montagem só perto da viewport. |
| Dialog | Dialog do shadcn restilizado como janela de terminal | shadcn/ui | [shadcn Dialog](https://ui.shadcn.com/docs/components/dialog) | Bordas de 1 px em `--phosphor-dim`, título em mono na borda superior, sem sombra cinza padrão. |

## 4. Arquivo (todos os repositórios)

| Seção | Componente/técnica escolhida | Fonte | Nome/link | Adaptação |
|---|---|---|---|---|
| Arquivo | Tabela tipo `dir` + Tabs do shadcn para filtrar | shadcn/ui + GSAP | [shadcn Tabs](https://ui.shadcn.com/docs/components/tabs) · [GSAP stagger](https://gsap.com/docs/v3/Staggers/) · [Codrops timeline](https://tympanus.net/codrops/2022/01/03/building-a-scrollable-and-draggable-timeline-with-gsap/) | Tabs viram "drives" em mono (`[TODAS] [PYTHON] …`). Linhas entram com stagger de 30 ms, limitado às 12 primeiras, como um `dir` imprimindo. |

## 5. Sobre

| Seção | Componente/técnica escolhida | Fonte | Nome/link | Adaptação |
|---|---|---|---|---|
| Sobre | Foto em duotone de fósforo + contadores | CSS / GSAP | [MDN mix-blend-mode](https://developer.mozilla.org/en-US/docs/Web/CSS/mix-blend-mode) · [GSAP snap/textContent](https://gsap.com/docs/v3/HelperFunctions/) · [CRT overlay](https://mintlify.wiki/apursley2012/guest-portfolio.dev/components/crt-overlay) | Duotone com `grayscale + mix-blend-mode: multiply/screen` na cor do tema, mais scanlines por cima. O contador vai de 0 ao valor real em ~1 s, uma vez só. |

## 6. Stack

| Seção | Componente/técnica escolhida | Fonte | Nome/link | Adaptação |
|---|---|---|---|---|
| Stack | Grade assimétrica de "módulos de hardware" | Criado do zero | — (nenhuma referência gratuita disponível sem o 21st MCP) | Cada módulo tem uma label `SLOT 0n` e "encaixa" com 2 px de deslocamento e a borda acesa (160 ms ease-out). Spans diferentes por grupo para quebrar a grade. |

## 7. Linha do tempo

| Seção | Componente/técnica escolhida | Fonte | Nome/link | Adaptação |
|---|---|---|---|---|
| Timeline | DrawSVG ligado ao scroll | GSAP | [forum 40609 (config no timeline)](https://gsap.com/community/forums/topic/40609-drawsvg-with-scrolltrigger-adapt-to-speed-of-scroll/) · [Codrops: scroll-driven SVG map](https://tympanus.net/codrops/2026/05/21/creating-scroll-driven-svg-map-animations-with-gsap) · [DenDionigi pen](https://codepen.io/DenDionigi/pen/bGXYgva) | Linha vertical (`drawSVG: "0%" → "100%"`, scrub) com os pontos acendendo quando a linha passa por eles, como o traço de um osciloscópio. |

## 8. Contato

| Seção | Componente/técnica escolhida | Fonte | Nome/link | Adaptação |
|---|---|---|---|---|
| Contato | Terminal clicável com resposta digitada | DEV / shadcn | [ekeijl terminal](https://dev.to/ekeijl/retro-crt-terminal-screen-in-css-js-4afh) · [Building a retro CRT terminal website](https://dev.to/remojansen/building-a-retro-crt-terminal-website-with-webgl-and-github-copilot-claude-opus-35-3jfd) · [shadcn Command](https://ui.shadcn.com/docs/components/command) | Os comandos são botões reais (acessíveis). A resposta é digitada em ~250 ms no máximo, e o copiar e-mail mostra `COPIADO ✓`. |

## 9. Footer "Desligar"

| Seção | Componente/técnica escolhida | Fonte | Nome/link | Adaptação |
|---|---|---|---|---|
| Footer | Desligar inverso: tela → linha → ponto | CodePen / SitePoint | [SitePoint TV turn-off](https://www.sitepoint.com/community/t/creating-a-tv-turn-off-effect/377918) · [gamelord](https://www.mintlify.com/ryanmagoon/gamelord/components/animations/crt-animation) · [Tenchi2xh pen](https://codepen.io/Tenchi2xh/pen/GJEvBJ) | `scaleY → 0.004`, depois `scaleX → 0`, com uma camada fixa por cima do `main` (só `transform` e `opacity`). Sem flash forte: o brilho sobe no máximo 1,3× uma única vez. |

## Extra — smooth scroll

| Seção | Componente/técnica escolhida | Fonte | Nome/link | Adaptação |
|---|---|---|---|---|
| Global | Lenis + ticker do GSAP | Lenis README | [Lenis — GSAP ScrollTrigger](https://github.com/darkroomengineering/lenis) | `autoRaf: false`, `lenis.raf` no `gsap.ticker`, `lagSmoothing(0)`. Lenis parado durante a intro e desligado em reduced-motion. |
