# Ligue a Tela — portfólio do Joaquim

Um quarto escuro, um monitor CRT bege em 3D e um botão de power. Você liga a tela, ela acende como um tubo de raios catódicos de verdade, a câmera mergulha no vidro e o portfólio é o que existe lá dentro. Os projetos vêm do GitHub automaticamente.

Tudo é gratuito: Vite, React, Three.js (R3F/drei), GSAP, Lenis, shadcn/ui, fontes OFL locais e hospedagem no GitHub Pages.

## Rodar

```bash
npm install
npm run dev        # http://localhost:5173 (busca os repos antes de subir)
npm run build      # build de produção em dist/
npm run preview    # serve o dist/
npm test           # testes da lógica de dados (vitest)
```

Atalhos na página: **Esc** pula a intro · **Enter** liga a tela · **Ctrl+K** ou **/** abre o terminal (`help`).

## Trocar os seus dados

Tudo fica em **`src/content/perfil.ts`**: nome, nome curto (o `JOAQUIM.SYS` e o `C:\JOAQUIM>`), cargo, frase da hero, bio, foto, e-mail, GitHub, LinkedIn, currículo e as ferramentas que não aparecem no GitHub (`stackExtra`). Os campos que ainda são placeholder estão marcados com `PREENCHER`.

- **Foto:** coloque o arquivo em `public/images/` (de preferência `.webp`, 4:5) e aponte `foto: "images/sua-foto.webp"`. Sem foto, aparece uma tela "SEM SINAL".
- **Currículo:** coloque o PDF em `public/` e defina `curriculoPdf: "curriculo.pdf"`. O comando `curriculo` aparece no terminal de contato.
- Atualize também `<title>`, `description` e `og:*` no `index.html`.

## Escolher os projetos em destaque

Edite **`src/content/projetos.config.ts`**:

```ts
export const projetosConfig = {
  githubUser: "seu-usuario",          // enquanto for "{{GITHUB_USER}}", o site usa dados de exemplo
  destaques: ["repo-a", "repo-b"],    // ordem dos destaques; vazio = 4 com mais estrelas
  ocultos: ["repo-que-nao-aparece"],
  mostrarForks: false,
  mostrarArquivados: false,
  sobrescrever: {
    "repo-a": { titulo: "Nome bonito", descricao: "Texto melhor que o do GitHub", papel: "Front-end" },
  },
};
```

Repositórios com o tópico **`portfolio`** no GitHub entram como destaque automaticamente.

## Atualizar os repositórios

```bash
npm run fetch:github
```

O script `scripts/fetch-github.ts` roda sozinho no `predev` e no `prebuild`. Ele:

- busca os repos (`/users/{user}/repos`, paginado), as linguagens e o começo do README dos destaques;
- baixa a imagem social de cada repo para `public/og/*.webp` (o site não depende de nenhum domínio externo);
- grava `src/data/github.json`.

Se a API falhar (offline, limite atingido), ele **mantém o último `github.json`** e só avisa no terminal: o build nunca quebra.

**Token opcional:** copie `.env.example` para `.env` e preencha `GITHUB_TOKEN` para fugir do limite de 60 requisições/hora. O token só é usado no build e nunca vai para o navegador.

## Deploy (GitHub Pages, grátis)

1. Crie um repositório no GitHub e faça push deste projeto na branch `main`.
2. Em **Settings → Pages → Build and deployment**, escolha **Source: GitHub Actions**.
3. Pronto: `.github/workflows/deploy.yml` faz build e deploy a cada push **e uma vez por dia** (cron), usando o `GITHUB_TOKEN` padrão da Action. Os projetos novos aparecem sozinhos.

O base path é automático: um repo `seu-usuario.github.io` é servido na raiz; qualquer outro, em `/nome-do-repo/`.

## Imagens geradas da própria cena

Com o `npm run dev` rodando:

```bash
node scripts/gerar-imagens.mjs   # public/images/crt-static.webp (reduced-motion) e public/og-image.png
node scripts/validar.mjs         # screenshots da intro e das seções + relatório em validacao/
```

## Estrutura

```
scripts/fetch-github.ts     busca do GitHub em tempo de build
src/intro/                  cena 3D do CRT, shader da tela, POST, timeline da intro
src/sections/               seções do portfólio (+ disquetes/ com a cena 3D dos destaques)
src/components/             header, Dialog de projeto, terminal Ctrl+K, kicker, títulos
src/content/                perfil.ts e projetos.config.ts (o que você edita)
src/data/                   github.json gerado + github.sample.json (exemplo)
src/styles/tokens.css       paleta, fontes, easings
```

Decisões de design e desempenho estão em `DECISOES.md`, referências em `REFERENCIAS.md` e o plano em `PLANO.md`.
