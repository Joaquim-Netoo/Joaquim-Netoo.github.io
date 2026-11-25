# Portfólio "Ligue a Tela" — Plano de Implementação

> **Para agentes:** execute em ordem, com superpowers:executing-plans. Cada tarefa termina numa verificação objetiva.

**Objetivo:** portfólio web em que o visitante liga um CRT 3D, mergulha na tela e encontra os projetos do GitHub, buscados em tempo de build.

**Arquitetura:** SPA em Vite + React. O DOM do portfólio é renderizado desde o primeiro frame (SEO/leitores de tela). A intro 3D é uma camada fixa `aria-hidden`, carregada via `import()` e desmontada (com dispose) ao terminar. Os dados do GitHub vêm de `src/data/github.json`, gerado por `scripts/fetch-github.ts` no `predev`/`prebuild`, com fallback para o último cache.

**Stack:** Vite 8, React 19, TS, Tailwind 4, shadcn/ui (Radix), three + R3F 9 + drei 10 + postprocessing 3, GSAP 3.15 (+ @gsap/react), Lenis, motion, tsx, sharp, vitest, Playwright (validação).

---

## Mapa de arquivos

| Arquivo | Responsabilidade |
|---|---|
| `scripts/fetch-github.ts` | Busca repos, linguagens e README, baixa as imagens OG e converte para WebP; em caso de falha mantém o cache |
| `src/lib/github.ts` | Funções puras: filtrar (forks/arquivados/ocultos), escolher destaques, agregar linguagens, stats |
| `src/lib/format.ts` | Datas relativas em pt-BR, `dias desde` |
| `src/lib/motion.ts` | Registro dos plugins do GSAP, CustomEase (`out`, `inOut`), `prefersReducedMotion()` |
| `src/lib/store.ts` | Estado global mínimo (fósforo, som, intro concluída) via `useSyncExternalStore` |
| `src/lib/sound.ts` | Zumbido e clique gerados em WebAudio (sem arquivos) |
| `src/content/perfil.ts` · `projetos.config.ts` | Dados editáveis |
| `src/styles/tokens.css` · `index.css` | Tokens, fontes, overlays de CRT |
| `src/intro/Intro.tsx` | Orquestra a intro: decide versão completa/curta/estática e o pular |
| `src/intro/CrtScene.tsx` | Canvas R3F: quarto, mesa, monitor, câmera, qualidade |
| `src/intro/Monitor.tsx` | Modelagem procedural do CRT |
| `src/intro/screenMaterial.ts` | ShaderMaterial da tela (uPower, uCurvature…) |
| `src/intro/bootCanvas.ts` | CanvasTexture do POST |
| `src/intro/timeline.ts` | `gsap.timeline()` com labels |
| `src/sections/*.tsx` | Hero, Marquee, Destaques, Arquivo, Sobre, Stack, Atividade, Contato, Footer |
| `src/sections/disquetes/*` | Cena 3D dos disquetes (chunk separado) |
| `src/components/*` | Header, ProjetoDialog, Kicker, TerminalFrame, SectionTitle, CommandMenu, cursor |
| `src/components/ui/*` | shadcn restilizado |
| `.github/workflows/deploy.yml` | Build + Pages, em push e cron diário |

## Tarefas

### Tarefa 1 — Scaffold
- [x] Criar package.json, vite.config.ts (alias `@`, base configurável `BASE_PATH`), tsconfig, index.html (`lang="pt-BR"`, meta, OG, favicon).
- [x] Instalar dependências e rodar `npx shadcn init` + `add dialog tabs tooltip badge button command`.
- **Verificar:** `npx tsc -b --noEmit` passa e `npm run build` gera `dist/`.

### Tarefa 2 — Dados do GitHub (TDD)
- [x] Escrever os testes `src/lib/github.test.ts`: forks/arquivados/ocultos são filtrados; destaques vazios → top 4 por estrelas, com desempate por `pushed_at`; tópico `portfolio` entra como destaque; linguagens agregadas e ordenadas.
- [x] Rodar `npx vitest run` e ver FALHAR.
- [x] Implementar `src/lib/github.ts`, rodar e ver PASSAR.
- [x] `scripts/fetch-github.ts`: sem usuário (placeholder) ou com a API falhando → mantém o json e avisa. Commitar um `github.json` inicial de exemplo.
- **Verificar:** `npm run fetch:github` imprime o aviso e não sai com erro; `npm run build` funciona offline.

### Tarefa 3 — Base visual
- [x] Fontes woff2 em `public/fonts` (Departure Mono, Instrument Serif, Geist) + preload.
- [x] `tokens.css` com `data-phosphor="green|amber"`, easings e overlays (scanlines 0,05, vinheta, ruído SVG 0,03).
- [x] Lenis + ScrollTrigger integrados no ticker do GSAP.
- **Verificar:** screenshot em 1440/390 mostra fundo `--tube`, scanlines e fontes carregadas (`document.fonts.check`).

### Tarefa 4 — Seções 1–9 em DOM
- [x] Header (status bar, knob de fósforo, som), Hero, Marquee, Destaques (cards), Arquivo (tabela + Tabs + ordenação), Sobre, Stack, Atividade (DrawSVG), Contato (terminal), Footer (desligar).
- [x] ProjetoDialog (capa, linguagens %, README, links).
- **Verificar:** um único h1, sem overflow horizontal em 390 px, Dialog abre por teclado.

### Tarefa 5 — Intro 3D
- [x] Shader da tela + boot canvas + monitor procedural + quarto.
- [x] Timeline: escuro → power → liga → boot → mergulho → atravessa, com crossfade para o DOM e dispose.
- [x] Pular (botão/Esc/Enter), versão curta (sessionStorage), âncora pula a intro, reduced-motion/sem WebGL → imagem estática.
- [x] PerformanceMonitor com três níveis; abaixo de 30 fps → versão curta.
- **Verificar:** screenshots de cada label, console sem erros, e a intro nunca bloqueia a roda do mouse.

### Tarefa 6 — Disquetes 3D
- [x] Canvas pequeno, carregado por IntersectionObserver, `frameloop="demand"`; hover desliza o shutter, clique "entra no drive" e abre o Dialog.
- **Verificar:** o canvas não renderiza fora da tela; no mobile e em reduced-motion aparecem só os cards.

### Tarefa 7 — Extras
- [x] Ctrl+K → terminal (Command) com help/projetos/sobre/contato/tema/clear/desligar.
- [ ] Cursor de bloco opcional (desligado em touch e em reduced-motion). **Não feito:** opcional; ficou de fora para não competir com a intro e o cursor do sistema.

### Tarefa 8 — Polimento
- [x] Critique/audit/polish da Impeccable, detector, revisão de animações do Emil (tabela Antes/Depois/Por quê).

### Tarefa 9 — Deploy e documentação
- [x] `.github/workflows/deploy.yml`, README.md, `.env.example`, `.gitignore`.
- [x] Gerar `public/images/crt-static.webp` e `public/og-image.png` a partir da cena (Playwright).
- [ ] Deploy no GitHub Pages: **pendente do dono**. Precisa de um repositório no GitHub (push na `main` + Settings → Pages → GitHub Actions). O workflow já está pronto.
- [ ] Fase 8 (dados pessoais): **pendente**. Preencher `src/content/perfil.ts` e `githubUser`.
- **Verificar:** `npm run build` + `npm run preview` + validação completa com Playwright (screenshots em 1440/768/390, rede sem api.github.com, console limpo, teclado).
