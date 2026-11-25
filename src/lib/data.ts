import raw from "@/data/github.json";
import { projetosConfig } from "@/content/projetos.config";
import { activity, featuredRepos, languageStats, profileStats, visibleRepos } from "./github";
import type { GithubData, Repo } from "./types";

const data = raw as GithubData;

/** Aplica os textos de `sobrescrever` da config. */
function applyOverrides(r: Repo): Repo & { titulo: string; papel?: string } {
  const o = projetosConfig.sobrescrever[r.name] ?? {};
  return {
    ...r,
    titulo: o.titulo ?? r.name,
    description: o.descricao ?? r.description,
    og: o.capa ?? r.og,
    papel: o.papel,
  };
}

export type ProjetoRepo = ReturnType<typeof applyOverrides>;

const now = new Date();

export const isSample = data.source === "sample";
export const generatedAt = data.generatedAt;
export const repos: ProjetoRepo[] = visibleRepos(data.repos, projetosConfig).map(applyOverrides);
export const destaques: ProjetoRepo[] = featuredRepos(data.repos, projetosConfig).map(applyOverrides);
export const linguagens = languageStats(repos);
export const stats = profileStats(repos, now);
export const eventos = activity(repos, now);
export const repoByName = new Map(repos.map((r) => [r.name, r]));

/** URL de um arquivo em public/, respeitando o base path do deploy. */
export function asset(p: string): string {
  return `${import.meta.env.BASE_URL}${p.replace(/^\//, "")}`;
}
