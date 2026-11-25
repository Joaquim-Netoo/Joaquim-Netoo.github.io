import { useSyncExternalStore } from "react";

export type Phosphor = "green" | "amber";
export type IntroState = "running" | "done";

interface State {
  phosphor: Phosphor;
  sound: boolean;
  intro: IntroState;
  /** true enquanto o footer "desligou" a tela */
  off: boolean;
  /** repo aberto no Dialog de projeto */
  projeto: string | null;
  /** repo sob o ponteiro/foco nos destaques (sincroniza cards e disquetes) */
  hoverProjeto: string | null;
}

function safeGet(key: string): string | null {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}
function safeSet(key: string, value: string) {
  try {
    localStorage.setItem(key, value);
  } catch {
    /* armazenamento indisponível: segue sem persistir */
  }
}

let state: State = {
  phosphor: safeGet("lt:phosphor") === "amber" ? "amber" : "green",
  sound: false,
  intro: "running",
  off: false,
  projeto: null,
  hoverProjeto: null,
};

const listeners = new Set<() => void>();

export function setState(patch: Partial<State>) {
  state = { ...state, ...patch };
  if (patch.phosphor) {
    document.documentElement.dataset.phosphor = patch.phosphor;
    safeSet("lt:phosphor", patch.phosphor);
  }
  listeners.forEach((l) => l());
}

export function getState(): State {
  return state;
}

export function subscribe(l: () => void) {
  listeners.add(l);
  return () => listeners.delete(l);
}

export function useStore<T>(selector: (s: State) => T): T {
  return useSyncExternalStore(subscribe, () => selector(state), () => selector(state));
}

if (typeof document !== "undefined") document.documentElement.dataset.phosphor = state.phosphor;
