import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { perfil } from "@/content/perfil";
import { scrollToTarget } from "@/lib/scroll";
import { setState, useStore } from "@/lib/store";
import { playClick, startHum, stopHum } from "@/lib/sound";

const links = [
  { href: "#projetos", label: "PROJETOS" },
  { href: "#sobre", label: "SOBRE" },
  { href: "#stack", label: "STACK" },
  { href: "#contato", label: "CONTATO" },
];

function go(e: React.MouseEvent<HTMLAnchorElement>, href: string) {
  e.preventDefault();
  scrollToTarget(href);
  history.replaceState(null, "", href);
}

export function PhosphorKnob() {
  const phosphor = useStore((s) => s.phosphor);
  const sound = useStore((s) => s.sound);
  const next = phosphor === "green" ? "amber" : "green";
  return (
    <button
      type="button"
      className="group flex min-h-11 items-center gap-2.5 px-1 mono text-[0.8125rem] text-phosphor-dim"
      onClick={() => {
        setState({ phosphor: next });
        if (sound) playClick();
      }}
      aria-label={`Cor do fósforo: ${phosphor === "green" ? "P1 verde" : "P3 âmbar"}. Trocar para ${next === "green" ? "P1 verde" : "P3 âmbar"}.`}
    >
      <span
        aria-hidden="true"
        className="relative grid size-7 place-items-center rounded-full border border-case-shadow bg-[#1d1f1a] transition-transform duration-200 ease-[var(--ease-out)] group-active:scale-95"
        style={{ transform: `rotate(${phosphor === "green" ? -50 : 50}deg)` }}
      >
        <span className="absolute top-[3px] h-2 w-[2px] bg-phosphor" />
      </span>
      <span className="text-phosphor">{phosphor === "green" ? "P1 VERDE" : "P3 ÂMBAR"}</span>
    </button>
  );
}

export function SoundToggle() {
  const sound = useStore((s) => s.sound);
  const intro = useStore((s) => s.intro);
  return (
    <button
      type="button"
      className="flex min-h-11 items-center gap-2 px-1 mono text-[0.8125rem] text-phosphor-dim"
      aria-pressed={sound}
      aria-label={sound ? "Desligar o som" : "Ligar o som (zumbido do monitor e cliques)"}
      onClick={() => {
        const on = !sound;
        setState({ sound: on });
        if (on) {
          playClick();
          if (intro === "done") startHum();
        } else stopHum();
      }}
    >
      <span aria-hidden="true" className={sound ? "text-phosphor" : ""}>
        {sound ? "◉" : "○"}
      </span>
      <span className={sound ? "text-phosphor" : ""}>SOM {sound ? "ON" : "OFF"}</span>
    </button>
  );
}

export function Header() {
  return (
    <header className="sticky top-0 z-40 border-b border-phosphor-dim/60 bg-tube">
      <div className="wrap flex flex-wrap items-center justify-between gap-x-6">
        <a
          href="#topo"
          onClick={(e) => go(e, "#topo")}
          className="mono flex min-h-12 items-center text-[0.9375rem] text-phosphor"
          aria-label={`${perfil.nome}, voltar ao topo`}
        >
          {perfil.nomeCurto}.SYS
        </a>
        <nav aria-label="Seções" className="order-3 w-full md:order-none md:w-auto">
          <ul className="mono flex items-center justify-between gap-1 text-[0.8125rem] md:justify-start md:gap-0">
            {links.map((l, i) => (
              <li key={l.href} className="flex items-center">
                {i > 0 && (
                  <span aria-hidden="true" className="hidden px-2 text-phosphor-dim md:inline">
                    ·
                  </span>
                )}
                <a
                  href={l.href}
                  onClick={(e) => go(e, l.href)}
                  className="flex min-h-11 items-center px-1 text-paper-dim transition-colors duration-150 hover:text-phosphor focus-visible:text-phosphor"
                >
                  {l.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
        <div className="flex items-center gap-3 sm:gap-5">
          <Tooltip>
            <TooltipTrigger asChild>
              <span className="inline-flex">
                <PhosphorKnob />
              </span>
            </TooltipTrigger>
            <TooltipContent side="bottom" sideOffset={6}>
              Cor do fósforo · também: tema verde / tema ambar no Ctrl+K
            </TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <span className="inline-flex">
                <SoundToggle />
              </span>
            </TooltipTrigger>
            <TooltipContent side="bottom" sideOffset={6} align="end">
              Zumbido do CRT e cliques, gerados no navegador
            </TooltipContent>
          </Tooltip>
        </div>
      </div>
    </header>
  );
}
