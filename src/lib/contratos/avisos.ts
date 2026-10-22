// Avisos de término/renovação de contrato. As datas do banco são sempre
// meia-noite UTC (ver formatDate), então a comparação é feita por dia civil.

/** Com quantos dias de antecedência o contrato passa a aparecer em "Avisos". */
export const DIAS_AVISO_TERMINO = 60;

const DIA_MS = 24 * 60 * 60 * 1000;

function inicioDoDiaUTC(d: Date) {
  return Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate());
}

/** Dias até o término (negativo = já venceu, 0 = vence hoje). */
export function diasParaTermino(dataFim: Date, hoje = new Date()) {
  return Math.round((inicioDoDiaUTC(dataFim) - inicioDoDiaUTC(hoje)) / DIA_MS);
}

/** Último `dataFim` que ainda entra nos avisos (hoje + DIAS_AVISO_TERMINO). */
export function limiteAvisoTermino(hoje = new Date()) {
  return new Date(inicioDoDiaUTC(hoje) + DIAS_AVISO_TERMINO * DIA_MS);
}

export function avisoTermino(dataFim: Date, hoje = new Date()) {
  const dias = diasParaTermino(dataFim, hoje);

  if (dias < 0) {
    const n = -dias;
    return { dias, texto: `Venceu há ${n} dia${n === 1 ? "" : "s"}`, cor: "red" as const };
  }
  if (dias === 0) return { dias, texto: "Vence hoje", cor: "red" as const };
  if (dias <= DIAS_AVISO_TERMINO) {
    return {
      dias,
      texto: `Vence em ${dias} dia${dias === 1 ? "" : "s"}`,
      cor: dias <= 30 ? ("red" as const) : ("yellow" as const),
    };
  }
  return null;
}
