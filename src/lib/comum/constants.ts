// A ordem aqui é a ordem das opções no cadastro do imóvel.
export const TIPOS_IMOVEL = [
  { value: "CASA", label: "Casa", plural: "Casas" },
  { value: "SOBRADO", label: "Sobrado", plural: "Sobrados" },
  { value: "APARTAMENTO", label: "Apartamento", plural: "Apartamentos" },
  { value: "KITNET", label: "Kitnet", plural: "Kitnets" },
  { value: "TERRENO", label: "Terreno", plural: "Terrenos" },
  { value: "CHACARA", label: "Chácara/Sítio", plural: "Chácaras e sítios" },
  { value: "GALPAO", label: "Galpão/Barracão", plural: "Galpões e barracões" },
  { value: "SALA_COMERCIAL", label: "Sala comercial", plural: "Salas comerciais" },
  { value: "PREDIO", label: "Prédio/Imóvel inteiro", plural: "Prédios e imóveis inteiros" },
  { value: "COMERCIAL", label: "Comercial", plural: "Imóveis comerciais" },
  { value: "OUTRO", label: "Outro", plural: "Outros imóveis" },
] as const;

// Ordem em que os tipos aparecem na vitrine "consulte por tipo"
export const TIPOS_VITRINE = [
  "CASA",
  "APARTAMENTO",
  "TERRENO",
  "SOBRADO",
  "KITNET",
  "CHACARA",
  "GALPAO",
  "SALA_COMERCIAL",
  "PREDIO",
  "COMERCIAL",
  "OUTRO",
] as const;

// Esses sempre aparecem na vitrine da home (mesmo sem imóvel disponível);
// os demais só aparecem quando há pelo menos um disponível.
export const TIPOS_VITRINE_FIXOS = ["CASA", "APARTAMENTO", "TERRENO"] as const;

// Tipos cujo uso é comercial/não residencial (para o texto do contrato).
const TIPOS_NAO_RESIDENCIAIS: readonly string[] = ["COMERCIAL", "GALPAO", "SALA_COMERCIAL"];

export function ehNaoResidencial(tipo: string) {
  return TIPOS_NAO_RESIDENCIAIS.includes(tipo);
}

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
