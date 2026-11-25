import { describe, expect, it } from "vitest";
import {
  activity,
  cleanReadme,
  detectStack,
  stackCurta,
  featuredRepos,
  languageShare,
  languageStats,
  firstSentence,
  manualToRepo,
  metaDescription,
  profileStats,
  sortRepos,
  visibleRepos,
} from "./github";
import { relativeTime } from "./format";
import type { ProjetosConfig, Repo } from "./types";

const base: Repo = {
  name: "x",
  description: null,
  html_url: "https://github.com/u/x",
  homepage: null,
  language: "Python",
  topics: [],
  stargazers_count: 0,
  forks_count: 0,
  pushed_at: "2026-01-01T00:00:00Z",
  created_at: "2025-01-01T00:00:00Z",
  fork: false,
  archived: false,
};
const r = (o: Partial<Repo>): Repo => ({ ...base, ...o });

const cfg: ProjetosConfig = {
  githubUser: "u",
  destaques: [],
  ocultos: [],
  mostrarForks: false,
  mostrarArquivados: false,
  sobrescrever: {},
  manuais: [],
  faculdade: [],
};

describe("manualToRepo", () => {
  it("converte um projeto manual num Repo com slug, datas e links", () => {
    const r = manualToRepo({
      nome: "Loja da Padaria Silva",
      descricao: "Site da padaria.",
      data: "2025-08",
      linguagem: "TypeScript",
      tecnologias: ["next.js"],
      link: "https://padaria.com",
      texto: "Texto longo.",
    });
    expect(r).toMatchObject({
      name: "loja-da-padaria-silva",
      description: "Site da padaria.",
      html_url: "",
      homepage: "https://padaria.com",
      language: "TypeScript",
      topics: ["next.js"],
      readme: "Texto longo.",
      manual: true,
      fork: false,
      archived: false,
    });
    expect(r.created_at.startsWith("2025-08")).toBe(true);
    expect(r.pushed_at).toBe(r.created_at);
  });
  it("aceita só o ano e remove acentos do slug", () => {
    const r = manualToRepo({ nome: "Ação & Reação", descricao: "x", data: "2024" });
    expect(r.name).toBe("acao-reacao");
    expect(r.created_at.startsWith("2024-")).toBe(true);
    expect(r.homepage).toBeNull();
  });
});

describe("visibleRepos", () => {
  const repos = [r({ name: "a" }), r({ name: "f", fork: true }), r({ name: "z", archived: true }), r({ name: "h" })];
  it("remove forks, arquivados e ocultos por padrão", () => {
    expect(visibleRepos(repos, { ...cfg, ocultos: ["h"] }).map((x) => x.name)).toEqual(["a"]);
  });
  it("respeita mostrarForks e mostrarArquivados", () => {
    const names = visibleRepos(repos, { ...cfg, mostrarForks: true, mostrarArquivados: true }).map((x) => x.name);
    expect(names).toEqual(["a", "f", "z", "h"]);
  });
});

describe("featuredRepos", () => {
  const repos = [
    r({ name: "a", stargazers_count: 1 }),
    r({ name: "b", stargazers_count: 5 }),
    r({ name: "c", stargazers_count: 5, pushed_at: "2026-06-01T00:00:00Z" }),
    r({ name: "d", stargazers_count: 3 }),
    r({ name: "e", stargazers_count: 2 }),
    r({ name: "p", stargazers_count: 0, topics: ["portfolio"] }),
  ];
  it("sem destaques: top 4 por estrelas (desempate pelo mais recente) + tópico portfolio", () => {
    expect(featuredRepos(repos, cfg).map((x) => x.name)).toEqual(["c", "b", "d", "e", "p"]);
  });
  it("com destaques: usa a ordem da config e ignora nomes inexistentes", () => {
    expect(featuredRepos(repos, { ...cfg, destaques: ["e", "nao-existe", "a"] }).map((x) => x.name)).toEqual([
      "e",
      "a",
      "p",
    ]);
  });
  it("não duplica um repo que está nos destaques e tem o tópico", () => {
    expect(featuredRepos(repos, { ...cfg, destaques: ["p"] }).map((x) => x.name)).toEqual(["p"]);
  });
  it("nunca destaca um repo oculto", () => {
    expect(featuredRepos(repos, { ...cfg, ocultos: ["p", "c"] }).map((x) => x.name)).toEqual(["b", "d", "e", "a"]);
  });
});

describe("languageStats / languageShare", () => {
  it("conta repos por linguagem e ordena desc", () => {
    const repos = [
      r({ language: "Python" }),
      r({ language: "TypeScript", languages: { TypeScript: 10, CSS: 2 } }),
      r({ language: "Python" }),
      r({ language: null }),
    ];
    expect(languageStats(repos)).toEqual([
      { name: "Python", count: 2 },
      { name: "CSS", count: 1 },
      { name: "TypeScript", count: 1 },
    ]);
  });
  it("calcula porcentagens", () => {
    expect(languageShare({ TypeScript: 750, CSS: 250 })).toEqual([
      { name: "TypeScript", pct: 75 },
      { name: "CSS", pct: 25 },
    ]);
  });
  it("agrupa linguagens < 1% em Outras", () => {
    expect(languageShare({ A: 995, B: 3, C: 2 })).toEqual([
      { name: "A", pct: 99.5 },
      { name: "Outras", pct: 0.5 },
    ]);
  });
});

describe("profileStats", () => {
  it("conta repos, linguagens, dias desde o último push e ano do primeiro repo", () => {
    const now = new Date("2026-11-24T12:00:00Z");
    const repos = [
      r({ language: "Go", pushed_at: "2026-11-21T12:00:00Z", created_at: "2023-05-01T00:00:00Z" }),
      r({ language: "Python", pushed_at: "2026-10-01T00:00:00Z", created_at: "2021-02-01T00:00:00Z" }),
    ];
    expect(profileStats(repos, now)).toEqual({ repoCount: 2, languageCount: 2, lastPushDays: 3, firstYear: 2021 });
  });
  it("lista vazia não quebra", () => {
    expect(profileStats([], new Date())).toEqual({ repoCount: 0, languageCount: 0, lastPushDays: null, firstYear: null });
  });
});

describe("sortRepos", () => {
  const repos = [
    r({ name: "beta", stargazers_count: 1, pushed_at: "2026-01-01T00:00:00Z" }),
    r({ name: "Alfa", stargazers_count: 9, pushed_at: "2025-01-01T00:00:00Z" }),
    r({ name: "gama", stargazers_count: 4, pushed_at: "2026-05-01T00:00:00Z" }),
  ];
  it("ordena", () => {
    expect(sortRepos(repos, "recentes").map((x) => x.name)).toEqual(["gama", "beta", "Alfa"]);
    expect(sortRepos(repos, "estrelas").map((x) => x.name)).toEqual(["Alfa", "gama", "beta"]);
    expect(sortRepos(repos, "nome").map((x) => x.name)).toEqual(["Alfa", "beta", "gama"]);
  });
  it("não muta o array original", () => {
    const copy = [...repos];
    sortRepos(repos, "nome");
    expect(repos).toEqual(copy);
  });
});

describe("activity", () => {
  it("gera eventos dos últimos 12 meses, mais recentes primeiro", () => {
    const now = new Date("2026-11-24T00:00:00Z");
    const repos = [
      r({ name: "a", created_at: "2026-03-01T00:00:00Z", pushed_at: "2026-11-01T00:00:00Z" }),
      r({ name: "b", created_at: "2020-01-01T00:00:00Z", pushed_at: "2025-01-01T00:00:00Z" }),
    ];
    expect(activity(repos, now)).toEqual([
      { repo: "a", kind: "push", date: "2026-11-01T00:00:00Z" },
      { repo: "a", kind: "criado", date: "2026-03-01T00:00:00Z" },
    ]);
  });
  it("não repete push quando é o mesmo dia da criação", () => {
    const now = new Date("2026-11-24T00:00:00Z");
    const repos = [r({ name: "a", created_at: "2026-03-01T00:00:00Z", pushed_at: "2026-03-01T05:00:00Z" })];
    expect(activity(repos, now)).toEqual([{ repo: "a", kind: "criado", date: "2026-03-01T00:00:00Z" }]);
  });
});

describe("cleanReadme", () => {
  it("remove imagens, badges, html e títulos e corta em ~600 caracteres", () => {
    const md = [
      "# Meu Projeto",
      "[![build](https://x/badge.svg)](https://x)",
      "![screenshot](img.png)",
      '<p align="center"><img src="a.png"></p>',
      "",
      "Um app que faz **coisas** úteis com [links](https://x.com).",
      "",
      "```bash",
      "npm i",
      "```",
      "",
      "Segundo parágrafo.",
    ].join("\n");
    expect(cleanReadme(md)).toBe("Um app que faz coisas úteis com links.\n\nSegundo parágrafo.");
  });
  it("remove tabelas markdown (podem ter dados pessoais, como matrícula)", () => {
    const md = ["| | |", "|---|---|", "| Aluno(a) | Fulano |", "| Matrícula | 123 |", "", "Texto do projeto."].join("\n");
    expect(cleanReadme(md)).toBe("Texto do projeto.");
  });
  it("corta textos longos numa fronteira de palavra com reticências", () => {
    const out = cleanReadme("palavra ".repeat(200));
    expect(out.length).toBeLessThanOrEqual(601);
    expect(out.endsWith("…")).toBe(true);
  });
});

describe("metaDescription / firstSentence", () => {
  it("lê a meta description (ou og:description) do HTML e decodifica entidades", () => {
    expect(metaDescription('<head><meta name="description" content="Treino &amp; medalhas."></head>')).toBe("Treino & medalhas.");
    expect(metaDescription("<meta content='Via OG' property='og:description'>")).toBe("Via OG");
    expect(metaDescription("<title>Sem meta</title>")).toBeNull();
  });
  it("pega a primeira frase do README, com no máximo ~160 caracteres", () => {
    expect(firstSentence("O projeto é um painel. Feito com Blazor.")).toBe("O projeto é um painel.");
    const long = firstSentence("palavra ".repeat(60));
    expect(long.length).toBeLessThanOrEqual(161);
    expect(long.endsWith("…")).toBe(true);
  });
});

describe("detectStack / stackCurta", () => {
  it("lê HTML inline: CSS, JS, GSAP e Three.js (CDN)", () => {
    const html = `<style>a{}</style><script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/gsap.min.js"></script>
      <script>var s="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js"</script>`;
    expect(detectStack({ HTML: 100 }, html, [])).toEqual(["HTML", "CSS", "JavaScript", "GSAP", "Three.js"]);
  });
  it("lê import map, CSS externo e scripts do site", () => {
    const html = `<link rel="stylesheet" href="css/app.css"><script type="importmap">{"imports":{"three":"./vendor/three.module.min.js"}}</script>`;
    expect(detectStack({ JavaScript: 10, CSS: 5, HTML: 1 }, html, ["gsap.to(x)"])).toEqual([
      "HTML",
      "CSS",
      "JavaScript",
      "GSAP",
      "Three.js",
    ]);
  });
  it("não confunde a palavra 'three' com Three.js", () => {
    expect(detectStack({ HTML: 1 }, "<p>one two three</p><script>let threeCount=1</script>", [])).toEqual(["HTML", "JavaScript"]);
  });
  it("sem site: usa só as linguagens do GitHub, na ordem web", () => {
    expect(detectStack({ TypeScript: 10, CSS: 2, HTML: 5 }, "", [])).toEqual(["HTML", "CSS", "TypeScript"]);
  });
  it("versão curta para a tabela: abrevia e mostra +N", () => {
    expect(stackCurta(["HTML", "CSS", "JavaScript", "GSAP", "Three.js"])).toEqual({ texto: "HTML · CSS · JS", mais: 2 });
    expect(stackCurta(["TypeScript"])).toEqual({ texto: "TS", mais: 0 });
  });
});

describe("relativeTime", () => {
  const now = new Date("2026-11-24T12:00:00Z");
  it("formata em pt-BR", () => {
    expect(relativeTime("2026-11-24T08:00:00Z", now)).toBe("hoje");
    expect(relativeTime("2026-11-23T08:00:00Z", now)).toBe("ontem");
    expect(relativeTime("2026-11-21T12:00:00Z", now)).toBe("há 3 dias");
    expect(relativeTime("2026-11-03T12:00:00Z", now)).toBe("há 3 semanas");
    expect(relativeTime("2026-06-01T12:00:00Z", now)).toBe("há 5 meses");
    expect(relativeTime("2025-11-01T12:00:00Z", now)).toBe("há 1 ano");
    expect(relativeTime("2023-01-01T12:00:00Z", now)).toBe("há 3 anos");
  });
});
