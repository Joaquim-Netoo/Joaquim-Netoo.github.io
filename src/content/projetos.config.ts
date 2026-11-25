import type { ProjetoManual, ProjetosConfig } from "../lib/types";

/**
 * Curadoria dos projetos.
 * - githubUser: seu usuário do GitHub. Enquanto for "{{GITHUB_USER}}", o site usa dados de exemplo.
 *   Todos os repositórios públicos entram sozinhos (menos forks e arquivados, se desligados abaixo).
 * - destaques: nomes dos repos em destaque, na ordem. Vazio = 4 repos com mais estrelas.
 *   Repos com o tópico "portfolio" no GitHub entram como destaque automaticamente.
 * - ocultos: repos que não devem aparecer em lugar nenhum.
 * - sobrescrever: troca título, descrição, capa ou papel de um repo do GitHub.
 * - manuais: projetos FORA do GitHub (clientes, sites no ar, projetos sem repo).
 */
export const projetosConfig: ProjetosConfig = {
  githubUser: "Joaquim-Netoo",
  // os 4 com site no ar e descrição; troque à vontade
  destaques: ["forja", "apogeu", "direito-delas", "afya-admin"] as string[],
  ocultos: [] as string[],
  mostrarForks: false,
  mostrarArquivados: false,
  sobrescrever: {} as Record<string, { titulo?: string; descricao?: string; capa?: string; papel?: string }>,

  manuais: [
    // Exemplo (copie, preencha e tire as barras "//" para ativar):
    // {
    //   nome: "Loja da Padaria Silva",
    //   descricao: "Site com cardápio e pedidos pelo WhatsApp para uma padaria do bairro.",
    //   data: "2025-08",
    //   linguagem: "TypeScript",
    //   tecnologias: ["next.js", "tailwind"],
    //   link: "https://padariasilva.com.br",
    //   capa: "images/projetos/padaria.webp",
    //   papel: "Front-end e design",
    //   texto: "O que o projeto resolve, como foi feito e o resultado.",
    //   destaque: true,
    // },
  ] as ProjetoManual[],
};

export const PLACEHOLDER_USER = "{{GITHUB_USER}}";
