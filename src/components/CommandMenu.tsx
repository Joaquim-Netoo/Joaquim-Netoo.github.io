import { Command as Cmdk } from "cmdk";
import { Dialog as D } from "radix-ui";
import { useState } from "react";
import { perfil } from "@/content/perfil";
import { scrollToTarget } from "@/lib/scroll";
import { setState } from "@/lib/store";
import { desligar } from "@/sections/Footer";

interface Comando {
  id: string;
  desc: string;
  run: (print: (lines: string[]) => void, close: () => void, clear: () => void) => void;
}

const goTo = (sel: string) => (_: unknown, close: () => void) => {
  close();
  window.setTimeout(() => scrollToTarget(sel), 30);
};

const COMANDOS: Comando[] = [
  {
    id: "help",
    desc: "lista os comandos",
    run: (print) => print(COMANDOS.map((c) => `${c.id.padEnd(12, " ")} ${c.desc}`)),
  },
  { id: "projetos", desc: "vai para os projetos", run: goTo("#projetos") },
  { id: "sobre", desc: "vai para sobre", run: goTo("#sobre") },
  { id: "contato", desc: "vai para o contato", run: goTo("#contato") },
  {
    id: "tema ambar",
    desc: "fósforo P3 âmbar",
    run: (print) => {
      setState({ phosphor: "amber" });
      print(["PHOSPHOR P3 OK"]);
    },
  },
  {
    id: "tema verde",
    desc: "fósforo P1 verde",
    run: (print) => {
      setState({ phosphor: "green" });
      print(["PHOSPHOR P1 OK"]);
    },
  },
  { id: "clear", desc: "limpa a tela", run: (_p, _c, clear) => clear() },
  {
    id: "desligar",
    desc: "desliga o monitor",
    run: (_p, close) => {
      close();
      window.setTimeout(desligar, 30);
    },
  },
];

/** Terminal de atalho (carregado sob demanda pelo CommandHost). Sem animação de abrir/fechar: é ação de teclado. */
export default function CommandMenu({ open, setOpen }: { open: boolean; setOpen: (o: boolean) => void }) {
  const [value, setValue] = useState("");
  const [log, setLog] = useState<string[]>(["Digite help e tecle Enter."]);
  const prompt = `C:\\${perfil.nomeCurto}>`;

  const run = (c: Comando) => {
    const print = (lines: string[]) => setLog((l) => [...l, `${prompt} ${c.id}`, ...lines].slice(-40));
    c.run(print, () => setOpen(false), () => setLog([]));
    setValue("");
  };

  return (
    <D.Root open={open} onOpenChange={setOpen}>
      <D.Portal>
        <D.Overlay className="fixed inset-0 z-[75] bg-[rgb(4_6_4/0.78)]" />
        <D.Content
          className="fixed top-[14vh] left-1/2 z-[76] w-[min(640px,calc(100%-2rem))] -translate-x-1/2 border border-phosphor bg-tube outline-none"
          aria-describedby={undefined}
          data-lenis-prevent
        >
          <D.Title className="mono absolute top-0 left-4 -translate-y-1/2 bg-tube px-2 text-[0.8125rem] text-phosphor-dim">
            TERMINAL · ESC PARA SAIR
          </D.Title>
          <Cmdk label="Terminal de comandos" loop className="mono text-[0.9375rem]">
            <div className="max-h-48 overflow-y-auto px-5 pt-6 pb-2 text-paper-dim" aria-live="polite">
              {log.map((l, i) => (
                <pre key={i} className="font-[inherit] whitespace-pre-wrap">
                  {l}
                </pre>
              ))}
            </div>
            <div className="flex items-center gap-2 border-y border-phosphor-dim/60 px-5">
              <span className="text-phosphor-dim">{prompt}</span>
              <Cmdk.Input
                value={value}
                onValueChange={setValue}
                autoFocus
                aria-label="Comando"
                placeholder="help"
                className="min-h-12 w-full bg-transparent text-phosphor caret-phosphor outline-none placeholder:text-phosphor-dim/60"
              />
            </div>
            <Cmdk.List className="max-h-[42vh] overflow-y-auto p-2">
              <Cmdk.Empty className="px-3 py-3 text-paper-dim">Comando não encontrado. Tente help.</Cmdk.Empty>
              {COMANDOS.map((c) => (
                <Cmdk.Item
                  key={c.id}
                  value={c.id}
                  onSelect={() => run(c)}
                  className="flex min-h-11 cursor-pointer items-center justify-between gap-4 px-3 text-paper data-[selected=true]:bg-phosphor data-[selected=true]:text-tube"
                >
                  <span>{c.id}</span>
                  <span className="text-[0.8125rem] opacity-70">{c.desc}</span>
                </Cmdk.Item>
              ))}
            </Cmdk.List>
          </Cmdk>
        </D.Content>
      </D.Portal>
    </D.Root>
  );
}
