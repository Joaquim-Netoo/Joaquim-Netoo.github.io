PROMPT — PORTFÓLIO "LIGUE A TELA" · JOAQUIM
PAPEL E OBJETIVO

Você é um diretor de arte + engenheiro de front-end sênior + especialista em WebGL, com nível de site premiado (Awwwards / FWA). Crie o meu portfólio pessoal de desenvolvedor, 100% web.

A ideia central: a página abre num quarto escuro com um monitor CRT retrô em 3D desligado sobre uma mesa. Eu ligo a tela, ela acende como um tubo de raios catódicos de verdade (o ponto branco, a linha horizontal que se abre, o "boot" em fósforo), e a câmera mergulha para dentro da tela. Quando a câmera atravessa o vidro, eu estou dentro do computador: e o que existe lá dentro é o meu portfólio.

A sensação deve ser a de ligar o computador velho do quarto numa madrugada: zumbido, brilho verde do fósforo, a tela curva, e um mundo inteiro lá dentro. Nostálgico, técnico, com personalidade, nunca uma paródia de Windows 95 e nunca um template de portfólio.

O portfólio precisa puxar os meus projetos do GitHub automaticamente. Os meus dados pessoais (nome completo, bio, foto, contatos) ficam como placeholders e serão preenchidos por último (Fase 8).

Entregue o projeto 100% pronto e funcionando, rodando com npm run dev, sem passos manuais.

REGRA DE CUSTO (OBRIGATÓRIA)

Use apenas ferramentas, bibliotecas, fontes, serviços e hospedagem gratuitos. Nada pago, nada de trial, nada que peça cartão.

GSAP é 100% gratuito (inclusive SplitText, ScrollTrigger, DrawSVG, MorphSVG, Flip): instale só pelo pacote público gsap do npm, sem token e sem registry privado.
Não use Motion+, Runway nem nenhum gerador pago. O monitor 3D é modelado de forma procedural em Three.js, sem baixar modelo de terceiros.
O MCP do 21st é opcional: use só se estiver no plano gratuito; se pedir pagamento ou acabar a cota, pule e registre isso no REFERENCIAS.md.
Hospedagem: GitHub Pages (ou Vercel/Netlify no plano free).
SKILLS E FERRAMENTAS (USE NESTA ORDEM)
1. Instale as skills de design no projeto (antes de qualquer código)
bash
# Emil Kowalski: design engineering, decisões de animação, easing, polimento
npx -y skills add emilkowalski/skill --agent claude-code
#   se o repositório acima não for encontrado, tente: npx -y skills add emilkowalski/skills --agent claude-code

# Impeccable (Paul Bakaus): linguagem de design + comandos de crítica, auditoria e polimento
npx -y skills add pbakaus/impeccable --agent claude-code

# Taste Skill (Leonxlnx): anti-slop, tipografia, layout, cor e espaçamento premium
npx -y skills add Leonxlnx/taste-skill --skill "design-taste-frontend" --agent claude-code

# GSAP oficial (opcional, mas recomendado): boas práticas de GSAP, ScrollTrigger e React
npx -y skills add greensock/gsap-skills --agent claude-code

Confirme com ls .claude/skills que todas foram instaladas. Se alguma falhar, me avise e continue com as outras.

2. Leia as skills nesta ordem
superpowers:brainstorming → para fechar as decisões abertas (ver "DECISÕES PARA CONFIRMAR").
frontend-design → direção estética geral.
design-taste-frontend (Taste) → regras anti-slop de layout, tipografia, cor e espaçamento.
impeccable → rode o setup (/impeccable teach ou /impeccable init, o que existir na versão instalada) e responda com o contexto deste prompt.
emil-design-eng (Emil) → leia antes de escrever qualquer animação.
Skills de GSAP (se instaladas) → antes de escrever timelines e ScrollTrigger.
superpowers:writing-plans → gere o plano de implementação a partir deste prompt e siga com superpowers:executing-plans ou superpowers:subagent-driven-development.
3. Hierarquia quando as skills discordarem

As skills podem dar conselhos conflitantes. Resolva assim, nesta ordem de prioridade:

Este prompt (conceito, textos, regras de custo, acessibilidade).
Emil Kowalski → manda em tudo que é movimento: easing, duração, se algo deve ou não animar, springs, interações.
Impeccable → manda em qualidade de interface e auditoria: hierarquia, estados, legibilidade, consistência.
Taste → manda em estética anti-genérica: escolhas de fonte, grid, densidade, cor.
frontend-design → base geral.

Observação: a Taste Skill tende a "não pedir permissão e decidir sozinha". Isso não vale para as decisões marcadas em "DECISÕES PARA CONFIRMAR": essas você me pergunta numa única mensagem, com a sua recomendação marcada.

4. MCPs
shadcn MCP (gratuito) → componentes base: Dialog (detalhe do projeto), Tabs (filtro por linguagem), Tooltip, Badge, Button, Command (terminal/atalho Ctrl+K). Todos restilizados com os tokens: nenhum componente pode ficar com a cara padrão do shadcn.
21st MCP (só se gratuito) → referências de marquee, cards com spotlight, contadores.
chrome-devtools MCP (gratuito) → validação final (checklist no fim).
GitHub: API REST pública, chamada em tempo de build (ver seção GITHUB).
DECISÕES PARA CONFIRMAR (PERGUNTE ANTES DE CODAR, NUMA MENSAGEM SÓ)

Use o brainstorming e me pergunte tudo de uma vez, com múltipla escolha e a sua recomendação marcada:

Cor do fósforo padrão: verde P1 (recomendado) ou âmbar P3. (Os dois existirão; a pergunta é qual abre primeiro.)
Era do monitor: bege anos 80/90 tipo PC de escritório (recomendado) ou preto estilo terminal de laboratório.
Como a tela liga: o visitante clica no botão de power do monitor (recomendado, mais memorável) ou liga sozinha após 1,5 s.
Som: sem som por padrão com botão para ativar o zumbido do CRT e o "clique" do power (recomendado) ou sem som nenhum.
Meu usuário do GitHub e se quero usar um token (opcional) para evitar limite de requisições.

Se eu não responder, siga as recomendações e registre a escolha no topo do DECISOES.md.

REGRA OBRIGATÓRIA: PESQUISA DE REFERÊNCIAS ANTES DE CODAR

Não escreva nenhuma linha de código de UI antes de concluir esta etapa.

Para cada seção, busque pelo menos 3 referências entre: shadcn MCP, 21st MCP (se gratuito), demos oficiais do GSAP, exemplos do drei/R3F e shaders de CRT de licença livre (MIT/CC0) para estudar a técnica.
Monte o REFERENCIAS.md na raiz com uma tabela por seção: | Seção | Componente/técnica escolhida | Fonte | Nome/link | Adaptação para a identidade "Ligue a Tela" |
Uma linha de justificativa por escolha: por que essa referência impressiona mais que as outras.
Se a seção não tiver referência boa, registre e crie do zero seguindo as skills.
Nunca copie código de shader ou componente com licença incompatível. Estude a técnica e escreva o seu.
STACK
Vite + React + TypeScript + Tailwind + shadcn/ui
Three.js via three + @react-three/fiber + @react-three/drei + @react-three/postprocessing
GSAP (gsap + @gsap/react com useGSAP): intro, timelines, ScrollTrigger, SplitText, DrawSVG
Lenis para smooth scroll dentro do portfólio (desligado durante a intro)
motion (versão gratuita) só para micro-interações de componente (hover, press, layout de cards). Timelines e scroll são sempre GSAP. Não use as duas libs para a mesma animação.
tsx para rodar o script de build do GitHub
Estrutura:
scripts/fetch-github.ts
src/intro/          (cena 3D do CRT, shaders, timeline da intro)
src/sections/       (seções do portfólio)
src/components/     (UI reutilizável)
src/content/        (perfil.ts, projetos.config.ts: textos e dados editáveis)
src/data/           (github.json gerado no build)
src/styles/tokens.css
public/fonts/  public/images/  public/og/
IDENTIDADE VISUAL

Conceito: "ligue a tela". O portfólio é o que vive dentro de um computador antigo. Fósforo brilhando no vidro escuro, gabinete bege gasto, linhas de varredura, texto de terminal, a curvatura do tubo. Mas o conteúdo é moderno, limpo e legível: o retrô é a moldura e o tempero, não a fantasia inteira.

O que evitar (anti-clichê): desktop falso de Windows 95 com janelas cinzas, fonte pixel "Press Start 2P" em tudo, Matrix chovendo código, glitch exagerado, gradiente roxo, cards genéricos de SaaS.

Paleta (tokens CSS em :root, com tema data-phosphor="green" | "amber"):

Token	Hex	Uso
--tube	#0A0C0A	fundo principal (vidro do tubo desligado, levemente esverdeado)
--tube-2	#111511	cards e seções alternadas
--phosphor	#5CFF8F (verde) / #FFB547 (âmbar)	cor-assinatura: títulos, CTAs, foco
--phosphor-dim	#3E8F5A (verde) / #A9742C (âmbar)	texto secundário, bordas ativas
--ghost	rgba(92,255,143,0.08)	"burn-in": rastro fantasma atrás de títulos
--case	#D6CDB8	gabinete bege (só na cena 3D e em detalhes de "hardware" na UI)
--case-shadow	#8A8270	sombras e plásticos envelhecidos
--paper	#ECE6D8	texto principal de leitura longa (mais calmo que o fósforo puro)
--led	#FF4B2B	LED de power, acento raro
Contraste: confira cada par texto/fundo e garanta WCAG AA. Texto corrido em --paper; --phosphor para títulos e destaques.
Brilho de fósforo: text-shadow sutil na cor do tema em títulos, nunca em parágrafos.
Linhas de varredura: overlay global com repeating-linear-gradient, opacity 0.04 a 0.06, pointer-events: none. Leve, para não cansar a leitura.
Curvatura e vinheta: só nas bordas da viewport (máscara radial escura nos cantos), dando a sensação de estar dentro do tubo sem distorcer o texto.
Ruído: SVG noise com opacity 0.03.

Tipografia (PROIBIDO: Inter, Roboto, Poppins, Montserrat, Open Sans, Arial, system-ui, Press Start 2P, VT323). Use fontes gratuitas, hospedadas localmente em public/fonts (woff2). Sugestão inicial, que a Taste Skill pode refinar mantendo a regra de gratuidade:

Terminal, labels, dados, prompts: Departure Mono (gratuita, OFL): mono com alma de pixel, sem ser caricata.
Títulos editoriais grandes: uma display de personalidade, gratuita (ex.: Instrument Serif em itálico para palavras-chave, contrastando com o mono). Títulos de 64 a 180 px com clamp().
Corpo: Geist ou outra sem-serif gratuita e muito legível, 400–500.
Registre a escolha final e o motivo no DECISOES.md.

Linguagem gráfica:

Prompt de terminal como kicker de seção: C:\JOAQUIM\PROJETOS> ou ~/joaquim/projetos $, com cursor piscando (piscar a 1 Hz, nunca mais rápido).
Labels de hardware em mono: CH 01, 640K OK, SYNC 60HZ, PHOSPHOR P1.
Molduras de "janela de terminal": bordas de 1 px em --phosphor-dim, cantos retos, um título em mono na borda superior. Sem barras cinzas de Windows.
Burn-in: os títulos deixam um rastro fantasma fraco por 300 ms quando saem da tela.
Ícones de traço fino, nunca preenchidos genéricos.
INTRO 3D — "LIGUE A TELA" (GSAP + THREE.JS)

Este é o momento principal da página. Precisa ser impecável, rápido e pular fácil.

A cena (Three.js / R3F, modelagem procedural)
Monitor CRT modelado em código: gabinete bege com cantos arredondados (RoundedBox do drei), traseira mais funda, moldura do vidro afundada, tela curva (plano com vértices deslocados para criar a barriga do tubo), botão de power com LED, dois knobs (brilho e contraste), grade de ventilação, um teclado mecânico simples à frente (opcional, só se ficar bom).
Mesa de madeira escura, uma luminária apagada no fundo e o quarto quase preto. Uma luz fraca e fria vinda de "fora da janela" desenha o volume do monitor.
Materiais: MeshStandardMaterial com rugosidade alta no plástico bege, levemente amarelado e gasto (textura de ruído procedural no roughnessMap). Sem texturas baixadas da internet.
Sombras suaves (ContactShadows do drei).
O shader da tela (ShaderMaterial próprio)

A tela é um ShaderMaterial com uniforms controlados pelo GSAP:

uPower (0 → 1): sequência de ligar do CRT:
tela preta → ponto branco no centro,
o ponto vira uma linha horizontal fina que se abre,
a linha se expande verticalmente até cobrir a tela,
leve overshoot de brilho e assenta.
uTime, uScanline, uCurvature, uChromatic (aberração cromática nas bordas), uFlicker (oscilação muito sutil de brilho, ver regra de segurança), uNoise, uPhosphorColor.
O conteúdo da tela durante o boot é um CanvasTexture desenhado em 2D, com um POST fictício na cor do fósforo:
JOAQUIM BIOS v1.0   (C) 2026
MEMORY TEST ........ 640K OK
DETECTING PROJECTS ...... OK
LOADING PORTFOLIO
████████████░░░░░░  64%

O texto é digitado linha a linha, sincronizado com o progresso real do carregamento dos assets.

A timeline de entrada (GSAP)

Uma única gsap.timeline() controla tudo, com labels:

escuro (0 s): quarto escuro, monitor quase invisível. Texto pequeno em mono no rodapé: CLIQUE NO BOTÃO PARA LIGAR (ou PRESSIONE ENTER). O LED de power pulsa devagar.
power (clique): o botão afunda, o LED acende em --led, um "clique" (só se o som estiver ligado). A câmera faz um micro-recuo de 2 a 3 %.
liga (0 → ~0,9 s): uPower de 0 a 1 com a sequência do CRT.
boot (~0,9 → ~2,4 s): o POST é digitado; a barra acompanha o carregamento real.
mergulho (~2,4 → ~3,6 s): a câmera faz um dolly até a tela, com leve curva (não em linha reta), aumentando uCurvature e as linhas de varredura conforme se aproxima. O FOV abre um pouco no fim para dar sensação de "ser puxado".
atravessa (~3,6 → ~4,0 s): quando o vidro ocupa a viewport inteira, faça um crossfade do canvas 3D para o DOM do portfólio. O DOM entra já com o mesmo overlay de scanlines, a mesma cor de fósforo e a mesma vinheta, para a troca ser invisível. O título da hero entra com SplitText.
Ao terminar: o canvas 3D é desmontado (libere geometrias, materiais e texturas) para não pesar no resto da página.

Regras da intro:

Pular sempre disponível: botão PULAR [ESC] visível desde o início, e as teclas Esc/Enter funcionam. Pular leva direto ao estado final.
Visita repetida (marcada em sessionStorage, com try/catch): versão curta de ~1,2 s (só o ligar e o atravessar).
Sem sequestrar o scroll. A intro é uma camada fixa sobre a página; quando termina, a página rola normalmente. Não faça scrub de vídeo nem bloqueie a roda do mouse.
A URL com âncora (ex.: /#projetos) pula a intro e vai direto à seção.
O conteúdo do portfólio já existe no DOM desde o começo (escondido atrás da intro), para SEO e leitores de tela.
Segurança e acessibilidade da intro
Nada de flashes: nenhum trecho pode piscar mais de 3 vezes por segundo nem fazer alternância forte de claro/escuro (WCAG 2.3.1, risco de crise fotossensível). O uFlicker deve ser uma variação de brilho de no máximo 2 a 3 %, lenta.
prefers-reduced-motion: reduce → sem 3D e sem mergulho: mostra uma imagem estática do monitor ligado (gerada a partir da própria cena e salva em public/images/crt-static.webp) e um fade simples de 400 ms para o portfólio.
Leitor de tela: a intro tem aria-hidden, e um link "Pular para o conteúdo" é o primeiro elemento focável.
Desempenho da intro (importante: tenho um notebook com GPU fraca e um PC com RTX 5060)
Use o PerformanceMonitor do drei e três níveis de qualidade:
Alto: DPR até 2, pós-processamento (bloom leve no fósforo, vinheta, ruído), sombras.
Médio: DPR 1,5, só bloom.
Baixo: DPR 1, sem pós-processamento, sombras pré-calculadas. Se cair abaixo de ~30 fps, pule direto para a versão curta.
Sem WebGL disponível → mesma versão do reduced-motion.
O bundle do Three.js é carregado com import() dinâmico; o portfólio (DOM) não espera o 3D para existir.
Teste nas duas máquinas e registre o fps de cada uma no DECISOES.md.
GITHUB — PROJETOS AUTOMÁTICOS
Como buscar (em tempo de build, nunca no navegador)
scripts/fetch-github.ts roda no predev e no prebuild (scripts do package.json) e grava src/data/github.json.
Endpoint: GET https://api.github.com/users/{GITHUB_USER}/repos?per_page=100&sort=pushed (pagine se tiver mais de 100).
Para cada repo, guarde: name, description, html_url, homepage, language, topics, stargazers_count, forks_count, pushed_at, created_at, fork, archived.
Para os projetos em destaque, busque também as linguagens (/repos/{owner}/{repo}/languages) e os primeiros parágrafos do README (/repos/{owner}/{repo}/readme, decodificando base64; corte em ~600 caracteres e remova imagens e badges).
Imagem de capa: baixe a imagem social do repo https://opengraph.githubassets.com/1/{owner}/{repo} para public/og/{repo}.png e converta para WebP. O site final não depende de domínio externo para mostrar imagens.
Token opcional: leia GITHUB_TOKEN do .env (adicione .env ao .gitignore e crie um .env.example). O token nunca vai para o código do cliente. Sem token, funciona com o limite público.
Falha não quebra o build: se a API falhar (offline, limite atingido), mantenha o último github.json salvo e mostre um aviso no terminal. Commite um github.json inicial para o projeto sempre funcionar.
Curadoria (src/content/projetos.config.ts)
ts
export const projetosConfig = {
  githubUser: "{{GITHUB_USER}}",        // preenchido na Fase 8 ou nas decisões iniciais
  destaques: [] as string[],             // nomes dos repos em destaque, em ordem
  ocultos: [] as string[],               // repos que não devem aparecer
  mostrarForks: false,
  mostrarArquivados: false,
  sobrescrever: {} as Record<string, { titulo?: string; descricao?: string; capa?: string; papel?: string }>,
};
Se destaques estiver vazio, use os 4 repos com mais estrelas, desempatando pelo mais recente.
Repos com o tópico portfolio no GitHub entram como destaque automaticamente.
Atualização automática (gratuita)
GitHub Action em .github/workflows/deploy.yml: build + deploy no GitHub Pages a cada push e uma vez por dia (cron), usando o secrets.GITHUB_TOKEN padrão da Action. Assim os projetos novos aparecem sozinhos.
ESTRUTURA E TEXTOS DAS SEÇÕES (DENTRO DO COMPUTADOR)

Textos em português. Onde houver {{...}}, é placeholder dos meus dados, preenchido na Fase 8. Escreva tudo para funcionar bem mesmo com os placeholders.

0. INTRO 3D

(Descrita acima.)

1. HERO, "VOCÊ ESTÁ DENTRO"
Header mínimo em mono, como uma barra de status de terminal: {{NOME_CURTO}}.SYS · PROJETOS · SOBRE · STACK · CONTATO · à direita, o seletor de fósforo (um knob que gira entre P1 VERDE e P3 ÂMBAR) e o botão de som.
Kicker: C:\{{NOME_CURTO}}> whoami
Título gigante (entra com SplitText por caractere, como se o fósforo acendesse letra por letra, easing de saída, ~0,6 s no total): {{NOME}} e, abaixo, em itálico serifado: desenvolvedor de software. (ajustar ao meu cargo na Fase 8)
Sub: {{FRASE_CURTA}} (placeholder: Construo sistemas, interfaces e ferramentas que resolvem problemas de verdade.)
Linha de status em mono, com dados reais do GitHub: REPOSITÓRIOS: {{n}} · LINGUAGENS: {{n}} · ÚLTIMO COMMIT: há {{x}} dias
CTAs: VER PROJETOS · FALAR COMIGO
Indicador: ROLE ↓ com cursor de bloco piscando.
2. MARQUEE DE STACK
Uma faixa horizontal em mono, velocidade reagindo levemente ao scroll (GSAP + ScrollTrigger), com as linguagens calculadas a partir dos meus repos, separadas por ▪. Ex.: PYTHON ▪ TYPESCRIPT ▪ REACT ▪ DJANGO ▪ ...
3. PROJETOS EM DESTAQUE (SEGUNDO ELEMENTO 3D)
Kicker: C:\{{NOME_CURTO}}\PROJETOS> dir /destaques
Título: PROJETOS que saíram do papel.
Elemento 3D: os projetos em destaque aparecem como disquetes 3D (procedurais: corpo, janela metálica que desliza, etiqueta) empilhados numa pequena prateleira. A etiqueta de cada disquete é um CanvasTexture com o nome do repo escrito "à mão" em mono.
Hover: o disquete sai um pouco da pilha e a janela metálica desliza.
Clique: o disquete "entra no drive" (animação GSAP curta) e abre um Dialog com o projeto.
Esta cena 3D é leve e separada da intro: um canvas pequeno, carregado só quando a seção se aproxima da viewport (IntersectionObserver + Suspense), e pausado (frameloop="demand") fora da tela.
Ao lado ou abaixo, a mesma lista em HTML acessível (cards de terminal). No mobile e em reduced-motion, só os cards.
Card/Dialog do projeto:
capa (imagem social do repo), nome, descrição (ou o sobrescrever), barra de linguagens com porcentagem, estrelas, forks, última atualização em formato relativo (atualizado há 3 dias), tópicos como badges.
trecho do README.
botões: VER CÓDIGO (GitHub) e VER AO VIVO (só se tiver homepage).
4. TODOS OS REPOSITÓRIOS (ARQUIVO)
Kicker: C:\{{NOME_CURTO}}\PROJETOS> dir /todos
Título: ARQUIVO completo.
Lista em formato de listagem de diretório (tabela mono), com filtro por linguagem (Tabs do shadcn restilizadas) e ordenação (recentes / estrelas / nome):
NOME                  LINGUAGEM    ★    ATUALIZADO
natimax               Python       4    2026-11-03
Linhas com hover que acende a linha inteira em fósforo. Clique abre o mesmo Dialog.
Animação de entrada: as linhas aparecem com stagger curto (máx. 30 ms por linha, limitado às primeiras 12), como um dir imprimindo.
5. SOBRE
Kicker: C:\{{NOME_CURTO}}> type sobre.txt
Título: QUEM ESTÁ do outro lado da tela.
Layout editorial: foto {{FOTO}} à esquerda, tratada com efeito de fósforo (duotone na cor do tema + scanlines), e o texto à direita.
Texto: {{BIO}} (placeholder com 2 parágrafos curtos sobre formação, trabalho e o que gosto de construir).
Três números em mono com contador animado (dados reais do GitHub): {{n}} REPOSITÓRIOS · {{n}} LINGUAGENS · DESDE {{ano do primeiro repo}}.
6. STACK / FERRAMENTAS
Kicker: C:\{{NOME_CURTO}}> stack --list
Título: FERRAMENTAS de trabalho.
Grade assimétrica de "módulos de hardware" (cards com bordas de 1 px e labels tipo SLOT 01), agrupando: Linguagens, Front-end, Back-end, Dados, Ferramentas. Começa com o que for detectado no GitHub; eu completo na Fase 8.
Hover: o módulo "encaixa" (deslocamento de 2 px + borda acende).
7. LINHA DO TEMPO DE ATIVIDADE
Kicker: C:\{{NOME_CURTO}}> log --graph
Título: O QUE ando construindo.
Linha do tempo vertical feita a partir das datas de criação e de último push dos repos (últimos 12 meses), desenhada com DrawSVG conforme o scroll. Cada ponto mostra o nome do repo e a data.
8. CONTATO
Kicker: C:\{{NOME_CURTO}}> contato
Título: VAMOS conversar?
Um "terminal" interativo: o visitante vê comandos prontos e clica neles (email, github, linkedin, curriculo), e a resposta é "impressa" com efeito de digitação curto. Links reais: {{EMAIL}}, {{GITHUB_URL}}, {{LINKEDIN_URL}}, {{CURRICULO_PDF}}.
Sem formulário com backend (para continuar gratuito): use mailto: e um botão de copiar e-mail com feedback COPIADO ✓.
9. FOOTER, "DESLIGAR"
Fundo --tube, {{NOME_CURTO}} gigante em mono, cortado na base da página.
Botão DESLIGAR: toca a animação inversa do CRT em CSS/GSAP (a imagem se comprime numa linha horizontal, depois num ponto, e some), e um texto IT IS NOW SAFE TO TURN OFF YOUR COMPUTER. aparece. Clique de novo → liga e volta ao topo. (Respeitar a regra de flashes.)
© 2026 {{NOME}} · feito à mão, com café e fósforo verde.
Easter egg (opcional, só se sobrar tempo)
Ctrl+K (ou /) abre um terminal (Command do shadcn) com comandos: help, projetos, sobre, contato, tema ambar, tema verde, clear, desligar.
ANIMAÇÕES E MICROINTERAÇÕES (REGRAS GLOBAIS)

Siga a skill do Emil Kowalski. Em especial:

Toda animação precisa de motivo. Se não ajuda a entender ou não dá retorno, não anima.
Entradas e saídas com ease-out; nunca ease-in para algo que aparece. Use curvas personalizadas (CustomEase do GSAP) e registre os valores nos tokens: --ease-out, --ease-in-out.
UI rápida: hover e press entre 120 e 200 ms; entradas de seção até ~600 ms. A intro é a única coisa longa.
Ações de teclado (atalhos, terminal) não animam ou animam no mínimo.
Botões: scale(0.97) no press, sem atraso.
Nada de animar width/height/top: use transform e opacity.
Títulos de seção: SplitText por linha com máscara, de baixo para cima, disparado por ScrollTrigger uma vez só (once: true).
Cursor customizado opcional: um bloco de cursor de terminal pequeno que vira um retângulo com texto (ABRIR, ARRASTE, COPIAR) sobre elementos interativos. Desligado em telas touch e em reduced-motion. Nunca esconda o cursor do sistema sem alternativa.
Lenis no portfólio, com lerp padrão, integrado ao ScrollTrigger (lenis.on('scroll', ScrollTrigger.update) + ticker do GSAP).
Limpeza: todo useGSAP com escopo, todo ScrollTrigger morto no unmount, todo recurso Three.js liberado.
prefers-reduced-motion: sem intro 3D, sem SplitText, sem marquee em movimento, sem disquetes 3D, sem typewriter (texto aparece completo). Fades de até 200 ms são permitidos.
RESPONSIVO
Breakpoints de teste: 1440, 1024, 768, 390 px.
Mobile: intro 3D com câmera mais próxima e enquadramento vertical, mergulho mais curto (~2,5 s no total), qualidade "médio" ou "baixo" por padrão. Disquetes 3D viram cards. Tabela do arquivo vira lista empilhada. Gutter de 16 px, sem scroll horizontal, títulos com clamp().
Alvos de toque com no mínimo 44 × 44 px.
ACESSIBILIDADE E SEO
HTML semântico (header, main, section com aria-labelledby, footer), um único h1.
Foco visível em tudo (contorno em --phosphor), navegação completa por teclado, inclusive Dialog e terminal.
Contraste AA conferido com o chrome-devtools.
lang="pt-BR", title e meta description com placeholders, Open Graph com uma imagem gerada da tela ligada (public/og-image.png), favicon de um pequeno monitor.
PERFORMANCE
Metas: LCP < 2,5 s, CLS < 0,1, INP < 200 ms, intro a 60 fps no PC e pelo menos 30 fps no notebook (com degradação automática).
Code splitting: intro 3D e disquetes 3D em chunks separados, carregados com import().
Fontes com font-display: swap e preload das duas principais.
Imagens em WebP com width/height definidos e loading="lazy" fora da primeira dobra.
Nada de dependências externas em runtime (sem CDN, sem API do GitHub no navegador).
FASES DE EXECUÇÃO
Setup: instalar skills, ler skills, perguntar as DECISÕES PARA CONFIRMAR.
Pesquisa: REFERENCIAS.md completo.
Plano: superpowers:writing-plans → PLANO.md com tarefas pequenas e verificáveis.
Base: projeto Vite, tokens, fontes, overlays de CRT, Lenis + GSAP integrados, fetch-github.ts funcionando com github.json real.
Intro 3D: cena, shader, timeline, pular, versão curta, reduced-motion, níveis de qualidade.
Seções do portfólio (1 a 9), com dados reais do GitHub.
Polimento: rodar /critique, /audit e /polish da Impeccable (ou os comandos equivalentes da versão instalada), rodar o detector (npx impeccable detect src/, se disponível), aplicar a revisão de animações da skill do Emil (tabela Antes / Depois / Por quê) e corrigir tudo.
Meus dados (POR ÚLTIMO): me pergunte numa única mensagem e preencha src/content/perfil.ts:
nome completo e nome curto (para o {{NOME_CURTO}}.SYS)
cargo / área
frase curta da hero
bio (2 parágrafos)
foto (caminho do arquivo)
e-mail, GitHub, LinkedIn, outras redes
currículo em PDF (opcional)
repos em destaque e repos para ocultar
stack que não aparece no GitHub Enquanto eu não responder, tudo continua funcionando com placeholders.
Validação (checklist abaixo) e deploy no GitHub Pages.
VALIDAÇÃO COM CHROME-DEVTOOLS (OBRIGATÓRIA)
Rode npm run dev e abra a página.
Intro: clique no power e tire screenshot de cada label da timeline (escuro, liga, boot, mergulho, atravessa). Confirme que a troca 3D → DOM não tem "salto" visível (compare o último frame do canvas com o primeiro do DOM).
Teste Esc, Enter e o botão PULAR. Recarregue e confirme a versão curta. Abra /#projetos e confirme que a intro é pulada.
Emule prefers-reduced-motion: reduce e confirme a versão estática.
Emule CPU 4× mais lenta e confirme que a qualidade cai sozinha sem travar.
Confirme que nenhum trecho pisca mais de 3 vezes por segundo.
GitHub: confirme que os repos reais aparecem, que forks e arquivados respeitam a config, que filtros e ordenação funcionam e que o Dialog mostra linguagens, README e links certos. Desligue a rede, rode npm run build e confirme que o build não quebra (usa o cache).
Disquetes 3D: hover, clique e abertura do Dialog; confirme que o canvas pausa fora da tela.
Network: nenhum 404 e nenhuma requisição para api.github.com ou opengraph.githubassets.com no navegador.
Console sem erros nem warnings de React/Three.
Navegação inteira só com teclado; foco sempre visível; contraste AA.
Screenshots em 1440, 768 e 390 px de cada seção; corrija qualquer quebra.
Trace de performance na intro e no scroll; ajuste se cair abaixo de ~50 fps no PC.
Lighthouse (mobile e desktop) e reporte as notas.
ENTREGA
Projeto rodando com npm run dev e build de produção com npm run build.
REFERENCIAS.md, DECISOES.md (decisões, fontes, fps medido nas duas máquinas), PLANO.md.
.env.example, .gitignore com .env, workflow de deploy diário no GitHub Pages.
README.md explicando: como trocar meus dados (src/content/perfil.ts), como escolher destaques (projetos.config.ts), como atualizar os repos (npm run fetch:github) e como fazer deploy.
Ao final, me envie: caminho do projeto, URL do deploy, lista dos arquivos gerados (com tamanho), screenshots da validação, fps da intro e notas do Lighthouse.