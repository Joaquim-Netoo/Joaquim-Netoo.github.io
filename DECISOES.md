# DECISÕES

## Decisões confirmadas (respondidas em 2026-11-24)

| Pergunta | Escolha |
|---|---|
| Cor do fósforo padrão | **Verde P1** (`#5CFF8F`). O âmbar P3 existe e é trocado pelo knob do header ou por `tema ambar` no Ctrl+K. |
| Era do monitor | **Bege anos 80/90**, PC de escritório. |
| Como a tela liga | **Clique no monitor/botão de power** (ou Enter). No touch: "toque no monitor". |
| Som | **Desligado por padrão**, com botão para ativar o zumbido e os cliques. Tudo é gerado em WebAudio, sem arquivos baixados. |
| GitHub | **Placeholder por ora**, sem token. `src/data/github.json` usa dados de exemplo (marcados `"source": "sample"`, e a hero avisa). Quando `githubUser` for preenchido, `npm run dev` busca os repos reais. Testado com o usuário `octocat`: 8 repos, linguagens, README e imagens sociais. |

## Tipografia (final)

| Papel | Fonte | Por quê |
|---|---|---|
| Terminal, labels, dados, títulos-chave | **Departure Mono** (OFL) | Mono com alma de pixel sem ser caricata: dá a voz de "máquina" e funciona como display a 180 px. |
| Linha editorial em itálico | **Newsreader Italic** (OFL) | Contraste humano × máquina com o mono. Substituiu a Instrument Serif, que o detector da Impeccable marcou como fonte saturada (o prompt permitia refinar). Arquivo estático 400 itálico de 24 KB. |
| Corpo | **Atkinson Hyperlegible Next** (OFL) | Desenhada para legibilidade máxima, coerente com a meta de contraste AA em tela escura. Substituiu a Geist, também marcada como saturada. |

Todas ficam em `public/fonts` (woff2), com `font-display: swap` e preload de Departure Mono e Atkinson.

## Conflitos entre skills (como foram resolvidos)

Pela hierarquia do prompt, **o prompt vence**:

- **Taste Skill:** proíbe monospace, kickers, molduras de 1 px e labels de hardware. O prompt exige os quatro como linguagem gráfica, então ficam. A Taste manda no resto: títulos enormes com `clamp()`, 112–200 px entre seções, nenhum gradiente decorativo, nenhuma sombra em repouso e nenhum card SaaS genérico.
- **Taste (duas famílias no máximo):** o prompt pede três papéis tipográficos, então ficam três.
- **Detector da Impeccable:** marcou 27 padrões, todos pedidos explicitamente pelo prompt e mantidos: `dark-glow` (brilho de fósforo nos títulos), `italic-serif-display` (linha em itálico serifado), `blinking-cursor` (cursor a 1 Hz) e `repeating-stripes` (scanlines). A própria Impeccable diz "the brief wins". Não houve nenhum achado de contraste ou de texto pequeno.
- O script `draw.mjs` da Taste não foi usado, porque a direção de arte já vem fixada pelo prompt.

## Desvios conscientes do prompt

- **Roda do mouse/toque durante a intro pula a intro** (termina na hora) em vez de rolar a página por baixo da camada. Assim a roda nunca fica "bloqueada" e o visitante nunca cai no meio da página às cegas.
- **Nome da hero no mobile:** usa `min(180px, largura disponível)`. Com "JOAQUIM" dá cerca de 82 px em 390 px de largura (dentro dos 64–180 px pedidos); nomes longos encolhem para caber sem scroll horizontal.
- **Três.js fixado em 0.182:** a r183+ marca `THREE.Clock` como deprecated, e o R3F 9 ainda o usa, o que gerava warning no console. A 0.182 deixa o console limpo.

## Revisão de animações (skill do Emil Kowalski)

| Antes | Depois | Por quê |
|---|---|---|
| `transition-all` no Badge/Button do shadcn | `transition-[background-color,color,border-color,transform] 150ms` | Propriedades explícitas; nunca `all`. |
| Capa do card: `scale` em 300 ms no hover | 200 ms, `--ease-out`, só com `(hover: hover)` | Hover acontece dezenas de vezes; UI rápida fica abaixo de 300 ms. |
| Dialog: `zoom-in-95` 100 ms (padrão shadcn) | `zoom-in-[0.97]` + fade 200 ms ease-out, saída 150 ms | Nada nasce do zero; a saída é mais rápida que a entrada. O modal fica centralizado (exceção de origem). |
| Tooltip: abre na hora com seta e zoom 95 | 450 ms de atraso no primeiro; os seguintes abrem instantaneamente, sem animação; origin-aware | Evita ativação acidental sem deixar a barra lenta. |
| Terminal Ctrl+K com animação de Dialog | Sem animação de abrir/fechar | Ação de teclado repetida: nunca anima. |
| Copiar e-mail: troca seca do texto | Crossfade de 180 ms com `blur(2px)` (motion, `LazyMotion`) | O blur funde os dois estados numa transformação só. |
| Títulos de seção com máscara permanente | SplitText por linha (0,6 s, stagger 80 ms, `once`) e `revert()` ao terminar | A máscara cortaria o brilho do fósforo depois da entrada. |
| Filtro e ordenação do arquivo re-animando as linhas | Stagger só na primeira entrada (30 ms/linha, máx. 12) | Filtrar é ação frequente; reanimar a cada clique cansa. |
| `uFlicker` do shader | Máximo 2,5 %, a 0,27 Hz | WCAG 2.3.1: sem flashes. Medido: 0 flashes/s (ver abaixo). |
| Desligar: brilho branco forte | Uma única linha de brilho suave, que vira ponto e some | Um só evento de luz e nenhuma alternância. |

Easings registrados em `tokens.css` (`--ease-out: cubic-bezier(0.23,1,0.32,1)` e `--ease-in-out: cubic-bezier(0.77,0,0.175,1)`) e espelhados no `CustomEase` do GSAP (`"out"`, `"inOut"`).

## Desempenho medido

**Intro, fps** (`window.__introFps`, amostras a cada 0,5 s):

| Máquina | Qualidade | fps da intro |
|---|---|---|
| PC com RTX 5060 (Chrome 1440×900, ANGLE/D3D11) | Alto (DPR 2, bloom + vinheta + ruído, sombras) | **97–165 fps** (mín. 97 durante o boot/mergulho) |
| PC com CPU 4× mais lenta (emulação CDP) | Alto | 100–165 fps (o gargalo é a GPU, e a intro terminou em 4,0 s) |
| Notebook com GPU fraca | — | **Não medido nesta sessão** (a máquina não estava disponível). A degradação automática é: `PerformanceMonitor` (alto → médio → baixo) e, abaixo de 30 fps em duas amostras seguidas, qualidade baixa + salto direto para o mergulho. Para medir: abra o site, ligue a tela e rode `window.__introFps` no console. |

**Lighthouse** (build de produção, `vite preview`):

| Perfil | Performance | Acessibilidade | Boas práticas | SEO | LCP | CLS | TBT |
|---|---|---|---|---|---|---|---|
| Desktop | **90** | **100** | **100** | **100** | 0,9 s | 0 | 230 ms |
| Mobile (4G lento + CPU 4×) | **67** | **100** | **100** | **100** | 3,1 s | 0,017 | 1.170 ms |

No mobile, o LCP fica acima da meta de 2,5 s: o custo é o parse do Three.js (~240 KB gzip) no CPU simulado 4× mais lento. O chunk 3D já é adiado para depois do primeiro paint (idle), e o portfólio não espera o 3D para existir.

**Outras verificações** (scripts em `scripts/`):

- Flashes na intro: luminância amostrada em 89 frames, **0 flashes/s** (pico de luminância média 0,14).
- Rede: **nenhuma** requisição para `api.github.com` ou `opengraph.githubassets.com` no navegador; nenhum 404.
- Console: sem erros nem warnings (React/Three).
- axe-core (WCAG 2 A/AA): **0 violações**.
- Sem scroll horizontal em 1440, 768 e 390 px; um único `h1`.
- Teclado: o primeiro foco é "Pular para o conteúdo"; o Dialog abre por Enter, fecha por Esc e devolve o foco ao card.
