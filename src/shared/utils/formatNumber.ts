/**
 * Formatação de números e texto dos tooltips e legendas dos dashboards. Fica sem dependências para poder ser usada
 * por qualquer formatador de gráfico sem criar ciclos de import.
 */

/** 0,81 — duas casas, vírgula decimal. */
export function formatDecimal(value: number | null | undefined): string {
  if (value === null || value === undefined) return 'sem dado';
  return value.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

/** +0,04 ou −0,03, com o sinal de menos tipográfico. */
export function formatVariation(diff: number): string {
  const rounded = Math.round(diff * 100) / 100;
  if (rounded === 0) return formatDecimal(0);
  return `${rounded > 0 ? '+' : '−'}${formatDecimal(Math.abs(rounded))}`;
}

export function escapeHtml(text: string): string {
  return text.replace(/[&<>"']/g, (char) => `&#${char.charCodeAt(0)};`);
}
