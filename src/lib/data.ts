import raw from "@/data/github.json";
import { perfil } from "@/content/perfil";
import { projetosConfig } from "@/content/projetos.config";
import { activity, detectStack, featuredRepos, languageStats, manualToRepo, profileStats, visibleRepos } from "./github";
import type { GithubData, Repo } from "./types";

// o JSON muda a cada build: o tipo inferido pelo TS não serve, o contrato é GithubData
const data = raw as unknown as GithubData;

/** Aplica os textos de `sobrescrever` da config. */
function applyOverrides(r: Repo): Repo & { titulo: string; papel?: string; faculdade: boolean; stack: string[] } {
  const o = projetosConfig.sobrescrever[r.name] ?? {};
  const manual = r.manual ? projetosConfig.manuais.find((m) => manualToRepo(m).name === r.name) : undefined;
  // tecnologias: detectadas no build (ou só as linguagens) + as acrescentadas na config
  const base = r.stack ?? (r.languages ? detectStack(r.languages, "", []) : r.language ? [r.language] : []);
  const stack = [...new Set([...base, ...(r.manual ? r.topics : []), ...(o.tecnologias ?? [])])];
  return {
    ...r,
    stack,
    titulo: o.titulo ?? manual?.nome ?? r.name,
    description: o.descricao ?? r.description,
    og: o.capa ?? r.og,
    papel: o.papel ?? manual?.papel,
    faculdade: projetosConfig.faculdade.includes(r.name),
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
/**
 * Números do perfil (hero/sobre): repositórios contam só o GitHub (literal);
 * linguagens somam as do GitHub com perfil.stackExtra.Linguagens (ex.: SQL).
 */
const githubStats = profileStats(githubVisiveis, now);
const todasLinguagens = new Set(
  [...languageStats(githubVisiveis).map((l) => l.name), ...(perfil.stackExtra.Linguagens ?? [])].map((n) => n.toLowerCase()),
);
export const stats = { ...githubStats, languageCount: todasLinguagens.size };
/** Projetos com site no ar (homepage ou GitHub Pages respondendo). */
export const sitesNoAr = repos.filter((r) => r.homepage).length;
export const eventos = activity(repos, now);
export const repoByName = new Map(repos.map((r) => [r.name, r]));

/** URL de um arquivo em public/, respeitando o base path do deploy. */
export function asset(p: string): string {
  return `${import.meta.env.BASE_URL}${p.replace(/^\//, "")}`;
}
