import type { RefObject } from "react";
import { gsap, prefersReducedMotion, useGSAP } from "./motion";

/**
 * Entrada das partes de uma seção: os elementos [data-reveal] sobem 24 px com opacidade,
 * em sequência (70 ms), uma vez só quando a seção entra na tela. Sem JS, tudo fica visível.
 */
export function useReveal(scope: RefObject<HTMLElement | null>) {
  useGSAP(
    () => {
      const root = scope.current;
      if (!root || prefersReducedMotion()) return;
      const items = gsap.utils.toArray<HTMLElement>("[data-reveal]", root);
      if (items.length === 0) return;
      gsap.from(items, {
        y: 24,
        opacity: 0,
        duration: 0.56,
        stagger: 0.07,
        ease: "out",
        scrollTrigger: { trigger: root, start: "top 78%", once: true },
      });
    },
    { scope },
  );
}
