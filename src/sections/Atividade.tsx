import { useRef } from "react";
import { Kicker } from "@/components/Kicker";
import { openProjeto } from "@/components/ProjetoDialog";
import { SectionTitle } from "@/components/SectionTitle";
import { eventos, repoByName } from "@/lib/data";
import { shortDate } from "@/lib/format";
import { gsap, prefersReducedMotion, ScrollTrigger, useGSAP } from "@/lib/motion";

const MAX = 14;

export function Atividade() {
  const ref = useRef<HTMLElement>(null);
  const list = eventos.slice(0, MAX);

  // A linha é desenhada (DrawSVG) conforme o scroll; cada ponto acende quando a linha passa.
  useGSAP(
    () => {
      const root = ref.current;
      if (!root) return;
      const items = gsap.utils.toArray<HTMLElement>(".log-item", root);
      if (prefersReducedMotion()) {
        items.forEach((el) => el.classList.add("is-lit"));
        return;
      }
      gsap.fromTo(
        ".log-line",
        { drawSVG: "0% 0%" },
        {
          drawSVG: "0% 100%",
          ease: "none",
          scrollTrigger: { trigger: ".log-list", start: "top 65%", end: "bottom 65%", scrub: 0.4 },
        },
      );
      items.forEach((el) =>
        ScrollTrigger.create({
          trigger: el,
          start: "top 65%",
          onEnter: () => el.classList.add("is-lit"),
          onLeaveBack: () => el.classList.remove("is-lit"),
        }),
      );
    },
    { scope: ref },
  );

  return (
    <section id="atividade" ref={ref} aria-labelledby="atividade-title" className="wrap pt-[var(--section-gap)]">
      <Kicker cmd="log --graph" />
      <SectionTitle id="atividade-title" keyword="O QUE" rest="ando construindo." />

      {list.length === 0 ? (
        <p className="mono mt-12 text-paper-dim">Nenhuma atividade nos últimos 12 meses.</p>
      ) : (
        <div className="mt-[clamp(40px,6vw,88px)] grid gap-10 lg:grid-cols-12">
          <p className="hw lg:col-span-3">
            ÚLTIMOS 12 MESES
            <br />
            {list.length} EVENTOS · CRIAÇÃO E ÚLTIMO PUSH
          </p>
          <ol className="log-list relative lg:col-span-9">
            <svg
              aria-hidden="true"
              className="absolute top-0 left-[7px] h-full w-[2px] overflow-visible"
              preserveAspectRatio="none"
              viewBox="0 0 2 100"
            >
              <line x1="1" y1="0" x2="1" y2="100" stroke="var(--phosphor-dim)" strokeWidth="2" opacity="0.25" vectorEffect="non-scaling-stroke" />
              <line className="log-line" x1="1" y1="0" x2="1" y2="100" stroke="var(--phosphor)" strokeWidth="2" vectorEffect="non-scaling-stroke" />
            </svg>
            {list.map((e) => (
              <li
                key={`${e.repo}-${e.kind}`}
                className="log-item group relative grid grid-cols-[16px_1fr] gap-x-5 pb-7 last:pb-0 sm:grid-cols-[16px_9rem_1fr]"
              >
                <span
                  aria-hidden="true"
                  className="log-dot relative top-[0.35em] size-4 border border-phosphor-dim bg-tube transition-[background-color,border-color] duration-200 group-[.is-lit]:border-phosphor group-[.is-lit]:bg-phosphor"
                />
                <time dateTime={e.date} className="mono text-[0.875rem] text-phosphor-dim max-sm:col-start-2">
                  {repoByName.get(e.repo)?.soAno ? e.date.slice(0, 4) : shortDate(e.date)}
                </time>
                <div className="max-sm:col-start-2">
                  <button
                    type="button"
                    className="mono text-left text-[clamp(1.125rem,1.8vw,1.5rem)] leading-tight text-paper transition-colors duration-150 group-[.is-lit]:text-phosphor hover:underline"
                    onClick={() => openProjeto(e.repo)}
                  >
                    {repoByName.get(e.repo)?.titulo ?? e.repo}
                  </button>
                  <span className="hw ml-3">
                    {e.kind === "criado" ? "+ CRIADO" : "↑ PUSH"}
                    {repoByName.get(e.repo)?.faculdade && " · FACULDADE"}
                  </span>
                </div>
              </li>
            ))}
          </ol>
        </div>
      )}
    </section>
  );
}
