export interface Repo {
  name: string;
  description: string | null;
  html_url: string;
  homepage: string | null;
  language: string | null;
  topics: string[];
  stargazers_count: number;
  forks_count: number;
  pushed_at: string;
  created_at: string;
  fork: boolean;
  archived: boolean;
  /** bytes por linguagem (só para repos com detalhes) */
  languages?: Record<string, number>;
  /** primeiros parágrafos do README, já limpos */
  readme?: string;
  /** caminho relativo a public/, ex.: "og/natimax.webp" */
  og?: string;
  /** true = projeto cadastrado à mão (fora do GitHub) */
  manual?: boolean;
}

/** Projeto fora do GitHub, cadastrado em projetos.config.ts → manuais. */
export interface ProjetoManual {
  /** Nome exibido */
  nome: string;
  /** Uma ou duas frases sobre o projeto */
  descricao: string;
  /** Mês em que foi feito/publicado, formato "AAAA-MM" (ex.: "2025-08") */
  data: string;
  /** Linguagem principal (ex.: "TypeScript") */
  linguagem?: string;
  /** Tecnologias, viram as etiquetas (ex.: ["react", "supabase"]) */
  tecnologias?: string[];
  /** Site no ar → botão VER AO VIVO */
  link?: string;
  /** Repositório ou código, se existir → botão VER CÓDIGO */
  codigo?: string;
  /** Imagem em public/ (ex.: "images/projetos/loja.webp", proporção 2:1) */
  capa?: string;
  /** Texto mais longo mostrado no detalhe (no lugar do README). Parágrafos separados por linha em branco. */
  texto?: string;
  /** Seu papel no projeto (ex.: "Front-end e design") */
  papel?: string;
  /** true = aparece nos destaques (disquetes) */
  destaque?: boolean;
}

export interface GithubData {
  user: string;
  generatedAt: string;
  /** "api" = dados reais; "sample" = dados de exemplo (usuário ainda não configurado) */
  source: "api" | "sample";
  repos: Repo[];
}

export interface ProjetosConfig {
  githubUser: string;
  destaques: string[];
  ocultos: string[];
  mostrarForks: boolean;
  mostrarArquivados: boolean;
  sobrescrever: Record<string, { titulo?: string; descricao?: string; capa?: string; papel?: string }>;
  manuais: ProjetoManual[];
  /** repos de trabalhos da faculdade: ficam numa pasta FACULDADE\ separada no arquivo */
  faculdade: string[];
}
