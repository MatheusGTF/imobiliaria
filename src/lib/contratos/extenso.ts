const UNIDADES = [
  "",
  "um",
  "dois",
  "três",
  "quatro",
  "cinco",
  "seis",
  "sete",
  "oito",
  "nove",
  "dez",
  "onze",
  "doze",
  "treze",
  "catorze",
  "quinze",
  "dezesseis",
  "dezessete",
  "dezoito",
  "dezenove",
];

const DEZENAS = [
  "",
  "",
  "vinte",
  "trinta",
  "quarenta",
  "cinquenta",
  "sessenta",
  "setenta",
  "oitenta",
  "noventa",
];

// Suficiente para prazos de contrato (meses/dias), não cobre centenas.
export function numeroPorExtenso(n: number): string {
  if (n < 20) return UNIDADES[n];
  if (n < 100) {
    const dezena = Math.floor(n / 10);
    const resto = n % 10;
    return resto === 0 ? DEZENAS[dezena] : `${DEZENAS[dezena]} e ${UNIDADES[resto]}`;
  }
  return String(n);
}

export function diasEntre(inicio: Date, fim: Date): number {
  const ms = fim.getTime() - inicio.getTime();
  return Math.round(ms / (1000 * 60 * 60 * 24));
}

// Meses "de calendário" entre duas datas (ex: 25/03 a 25/10 = 7 meses),
// usado para descrever o prazo do contrato como "07 (sete) meses".
export function mesesEntre(inicio: Date, fim: Date): number {
  const anos = fim.getUTCFullYear() - inicio.getUTCFullYear();
  const meses = fim.getUTCMonth() - inicio.getUTCMonth();
  let total = anos * 12 + meses;
  if (fim.getUTCDate() < inicio.getUTCDate()) total -= 1;
  return Math.max(total, 0);
}
