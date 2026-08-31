export const TIPOS_IMOVEL = [
  { value: "APARTAMENTO", label: "Apartamento", plural: "Apartamentos" },
  { value: "CASA", label: "Casa", plural: "Casas" },
  { value: "COMERCIAL", label: "Comercial", plural: "Imóveis comerciais" },
  { value: "TERRENO", label: "Terreno", plural: "Terrenos" },
  { value: "OUTRO", label: "Outro", plural: "Outros imóveis" },
] as const;

// Ordem em que os tipos aparecem na vitrine "consulte por tipo"
export const TIPOS_VITRINE = ["CASA", "APARTAMENTO", "TERRENO", "COMERCIAL", "OUTRO"] as const;

export const FINALIDADE_IMOVEL = [
  { value: "ALUGUEL", label: "Aluguel" },
  { value: "VENDA", label: "Venda" },
  { value: "AMBOS", label: "Aluguel e venda" },
] as const;

export const STATUS_IMOVEL = [
  { value: "DISPONIVEL", label: "Disponível", color: "green" },
  { value: "ALUGADO", label: "Alugado", color: "blue" },
  { value: "VENDIDO", label: "Vendido", color: "blue" },
  { value: "INATIVO", label: "Inativo", color: "gray" },
] as const;

export function aceitaAluguel(finalidade: string) {
  return finalidade === "ALUGUEL" || finalidade === "AMBOS";
}

export function aceitaVenda(finalidade: string) {
  return finalidade === "VENDA" || finalidade === "AMBOS";
}

export const STATUS_CONTRATO = [
  { value: "ATIVO", label: "Ativo", color: "green" },
  { value: "ENCERRADO", label: "Encerrado", color: "gray" },
  { value: "CANCELADO", label: "Cancelado", color: "red" },
] as const;

export const STATUS_PAGAMENTO = [
  { value: "PENDENTE", label: "Pendente", color: "yellow" },
  { value: "PAGO", label: "Pago", color: "green" },
  { value: "ATRASADO", label: "Atrasado", color: "red" },
  { value: "CANCELADO", label: "Cancelado", color: "gray" },
] as const;

export const TIPO_PESSOA = [
  { value: "FISICA", label: "Pessoa física" },
  { value: "JURIDICA", label: "Pessoa jurídica" },
] as const;

export const FORMAS_PAGAMENTO = [
  { value: "PIX", label: "PIX" },
  { value: "BOLETO", label: "Boleto" },
  { value: "DINHEIRO", label: "Dinheiro" },
  { value: "TRANSFERENCIA", label: "Transferência" },
  { value: "OUTRO", label: "Outro" },
] as const;

export function statusEfetivoPagamento(pagamento: { status: string; dataVencimento: Date | string }) {
  if (pagamento.status !== "PENDENTE") return pagamento.status;
  const vencimento = new Date(pagamento.dataVencimento);
  const hoje = new Date();
  hoje.setUTCHours(0, 0, 0, 0);
  return vencimento < hoje ? "ATRASADO" : "PENDENTE";
}

export function labelFor(
  list: readonly { value: string; label: string }[],
  value: string | null | undefined
) {
  return list.find((i) => i.value === value)?.label ?? value ?? "-";
}
