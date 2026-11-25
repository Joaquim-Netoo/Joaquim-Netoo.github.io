import type { ProjetosConfig } from "../lib/types";

/**
 * Curadoria dos projetos.
 * - githubUser: seu usuário do GitHub. Enquanto for "{{GITHUB_USER}}", o site usa dados de exemplo.
 * - destaques: nomes dos repos em destaque, na ordem. Vazio = 4 repos com mais estrelas.
 *   Repos com o tópico "portfolio" no GitHub entram como destaque automaticamente.
 * - ocultos: repos que não devem aparecer em lugar nenhum.
 */
export const projetosConfig: ProjetosConfig = {
  githubUser: "{{GITHUB_USER}}", // preenchido na Fase 8
  destaques: [] as string[],
  ocultos: [] as string[],
  mostrarForks: false,
  mostrarArquivados: false,
  sobrescrever: {} as Record<string, { titulo?: string; descricao?: string; capa?: string; papel?: string }>,
};

export const PLACEHOLDER_USER = "{{GITHUB_USER}}";
