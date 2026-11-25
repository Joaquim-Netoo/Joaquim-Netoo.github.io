import { AnimatePresence, domAnimation, LazyMotion, m, MotionConfig } from "motion/react";
import { useState } from "react";

/**
 * Botão "COPIAR E-MAIL" → "COPIADO ✓".
 * motion (versão gratuita) só nesta micro-interação: troca de rótulo com blur curto, que se lê
 * como uma transformação só e não como duas palavras se cruzando. Carregado sob demanda.
 */
export default function CopyEmailButton({ email }: { email: string }) {
  const [copied, setCopied] = useState(false);

  async function copiar() {
    try {
      await navigator.clipboard.writeText(email);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      /* sem permissão de área de transferência: o link mailto continua ali */
    }
  }

  const label = copied ? "COPIADO ✓" : "COPIAR E-MAIL";

  // reduced-motion: troca direta do texto, sem motion
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches)
    return (
      <button type="button" className="btn-term min-w-[11.5rem]" onClick={copiar} aria-live="polite">
        {label}
      </button>
    );

  return (
    <button type="button" className="btn-term min-w-[11.5rem] overflow-hidden" onClick={copiar} aria-live="polite">
      <LazyMotion features={domAnimation} strict>
        <MotionConfig reducedMotion="never">
          <AnimatePresence mode="popLayout" initial={false}>
            <m.span
              key={copied ? "ok" : "copiar"}
              initial={{ opacity: 0, filter: "blur(2px)", transform: "translateY(8px)" }}
              animate={{ opacity: 1, filter: "blur(0px)", transform: "translateY(0px)" }}
              exit={{ opacity: 0, filter: "blur(2px)", transform: "translateY(-8px)" }}
              transition={{ duration: 0.18, ease: [0.23, 1, 0.32, 1] }}
            >
              {label}
            </m.span>
          </AnimatePresence>
        </MotionConfig>
      </LazyMotion>
    </button>
  );
}
