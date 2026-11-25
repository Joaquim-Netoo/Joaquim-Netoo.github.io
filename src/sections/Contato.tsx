import { lazy, Suspense, useEffect, useRef, useState } from "react";
import { Kicker } from "@/components/Kicker";
import { SectionTitle } from "@/components/SectionTitle";
import { perfil } from "@/content/perfil";
import { asset } from "@/lib/data";
import { prefersReducedMotion } from "@/lib/motion";
import { useReveal } from "@/lib/useReveal";

const CopyEmailButton = lazy(() => import("@/components/CopyEmailButton"));

type Cmd = "email" | "github" | "linkedin" | "curriculo";

interface Resposta {
  cmd: Cmd;
  text: string;
  href: string;
  label: string;
  download?: boolean;
}

function responder(cmd: Cmd): Resposta {
  switch (cmd) {
    case "email":
      return { cmd, text: perfil.email, href: `mailto:${perfil.email}`, label: "ESCREVER E-MAIL" };
    case "github":
      return { cmd, text: perfil.githubUrl.replace(/^https?:\/\//, ""), href: perfil.githubUrl, label: "ABRIR GITHUB" };
    case "linkedin":
      return { cmd, text: perfil.linkedinUrl.replace(/^https?:\/\//, ""), href: perfil.linkedinUrl, label: "ABRIR LINKEDIN" };
    case "curriculo":
      return { cmd, text: perfil.curriculoPdf, href: asset(perfil.curriculoPdf), label: "BAIXAR PDF", download: true };
  }
}

/** Texto "impresso" caractere a caractere em no máximo ~250 ms. */
function useTyped(text: string) {
  const [n, setN] = useState(text.length);
  useEffect(() => {
    if (prefersReducedMotion()) {
      setN(text.length);
      return;
    }
    setN(0);
    const step = Math.max(1, Math.ceil(text.length / 16));
    const id = window.setInterval(() => {
      setN((v) => {
        if (v + step >= text.length) window.clearInterval(id);
        return Math.min(text.length, v + step);
      });
    }, 16);
    return () => window.clearInterval(id);
  }, [text]);
  return text.slice(0, n);
}

function Saida({ r }: { r: Resposta }) {
  const typed = useTyped(r.text);
  const done = typed.length === r.text.length;

  return (
    <div className="grid gap-4">
      <p className="mono text-[clamp(1.125rem,2.6vw,1.75rem)] leading-tight break-all text-phosphor">
        {typed}
        {!done && <span className="block-cursor" aria-hidden="true" />}
      </p>
      <div className={`flex flex-wrap gap-3 transition-opacity duration-150 ${done ? "opacity-100" : "opacity-0"}`}>
        <a
          className="btn-term"
          data-variant="solid"
          href={r.href}
          {...(r.download ? { download: "" } : { target: r.cmd === "email" ? undefined : "_blank", rel: "noreferrer" })}
        >
          {r.label}
        </a>
        {r.cmd === "email" && (
          <Suspense fallback={<span className="btn-term min-w-[11.5rem]">COPIAR E-MAIL</span>}>
            <CopyEmailButton email={perfil.email} />
          </Suspense>
        )}
      </div>
    </div>
  );
}

export function Contato() {
  const ref = useRef<HTMLElement>(null);
  const [atual, setAtual] = useState<Resposta>(() => responder("email"));
  useReveal(ref);

  const cmds: Cmd[] = ["email", "github", "linkedin", ...(perfil.curriculoPdf ? (["curriculo"] as const) : [])];

  return (
    <section id="contato" ref={ref} aria-labelledby="contato-title" className="wrap pt-[var(--section-gap)]">
      <Kicker cmd="contato" />
      <SectionTitle id="contato-title" keyword="VAMOS" rest="conversar?" />

      <div className="mt-[clamp(40px,6vw,88px)] grid gap-10 lg:grid-cols-12">
        <p data-reveal className="max-w-[34ch] text-[length:var(--text-lead)] leading-[1.4] text-paper lg:col-span-4">
          Tem um projeto, uma vaga ou uma ideia? Escolha um comando e eu respondo por lá.
        </p>

        <div data-reveal className="term lg:col-span-8">
          <span className="term-title">CONTATO.BAT</span>
          <div className="grid gap-8 p-5 pt-8 sm:p-8 sm:pt-10">
            <div>
              <p className="hw mb-3">COMANDOS DISPONÍVEIS:</p>
              <ul className="flex flex-wrap gap-2">
                {cmds.map((c) => (
                  <li key={c}>
                    <button
                      type="button"
                      aria-pressed={atual.cmd === c}
                      onClick={() => setAtual(responder(c))}
                      className="mono min-h-11 border border-phosphor-dim px-3 text-[0.9375rem] text-paper transition-[color,background-color,border-color,transform] duration-150 hover:border-phosphor hover:text-phosphor active:scale-[0.97] aria-pressed:border-phosphor aria-pressed:bg-phosphor aria-pressed:text-tube"
                    >
                      <span aria-hidden="true" className="opacity-60">
                        &gt;{" "}
                      </span>
                      {c}
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            <div className="min-h-[9.5rem] border-t border-phosphor-dim/50 pt-6" aria-live="polite">
              <p className="mono mb-3 text-[0.9375rem] text-phosphor-dim">
                C:\{perfil.nomeCurto}&gt; <span className="text-paper">{atual.cmd}</span>
              </p>
              <Saida key={atual.cmd} r={atual} />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
