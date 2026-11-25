import { perfil } from "@/content/perfil";

/**
 * Prompt de terminal usado como kicker de seção: C:\JOAQUIM\PROJETOS> dir /destaques
 * `path` são as pastas depois do nome curto; `cmd` é o comando.
 */
export function Kicker({ path = [], cmd, cursor = true }: { path?: string[]; cmd: string; cursor?: boolean }) {
  const prompt = ["C:", perfil.nomeCurto, ...path].join("\\");
  return (
    <p className="mono text-[0.9375rem] leading-none text-phosphor-dim" data-reveal>
      <span>{prompt}&gt;</span> <span className="text-phosphor">{cmd}</span>
      {cursor && <span className="block-cursor" aria-hidden="true" />}
    </p>
  );
}
