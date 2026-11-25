import { lazy, Suspense, useEffect, useState } from "react";
import { useStore } from "@/lib/store";

const CommandMenu = lazy(() => import("./CommandMenu"));

/** Ouve Ctrl+K e "/" e só então carrega o terminal (cmdk fica fora do bundle inicial). */
export function CommandHost() {
  const [open, setOpen] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const intro = useStore((s) => s.intro);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const typing = (e.target as HTMLElement)?.closest?.("input, textarea, [contenteditable='true']");
      if ((e.key === "k" || e.key === "K") && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        setLoaded(true);
        setOpen((o) => !o);
      } else if (e.key === "/" && !typing && !open && intro === "done") {
        e.preventDefault();
        setLoaded(true);
        setOpen(true);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, intro]);

  if (!loaded) return null;
  return (
    <Suspense fallback={null}>
      <CommandMenu open={open} setOpen={setOpen} />
    </Suspense>
  );
}
