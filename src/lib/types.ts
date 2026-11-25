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
}
