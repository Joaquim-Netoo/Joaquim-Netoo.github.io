# Product

<!-- impeccable:product-schema 1 -->

> Escrito a partir do PROMPT.md (o próprio prompt manda responder o setup do Impeccable com o contexto dele). Itens marcados como _inferido_ não foram confirmados pelo dono.

## Platform

web

## Stack

Definida no PROMPT.md: Vite + React + TypeScript + Tailwind + shadcn/ui, Three.js via @react-three/fiber/drei/postprocessing, GSAP (+ @gsap/react), Lenis, motion (só micro-interações). Hospedagem gratuita no GitHub Pages.

## Users

- Recrutadores, tech leads e clientes que querem avaliar o Joaquim como desenvolvedor de software. _Inferido_: chegam por um link no currículo, LinkedIn ou GitHub e gastam poucos minutos.
- Outros desenvolvedores curiosos pelo trabalho técnico (WebGL, shaders).

## Product Purpose

O portfólio pessoal do Joaquim, 100% web. Mostra os projetos reais dele, puxados automaticamente do GitHub, e leva o visitante a entrar em contato. Sucesso significa o visitante ver os projetos, entender quem ele é e clicar em e-mail, GitHub ou LinkedIn.

## Positioning

"Ligue a tela": o visitante liga um monitor CRT 3D num quarto escuro e mergulha para dentro dele, e o portfólio é o que existe dentro do computador. A lista de projetos se atualiza sozinha todos os dias a partir do GitHub.

## Operating Context

- Primeiro acesso: intro 3D, que pode ser pulada a qualquer momento (Esc/Enter/botão).
- Visitas repetidas na mesma sessão: intro curta (~1,2 s).
- Links com âncora (/#projetos): vão direto para a seção.
- Máquinas de teste do dono: notebook com GPU fraca e PC com RTX 5060.

## Capabilities and Constraints

- Somente ferramentas, fontes, serviços e hospedagem gratuitos.
- Dados do GitHub buscados em tempo de build (nunca no navegador), com cache que mantém o build funcionando offline.
- Nenhuma dependência externa em tempo de execução (sem CDN, sem API do GitHub no cliente).
- Sem backend: contato via mailto e botão de copiar e-mail.
- Dados pessoais (nome, bio, foto, contatos) ficam como placeholders até a Fase 8.

## Brand Commitments

- Conceito, paleta (tokens --tube, --phosphor, --case…), tema de fósforo verde/âmbar e regras de linguagem gráfica (prompt de terminal como kicker, labels de hardware em mono, molduras de terminal com 1 px) estão definidos no PROMPT.md e são vinculantes.
- Fontes proibidas: Inter, Roboto, Poppins, Montserrat, Open Sans, Arial, system-ui, Press Start 2P, VT323.
- Textos em português do Brasil.

## Evidence on Hand

- Repositórios públicos do GitHub do dono (usuário ainda não informado; usa dados de exemplo até a Fase 8).
- Não há depoimentos, clientes, números de negócio nem imprensa: nada disso pode ser inventado.
- A foto do dono ainda não foi fornecida.

## Product Principles

1. O retrô é a moldura, não a fantasia: o conteúdo é moderno, limpo e legível.
2. A intro é o único momento longo e sempre pode ser pulada.
3. Dados reais (GitHub) acima de texto de marketing.
4. Funciona bem com placeholders, em GPU fraca e sem WebGL.

## Accessibility & Inclusion

- WCAG AA de contraste; nada pisca mais de 3 vezes por segundo (WCAG 2.3.1).
- prefers-reduced-motion: sem 3D, sem typewriter, só fades de até 200 ms.
- Navegação completa por teclado, foco visível, link "Pular para o conteúdo" como primeiro elemento focável.
