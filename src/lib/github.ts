import { daysBetween, isoDay } from "./format";
import type { ProjetoManual, ProjetosConfig, Repo } from "./types";

function slugify(s: string): string {
  return s
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/** Projeto cadastrado à mão (fora do GitHub) → mesmo formato de um repo. */
export function manualToRepo(m: ProjetoManual): Repo {
  const [ano, mes = "06"] = m.data.split("-");
  const date = `${ano}-${mes.padStart(2, "0")}-15T12:00:00Z`;
  return {
    name: slugify(m.nome),
    description: m.descricao,
    html_url: m.codigo ?? "",
    homepage: m.link ?? null,
    language: m.linguagem ?? null,
    topics: m.tecnologias ?? [],
    stargazers_count: 0,
    forks_count: 0,
    pushed_at: date,
    created_at: date,
    fork: false,
    archived: false,
    readme: m.texto,
    og: m.capa,
    manual: true,
  };
}

export type SortMode = "recentes" | "estrelas" | "nome";

const byPushedDesc = (a: Repo, b: Repo) => +new Date(b.pushed_at) - +new Date(a.pushed_at);

/** Remove forks, arquivados e ocultos conforme a config. */
export function visibleRepos(repos: Repo[], cfg: ProjetosConfig): Repo[] {
  return repos.filter(
    (r) =>
      (cfg.mostrarForks || !r.fork) && (cfg.mostrarArquivados || !r.archived) && !cfg.ocultos.includes(r.name),
  );
}

/**
 * Destaques: a lista da config (na ordem) ou, se vazia, os 4 com mais estrelas
 * (desempate pelo push mais recente). Repos com o tópico "portfolio" entram sempre.
 */
export function featuredRepos(repos: Repo[], cfg: ProjetosConfig): Repo[] {
  const visible = visibleRepos(repos, cfg);
  const byName = new Map(visible.map((r) => [r.name, r]));
  const base =
    cfg.destaques.length > 0
      ? cfg.destaques.map((n) => byName.get(n)).filter((r): r is Repo => Boolean(r))
      : [...visible].sort((a, b) => b.stargazers_count - a.stargazers_count || byPushedDesc(a, b)).slice(0, 4);
  const names = new Set(base.map((r) => r.name));
  const tagged = visible.filter((r) => r.topics.includes("portfolio") && !names.has(r.name));
  return [...base, ...tagged];
}

/** Linguagens presentes nos repos (principal + mapa de bytes), contadas por repo. */
export function languageStats(repos: Repo[]): { name: string; count: number }[] {
  const counts = new Map<string, number>();
  for (const r of repos) {
    const langs = new Set<string>();
    if (r.language) langs.add(r.language);
    if (r.languages) Object.keys(r.languages).forEach((l) => langs.add(l));
    langs.forEach((l) => counts.set(l, (counts.get(l) ?? 0) + 1));
  }
  return [...counts.entries()]
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));
}

/** Porcentagem por linguagem (1 casa), agrupando < 1% em "Outras". */
export function languageShare(languages: Record<string, number>): { name: string; pct: number }[] {
  const total = Object.values(languages).reduce((s, v) => s + v, 0);
  if (total === 0) return [];
  const round = (n: number) => Math.round(n * 10) / 10;
  const out: { name: string; pct: number }[] = [];
  let other = 0;
  for (const [name, bytes] of Object.entries(languages).sort((a, b) => b[1] - a[1])) {
    const pct = (bytes / total) * 100;
    if (pct < 1) other += pct;
    else out.push({ name, pct: round(pct) });
  }
  if (other > 0) out.push({ name: "Outras", pct: round(other) });
  return out;
}

export interface ProfileStats {
  repoCount: number;
  languageCount: number;
  lastPushDays: number | null;
  firstYear: number | null;
}

export function profileStats(repos: Repo[], now: Date = new Date()): ProfileStats {
  if (repos.length === 0) return { repoCount: 0, languageCount: 0, lastPushDays: null, firstYear: null };
  const lastPush = Math.max(...repos.map((r) => +new Date(r.pushed_at)));
  const firstCreated = Math.min(...repos.map((r) => +new Date(r.created_at)));
  return {
    repoCount: repos.length,
    languageCount: languageStats(repos).length,
    lastPushDays: Math.max(0, daysBetween(new Date(lastPush), now)),
    firstYear: new Date(firstCreated).getUTCFullYear(),
  };
}

export function sortRepos<T extends Repo>(repos: T[], mode: SortMode): T[] {
  const copy = [...repos];
  if (mode === "recentes") return copy.sort(byPushedDesc);
  if (mode === "estrelas") return copy.sort((a, b) => b.stargazers_count - a.stargazers_count || byPushedDesc(a, b));
  return copy.sort((a, b) => a.name.localeCompare(b.name, "pt-BR", { sensitivity: "base" }));
}

export interface ActivityEvent {
  repo: string;
  kind: "criado" | "push";
  date: string;
}

/** Eventos de criação e último push dos últimos 12 meses, do mais recente ao mais antigo. */
export function activity(repos: Repo[], now: Date = new Date()): ActivityEvent[] {
  const within = (d: string) => daysBetween(d, now) <= 365 && daysBetween(d, now) >= 0;
  const events: ActivityEvent[] = [];
  for (const r of repos) {
    if (within(r.created_at)) events.push({ repo: r.name, kind: "criado", date: r.created_at });
    if (within(r.pushed_at) && isoDay(r.pushed_at) !== isoDay(r.created_at))
      events.push({ repo: r.name, kind: "push", date: r.pushed_at });
  }
  return events.sort((a, b) => +new Date(b.date) - +new Date(a.date));
}

/** Limpa o markdown do README e devolve os primeiros parágrafos (~600 caracteres). */
export function cleanReadme(md: string, max = 600): string {
  const text = md
    .replace(/\r\n/g, "\n")
    .replace(/```[\s\S]*?```/g, "")
    .replace(/<!--[\s\S]*?-->/g, "")
    .replace(/<[^>]+>/g, "")
    .replace(/!\[[^\]]*\]\([^)]*\)/g, "")
    .replace(/\[\s*\]\([^)]*\)/g, "")
    .replace(/\[([^\]]+)\]\([^)]*\)/g, "$1")
    .replace(/^\s{0,3}#{1,6}\s.*$/gm, "")
    .replace(/^\s*[-=]{3,}\s*$/gm, "")
    .replace(/(\*\*|__|`)/g, "");

  const paragraphs = text
    .split(/\n\s*\n/)
    .map((p) => p.split("\n").map((l) => l.trim()).filter(Boolean).join(" ").trim())
    .filter((p) => p.length > 0);

  let out = paragraphs.join("\n\n");
  if (out.length > max) {
    const cut = out.slice(0, max);
    const lastSpace = cut.lastIndexOf(" ");
    out = `${(lastSpace > max * 0.6 ? cut.slice(0, lastSpace) : cut).trimEnd()}…`;
  }
  return out;
}
