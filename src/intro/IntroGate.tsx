import { lazy, Suspense, useCallback, useEffect, useRef, useState } from "react";
import { asset, destaques, stats } from "@/lib/data";
import { gsap, isTouch, prefersReducedMotion } from "@/lib/motion";
import { scrollToTarget, startSmoothScroll } from "@/lib/scroll";
import { getState, setState } from "@/lib/store";
import { startHum } from "@/lib/sound";
import type { IntroMode, Quality } from "./CrtScene";

const CrtScene = lazy(() => import("./CrtScene"));

type GateMode = IntroMode | "static" | "none";
const SEEN_KEY = "lt:intro-vista";

function hasWebGL(): boolean {
  try {
    const c = document.createElement("canvas");
    return Boolean(c.getContext("webgl2") ?? c.getContext("webgl"));
  } catch {
    return false;
  }
}

function seen(): boolean {
  try {
    return sessionStorage.getItem(SEEN_KEY) === "1";
  } catch {
    return false;
  }
}
function markSeen() {
  try {
    sessionStorage.setItem(SEEN_KEY, "1");
  } catch {
    /* sem sessionStorage: a próxima visita mostra a intro completa */
  }
}

function decideMode(): GateMode {
  const params = new URLSearchParams(location.search);
  if (params.has("still")) return "still";
  // âncora (/#projetos): vai direto à seção (as seções ainda não existem neste ponto do render)
  if (location.hash.length > 1) return "none";
  if (params.has("sem-intro")) return "none";
  if (prefersReducedMotion() || !hasWebGL()) return "static";
  return seen() ? "short" : "full";
}

/**
 * Carregamento real que o POST acompanha: fontes, chunk dos disquetes (desktop) e capas dos destaques.
 */
function createPreloader() {
  const tasks: Promise<unknown>[] = [
    document.fonts?.ready ?? Promise.resolve(),
    document.fonts?.load('36px "Departure Mono"') ?? Promise.resolve(),
  ];
  if (window.matchMedia("(min-width: 1024px)").matches && !isTouch())
    tasks.push(import("@/sections/disquetes/FloppyShelf").catch(() => undefined));
  for (const r of destaques.slice(0, 4))
    if (r.og)
      tasks.push(
        new Promise<void>((res) => {
          const img = new Image();
          img.onload = img.onerror = () => res();
          img.src = asset(r.og as string);
        }),
      );
  let done = 0;
  const all = Promise.all(tasks.map((t) => t.finally(() => done++))).then(() => undefined);
  return { progress: () => (tasks.length ? done / tasks.length : 1), wait: () => all };
}

export function IntroGate() {
  const [mode] = useState<GateMode>(decideMode);
  const [mounted, setMounted] = useState(mode !== "none");
  const [hint, setHint] = useState(true);
  const [ready, setReady] = useState(false);
  // O chunk 3D só começa a carregar depois do primeiro paint (o portfólio não espera o 3D)
  const [load3d, setLoad3d] = useState(mode === "still");
  useEffect(() => {
    if (load3d || mode === "none" || mode === "static") return;
    const w = window as Window & { requestIdleCallback?: (cb: () => void, o?: { timeout: number }) => number };
    let id = 0;
    const raf = requestAnimationFrame(() => {
      id = w.requestIdleCallback ? w.requestIdleCallback(() => setLoad3d(true), { timeout: 600 }) : window.setTimeout(() => setLoad3d(true), 120);
    });
    return () => {
      cancelAnimationFrame(raf);
      window.clearTimeout(id);
      (window as Window & { cancelIdleCallback?: (n: number) => void }).cancelIdleCallback?.(id);
    };
  }, [load3d, mode]);
  const layer = useRef<HTMLDivElement>(null);
  const api = useRef<{ power: () => void } | null>(null);
  const pendingPower = useRef(false);
  const finished = useRef(false);
  const preload = useRef<ReturnType<typeof createPreloader> | null>(null);
  if (!preload.current && mode !== "none" && typeof window !== "undefined") preload.current = createPreloader();

  /** Estado final: portfólio visível, intro desmontada, scroll liberado. */
  const finish = useCallback(
    (fade = 0.4) => {
      if (finished.current) return;
      finished.current = true;
      markSeen();
      document.documentElement.dataset.intro = "off";
      const tela = document.getElementById("tela");
      if (tela) tela.inert = false;
      setState({ intro: "done" });
      if (getState().sound) startHum();
      startSmoothScroll();
      const el = layer.current;
      if (!el || fade === 0) {
        setMounted(false);
        return;
      }
      gsap.to(el, { autoAlpha: 0, duration: fade, ease: "out", onComplete: () => setMounted(false) });
    },
    [],
  );

  // Visita com âncora: pula a intro e vai direto à seção.
  useEffect(() => {
    document.getElementById("intro-cover")?.remove();
    if (mode === "still") return;
    if (mode === "none") {
      finish(0);
      const hash = location.hash;
      if (hash) requestAnimationFrame(() => scrollToTarget(hash, true));
      return;
    }
    const tela = document.getElementById("tela");
    if (tela) tela.inert = true;
    document.documentElement.dataset.intro = "on";
    window.scrollTo(0, 0);
  }, [mode, finish]);

  // Reduced-motion / sem WebGL: imagem estática do monitor ligado e fade de 400 ms.
  useEffect(() => {
    if (mode !== "static") return;
    const id = window.setTimeout(() => finish(0.4), 1100);
    return () => window.clearTimeout(id);
  }, [mode, finish]);

  // Teclado: Esc pula; Enter liga (ou pula depois de ligado). Roda do mouse/toque também pula.
  useEffect(() => {
    if (!mounted || mode === "none" || mode === "still") return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        finish(0.25);
      } else if (e.key === "Enter" && (e.target as HTMLElement)?.tagName !== "A") {
        e.preventDefault();
        if (mode === "full" && hint) {
          if (api.current) api.current.power();
          else pendingPower.current = true;
        } else finish(0.25);
      }
    };
    const onWheel = () => finish(0.25);
    window.addEventListener("keydown", onKey);
    window.addEventListener("wheel", onWheel, { passive: true });
    window.addEventListener("touchmove", onWheel, { passive: true });
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("wheel", onWheel);
      window.removeEventListener("touchmove", onWheel);
    };
  }, [mounted, mode, hint, finish]);

  if (!mounted) return null;

  const initialQuality: Quality = isTouch() || window.innerWidth < 768 ? "medium" : "high";

  return (
    <>
      <div
        ref={layer}
        className="fixed inset-0 z-50 bg-[#050605]"
        aria-hidden="true"
        data-intro-layer
        style={{ visibility: "visible" }}
      >
        {mode === "static" ? (
          <picture>
            <img
              src={asset("images/crt-static.webp")}
              alt=""
              width={1600}
              height={1000}
              className="h-full w-full object-cover"
              onError={(e) => ((e.currentTarget as HTMLImageElement).style.display = "none")}
            />
          </picture>
        ) : (
          <div className={`h-full w-full transition-opacity duration-500 ${ready ? "opacity-100" : "opacity-0"}`}>
            <Suspense fallback={null}>
              {load3d && <CrtScene
                mode={mode as IntroMode}
                initialQuality={initialQuality}
                repoCount={stats.repoCount}
                getProgress={() => preload.current?.progress() ?? 1}
                waitAssets={() => preload.current?.wait() ?? Promise.resolve()}
                onReady={(a) => {
                  api.current = a;
                  setReady(true);
                  if (pendingPower.current) a.power();
                }}
                onPowered={() => setHint(false)}
                onCross={() => finish(0.4)}
              />}
            </Suspense>
          </div>
        )}

        {mode === "full" && (
          <p
            className={`mono pointer-events-none absolute inset-x-0 bottom-[max(28px,4vh)] px-4 text-center text-[0.8125rem] text-phosphor-dim transition-opacity duration-300 ${hint ? "opacity-100" : "opacity-0"}`}
          >
            {isTouch() ? "TOQUE NO MONITOR PARA LIGAR" : "CLIQUE NO BOTÃO PARA LIGAR (OU PRESSIONE ENTER)"}
          </p>
        )}
      </div>

      {mode !== "still" && (
        <button
          type="button"
          onClick={() => finish(0.25)}
          className="mono fixed top-[max(12px,2vh)] right-[max(12px,2vw)] z-[55] flex min-h-11 items-center px-3 text-[0.8125rem] text-phosphor-dim transition-[color,transform] duration-150 hover:text-phosphor active:scale-[0.97]"
        >
          PULAR [ESC]
        </button>
      )}
    </>
  );
}
