import { useRef } from "react";
import { gsap, prefersReducedMotion, ScrollTrigger, SplitText, useGSAP } from "@/lib/motion";

/**
 * Título de seção: palavra-chave em mono com brilho de fósforo + resto em serifa itálica.
 * Entra com SplitText por linha (máscara, de baixo para cima) uma vez só.
 * Ao sair da tela pelo topo, deixa um rastro fantasma (burn-in) por 300 ms.
 */
export function SectionTitle({ id, keyword, rest }: { id: string; keyword: string; rest: string }) {
  const ref = useRef<HTMLHeadingElement>(null);

  useGSAP(
    () => {
      const el = ref.current;
      if (!el) return;

      const burn = el.querySelector<HTMLElement>("[data-burn]");
      if (burn) {
        ScrollTrigger.create({
          trigger: el,
          start: "top 12%",
          end: "bottom top",
          onLeave: () => {
            burn.classList.remove("is-burning");
            void burn.offsetWidth;
            burn.classList.add("is-burning");
          },
          onEnterBack: () => burn.classList.remove("is-burning"),
        });
      }

      if (prefersReducedMotion()) return;
      const split = SplitText.create(el.querySelectorAll(".split-line"), {
        type: "lines",
        mask: "lines",
        // as linhas só envolvem o texto: o leitor de tela lê o h2 normalmente
        aria: "none",
        linesClass: "title-line",
      });
      gsap.from(split.lines, {
        yPercent: 105,
        duration: 0.6,
        stagger: 0.08,
        ease: "out",
        scrollTrigger: { trigger: el, start: "top 85%", once: true },
        // a máscara cortaria o brilho do fósforo: desfaz o split ao terminar
        onComplete: () => split.revert(),
      });
      return () => split.revert();
    },
    { scope: ref },
  );

  return (
    <h2 id={id} ref={ref} className="mt-6 leading-[0.92]" style={{ fontSize: "var(--text-title)" }}>
      <span className="split-line block">
        <span className="mono glow tracking-[-0.04em]" data-burn={keyword}>
          {keyword}
        </span>
      </span>
      <span className="split-line block font-serif italic text-paper tracking-[-0.01em] leading-[1]">{rest}</span>
    </h2>
  );
}
