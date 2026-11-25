/**
 * MEUS DADOS — preencha tudo aqui (Fase 8).
 * Campos ainda não preenchidos estão marcados com "PREENCHER" no comentário.
 * O site funciona com estes placeholders.
 */
export const perfil = {
  /** Nome completo (título da hero e rodapé). PREENCHER */
  nome: "Joaquim",
  /** Nome curto em maiúsculas: aparece em JOAQUIM.SYS e nos prompts C:\JOAQUIM> */
  nomeCurto: "JOAQUIM",
  /** Cargo / área (linha em itálico abaixo do nome). PREENCHER */
  cargo: "desenvolvedor de software.",
  /** Frase curta da hero. PREENCHER */
  frase: "Construo sistemas, interfaces e ferramentas que resolvem problemas de verdade.",
  /** Bio em 2 parágrafos curtos. PREENCHER */
  bio: [
    "Escrevo software desde a faculdade, quando percebi que um script de vinte linhas podia poupar uma tarde inteira de trabalho repetido. Desde então, passo entre o back-end, a interface e os dados, onde quer que o problema esteja.",
    "Gosto de construir ferramentas que as pessoas usam todo dia sem pensar nelas: painéis que mostram o que importa, APIs que não surpreendem e interfaces que respondem rápido. Fora do editor, coleciono hardware velho, como o monitor desta página.",
  ],
  /** Caminho da foto em public/images (ex.: "images/foto.webp"). Vazio = retrato desenhado em fósforo. PREENCHER */
  foto: "",
  /** Contatos. PREENCHER */
  email: "seu-email@exemplo.com",
  githubUrl: "https://github.com/",
  linkedinUrl: "https://www.linkedin.com/",
  /** Outras redes (opcional): { nome, url } */
  outrasRedes: [] as { nome: string; url: string }[],
  /** Currículo em PDF dentro de public/ (ex.: "curriculo.pdf"). Vazio = comando oculto. PREENCHER */
  curriculoPdf: "",
  /** Ferramentas que não aparecem no GitHub, por grupo. PREENCHER */
  stackExtra: {
    Linguagens: [] as string[],
    "Front-end": ["React", "Tailwind CSS", "GSAP", "Three.js"],
    "Back-end": ["Node.js", "FastAPI", "Django"],
    Dados: ["PostgreSQL", "SQLite", "Pandas"],
    Ferramentas: ["Git", "Docker", "Linux", "VS Code", "Figma"],
  } as Record<string, string[]>,
  /** URL final do site (para Open Graph). PREENCHER */
  siteUrl: "",
};

export type Perfil = typeof perfil;
