import { useRef } from "react";
import { Kicker } from "@/components/Kicker";
import { perfil } from "@/content/perfil";
import { isSample, stats } from "@/lib/data";
import { gsap, prefersReducedMotion, SplitText, useGSAP } from "@/lib/motion";
import { scrollToTarget } from "@/lib/scroll";
import { useStore } from "@/lib/store";

function ultimoCommit(days: number | null) {
  if (days === null) return "—";
  if (days === 0) return "hoje";
  if (days === 1) return "há 1 dia";
  return `há ${days} dias`;
}

export function Hero() {
  const ref = useRef<HTMLElement>(null);
  const intro = useStore((s) => s.intro);
  const phosphor = useStore((s) => s.phosphor);
  const name = perfil.nome.toUpperCase();

  // O nome entra letra por letra, como fósforo acendendo, quando a intro atravessa o vidro.
  useGSAP(
    () => {
      if (intro !== "done" || prefersReducedMotion()) return;
      const nameEl = ref.current?.querySelector(".hero-name");
      if (!nameEl) return;
      const split = SplitText.create(nameEl, { type: "chars", aria: "none" });
      const tl = gsap.timeline({ onComplete: () => split.revert() });
      tl.from(split.chars, {
        opacity: 0,
        duration: 0.16,
        stagger: { amount: 0.42 },
        ease: "out",
      }).from(
        ".hero-after",
        { y: 18, opacity: 0, duration: 0.5, stagger: 0.06, ease: "out" },
        0.25,
      );
      return () => split.revert();
    },
    { scope: ref, dependencies: [intro] },
  );

  return (
    <section
      id="topo"
      ref={ref}
      aria-labelledby="hero-title"
      className="wrap relative grid min-h-[calc(100svh-49px)] grid-rows-[1fr_auto] pt-[clamp(48px,9vh,120px)] pb-8 max-md:min-h-[calc(100svh-93px)]"
    >
      <div className="relative">
        <Kicker cmd="whoami" />

        <h1 id="hero-title" className="mt-[clamp(20px,3vh,36px)]">
          <span
            className="hero-name mono glow block leading-[0.86] tracking-[-0.045em]"
            style={{
              // cabe na largura: 64–180 px para nomes curtos, encolhe para nomes longos
              fontSize: `min(11.25rem, calc((100vw - 2 * var(--gutter)) / ${Math.max(name.length, 4) * 0.62}))`,
            }}
          >
            {name}
          </span>
          <span className="hero-after mt-[0.12em] block font-serif text-[clamp(2.25rem,6.6vw,6.5rem)] leading-[1] tracking-[-0.015em] text-paper italic">
            {perfil.cargo}
          </span>
        </h1>

        <div className="mt-[clamp(28px,5vh,56px)] grid gap-8 md:grid-cols-12">
          <div className="hero-after md:col-span-7 lg:col-span-6">
            <p className="max-w-[34ch] text-[length:var(--text-lead)] leading-[1.35] text-paper">{perfil.frase}</p>
            <p className="mono mt-6 flex flex-wrap gap-x-3 gap-y-1 text-[0.875rem] text-phosphor-dim">
              <span>
                REPOSITÓRIOS: <span className="text-phosphor">{stats.repoCount}</span>
              </span>
              <span aria-hidden="true">·</span>
              <span>
                LINGUAGENS: <span className="text-phosphor">{stats.languageCount}</span>
              </span>
              <span aria-hidden="true">·</span>
              <span>
                ÚLTIMO COMMIT: <span className="text-phosphor">{ultimoCommit(stats.lastPushDays)}</span>
              </span>
            </p>
            {isSample && (
              <p className="mono mt-2 text-[0.75rem] text-paper-dim">
                DADOS DE EXEMPLO · defina githubUser em src/content/projetos.config.ts
              </p>
            )}
            <div className="mt-8 flex flex-wrap gap-3">
              <a
                href="#projetos"
                className="btn-term"
                data-variant="solid"
                onClick={(e) => {
                  e.preventDefault();
                  scrollToTarget("#projetos");
                }}
              >
                VER PROJETOS
              </a>
              <a
                href="#contato"
                className="btn-term"
                onClick={(e) => {
                  e.preventDefault();
                  scrollToTarget("#contato");
                }}
              >
                FALAR COMIGO
              </a>
            </div>
          </div>

          <ul
            aria-hidden="true"
            className="hero-after hw hidden content-end justify-items-end gap-1.5 text-right md:col-span-5 md:grid lg:col-span-6"
          >
            <li>CH 01</li>
            <li>640K OK</li>
            <li>SYNC 60HZ</li>
            <li className="text-phosphor">PHOSPHOR {phosphor === "green" ? "P1" : "P3"}</li>
          </ul>
        </div>
      </div>

      <a
        href="#stack-marquee"
        className="hero-after mono mt-12 inline-flex min-h-11 items-center self-end justify-self-start text-[0.8125rem] text-phosphor-dim md:justify-self-end"
        onClick={(e) => {
          e.preventDefault();
          scrollToTarget("#projetos");
        }}
      >
        ROLE ↓<span className="block-cursor" aria-hidden="true" />
      </a>
    </section>
  );
}
