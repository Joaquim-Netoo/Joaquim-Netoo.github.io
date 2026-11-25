import { useMemo, useRef, useState } from "react";
import { Kicker } from "@/components/Kicker";
import { openProjeto } from "@/components/ProjetoDialog";
import { SectionTitle } from "@/components/SectionTitle";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { linguagens, repos, type ProjetoRepo } from "@/lib/data";
import { isoDay } from "@/lib/format";
import { sortRepos, type SortMode } from "@/lib/github";
import { gsap, prefersReducedMotion, useGSAP } from "@/lib/motion";

const TODAS = "TODAS";
const SORTS: { id: SortMode; label: string }[] = [
  { id: "recentes", label: "RECENTES" },
  { id: "estrelas", label: "ESTRELAS" },
  { id: "nome", label: "NOME" },
];

const ROW =
  "dir-row group relative text-paper transition-colors duration-100 max-md:grid max-md:grid-cols-[1fr_auto] max-md:gap-x-4 max-md:border-t max-md:border-phosphor-dim/40 max-md:px-4 max-md:py-3";

function RepoRow({ r, nested = false }: { r: ProjetoRepo; nested?: boolean }) {
  return (
    <tr
      className={`${ROW} cursor-pointer hover:bg-phosphor hover:text-tube focus-within:bg-phosphor focus-within:text-tube`}
      onClick={() => openProjeto(r.name)}
    >
      <td className={`py-2.5 pr-5 max-md:col-span-2 max-md:p-0 ${nested ? "pl-10 max-md:pl-5" : "pl-5"}`}>
        {nested && (
          <span aria-hidden="true" className="mr-2 text-phosphor-dim group-hover:text-tube">
            └
          </span>
        )}
        <button
          type="button"
          className="text-left text-phosphor outline-none group-hover:text-tube group-focus-within:text-tube"
          onClick={(e) => {
            e.stopPropagation();
            openProjeto(r.name);
          }}
        >
          {r.titulo}
        </button>
        {r.archived && <span className="ml-2 text-[0.75rem] opacity-70">[ARQ]</span>}
        {r.fork && <span className="ml-2 text-[0.75rem] opacity-70">[FORK]</span>}
        {r.manual && <span className="ml-2 text-[0.75rem] opacity-70">[EXTERNO]</span>}
      </td>
      <td className="px-5 py-2.5 max-md:p-0 max-md:text-[0.8125rem] max-md:opacity-80">{r.language ?? "—"}</td>
      <td className="px-5 py-2.5 text-right tabular-nums max-md:hidden">{r.manual ? "—" : r.stargazers_count}</td>
      <td className="px-5 py-2.5 text-right tabular-nums max-md:p-0 max-md:text-[0.8125rem] max-md:opacity-80">
        {!r.manual && r.stargazers_count > 0 && <span className="md:hidden">★ {r.stargazers_count} · </span>}
        {isoDay(r.pushed_at)}
      </td>
    </tr>
  );
}

export function Arquivo() {
  const ref = useRef<HTMLElement>(null);
  const [lang, setLang] = useState(TODAS);
  const [sort, setSort] = useState<SortMode>("recentes");
  const [pastaAberta, setPastaAberta] = useState(false);

  // Filtro: linguagem principal do repo. Só linguagens que são principais em algum repo.
  const tabs = useMemo(() => {
    const primary = new Set(repos.map((r) => r.language).filter(Boolean) as string[]);
    return [TODAS, ...linguagens.map((l) => l.name).filter((n) => primary.has(n)).slice(0, 8)];
  }, []);

  const filtrados = useMemo(
    () => sortRepos(lang === TODAS ? repos : repos.filter((r) => r.language === lang), sort),
    [lang, sort],
  );
  const projetos = filtrados.filter((r) => !r.faculdade);
  const faculdade = filtrados.filter((r) => r.faculdade);

  // Linhas aparecem como um `dir` imprimindo: 30 ms por linha, só as 12 primeiras, uma vez.
  useGSAP(
    () => {
      if (prefersReducedMotion()) return;
      const lines = gsap.utils.toArray<HTMLElement>(".dir-row", ref.current).slice(0, 12);
      gsap.from(lines, {
        opacity: 0,
        x: -8,
        duration: 0.24,
        stagger: 0.03,
        ease: "out",
        scrollTrigger: { trigger: ".dir-table", start: "top 80%", once: true },
      });
    },
    { scope: ref },
  );

  return (
    <section id="arquivo" ref={ref} aria-labelledby="arquivo-title" className="wrap pt-[var(--section-gap)]">
      <Kicker path={["PROJETOS"]} cmd="dir /todos" />
      <SectionTitle id="arquivo-title" keyword="ARQUIVO" rest="completo." />

      <Tabs value={lang} onValueChange={setLang} className="mt-[clamp(36px,5vw,72px)] gap-0">
        <div className="flex flex-wrap items-end justify-between gap-x-10 gap-y-4">
          <TabsList aria-label="Filtrar por linguagem" className="min-w-0">
            {tabs.map((t) => (
              <TabsTrigger key={t} value={t}>
                {t.toUpperCase()}
              </TabsTrigger>
            ))}
          </TabsList>
          <div className="mono flex items-center gap-1 text-[0.875rem]" role="group" aria-label="Ordenar por">
            <span className="pr-2 text-phosphor-dim">ORDEM:</span>
            {SORTS.map((s) => (
              <button
                key={s.id}
                type="button"
                aria-pressed={sort === s.id}
                onClick={() => setSort(s.id)}
                className="min-h-11 px-2 text-paper-dim transition-[color,transform] duration-150 hover:text-phosphor active:scale-[0.97] aria-pressed:text-phosphor aria-pressed:underline aria-pressed:underline-offset-4"
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>

        <p className="sr-only" aria-live="polite">
          {projetos.length} projetos e {faculdade.length} trabalhos da faculdade listados
        </p>

        <TabsContent value={lang} className="dir-table term mt-8 pt-3" tabIndex={-1}>
          <span className="term-title">
            {filtrados.length} REPOSITÓRIO{filtrados.length === 1 ? "" : "S"} ·{" "}
            {lang === TODAS ? "*.*" : `*.${lang.toLowerCase()}`}
          </span>
          <table className="mono w-full border-collapse text-left text-[0.9375rem] max-md:block">
            <caption className="sr-only">Todos os repositórios, com os trabalhos da faculdade numa pasta separada</caption>
            <thead className="text-[0.8125rem] text-phosphor-dim max-md:hidden">
              <tr>
                <th scope="col" className="px-5 py-3 font-normal">NOME</th>
                <th scope="col" className="px-5 py-3 font-normal">LINGUAGEM</th>
                <th scope="col" className="px-5 py-3 text-right font-normal">★</th>
                <th scope="col" className="px-5 py-3 text-right font-normal">ATUALIZADO</th>
              </tr>
            </thead>
            <tbody className="max-md:block">
              {projetos.map((r) => (
                <RepoRow key={r.name} r={r} />
              ))}
            </tbody>

            {faculdade.length > 0 && (
              <>
                {/* pasta FACULDADE\ no estilo DOS: abre e fecha com clique ou teclado */}
                <tbody className="max-md:block">
                  <tr className={`${ROW} border-t border-phosphor-dim/40`}>
                    <td colSpan={4} className="p-0 max-md:col-span-2">
                      <button
                        type="button"
                        aria-expanded={pastaAberta}
                        aria-controls="pasta-faculdade"
                        onClick={() => setPastaAberta((v) => !v)}
                        className="flex min-h-12 w-full flex-wrap items-center gap-x-4 gap-y-1 px-5 py-2.5 text-left transition-colors duration-100 hover:bg-phosphor hover:text-tube max-md:px-0"
                      >
                        <span className="text-phosphor-dim" aria-hidden="true">
                          {pastaAberta ? "▾" : "▸"}
                        </span>
                        <span className="text-paper">FACULDADE\</span>
                        <span className="text-phosphor-dim">&lt;DIR&gt;</span>
                        <span className="text-[0.8125rem] text-paper-dim">
                          {faculdade.length} trabalho{faculdade.length === 1 ? "" : "s"} de disciplinas da faculdade
                        </span>
                        <span className="ml-auto text-[0.8125rem] text-phosphor">{pastaAberta ? "FECHAR" : "ABRIR"}</span>
                      </button>
                    </td>
                  </tr>
                </tbody>
                <tbody id="pasta-faculdade" hidden={!pastaAberta} className="max-md:block">
                  {faculdade.map((r) => (
                    <RepoRow key={r.name} r={r} nested />
                  ))}
                </tbody>
              </>
            )}
          </table>
        </TabsContent>
      </Tabs>
    </section>
  );
}
