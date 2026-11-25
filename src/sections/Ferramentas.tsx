import { useRef } from "react";
import { Kicker } from "@/components/Kicker";
import { SectionTitle } from "@/components/SectionTitle";
import { perfil } from "@/content/perfil";
import { linguagens, repos } from "@/lib/data";
import { useReveal } from "@/lib/useReveal";

type Grupo = "Linguagens" | "Front-end" | "Bibliotecas JS" | "Back-end" | "Dados" | "Ferramentas";

/** Tópicos do GitHub reconhecidos → grupo + nome bonito. */
const TOPICOS: Record<string, [Exclude<Grupo, "Linguagens">, string]> = {
  react: ["Front-end", "React"],
  nextjs: ["Front-end", "Next.js"],
  next: ["Front-end", "Next.js"],
  vue: ["Front-end", "Vue"],
  svelte: ["Front-end", "Svelte"],
  angular: ["Front-end", "Angular"],
  tailwind: ["Front-end", "Tailwind CSS"],
  tailwindcss: ["Front-end", "Tailwind CSS"],
  threejs: ["Front-end", "Three.js"],
  gsap: ["Front-end", "GSAP"],
  vite: ["Front-end", "Vite"],
  "jetpack-compose": ["Front-end", "Jetpack Compose"],
  android: ["Front-end", "Android"],
  node: ["Back-end", "Node.js"],
  nodejs: ["Back-end", "Node.js"],
  express: ["Back-end", "Express"],
  django: ["Back-end", "Django"],
  fastapi: ["Back-end", "FastAPI"],
  flask: ["Back-end", "Flask"],
  rest: ["Back-end", "REST"],
  graphql: ["Back-end", "GraphQL"],
  websocket: ["Back-end", "WebSocket"],
  spring: ["Back-end", "Spring"],
  laravel: ["Back-end", "Laravel"],
  postgresql: ["Dados", "PostgreSQL"],
  postgres: ["Dados", "PostgreSQL"],
  sql: ["Dados", "SQL"],
  sqlite: ["Dados", "SQLite"],
  mysql: ["Dados", "MySQL"],
  mongodb: ["Dados", "MongoDB"],
  redis: ["Dados", "Redis"],
  pandas: ["Dados", "Pandas"],
  scraping: ["Dados", "Web scraping"],
  docker: ["Ferramentas", "Docker"],
  playwright: ["Ferramentas", "Playwright"],
  linux: ["Ferramentas", "Linux"],
  cli: ["Ferramentas", "CLI"],
  "github-actions": ["Ferramentas", "GitHub Actions"],
};

/** Bibliotecas e frameworks detectados nos sites → grupo. */
const DETECTADOS: Record<string, Exclude<Grupo, "Linguagens">> = {
  GSAP: "Bibliotecas JS",
  "Three.js": "Bibliotecas JS",
  Lenis: "Bibliotecas JS",
  "Chart.js": "Bibliotecas JS",
  Leaflet: "Bibliotecas JS",
  jQuery: "Bibliotecas JS",
  React: "Front-end",
  Vue: "Front-end",
  "Tailwind CSS": "Front-end",
  Bootstrap: "Front-end",
  "Blazor WebAssembly": "Front-end",
  MudBlazor: "Front-end",
  PWA: "Front-end",
  Supabase: "Back-end",
  "Cloudflare Pages": "Ferramentas",
};

function montarGrupos(): Record<Grupo, string[]> {
  const g: Record<Grupo, string[]> = {
    Linguagens: linguagens.map((l) => l.name),
    "Front-end": [],
    "Bibliotecas JS": [],
    "Back-end": [],
    Dados: [],
    Ferramentas: [],
  };
  // o que você declarou no perfil vem primeiro (a sua ordem); depois o detectado nos repos
  for (const [k, v] of Object.entries(perfil.stackExtra)) if (k in g && k !== "Linguagens") g[k as Grupo].push(...v);
  for (const r of repos) {
    for (const t of r.topics) {
      const hit = TOPICOS[t.toLowerCase()];
      if (hit) g[hit[0]].push(hit[1]);
    }
    for (const s of r.stack) if (DETECTADOS[s]) g[DETECTADOS[s]].push(s);
  }
  g.Linguagens.push(...(perfil.stackExtra.Linguagens ?? []));
  for (const k of Object.keys(g) as Grupo[]) {
    const seen = new Set<string>();
    g[k] = g[k].filter((x) => {
      const key = x.toLowerCase();
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }
  return g;
}

const ORDEM: Grupo[] = ["Linguagens", "Front-end", "Bibliotecas JS", "Back-end", "Dados", "Ferramentas"];

/**
 * Grade assimétrica só com os grupos que têm itens: Linguagens ocupa 7 colunas e 2 linhas,
 * os dois seguintes empilham ao lado (5 colunas) e o resto fecha a última linha (5 + 7, ou 12 sozinho).
 */
function layoutVisivel(grupos: Record<Grupo, string[]>): { grupo: Grupo; className: string }[] {
  const vis = ORDEM.filter((g) => grupos[g].length > 0);
  const [first, ...others] = vis;
  if (!first) return [];
  const out = [{ grupo: first, className: others.length >= 2 ? "lg:col-span-7 lg:row-span-2" : "lg:col-span-7" }];
  others.forEach((g, i) => {
    let cls = "lg:col-span-5";
    const tail = others.length - 2;
    if (others.length === 1) cls = "lg:col-span-5";
    else if (i >= 2) cls = tail === 1 ? "lg:col-span-12" : i === 2 ? "lg:col-span-5" : "lg:col-span-7";
    out.push({ grupo: g, className: cls });
  });
  return out;
}

export function Ferramentas() {
  const ref = useRef<HTMLElement>(null);
  const grupos = montarGrupos();
  useReveal(ref);

  return (
    <section id="stack" ref={ref} aria-labelledby="stack-title" className="wrap pt-[var(--section-gap)]">
      <Kicker cmd="stack --list" />
      <SectionTitle id="stack-title" keyword="FERRAMENTAS" rest="de trabalho." />

      <ul className="mt-[clamp(40px,6vw,88px)] grid gap-x-5 gap-y-8 md:grid-cols-2 lg:grid-cols-12">
        {layoutVisivel(grupos).map(({ grupo, className }, i) => {
          const items = grupos[grupo];
          const big = grupo === "Linguagens";
          return (
            <li key={grupo} data-reveal className={className}>
              <div className="slot term flex h-full flex-col transition-[transform,border-color] duration-150 ease-[var(--ease-out)]">
                <span className="term-title">
                  SLOT {String(i + 1).padStart(2, "0")} · {grupo.toUpperCase()}
                </span>
                <div className="flex-1 px-5 pt-7 pb-6">
                  <h3 className="sr-only">{grupo}</h3>
                  {items.length > 0 ? (
                    <ul
                      className={`mono grid gap-x-6 gap-y-2 ${big ? "text-[clamp(1.25rem,2.2vw,1.75rem)] sm:grid-cols-2" : "text-[1.0625rem]"} ${className.includes("col-span-12") ? "sm:grid-cols-2 lg:grid-cols-4" : ""} text-paper`}
                    >
                      {items.map((x) => (
                        <li key={x} className="flex items-baseline gap-2.5">
                          <span aria-hidden="true" className="text-[0.6em] text-phosphor">
                            ▪
                          </span>
                          {x}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="hw">SLOT VAZIO · preencha stackExtra em src/content/perfil.ts</p>
                  )}
                </div>
                {/* conector de borda, como uma placa de expansão */}
                <span
                  aria-hidden="true"
                  className="mx-5 mb-[-1px] block h-2 border-x border-t border-phosphor-dim bg-[repeating-linear-gradient(90deg,var(--phosphor-dim)_0_3px,transparent_3px_9px)] opacity-60"
                />
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
