import { lazy, Suspense, useEffect, useRef, useState } from "react";
import { Kicker } from "@/components/Kicker";
import { openProjeto, ProjetoCapa } from "@/components/ProjetoDialog";
import { SectionTitle } from "@/components/SectionTitle";
import { destaques, type ProjetoRepo } from "@/lib/data";
import { relativeTime } from "@/lib/format";
import { isTouch, prefersReducedMotion } from "@/lib/motion";
import { setState, useStore } from "@/lib/store";
import { useReveal } from "@/lib/useReveal";

const FloppyShelf = lazy(() => import("./disquetes/FloppyShelf"));

function hasWebGL(): boolean {
  try {
    const c = document.createElement("canvas");
    return Boolean(c.getContext("webgl2") ?? c.getContext("webgl"));
  } catch {
    return false;
  }
}

/** Disquetes só no desktop, com ponteiro fino, WebGL e sem reduced-motion. */
function useFloppiesEnabled() {
  const [enabled, setEnabled] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1024px)");
    const check = () => setEnabled(mq.matches && !isTouch() && !prefersReducedMotion() && hasWebGL());
    check();
    mq.addEventListener("change", check);
    return () => mq.removeEventListener("change", check);
  }, []);
  return enabled;
}

function ProjetoCard({ repo }: { repo: ProjetoRepo }) {
  const hover = useStore((s) => s.hoverProjeto === repo.name);
  return (
    <article
      data-reveal
      className={`term group relative grid gap-0 transition-colors duration-150 sm:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] ${hover ? "border-phosphor" : ""}`}
      onPointerEnter={() => setState({ hoverProjeto: repo.name })}
      onPointerLeave={() => setState({ hoverProjeto: null })}
    >
      <span className="term-title">{repo.name.toUpperCase()}.EXE</span>
      <div className="overflow-hidden border-phosphor-dim/60 max-sm:border-b sm:border-r">
        <div className="h-full transition-transform duration-200 ease-[var(--ease-out)] group-hover:scale-[1.02]">
          <ProjetoCapa repo={repo} />
        </div>
      </div>
      <div className="flex flex-col gap-3 p-5 sm:p-6">
        <h3 className="mono text-[clamp(1.375rem,2.2vw,1.875rem)] leading-[1.05] text-phosphor">
          <button
            type="button"
            className="text-left after:absolute after:inset-0 after:content-['']"
            onClick={() => openProjeto(repo.name)}
            onFocus={() => setState({ hoverProjeto: repo.name })}
            onBlur={() => setState({ hoverProjeto: null })}
          >
            {repo.titulo}
          </button>
        </h3>
        <p className="line-clamp-3 max-w-[52ch] text-paper">{repo.description ?? "Sem descrição no GitHub."}</p>
        <p className="mono mt-auto flex flex-wrap gap-x-3 pt-2 text-[0.8125rem] text-phosphor-dim">
          <span>{repo.language ?? "—"}</span>
          <span aria-hidden="true">·</span>
          <span>★ {repo.stargazers_count}</span>
          <span aria-hidden="true">·</span>
          <span>atualizado {relativeTime(repo.pushed_at)}</span>
          <span className="ml-auto text-phosphor" aria-hidden="true">
            ABRIR →
          </span>
        </p>
      </div>
    </article>
  );
}

export function Destaques() {
  const ref = useRef<HTMLElement>(null);
  const shelfRef = useRef<HTMLDivElement>(null);
  const enabled = useFloppiesEnabled();
  const [near, setNear] = useState(false);
  useReveal(ref);

  // Carrega a cena dos disquetes só quando a seção se aproxima da viewport.
  useEffect(() => {
    if (!enabled || near || !shelfRef.current) return;
    const io = new IntersectionObserver(([e]) => e.isIntersecting && setNear(true), { rootMargin: "600px 0px" });
    io.observe(shelfRef.current);
    return () => io.disconnect();
  }, [enabled, near]);

  return (
    <section id="projetos" ref={ref} aria-labelledby="projetos-title" className="wrap pt-[var(--section-gap)]">
      <Kicker path={["PROJETOS"]} cmd="dir /destaques" />
      <SectionTitle id="projetos-title" keyword="PROJETOS" rest="que saíram do papel." />

      <div className={`mt-[clamp(40px,6vw,88px)] grid gap-10 ${enabled ? "lg:grid-cols-12" : ""}`}>
        {enabled && (
          <div ref={shelfRef} className="lg:col-span-5" aria-hidden="true">
            <div className="term sticky top-24 aspect-[4/5] w-full">
              <span className="term-title">A:\ DRIVE</span>
              {near && (
                <Suspense fallback={<p className="hw grid h-full place-items-center">LENDO DISQUETES…</p>}>
                  <FloppyShelf repos={destaques} />
                </Suspense>
              )}
              <p className="hw absolute bottom-3 left-4">PASSE O MOUSE · CLIQUE PARA LER</p>
            </div>
          </div>
        )}
        <div className={`grid content-start gap-10 ${enabled ? "lg:col-span-7" : ""}`}>
          {destaques.map((repo) => (
            <ProjetoCard key={repo.name} repo={repo} />
          ))}
          {destaques.length === 0 && (
            <p className="mono text-paper-dim">Nenhum projeto em destaque. Configure em src/content/projetos.config.ts.</p>
          )}
        </div>
      </div>
    </section>
  );
}
