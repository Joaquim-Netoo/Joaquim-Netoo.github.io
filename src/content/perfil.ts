/**
 * MEUS DADOS — tudo que aparece sobre você no site.
 * Campos ainda não preenchidos estão marcados com "PREENCHER" no comentário.
 */
export const perfil = {
  /** Nome exibido na hero e no rodapé */
  nome: "Joaquim Camillo",
  /** Nome curto em maiúsculas: aparece em JOAQUIM.SYS e nos prompts C:\JOAQUIM> */
  nomeCurto: "JOAQUIM",
  /** Cargo / área (linha em itálico abaixo do nome) */
  cargo: "desenvolvedor de software.",
  /** Frase curta da hero */
  frase: "Construo sistemas, interfaces e ferramentas que resolvem problemas de verdade.",
  /** Bio: o primeiro parágrafo aparece maior */
  bio: [
    "Escrevi minha primeira linha de código aos 14 anos e, desde então, passo boa parte do tempo dentro de uma tela.",
    "Desenvolvo para a web de ponta a ponta: interfaces que dão vontade de usar e sistemas que funcionam por trás delas. Gosto de transformar ideias em produto, e produto em algo que as pessoas realmente usam.",
  ],
  /** Formação: aparece na seção "Sobre". Atualize o período a cada semestre. */
  formacao: {
    curso: "Ciência da Computação",
    periodo: "5º período",
    status: "cursando",
    /** nome da faculdade (opcional) */
    instituicao: "",
  },
  /** Caminho da foto em public/images (ex.: "images/foto.webp"). Vazio = tela "SEM SINAL". PREENCHER */
  foto: "",
  /** Contatos */
  email: "netocamillo543@gmail.com",
  githubUrl: "https://github.com/Joaquim-Netoo",
  linkedinUrl: "https://www.linkedin.com/in/joaquim-netoo-",
  /** Outras redes (opcional): { nome, url } */
  outrasRedes: [] as { nome: string; url: string }[],
  /** Currículo em PDF dentro de public/ (ex.: "curriculo.pdf"). Vazio = comando oculto. PREENCHER */
  curriculoPdf: "",
  /**
   * Ferramentas além das linguagens detectadas no GitHub, por grupo.
   * Grupos vazios não aparecem no site.
   */
  stackExtra: {
    Linguagens: ["SQL"],
    "Front-end": ["React", "Blazor WebAssembly", "MudBlazor"],
    /** bibliotecas de JavaScript (também detectadas sozinhas nos seus sites) */
    "Bibliotecas JS": ["GSAP", "Three.js"],
    "Back-end": ["Supabase", "PostgreSQL", "Cloudflare Pages"],
    Dados: [] as string[],
    Ferramentas: ["VS Code", "Figma", "Blender", "Git", "GitHub"],
  } as Record<string, string[]>,
  /** URL final do site (para Open Graph). PREENCHER depois do deploy */
  siteUrl: "",
};

export type Perfil = typeof perfil;
