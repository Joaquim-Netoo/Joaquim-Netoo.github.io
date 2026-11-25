import { useRef } from "react";
import { Kicker } from "@/components/Kicker";
import { SectionTitle } from "@/components/SectionTitle";
import { perfil } from "@/content/perfil";
import { asset, sitesNoAr, stats } from "@/lib/data";
import { gsap, prefersReducedMotion, useGSAP } from "@/lib/motion";
import { useReveal } from "@/lib/useReveal";

/** Sem foto: "SEM SINAL" com barras de teste em tons de fósforo. */
function SemSinal() {
  const bars = [1, 0.78, 0.6, 0.45, 0.32, 0.2, 0.1];
  return (
    <div className="relative aspect-[4/5] w-full overflow-hidden bg-tube-2" role="img" aria-label="Foto ainda não enviada">
      <div className="absolute inset-x-0 top-0 flex h-[62%]">
        {bars.map((o, i) => (
          <span key={i} className="h-full flex-1 bg-phosphor" style={{ opacity: o }} />
        ))}
      </div>
      <div className="absolute inset-x-0 top-[62%] h-[8%] bg-[linear-gradient(90deg,var(--tube)_0_14%,var(--phosphor-dim)_14%_28%,var(--tube)_28%_42%,var(--paper)_42%_56%,var(--tube)_56%_100%)] opacity-70" />
      <div className="absolute inset-x-6 bottom-6 grid gap-1">
        <span className="mono glow text-[clamp(1.5rem,3vw,2.25rem)] leading-none">SEM SINAL</span>
        <span className="hw">CH 01 · FOTO EM BREVE</span>
      </div>
      <span className="crt-scanlines absolute inset-0 opacity-30" />
    </div>
  );
}

function Foto() {
  if (!perfil.foto) return <SemSinal />;
  return (
    <div className="relative aspect-[4/5] w-full overflow-hidden bg-phosphor">
      <img
        src={asset(perfil.foto)}
        alt={`Foto de ${perfil.nome}`}
        width={800}
        height={1000}
        loading="lazy"
        decoding="async"
        className="h-full w-full object-cover mix-blend-multiply [filter:grayscale(1)_contrast(1.15)_brightness(1.05)]"
      />
      <span className="absolute inset-0 bg-tube mix-blend-screen opacity-25" />
      <span className="crt-scanlines absolute inset-0 opacity-40" />
    </div>
  );
}

function Counter({ value, from, label }: { value: number | null; from: number; label: string }) {
  return (
    <div data-reveal className="grid gap-1">
      <dt className="hw order-2">{label}</dt>
      <dd className="mono glow order-1 text-[clamp(2.5rem,5vw,4.5rem)] leading-none tabular-nums">
        <span className="sr-only">{value ?? "—"}</span>
        <span aria-hidden="true" data-count={value ?? ""} data-from={from}>
          {value ?? "—"}
        </span>
      </dd>
    </div>
  );
}

export function Sobre() {
  const ref = useRef<HTMLElement>(null);
  useReveal(ref);

  // Contadores sobem até o valor real do GitHub, uma vez só.
  useGSAP(
    () => {
      if (prefersReducedMotion()) return;
      gsap.utils.toArray<HTMLElement>("[data-count]", ref.current).forEach((el) => {
        const to = Number(el.dataset.count);
        if (!Number.isFinite(to) || el.dataset.count === "") return;
        const obj = { v: Number(el.dataset.from) };
        el.textContent = String(obj.v);
        gsap.to(obj, {
          v: to,
          duration: 1.1,
          ease: "out",
          snap: { v: 1 },
          onUpdate: () => {
            el.textContent = String(obj.v);
          },
          scrollTrigger: { trigger: el, start: "top bottom-=24", once: true },
        });
      });
    },
    { scope: ref },
  );

  return (
    <section id="sobre" ref={ref} aria-labelledby="sobre-title" className="wrap pt-[var(--section-gap)]">
      <Kicker cmd="type sobre.txt" />
      <SectionTitle id="sobre-title" keyword="QUEM ESTÁ" rest="do outro lado da tela." />

      <div className="mt-[clamp(40px,6vw,88px)] grid gap-10 md:grid-cols-12 md:gap-12">
        <div data-reveal className="md:col-span-5 lg:col-span-4">
          <div className="term p-2">
            <span className="term-title">FOTO.BMP</span>
            <Foto />
          </div>
        </div>
        <div className="md:col-span-7 lg:col-start-6">
          <div className="grid max-w-[62ch] gap-5 text-[length:var(--text-lead)] leading-[1.45] text-paper">
            {perfil.bio.map((p, i) => (
              <p data-reveal key={i} className={i > 0 ? "text-[length:var(--text-body)] leading-[1.6]" : ""}>
                {p}
              </p>
            ))}
          </div>

          {/* formação, no formato de uma linha de "registro" do terminal */}
          <p data-reveal className="mono mt-8 flex flex-wrap items-baseline gap-x-3 gap-y-1 text-[0.9375rem]">
            <span className="text-phosphor-dim">FORMAÇÃO:</span>
            <span className="text-paper">
              {perfil.formacao.curso}
              {perfil.formacao.instituicao && ` · ${perfil.formacao.instituicao}`}
            </span>
            <span className="text-phosphor">
              [{perfil.formacao.status.toUpperCase()} · {perfil.formacao.periodo.toUpperCase()}]
            </span>
          </p>

          <dl className="mt-12 grid grid-cols-3 gap-6 border-t border-phosphor-dim/60 pt-8 max-sm:grid-cols-1">
            <Counter value={stats.repoCount} from={0} label="REPOSITÓRIOS" />
            <Counter value={stats.languageCount} from={0} label="LINGUAGENS" />
            <Counter value={sitesNoAr} from={0} label="SITES NO AR" />
          </dl>
        </div>
      </div>
    </section>
  );
}
