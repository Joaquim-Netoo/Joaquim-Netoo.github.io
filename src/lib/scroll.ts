import Lenis from "lenis";
import { gsap, prefersReducedMotion, ScrollTrigger } from "./motion";

let lenis: Lenis | null = null;
let tick: ((time: number) => void) | null = null;

/** Liga o Lenis integrado ao ticker do GSAP. Desligado em reduced-motion. */
export function startSmoothScroll() {
  if (lenis || prefersReducedMotion()) return;
  lenis = new Lenis({ autoRaf: false, anchors: { offset: -72 } });
  lenis.on("scroll", ScrollTrigger.update);
  tick = (time: number) => lenis?.raf(time * 1000);
  gsap.ticker.add(tick);
  gsap.ticker.lagSmoothing(0);
}

export function stopSmoothScroll() {
  if (tick) gsap.ticker.remove(tick);
  lenis?.destroy();
  lenis = null;
  tick = null;
}

/** Rola até um seletor/elemento (usa o Lenis se existir). */
export function scrollToTarget(target: string | HTMLElement | number, immediate = false) {
  if (lenis) {
    lenis.scrollTo(target, { offset: typeof target === "number" ? 0 : -72, immediate, duration: 1.1 });
    return;
  }
  if (typeof target === "number") {
    window.scrollTo({ top: target, behavior: immediate || prefersReducedMotion() ? "auto" : "smooth" });
    return;
  }
  const el = typeof target === "string" ? document.querySelector<HTMLElement>(target) : target;
  if (!el) return;
  const top = el.getBoundingClientRect().top + window.scrollY - 72;
  window.scrollTo({ top, behavior: immediate || prefersReducedMotion() ? "auto" : "smooth" });
}
