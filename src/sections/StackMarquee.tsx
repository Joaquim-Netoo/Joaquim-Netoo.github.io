import { useRef } from "react";
import { linguagens } from "@/lib/data";
import { gsap, prefersReducedMotion, ScrollTrigger, useGSAP } from "@/lib/motion";

/** Faixa de linguagens calculada dos repos. A velocidade reage levemente ao scroll. */
export function StackMarquee() {
  const ref = useRef<HTMLDivElement>(null);
  const items = linguagens.map((l) => l.name.toUpperCase());
  const reduced = prefersReducedMotion();

  useGSAP(
    () => {
      if (prefersReducedMotion() || items.length === 0) return;
      const track = ref.current?.querySelector<HTMLElement>(".marquee-track");
      if (!track) return;
      // A faixa tem 2 cópias: andar 50% dá a volta sem emenda.
      const loop = gsap.to(track, { xPercent: -50, duration: Math.max(18, items.length * 3.2), ease: "none", repeat: -1 });
      const setSpeed = gsap.quickTo(loop, "timeScale", { duration: 0.6, ease: "out" });
      const st = ScrollTrigger.create({
        trigger: ref.current,
        start: "top bottom",
        end: "bottom top",
        onUpdate: (self) => {
          const v = gsap.utils.clamp(-3, 3, self.getVelocity() / 400);
          setSpeed(Math.abs(v) < 1 ? 1 : v);
        },
        onToggle: (self) => (self.isActive ? loop.play() : loop.pause()),
      });
      const settle = () => setSpeed(1);
      ScrollTrigger.addEventListener("scrollEnd", settle);
      return () => {
        ScrollTrigger.removeEventListener("scrollEnd", settle);
        st.kill();
        loop.kill();
      };
    },
    { scope: ref },
  );

  if (items.length === 0) return null;

  // Repete a lista para que cada cópia seja mais larga que a tela (sem buraco no loop).
  const filled = Array.from({ length: Math.ceil(14 / items.length) }, () => items).flat();

  const row = (copy: number) => (
    <ul className="flex shrink-0 items-center" aria-hidden={copy > 0 ? true : undefined}>
      {(reduced ? items : filled).map((name, i) => (
        <li
          key={`${copy}-${i}`}
          aria-hidden={i >= items.length ? true : undefined}
          className="flex items-center whitespace-nowrap"
        >
          <span className="px-[0.45em]">{name}</span>
          <span aria-hidden="true" className="text-phosphor-dim">
            ▪
          </span>
        </li>
      ))}
    </ul>
  );

  return (
    <div
      id="stack-marquee"
      ref={ref}
      className="mt-[clamp(32px,6vh,72px)] overflow-hidden border-y border-phosphor-dim/60 py-[clamp(14px,2.2vw,26px)]"
    >
      <h2 className="sr-only">Linguagens dos meus repositórios</h2>
      <div
        className={`marquee-track mono flex text-[clamp(1.75rem,4.4vw,4.25rem)] leading-none text-paper ${reduced ? "wrap w-full flex-wrap [&>ul]:flex-wrap [&>ul]:gap-y-3" : "w-max"}`}
      >
        {row(0)}
        {!reduced && row(1)}
      </div>
    </div>
  );
}
