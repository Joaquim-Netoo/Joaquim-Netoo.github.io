const DAY = 86_400_000;

export function daysBetween(from: string | Date, now: Date = new Date()): number {
  return Math.floor((now.getTime() - new Date(from).getTime()) / DAY);
}

/** "hoje", "ontem", "há 3 dias", "há 2 semanas", "há 5 meses", "há 1 ano" */
export function relativeTime(date: string | Date, now: Date = new Date()): string {
  const d = Math.max(0, daysBetween(date, now));
  if (d < 1) return "hoje";
  if (d < 2) return "ontem";
  if (d < 7) return `há ${d} dias`;
  if (d < 30) {
    const w = Math.floor(d / 7);
    return w === 1 ? "há 1 semana" : `há ${w} semanas`;
  }
  if (d < 365) {
    const m = Math.max(1, Math.floor(d / 30));
    return m === 1 ? "há 1 mês" : `há ${m} meses`;
  }
  const y = Math.floor(d / 365);
  return y === 1 ? "há 1 ano" : `há ${y} anos`;
}

/** 2026-11-03 */
export function isoDay(date: string | Date): string {
  return new Date(date).toISOString().slice(0, 10);
}

const MESES = ["jan", "fev", "mar", "abr", "mai", "jun", "jul", "ago", "set", "out", "nov", "dez"];

/** "nov 2026", ou só "2026" quando o mês não foi informado */
export function mesAno(date: string | Date, soAno = false): string {
  const d = new Date(date);
  return soAno ? String(d.getUTCFullYear()) : `${MESES[d.getUTCMonth()]} ${d.getUTCFullYear()}`;
}

/** "03 nov 2026" */
export function shortDate(date: string | Date): string {
  const d = new Date(date);
  return `${String(d.getUTCDate()).padStart(2, "0")} ${MESES[d.getUTCMonth()]} ${d.getUTCFullYear()}`;
}
