/**
 * Busca os repositórios do GitHub em tempo de build e grava src/data/github.json.
 * Roda no predev e no prebuild. Nunca quebra o build: se algo falhar, mantém o último json salvo.
 *
 * Token opcional: GITHUB_TOKEN no .env (ou no ambiente da Action). Ele nunca vai para o cliente.
 */
import { copyFileSync, existsSync, mkdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import path from "node:path";
import sharp from "sharp";
import { PLACEHOLDER_USER, projetosConfig } from "../src/content/projetos.config";
import { cleanReadme, featuredRepos, sortRepos, visibleRepos } from "../src/lib/github";
import type { GithubData, Repo } from "../src/lib/types";

const ROOT = path.resolve(import.meta.dirname, "..");
const OUT = path.join(ROOT, "src/data/github.json");
const SAMPLE = path.join(ROOT, "src/data/github.sample.json");
const OG_DIR = path.join(ROOT, "public/og");
const API = "https://api.github.com";

const tag = "\x1b[32m[github]\x1b[0m";
const warn = (msg: string) => console.warn(`\x1b[33m[github] AVISO:\x1b[0m ${msg}`);

function loadDotEnv() {
  const file = path.join(ROOT, ".env");
  if (!existsSync(file)) return;
  for (const line of readFileSync(file, "utf8").split(/\r?\n/)) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^["']|["']$/g, "");
  }
}

loadDotEnv();
const TOKEN = process.env.GITHUB_TOKEN?.trim();
const USER = (process.env.GITHUB_USER?.trim() || projetosConfig.githubUser).trim();

const headers: Record<string, string> = {
  Accept: "application/vnd.github+json",
  "X-GitHub-Api-Version": "2022-11-28",
  "User-Agent": "portfolio-ligue-a-tela",
  ...(TOKEN ? { Authorization: `Bearer ${TOKEN}` } : {}),
};

async function gh<T>(url: string): Promise<T> {
  const res = await fetch(url, { headers, signal: AbortSignal.timeout(15_000) });
  if (!res.ok) {
    const remaining = res.headers.get("x-ratelimit-remaining");
    throw new Error(`${res.status} ${res.statusText} em ${url}${remaining === "0" ? " (limite de requisições atingido)" : ""}`);
  }
  return (await res.json()) as T;
}

type ApiRepo = Repo & { [k: string]: unknown };

async function fetchAllRepos(user: string): Promise<Repo[]> {
  const all: Repo[] = [];
  for (let page = 1; page <= 10; page++) {
    const batch = await gh<ApiRepo[]>(`${API}/users/${user}/repos?per_page=100&sort=pushed&page=${page}`);
    for (const r of batch) {
      all.push({
        name: r.name,
        description: r.description ?? null,
        html_url: r.html_url,
        homepage: r.homepage || null,
        language: r.language ?? null,
        topics: Array.isArray(r.topics) ? r.topics : [],
        stargazers_count: r.stargazers_count ?? 0,
        forks_count: r.forks_count ?? 0,
        pushed_at: r.pushed_at,
        created_at: r.created_at,
        fork: Boolean(r.fork),
        archived: Boolean(r.archived),
      });
    }
    if (batch.length < 100) break;
  }
  return all;
}

async function fetchDetails(user: string, repo: Repo, previous?: Repo): Promise<void> {
  try {
    repo.languages = await gh<Record<string, number>>(`${API}/repos/${user}/${repo.name}/languages`);
  } catch (e) {
    if (previous?.languages) repo.languages = previous.languages;
    warn(`linguagens de ${repo.name}: ${(e as Error).message}`);
  }
  try {
    const data = await gh<{ content: string; encoding: string }>(`${API}/repos/${user}/${repo.name}/readme`);
    const md = Buffer.from(data.content, (data.encoding as BufferEncoding) || "base64").toString("utf8");
    const clean = cleanReadme(md);
    if (clean) repo.readme = clean;
  } catch (e) {
    if (previous?.readme) repo.readme = previous.readme;
    if (!String((e as Error).message).startsWith("404")) warn(`README de ${repo.name}: ${(e as Error).message}`);
  }
}

/** Baixa a imagem social do repo e converte para WebP. Reaproveita se tiver menos de 7 dias. */
async function fetchOg(user: string, repo: Repo): Promise<void> {
  const file = path.join(OG_DIR, `${repo.name}.webp`);
  const rel = `og/${repo.name}.webp`;
  if (existsSync(file) && Date.now() - statSync(file).mtimeMs < 7 * 86_400_000) {
    repo.og = rel;
    return;
  }
  try {
    let res: Response | null = null;
    for (let attempt = 0; attempt < 3; attempt++) {
      res = await fetch(`https://opengraph.githubassets.com/1/${user}/${repo.name}`, {
        signal: AbortSignal.timeout(20_000),
      });
      if (res.status !== 429) break;
      await new Promise((r) => setTimeout(r, 1500 * (attempt + 1)));
    }
    if (!res || !res.ok) throw new Error(`${res?.status ?? "sem resposta"}`);
    const buf = Buffer.from(await res.arrayBuffer());
    await sharp(buf).resize(1200, 600, { fit: "cover" }).webp({ quality: 78 }).toFile(file);
    repo.og = rel;
  } catch (e) {
    if (existsSync(file)) repo.og = rel;
    warn(`imagem social de ${repo.name}: ${(e as Error).message}`);
  }
}

async function pool<T>(items: T[], size: number, fn: (item: T) => Promise<void>) {
  const queue = [...items];
  await Promise.all(Array.from({ length: Math.min(size, queue.length) }, async () => {
    while (queue.length) await fn(queue.shift() as T);
  }));
}

function readPrevious(): GithubData | null {
  try {
    return JSON.parse(readFileSync(OUT, "utf8")) as GithubData;
  } catch {
    return null;
  }
}

async function main() {
  if (!USER || USER === PLACEHOLDER_USER) {
    const prev = readPrevious();
    if (!prev || prev.source !== "sample") copyFileSync(SAMPLE, OUT);
    warn("githubUser ainda é o placeholder em src/content/projetos.config.ts. Usando os dados de exemplo.");
    return;
  }

  const previous = readPrevious();
  const prevByName = new Map((previous?.user === USER ? previous.repos : []).map((r) => [r.name, r]));

  console.log(`${tag} buscando repositórios de ${USER}${TOKEN ? " (com token)" : " (sem token, limite público)"}…`);
  const repos = await fetchAllRepos(USER);

  // Detalhes (linguagens + README): destaques sempre; sem token, até 12 repos; com token, até 60.
  const visible = visibleRepos(repos, projetosConfig);
  const featured = featuredRepos(repos, projetosConfig);
  const limit = TOKEN ? 60 : 12;
  const detailNames = new Set([...featured, ...sortRepos(visible, "recentes")].slice(0, Math.max(limit, featured.length)).map((r) => r.name));
  const detailed = repos.filter((r) => detailNames.has(r.name));

  await pool(detailed, 4, (r) => fetchDetails(USER, r, prevByName.get(r.name)));

  mkdirSync(OG_DIR, { recursive: true });
  await pool(visible.slice(0, 60), 3, (r) => fetchOg(USER, r));

  const data: GithubData = { user: USER, generatedAt: new Date().toISOString(), source: "api", repos };
  mkdirSync(path.dirname(OUT), { recursive: true });
  writeFileSync(OUT, `${JSON.stringify(data, null, 2)}\n`);
  console.log(`${tag} ${repos.length} repositórios salvos em src/data/github.json (${detailed.length} com detalhes).`);
}

main().catch((e: Error) => {
  warn(`não foi possível atualizar os dados (${e.message}). Mantendo o último github.json salvo.`);
  if (!existsSync(OUT)) copyFileSync(SAMPLE, OUT);
  process.exitCode = 0;
});
