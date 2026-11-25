import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { perfil } from "@/content/perfil";
import { asset, repoByName, type ProjetoRepo } from "@/lib/data";
import { relativeTime, shortDate } from "@/lib/format";
import { languageShare, stackCurta } from "@/lib/github";
import { setState, useStore } from "@/lib/store";

const SHADES = [1, 0.68, 0.46, 0.3, 0.18];

/** Elemento que abriu o Dialog: o foco volta para ele ao fechar. */
let origem: HTMLElement | null = null;

export function openProjeto(name: string) {
  origem = document.activeElement instanceof HTMLElement ? document.activeElement : null;
  setState({ projeto: name });
}

/** Capa: imagem social do repo ou, sem ela, uma "tela" com o nome em fósforo. */
export function ProjetoCapa({ repo, eager = false, fill = false }: { repo: ProjetoRepo; eager?: boolean; fill?: boolean }) {
  // fill: ocupa a altura do card no desktop (2:1 no mobile)
  const box = fill ? "aspect-[2/1] sm:aspect-auto sm:h-full sm:min-h-full" : "aspect-[2/1]";
  if (repo.og) {
    return (
      <div className={`relative w-full overflow-hidden bg-tube-2 ${box}`}>
        <img
          src={asset(repo.og)}
          alt=""
          width={1200}
          height={600}
          loading={eager ? "eager" : "lazy"}
          decoding="async"
          className="absolute inset-0 h-full w-full object-cover object-left-top"
        />
        {/* screenshot "dentro do tubo": linhas de varredura leves por cima */}
        <span aria-hidden="true" className="crt-scanlines absolute inset-0 opacity-25" />
      </div>
    );
  }
  return (
    <div
      aria-hidden="true"
      className={`relative grid w-full place-items-center overflow-hidden bg-tube-2 [container-type:inline-size] ${box}`}
    >
      {/* o nome cabe numa linha: a fonte encolhe pela largura do container (cqw) */}
      <span
        className="mono glow px-[6cqw] text-center leading-none whitespace-nowrap"
        style={{ fontSize: `min(3.25rem, calc(88cqw / ${Math.max(repo.titulo.length, 6) * 0.62}))` }}
      >
        {repo.titulo.toUpperCase()}
      </span>
      <span className="hw absolute bottom-3 left-4">{repo.stack.length ? stackCurta(repo.stack).texto : "—"}</span>
      <span className="hw absolute right-4 bottom-3">{repo.manual ? "PROJETO" : repo.stargazers_count > 0 ? `★ ${repo.stargazers_count}` : ""}</span>
      <span className="crt-scanlines absolute inset-0 opacity-20" />
    </div>
  );
}

export function LanguageBar({ repo }: { repo: ProjetoRepo }) {
  const share = repo.languages ? languageShare(repo.languages) : repo.language ? [{ name: repo.language, pct: 100 }] : [];
  if (share.length === 0) return null;
  return (
    <div>
      <div className="flex h-2.5 w-full gap-[2px]" role="img" aria-label={share.map((s) => `${s.name} ${s.pct}%`).join(", ")}>
        {share.map((s, i) => (
          <span
            key={s.name}
            className="h-full bg-phosphor"
            style={{ width: `${s.pct}%`, opacity: SHADES[Math.min(i, SHADES.length - 1)] }}
          />
        ))}
      </div>
      <ul className="mono mt-3 flex flex-wrap gap-x-5 gap-y-1 text-[0.8125rem] text-paper-dim">
        {share.map((s, i) => (
          <li key={s.name} className="flex items-center gap-2">
            <span
              aria-hidden="true"
              className="inline-block size-2 bg-phosphor"
              style={{ opacity: SHADES[Math.min(i, SHADES.length - 1)] }}
            />
            {s.name} <span className="text-phosphor">{s.pct.toLocaleString("pt-BR")}%</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function ProjetoDialog() {
  const name = useStore((s) => s.projeto);
  const repo = name ? repoByName.get(name) : undefined;

  return (
    <Dialog open={Boolean(repo)} onOpenChange={(open) => !open && setState({ projeto: null })}>
      {repo && (
        <DialogContent
          className="w-[min(760px,calc(100%-2rem))] max-w-none gap-0 overflow-visible p-0 sm:max-w-none"
          onCloseAutoFocus={(e) => {
            if (origem && document.contains(origem)) {
              e.preventDefault();
              origem.focus({ preventScroll: true });
            }
            origem = null;
          }}
        >
          <span className="mono absolute top-0 left-4 z-10 -translate-y-1/2 bg-tube px-2 text-[0.8125rem] text-phosphor-dim max-sm:hidden">
            C:\{perfil.nomeCurto}\PROJETOS\{repo.faculdade ? "FACULDADE\\" : ""}
            {repo.name.toUpperCase()}&gt;
          </span>

          {/* o scroll fica aqui dentro: as legendas na borda não são cortadas */}
          <div className="max-h-[86svh] overflow-y-auto overscroll-contain" data-lenis-prevent>
          <div className="border-b border-phosphor-dim/60">
            <ProjetoCapa repo={repo} eager />
          </div>

          <div className="grid gap-7 p-5 sm:p-8">
            <div className="grid gap-3">
              <DialogTitle className="mono glow text-[clamp(1.75rem,4.5vw,2.75rem)] leading-[1.02] font-normal break-words">
                {repo.titulo}
              </DialogTitle>
              {repo.faculdade && <p className="hw">TRABALHO DA FACULDADE</p>}
              {repo.papel && <p className="hw">PAPEL: {repo.papel.toUpperCase()}</p>}
              <DialogDescription className="max-w-[60ch] text-[1.0625rem] leading-relaxed text-paper">
                {repo.description ?? "Sem descrição no GitHub."}
              </DialogDescription>
            </div>

            <dl className="mono grid grid-cols-3 gap-px bg-phosphor-dim/40 text-[0.8125rem]">
              {(repo.manual
                ? [
                    ["ORIGEM", "FORA DO GITHUB"],
                    ["DATA", shortDate(repo.created_at).slice(3)],
                    ["SITE", repo.homepage ? "NO AR" : "—"],
                  ]
                : repo.stargazers_count + repo.forks_count > 0
                  ? [
                      ["ESTRELAS", `★ ${repo.stargazers_count}`],
                      ["FORKS", String(repo.forks_count)],
                      ["ATUALIZADO", relativeTime(repo.pushed_at)],
                    ]
                  : [
                      // sem estrelas/forks: datas dizem mais do que "★ 0"
                      ["CRIADO", shortDate(repo.created_at).slice(3)],
                      ["ATUALIZADO", relativeTime(repo.pushed_at)],
                      ["SITE", repo.homepage ? "NO AR" : "—"],
                    ]
              ).map(([k, v]) => (
                <div key={k} className="bg-tube p-3">
                  <dt className="text-phosphor-dim">{k}</dt>
                  <dd className="mt-1 text-paper">{v}</dd>
                </div>
              ))}
            </dl>

            {/* tudo o que foi usado: linguagens, bibliotecas e tópicos do GitHub, sem repetir */}
            {(() => {
              const vistos = new Set(repo.stack.map((s) => s.toLowerCase()));
              const extras = repo.topics.filter((t) => !vistos.has(t.toLowerCase()));
              const itens = [...repo.stack, ...extras];
              if (itens.length === 0) return null;
              return (
                <div className="grid gap-3">
                  <p className="hw">FEITO COM</p>
                  <ul className="flex flex-wrap gap-2" aria-label="Feito com">
                    {itens.map((t) => (
                      <li key={t}>
                        <Badge>{t}</Badge>
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })()}

            {/* proporção do código só ajuda quando há mais de uma linguagem no repositório */}
            {repo.languages && Object.keys(repo.languages).length > 1 && (
              <div className="grid gap-3">
                <p className="hw">CÓDIGO NO REPOSITÓRIO</p>
                <LanguageBar repo={repo} />
              </div>
            )}

            {repo.readme && (
              <div className="term px-5 pt-7 pb-5">
                <span className="term-title">{repo.manual ? "type PROJETO.TXT" : "type README.md"}</span>
                <div className="grid gap-3 text-[0.9875rem] leading-relaxed text-paper-dim">
                  {repo.readme.split("\n\n").map((p, i) => (
                    <p key={i}>{p}</p>
                  ))}
                </div>
              </div>
            )}

            <div className="flex flex-wrap gap-3">
              {repo.html_url && (
                <Button asChild>
                  <a href={repo.html_url} target="_blank" rel="noreferrer">
                    VER CÓDIGO <span aria-hidden="true">↗</span>
                  </a>
                </Button>
              )}
              {repo.homepage && (
                <Button asChild variant={repo.html_url ? "outline" : "default"}>
                  <a href={repo.homepage} target="_blank" rel="noreferrer">
                    VER AO VIVO <span aria-hidden="true">↗</span>
                  </a>
                </Button>
              )}
            </div>
          </div>
          </div>
        </DialogContent>
      )}
    </Dialog>
  );
}
