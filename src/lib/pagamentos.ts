// Toda a matemática de datas aqui é feita em UTC (getUTC*/Date.UTC) de propósito:
// os inputs <input type="date"> chegam como "YYYY-MM-DD" (meia-noite UTC) e o
// vencimento de aluguel é uma data "de calendário", não um instante — usar
// métodos locais misturaria o fuso horário do servidor com o cálculo.

export function gerarMesesReferencia(dataInicio: Date, dataFim: Date): Date[] {
  const meses: Date[] = [];
  let ano = dataInicio.getUTCFullYear();
  let mes = dataInicio.getUTCMonth();
  const anoFim = dataFim.getUTCFullYear();
  const mesFim = dataFim.getUTCMonth();

  while (ano < anoFim || (ano === anoFim && mes <= mesFim)) {
    meses.push(new Date(Date.UTC(ano, mes, 1)));
    mes += 1;
    if (mes > 11) {
      mes = 0;
      ano += 1;
    }
  }

  return meses;
}

export function calcularDataVencimento(mesReferencia: Date, diaVencimento: number): Date {
  const ano = mesReferencia.getUTCFullYear();
  const mes = mesReferencia.getUTCMonth();
  const ultimoDiaDoMes = new Date(Date.UTC(ano, mes + 1, 0)).getUTCDate();
  const dia = Math.min(diaVencimento, ultimoDiaDoMes);
  return new Date(Date.UTC(ano, mes, dia));
}
