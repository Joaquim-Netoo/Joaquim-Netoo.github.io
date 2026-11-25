import raw from "@/data/github.json";
import { projetosConfig } from "@/content/projetos.config";
import { activity, featuredRepos, languageStats, manualToRepo, profileStats, visibleRepos } from "./github";
import type { GithubData, Repo } from "./types";

// o JSON muda a cada build: o tipo inferido pelo TS não serve, o contrato é GithubData
const data = raw as unknown as GithubData;

/** Aplica os textos de `sobrescrever` da config. */
function applyOverrides(r: Repo): Repo & { titulo: string; papel?: string } {
  const o = projetosConfig.sobrescrever[r.name] ?? {};
  const manual = r.manual ? projetosConfig.manuais.find((m) => manualToRepo(m).name === r.name) : undefined;
  return {
    ...r,
    titulo: o.titulo ?? manual?.nome ?? r.name,
    description: o.descricao ?? r.description,
    og: o.capa ?? r.og,
    papel: o.papel ?? manual?.papel,
  };
}

export type ProjetoRepo = ReturnType<typeof applyOverrides>;

const now = new Date();
const manuais = projetosConfig.manuais.map(manualToRepo);
const githubVisiveis = visibleRepos(data.repos, projetosConfig);

export const isSample = data.source === "sample";
export const generatedAt = data.generatedAt;

/** Todos os projetos: GitHub (filtrados pela config) + cadastrados à mão. */
export const repos: ProjetoRepo[] = [...githubVisiveis, ...visibleRepos(manuais, projetosConfig)].map(applyOverrides);

/**
 * Destaques: a regra do GitHub (lista da config ou top 4 por estrelas + tópico "portfolio"),
 * aceitando nomes de projetos manuais na lista, mais os manuais marcados com destaque: true.
 */
const manuaisNaLista = manuais.filter((m) => projetosConfig.destaques.includes(m.name));
const baseDestaques = featuredRepos([...data.repos, ...manuaisNaLista], projetosConfig);
const nomes = new Set(baseDestaques.map((r) => r.name));
const manuaisDestaque = manuais.filter(
  (m, i) => projetosConfig.manuais[i].destaque && !nomes.has(m.name) && !projetosConfig.ocultos.includes(m.name),
);
export const destaques: ProjetoRepo[] = [...baseDestaques, ...manuaisDestaque].map(applyOverrides);

export const linguagens = languageStats(repos);
/** Números do perfil (hero/sobre): só o GitHub, para "REPOSITÓRIOS" ser literal. */
export const stats = profileStats(githubVisiveis, now);
export const eventos = activity(repos, now);
export const repoByName = new Map(repos.map((r) => [r.name, r]));

/** URL de um arquivo em public/, respeitando o base path do deploy. */
export function asset(p: string): string {
  return `${import.meta.env.BASE_URL}${p.replace(/^\//, "")}`;
}
