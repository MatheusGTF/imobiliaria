/**
 * Divisão do que o inquilino paga: aluguel → administração da imobiliária →
 * repasse ao proprietário.
 *
 * A administração incide só sobre o ALUGUEL (não sobre condomínio/IPTU, que
 * são repassados). O que sobra do valor cobrado vai para o proprietário.
 */

const arredondar = (n: number) => Math.round(n * 100) / 100;

export function taxaEfetiva(
  contrato: { taxaAdministracaoPercentual: number | null },
  empresa: { taxaAdministracaoPercentual: number },
) {
  return contrato.taxaAdministracaoPercentual ?? empresa.taxaAdministracaoPercentual;
}

export function dividirPagamento(
  valorCobrado: number,
  contrato: { valorAluguel: number; taxaAdministracaoPercentual: number | null },
  empresa: { taxaAdministracaoPercentual: number },
) {
  const taxa = taxaEfetiva(contrato, empresa);
  const base = Math.min(contrato.valorAluguel, valorCobrado);
  const administracao = arredondar((base * taxa) / 100);
  return {
    taxa,
    valorCobrado,
    administracao,
    repasse: arredondar(valorCobrado - administracao),
  };
}
