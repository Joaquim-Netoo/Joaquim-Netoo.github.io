import { useEffect } from "react";
import { CommandHost } from "@/components/CommandHost";
import { ScrollTrigger } from "@/lib/motion";
import { Header } from "@/components/Header";
import { ProjetoDialog } from "@/components/ProjetoDialog";
import { TooltipProvider } from "@/components/ui/tooltip";
import { IntroGate } from "@/intro/IntroGate";
import { Arquivo } from "@/sections/Arquivo";
import { Atividade } from "@/sections/Atividade";
import { Contato } from "@/sections/Contato";
import { Destaques } from "@/sections/Destaques";
import { Ferramentas } from "@/sections/Ferramentas";
import { Footer, TelaDesligada } from "@/sections/Footer";
import { Hero } from "@/sections/Hero";
import { Sobre } from "@/sections/Sobre";
import { StackMarquee } from "@/sections/StackMarquee";

/** Recalcula os gatilhos do ScrollTrigger quando fontes carregam ou o conteúdo muda de altura. */
function useScrollTriggerRefresh() {
  useEffect(() => {
    let t = 0;
    const refresh = () => {
      window.clearTimeout(t);
      t = window.setTimeout(() => ScrollTrigger.refresh(), 150);
    };
    document.fonts?.ready.then(refresh);
    const main = document.getElementById("conteudo");
    const ro = new ResizeObserver(refresh);
    if (main) ro.observe(main);
    return () => {
      ro.disconnect();
      window.clearTimeout(t);
    };
  }, []);
}

export default function App() {
  useScrollTriggerRefresh();
  return (
    <TooltipProvider>
      <a
        href="#conteudo"
        className="mono fixed top-2 left-2 z-[90] -translate-y-[200%] bg-phosphor px-4 py-3 text-[0.875rem] text-tube focus:translate-y-0"
        onClick={() => {
          // pular para o conteúdo também encerra a intro
          window.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape" }));
          requestAnimationFrame(() => document.getElementById("conteudo")?.focus());
        }}
      >
        Pular para o conteúdo
      </a>

      <IntroGate />

      <div id="tela">
        <Header />
        <main id="conteudo" tabIndex={-1} className="outline-none">
          <Hero />
          <StackMarquee />
          <Destaques />
          <Arquivo />
          <Sobre />
          <Ferramentas />
          <Atividade />
          <Contato />
        </main>
        <Footer />
      </div>

      <TelaDesligada />
      <ProjetoDialog />
      <CommandHost />

      {/* camadas de CRT: linhas de varredura, vinheta nas bordas e ruído */}
      <div aria-hidden="true" className="crt-layer crt-scanlines" />
      <div aria-hidden="true" className="crt-layer crt-vignette" />
      <div aria-hidden="true" className="crt-layer crt-noise" />
    </TooltipProvider>
  );
}
