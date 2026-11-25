import { useEffect, useRef } from "react";
import { perfil } from "@/content/perfil";
import { gsap, prefersReducedMotion } from "@/lib/motion";
import { scrollToTarget } from "@/lib/scroll";
import { getState, setState, useStore } from "@/lib/store";
import { playClick, startHum, stopHum } from "@/lib/sound";

/**
 * Animação de desligar do CRT: a imagem se comprime numa linha horizontal, depois num ponto, e some.
 * Um único brilho suave (sem flashes repetidos, WCAG 2.3.1).
 */
export function desligar() {
  const tela = document.getElementById("tela");
  const off = document.getElementById("tela-off");
  const line = document.getElementById("tela-linha");
  if (!tela || !off || !line || getState().off) return;
  setState({ off: true });
  if (getState().sound) {
    playClick();
    stopHum();
  }

  const cy = window.scrollY + window.innerHeight / 2;
  gsap.set(off, { autoAlpha: 1 });
  gsap.set(off.querySelector(".off-msg"), { autoAlpha: 0 });

  if (prefersReducedMotion()) {
    gsap.set(tela, { autoAlpha: 0 });
    gsap.to(off.querySelector(".off-msg"), { autoAlpha: 1, duration: 0.2 });
    (off.querySelector(".off-btn") as HTMLElement | null)?.focus();
    return;
  }

  gsap
    .timeline({ defaults: { ease: "inOut" } })
    .set(off, { backgroundColor: "rgba(0,0,0,0)" })
    .set(tela, { transformOrigin: `50% ${cy}px` })
    .to(tela, { scaleY: 0.004, duration: 0.28, ease: "power2.in" })
    .to(off, { backgroundColor: "rgba(0,0,0,1)", duration: 0.12 }, "<0.16")
    .fromTo(line, { autoAlpha: 0, scaleX: 1, scaleY: 1 }, { autoAlpha: 1, duration: 0.08 }, "<")
    .set(tela, { autoAlpha: 0 })
    .to(line, { scaleX: 0.006, duration: 0.22, ease: "power3.in" })
    .to(line, { scaleY: 2.4, duration: 0.12, ease: "out" }, "<0.16")
    .to(line, { autoAlpha: 0, duration: 0.5, ease: "out" })
    .to(off.querySelector(".off-msg"), { autoAlpha: 1, duration: 0.4 }, "+=0.25")
    .add(() => (off.querySelector(".off-btn") as HTMLElement | null)?.focus());
}

export function ligar() {
  const tela = document.getElementById("tela");
  const off = document.getElementById("tela-off");
  const line = document.getElementById("tela-linha");
  if (!tela || !off || !line || !getState().off) return;
  if (getState().sound) {
    playClick();
    startHum();
  }
  scrollToTarget(0, true);
  const cy = window.innerHeight / 2;
  const done = () => {
    gsap.set(off, { autoAlpha: 0 });
    gsap.set(tela, { clearProps: "transform,transformOrigin,opacity,visibility" });
    setState({ off: false });
    document.getElementById("topo")?.focus({ preventScroll: true });
  };
  if (prefersReducedMotion()) {
    gsap.set(off.querySelector(".off-msg"), { autoAlpha: 0 });
    gsap.to(tela, { autoAlpha: 1, duration: 0.2, onComplete: done });
    return;
  }
  gsap
    .timeline({ onComplete: done })
    .to(off.querySelector(".off-msg"), { autoAlpha: 0, duration: 0.15 })
    .set(tela, { transformOrigin: `50% ${cy}px`, scaleY: 0.004, autoAlpha: 1 })
    .fromTo(line, { autoAlpha: 1, scaleX: 0.006, scaleY: 1 }, { scaleX: 1, duration: 0.24, ease: "out" })
    .to(tela, { scaleY: 1, duration: 0.34, ease: "out" })
    .to(line, { autoAlpha: 0, duration: 0.2 }, "<")
    .to(off, { backgroundColor: "rgba(0,0,0,0)", duration: 0.2 }, "<");
}

/** Camada que fica por cima quando a tela está desligada. */
export function TelaDesligada() {
  const off = useStore((s) => s.off);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const tela = document.getElementById("tela");
    if (tela) tela.inert = off;
    if (!off) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Enter" || e.key === " " || e.key === "Escape") {
        e.preventDefault();
        ligar();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [off]);

  return (
    <div
      id="tela-off"
      ref={ref}
      className="invisible fixed inset-0 z-[80] grid place-items-center bg-black opacity-0"
      aria-hidden={!off}
    >
      <span
        id="tela-linha"
        aria-hidden="true"
        className="invisible absolute top-1/2 left-0 h-[3px] w-full -translate-y-1/2 bg-[#f4fff7] opacity-0 shadow-[0_0_18px_4px_rgb(var(--phosphor-rgb)/0.55)]"
      />
      <div className="off-msg grid justify-items-center gap-8 px-6 text-center">
        <p className="mono glow text-[clamp(1rem,2.4vw,1.5rem)] leading-snug">
          IT IS NOW SAFE TO TURN OFF
          <br />
          YOUR COMPUTER.
        </p>
        <button type="button" className="off-btn btn-term" onClick={ligar} tabIndex={off ? 0 : -1}>
          LIGAR DE NOVO
        </button>
      </div>
    </div>
  );
}

export function Footer() {
  return (
    <footer className="relative mt-[var(--section-gap)] overflow-hidden border-t border-phosphor-dim/60 bg-tube">
      <div className="wrap flex flex-wrap items-center justify-between gap-6 py-8">
        <p className="mono text-[0.8125rem] text-paper-dim">
          © 2026 {perfil.nome} · feito à mão, com café e fósforo verde.
        </p>
        <button type="button" className="btn-term" onClick={desligar}>
          <span aria-hidden="true" className="inline-block size-2 rounded-full bg-led" />
          DESLIGAR
        </button>
      </div>
      <p
        aria-hidden="true"
        className="mono glow pointer-events-none -mb-[0.2em] text-center leading-[0.8] tracking-[-0.06em] whitespace-nowrap select-none"
        style={{ fontSize: `calc((100vw - 2 * var(--gutter)) / ${Math.max(perfil.nomeCurto.length, 4) * 0.6})` }}
      >
        {perfil.nomeCurto}
      </p>
    </footer>
  );
}
